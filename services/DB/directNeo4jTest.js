import neo4j from "neo4j-driver";

// Hardcoded credentials for testing only
const uri = "neo4j+s://2c7eebe4.databases.neo4j.io";
const username = "neo4j";
const password = "princess"; // The password you just set

console.log("Attempting direct connection with hardcoded credentials:");
console.log("URI:", uri);
console.log("Username:", username);
console.log("Password:", "******");

// Create driver with connection options
const driver = neo4j.driver(
  uri,
  neo4j.auth.basic(username, password),
  {
    maxConnectionLifetime: 3 * 60 * 60 * 1000, // 3 hours
    maxConnectionPoolSize: 50,
    connectionAcquisitionTimeout: 2 * 60 * 1000, // 2 minutes
    disableLosslessIntegers: true
  }
);

async function testDirectConnection() {
  let session = null;
  
  try {
    // Test the connection
    session = driver.session();
    console.log("Session created successfully");
    
    // Try a simple query
    const result = await session.run("RETURN 'Connection successful' AS message");
    console.log("✅ Success:", result.records[0].get("message"));
    return true;
  } catch (error) {
    console.error("❌ Connection failed:", error.message);
    console.log("\nPossible issues:");
    console.log("1. Neo4j Aura instance might be paused or deleted");
    console.log("2. IP restrictions might be in place");
    console.log("3. The database might require a different authentication method");
    return false;
  } finally {
    if (session) {
      await session.close();
    }
    await driver.close();
  }
}

// Run the test
testDirectConnection();