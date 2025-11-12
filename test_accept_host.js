// 测试接受PENDING_HOST用户的脚本

async function testAcceptHost() {
  try {
    console.log('🚀 测试接受PENDING_HOST用户功能...');
    
    // 首先检查chikachan1017@gmail.com的当前状态
    console.log('\\n🔍 检查用户当前状态...');
    
    const checkUserQuery = `
      query GetUser($email: String!) {
        user(email: $email) {
          id
          email
          role
          status
        }
      }
    `;

    const checkVariables = {
      email: 'chikachan1017@gmail.com'
    };

    const checkResponse = await fetch('http://localhost:4010/graphql', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        query: checkUserQuery,
        variables: checkVariables
      })
    });

    if (checkResponse.ok) {
      const result = await checkResponse.json();
      console.log('当前用户状态:', JSON.stringify(result, null, 2));
      
      if (result.data && result.data.user) {
        const userId = result.data.user.id;
        const currentRole = result.data.user.role;
        const currentStatus = result.data.user.status;
        
        console.log(`\\n📋 用户详情:`);
        console.log(`   用户ID: ${userId}`);
        console.log(`   当前角色: ${currentRole}`);
        console.log(`   当前状态: ${currentStatus}`);
        
        // 检查用户是否处于PENDING_HOST状态
        if (currentRole === 'PENDING_HOST' && currentStatus === 'PENDING_HOST_REGISTRATION') {
          console.log('✅ 用户处于PENDING_HOST状态，可以接受为正式房东');
          
          // 执行acceptHost mutation
          await executeAcceptHost(userId);
        } else {
          console.log('⚠️ 用户不处于PENDING_HOST状态，无法接受');
          console.log('💡 请确保用户角色为PENDING_HOST，状态为PENDING_HOST_REGISTRATION');
        }
      }
    } else {
      console.log('❌ 无法获取用户信息，HTTP状态:', checkResponse.status);
    }

  } catch (error) {
    console.error('❌ 测试过程中出错:', error.message);
  }
}

async function executeAcceptHost(userId) {
  try {
    console.log(`\\n🔄 正在接受用户 ${userId} 为正式房东...`);
    
    const acceptHostMutation = `
      mutation AcceptHost($userId: ID!) {
        acceptHost(userId: $userId) {
          code
          success
          message
          user {
            id
            email
            role
            status
          }
        }
      }
    `;

    const variables = { userId: userId };

    const response = await fetch('http://localhost:4010/graphql', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        query: acceptHostMutation,
        variables: variables
      })
    });

    console.log('Mutation响应状态:', response.status);
    
    if (response.ok) {
      const result = await response.json();
      console.log('\\n📤 AcceptHost Mutation响应:');
      console.log(JSON.stringify(result, null, 2));

      if (result.errors) {
        console.log('\\n🔧 错误分析:');
        result.errors.forEach(error => {
          console.log(`- ${error.message}`);
          if (error.extensions && error.extensions.code) {
            console.log(`  错误代码: ${error.extensions.code}`);
          }
        });
      } else if (result.data && result.data.acceptHost) {
        const { code, success, message, user } = result.data.acceptHost;
        console.log(`\\n✅ MUTATION成功!`);
        console.log(`   代码: ${code}`);
        console.log(`   成功: ${success}`);
        console.log(`   消息: ${message}`);
        console.log(`   用户状态: ${user.email} (角色: ${user.role}, 状态: ${user.status})`);
        
        if (user.role === 'HOST' && user.status === 'ACTIVE') {
          console.log(`\\n🎉 成功: 用户已成功接受为正式房东!`);
          console.log(`   之前: PENDING_HOST/PENDING_HOST_REGISTRATION`);
          console.log(`   现在: ${user.role}/${user.status}`);
        }
      }
    } else {
      console.log('❌ HTTP错误:', response.status);
      console.log('响应文本:', await response.text());
    }

  } catch (error) {
    console.error('❌ 执行acceptHost时出错:', error);
  }
}

// 如果GraphQL服务未运行，提供直接MongoDB更新的替代方案
async function directMongoUpdate() {
  try {
    console.log('\\n🔧 尝试直接MongoDB更新...');
    
    const { MongoClient } = await import('mongodb');
    const client = new MongoClient('mongodb://localhost:27017');
    
    await client.connect();
    const airDb = client.db('air');
    const usersCollection = airDb.collection('users');
    
    // 检查用户当前状态
    const user = await usersCollection.findOne({ email: 'chikachan1017@gmail.com' });
    
    if (!user) {
      console.log('❌ 用户不存在');
      return;
    }
    
    console.log('📋 当前用户状态:');
    console.log('   角色:', user.role);
    console.log('   状态:', user.status);
    
    if (user.role === 'PENDING_HOST' && user.status === 'PENDING_HOST_REGISTRATION') {
      console.log('\\n🔄 直接更新用户为HOST...');
      
      const result = await usersCollection.updateOne(
        { email: 'chikachan1017@gmail.com' },
        { 
          $set: { 
            role: 'HOST',
            status: 'ACTIVE',
            updatedAt: new Date()
          }
        }
      );
      
      console.log('✅ 更新结果:');
      console.log('   匹配文档数:', result.matchedCount);
      console.log('   修改文档数:', result.modifiedCount);
      
      if (result.modifiedCount > 0) {
        console.log('\\n🎉 直接更新成功!');
        
        // 验证更新
        const updatedUser = await usersCollection.findOne({ email: 'chikachan1017@gmail.com' });
        console.log('✅ 验证更新:');
        console.log('   新角色:', updatedUser.role);
        console.log('   新状态:', updatedUser.status);
      }
    } else {
      console.log('⚠️ 用户不处于PENDING_HOST状态，无法接受');
    }
    
    await client.close();
    
  } catch (error) {
    console.error('❌ 直接MongoDB更新出错:', error.message);
  }
}

// 主函数
async function main() {
  console.log('==========================================');
  console.log('   接受PENDING_HOST用户测试');
  console.log('==========================================');
  
  // 首先尝试GraphQL API
  await testAcceptHost();
  
  // 如果GraphQL服务未运行，使用直接MongoDB更新
  console.log('\\n💡 如果GraphQL服务未运行，将尝试直接MongoDB更新...');
  await directMongoUpdate();
}

// 运行测试
main().then(() => {
  console.log('\\n✅ 测试完成');
}).catch(error => {
  console.error('❌ 测试失败:', error);
});