import { useState } from 'react';
import { Position } from 'reactflow';
import { BaseNode } from './BaseNode';
import { contentRegionTop, centeredContentHandleStyle } from './handleLayout';

const CONDITION_HANDLES = [
  {
    type: 'target',
    position: Position.Left,
    idSuffix: 'input',
    style: centeredContentHandleStyle(),
  },
  {
    type: 'source',
    position: Position.Right,
    idSuffix: 'true',
    style: { top: contentRegionTop(0.18) },
  },
  {
    type: 'source',
    position: Position.Right,
    idSuffix: 'false',
    style: { top: contentRegionTop(0.82) },
  },
];

export const ConditionNode = ({ id }) => {
  const [operator, setOperator] = useState('==');

  return (
    <BaseNode
      id={id}
      title="Condition"
      handles={CONDITION_HANDLES}
      className="node--condition"
    >
      <div className="node-field">
        <label className="node-label">Operator</label>
        <select
          className="node-select"
          value={operator}
          onChange={(e) => setOperator(e.target.value)}
        >
          <option value="==">==</option>
          <option value="!=">!=</option>
          <option value=">">&gt;</option>
        </select>
      </div>
    </BaseNode>
  );
};
