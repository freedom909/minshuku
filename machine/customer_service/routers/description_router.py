# customer_service/routers/description_router.py
from fastapi import APIRouter, Query, HTTPException, Body
import logging
from customer_service.services.suggest_description import suggest_description
from neo4j import GraphDatabase
from core.my_logging import logger

logger = logging.getLogger(__name__)
router = APIRouter()

# Neo4j connection settings (same as test script)
NEO4J_URI = "neo4j://localhost:7687"  # or neo4j+ssc:// if using Aura
NEO4J_USER = "neo4j"
NEO4J_PASSWORD = "princess"  # replace with your real password

driver = GraphDatabase.driver(NEO4J_URI, auth=(NEO4J_USER, NEO4J_PASSWORD))

@router.get("/description/suggest")
@router.post("/description/suggest")
def suggest_description(listingId: str = Body(..., embed=True)):
    logger.info(f"Received request to suggest description for listingId={listingId}")
    
    try:
        with driver.session() as session:
            result = session.run(
                "MATCH (l:Listing {id: $id}) RETURN l", {"id": listingId}
            )
            node = result.single()
            if node:
                listing = node["l"]
                logger.info(f"Listing found: {listing}")
                
                # Example description suggestion logic
                suggestion = f"Check out this {listing['locationType'].lower()} called '{listing['title']}' — a cozy place to stay!"
                return {"suggestion": suggestion}
            else:
                logger.warning(f"Listing {listingId} not found in air dataset.")
                return {"suggestion": f"Listing {listingId} not found in air dataset."}
    except Exception as e:
        logger.error(f"Error querying Neo4j for listing {listingId}: {e}")
        return {"suggestion": f"Error querying listing {listingId}: {e}"}
