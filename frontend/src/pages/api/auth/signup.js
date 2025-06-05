// File: frontend/src/pages/api/auth/signup.js
import localAuthService from "@/userService/localAuthService";

export default async function handler(req, res) {
  // Only allow POST requests
  if (req.method !== 'POST') {
    return res.status(405).json({ 
      success: false, 
      message: '只允许POST请求' 
    });
  }

  try {
    const { email, password, name, nickname, picture,role = 'user' } = req.body;

    // Basic validation
    if (!email || !password) {
      return res.status(400).json({ 
        success: false, 
        message: '邮箱和密码是必填项' 
      });
    }

    // Email format validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({ 
        success: false, 
        message: '请输入有效的邮箱地址' 
      });
    }

    // Password validation
    if (password.length < 8) {
      return res.status(400).json({ 
        success: false, 
        message: '密码长度至少为8个字符' 
      });
    }

    // Call the GraphQL service to register the user
    const registrationData = {
      email,
      password,
      name: name || email.split('@')[0], // Use part of email as name if not provided
      nickname: nickname || '',
      role,
      picture: '', // Default empty picture
    };

    // Send registration request to subgraph
    const result = await localAuthService.sendRegisterToSubgraph(registrationData);

    if (!result.success) {
      return res.status(400).json({
        success: false,
        message: result.error || '注册失败'
      });
    }

    // Return success response
    return res.status(201).json({
      success: true,
      message: '注册成功',
      userId: result.userId,
      token: result.auth?.token || '',
      refreshToken: result.refreshToken || ''
    });
  } catch (error) {
    console.error('注册过程中出错:', error);
    return res.status(500).json({
      success: false,
      message: error.message || '服务器错误，请稍后再试'
    });
  }
}