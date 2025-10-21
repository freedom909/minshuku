# core/config.py
import os
import dotenv
from neo4j import GraphDatabase
from mysql.connector import pooling

dotenv.load_dotenv()

# MySQL settings
MYSQL_HOST = os.getenv("MYSQL_HOST", "localhost")
MYSQL_USER = os.getenv("MYSQL_USER", "root")
MYSQL_PASSWORD = os.getenv("MYSQL_PASSWORD", "princess")
MYSQL_DATABASE = os.getenv("MYSQL_DATABASE", "air")

mysql_pool = pooling.MySQLConnectionPool(
    pool_name="mypool",
    pool_size=5,
    pool_reset_session=True,
    port=3307,
    host=MYSQL_HOST,
    user=MYSQL_USER,
    password=MYSQL_PASSWORD,
    database=MYSQL_DATABASE,
    connect_timeout=30,
)

# ✅ Neo4j configuration - reads from environment variables
NEO4J_URI = os.getenv("NEO4J_URI", "bolt://localhost:7687")
NEO4J_USER = os.getenv("NEO4J_USERNAME", os.getenv("NEO4J_USER", "neo4j"))
NEO4J_PASSWORD = os.getenv("NEO4J_PASSWORD", "princess")

# Create driver based on environment configuration
try:
    driver = GraphDatabase.driver(
        NEO4J_URI,
        auth=(NEO4J_USER, NEO4J_PASSWORD)
    )
    
    # Test connection
    with driver.session() as session:
        result = session.run("RETURN 'Connected to Neo4j' AS msg")
        print(f"✅ {result.single()['msg']} at {NEO4J_URI}")
except Exception as e:
    print(f"❌ Error connecting to Neo4j: {e}")
    driver = None
