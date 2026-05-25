import { useState } from 'react';
import { Position } from 'reactflow';
import { BaseNode } from './BaseNode';
import { distributedContentTops } from './handleLayout';

const [trueTop, falseTop] = distributedContentTops(2);

const CONDITION_HANDLES = [
  {
    type: 'target',
    position: Position.Left,
    idSuffix: 'true',
    style: { top: trueTop },
  },
  {
    type: 'target',
    position: Position.Left,
    idSuffix: 'false',
    style: { top: falseTop },
  },
  { type: 'source', position: Position.Right, idSuffix: 'result' },
];

export const ConditionNode = ({ id }) => {
  const [operator, setOperator] = useState('==');

  return (
    <BaseNode
      id={id}
      title="Condition"
      handles={CONDITION_HANDLES}
      className="node--tall"
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
