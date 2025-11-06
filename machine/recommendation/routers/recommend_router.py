# from fastapi import APIRouter
# from core.db_connection import neo4j_query

# router = APIRouter()

# @router.get("/recommend_listings")
# def recommend_listings(user_id: str):
#     query = """
#     MATCH (u:User {id: $user_id})-[:BOOKED]->(b:Booking)-[:FOR]->(l:Listing)
#     RETURN DISTINCT l.id AS listing_id, l.title AS title
#     LIMIT 5
#     """
#     result = neo4j_query(query, {"user_id": user_id})
#     return {"recommendations": result}

from fastapi import APIRouter
from machine.recommendation.services.recommend_listings import recommend_listings

router = APIRouter()

@router.get("/listings")
async def recommend_listings_endpoint(userId: str):
    return {"recommendations": recommend_listings(userId)}
