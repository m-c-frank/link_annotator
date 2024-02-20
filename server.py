import fastapi
import os
import random
import networkx as nx
from fastapi.staticfiles import StaticFiles

app = fastapi.FastAPI()

# create a graph
graph = nx.Graph()


# reccursively get all files in a directory except .files and .directories
def get_files(directory):
    for path, _, filenames in os.walk(directory):
        for filename in filenames:
            graph.add_node(path + "/" + filename)


app.mount("/static", StaticFiles(directory="static"), name="static")


@app.get("/")
def read_root():
    return fastapi.responses.FileResponse("index.html")


@app.get("/nodes/random/2")
def get_random_two():
    # return two random nodes
    filenames = random.sample(list(graph.nodes), 2)
    texts = [open(filename).read() for filename in filenames]
    nodes = [{"id": filename, "text": text}
             for filename, text in zip(filenames, texts)]

    return {"nodes": nodes}


if __name__ == "__main__":
    # get all files in the current directory
    get_files("/home/mcfrank/brain/data/test")
    # start the server
    import uvicorn
    uvicorn.run(app, host="localhost", port=5020)
