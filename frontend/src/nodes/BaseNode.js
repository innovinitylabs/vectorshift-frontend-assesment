import { Fragment, useMemo } from 'react';
import { Handle, Position, useStore } from 'reactflow';
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

const connectedHandlesSelector =
  (nodeId) =>
  (state) => {
    const connected = new Set();
    state.edges.forEach((edge) => {
      if (edge.target === nodeId && edge.targetHandle) {
        connected.add(edge.targetHandle);
      }
      if (edge.source === nodeId && edge.sourceHandle) {
        connected.add(edge.sourceHandle);
      }
    });
    return connected;
  };

const connectedHandlesEqual = (prev, next) => {
  if (prev.size !== next.size) return false;
  for (const handleId of prev) {
    if (!next.has(handleId)) return false;
  }
  return true;
};

export const BaseNode = ({
  id,
  title,
  handles = [],
  children,
  className = '',
}) => {
  const hasHandleLabels = handles.some((handle) => handle.label);
  const connectedHandleIds = useStore(
    useMemo(() => connectedHandlesSelector(id), [id]),
    connectedHandlesEqual
  );

  let leftConnectedLabelIndex = 0;
  let rightConnectedLabelIndex = 0;

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
        const isConnected = connectedHandleIds.has(handleId);
        let staggerClass = '';

        if (handle.label && isConnected) {
          if (isLeft) {
            staggerClass =
              leftConnectedLabelIndex % 2 === 0
                ? 'node-handle-label--stagger-up'
                : 'node-handle-label--stagger-down';
            leftConnectedLabelIndex += 1;
          } else {
            staggerClass =
              rightConnectedLabelIndex % 2 === 0
                ? 'node-handle-label--stagger-up'
                : 'node-handle-label--stagger-down';
            rightConnectedLabelIndex += 1;
          }
        }

        const labelClassName = [
          'node-handle-label',
          isLeft ? 'node-handle-label--left' : 'node-handle-label--right',
          isConnected ? 'node-handle-label--connected' : '',
          staggerClass,
        ]
          .filter(Boolean)
          .join(' ');

        return (
          <Fragment key={handleId}>
            <Handle
              type={handle.type}
              position={position}
              id={handleId}
              style={style}
              className={isConnected ? 'node-port--connected' : undefined}
            />
            {handle.label ? (
              <span
                className={labelClassName}
                style={{ '--handle-label-top': style.top }}
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
