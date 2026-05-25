import { Controls, ControlButton } from 'reactflow';

const SnapGridIcon = () => (
  <svg viewBox="0 0 16 16" width="14" height="14" aria-hidden="true">
    <path
      fill="currentColor"
      d="M1 1h5v5H1V1zm9 0h5v5h-5V1zM1 10h5v5H1v-5zm9 0h5v5h-5v-5z"
    />
  </svg>
);

const CollapseIcon = () => (
  <svg viewBox="0 0 16 16" width="12" height="12" aria-hidden="true">
    <path
      fill="currentColor"
      d="M3 5l5 5 5-5H3z"
    />
  </svg>
);

const ExpandIcon = () => (
  <svg viewBox="0 0 16 16" width="12" height="12" aria-hidden="true">
    <path
      fill="currentColor"
      d="M3 11l5-5 5 5H3z"
    />
  </svg>
);

export const PipelineControls = ({
  snapToGrid,
  onSnapToggle,
  collapsed,
  onToggleCollapse,
  lockWiggle,
  onInteractiveChange,
}) => {
  if (collapsed) {
    return (
      <div className="pipeline-controls pipeline-controls--collapsed">
        <button
          type="button"
          className="pipeline-control-btn"
          onClick={onToggleCollapse}
          data-tooltip="Expand controls"
          aria-label="Expand controls"
        >
          <ExpandIcon />
        </button>
      </div>
    );
  }

  return (
    <div
      className={`pipeline-controls${lockWiggle ? ' pipeline-controls--wiggle' : ''}`}
    >
      <Controls
        showInteractive
        showZoom
        showFitView
        position="bottom-left"
        onInteractiveChange={onInteractiveChange}
      >
        <ControlButton
          onClick={onSnapToggle}
          className={`pipeline-control-snap${snapToGrid ? ' is-active' : ''}`}
          data-tooltip="Snap to grid"
          aria-label="Snap to grid"
          aria-pressed={snapToGrid}
        >
          <SnapGridIcon />
        </ControlButton>
        <ControlButton
          onClick={onToggleCollapse}
          className="pipeline-control-collapse"
          data-tooltip="Collapse controls"
          aria-label="Collapse controls"
        >
          <CollapseIcon />
        </ControlButton>
      </Controls>
    </div>
  );
};
