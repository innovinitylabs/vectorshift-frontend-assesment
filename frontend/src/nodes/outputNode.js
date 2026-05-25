import { useState } from 'react';
import { Position } from 'reactflow';
import { BaseNode } from './BaseNode';

const OUTPUT_HANDLES = [
  { type: 'target', position: Position.Left, idSuffix: 'value' },
];

export const OutputNode = ({ id, data }) => {
  const [currName, setCurrName] = useState(
    data?.outputName || id.replace('customOutput-', 'output_')
  );
  const [outputType, setOutputType] = useState(data.outputType || 'Text');

  return (
    <BaseNode id={id} title="Output" handles={OUTPUT_HANDLES} className="node--compact">
      <div className="node-field">
        <label className="node-label">Name</label>
        <input
          className="node-input"
          type="text"
          value={currName}
          onChange={(e) => setCurrName(e.target.value)}
        />
      </div>
      <div className="node-field">
        <label className="node-label">Type</label>
        <select
          className="node-select"
          value={outputType}
          onChange={(e) => setOutputType(e.target.value)}
        >
          <option value="Text">Text</option>
          <option value="File">Image</option>
        </select>
      </div>
    </BaseNode>
  );
};
