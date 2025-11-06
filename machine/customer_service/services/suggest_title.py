# customer_service/services/suggest_title.py
from machine.core.db_connection import neo4j_query
import logging

logger = logging.getLogger(__name__)

def suggest_title_improvement(listing_id: str = None):
    if listing_id and listing_id.startswith('"') and listing_id.endswith('"'):
        listing_id = listing_id[1:-1]
        print(f"Extracted listing_id: {listing_id}")

    logger.info(f"Request received for suggest_title_improvement with listing_id: {listing_id}")

    if not listing_id:
        logger.warning("Missing required parameter: listing_id")
        return {"detail": "Missing required parameter: listing_id", "example": "Try: /customer/suggest_title?listing_id=listing-002"}

    query = """
    MATCH (l:Listing {id: $listing_id})
    RETURN l.title AS title
    """

    logger.debug(f"Executing Neo4j query for listing_id: {listing_id}")
    logger.debug(f"Query: {query}")
    logger.debug(f"Parameters: {{\"listing_id\": \"{listing_id}\"}}")
    result = neo4j_query(query, {"listing_id": listing_id})
    logger.debug(f"Query result for listing_id {listing_id}: {result}")
    if not result or (isinstance(result, list) and (not result or not result[0].get("title"))) or (isinstance(result, dict) and not result.get("title")):
        return {
        "suggestions": ["No title found for the listing. Ensure the listing exists and has a title."],
        "debug": {
            "query": "MATCH (l:Listing {id: $listing_id}) RETURN l.title AS title",
            "parameters": {"listing_id": listing_id}
        }
    }

    original_title = result[0]["title"] if isinstance(result, list) and result and result[0].get("title") else result.get("title")
    improved_title = f"Optimized: {original_title} (Enhanced for SEO)"
    return {"suggestions": [original_title, improved_title]}

