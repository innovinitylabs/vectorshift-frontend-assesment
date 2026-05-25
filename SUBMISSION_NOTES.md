# Submission Notes

Suggested demo flow for reviewers (about 3–4 minutes).

## Core requirements

1. **Drag nodes** — Pull Input, LLM, Text, and Output (or demo nodes) from the toolbar onto the canvas.
2. **Connect workflow** — Link handles left-to-right; confirm smoothstep animated edges.
3. **TextNode variables** — In a Text node, type `Hello {{name}}` and confirm new left target handles appear.
4. **Text autosizing** — Add multiple lines; confirm the node grows without breaking layout.
5. **Submit DAG analysis** — Click submit; verify node/edge counts and DAG result in the modal.

## Workflow polish (recommended highlights)

6. **Keyboard shortcuts** — Press `F` to fit the canvas; `=` / `-` to zoom; `G` for snap grid; `L` to lock; `Tab` to collapse the controls dock. Confirm shortcuts do not fire while typing inside a node field.
7. **Lock mode** — Toggle lock on the control dock (or `L`); confirm nodes cannot be dragged or connected.
8. **Minimap** — Hover the bottom-right minimap for expansion.
9. **Edge context menu** — Right-click an edge: disable connection (muted grey wire), enable again, or delete connection.
10. **Disabled edges and submit** — Disable an edge, then submit; confirm the DAG analysis uses only active (enabled) edges.
11. **Edge delete and reconnect** — Delete a selected edge with Backspace/Delete, or drag an edge endpoint to reconnect; drag off the canvas to remove.
12. **Delete dock** — Drag a node toward the top-right delete target; hover stabilizes the node; release to remove the node and its connected edges.

## Branches

| Branch | Purpose |
|--------|---------|
| `main` | Final submission |
| `feature/edge-auto-insert` | Experimental only; not part of final scope |

## Keyboard reference

| Action | Key |
|--------|-----|
| Fit view | `F` |
| Zoom in | `=` |
| Zoom out | `-` |
| Toggle snap grid | `G` |
| Lock / unlock canvas | `L` |
| Collapse / expand controls | `Tab` |
