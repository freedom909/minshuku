// 检查数据库状态
import { MongoClient } from 'mongodb';

async function checkDatabase() {
  const uri = 'mongodb://localhost:27017';
  const client = new MongoClient(uri);

  try {
    console.log('🔗 连接到MongoDB...');
    await client.connect();
    console.log('✅ 已连接到MongoDB');
    
    // 列出所有数据库
    const adminDb = client.db().admin();
    const databases = await adminDb.listDatabases();
    
    console.log('\\n📊 可用的数据库:');
    databases.databases.forEach(db => {
      console.log(`- ${db.name}`);
    });
    
    // 检查air数据库
    const airDb = client.db('air');
    const collections = await minshukuDb.listCollections().toArray();
    
    console.log('\\n📋 minshuku数据库中的集合:');
    if (collections.length === 0) {
      console.log('   (空数据库)');
    } else {
      collections.forEach(col => {
        console.log(`- ${col.name}`);
      });
    }
    
    // 检查users集合
    const usersCollection = minshukuDb.collection('users');
    const userCount = await usersCollection.countDocuments();
    console.log(`\\n👥 users集合中的用户数量: ${userCount}`);
    
    if (userCount > 0) {
      console.log('\\n📝 用户列表:');
      const users = await usersCollection.find({}).limit(10).toArray();
      users.forEach((user, index) => {
        console.log(`${index + 1}. ${user.email || 'N/A'} (角色: ${user.role || 'N/A'})`);
      });
    }
    
  } catch (error) {
    console.error('❌ 错误:', error.message);
  } finally {
    await client.close();
    console.log('\\n🔌 已断开与MongoDB的连接');
  }
}

checkDatabase().catch(console.error);