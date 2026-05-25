# Submission Notes

Suggested demo flow for reviewers (about 2–3 minutes).

1. **Drag nodes** — Pull Input, LLM, Text, and Output (or demo nodes) from the toolbar onto the canvas.
2. **Connect workflow** — Link handles left-to-right; confirm smoothstep animated edges.
3. **TextNode variables** — In a Text node, type `Hello {{name}}` and confirm new left target handles appear.
4. **Text autosizing** — Add multiple lines; confirm the node grows without breaking layout.
5. **Submit DAG analysis** — Click submit; verify node/edge counts and DAG result in the modal.
6. **Lock mode** — Toggle lock on the control dock; confirm nodes cannot be dragged or connected.
7. **Minimap** — Hover the bottom-right minimap for expansion; pan/zoom if helpful.
8. **Delete dock** — Drag a canvas node; release over the top-right delete target to remove the node and its edges.

## Branches

| Branch | Purpose |
|--------|---------|
| `main` | Final submission |
| `feature/edge-auto-insert` | Experimental only; not part of final scope |
