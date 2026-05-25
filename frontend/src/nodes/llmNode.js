import { Position } from 'reactflow';
import { BaseNode } from './BaseNode';

const LLM_HANDLES = [
  {
    type: 'target',
    position: Position.Left,
    idSuffix: 'system',
    style: { top: `${100 / 3}%` },
  },
  {
    type: 'target',
    position: Position.Left,
    idSuffix: 'prompt',
    style: { top: `${200 / 3}%` },
  },
  { type: 'source', position: Position.Right, idSuffix: 'response' },
];

export const LLMNode = ({ id }) => {
  return (
    <BaseNode id={id} title="LLM" handles={LLM_HANDLES} className="node--tall">
      <p className="node-description">This is a LLM.</p>
    </BaseNode>
  );
};
