import { useState } from 'react';
import { Position } from 'reactflow';
import { BaseNode } from './BaseNode';

const DELAY_HANDLES = [
  { type: 'target', position: Position.Left, idSuffix: 'in' },
  { type: 'source', position: Position.Right, idSuffix: 'out' },
];

export const DelayNode = ({ id }) => {
  const [delayMs, setDelayMs] = useState(1000);

  return (
    <BaseNode id={id} title="Delay" handles={DELAY_HANDLES} className="node--compact">
      <div className="node-field">
        <label className="node-label">Delay (ms)</label>
        <input
          className="node-input"
          type="number"
          min={0}
          value={delayMs}
          onChange={(e) => setDelayMs(Number(e.target.value))}
        />
      </div>
    </BaseNode>
  );
};
