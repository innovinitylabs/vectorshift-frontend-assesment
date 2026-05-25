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
const viewportTransition = { duration: 220 };
const fitViewOptions = { padding: 0.18, duration: 320 };

const isEditableTarget = (target) => {
  if (!(target instanceof HTMLElement)) {
    return false;
  }

  const tag = target.tagName;
  if (tag === 'INPUT' || tag === 'TEXTAREA' || tag === 'SELECT') {
    return true;
  }

  return target.isContentEditable;
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
  removeNode: state.removeNode,
  onNodesChange: state.onNodesChange,
  onEdgesChange: state.onEdgesChange,
  onConnect: state.onConnect,
  isValidConnection: state.isValidConnection,
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
  const deleteDockRef = useRef(null);
  const edgeReconnectSucceededRef = useRef(false);
  const draggingNodeIdRef = useRef(null);
  const deleteZoneHoverRef = useRef(false);
  const [reactFlowInstance, setReactFlowInstance] = useState(null);
  const [insertCandidateEdgeId, setInsertCandidateEdgeId] = useState(null);
  const [draggingNodeId, setDraggingNodeId] = useState(null);
  const [deleteZoneHover, setDeleteZoneHover] = useState(false);
  const [edgeContextMenu, setEdgeContextMenu] = useState(null);

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

  const nodesForCanvas = useMemo(
    () =>
      nodes.map((node) => {
        if (node.id !== draggingNodeId || !deleteZoneHover) {
          return node;
        }

        return {
          ...node,
          className: [node.className, 'pipeline-node--delete-capture']
            .filter(Boolean)
            .join(' '),
        };
      }),
    [nodes, draggingNodeId, deleteZoneHover]
  );

  const handleNodesChange = useCallback(
    (changes) => {
      const dragNodeId = draggingNodeIdRef.current;
      if (deleteZoneHoverRef.current && dragNodeId) {
        const filtered = changes.filter(
          (change) => !(change.type === 'position' && change.id === dragNodeId)
        );
        if (filtered.length !== changes.length) {
          if (filtered.length > 0) {
            onNodesChange(filtered);
          }
          return;
        }
      }
      onNodesChange(changes);
    },
    [onNodesChange]
  );

  const edgesForCanvas = useMemo(
    () =>
      edges.map((edge) => {
        const disabled = isEdgeDisabled(edge);
        return {
          ...edge,
          animated: disabled ? false : edge.animated ?? true,
          className: [
            edge.className,
            disabled ? 'edge-connection--disabled' : '',
            edge.id === insertCandidateEdgeId ? 'edge-insert-candidate' : '',
          ]
            .filter(Boolean)
            .join(' '),
          selectable: edge.selectable ?? true,
          deletable: edge.deletable ?? true,
          focusable: edge.focusable ?? true,
          updatable: edge.updatable ?? true,
        };
      }),
    [edges, insertCandidateEdgeId]
  );

  useEffect(() => {
    const onKeyDown = (event) => {
      if (isEditableTarget(event.target)) {
        return;
      }

      if (event.metaKey || event.ctrlKey || event.altKey) {
        return;
      }

      const key = event.key;

      if (key === 'f' || key === 'F') {
        event.preventDefault();
        reactFlowInstance?.fitView(fitViewOptions);
        return;
      }

      if (key === '=' || key === '+') {
        event.preventDefault();
        reactFlowInstance?.zoomIn(viewportTransition);
        return;
      }

      if (key === '-' || key === '_') {
        event.preventDefault();
        reactFlowInstance?.zoomOut(viewportTransition);
        return;
      }

      if (key === 'g' || key === 'G') {
        event.preventDefault();
        onSnapToggle?.();
        return;
      }

      if (key === 'l' || key === 'L') {
        event.preventDefault();
        onInteractiveChange?.(!isInteractive);
        return;
      }

      if (key === 'Tab') {
        event.preventDefault();
        onToggleControlsCollapse?.();
      }
    };

    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [
    reactFlowInstance,
    onSnapToggle,
    onInteractiveChange,
    isInteractive,
    onToggleControlsCollapse,
  ]);

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
          const nearestEdge = findNearestEdge(
            position,
            nodes,
            edges,
            undefined,
            (id) => reactFlowInstance?.getNode(id)
          );
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

      const nearest = findNearestEdge(
        flowPoint,
        nodes,
        edges,
        undefined,
        (id) => reactFlowInstance?.getNode(id)
      );
      setInsertCandidateEdgeId(nearest?.id ?? null);
    },
    [isInteractive, reactFlowInstance, nodes, edges, clearInsertHighlight]
  );

  const onNodeDragStart = useCallback(
    (_event, node) => {
      if (!isInteractive) return;
      draggingNodeIdRef.current = node.id;
      deleteZoneHoverRef.current = false;
      setDraggingNodeId(node.id);
      setDeleteZoneHover(false);
    },
    [isInteractive]
  );

  const onNodeDrag = useCallback(
    (event) => {
      const dragNodeId = draggingNodeIdRef.current;
      if (!dragNodeId) return;

      const inDeleteDock = isPointInDeleteDock(event.clientX, event.clientY);
      deleteZoneHoverRef.current = inDeleteDock;
      setDeleteZoneHover(inDeleteDock);
    },
    [isPointInDeleteDock]
  );

  const onNodeDragStop = useCallback(
    (event, node) => {
      if (isPointInDeleteDock(event.clientX, event.clientY)) {
        removeNode(node.id);
      }
      draggingNodeIdRef.current = null;
      deleteZoneHoverRef.current = false;
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

  const handleEdgeMenuDelete = useCallback(() => {
    if (!edgeContextMenu?.edgeId) return;
    useStore.getState().removeEdge(edgeContextMenu.edgeId);
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
    <div
      ref={reactFlowWrapper}
      className={`pipeline-canvas${insertCandidateEdgeId ? ' pipeline-canvas--edge-insert' : ''}`}
      onDragLeave={clearInsertHighlight}
    >
      <ReactFlow
        nodes={nodesForCanvas}
        edges={edgesForCanvas}
        onNodesChange={handleNodesChange}
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
          isInteractive={isInteractive}
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
          <div className="pipeline-edge-menu__separator" role="separator" />
          <button
            type="button"
            className="pipeline-edge-menu__item pipeline-edge-menu__item--danger"
            role="menuitem"
            onClick={handleEdgeMenuDelete}
          >
            Delete connection
          </button>
        </div>
      )}
    </div>
  );
};
