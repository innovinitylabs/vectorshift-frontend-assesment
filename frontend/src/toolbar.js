import './styles/toolbar.css';
import { DraggableNode } from './draggableNode';

const NODE_PALETTE = [
  {
    type: 'customInput',
    label: 'Input',
    tooltip: 'Add an input source to the pipeline',
  },
  {
    type: 'llm',
    label: 'LLM',
    tooltip: 'Add a language model processing step',
  },
  {
    type: 'customOutput',
    label: 'Output',
    tooltip: 'Add an output destination for results',
  },
  {
    type: 'text',
    label: 'Text',
    tooltip: 'Add text templating with variable inputs',
  },
  {
    type: 'api',
    label: 'API',
    tooltip: 'Call an external HTTP API endpoint',
  },
  {
    type: 'condition',
    label: 'Condition',
    tooltip: 'Branch the pipeline based on a condition',
  },
  {
    type: 'delay',
    label: 'Delay',
    tooltip: 'Delay execution in the pipeline',
  },
  {
    type: 'math',
    label: 'Math',
    tooltip: 'Perform numeric operations on inputs',
  },
  {
    type: 'merge',
    label: 'Merge',
    tooltip: 'Merge multiple inputs into one stream',
  },
];

export const PipelineToolbar = ({ locked, onLockedDragAttempt }) => {
  return (
    <header className="pipeline-toolbar">
      <div className="pipeline-toolbar__nodes">
        {NODE_PALETTE.map((node) => (
          <DraggableNode
            key={node.type}
            type={node.type}
            label={node.label}
            tooltip={node.tooltip}
            locked={locked}
            onLockedDragAttempt={onLockedDragAttempt}
          />
        ))}
      </div>
    </header>
  );
};
