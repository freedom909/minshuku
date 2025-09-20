import driver, { getSession, closeDriver } from './connectNeo4jDB.js';

async function testConnection() {
  console.log("Testing Neo4j connection with updated implementation...");
  
  if (!driver) {
    console.error("Driver initialization failed. Check previous error messages.");
    return;
  }
  
  let session = null;
  try {
    // Get a session using our helper function
    session = getSession();
    console.log("Session created successfully");
    
    // Try a simple query
    const result = await session.run("RETURN 'Connection test' AS message");
    console.log(`Query result: ${result.records[0].get("message")}`);
    console.log("Connection test successful!");
  } catch (error) {
    console.error("Connection test failed:", error.message);
    console.error("Error code:", error.code || "N/A");
    
    // Provide guidance based on error
    if (error.code === "Neo.ClientError.Security.Unauthorized") {
      console.log("\nTo fix authentication issues:");
      console.log("1. Log in to Neo4j Aura console: https://console.neo4j.io/");
      console.log("2. Check if your database instance is active");
      console.log("3. Reset your password if needed");
      console.log("4. Update your .env file with the new credentials");
      console.log("5. Run the updateNeo4jCredentials.js script to update credentials");
    }
  } finally {
    if (session) await session.close();
    await closeDriver();
  }
}

// Run the test
testConnection();