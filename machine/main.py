# machine/main.py
import uvicorn
import strawberry
from strawberry.asgi import GraphQL

# ✅ absolute import from the machine package
from machine.resolvers import schema_query


def create_schema():
    return strawberry.federation.Schema(
        query=schema_query,
        enable_federation_2=True,
    )


app = GraphQL(schema=create_schema())


if __name__ == "__main__":
    uvicorn.run(
        "machine.main:app",  # ✅ use package.module:app
        host="0.0.0.0",
        port=8000,
        reload=True
    )
