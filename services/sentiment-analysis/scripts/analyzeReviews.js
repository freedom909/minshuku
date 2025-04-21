import axios from 'axios';
import dotenv from 'dotenv';
import neo4j from 'neo4j-driver';

dotenv.config();

const FASTAPI_URL = "http://localhost:8000/classify/";

async function analyzeReviews() {
  // Connect to Neo4j
  const driver = neo4j.driver(
    process.env.NEO4J_URI || "bolt://localhost:7687",
    neo4j.auth.basic(
      process.env.NEO4J_USERNAME,
      process.env.NEO4J_PASSWORD
    )
  );
  const session = driver.session();

  const result = await session.run(
    'MATCH (r:Review) WHERE r.sentiment IS NULL RETURN r LIMIT 100'
  );

  for (const record of result.records) {
    const review = record.get('r');
    const content = review.properties.content;

    try {
      const res = await axios.get(`${FASTAPI_URL}?text=${encodeURIComponent(content)}`);
      const { label, score } = res.data;

      await session.run(
        'MATCH (r:Review) WHERE ID(r) = $id SET r.sentiment = $label, r.sentimentScore = $score',
        {
          id: review.identity.low, // or review.identity if it's a string
          label,
          score,
        }
      );

      console.log(`Analyzed Review ${review.properties.title}: ${label} (${score})`);
    } catch (error) {
      console.error(`Failed to analyze review "${review.properties.title}":`, error.message);
    }
  }

  await session.close();
  console.log("✅ Done analyzing reviews");
}

analyzeReviews();
