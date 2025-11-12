// 列出MongoDB数据库中的所有用户

import { MongoClient } from 'mongodb';

async function listUsers() {
  const uri = 'mongodb://localhost:27017';
  const client = new MongoClient(uri);

  try {
    console.log('🔗 连接到MongoDB...');
    await client.connect();
    console.log('✅ 已连接到MongoDB');
    
    const database = client.db('minshuku');
    const users = database.collection('users');
    
    // 获取所有用户
    const allUsers = await users.find({}).toArray();
    
    console.log(`\n📊 在数据库中找到 ${allUsers.length} 个用户:`);
    console.log('==========================================');
    
    allUsers.forEach((user, index) => {
      console.log(`\n${index + 1}. 邮箱: ${user.email || 'N/A'}`);
      console.log(`   角色: ${user.role || 'N/A'}`);
      console.log(`   状态: ${user.status || 'N/A'}`);
      console.log(`   提供商: ${user.provider || 'N/A'}`);
      if (user.password) {
        console.log(`   有密码: 是 (长度: ${user.password.length})`);
      } else {
        console.log(`   有密码: 否`);
      }
    });
    
  } catch (error) {
    console.error('❌ 错误:', error.message);
  } finally {
    await client.close();
    console.log('🔌 已断开与MongoDB的连接');
  }
}

// 运行列出用户
listUsers().then(() => {
  console.log('\n✅ 用户列表完成');
}).catch(error => {
  console.error('❌ 列出用户失败:', error);
});