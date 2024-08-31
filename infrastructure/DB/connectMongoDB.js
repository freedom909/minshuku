import pkg from 'mongodb';
const { MongoClient } = pkg;
import dotenv from 'dotenv';
dotenv.config();


<<<<<<< HEAD
const mongoUrl=process.env.MONGODB_URL ||'mongodb://localhost:27017';
const client = new MongoClient(mongoUrl);
console.log('MONGODB_URL:', mongoUrl);
=======
const mongoUrl=process.env.MONGODB_URL||'mongodb://localhost:27017';
const client = new MongoClient(mongoUrl);
console.log('MONGODB_URL:', process.env.MONGODB_URL);
>>>>>>> d5a7c2663de4fded6aadcab540dbc2b7276f7f65
const dbName=process.env.DB_NAME;
console.log('DB_NAME:', process.env.DB_NAME);
let mongodb;
async function connectToMongoDB() {
 if (!mongodb) {
  await client.connect();
  console.log('Connected to MongoDB');
  mongodb= client.db(dbName);
 
 }
 return mongodb;
}

export default connectToMongoDB;
