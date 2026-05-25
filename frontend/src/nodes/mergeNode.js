import { useState } from 'react';
import { Position } from 'reactflow';
import { BaseNode } from './BaseNode';

const MERGE_HANDLES = [
  {
    type: 'target',
    position: Position.Left,
    idSuffix: 'in1',
    style: { top: '25%' },
  },
  {
    type: 'target',
    position: Position.Left,
    idSuffix: 'in2',
    style: { top: '50%' },
  },
  {
    type: 'target',
    position: Position.Left,
    idSuffix: 'in3',
    style: { top: '75%' },
  },
  { type: 'source', position: Position.Right, idSuffix: 'out' },
];

export const MergeNode = ({ id }) => {
  const [mode, setMode] = useState('concat');

  return (
    <BaseNode id={id} title="Merge" handles={MERGE_HANDLES} className="node--tall">
      <div className="node-field">
        <label className="node-label">Mode</label>
        <select
          className="node-select"
          value={mode}
          onChange={(e) => setMode(e.target.value)}
        >
          <option value="concat">Concat</option>
          <option value="zip">Zip</option>
        </select>
      </div>
    </BaseNode>
  );
};
