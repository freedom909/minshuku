import neo4j from "neo4j-driver";

// Test multiple connection configurations
async function testNeo4jConnections() {
  console.log("=== COMPREHENSIVE NEO4J CONNECTION TEST ===");
  
  // Original credentials from .env
  const originalUri = "neo4j+s://2c7eebe4.databases.neo4j.io";
  const originalUsername = "neo4j";
  const originalPassword = "ybzaZ3pFNSmVRWtA6njU26FQbPZMrA-wX6YeIgrTOv0";
  
  // Updated credentials
  const updatedPassword = "princess";
  
  // Alternative connection format
  const alternativeUri = "neo4j://2c7eebe4.databases.neo4j.io";
  
  // Test configurations
  const testConfigs = [
    {
      name: "Original credentials (from .env)",
      uri: originalUri,
      auth: neo4j.auth.basic(originalUsername, originalPassword),
      options: {}
    },
    {
      name: "Updated credentials",
      uri: originalUri,
      auth: neo4j.auth.basic(originalUsername, updatedPassword),
      options: {}
    },
    {
      name: "Original credentials with connection options",
      uri: originalUri,
      auth: neo4j.auth.basic(originalUsername, originalPassword),
      options: {
        maxConnectionLifetime: 3 * 60 * 60 * 1000,
        maxConnectionPoolSize: 50,
        connectionAcquisitionTimeout: 2 * 60 * 1000,
        disableLosslessIntegers: true
      }
    },
    {
      name: "Alternative URI format with original credentials",
      uri: alternativeUri,
      auth: neo4j.auth.basic(originalUsername, originalPassword),
      options: {}
    }
  ];
  
  // Run tests
  for (const config of testConfigs) {
    console.log(`\n\nTesting: ${config.name}`);
    console.log(`URI: ${config.uri}`);
    console.log(`Username: ${originalUsername}`);
    console.log(`Password: ${"*".repeat(8)}`);
    console.log(`Options: ${Object.keys(config.options).length > 0 ? "Custom" : "Default"}`);
    
    const driver = neo4j.driver(
      config.uri,
      config.auth,
      config.options
    );
    
    let session = null;
    try {
      session = driver.session();
      console.log("✅ Session created successfully");
      
      const result = await session.run("RETURN 'Connection successful' AS message");
      console.log(`✅ Query successful: ${result.records[0].get("message")}`);
    } catch (error) {
      console.error(`❌ Error: ${error.message}`);
      if (error.code) {
        console.error(`Error code: ${error.code}`);
      }
    } finally {
      if (session) await session.close();
      await driver.close();
    }
  }
  
  console.log("\n\n=== TEST COMPLETE ===");
  console.log("If all tests failed, please check:");
  console.log("1. Neo4j Aura console to verify instance is running");
  console.log("2. Reset password in Neo4j Aura console");
  console.log("3. Check for IP restrictions");
  console.log("4. Verify database name and connection details");
}

// Run the tests
testNeo4jConnections();