from fastapi import APIRouter
from core.db_connection import neo4j_query
import logging

router = APIRouter()
logger = logging.getLogger(__name__)

# @router.post("/suggest_title")
# @router.get("/suggest_title")
def suggest_title_improvement(listing_id: str = None):
    if listing_id and listing_id.startswith('"') and listing_id.endswith('"'):
        listing_id = listing_id[1:-1]
    logger.info(f"Request received for /customer/suggest_title with listing_id: {listing_id}")
    if not listing_id:
        logger.warning("Missing required parameter: listing_id")
        return {"detail": "Missing required parameter: listing_id", "example": "Try: /customer/suggest_title?listing_id=listing-002"}
    query = """
    MATCH (l:Listing {id: $listing_id})
    RETURN l.title AS title
    """
    logger.debug(f"Executing Neo4j query: {query}")
    result = neo4j_query(query, {"listing_id": listing_id})    
    logger.info(f"Query result: {result}")    
    if result and "title" in result:
        return {"suggestions": [result["title"] + " (优化版)"]}
    else:
        logger.warning(f"No title found for listing_id: {listing_id}")
        return {"suggestions": []}

# async def suggest_title_improvement(listing_id: str) -> str:
#     return f"Improved title for listing {listing_id}"
