# machine/models/sync_reviews_to_neo4j.py
from pymongo import MongoClient
from neo4j import GraphDatabase
import os

MONGO_URI = os.getenv("MONGO_URI", "mongodb://localhost:27017/air")
NEO4J_URI = os.getenv("NEO4J_URI", "bolt://localhost:7687")
NEO4J_USER = os.getenv("NEO4J_USER", "neo4j")
NEO4J_PASSWORD = os.getenv("NEO4J_PASSWORD", "princess")

def sync_reviews_to_neo4j():
    # --- Connect MongoDB ---
    mongo_client = MongoClient(MONGO_URI)
    mongo_db = mongo_client["minshuku"]  # Changed from "air" to "minshuku"
    reviews = list(mongo_db["reviews"].find())

    # --- Connect Neo4j ---
    driver = GraphDatabase.driver(NEO4J_URI, auth=(NEO4J_USER, NEO4J_PASSWORD))

    with driver.session(database="neo4j") as session:
        for r in reviews:
            # Use actual field names from the review schema
            author_id = r.get("authorId")
            guest_id = r.get("guestId")
            host_id = r.get("hostId")
            booking_id = r.get("bookingId")
            review_id = str(r.get("_id"))  # Use MongoDB _id as review ID
            rating = r.get("rating", 0)
            title = r.get("title", "")
            content = r.get("content", "")
            created_at = r.get("createdAt")

            # Skip if essential IDs are missing
            if not author_id or not booking_id:
                print(f"⚠️  Skipping review {review_id}: missing authorId or bookingId")
                continue

            session.execute_write(
                lambda tx: tx.run(
                    """
                    MERGE (author:User {userId: $author_id})
                    MERGE (guest:User {userId: $guest_id})
                    MERGE (host:User {userId: $host_id})
                    MERGE (booking:Booking {bookingId: $booking_id})
                    MERGE (review:Review {reviewId: $review_id})
                    SET review.rating = $rating,
                        review.title = $title,
                        review.content = $content,
                        review.createdAt = datetime($created_at)
                    MERGE (author)-[:WROTE]->(review)
                    MERGE (guest)-[:IS_GUEST_OF]->(review)
                    MERGE (host)-[:IS_HOST_OF]->(review)
                    MERGE (review)-[:RELATED_TO_BOOKING]->(booking)
                    """,
                    author_id=str(author_id),
                    guest_id=str(guest_id),
                    host_id=str(host_id),
                    booking_id=str(booking_id),
                    review_id=review_id,
                    rating=rating,
                    title=title,
                    content=content,
                    created_at=created_at.isoformat() if created_at else None,
                )
            )

    print(f"✅ Synced {len(reviews)} reviews from MongoDB → Neo4j")
    driver.close()
    mongo_client.close()

if __name__ == "__main__":
    sync_reviews_to_neo4j()
