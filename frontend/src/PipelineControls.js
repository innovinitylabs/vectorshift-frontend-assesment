import { Controls, ControlButton, useReactFlow } from 'reactflow';

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

const PlusIcon = () => (
  <svg viewBox="0 0 32 32" width="14" height="14" aria-hidden="true">
    <path fill="currentColor" d="M32 18.133H18.133V32h-4.266V18.133H0v-4.266h13.867V0h4.266v13.867H32z" />
  </svg>
);

const MinusIcon = () => (
  <svg viewBox="0 0 32 5" width="14" height="14" aria-hidden="true">
    <path fill="currentColor" d="M0 0h32v4.2H0z" />
  </svg>
);

const FitViewIcon = () => (
  <svg viewBox="0 0 32 30" width="14" height="14" aria-hidden="true">
    <path
      fill="currentColor"
      d="M3.692 4.63c0-.53.4-.938.939-.938h5.215V0H4.708C2.13 0 0 2.054 0 4.63v5.216h3.692V4.631zM27.354 0h-5.2v3.692h5.17c.53 0 .984.4.984.939v5.215H32V4.631A4.624 4.624 0 0027.354 0zm.954 24.83c0 .532-.4.94-.939.94h-5.215v3.768h5.215c2.577 0 4.631-2.13 4.631-4.707v-5.139h-3.692v5.139zm-23.677.94c-.531 0-.939-.4-.939-.94v-5.138H0v5.139c0 2.577 2.13 4.707 4.708 4.707h5.138V25.77H4.631z"
    />
  </svg>
);

const LockIcon = () => (
  <svg viewBox="0 0 25 32" width="12" height="14" aria-hidden="true">
    <path
      fill="currentColor"
      d="M21.333 10.667H19.81V7.619C19.81 3.429 16.38 0 12.19 0 8 0 4.571 3.429 4.571 7.619v3.048H3.048A3.056 3.056 0 000 13.714v15.238A3.056 3.056 0 003.048 32h18.285a3.056 3.056 0 003.048-3.048V13.714a3.056 3.056 0 00-3.048-3.047zM12.19 24.533a3.056 3.056 0 01-3.047-3.047 3.056 3.056 0 013.047-3.048 3.056 3.056 0 013.048 3.048 3.056 3.056 0 01-3.048 3.047zm4.724-13.866H7.467V7.619c0-2.59 2.133-4.724 4.723-4.724 2.591 0 4.724 2.133 4.724 4.724v3.048z"
    />
  </svg>
);

const UnlockIcon = () => (
  <svg viewBox="0 0 25 32" width="12" height="14" aria-hidden="true">
    <path
      fill="currentColor"
      d="M21.333 10.667H19.81V7.619C19.81 3.429 16.38 0 12.19 0c-4.114 1.828-1.37 2.133.305 2.438 1.676.305 4.42 2.59 4.42 5.181v3.048H3.047A3.056 3.056 0 000 13.714v15.238A3.056 3.056 0 003.048 32h18.285a3.056 3.056 0 003.048-3.048V13.714a3.056 3.056 0 00-3.048-3.047zM12.19 24.533a3.056 3.056 0 01-3.047-3.047 3.056 3.056 0 013.047-3.048 3.056 3.056 0 013.048 3.048 3.056 3.056 0 01-3.048 3.047z"
    />
  </svg>
);

const ControlHint = ({ label, shortcut }) => (
  <span className="pipeline-control-hint" aria-hidden="true">
    <span className="pipeline-control-hint__label">{label}</span>
    <kbd className="pipeline-control-hint__key">{shortcut}</kbd>
  </span>
);

const viewportTransition = { duration: 220 };

export const PipelineControls = ({
  snapToGrid,
  onSnapToggle,
  collapsed,
  onToggleCollapse,
  lockWiggle,
  onInteractiveChange,
  isInteractive,
}) => {
  const { zoomIn, zoomOut, fitView } = useReactFlow();
  const dockClass = [
    'pipeline-control-dock',
    collapsed ? 'is-collapsed' : '',
    lockWiggle ? 'is-wiggle' : '',
  ]
    .filter(Boolean)
    .join(' ');

  const handleLockToggle = () => {
    onInteractiveChange(!isInteractive);
  };

  return (
    <Controls
      className={dockClass}
      showZoom={false}
      showFitView={false}
      showInteractive={false}
      position="bottom-left"
    >
      <ControlButton
        onClick={() => zoomIn(viewportTransition)}
        className="react-flow__controls-zoomin"
        aria-label="Zoom in"
      >
        <PlusIcon />
        <ControlHint label="Zoom in" shortcut="=" />
      </ControlButton>
      <ControlButton
        onClick={() => zoomOut(viewportTransition)}
        className="react-flow__controls-zoomout"
        aria-label="Zoom out"
      >
        <MinusIcon />
        <ControlHint label="Zoom out" shortcut="-" />
      </ControlButton>
      <ControlButton
        onClick={() => fitView({ padding: 0.18, duration: 320 })}
        className="react-flow__controls-fitview"
        aria-label="Fit view"
      >
        <FitViewIcon />
        <ControlHint label="Fit view" shortcut="F" />
      </ControlButton>
      <ControlButton
        onClick={handleLockToggle}
        className="react-flow__controls-interactive"
        aria-label={isInteractive ? 'Lock canvas' : 'Unlock canvas'}
        aria-pressed={!isInteractive}
      >
        {isInteractive ? <UnlockIcon /> : <LockIcon />}
        <ControlHint
          label={isInteractive ? 'Lock canvas' : 'Unlock canvas'}
          shortcut="L"
        />
      </ControlButton>
      <ControlButton
        onClick={onSnapToggle}
        className={`pipeline-control-snap${snapToGrid ? ' is-active' : ''}`}
        aria-label="Snap grid"
        aria-pressed={snapToGrid}
      >
        <SnapGridIcon />
        <ControlHint label="Snap grid" shortcut="G" />
      </ControlButton>
      <ControlButton
        onClick={onToggleCollapse}
        className="pipeline-control-toggle"
        aria-label={collapsed ? 'Expand controls' : 'Collapse controls'}
      >
        {collapsed ? <ExpandIcon /> : <CollapseIcon />}
        <ControlHint
          label={collapsed ? 'Expand controls' : 'Collapse controls'}
          shortcut="Tab"
        />
      </ControlButton>
    </Controls>
  );
};
