# core/config.py
import os
import dotenv
from neo4j import GraphDatabase
from mysql import connector
from mysql.connector import pooling
import google.generativeai as genai

dotenv.load_dotenv()

# ==========================
# MySQL Configuration
# ==========================
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

# ==========================
# Neo4j Configuration
# ==========================
NEO4J_URI = os.getenv("NEO4J_URI", "bolt://localhost:7687")
NEO4J_USER = os.getenv("NEO4J_USERNAME", os.getenv("NEO4J_USER", "neo4j"))
NEO4J_PASSWORD = os.getenv("NEO4J_PASSWORD", "princess")

try:
    driver = GraphDatabase.driver(NEO4J_URI, auth=(NEO4J_USER, NEO4J_PASSWORD))
    with driver.session() as session:
        result = session.run("RETURN 'Connected to Neo4j' AS msg")
        print(f"✅ {result.single()['msg']} at {NEO4J_URI}")
except Exception as e:
    print(f"❌ Error connecting to Neo4j: {e}")
    driver = None

# ==========================
# Gemini Configuration
# ==========================
import google.generativeai as genai

GEMINI_API_KEY = os.getenv("GEMINI_API_KEY")
GEMINI_MODEL = os.getenv("GEMINI_MODEL", "gemini-2.5-flash")

if not GEMINI_API_KEY:
    print("⚠️ Warning: GEMINI_API_KEY not set in .env")
else:
    genai.configure(api_key=GEMINI_API_KEY)
    print("✅ Gemini API configured")

    # Optional: list models
    try:
        for model_info in genai.list_models():
            print("Available model:", model_info.name)
    except Exception as e:
        print("⚠️ Could not list Gemini models:", e)

    # Quick test
    try:
        model = genai.GenerativeModel(GEMINI_MODEL)
        response = model.generate_content("Test: Describe a cozy Airbnb cabin.")
        print("Gemini test output:", response.text)
    except Exception as e:
        print("⚠️ Gemini test failed:", e)
