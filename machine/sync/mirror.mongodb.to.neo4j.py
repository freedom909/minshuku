from neo4j import GraphDatabase
from pymongo import MongoClient

# MongoDB
mongo_client = MongoClient("mongodb://localhost:27017/")
mongo_db = mongo_client["air"]
reviews = mongo_db["reviews"].find({"listingId": "listing-002"})

# Neo4j
uri = "bolt://localhost:7687"
driver = GraphDatabase.driver(uri, auth=("neo4j", "princess"))

def sync_reviews(tx, review):
    tx.run("""
        MERGE (l:Listing {listingId: $listingId})
        MERGE (r:Review {id: $id})
        SET r.title = $title,
            r.rating = $rating,
            r.content = $content,
            r.picture = $picture,
            r.isFeatured = $isFeatured,
            r.isHighlighted = $isHighlighted,
            r.isPinned = $isPinned
        MERGE (r)-[:REVIEWS]->(l)
    """, **review)

with driver.session(database="neo4j") as session:
    for review in reviews:
        session.execute_write(sync_reviews, {
            "id": str(review["_id"]),
            "listingId": review["listingId"],
            "title": review["title"],
            "rating": review["rating"],
            "content": review["content"],
            "picture": review["picture"],
            "isFeatured": review["isFeatured"],
            "isHighlighted": review["isHighlighted"],
            "isPinned": review["isPinned"]
        })

print("✅ Reviews synced to Neo4j!")

# 🧹 Clean shutdown
driver.close()
mongo_client.close()
