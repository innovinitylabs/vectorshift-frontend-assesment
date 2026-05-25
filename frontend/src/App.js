import { useState, useCallback } from 'react';
import './styles/toolbar.css';
import { PipelineToolbar } from './toolbar';
import { PipelineUI } from './ui';
import { SubmitButton } from './submit';

function App() {
  const [snapToGrid, setSnapToGrid] = useState(true);
  const [isInteractive, setIsInteractive] = useState(true);
  const [controlsCollapsed, setControlsCollapsed] = useState(false);
  const [lockWiggle, setLockWiggle] = useState(false);

  const handleLockedDragAttempt = useCallback(() => {
    setLockWiggle(true);
    window.setTimeout(() => setLockWiggle(false), 220);
  }, []);

  return (
    <div className="pipeline-app">
      <PipelineToolbar
        locked={!isInteractive}
        onLockedDragAttempt={handleLockedDragAttempt}
      />
      <main className="pipeline-workspace">
        <PipelineUI
          snapToGrid={snapToGrid}
          onSnapToggle={() => setSnapToGrid((prev) => !prev)}
          isInteractive={isInteractive}
          onInteractiveChange={setIsInteractive}
          controlsCollapsed={controlsCollapsed}
          onToggleControlsCollapse={() =>
            setControlsCollapsed((prev) => !prev)
          }
          lockWiggle={lockWiggle}
          onLockedDragAttempt={handleLockedDragAttempt}
        />
      </main>
      <footer className="pipeline-action-bar">
        <SubmitButton />
      </footer>
    </div>
  );
}

export default App;
