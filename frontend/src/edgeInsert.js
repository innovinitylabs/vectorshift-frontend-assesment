import { MarkerType } from 'reactflow';

const defaultMarkerEnd = {
  type: MarkerType.Arrow,
  height: '20px',
  width: '20px',
};

const DEFAULT_NODE_WIDTH = 200;
const DEFAULT_NODE_HEIGHT = 80;

const INSERTABLE_NODE_HANDLES = {
  llm: { target: 'prompt', source: 'response' },
  api: { target: 'input', source: 'output' },
  condition: { target: 'input', source: 'true' },
  delay: { target: 'in', source: 'out' },
  math: { target: 'a', source: 'result' },
  merge: { target: 'in1', source: 'out' },
};

export const EDGE_INSERT_THRESHOLD = 98;

const getNodeDimensions = (node) => ({
  width: node.measured?.width ?? node.width ?? DEFAULT_NODE_WIDTH,
  height: node.measured?.height ?? node.height ?? DEFAULT_NODE_HEIGHT,
});

const nodeCenter = (node) => {
  const { width, height } = getNodeDimensions(node);
  return {
    x: node.position.x + width / 2,
    y: node.position.y + height / 2,
  };
};

const distance = (a, b) => Math.hypot(a.x - b.x, a.y - b.y);

export const findNearestEdge = (flowPoint, nodes, edges, threshold = EDGE_INSERT_THRESHOLD) => {
  if (!flowPoint || !edges.length) return null;

  const nodeById = new Map(nodes.map((node) => [node.id, node]));
  let nearest = null;
  let nearestDistance = threshold;

  edges.forEach((edge) => {
    const sourceNode = nodeById.get(edge.source);
    const targetNode = nodeById.get(edge.target);
    if (!sourceNode || !targetNode) return;

    const sourceCenter = nodeCenter(sourceNode);
    const targetCenter = nodeCenter(targetNode);
    const midpoint = {
      x: (sourceCenter.x + targetCenter.x) / 2,
      y: (sourceCenter.y + targetCenter.y) / 2,
    };

    const dist = distance(flowPoint, midpoint);
    if (dist < nearestDistance) {
      nearestDistance = dist;
      nearest = edge;
    }
  });

  return nearest;
};

export const canNodeTypeAutoInsert = (nodeType) =>
  Object.prototype.hasOwnProperty.call(INSERTABLE_NODE_HANDLES, nodeType);

export const resolveHandlesForInsert = (nodeType, nodeId) => {
  const handles = INSERTABLE_NODE_HANDLES[nodeType];

  if (!handles) {
    return null;
  }

  return {
    targetHandle: `${nodeId}-${handles.target}`,
    sourceHandle: `${nodeId}-${handles.source}`,
  };
};

export const buildSplitEdges = (edge, nodeId, handles) => {
  const base = {
    type: edge.type ?? 'smoothstep',
    animated: edge.animated ?? true,
    markerEnd: edge.markerEnd ?? defaultMarkerEnd,
  };

  return [
    {
      ...base,
      id: `split-${edge.id}-in`,
      source: edge.source,
      target: nodeId,
      sourceHandle: edge.sourceHandle,
      targetHandle: handles.targetHandle,
    },
    {
      ...base,
      id: `split-${edge.id}-out`,
      source: nodeId,
      target: edge.target,
      sourceHandle: handles.sourceHandle,
      targetHandle: edge.targetHandle,
    },
  ];
};
