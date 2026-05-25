import { MarkerType } from 'reactflow';

const defaultMarkerEnd = {
  type: MarkerType.Arrow,
  height: '20px',
  width: '20px',
};

const DEFAULT_NODE_WIDTH = 200;
const DEFAULT_NODE_HEIGHT = 80;

const EDGE_SAMPLE_FRACTIONS = [0.25, 0.5, 0.75];

const INSERTABLE_NODE_HANDLES = {
  llm: { target: 'prompt', source: 'response' },
  api: { target: 'input', source: 'output' },
  condition: { target: 'input', source: 'true' },
  delay: { target: 'in', source: 'out' },
  math: { target: 'a', source: 'result' },
  merge: { target: 'in1', source: 'out' },
};

export const EDGE_INSERT_THRESHOLD = 112;

export const getNodeDimensions = (node) => ({
  width: node?.width ?? DEFAULT_NODE_WIDTH,
  height: node?.height ?? DEFAULT_NODE_HEIGHT,
});

/** Right-center (source) and left-center (target) handle anchors in flow space. */
export const getHandleAnchors = (sourceNode, targetNode) => {
  const source = getNodeDimensions(sourceNode);
  const target = getNodeDimensions(targetNode);

  return {
    sourcePoint: {
      x: sourceNode.position.x + source.width,
      y: sourceNode.position.y + source.height / 2,
    },
    targetPoint: {
      x: targetNode.position.x,
      y: targetNode.position.y + target.height / 2,
    },
  };
};

export const samplePointsAlongEdge = (sourcePoint, targetPoint) =>
  EDGE_SAMPLE_FRACTIONS.map((fraction) => ({
    x: sourcePoint.x + (targetPoint.x - sourcePoint.x) * fraction,
    y: sourcePoint.y + (targetPoint.y - sourcePoint.y) * fraction,
  }));

const distance = (a, b) => Math.hypot(a.x - b.x, a.y - b.y);

const minDistanceToEdgeSamples = (flowPoint, sourcePoint, targetPoint) => {
  const samples = samplePointsAlongEdge(sourcePoint, targetPoint);
  return Math.min(...samples.map((point) => distance(flowPoint, point)));
};

export const findNearestEdge = (
  flowPoint,
  nodes,
  edges,
  threshold = EDGE_INSERT_THRESHOLD,
  getNodeById
) => {
  if (!flowPoint || !edges.length) return null;

  const nodeById = new Map(nodes.map((node) => [node.id, node]));
  const resolveNode = (id) => getNodeById?.(id) ?? nodeById.get(id);

  let nearest = null;
  let nearestDistance = threshold;

  edges.forEach((edge) => {
    const sourceNode = resolveNode(edge.source);
    const targetNode = resolveNode(edge.target);
    if (!sourceNode || !targetNode) return;

    const { sourcePoint, targetPoint } = getHandleAnchors(sourceNode, targetNode);
    const dist = minDistanceToEdgeSamples(flowPoint, sourcePoint, targetPoint);

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
