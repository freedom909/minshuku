import React, { createContext, useState, useContext, useEffect } from 'react';
import axios from 'axios';
import { useRouter } from 'next/navigation'; // 替换为 Next.js 的 useRouter

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const router = useRouter(); // 使用 useRouter 替代 useNavigate

  // 从 localStorage 初始化用户
  useEffect(() => {
    try {
      const token = localStorage.getItem('token');
      if (token) {
        // 这里可以添加验证 token 有效性的逻辑
        // 为简化示例，我们假设存在 token 即表示已登录
        setLoading(false);
      } else {
        setLoading(false);
      }
    } catch (err) {
      console.error("Auth init error:", err);
      setLoading(false);
    }
  }, []);

  const login = async (email, password) => {
    setLoading(true);
    setError(null);
    try {
      const operations = {
        query: `
          mutation SignIn($input: SignInInput!) {
            signIn(input: $input) {
              code
              role
              userId
              success
              message
              auth {
                userId
                token
                role
                accessToken 
              }
            }
          }
        `,
        variables: {
          input: { email, password }
        }
      };

      const response = await axios.post('/graphql', operations);

      if (response.data.errors) {
        throw new Error(response.data.errors[0].message);
      }

      const signInResult = response.data.data.signIn;

      if (!signInResult.success || !signInResult.auth) {
        let feedback = '登录失败，请检查邮箱和密码是否正确';
        if (signInResult.code === 'USER_NOT_FOUND') {
          feedback = '此邮箱尚未注册，请先注册账号';
        } else if (signInResult.code === 'INVALID_PASSWORD') {
          feedback = '密码错误，请重试';
        }
        throw new Error(feedback);
      }

      const { token, userId, role } = signInResult.auth;

      localStorage.setItem('token', token);
      // 创建用户对象，确保包含 name 属性
      const userData = {
        userId,
        role,
        name: `User ${userId}` // 实际应用中应从 API 获取真实姓名
      };
      setUser(userData);

      router.push('/dashboard'); // 使用 router.push 替代 navigate

      return { success: true, user: userData };
    } catch (err) {
      setError(err.response?.data?.errors?.[0]?.message || err.message || 'Login failed');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // 对 register 方法进行类似修改
  const register = async (formData) => {
    setLoading(true);
    setError(null);
    try {
      // 省略部分代码...

      // 成功后重定向
      router.push('/dashboard'); // 使用 router.push 替代 navigate

      return user;
    } catch (err) {
      setError(err.response?.data?.errors?.[0]?.message || err.message || 'Registration failed');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthContext.Provider value={{
      user,
      loading,
      error,
      register,
      login
    }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);