import { Position } from 'reactflow';
import { BaseNode } from './BaseNode';
import { centeredContentHandleStyle } from './handleLayout';

const LLM_HANDLES = [
  {
    type: 'target',
    position: Position.Left,
    idSuffix: 'prompt',
    label: 'Prompt',
    style: centeredContentHandleStyle(),
  },
  {
    type: 'source',
    position: Position.Right,
    idSuffix: 'response',
    label: 'Response',
    style: centeredContentHandleStyle(),
  },
];

export const LLMNode = ({ id }) => {
  return (
    <BaseNode id={id} title="LLM" handles={LLM_HANDLES} className="node--compact">
      <p className="node-description">Prompt in, response out.</p>
    </BaseNode>
  );
};
