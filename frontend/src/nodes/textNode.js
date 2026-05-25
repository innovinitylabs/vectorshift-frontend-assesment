import { useState, useMemo, useRef, useLayoutEffect, useCallback } from 'react';
import { Position } from 'reactflow';
import { BaseNode } from './BaseNode';
import { contentRegionTop } from './handleLayout';

const VARIABLE_REGEX = /{{\s*([a-zA-Z_$][a-zA-Z0-9_$]*)\s*}}/g;

const OUTPUT_HANDLE = {
  type: 'source',
  position: Position.Right,
  idSuffix: 'output',
};

const parseVariables = (text) => {
  const seen = new Set();
  const variables = [];
  const regex = new RegExp(VARIABLE_REGEX.source, 'g');

  let match;
  while ((match = regex.exec(text)) !== null) {
    const name = match[1];
    if (!seen.has(name)) {
      seen.add(name);
      variables.push(name);
    }
  }

  return variables;
};

const buildVariableHandles = (variables) => {
  const count = variables.length;
  return variables.map((name, index) => ({
    type: 'target',
    position: Position.Left,
    idSuffix: name,
    style: {
      top: contentRegionTop((index + 1) / (count + 1)),
    },
  }));
};

export const TextNode = ({ id, data }) => {
  const [currText, setCurrText] = useState(data?.text || '{{input}}');
  const textareaRef = useRef(null);

  const variables = useMemo(() => parseVariables(currText), [currText]);

  const handles = useMemo(
    () => [...buildVariableHandles(variables), OUTPUT_HANDLE],
    [variables]
  );

  const syncTextareaSize = useCallback(() => {
    const el = textareaRef.current;
    if (!el) return;

    el.style.height = 'auto';
    el.style.width = '100%';

    const height = el.scrollHeight;
    el.style.height = `${height}px`;

    el.style.width = '1px';
    const contentWidth = Math.min(Math.max(el.scrollWidth + 16, 168), 380);
    el.style.width = `${contentWidth}px`;
  }, []);

  useLayoutEffect(() => {
    syncTextareaSize();
  }, [currText, syncTextareaSize]);

  return (
    <BaseNode id={id} title="Text" handles={handles} className="node--text">
      <div className="node-field node-field--text">
        <label className="node-label">Text</label>
        <textarea
          ref={textareaRef}
          className="node-textarea"
          value={currText}
          onChange={(e) => setCurrText(e.target.value)}
          rows={1}
          spellCheck={false}
        />
      </div>
    </BaseNode>
  );
};
