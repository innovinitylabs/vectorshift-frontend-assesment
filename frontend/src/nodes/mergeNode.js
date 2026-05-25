import { useState } from 'react';
import { Position } from 'reactflow';
import { BaseNode } from './BaseNode';
import { contentRegionTop } from './handleLayout';

const MERGE_HANDLES = [
  {
    type: 'target',
    position: Position.Left,
    idSuffix: 'in1',
    label: 'Input 1',
    style: { top: contentRegionTop(0.14) },
  },
  {
    type: 'target',
    position: Position.Left,
    idSuffix: 'in2',
    label: 'Input 2',
    style: { top: contentRegionTop(0.78) },
  },
  {
    type: 'source',
    position: Position.Right,
    idSuffix: 'out',
    label: 'Merged',
    style: { top: contentRegionTop(0.5) },
  },
];

export const MergeNode = ({ id }) => {
  const [mode, setMode] = useState('concat');

  return (
    <BaseNode id={id} title="Merge" handles={MERGE_HANDLES} className="node--merge">
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
