// ui.js
// Displays the drag-and-drop UI
// --------------------------------------------------

import { useState, useRef, useCallback, useMemo, useEffect } from 'react';
import { isEdgeDisabled } from './store';
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
  isValidConnection: state.isValidConnection,
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
  const edgeReconnectSucceededRef = useRef(false);
  const [reactFlowInstance, setReactFlowInstance] = useState(null);
  const [draggingNodeId, setDraggingNodeId] = useState(null);
  const [deleteZoneHover, setDeleteZoneHover] = useState(false);
  const [edgeContextMenu, setEdgeContextMenu] = useState(null);
  const {
    nodes,
    edges,
    getNodeID,
    addNode,
    removeNode,
    onNodesChange,
    onEdgesChange,
    onConnect,
    isValidConnection,
  } = useStore(selector, shallow);

  const defaultEdgeOptions = useMemo(
    () => ({
      type: 'smoothstep',
      animated: true,
      selectable: true,
      deletable: true,
      focusable: true,
      updatable: true,
    }),
    []
  );

  const edgesForCanvas = useMemo(
    () =>
      edges.map((edge) => {
        const disabled = isEdgeDisabled(edge);
        return {
          ...edge,
          animated: disabled ? false : edge.animated ?? true,
          className: [edge.className, disabled ? 'edge-connection--disabled' : '']
            .filter(Boolean)
            .join(' '),
          selectable: edge.selectable ?? true,
          deletable: edge.deletable ?? true,
          focusable: edge.focusable ?? true,
          updatable: edge.updatable ?? true,
        };
      }),
    [edges]
  );

  useEffect(() => {
    if (!edgeContextMenu) return undefined;

    const closeMenu = () => setEdgeContextMenu(null);
    const onKeyDown = (event) => {
      if (event.key === 'Escape') closeMenu();
    };

    const timer = window.setTimeout(() => {
      document.addEventListener('click', closeMenu);
      document.addEventListener('keydown', onKeyDown);
    }, 0);

    return () => {
      window.clearTimeout(timer);
      document.removeEventListener('click', closeMenu);
      document.removeEventListener('keydown', onKeyDown);
    };
  }, [edgeContextMenu]);

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

  const onEdgeUpdateStart = useCallback((_event, edge) => {
    edgeReconnectSucceededRef.current = false;
    useStore.getState().setReconnectingEdgeId(edge.id);
  }, []);

  const onEdgeUpdate = useCallback((oldEdge, newConnection) => {
    const updated = useStore.getState().updateEdgeConnection(oldEdge, newConnection);
    if (updated) {
      edgeReconnectSucceededRef.current = true;
    }
  }, []);

  const onEdgeContextMenu = useCallback((event, edge) => {
    event.preventDefault();
    setEdgeContextMenu({
      edgeId: edge.id,
      x: event.clientX,
      y: event.clientY,
      disabled: isEdgeDisabled(edge),
    });
  }, []);

  const handleEdgeMenuToggle = useCallback(() => {
    if (!edgeContextMenu?.edgeId) return;
    useStore.getState().toggleEdgeDisabled(edgeContextMenu.edgeId);
    setEdgeContextMenu(null);
  }, [edgeContextMenu]);

  const onEdgeUpdateEnd = useCallback((_event, edge) => {
    if (!edgeReconnectSucceededRef.current) {
      useStore.getState().removeEdge(edge.id);
    }
    useStore.getState().clearReconnectingEdgeId();
    edgeReconnectSucceededRef.current = false;
  }, []);

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
        edges={edgesForCanvas}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        onConnect={onConnect}
        isValidConnection={isValidConnection}
        onDrop={onDrop}
        onDragOver={onDragOver}
        onNodeDragStart={onNodeDragStart}
        onNodeDrag={onNodeDrag}
        onNodeDragStop={onNodeDragStop}
        onEdgeUpdate={onEdgeUpdate}
        onEdgeUpdateStart={onEdgeUpdateStart}
        onEdgeUpdateEnd={onEdgeUpdateEnd}
        onEdgeContextMenu={onEdgeContextMenu}
        onInit={setReactFlowInstance}
        nodeTypes={nodeTypes}
        proOptions={proOptions}
        snapToGrid={snapToGrid}
        snapGrid={[gridSize, gridSize]}
        nodesDraggable={isInteractive}
        nodesConnectable={isInteractive}
        nodesFocusable={isInteractive}
        edgesFocusable={isInteractive}
        edgesUpdatable={isInteractive}
        elementsSelectable={isInteractive}
        deleteKeyCode={isInteractive ? ['Backspace', 'Delete'] : null}
        edgeUpdaterRadius={12}
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
      {edgeContextMenu && (
        <div
          className="pipeline-edge-menu"
          style={{ top: edgeContextMenu.y, left: edgeContextMenu.x }}
          role="menu"
          onMouseDown={(event) => event.stopPropagation()}
        >
          <button
            type="button"
            className="pipeline-edge-menu__item"
            role="menuitem"
            onClick={handleEdgeMenuToggle}
          >
            {edgeContextMenu.disabled ? 'Enable connection' : 'Disable connection'}
          </button>
        </div>
      )}
    </div>
  );
};
