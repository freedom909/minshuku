from neo4j import GraphDatabase
import mysql.connector

# === MySQL connection ===
mysql_conn = mysql.connector.connect(
    host="localhost",
    user="root",
    password="princess",   # your MySQL password
    database="air",
    port=3307
)
cursor = mysql_conn.cursor(dictionary=True)

cursor.execute("""
    SELECT id, title, hostId, locationType
    FROM listings
""")
rows = cursor.fetchall()

# === Neo4j connection ===
driver = GraphDatabase.driver("bolt://localhost:7687", auth=("neo4j", "princess"))

with driver.session() as session:
    for row in rows:
        session.run(
            """
            MERGE (l:Listing {id: $id})
            SET l.title = $title,
                l.locationType = $locationType
            MERGE (h:Host {id: $hostId})
            MERGE (h)-[:OWNS]->(l)
            """,
            row
        )

driver.close()
cursor.close()
mysql_conn.close()

print(f"✅ Imported {len(rows)} listings from MySQL to Neo4j")
