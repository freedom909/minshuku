// services/sentiment-analysis/db/connectNeo4j.js
import neo4j from "neo4j-driver";
import dotenv from "dotenv";

dotenv.config();

export const driver = neo4j.driver(
  process.env.NEO4J_URL || "bolt://localhost:7687",
  neo4j.auth.basic(process.env.NEO4J_USERNAME, process.env.NEO4J_PASSWORD)
);

export const getNeo4jSession = () => {
  return driver.session();
};

export const closeNeo4jSession = (session) => {
  if (session) {
    session.close();
  }
};
