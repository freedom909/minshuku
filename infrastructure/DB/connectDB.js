import pkg from 'mongodb';
const {MongoClient} = pkg;

const uri='mongodb+srv://chika:13GhspHKakjX4UPx@cluster0.lidru.mongodb.net/' ;
const dbName=process.env.DB_NAME ||'air';

let db;

export async function connectToDatabase() {
  if (!db) {
    const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true });
    await client.connect();
    db = client.db(dbName);
  }
  return db;
}

