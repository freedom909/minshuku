import os
import logging
import dotenv
from typing import Dict, List, Optional, Any
from neo4j import GraphDatabase
from neo4j import WRITE_ACCESS
from mysql.connector import pooling
import google.generativeai as genai

# ------------------------------------------------------------------
# Load environment variables
# ------------------------------------------------------------------
dotenv.load_dotenv()
logger = logging.getLogger(__name__)

# ------------------------------------------------------------------
# MySQL Configuration & Helper
# ------------------------------------------------------------------
MYSQL_HOST = os.getenv("MYSQL_HOST", "localhost")
MYSQL_USER = os.getenv("MYSQL_USER", "root")
MYSQL_PASSWORD = os.getenv("MYSQL_PASSWORD", "princess")
MYSQL_DATABASE = os.getenv("MYSQL_DATABASE", "air")
MYSQL_PORT = int(os.getenv("MYSQL_PORT", 3307))

try:
    mysql_pool = pooling.MySQLConnectionPool(
        pool_name="mypool",
        pool_size=5,
        pool_reset_session=True,
        host=MYSQL_HOST,
        user=MYSQL_USER,
        password=MYSQL_PASSWORD,
        database=MYSQL_DATABASE,
        port=MYSQL_PORT,
        connect_timeout=30,
    )
    logger.info("✅ MySQL connection pool created successfully")
except Exception as e:
    logger.error(f"❌ Error creating MySQL connection pool: {e}")
    mysql_pool = None


def mysql_query(query: str, params: tuple = ()) -> List[Dict[str, Any]]:
    """Execute a SELECT and return all rows as list of dicts."""
    conn, cursor = None, None
    try:
        conn = mysql_pool.get_connection()
        cursor = conn.cursor(dictionary=True)
        cursor.execute(query, params)
        rows = cursor.fetchall()
        logger.debug(f"MySQL query returned {len(rows)} rows.")
        return rows
    except Exception as e:
        logger.error(f"MySQL query failed: {e}", exc_info=True)
        return []
    finally:
        if cursor:
            cursor.close()
        if conn:
            conn.close()


def mysql_execute(query: str, params: tuple = ()) -> None:
    """Execute an INSERT/UPDATE/DELETE and commit."""
    conn, cursor = None, None
    try:
        conn = mysql_pool.get_connection()
        cursor = conn.cursor()
        cursor.execute(query, params)
        conn.commit()
        logger.debug(f"MySQL execute successful: {query} {params}")
    except Exception as e:
        logger.error(f"MySQL execute failed: {e}", exc_info=True)
        raise
    finally:
        if cursor:
            cursor.close()
        if conn:
            conn.close()


# ------------------------------------------------------------------
# Neo4j Configuration & Helper
# ------------------------------------------------------------------
NEO4J_URI = os.getenv("NEO4J_URI")
NEO4J_USER = os.getenv("NEO4J_USER", "neo4j")
NEO4J_PASSWORD = os.getenv("NEO4J_PASSWORD", "princess")
NEO4J_DATABASE = os.getenv("NEO4J_DATABASE", "neo4j")

try:
    driver = GraphDatabase.driver(NEO4J_URI, auth=(NEO4J_USER, NEO4J_PASSWORD))
    with driver.session(database="neo4j", default_access_mode=WRITE_ACCESS) as session:
        result = session.run("RETURN 'Connected to Neo4j' AS message")
        message = result.single()["message"]
        logger.info(f"✅ {message}")
except Exception as e:
    logger.error(f"❌ Error connecting to Neo4j: {e}")
    driver = None


def neo4j_query(query: str, parameters: Optional[Dict[str, Any]] = None) -> Dict[str, Any]:
    """Run a Cypher query and return the first record as a dict."""
    if driver is None:
        logger.warning("Neo4j driver not available.")
        return {}
    try:
        with driver.session(database="neo4j", default_access_mode=WRITE_ACCESS)  as session:
            logger.debug(f"Running Cypher query: {query} with params: {parameters}")
            result = session.run(query, parameters or {})
            record = result.single()
            return dict(record) if record else {}
    except Exception as e:
        logger.error(f"Neo4j query failed: {e}", exc_info=True)
        return {}


# ------------------------------------------------------------------
# Gemini API Configuration
# ------------------------------------------------------------------
GEMINI_API_KEY = os.getenv("GEMINI_API_KEY")
DEFAULT_GEMINI_MODEL = os.getenv("GEMINI_MODEL", "gemini-2.5-flash")

if GEMINI_API_KEY:
    genai.configure(api_key=GEMINI_API_KEY)
    logger.info(f"✅ Gemini API configured (model: {DEFAULT_GEMINI_MODEL})")

    def test_gemini(prompt: str = "Hello Gemini, introduce yourself briefly."):
        """Test Gemini connection."""
        try:
            model = genai.GenerativeModel(DEFAULT_GEMINI_MODEL)
            response = model.generate_content(prompt)
            logger.info(f"Gemini response: {response.text}")
            return response.text
        except Exception as e:
            logger.error(f"⚠️ Gemini test failed: {e}")
            return None

    # Optional: Uncomment for quick test
    # test_gemini()
else:
    logger.warning("⚠️ GEMINI_API_KEY not set in .env")


# ------------------------------------------------------------------
# Connection Health Check
# ------------------------------------------------------------------
def check_connections():
    """Quickly verify MySQL and Neo4j connectivity."""
    # MySQL
    try:
        conn = mysql_pool.get_connection()
        conn.ping(reconnect=True, attempts=3, delay=2)
        logger.info("✅ MySQL connection healthy")
    except Exception as e:
        logger.error(f"❌ MySQL check failed: {e}")
    finally:
        if conn:
            conn.close()

    # Neo4j
    try:
        with driver.session() as s:
            s.run("RETURN 1")
        logger.info("✅ Neo4j connection healthy")
    except Exception as e:
        logger.error(f"❌ Neo4j check failed: {e}")


# ------------------------------------------------------------------
# Run directly for debug
# ------------------------------------------------------------------
if __name__ == "__main__":
    logging.basicConfig(level=logging.INFO)
    check_connections()
    print(neo4j_query("RETURN 'Aura connection test OK ✅' AS msg"))
