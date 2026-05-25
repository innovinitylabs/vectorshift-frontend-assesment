import './styles/toolbar.css';
import { DraggableNode } from './draggableNode';

const NODE_PALETTE = [
  {
    type: 'customInput',
    label: 'Input',
    description: 'Pipeline entry point',
    ports: { left: 0, right: 1 },
  },
  {
    type: 'llm',
    label: 'LLM',
    description: 'Prompt in, response out',
    ports: { left: 1, right: 1 },
  },
  {
    type: 'customOutput',
    label: 'Output',
    description: 'Final pipeline result',
    ports: { left: 1, right: 0 },
  },
  {
    type: 'text',
    label: 'Text',
    description: 'Dynamic text + variable inputs',
    ports: { left: 1, right: 1 },
  },
  {
    type: 'api',
    label: 'API',
    description: 'HTTP request step',
    ports: { left: 1, right: 1 },
  },
  {
    type: 'condition',
    label: 'Condition',
    description: 'Branch execution paths',
    ports: { left: 1, right: 2 },
  },
  {
    type: 'delay',
    label: 'Delay',
    description: 'Pause before next step',
    ports: { left: 1, right: 1 },
  },
  {
    type: 'math',
    label: 'Math',
    description: 'Numeric operations',
    ports: { left: 2, right: 1 },
  },
  {
    type: 'merge',
    label: 'Merge',
    description: 'Combine workflow streams',
    ports: { left: 2, right: 1 },
  },
];

const APP_NAME = 'VectorShift Workflow Editor';

export const PipelineToolbar = ({ locked, onLockedDragAttempt }) => {
  return (
    <header className="pipeline-toolbar">
      <div className="pipeline-toolbar__brand">
        <img
          className="pipeline-toolbar__logo"
          src={`${process.env.PUBLIC_URL}/vectorshift.avif`}
          alt="VectorShift"
          width={28}
          height={28}
          draggable={false}
        />
        <span className="pipeline-toolbar__title">{APP_NAME}</span>
      </div>
      <div className="pipeline-toolbar__nodes">
        {NODE_PALETTE.map((node) => (
          <DraggableNode
            key={node.type}
            type={node.type}
            label={node.label}
            description={node.description}
            ports={node.ports}
            locked={locked}
            onLockedDragAttempt={onLockedDragAttempt}
          />
        ))}
      </div>
    </header>
  );
};
