import { Position } from 'reactflow';
import { BaseNode } from './BaseNode';
import { distributedContentTops } from './handleLayout';

const [systemTop, promptTop] = distributedContentTops(2);

const LLM_HANDLES = [
  {
    type: 'target',
    position: Position.Left,
    idSuffix: 'system',
    style: { top: systemTop },
  },
  {
    type: 'target',
    position: Position.Left,
    idSuffix: 'prompt',
    style: { top: promptTop },
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
