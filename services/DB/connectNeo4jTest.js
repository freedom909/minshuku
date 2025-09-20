import dotenv from "dotenv";
import neo4j from "neo4j-driver";

// Load .env file
dotenv.config({ path: "../../.env" });

// Log connection parameters for debugging (mask password)
console.log("Connection parameters:");
console.log("URI:", process.env.NEO4J_URI);
console.log("Username:", process.env.NEO4J_USERNAME);
console.log("Password:", process.env.NEO4J_PASSWORD ? "******" : "Not set");

// Create driver with more connection options
const driver = neo4j.driver(
  process.env.NEO4J_URI,
  neo4j.auth.basic(process.env.NEO4J_USERNAME, process.env.NEO4J_PASSWORD),
  {
    maxConnectionLifetime: 3 * 60 * 60 * 1000, // 3 hours
    maxConnectionPoolSize: 50,
    connectionAcquisitionTimeout: 2 * 60 * 1000, // 2 minutes
    disableLosslessIntegers: true
  }
);

const testConnection = async () => {
  try {
    const session = driver.session();
    const result = await session.run("RETURN 1 AS number");
    console.log("✅ Connected, got:", result.records[0].get("number"));
    await session.close();
  } catch (error) {
    console.error("❌ Connection error:", error);
  } finally {
    await driver.close();
  }
};

testConnection();
