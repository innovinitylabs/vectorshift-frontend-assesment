import { useState } from 'react';
import './styles/toolbar.css';
import { PipelineToolbar } from './toolbar';
import { PipelineUI } from './ui';
import { SubmitButton } from './submit';

function App() {
  const [snapToGrid, setSnapToGrid] = useState(true);

  return (
    <div className="pipeline-app">
      <PipelineToolbar
        snapToGrid={snapToGrid}
        onSnapToggle={() => setSnapToGrid((prev) => !prev)}
      />
      <main className="pipeline-workspace">
        <PipelineUI snapToGrid={snapToGrid} />
      </main>
      <footer className="pipeline-action-bar">
        <SubmitButton />
      </footer>
    </div>
  );
}

export default App;
