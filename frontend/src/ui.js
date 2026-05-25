// ui.js
// Displays the drag-and-drop UI
// --------------------------------------------------

import { useState, useRef, useCallback, useMemo } from 'react';
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
  findNearestEdge,
  isInsertModifierHeld,
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
  const [reactFlowInstance, setReactFlowInstance] = useState(null);
  const [insertCandidateEdgeId, setInsertCandidateEdgeId] = useState(null);
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
      const raw = event?.dataTransfer?.getData('application/reactflow');
      if (!raw) return;

      const appData = JSON.parse(raw);
      const type = appData?.nodeType;
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

      const modifierHeld = isInsertModifierHeld(event);
      if (modifierHeld) {
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

      if (!isInsertModifierHeld(event) || !reactFlowInstance) {
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
