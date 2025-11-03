from neo4j import GraphDatabase
from my_logging import logger

# Neo4j connection settings
NEO4J_URI = "neo4j://localhost:7687"  # or neo4j+ssc:// if using Aura
NEO4J_USER = "neo4j"
NEO4J_PASSWORD = "princess"  # replace with your real password

LISTING_ID = "listing-002"

def test_neo4j_connection():
    logger.info("Starting Neo4j connection test...")
    try:
        driver = GraphDatabase.driver(NEO4J_URI, auth=(NEO4J_USER, NEO4J_PASSWORD))
        with driver.session() as session:
            result = session.run("MATCH (l:Listing {id: $id}) RETURN l", {"id": LISTING_ID})
            node = result.single()
            if node:
                logger.info(f"Listing found: {node['l']}")
            else:
                logger.warning(f"Listing {LISTING_ID} not found in Neo4j.")
    except Exception as e:
        logger.error(f"Error connecting to Neo4j: {e}")
    finally:
        driver.close()
        logger.info("Neo4j connection closed.")

if __name__ == "__main__":
    test_neo4j_connection()
