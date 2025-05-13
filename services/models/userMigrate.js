// 移除 MongoDB 相关导入
// import mongoose from 'mongoose';
// import User from './user.js'; 
// const MONGO_URI = 'mongodb://localhost:27017/air'; 

// async function migrate() {
//   try {
//     await mongoose.connect(MONGO_URI);
//     console.log("✅ Connected to MongoDB");

//     const usersToUpdate = await User.find({ providerId: { $exists: true }, oauthId: { $exists: false } });
//     console.log(`ℹ️ Found ${usersToUpdate.length} users to migrate`);

//     if (usersToUpdate.length > 0) {
//       const bulkOps = usersToUpdate.map((user) => ({
//         updateOne: {
//           filter: { _id: user._id },
//           update: { $set: { oauthId: user.providerId }, $unset: { providerId: "" } },
//         },
//       }));

//       const result = await User.bulkWrite(bulkOps);
//       console.log("✅ Migration result:", result);
//     } else {
//       console.log("🎉 No users needed migration.");
//     }

//   } catch (err) {
//     console.error("❌ Migration error:", err);
//   } finally {
//     await mongoose.disconnect();
//     console.log("🔌 Disconnected from MongoDB");
//   }
// }

// migrate();
// 由于不清楚具体业务，这里注释掉相关代码，您可根据实际情况处理
