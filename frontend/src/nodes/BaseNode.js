import { Fragment } from 'react';
import { Handle, Position } from 'reactflow';
import { centeredContentHandleStyle } from './handleLayout';
import './nodes.css';

const defaultPosition = (type) =>
  type === 'target' ? Position.Left : Position.Right;

const resolveHandleId = (id, handle) =>
  handle.id ?? `${id}-${handle.idSuffix}`;

const resolveHandleStyle = (handle) => {
  if (handle.style?.top != null) {
    return handle.style;
  }
  return centeredContentHandleStyle();
};

export const BaseNode = ({
  id,
  title,
  handles = [],
  children,
  className = '',
}) => {
  const hasHandleLabels = handles.some((handle) => handle.label);

  return (
    <div
      className={[
        'node',
        className,
        hasHandleLabels ? 'node--handles-labeled' : '',
      ]
        .filter(Boolean)
        .join(' ')}
    >
      {handles.map((handle) => {
        const handleId = resolveHandleId(id, handle);
        const position = handle.position ?? defaultPosition(handle.type);
        const style = resolveHandleStyle(handle);
        const isLeft = position === Position.Left;

        return (
          <Fragment key={handleId}>
            <Handle
              type={handle.type}
              position={position}
              id={handleId}
              style={style}
            />
            {handle.label ? (
              <span
                className={`node-handle-label node-handle-label--${
                  isLeft ? 'left' : 'right'
                }`}
                style={{ top: style.top }}
              >
                {handle.label}
              </span>
            ) : null}
          </Fragment>
        );
      })}
      <div className="node__header">
        <span className="node__title">{title}</span>
      </div>
      <div className="node__body">{children}</div>
    </div>
  );
};
