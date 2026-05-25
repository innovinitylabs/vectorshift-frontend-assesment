import './styles/toolbar.css';
import { DraggableNode } from './draggableNode';

export const PipelineToolbar = ({ snapToGrid, onSnapToggle }) => {
  return (
    <header className="pipeline-toolbar">
      <div className="pipeline-toolbar__row">
        <div className="pipeline-toolbar__nodes">
          <DraggableNode type="customInput" label="Input" />
          <DraggableNode type="llm" label="LLM" />
          <DraggableNode type="customOutput" label="Output" />
          <DraggableNode type="text" label="Text" />
          <DraggableNode type="api" label="API" />
          <DraggableNode type="condition" label="Condition" />
          <DraggableNode type="delay" label="Delay" />
          <DraggableNode type="math" label="Math" />
          <DraggableNode type="merge" label="Merge" />
        </div>
        <button
          type="button"
          className={`toolbar-toggle${snapToGrid ? ' toolbar-toggle--on' : ''}`}
          onClick={onSnapToggle}
          aria-pressed={snapToGrid}
        >
          Snap Grid
        </button>
      </div>
    </header>
  );
};
