# core/neo4j_client.py
from neo4j import GraphDatabase
import os
import dotenv

dotenv.load_dotenv()

NEO4J_URI = os.getenv("NEO4J_URI")
NEO4J_USER = os.getenv("NEO4J_USER")
NEO4J_PASSWORD = os.getenv("NEO4J_PASSWORD")

driver = GraphDatabase.driver(NEO4J_URI, auth=(NEO4J_USER, NEO4J_PASSWORD))

def get_listing_by_id(listing_id: str):
    with driver.session() as session:
        result = session.run(
            """
            MATCH (l:Listing {listingId: $listing_id})
            RETURN l.title AS title, l.description AS description
            """,
            listing_id=listing_id,
        )
        record = result.single()
        if not record:
            return None
        return {"title": record["title"], "description": record["description"]}
