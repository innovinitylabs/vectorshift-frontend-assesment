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
  return (
    <div className={`node ${className}`.trim()}>
      {handles.map((handle) => {
        const handleId = resolveHandleId(id, handle);
        return (
          <Handle
            key={handleId}
            type={handle.type}
            position={handle.position ?? defaultPosition(handle.type)}
            id={handleId}
            style={resolveHandleStyle(handle)}
          />
        );
      })}
      <div className="node__header">
        <span className="node__title">{title}</span>
      </div>
      <div className="node__body">{children}</div>
    </div>
  );
};
