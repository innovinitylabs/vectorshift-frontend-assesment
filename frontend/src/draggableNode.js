const createDragPreviewElement = ({ label, description, ports }) => {
  const card = document.createElement('div');
  card.className = 'drag-preview-card';

  const header = document.createElement('div');
  header.className = 'drag-preview-card__header';
  header.textContent = label;

  const desc = document.createElement('p');
  desc.className = 'drag-preview-card__desc';
  desc.textContent = description;

  const portsRow = document.createElement('div');
  portsRow.className = 'drag-preview-card__ports';

  const leftSide = document.createElement('div');
  leftSide.className = 'drag-preview-card__port-side drag-preview-card__port-side--left';
  for (let i = 0; i < (ports?.left ?? 0); i += 1) {
    const dot = document.createElement('span');
    dot.className = 'drag-preview-card__port-dot';
    leftSide.appendChild(dot);
  }

  const rightSide = document.createElement('div');
  rightSide.className = 'drag-preview-card__port-side drag-preview-card__port-side--right';
  for (let i = 0; i < (ports?.right ?? 0); i += 1) {
    const dot = document.createElement('span');
    dot.className = 'drag-preview-card__port-dot';
    rightSide.appendChild(dot);
  }

  portsRow.appendChild(leftSide);
  portsRow.appendChild(rightSide);
  card.appendChild(header);
  card.appendChild(desc);
  card.appendChild(portsRow);

  card.style.position = 'fixed';
  card.style.top = '-200px';
  card.style.left = '-200px';
  document.body.appendChild(card);
  return card;
};

const PortDots = ({ left = 0, right = 0 }) => (
  <div className="draggable-node__ports" aria-hidden="true">
    <div className="draggable-node__port-side draggable-node__port-side--left">
      {Array.from({ length: left }, (_, index) => (
        <span key={`l-${index}`} className="draggable-node__port-dot" />
      ))}
    </div>
    <div className="draggable-node__port-side draggable-node__port-side--right">
      {Array.from({ length: right }, (_, index) => (
        <span key={`r-${index}`} className="draggable-node__port-dot" />
      ))}
    </div>
  </div>
);

export const DraggableNode = ({
  type,
  label,
  description,
  ports = { left: 0, right: 0 },
  locked = false,
  onLockedDragAttempt,
}) => {
  const onDragStart = (event) => {
    if (locked) {
      event.preventDefault();
      onLockedDragAttempt?.();
      return;
    }

    event.currentTarget.classList.add('draggable-node--dragging');

    const appData = { nodeType: type };
    event.dataTransfer.setData(
      'application/reactflow',
      JSON.stringify(appData)
    );
    event.dataTransfer.effectAllowed = 'move';

    const preview = createDragPreviewElement({ label, description, ports });
    event.dataTransfer.setDragImage(preview, 20, 18);
    window.setTimeout(() => {
      if (preview.parentNode) {
        preview.parentNode.removeChild(preview);
      }
    }, 0);
  };

  const handleMouseDown = () => {
    if (locked) {
      onLockedDragAttempt?.();
    }
  };

  return (
    <div
      className={`draggable-node ${type}${locked ? ' draggable-node--locked' : ''}`}
      onDragStart={onDragStart}
      onDragEnd={(event) => {
        event.currentTarget.classList.remove('draggable-node--dragging');
      }}
      onMouseDown={handleMouseDown}
      draggable={!locked}
      aria-label={`${label}: ${description}`}
    >
      <div className="draggable-node__chip">
        <span className="draggable-node__label">{label}</span>
      </div>
      <div className="draggable-node__expand" aria-hidden="true">
        <div className="draggable-node__preview">
          <div className="draggable-node__preview-header">{label}</div>
          <p className="draggable-node__preview-desc">{description}</p>
          <PortDots left={ports.left} right={ports.right} />
        </div>
      </div>
    </div>
  );
};
