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
    <path fill="currentColor" d="M3 5l5 5 5-5H3z" />
  </svg>
);

const ExpandIcon = () => (
  <svg viewBox="0 0 16 16" width="12" height="12" aria-hidden="true">
    <path fill="currentColor" d="M3 11l5-5 5 5H3z" />
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
  const dockClass = [
    'pipeline-control-dock',
    collapsed ? 'is-collapsed' : '',
    lockWiggle ? 'is-wiggle' : '',
  ]
    .filter(Boolean)
    .join(' ');

  return (
    <Controls
      className={dockClass}
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
        className="pipeline-control-toggle"
        data-tooltip={collapsed ? 'Expand controls' : 'Collapse controls'}
        aria-label={collapsed ? 'Expand controls' : 'Collapse controls'}
      >
        {collapsed ? <ExpandIcon /> : <CollapseIcon />}
      </ControlButton>
    </Controls>
  );
};
