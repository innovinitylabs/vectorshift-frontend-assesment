import { useState } from 'react';
import { shallow } from 'zustand/shallow';
import { useStore } from './store';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:8000';

export const SubmitButton = () => {
  const { nodes, edges } = useStore(
    (state) => ({ nodes: state.nodes, edges: state.edges }),
    shallow
  );

  const [status, setStatus] = useState('idle');
  const [result, setResult] = useState(null);
  const [errorMessage, setErrorMessage] = useState('');

  const closePanel = () => {
    setStatus('idle');
    setResult(null);
    setErrorMessage('');
  };

  const handleSubmit = async () => {
    setStatus('loading');
    setResult(null);
    setErrorMessage('');

    try {
      const response = await fetch(`${API_URL}/pipelines/parse`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ nodes, edges }),
      });

      if (!response.ok) {
        throw new Error(`Server responded with status ${response.status}`);
      }

      const data = await response.json();

      if (
        typeof data.num_nodes !== 'number' ||
        typeof data.num_edges !== 'number' ||
        typeof data.is_dag !== 'boolean'
      ) {
        throw new Error('Received an invalid response from the server');
      }

      setResult(data);
      setStatus('success');
    } catch (error) {
      const message =
        error instanceof TypeError
          ? 'Could not reach the analysis server. Is the backend running?'
          : error.message || 'Pipeline analysis failed. Please try again.';
      setErrorMessage(message);
      setStatus('error');
    }
  };

  const showPanel = status === 'success' || status === 'error';

  return (
    <>
      <div className="submit-bar">
        <button
          type="button"
          className="submit-bar__button"
          onClick={handleSubmit}
          disabled={status === 'loading'}
        >
          {status === 'loading' ? 'Analyzing...' : 'Submit'}
        </button>
      </div>

      {showPanel && (
        <div
          className="analysis-overlay"
          onClick={closePanel}
          role="presentation"
        >
          <div
            className="analysis-card"
            onClick={(e) => e.stopPropagation()}
            role="dialog"
            aria-labelledby="analysis-title"
            aria-modal="true"
          >
            <button
              type="button"
              className="analysis-card__close"
              onClick={closePanel}
              aria-label="Close"
            >
              x
            </button>

            {status === 'success' && result && (
              <>
                <h2 id="analysis-title" className="analysis-card__title">
                  Pipeline Analysis
                </h2>
                <dl className="analysis-card__stats">
                  <div className="analysis-card__row">
                    <dt>Nodes</dt>
                    <dd>{result.num_nodes}</dd>
                  </div>
                  <div className="analysis-card__row">
                    <dt>Edges</dt>
                    <dd>{result.num_edges}</dd>
                  </div>
                  <div className="analysis-card__row">
                    <dt>Valid DAG</dt>
                    <dd
                      className={
                        result.is_dag
                          ? 'analysis-card__value--yes'
                          : 'analysis-card__value--no'
                      }
                    >
                      {result.is_dag ? 'Yes' : 'No'}
                    </dd>
                  </div>
                </dl>
              </>
            )}

            {status === 'error' && (
              <>
                <h2 id="analysis-title" className="analysis-card__title">
                  Analysis Failed
                </h2>
                <p className="analysis-card__error">{errorMessage}</p>
              </>
            )}
          </div>
        </div>
      )}
    </>
  );
};
