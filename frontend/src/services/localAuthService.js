import client from '../lib/apolloClient';
import { SIGN_IN } from '../graphql/auth';

class LocalAuthService {
  constructor() {
    this.token = null;
    this.userId = null;
    this.role = null;
    
    // 如果在浏览器环境，从 localStorage 初始化
    if (typeof window !== 'undefined') {
      this.token = localStorage.getItem('jwt_token');
      this.userId = localStorage.getItem('user_id');
      this.role = localStorage.getItem('user_role');
    }
  }

  // 认证用户
  async authenticate(email, password) {
    try {
      const { data } = await client.mutate({
        mutation: SIGN_IN,
        variables: {
          input: {
            email,
            password,
          },
        },
      });

      const response = data.signIn;

      if (!response.success) {
        return {
          success: false,
          message: response.message || '登录失败',
        };
      }

      return this.handleLoginResponse(response);
    } catch (error) {
      console.error('Authentication error:', error);
      
      // 处理具体的 GraphQL 错误
      if (error.graphQLErrors?.length > 0) {
        const graphQLError = error.graphQLErrors[0];
        return {
          success: false,
          message: graphQLError.message || '登录失败',
        };
      }

      // 处理网络错误
      if (error.networkError) {
        return {
          success: false,
          message: '网络错误，请检查您的网络连接',
        };
      }

      return {
        success: false,
        message: '登录失败，请稍后重试',
      };
    }
  }

  // 处理登录响应
  handleLoginResponse(response) {
    if (!response.auth?.token) {
      return {
        success: false,
        message: '登录失败：未收到有效的认证信息',
      };
    }

    const { token, userId, role } = response.auth;

    // 保存认证信息
    this.setAuthInfo(token, userId, role);

    return {
      success: true,
      user: {
        id: userId,
        role: role,
      },
    };
  }

  // 设置认证信息
  setAuthInfo(token, userId, role) {
    this.token = token;
    this.userId = userId;
    this.role = role;

    if (typeof window !== 'undefined') {
      localStorage.setItem('jwt_token', token);
      localStorage.setItem('user_id', userId);
      localStorage.setItem('user_role', role);
    }
  }

  // 清除认证信息
  clearAuthInfo() {
    this.token = null;
    this.userId = null;
    this.role = null;

    if (typeof window !== 'undefined') {
      localStorage.removeItem('jwt_token');
      localStorage.removeItem('user_id');
      localStorage.removeItem('user_role');
    }
  }

  // 检查是否已认证
  isAuthenticated() {
    return !!this.token;
  }

  // 获取当前用户ID
  getCurrentUserId() {
    return this.userId;
  }

  // 获取当前用户角色
  getCurrentUserRole() {
    return this.role;
  }

  // 获取认证token
  getToken() {
    return this.token;
  }
}

// 创建单例实例
const localAuthService = new LocalAuthService();

export default localAuthService;