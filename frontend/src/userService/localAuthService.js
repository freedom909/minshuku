import config from '../config/config';
import client from '../lib/apolloClient';
import { SIGN_IN, REGISTER_USER } from '../graphql/auth';

const localAuthService = {
  async authenticate(email, password) {
    try {
      // 基本验证
      if (!email || !password) {
        throw new Error("邮箱和密码不能为空");
      }

      // 邮箱格式验证
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(email)) {
        throw new Error("请输入有效的邮箱地址");
      }

      // 发送登录请求
      const { data } = await client.mutate({
        mutation: SIGN_IN,
        variables: { 
          input: { 
            email, 
            password 
          } 
        },
      });

      // 检查响应数据
      const signInData = data?.signIn;
      if (!signInData) {
        throw new Error("登录响应数据不完整");
      }

      // 检查登录是否成功
      if (!signInData.success || signInData.code !== "SUCCESS") {
        throw new Error(signInData.message || "邮箱或密码错误");
      }

      // 验证认证数据
      if (!signInData.auth?.token) {
        throw new Error("认证数据不完整");
      }

      // 存储认证数据
      if (typeof window !== 'undefined') {
        localStorage.setItem("jwt_token", signInData.auth.token);
        localStorage.setItem("refresh_token", signInData.refreshToken);
        localStorage.setItem("user_id", signInData.userId);
        localStorage.setItem("user_role", signInData.role);
      }

      // 返回与 AuthContext 期望格式匹配的数据
      return {
        success: true,
        token: signInData.auth.token,
        refreshToken: signInData.refreshToken,
        user: {
          id: signInData.userId,
          email: email,
          role: signInData.role
        }
      };

    } catch (error) {
      console.error("Authentication error:", error);
      
      // 根据错误类型返回适当的错误消息
      let errorMessage = "登录失败";
      if (error.message.includes("邮箱") || error.message.includes("密码")) {
        errorMessage = error.message;
      } else if (error.networkError) {
        errorMessage = "网络连接错误，请检查网络连接后重试";
      } else if (error.graphQLErrors?.length > 0) {
        errorMessage = error.graphQLErrors[0].message;
      }

      return {
        success: false,
        message: errorMessage
      };
    }
  },

  async register(data) {
    try {
      const { data: response } = await client.mutate({
        mutation: REGISTER_USER,
        variables: {
          input: {
            email: data.email,
            password: data.password,
            firstName: data.firstName,
            lastName: data.lastName,
            role: data.role
          },
        },
      });

      const signUpData = response?.signUp;
      if (!signUpData || !signUpData.success || signUpData.code !== "SUCCESS") {
        throw new Error(signUpData?.message || "注册失败");
      }

      // 存储认证数据
      if (typeof window !== 'undefined' && signUpData.auth?.token) {
        localStorage.setItem("jwt_token", signUpData.auth.token);
        localStorage.setItem("refresh_token", signUpData.refreshToken);
        localStorage.setItem("user_id", signUpData.userId);
        localStorage.setItem("user_role", signUpData.role);
      }

      return {
        success: true,
        token: signUpData.auth.token,
        refreshToken: signUpData.refreshToken,
        userId: signUpData.userId,
        role: signUpData.role
      };

    } catch (error) {
      console.error("Registration error:", error);
      
      let errorMessage = "注册失败";
      if (error.message.includes("邮箱已存在")) {
        errorMessage = "该邮箱已被注册";
      } else if (error.networkError) {
        errorMessage = "网络连接错误，请检查网络连接后重试";
      } else if (error.graphQLErrors?.length > 0) {
        errorMessage = error.graphQLErrors[0].message;
      }

      return {
        success: false,
        error: errorMessage
      };
    }
  }
};

export default localAuthService;