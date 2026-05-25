export const DraggableNode = ({
  type,
  label,
  tooltip,
  locked = false,
  onLockedDragAttempt,
}) => {
  const onDragStart = (event, nodeType) => {
    if (locked) {
      event.preventDefault();
      onLockedDragAttempt?.();
      return;
    }
    const appData = { nodeType };
    event.target.style.cursor = 'grabbing';
    event.dataTransfer.setData('application/reactflow', JSON.stringify(appData));
    event.dataTransfer.effectAllowed = 'move';
  };

  const handleMouseDown = () => {
    if (locked) {
      onLockedDragAttempt?.();
    }
  };

  return (
    <div
      className={`draggable-node ${type}${locked ? ' draggable-node--locked' : ''}`}
      onDragStart={(event) => onDragStart(event, type)}
      onDragEnd={(event) => {
        if (!locked) {
          event.target.style.cursor = 'grab';
        }
      }}
      onMouseDown={handleMouseDown}
      draggable={!locked}
      data-tooltip={tooltip}
      aria-label={tooltip}
    >
      <span className="draggable-node__label">{label}</span>
    </div>
  );
};
