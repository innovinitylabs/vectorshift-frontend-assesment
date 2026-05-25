// store.js

import { create } from "zustand";
import {
    addEdge,
    applyNodeChanges,
    applyEdgeChanges,
    updateEdge,
    MarkerType,
  } from 'reactflow';

const edgeStyle = {
  type: 'smoothstep',
  animated: true,
  data: { disabled: false },
  markerEnd: { type: MarkerType.Arrow, height: '20px', width: '20px' },
};

export const isEdgeDisabled = (edge) => edge?.data?.disabled === true;

const connectionIsValid = (connection, edges, nodes, excludeEdgeId = null) => {
  if (!connection?.source || !connection?.target) {
    return false;
  }

  const targetNode = nodes.find((node) => node.id === connection.target);

  if (targetNode?.type === 'merge') {
    return true;
  }

  const targetHandle = connection.targetHandle ?? null;
  const hasIncomingOnHandle = edges.some(
    (edge) =>
      edge.id !== excludeEdgeId &&
      edge.target === connection.target &&
      (edge.targetHandle ?? null) === targetHandle
  );

  return !hasIncomingOnHandle;
};

export const useStore = create((set, get) => ({
    nodes: [],
    edges: [],
    reconnectingEdgeId: null,
    getNodeID: (type) => {
        const newIDs = {...get().nodeIDs};
        if (newIDs[type] === undefined) {
            newIDs[type] = 0;
        }
        newIDs[type] += 1;
        set({nodeIDs: newIDs});
        return `${type}-${newIDs[type]}`;
    },
    addNode: (node) => {
        set({
            nodes: [...get().nodes, node]
        });
    },
    insertNodeOnEdge: ({ node, edge, splitEdges }) => {
        if (!edge || !splitEdges?.length) return false;
        set({
            nodes: [...get().nodes, node],
            edges: [
                ...get().edges.filter((e) => e.id !== edge.id),
                ...splitEdges,
            ],
        });
        return true;
    },
    removeNode: (nodeId) => {
        if (!nodeId) return;
        set({
            nodes: get().nodes.filter((node) => node.id !== nodeId),
            edges: get().edges.filter(
                (edge) => edge.source !== nodeId && edge.target !== nodeId
            ),
        });
    },
    removeEdge: (edgeId) => {
        if (!edgeId) return;
        set({
            edges: get().edges.filter((edge) => edge.id !== edgeId),
        });
    },
    toggleEdgeDisabled: (edgeId) => {
        if (!edgeId) return;
        set({
            edges: get().edges.map((edge) =>
                edge.id === edgeId
                    ? {
                        ...edge,
                        data: {
                            ...edge.data,
                            disabled: !isEdgeDisabled(edge),
                        },
                    }
                    : edge
            ),
        });
    },
    setReconnectingEdgeId: (edgeId) => {
        set({ reconnectingEdgeId: edgeId ?? null });
    },
    clearReconnectingEdgeId: () => {
        set({ reconnectingEdgeId: null });
    },
    onNodesChange: (changes) => {
      set({
        nodes: applyNodeChanges(changes, get().nodes),
      });
    },
    onEdgesChange: (changes) => {
      set({
        edges: applyEdgeChanges(changes, get().edges),
      });
    },
    isValidConnection: (connection) => {
      const { nodes, edges, reconnectingEdgeId } = get();
      return connectionIsValid(connection, edges, nodes, reconnectingEdgeId);
    },
    onConnect: (connection) => {
      if (!get().isValidConnection(connection)) {
        return;
      }

      set({
        edges: addEdge({ ...connection, ...edgeStyle }, get().edges),
      });
    },
    updateEdgeConnection: (oldEdge, connection) => {
      const { nodes, edges, reconnectingEdgeId } = get();

      if (!connectionIsValid(connection, edges, nodes, reconnectingEdgeId ?? oldEdge.id)) {
        return false;
      }

      set({
        edges: updateEdge(oldEdge, connection, edges, { shouldReplaceId: false }),
        reconnectingEdgeId: null,
      });
      return true;
    },
    updateNodeField: (nodeId, fieldName, fieldValue) => {
      set({
        nodes: get().nodes.map((node) => {
          if (node.id === nodeId) {
            node.data = { ...node.data, [fieldName]: fieldValue };
          }

          return node;
        }),
      });
    },
  }));
