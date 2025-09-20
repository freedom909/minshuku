import neo4j from "neo4j-driver";
import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";

// Load environment variables
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.join(__dirname, '../../.env') });

// Connection parameters with fallbacks
const uri = process.env.NEO4J_URI || "neo4j+s://2c7eebe4.databases.neo4j.io";
const user = process.env.NEO4J_USERNAME || "neo4j";
const password = process.env.NEO4J_PASSWORD || "";

// Create driver with improved error handling
let driver = null;

try {
  // Connection options for better reliability
  const connectionOptions = {
    maxConnectionLifetime: 3 * 60 * 60 * 1000, // 3 hours
    maxConnectionPoolSize: 50,
    connectionAcquisitionTimeout: 2 * 60 * 1000, // 2 minutes
    disableLosslessIntegers: true
  };

  driver = neo4j.driver(uri, neo4j.auth.basic(user, password), connectionOptions);
  
  // Verify connection on startup
  const verifyConnectivity = async () => {
    try {
      await driver.verifyConnectivity();
      console.log("Neo4j connection verified successfully");
    } catch (error) {
      console.error("Neo4j connection verification failed:", error.message);
      if (error.code === "Neo.ClientError.Security.Unauthorized") {
        console.error("Authentication failed. Please check your Neo4j credentials in the .env file.");
        console.error("You may need to reset your password in the Neo4j Aura console.");
      }
    }
  };
  
  // Run verification but don't block exports
  verifyConnectivity();
  
} catch (error) {
  console.error("Failed to create Neo4j driver:", error.message);
}

// Helper function to get a session with error handling
export const getSession = () => {
  if (!driver) {
    throw new Error("Neo4j driver is not initialized. Check connection parameters.");
  }
  return driver.session();
};

// Function to close the driver when the application shuts down
export const closeDriver = async () => {
  if (driver) {
    await driver.close();
    console.log("Neo4j driver closed");
  }
};

// Export the driver for direct use if needed
export default driver;
