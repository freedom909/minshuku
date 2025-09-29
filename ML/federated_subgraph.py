# from typing import Dict
# import logging

# from fastapi import FastAPI
# from fastapi.middleware.cors import CORSMiddleware
# import uvicorn

# from ariadne import gql, QueryType, ObjectType
# from ariadne.asgi import GraphQL
# from ariadne.contrib.federation import make_federated_schema

# # ----- Simple in-memory "database" -----
# LISTINGS: Dict[str, Dict] = {
#     "listing-001": {"id": "listing-001", "title": "Quiet cabin by the lake", "description": "A calm retreat."},
#     "listing-002": {"id": "listing-002", "title": "Cozy yurt in Mraza", "description": "Unique yurt stay."},
# }

# # ----- GraphQL SDL (federated) -----
# type_defs = gql(
#     """
#     type Listing @key(fields: "id") {
#       id: ID!
#       title: String
#       description: String
#       resolve_reference: Listing
#     }

#     type AIResult {
#       suggestion: String!
#       confidence: Float
#       isSuitable: Boolean
#     }

#     type Query {
#       # Federated queries should be available on the subgraph
#       suggestTitleImprovements(listingId: ID!): AIResult
#     }
#     """
# )

# # ----- Resolvers -----
# query = QueryType()
# listing = ObjectType("Listing")

# @query.field("suggestTitleImprovements")
# def resolve_suggest_title_improvements(_, info, listingId):
#     """Return a suggestion for a title given a listingId.

#     In a real system, you'd call your ML service or OpenAI here. This example
#     uses a tiny rule to produce a suggestion.
#     """
#     logging.getLogger("machine_subgraph").info("suggestTitleImprovements called for %s", listingId)

#     listing = LISTINGS.get(listingId)
#     if not listing:
#         # For federation, the gateway may call queries with IDs that come from other services.
#         # Return a reasonable fallback.
#         return {"suggestion": "Nice stay — book now!", "confidence": 0.0, "isSuitable": False}

#     title = listing.get("title") or "Untitled"
#     # simple rule-based improvement
#     if "yurt" in title.lower():
#         suggestion = f"Luxury Stay: {title}"
#     else:
#         suggestion = f"Featured: {title}"

#     return {"suggestion": suggestion, "confidence": 0.9, "isSuitable": True}

# # Entity reference resolver for federated Listing
# @listing.field("resolve_reference")
# def resolve_listing_reference(obj, _info, **kwargs):
#     """Resolve a Listing when gateway sends an entity reference like { __typename: 'Listing', id: '...' }
#     Ariadne's ObjectType supports .field decorator for federation.
#     """
#     listing_id = obj.get("id")
#     logging.getLogger("machine_subgraph").info("resolve_reference for Listing %s", listing_id)
#     return LISTINGS.get(listing_id)

# # ----- Build federated schema -----
# schema = make_federated_schema(type_defs, [query, listing])

# # ----- FastAPI app and GraphQL mount -----
# app = FastAPI(title="machine-subgraph")

# # Allow CORS from localhost (gateway will often be on another port)
# app.add_middleware(
#     CORSMiddleware,
#     allow_origins=["http://localhost:4000", "http://127.0.0.1:4000", "http://localhost:3000", "http://127.0.0.1:3000"],
#     allow_credentials=True,
#     allow_methods=["*"],
#     allow_headers=["*"],
# )

# graphql_app = GraphQL(schema, debug=True)
# app.add_route("/graphql", graphql_app)
# app.add_websocket_route("/graphql", graphql_app)

# @app.get("/healthz")
# async def healthz():
#     return {"status": "ok"}

# # ----- Run server -----
# if __name__ == "__main__":
#     logging.basicConfig(level=logging.INFO)
#     print("Starting machine subgraph at http://127.0.0.1:8000/graphql")
#     uvicorn.run(app, host="127.0.0.1", port=8000)
