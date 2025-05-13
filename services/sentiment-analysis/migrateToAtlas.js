// 移除 MongoDB 相关导入
// import { MongoClient } from "mongodb";
import dotenv from "dotenv";
dotenv.config();

// const localUrl = "mongodb://localhost:27017";
// const atlasUrl = process.env.MONGO_URL;
// const dbName = "air";
// console.log("✅ MONGO_URI:", process.env.MONGO_URL);
// async function migrateData() {
//     const localClient = new MongoClient(localUrl);
//     const atlasClient = new MongoClient(atlasUrl);

//     try {
//         await localClient.connect();
//         await atlasClient.connect();
//         console.log("✅ Connected to both MongoDB instances");

//         const localDb = localClient.db(dbName);
//         const atlasDb = atlasClient.db(dbName);

//         const localData = await localDb.collection("sentiments").find({}).toArray();

//         if (localData.length === 0) {
//             console.log("ℹ️ No documents found in local database.");
//             return;
//         }

//         const result = await atlasDb.collection("sentiments").insertMany(localData);
//         console.log(`🚀 Migrated ${result.insertedCount} documents to MongoDB Atlas`);
//     } catch (err) {
//         console.error("❌ Migration error:", err);
//     } finally {
//         await localClient.close();
//         await atlasClient.close();
//     }
// }

// migrateData();
// 由于不清楚具体业务，这里注释掉相关代码，您可根据实际情况处理
