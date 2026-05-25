import './styles/toolbar.css';
import { DraggableNode } from './draggableNode';

export const PipelineToolbar = () => {
  return (
    <div className="pipeline-toolbar">
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
    </div>
  );
};
