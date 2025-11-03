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
NEO4J_URI = os.getenv("NEO4J_URI")
NEO4J_USER = os.getenv("NEO4J_USER", "neo4j")
NEO4J_PASSWORD = os.getenv("NEO4J_PASSWORD", "princess")
NEO4J_DATABASE = os.getenv("NEO4J_DATABASE", "air")

try:
    driver = GraphDatabase.driver(NEO4J_URI, auth=(NEO4J_USER, NEO4J_PASSWORD))
    with driver.session() as session:
        result = session.run("RETURN 'Connected to Neo4j ✅' AS msg")
        print(result.single()["msg"])
        driver.close()
        driver = None
except Exception as e:
    print(f"❌ Error connecting to Neo4j: {e}")
    driver = None

# ==========================
# Gemini Configuration
# ==========================
import google.generativeai as genai

GEMINI_API_KEY = os.getenv("GEMINI_API_KEY")
DEFAULT_GEMINI_MODEL = os.getenv("GEMINI_MODEL", "gemini-2.5-flash")

if not GEMINI_API_KEY:
    print("⚠️ Warning: GEMINI_API_KEY not set in .env")
else:
    genai.configure(api_key=GEMINI_API_KEY)
    print(f"✅ Gemini API configured (default model: {DEFAULT_GEMINI_MODEL})")

    # Define a helper function to test or use Gemini dynamically
    def test_gemini(prompt: str = "Test: 日本語で自己紹介してください。"):
        """Send a test prompt to Gemini and return its response text."""
        try:
            model = genai.GenerativeModel(DEFAULT_GEMINI_MODEL)
            response = model.generate_content(prompt)
            print("Gemini response:", response.text)
            return response.text
        except Exception as e:
            print("⚠️ Gemini test failed:", e)
            return None

    # Example: You can comment this out later
    test_gemini("Hello Gemini, introduce yourself briefly.")
