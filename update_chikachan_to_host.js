// 将chikachan1017@gmail.com转换为PENDING_HOST状态
import { MongoClient } from 'mongodb';

async function updateUserToHost() {
  const uri = 'mongodb://localhost:27017';
  const client = new MongoClient(uri);

  try {
    console.log('🔗 连接到MongoDB...');
    await client.connect();
    console.log('✅ 已连接到MongoDB');
    
    const airDb = client.db('air');
    const usersCollection = airDb.collection('users');
    
    // 首先检查用户当前状态
    console.log('\\n🔍 检查用户当前状态...');
    const currentUser = await usersCollection.findOne({ email: 'chikachan1017@gmail.com' });
    
    if (!currentUser) {
      console.log('❌ 用户chikachan1017@gmail.com不存在');
      return;
    }
    
    console.log('📋 当前用户详情:');
    console.log('   邮箱:', currentUser.email);
    console.log('   当前角色:', currentUser.role);
    console.log('   当前状态:', currentUser.status || 'undefined');
    console.log('   提供商:', currentUser.provider);
    
    // 更新用户角色和状态
    console.log('\\n🔄 正在更新用户状态...');
    const result = await usersCollection.updateOne(
      { email: 'chikachan1017@gmail.com' },
      { 
        $set: { 
          role: 'PENDING_HOST',
          status: 'PENDING_HOST_REGISTRATION',
          updatedAt: new Date()
        }
      }
    );
    
    console.log('✅ 更新结果:');
    console.log('   匹配文档数:', result.matchedCount);
    console.log('   修改文档数:', result.modifiedCount);
    
    if (result.modifiedCount > 0) {
      console.log('\\n🎉 用户状态更新成功!');
      
      // 验证更新
      console.log('\\n✅ 验证更新结果...');
      const updatedUser = await usersCollection.findOne({ email: 'chikachan1017@gmail.com' });
      console.log('   新角色:', updatedUser.role);
      console.log('   新状态:', updatedUser.status);
      console.log('   更新时间:', updatedUser.updatedAt);
      
      console.log('\\n📊 状态转换完成:');
      console.log('   之前: USER -> 现在:', updatedUser.role);
      console.log('   之前: undefined -> 现在:', updatedUser.status);
      
    } else {
      console.log('⚠️ 用户状态未改变（可能已经是目标状态）');
    }
    
  } catch (error) {
    console.error('❌ 更新用户时出错:', error.message);
  } finally {
    await client.close();
    console.log('\\n🔌 已断开与MongoDB的连接');
  }
}

// 运行更新
updateUserToHost().then(() => {
  console.log('\\n✅ 更新过程完成');
}).catch(error => {
  console.error('❌ 更新过程失败:', error);
});