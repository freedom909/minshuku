from neo4j import GraphDatabase

# Neo4j connection
driver = GraphDatabase.driver('bolt://localhost:7687', auth=('neo4j', 'princess'))

# 先检查正确的属性名
try:
    with driver.session() as session:
        # 查询房源的正确属性名
        result = session.run('MATCH (l:Listing) RETURN keys(l) AS keys LIMIT 1')
        record = result.single()
        
        if record:
            keys = record['keys']
            print(f'📋 Listing node properties: {keys}')
            
            # 获取第一个房源的ID
            result2 = session.run('MATCH (l:Listing) RETURN l.id AS listingId, l.title AS title LIMIT 1')
            listing_record = result2.single()
            
            if listing_record:
                actual_listing_id = listing_record['listingId']
                title = listing_record['title']
                print(f'📋 Using listing: {actual_listing_id} - {title}')
                
                # 为这个房源创建评论
                query = f"""
                WITH '{actual_listing_id}' AS listingId,
                     [
                       {{reviewId: 'review-001', rating: 5, comment: 'Excellent!'}},
                       {{reviewId: 'review-002', rating: 4, comment: 'Very good'}},
                       {{reviewId: 'review-003', rating: 3, comment: 'Average stay'}}
                     ] AS reviewsList

                // Check if Listing exists
                MATCH (l:Listing {{id: listingId}})
                WITH l, reviewsList
                UNWIND reviewsList AS reviewData
                // Create Review node safely (no duplicates)
                MERGE (r:Review {{reviewId: reviewData.reviewId}})
                  ON CREATE SET r.rating = reviewData.rating,
                                r.comment = reviewData.comment,
                                r.createdAt = datetime()
                // Connect Listing to Review safely
                MERGE (l)-[:HAS_REVIEW]->(r)
                RETURN l, collect(r) AS reviews;
                """
                
                result3 = session.run(query)
                review_records = list(result3)
                
                if review_records:
                    print(f'✅ Successfully created {len(review_records[0]["reviews"])} reviews for {actual_listing_id}')
                    for record in review_records:
                        listing = record['l']
                        reviews = record['reviews']
                        print(f'Listing: {listing["id"]} - {listing["title"]}')
                        for review in reviews:
                            print(f'  Review: {review["reviewId"]} - Rating: {review["rating"]} - {review["comment"]}')
                else:
                    print('❌ Failed to create reviews')
            else:
                print('❌ No listings found')
        else:
            print('❌ Could not determine listing properties')
            
except Exception as e:
    print(f'❌ Error: {e}')

finally:
    driver.close()