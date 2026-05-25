# VectorShift Frontend Technical Assessment

A polished visual workflow editor built with React Flow, plus a FastAPI service that analyzes pipeline graphs for DAG validity.

## Overview

The application lets you compose node-based pipelines on a canvas, connect steps with animated edges, and submit the graph for backend analysis. The frontend focuses on reusable node composition, dynamic handle behavior, and workflow-editor UX. The backend counts nodes and edges and reports whether the graph is a directed acyclic graph (DAG).

## Implemented Features

- **BaseNode abstraction** — shared shell, header, and config-driven handles for all node types
- **Five demonstration nodes** — API, Condition, Delay, Math, and Merge (in addition to Input, Output, LLM, and Text)
- **Dynamic TextNode handles** — `{{variable}}` parsing creates deduplicated left-side target handles
- **Autosizing Text node** — textarea grows with content within sensible bounds
- **DAG validation** — `POST /pipelines/parse` returns node count, edge count, and `is_dag`
- **Workflow UI** — dark theme, toolbar palette with drag previews, snap-to-grid, polished controls dock
- **Minimap** — bottom-right overview with hover expansion
- **Lock mode** — disables canvas interaction with clear affordance feedback
- **Contextual delete dock** — top-right drop target appears while dragging a node to remove it and its edges

## Tech Stack

| Layer | Stack |
|-------|--------|
| Frontend | React, React Flow, Zustand |
| Backend | FastAPI |

## Run Instructions

### Frontend

```bash
cd frontend
npm install
npm start
```

Open [http://localhost:3000](http://localhost:3000).

Production build:

```bash
cd frontend
npm run build
```

### Backend

```bash
cd backend
pip install -r requirements.txt
uvicorn main:app --reload
```

API docs: [http://127.0.0.1:8000/docs](http://127.0.0.1:8000/docs)

The frontend submits to `http://localhost:8000/pipelines/parse` by default.

## Repository Notes

- **`main`** — stable assessment submission (recommended for review)
- **`feature/edge-auto-insert`** — experimental modifier-based edge insertion; intentionally **not** merged into the final submission

## Demo Guide

See [SUBMISSION_NOTES.md](./SUBMISSION_NOTES.md) for a short reviewer walkthrough and suggested screen-recording flow.

## Project Layout

```
frontend/     React app (canvas, nodes, toolbar, submit UI)
backend/      FastAPI DAG parser
```
