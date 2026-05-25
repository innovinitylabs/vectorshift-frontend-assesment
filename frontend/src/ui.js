// ui.js
// Displays the drag-and-drop UI
// --------------------------------------------------

import { useState, useRef, useCallback } from 'react';
import ReactFlow, { Background, MiniMap } from 'reactflow';
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
import './styles/toolbar.css';
import './styles/pipeline.css';
import 'reactflow/dist/style.css';

const gridSize = 20;
const backgroundGap = 32;
const proOptions = { hideAttribution: true };
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
  removeNode: state.removeNode,
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
  const deleteDockRef = useRef(null);
  const [reactFlowInstance, setReactFlowInstance] = useState(null);
  const [draggingNodeId, setDraggingNodeId] = useState(null);
  const [deleteZoneHover, setDeleteZoneHover] = useState(false);
  const {
    nodes,
    edges,
    getNodeID,
    addNode,
    removeNode,
    onNodesChange,
    onEdgesChange,
    onConnect,
  } = useStore(selector, shallow);

  const isPointInDeleteDock = useCallback((clientX, clientY) => {
    const dock = deleteDockRef.current;
    if (!dock) return false;

    const rect = dock.getBoundingClientRect();
    return (
      clientX >= rect.left &&
      clientX <= rect.right &&
      clientY >= rect.top &&
      clientY <= rect.bottom
    );
  }, []);

  const getInitNodeData = (nodeID, type) => {
    const nodeData = { id: nodeID, nodeType: `${type}` };
    return nodeData;
  };

  const onDrop = useCallback(
    (event) => {
      event.preventDefault();

      if (!isInteractive) {
        onLockedDragAttempt?.();
        return;
      }

      const reactFlowBounds = reactFlowWrapper.current.getBoundingClientRect();
      if (event?.dataTransfer?.getData('application/reactflow')) {
        const appData = JSON.parse(
          event.dataTransfer.getData('application/reactflow')
        );
        const type = appData?.nodeType;

        if (typeof type === 'undefined' || !type) {
          return;
        }

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

        addNode(newNode);
      }
    },
    [
      isInteractive,
      reactFlowInstance,
      getNodeID,
      addNode,
      onLockedDragAttempt,
    ]
  );

  const onDragOver = useCallback(
    (event) => {
      event.preventDefault();
      if (isInteractive) {
        event.dataTransfer.dropEffect = 'move';
      } else {
        event.dataTransfer.dropEffect = 'none';
      }
    },
    [isInteractive]
  );

  const onNodeDragStart = useCallback(
    (_event, node) => {
      if (!isInteractive) return;
      setDraggingNodeId(node.id);
      setDeleteZoneHover(false);
    },
    [isInteractive]
  );

  const onNodeDrag = useCallback(
    (event) => {
      if (!draggingNodeId) return;
      setDeleteZoneHover(isPointInDeleteDock(event.clientX, event.clientY));
    },
    [draggingNodeId, isPointInDeleteDock]
  );

  const onNodeDragStop = useCallback(
    (event, node) => {
      if (isPointInDeleteDock(event.clientX, event.clientY)) {
        removeNode(node.id);
      }
      setDraggingNodeId(null);
      setDeleteZoneHover(false);
    },
    [isPointInDeleteDock, removeNode]
  );

  const deleteDockClassName = [
    'pipeline-delete-dock',
    draggingNodeId ? 'is-active' : '',
    deleteZoneHover ? 'is-drop-target' : '',
  ]
    .filter(Boolean)
    .join(' ');

  return (
    <div ref={reactFlowWrapper} className="pipeline-canvas">
      <ReactFlow
        nodes={nodes}
        edges={edges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        onConnect={onConnect}
        onDrop={onDrop}
        onDragOver={onDragOver}
        onNodeDragStart={onNodeDragStart}
        onNodeDrag={onNodeDrag}
        onNodeDragStop={onNodeDragStop}
        onInit={setReactFlowInstance}
        nodeTypes={nodeTypes}
        proOptions={proOptions}
        snapToGrid={snapToGrid}
        snapGrid={[gridSize, gridSize]}
        nodesDraggable={isInteractive}
        nodesConnectable={isInteractive}
        elementsSelectable={isInteractive}
        connectionLineType="smoothstep"
        defaultEdgeOptions={{
          type: 'smoothstep',
          animated: true,
        }}
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
      <div
        ref={deleteDockRef}
        className={deleteDockClassName}
        aria-hidden={!draggingNodeId}
        aria-label="Drop node here to delete"
      >
        <svg
          className="pipeline-delete-dock__icon"
          viewBox="0 0 24 24"
          width="18"
          height="18"
          aria-hidden="true"
        >
          <path
            fill="currentColor"
            d="M9 3h6l1 2h4v2H4V5h4l1-2zm1 6h2v9h-2V9zm3 0h2v9h-2V9zm-6 0h2v9H7V9zM6 20h12v2H6v-2z"
          />
        </svg>
        <span className="pipeline-delete-dock__label">Delete</span>
      </div>
    </div>
  );
};
