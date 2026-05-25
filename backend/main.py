from collections import deque
from typing import Any

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        'https://vectorshift-frontend-assesment.vercel.app',
        'http://localhost:3000',
        'http://127.0.0.1:3000',
    ],
    allow_credentials=True,
    allow_methods=['*'],
    allow_headers=['*'],
)


class PipelineParseRequest(BaseModel):
    nodes: list[dict[str, Any]]
    edges: list[dict[str, Any]]


class PipelineParseResponse(BaseModel):
    num_nodes: int
    num_edges: int
    is_dag: bool


def is_dag(node_ids: list[str], edges: list[dict[str, Any]]) -> bool:
    if not node_ids:
        return True

    node_set = set(node_ids)
    indegree = {node_id: 0 for node_id in node_ids}
    adjacency = {node_id: [] for node_id in node_ids}

    for edge in edges:
        source = edge.get('source')
        target = edge.get('target')
        if source not in node_set or target not in node_set:
            continue
        adjacency[source].append(target)
        indegree[target] += 1

    queue = deque(node_id for node_id in node_ids if indegree[node_id] == 0)
    visited = 0

    while queue:
        node = queue.popleft()
        visited += 1
        for neighbor in adjacency[node]:
            indegree[neighbor] -= 1
            if indegree[neighbor] == 0:
                queue.append(neighbor)

    return visited == len(node_ids)


@app.get('/')
def read_root():
    return {'Ping': 'Pong'}


@app.post('/pipelines/parse', response_model=PipelineParseResponse)
def parse_pipeline(pipeline: PipelineParseRequest) -> PipelineParseResponse:
    node_ids = [node['id'] for node in pipeline.nodes if 'id' in node]
    num_nodes = len(node_ids)
    num_edges = len(pipeline.edges)

    return PipelineParseResponse(
        num_nodes=num_nodes,
        num_edges=num_edges,
        is_dag=is_dag(node_ids, pipeline.edges),
    )
