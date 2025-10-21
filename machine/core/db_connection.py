# core/db_helper.py
from typing import Dict, List, Optional, Any
from core.config import driver as neo4j_driver, mysql_pool
import logging

logger = logging.getLogger(__name__)

# ---------- Neo4j ----------
def neo4j_query(query: str, parameters: Optional[Dict[str, Any]] = None) -> Dict[str, Any]:
    """Run a Cypher query and return the first record as a dict."""
    if neo4j_driver is None:
        logger.warning("Neo4j driver is not available. Returning empty result.")
        return {}
    
    try:
        with neo4j_driver.session() as session:
            logger.debug(f"Running Cypher query: {query} with params: {parameters}")
            result = session.run(query, parameters or {})
            record = result.single()
            if record:
                logger.debug(f"Query result: {record}")
                return dict(record)
            logger.debug("No records returned from Neo4j.")
            return {}
    except Exception as e:
        logger.error(f"Neo4j query failed: {e}", exc_info=True)
        return {}


# ---------- MySQL ----------
def mysql_query(query: str, params: tuple = ()) -> List[Dict[str, Any]]:
    """Execute a SELECT and return all rows as list of dicts."""
    conn = None
    cursor = None
    try:
        conn = mysql_pool.get_connection()
        cursor = conn.cursor(dictionary=True)
        cursor.execute(query, params)
        rows = cursor.fetchall()
        logger.debug(f"MySQL query returned {len(rows)} rows.")
        return rows
    except Exception as e:
        logger.error(f"MySQL query failed: {e}", exc_info=True)
        raise
    finally:
        if cursor:
            cursor.close()
        if conn:
            conn.close()


def mysql_execute(query: str, params: tuple = ()) -> None:
    """Execute an INSERT/UPDATE/DELETE and commit."""
    conn = None
    cursor = None
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

if __name__ == "__main__":
    print(neo4j_query("RETURN '✅ Aura Connected' AS msg"))
