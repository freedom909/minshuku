import neo4j from 'neo4j-driver';
import dotenv from 'dotenv';

// Load environment variables from .env file
dotenv.config();

// Log to confirm .env file loading
console.log('NEO4J_URI:', process.env.NEO4J_URI);
console.log('NEO4J_USERNAME:', process.env.NEO4J_USERNAME);
console.log('NEO4J_PASSWORD:', process.env.NEO4J_PASSWORD ? '******' : 'Not Set');

// Ensure environment variables are correctly set
if (!process.env.NEO4J_URI || !process.env.NEO4J_USERNAME || !process.env.NEO4J_PASSWORD) {
  console.error('Missing Neo4j connection details in environment variables');
  process.exit(1);
}

const driver = neo4j.driver(
  process.env.NEO4J_URI, // Ensure this is set correctly in your .env file
  neo4j.auth.basic(process.env.NEO4J_USERNAME, process.env.NEO4J_PASSWORD)
);

driver.getServerInfo()
  .then(() => {
    console.log('Connection established');
  })
  .catch((error) => {
    console.error('Connection error:', error);
  });

export default driver;
