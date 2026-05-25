import { useState } from 'react';
import { Position } from 'reactflow';
import { BaseNode } from './BaseNode';

const API_HANDLES = [
  { type: 'target', position: Position.Left, idSuffix: 'input' },
  { type: 'source', position: Position.Right, idSuffix: 'output' },
];

export const APINode = ({ id }) => {
  const [url, setUrl] = useState('https://api.example.com');

  return (
    <BaseNode id={id} title="API" handles={API_HANDLES} className="node--compact">
      <div className="node-field">
        <label className="node-label">URL</label>
        <input
          className="node-input"
          type="text"
          value={url}
          onChange={(e) => setUrl(e.target.value)}
        />
      </div>
    </BaseNode>
  );
};
