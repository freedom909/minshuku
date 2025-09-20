import dotenv from "dotenv";
import neo4j from "neo4j-driver";

// Load environment variables
dotenv.config({ path: "../../.env" });

// Extract Neo4j credentials
const uri = process.env.NEO4J_URI;
const username = process.env.NEO4J_USERNAME;
const password = process.env.NEO4J_PASSWORD;

console.log("Attempting to connect to Neo4j with:");
console.log("URI:", uri);
console.log("Username:", username);
console.log("Password:", password ? "******" : "Not set");

// Create a simple driver instance
const driver = neo4j.driver(
  uri,
  neo4j.auth.basic(username, password)
);

async function verifyConnection() {
  let session = null;
  
  try {
    // Test the connection
    session = driver.session();
    console.log("Session created successfully");
    
    // Try a simple query
    const result = await session.run("RETURN 'Connection successful' AS message");
    console.log("Query result:", result.records[0].get("message"));
    
    console.log("✅ Neo4j connection verified successfully!");
    return true;
  } catch (error) {
    console.error("❌ Neo4j connection failed:", error.message);
    
    // Provide troubleshooting advice
    console.log("\nTroubleshooting steps:");
    console.log("1. Verify your Neo4j Aura credentials in the .env file");
    console.log("2. Check if your Neo4j Aura instance is running");
    console.log("3. Ensure your IP is allowed in Neo4j Aura's connection settings");
    console.log("4. Try regenerating the password in Neo4j Aura console");
    
    return false;
  } finally {
    if (session) {
      await session.close();
    }
    await driver.close();
  }
}

// Run the verification
verifyConnection();