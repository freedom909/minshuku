from neo4j import GraphDatabase

# Neo4j connection
driver = GraphDatabase.driver('bolt://localhost:7687', auth=('neo4j', 'princess'))

# Your Cypher query
query = """
// Parameters: Change these as needed
WITH 'listing-001' AS listingId,
     [
       {reviewId: 'review-001', rating: 5, comment: 'Excellent!'},
       {reviewId: 'review-002', rating: 4, comment: 'Very good'},
       {reviewId: 'review-003', rating: 3, comment: 'Average stay'}
     ] AS reviewsList

// Check if Listing exists
MATCH (l:Listing {listingId: listingId})
WITH l, reviewsList
UNWIND reviewsList AS reviewData
// Create Review node safely (no duplicates)
MERGE (r:Review {reviewId: reviewData.reviewId})
  ON CREATE SET r.rating = reviewData.rating,
                r.comment = reviewData.comment,
                r.createdAt = datetime()
// Connect Listing to Review safely
MERGE (l)-[:REVIEWS]->(r)
RETURN l, collect(r) AS reviews;
"""

try:
    with driver.session() as session:
        result = session.run(query)
        records = list(result)
        
        if records:
            print(f'✅ Successfully created {len(records[0]["reviews"])} reviews for listing-001')
            for record in records:
                listing = record['l']
                reviews = record['reviews']
                print(f'Listing: {listing["listingId"]} - {listing["title"]}')
                for review in reviews:
                    print(f'  Review: {review["reviewId"]} - Rating: {review["rating"]} - {review["comment"]}')
        else:
            print('❌ No listing found with ID: listing-001')
            print('Please check if listing-001 exists in the database')
            
except Exception as e:
    print(f'❌ Error executing query: {e}')

finally:
    driver.close()