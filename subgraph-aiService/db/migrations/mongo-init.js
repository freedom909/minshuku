import { MongoClient } from 'mongodb';
const uri = process.env.MONGODB_URI || 'mongodb://localhost:27017/air';

async function run() {
  const client = new MongoClient(uri);
  try {
    await client.connect();
    const db = client.db("air");
    await db.createCollection("ai_conversations", {
      validator: {
        $jsonSchema: {
          bsonType: "object",
          required: ["user_message", "ai_response"],
          properties: {
            user_id: { bsonType: "string" },
            user_message: { bsonType: "string" },
            ai_response: { bsonType: "string" },
            created_at: { bsonType: "date" }
          }
        }
      }
    });
    console.log("Collection created successfully");
  } finally {
    await client.close();
  }
}

run().catch(console.dir);