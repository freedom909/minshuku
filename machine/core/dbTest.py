from neo4j import GraphDatabase
import os
from dotenv import load_dotenv

load_dotenv()

uri = os.getenv("NEO4J_URI", "bolt://localhost:7687")
user = os.getenv("NEO4J_USER", "neo4j")
password = os.getenv("NEO4J_PASSWORD", "princess")

print(f"Connecting to {uri} as {user}")

try:
    driver = GraphDatabase.driver(uri, auth=(user, password))
    with driver.session() as session:
        result = session.run("RETURN 1 AS ok")
        print("✅ Connected! Result:", result.single())
except Exception as e:
    print(f"❌ Error connecting to Neo4j: {e}")
finally:
    driver.close()
