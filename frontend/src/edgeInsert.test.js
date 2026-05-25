import {
  canNodeTypeAutoInsert,
  EDGE_INSERT_THRESHOLD,
  resolveHandlesForInsert,
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

  test('uses a forgiving but bounded midpoint threshold', () => {
    expect(EDGE_INSERT_THRESHOLD).toBeGreaterThanOrEqual(120);
    expect(EDGE_INSERT_THRESHOLD).toBeLessThanOrEqual(125);
  });
});
