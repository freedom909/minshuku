import neo4j from 'neo4j-driver';

import { auth } from 'neo4j-driver';
import dotenv from 'dotenv';
dotenv.config();

const driver = neo4j.driver(
  process.env.NEO4J_URI, //TypeError: "Bolt URL" expected to be string but was: undefined
  auth.basic(process.env.NEO4J_USERNAME, process.env.NEO4J_PASSWORD)
);

driver.getServerInfo ()
  .then(() => {
    console.log('Connection established');
  })
  .catch((error) => {
    console.error('Connection error:', error);
  });

export default driver;
