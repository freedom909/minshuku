// 检查air数据库状态
import { MongoClient } from 'mongodb';

async function checkDatabase() {
  const uri = 'mongodb://localhost:27017';
  const client = new MongoClient(uri);

  try {
    console.log('🔗 连接到MongoDB...');
    await client.connect();
    console.log('✅ 已连接到MongoDB');
    
    // 检查air数据库
    const airDb = client.db('air');
    const collections = await airDb.listCollections().toArray();
    
    console.log('\\n📋 air数据库中的集合:');
    if (collections.length === 0) {
      console.log('   (空数据库)');
    } else {
      collections.forEach(col => {
        console.log(`- ${col.name}`);
      });
    }
    
    // 检查users集合
    const usersCollection = airDb.collection('users');
    const userCount = await usersCollection.countDocuments();
    console.log(`\\n👥 users集合中的用户数量: ${userCount}`);
    
    if (userCount > 0) {
      console.log('\\n📝 用户列表:');
      const users = await usersCollection.find({}).limit(20).toArray();
      users.forEach((user, index) => {
        console.log(`${index + 1}. 邮箱: ${user.email || 'N/A'}`);
        console.log(`   角色: ${user.role || 'N/A'}`);
        console.log(`   状态: ${user.status || 'N/A'}`);
        console.log(`   提供商: ${user.provider || 'N/A'}`);
        if (user.password) {
          console.log(`   有密码: 是`);
        } else {
          console.log(`   有密码: 否`);
        }
        console.log('');
      });
    }
    
    // 特别检查chikachan1017@gmail.com用户
    console.log('\\n🔍 特别检查chikachan1017@gmail.com:');
    const targetUser = await usersCollection.findOne({ email: 'chikachan1017@gmail.com' });
    if (targetUser) {
      console.log('✅ 找到用户:');
      console.log('   邮箱:', targetUser.email);
      console.log('   角色:', targetUser.role);
      console.log('   状态:', targetUser.status);
      console.log('   提供商:', targetUser.provider);
    } else {
      console.log('❌ 用户chikachan1017@gmail.com不存在');
    }
    
  } catch (error) {
    console.error('❌ 错误:', error.message);
  } finally {
    await client.close();
    console.log('\\n🔌 已断开与MongoDB的连接');
  }
}

checkDatabase().catch(console.error);