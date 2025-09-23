# machine/app.py
import uvicorn
from strawberry.asgi import GraphQL
from types_graphql import schema

app = GraphQL(schema, debug=True)

if __name__ == "__main__":
    uvicorn.run(app, host="0.0.0.0", port=8000)
