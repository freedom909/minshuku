// scripts/insertHostUsers.js
import User from '../models/user.js';
import mongoose from 'mongoose';
import dotenv from 'dotenv';

dotenv.config();

// 初始化 Mongoose 连接
mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/air', {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

// 定义要插入的用户数据
const hostUsers = [
  {
    email: 'host1@example.com',
    password: 'securepassword1',
    name: 'Host One',
    fullName: 'Host One Full',
    firstName: 'Host',
    lastName: 'One',
    nickName: 'Host1',
    role: 'HOST',
    picture: 'https://example.com/host1.jpg',
    provider: 'local',
    oauthId: 'host1-oauth-id',
    sub: 'host1-sub',
  },
  {
    email: 'host2@example.com',
    password: 'securepassword2',
    name: 'Host Two',
    fullName: 'Host Two Full',
    firstName: 'Host',
    lastName: 'Two',
    nickName: 'Host2',
    role: 'HOST',
    picture: 'https://example.com/host2.jpg',
    provider: 'local',
    oauthId: 'host2-oauth-id',
    sub: 'host2-sub',
  },
];

// 插入用户数据
async function insertUsers() {
  try {
    // 测试数据库连接
    mongoose.connection.on('connected', () => {
      console.log('Database connection established successfully.');
    });


    // 同步模型
   // await User.sync({ force: false });

    // 插入用户数据
    const createdUsers = await User.insertMany(hostUsers);

// 生成示例房源（保存到 MySQL）
const listing = {
  title: 'Cozy Apartment in Downtown',
  description: 'A beautiful apartment with all amenities.',
  price: 100,
  location: 'Downtown',
  hostId: 1, // 假设 hostId 为 1
  available: true,
};

await MySQLListing.create(listing);
    console.log(`${createdUsers.length} host users inserted successfully.`);
  } catch (error) {
    console.error('Error inserting host users:', error);
        await mongoose.connection.on('error', (err) => {
      console.error('Database connection error:', err);
    });
;
  } finally {
    // 关闭数据库连接
    await mongoose.connection.close();
    process.exit();
  }
}

// 执行插入操作
insertUsers();