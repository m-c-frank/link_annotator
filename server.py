import fastapi
from typing import Optional, List
import json
import os
import random
import networkx as nx
from networkx.readwrite import json_graph
from fastapi.staticfiles import StaticFiles
from pydantic import BaseModel

app = fastapi.FastAPI()

# create a graph
input_graph = nx.Graph()
annotation_graph = nx.Graph()


class Link(BaseModel):
    source: str
    target: str
    # optional similarity
    human_similarity: Optional[float] = -1


class Node(BaseModel):
    id: str
    name: str
    timestamp: int
    origin: str
    text: str


# reccursively get all files in a directory except .files and .directories
def get_files(directory):
    for path, _, filenames in os.walk(directory):
        for filename in filenames:
            input_graph.add_node(path + "/" + filename)


app.mount("/static", StaticFiles(directory="static"), name="static")


@app.get("/")
def read_root():
    return fastapi.responses.FileResponse("index.html")


@app.get("/nodes/random/2")
def get_random_two():
    # return two random nodes
    filenames = random.sample(list(input_graph.nodes), 2)
    texts = [open(filename).read() for filename in filenames]
    nodes = [{"id": filename, "text": text}
             for filename, text in zip(filenames, texts)]

    return {"nodes": nodes}


class AnnotationRequest(BaseModel):
    annotation_node: Node
    annotation_links: List[Link]


@app.post("/annotate")
def insert_node(annotation_request: AnnotationRequest):
    annotation_node = annotation_request.annotation_node
    annotation_links = annotation_request.annotation_links
    print(annotation_node)
    print(annotation_links)

    subgraph = nx.Graph()

    subgraph.add_node(annotation_node.id, **annotation_node.dict())

    # loop through all annotation links
    for annotation_edge in annotation_links:
        # add the edge to the graph
        subgraph.add_edge(
            annotation_edge.source,
            annotation_edge.target,
            human_similarity=annotation_edge.human_similarity
        )

    data = json_graph.node_link_data(subgraph)

    with open(f"data/{annotation_node.id}.json", "w") as f:
        json.dump(data, f, indent=4)

    annotation_graph.update(subgraph)

    return {"status": "ok"}


if __name__ == "__main__":
    # get all files in the current directory
    get_files("/home/mcfrank/brain/data/test")
    # start the server
    import uvicorn
    uvicorn.run(app, host="localhost", port=5020)
