import neo4j from 'neo4j-driver';
import dotenv from 'dotenv';

dotenv.config();

const driver = neo4j.driver(
  process.env.NEO4J_URI, // Ensure this is set correctly in your .env file
  neo4j.auth.basic(process.env.NEO4J_USERNAME, process.env.NEO4J_PASSWORD)
);

driver.getServerInfo()
  .then(() => {
    console.log('NEO4J_URI:', process.env.NEO4J_URI);
    console.log('NEO4J_USERNAME:', process.env.NEO4J_USERNAME);
    console.log('NEO4J_PASSWORD:', process.env.NEO4J_PASSWORD);
    console.log('NEO4J_PASSWORD:', process.env.NEO4J_PASSWORD ? '******' : 'Not Set');
    console.log('Connection established');
  })
  .catch((error) => {
    console.error('Connection error:', error);
  });

export default driver;
