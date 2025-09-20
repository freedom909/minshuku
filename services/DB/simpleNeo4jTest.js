import neo4j from "neo4j-driver";

// Hardcoded credentials for testing
const uri = "neo4j+s://2c7eebe4.databases.neo4j.io";
const username = "neo4j";
const password = "princess"; // Your reset password

async function testNeo4j() {
  console.log("Testing Neo4j connection with hardcoded credentials");
  console.log(`URI: ${uri}`);
  console.log(`Username: ${username}`);
  console.log(`Password: ${"*".repeat(password.length)}`);
  
  let driver = null;
  let session = null;
  
  try {
    // Create driver with basic configuration
    driver = neo4j.driver(
      uri, 
      neo4j.auth.basic(username, password),
      { disableLosslessIntegers: true }
    );
    
    console.log("Driver created successfully");
    
    // Test connectivity
    await driver.verifyConnectivity();
    console.log("✅ Connectivity verified successfully");
    
    // Create session and run a simple query
    session = driver.session();
    console.log("✅ Session created successfully");
    
    const result = await session.run("RETURN 'Connection successful' AS message");
    console.log(`✅ Query result: ${result.records[0].get("message")}`);
    
  } catch (error) {
    console.error(`❌ Error: ${error.message}`);
    console.error(`Error code: ${error.code || "N/A"}`);
    
    // Provide troubleshooting guidance
    console.log("\nTroubleshooting steps:");
    console.log("1. Verify the Neo4j Aura instance is running");
    console.log("2. Check if the password was reset correctly");
    console.log("3. Try using the Neo4j Browser to connect with the same credentials");
    console.log("4. Check if there are any IP restrictions on your Neo4j Aura instance");
  } finally {
    if (session) await session.close();
    if (driver) await driver.close();
  }
}

// Run the test
testNeo4j();