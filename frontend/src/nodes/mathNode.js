import { useState } from 'react';
import { Position } from 'reactflow';
import { BaseNode } from './BaseNode';
import { distributedContentTops } from './handleLayout';

const [aTop, bTop] = distributedContentTops(2);

const MATH_HANDLES = [
  {
    type: 'target',
    position: Position.Left,
    idSuffix: 'a',
    style: { top: aTop },
  },
  {
    type: 'target',
    position: Position.Left,
    idSuffix: 'b',
    style: { top: bTop },
  },
  { type: 'source', position: Position.Right, idSuffix: 'result' },
];

export const MathNode = ({ id }) => {
  const [operation, setOperation] = useState('+');

  return (
    <BaseNode id={id} title="Math" handles={MATH_HANDLES} className="node--tall">
      <div className="node-field">
        <label className="node-label">Operation</label>
        <select
          className="node-select"
          value={operation}
          onChange={(e) => setOperation(e.target.value)}
        >
          <option value="+">+</option>
          <option value="-">-</option>
          <option value="*">*</option>
          <option value="/">/</option>
        </select>
      </div>
    </BaseNode>
  );
};
