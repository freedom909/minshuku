from neo4j import GraphDatabase

# Neo4j connection
driver = GraphDatabase.driver('bolt://localhost:7687', auth=('neo4j', 'princess'))

try:
    with driver.session() as session:
        # 检查 listing-002 是否存在
        result = session.run('MATCH (l:Listing {id: "listing-002"}) RETURN l')
        listing = result.single()
        
        if listing:
            print('✅ Listing found:')
            print(f'  ID: {listing["l"]["id"]}')
            print(f'  Title: {listing["l"]["title"]}')
            
            # 检查评论
            result2 = session.run('MATCH (l:Listing {id: "listing-002"})-[:HAS_REVIEW]->(r:Review) RETURN r')
            reviews = list(result2)
            
            if reviews:
                print(f'✅ Found {len(reviews)} reviews:')
                for record in reviews:
                    review = record['r']
                    print(f'  - Review ID: {review["reviewId"]}')
                    print(f'    Rating: {review["rating"]}')
                    print(f'    Comment: {review["comment"]}')
            else:
                print('❌ No reviews found for listing-002')
        else:
            print('❌ Listing-002 not found in Neo4j')
            
        # 测试报告服务中的查询
        print('\n🔍 Testing report service query:')
        result3 = session.run('MATCH (l:Listing {id: "listing-002"})-[:HAS_REVIEW]->(r:Review) RETURN COUNT(r) AS total_reviews, avg(r.rating) AS avg_graph_rating')
        report_data = result3.single()
        
        if report_data:
            print(f'  Total reviews: {report_data["total_reviews"]}')
            print(f'  Average rating: {report_data["avg_graph_rating"]}')
        else:
            print('  No data returned from report query')
            
except Exception as e:
    print(f'❌ Error: {e}')

finally:
    driver.close()