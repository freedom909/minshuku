import neo4j from 'neo4j-driver';

const connectNeo4jDB = async () => {
  try {
    const uri = process.env.NEO4J_URI || 'bolt://localhost:7687';
    const user = process.env.NEO4J_USER || 'neo4j';
    const password = process.env.NEO4J_PASSWORD || 'princess';

    const driver = neo4j.driver(uri, neo4j.auth.basic(user, password));

    // Verify the connection
    const session = driver.session({ database: 'neo4j' });
    await session.run('RETURN 1 AS test');
    await session.close();

    console.log('✅ Connected to Neo4j successfully');
    return driver;
  } catch (error) {
    console.error('❌ Failed to connect to Neo4j:', error);
    throw error;
  }
};

export default connectNeo4jDB;
