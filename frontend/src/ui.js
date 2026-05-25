// ui.js
// Displays the drag-and-drop UI
// --------------------------------------------------

import { useState, useRef, useCallback, useMemo, useEffect } from 'react';
import ReactFlow, { Background, MiniMap, MarkerType } from 'reactflow';
import { useStore } from './store';
import { shallow } from 'zustand/shallow';
import { InputNode } from './nodes/inputNode';
import { LLMNode } from './nodes/llmNode';
import { OutputNode } from './nodes/outputNode';
import { TextNode } from './nodes/textNode';
import { APINode } from './nodes/apiNode';
import { ConditionNode } from './nodes/conditionNode';
import { DelayNode } from './nodes/delayNode';
import { MathNode } from './nodes/mathNode';
import { MergeNode } from './nodes/mergeNode';
import { PipelineControls } from './PipelineControls';
import {
  buildSplitEdges,
  canNodeTypeAutoInsert,
  findNearestEdge,
  resolveHandlesForInsert,
} from './edgeInsert';
import './styles/toolbar.css';
import './styles/pipeline.css';
import 'reactflow/dist/style.css';

const gridSize = 20;
const backgroundGap = 32;
const proOptions = { hideAttribution: true };
const defaultEdgeOptions = {
  type: 'smoothstep',
  animated: true,
  markerEnd: {
    type: MarkerType.Arrow,
    height: '20px',
    width: '20px',
  },
};
const nodeTypes = {
  customInput: InputNode,
  llm: LLMNode,
  customOutput: OutputNode,
  text: TextNode,
  api: APINode,
  condition: ConditionNode,
  delay: DelayNode,
  math: MathNode,
  merge: MergeNode,
};

const selector = (state) => ({
  nodes: state.nodes,
  edges: state.edges,
  getNodeID: state.getNodeID,
  addNode: state.addNode,
  insertNodeOnEdge: state.insertNodeOnEdge,
  onNodesChange: state.onNodesChange,
  onEdgesChange: state.onEdgesChange,
  onConnect: state.onConnect,
});

const DRAG_NODE_TYPE_PREFIX = 'application/reactflow-node:';
const NODE_TYPE_BY_DRAG_TOKEN = {
  custominput: 'customInput',
  customoutput: 'customOutput',
  llm: 'llm',
  text: 'text',
  api: 'api',
  condition: 'condition',
  delay: 'delay',
  math: 'math',
  merge: 'merge',
};

const getDraggedNodeType = (event) => {
  const raw = event?.dataTransfer?.getData('application/reactflow');
  if (raw) {
    try {
      return JSON.parse(raw)?.nodeType ?? null;
    } catch {
      return null;
    }
  }

  const nodeTypeToken = Array.from(event?.dataTransfer?.types ?? [])
    .find((type) => type.startsWith(DRAG_NODE_TYPE_PREFIX))
    ?.slice(DRAG_NODE_TYPE_PREFIX.length);

  return NODE_TYPE_BY_DRAG_TOKEN[nodeTypeToken] ?? null;
};

export const PipelineUI = ({
  snapToGrid = true,
  onSnapToggle,
  isInteractive = true,
  onInteractiveChange,
  controlsCollapsed = false,
  onToggleControlsCollapse,
  lockWiggle = false,
  onLockedDragAttempt,
}) => {
  const reactFlowWrapper = useRef(null);
  const modifierPressedRef = useRef(false);
  const [reactFlowInstance, setReactFlowInstance] = useState(null);
  const [insertCandidateEdgeId, setInsertCandidateEdgeId] = useState(null);

  useEffect(() => {
    const isInsertModifierKey = (key) => key === 'Control' || key === 'Meta';

    const onKeyDown = (event) => {
      if (isInsertModifierKey(event.key)) {
        modifierPressedRef.current = true;
      }
    };

    const onKeyUp = (event) => {
      if (isInsertModifierKey(event.key)) {
        modifierPressedRef.current = false;
        setInsertCandidateEdgeId(null);
      }
    };

    const clearModifier = () => {
      modifierPressedRef.current = false;
      setInsertCandidateEdgeId(null);
    };

    const onVisibilityChange = () => {
      if (document.visibilityState === 'hidden') {
        clearModifier();
      }
    };

    window.addEventListener('keydown', onKeyDown);
    window.addEventListener('keyup', onKeyUp);
    window.addEventListener('blur', clearModifier);
    document.addEventListener('visibilitychange', onVisibilityChange);

    return () => {
      window.removeEventListener('keydown', onKeyDown);
      window.removeEventListener('keyup', onKeyUp);
      window.removeEventListener('blur', clearModifier);
      document.removeEventListener('visibilitychange', onVisibilityChange);
    };
  }, []);
  const {
    nodes,
    edges,
    getNodeID,
    addNode,
    insertNodeOnEdge,
    onNodesChange,
    onEdgesChange,
    onConnect,
  } = useStore(selector, shallow);

  const edgesForRender = useMemo(
    () =>
      edges.map((edge) =>
        edge.id === insertCandidateEdgeId
          ? { ...edge, className: 'edge-insert-candidate' }
          : edge
      ),
    [edges, insertCandidateEdgeId]
  );

  const getInitNodeData = (nodeID, type) => {
    const nodeData = { id: nodeID, nodeType: `${type}` };
    return nodeData;
  };

  const clearInsertHighlight = useCallback(() => {
    setInsertCandidateEdgeId(null);
  }, []);

  const onDrop = useCallback(
    (event) => {
      event.preventDefault();
      clearInsertHighlight();

      if (!isInteractive) {
        onLockedDragAttempt?.();
        return;
      }

      const reactFlowBounds = reactFlowWrapper.current.getBoundingClientRect();
      const type = getDraggedNodeType(event);
      if (typeof type === 'undefined' || !type) return;

      const position = reactFlowInstance.project({
        x: event.clientX - reactFlowBounds.left,
        y: event.clientY - reactFlowBounds.top,
      });

      const nodeID = getNodeID(type);
      const newNode = {
        id: nodeID,
        type,
        position,
        data: getInitNodeData(nodeID, type),
      };

      const modifierHeld = modifierPressedRef.current;
      if (modifierHeld) {
        if (!canNodeTypeAutoInsert(type)) {
          if (process.env.NODE_ENV !== 'production') {
            console.log('Node type does not support edge insertion:', type);
          }
        } else {
          const nearestEdge = findNearestEdge(position, nodes, edges);
          const handles = resolveHandlesForInsert(type, nodeID);

          if (nearestEdge && handles) {
            const splitEdges = buildSplitEdges(nearestEdge, nodeID, handles);
            const inserted = insertNodeOnEdge({
              node: newNode,
              edge: nearestEdge,
              splitEdges,
            });
            if (inserted) return;
          }
        }
      }

      addNode(newNode);
    },
    [
      isInteractive,
      reactFlowInstance,
      getNodeID,
      addNode,
      insertNodeOnEdge,
      nodes,
      edges,
      onLockedDragAttempt,
      clearInsertHighlight,
    ]
  );

  const onDragOver = useCallback(
    (event) => {
      event.preventDefault();

      if (!isInteractive) {
        event.dataTransfer.dropEffect = 'none';
        clearInsertHighlight();
        return;
      }

      const hasPalettePayload = event.dataTransfer.types.includes(
        'application/reactflow'
      );

      if (!hasPalettePayload) {
        clearInsertHighlight();
        event.dataTransfer.dropEffect = 'move';
        return;
      }

      event.dataTransfer.dropEffect = 'move';

      if (!modifierPressedRef.current || !reactFlowInstance) {
        clearInsertHighlight();
        return;
      }

      const type = getDraggedNodeType(event);
      if (!canNodeTypeAutoInsert(type)) {
        clearInsertHighlight();
        return;
      }

      const reactFlowBounds = reactFlowWrapper.current.getBoundingClientRect();
      const flowPoint = reactFlowInstance.project({
        x: event.clientX - reactFlowBounds.left,
        y: event.clientY - reactFlowBounds.top,
      });

      const nearest = findNearestEdge(flowPoint, nodes, edges);
      setInsertCandidateEdgeId(nearest?.id ?? null);
    },
    [isInteractive, reactFlowInstance, nodes, edges, clearInsertHighlight]
  );

  return (
    <div
      ref={reactFlowWrapper}
      className={`pipeline-canvas${insertCandidateEdgeId ? ' pipeline-canvas--edge-insert' : ''}`}
      onDragLeave={clearInsertHighlight}
    >
      <ReactFlow
        nodes={nodes}
        edges={edgesForRender}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        onConnect={onConnect}
        onDrop={onDrop}
        onDragOver={onDragOver}
        onInit={setReactFlowInstance}
        nodeTypes={nodeTypes}
        proOptions={proOptions}
        snapToGrid={snapToGrid}
        snapGrid={[gridSize, gridSize]}
        nodesDraggable={isInteractive}
        nodesConnectable={isInteractive}
        elementsSelectable={isInteractive}
        connectionLineType="smoothstep"
        defaultEdgeOptions={defaultEdgeOptions}
      >
        <Background
          color="#334155"
          gap={backgroundGap}
          size={1}
          style={{ opacity: 0.32 }}
        />
        <PipelineControls
          snapToGrid={snapToGrid}
          onSnapToggle={onSnapToggle}
          collapsed={controlsCollapsed}
          onToggleCollapse={onToggleControlsCollapse}
          lockWiggle={lockWiggle}
          onInteractiveChange={onInteractiveChange}
        />
        <MiniMap
          className="pipeline-minimap"
          style={{ width: 128, height: 96 }}
          offsetScale={10}
          nodeColor="#3d4f66"
          nodeStrokeColor="#64748b"
          nodeStrokeWidth={1}
          nodeBorderRadius={4}
          maskColor="rgba(11, 17, 32, 0.65)"
          maskStrokeColor="rgba(56, 189, 248, 0.45)"
          maskStrokeWidth={1.5}
          pannable
          zoomable
        />
      </ReactFlow>
    </div>
  );
};
