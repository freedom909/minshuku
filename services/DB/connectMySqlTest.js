import dotenv from 'dotenv';
import connectToMySql from './connectMysqlDB.js';
import connectToMongoDB from './connectMongoDB.js';

(async () => {
  try {
    const dotenvResult = await dotenv.config({ path: 'C:\\Users\\omae9\\Desktop\\minshuku\\.env' });
    console.log("Dotenv result:", dotenvResult);
    console.log("Node version:", process.version);
    console.log("CWD:", process.cwd());
    console.log("MONGO_URI:", process.env.MONGO_URI);
    console.log("MONGO_DB_NAME:", process.env.MONGO_DB_NAME);
    console.log("All env variables:", process.env);

    await connectToMongoDB(process.env.MONGO_URI);
    console.log("Done connecting!");
  } catch (e) {
    console.error("Top-level error:", e);
  }
})();
