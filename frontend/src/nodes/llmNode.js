import { Position } from 'reactflow';
import { BaseNode } from './BaseNode';

const LLM_HANDLES = [
  { type: 'target', position: Position.Left, idSuffix: 'prompt' },
  { type: 'source', position: Position.Right, idSuffix: 'response' },
];

export const LLMNode = ({ id }) => {
  return (
    <BaseNode id={id} title="LLM" handles={LLM_HANDLES} className="node--compact">
      <p className="node-description">Prompt in, response out.</p>
    </BaseNode>
  );
};
