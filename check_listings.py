from neo4j import GraphDatabase

driver = GraphDatabase.driver('bolt://localhost:7687', auth=('neo4j', 'princess'))

try:
    with driver.session() as session:
        # 查询所有房源
        result = session.run('MATCH (l:Listing) RETURN l.listingId, l.title LIMIT 10')
        listings = list(result)
        
        if listings:
            print('📋 Available listings in Neo4j:')
            for record in listings:
                listing_id = record['l.listingId']
                title = record['l.title']
                print(f'  - {listing_id}: {title}')
        else:
            print('❌ No listings found in Neo4j database')
            
        # 检查MySQL中是否有数据
        print('\n📋 Checking MySQL for listings...')
        
except Exception as e:
    print(f'❌ Error: {e}')

finally:
    driver.close()