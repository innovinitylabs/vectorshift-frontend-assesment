import { MarkerType } from 'reactflow';

const defaultMarkerEnd = {
  type: MarkerType.Arrow,
  height: '20px',
  width: '20px',
};

/** Approximate node center for midpoint geometry (flow coordinates). */
const NODE_CENTER_OFFSET = { x: 100, y: 44 };

const TARGET_HANDLE_SUFFIX = {
  customInput: null,
  llm: 'prompt',
  customOutput: 'value',
  text: null,
  api: 'input',
  condition: 'input',
  delay: 'in',
  math: 'a',
  merge: 'in1',
};

const SOURCE_HANDLE_SUFFIX = {
  customInput: 'value',
  llm: 'response',
  customOutput: null,
  text: 'output',
  api: 'output',
  condition: 'true',
  delay: 'out',
  math: 'result',
  merge: 'out',
};

export const EDGE_INSERT_THRESHOLD = 118;

const nodeCenter = (node) => ({
  x: node.position.x + NODE_CENTER_OFFSET.x,
  y: node.position.y + NODE_CENTER_OFFSET.y,
});

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

export const resolveHandlesForInsert = (nodeType, nodeId) => {
  const targetSuffix = TARGET_HANDLE_SUFFIX[nodeType];
  const sourceSuffix = SOURCE_HANDLE_SUFFIX[nodeType];

  if (targetSuffix == null || sourceSuffix == null) {
    return null;
  }

  return {
    targetHandle: `${nodeId}-${targetSuffix}`,
    sourceHandle: `${nodeId}-${sourceSuffix}`,
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
