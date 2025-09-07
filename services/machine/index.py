import strawberry
from strawberry.fastapi import GraphQLRouter
from fastapi import FastAPI
import resolvers

@strawberry.type
class Query:
    hello: str = strawberry.field(resolver=resolvers.resolve_hello)
    compute: str = strawberry.field(resolver=resolvers.resolve_compute)

schema = strawberry.federation.Schema(
    query=Query,
    enable_federation_2=True
)

graphql_app = GraphQLRouter(schema)

app = FastAPI()
app.include_router(graphql_app, prefix="/graphql")
