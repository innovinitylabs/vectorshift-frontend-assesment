import {
  canNodeTypeAutoInsert,
  EDGE_INSERT_THRESHOLD,
  findNearestEdge,
  getHandleAnchors,
  resolveHandlesForInsert,
  samplePointsAlongEdge,
} from './edgeInsert';

describe('edge auto-insert eligibility', () => {
  const supportedTypes = [
    ['llm', { targetHandle: 'node-1-prompt', sourceHandle: 'node-1-response' }],
    ['api', { targetHandle: 'node-1-input', sourceHandle: 'node-1-output' }],
    ['condition', { targetHandle: 'node-1-input', sourceHandle: 'node-1-true' }],
    ['delay', { targetHandle: 'node-1-in', sourceHandle: 'node-1-out' }],
    ['math', { targetHandle: 'node-1-a', sourceHandle: 'node-1-result' }],
    ['merge', { targetHandle: 'node-1-in1', sourceHandle: 'node-1-out' }],
  ];
  const unsupportedTypes = ['customInput', 'customOutput', 'text'];

  test.each(supportedTypes)('%s supports edge auto-insert', (nodeType, expectedHandles) => {
    expect(canNodeTypeAutoInsert(nodeType)).toBe(true);
    expect(resolveHandlesForInsert(nodeType, 'node-1')).toEqual(expectedHandles);
  });

  test.each(unsupportedTypes)('%s falls back from edge auto-insert', (nodeType) => {
    expect(canNodeTypeAutoInsert(nodeType)).toBe(false);
    expect(resolveHandlesForInsert(nodeType, 'node-1')).toBeNull();
  });

  test('uses a forgiving threshold aligned with handle-anchor geometry', () => {
    expect(EDGE_INSERT_THRESHOLD).toBe(112);
  });
});

describe('edge auto-insert geometry', () => {
  const sourceNode = {
    id: 'a',
    position: { x: 0, y: 0 },
    width: 200,
    height: 100,
  };
  const targetNode = {
    id: 'b',
    position: { x: 300, y: 40 },
    width: 200,
    height: 100,
  };
  const edges = [{ id: 'e1', source: 'a', target: 'b' }];

  test('getHandleAnchors uses right-center source and left-center target', () => {
    expect(getHandleAnchors(sourceNode, targetNode)).toEqual({
      sourcePoint: { x: 200, y: 50 },
      targetPoint: { x: 300, y: 90 },
    });
  });

  test('samplePointsAlongEdge includes 25%, 50%, and 75% along the handle line', () => {
    const { sourcePoint, targetPoint } = getHandleAnchors(sourceNode, targetNode);
    expect(samplePointsAlongEdge(sourcePoint, targetPoint)).toEqual([
      { x: 225, y: 60 },
      { x: 250, y: 70 },
      { x: 275, y: 80 },
    ]);
  });

  test('findNearestEdge matches drops on the visible handle-to-handle path', () => {
    const nodes = [sourceNode, targetNode];

    expect(findNearestEdge({ x: 250, y: 70 }, nodes, edges, 40)).toEqual(edges[0]);
    expect(findNearestEdge({ x: 150, y: 50 }, nodes, edges, 40)).toBeNull();
  });

  test('findNearestEdge prefers runtime node dimensions from getNodeById', () => {
    const staleNodes = [
      { id: 'a', position: { x: 0, y: 0 } },
      { id: 'b', position: { x: 300, y: 0 } },
    ];
    const getNodeById = (id) =>
      id === 'a' ? sourceNode : id === 'b' ? { ...targetNode, position: { x: 300, y: 0 } } : null;

    expect(findNearestEdge({ x: 250, y: 50 }, staleNodes, edges, 40, getNodeById)).toEqual(
      edges[0]
    );
  });
});
