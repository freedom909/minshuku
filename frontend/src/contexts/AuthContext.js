'use client';
import React, { createContext, useState, useContext, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import localAuthService from '../services/localAuthService';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [authState, setAuthState] = useState({
    token: null,
    userId: null,
    role: null,
    user: null,
    isAuthenticated: false
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const router = useRouter();

  // 在组件挂载时从 localStorage 加载认证状态
  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = async () => {
    try {
      if (typeof window !== 'undefined') {
        const token = localAuthService.getToken();
        const userId = localAuthService.getCurrentUserId();
        const role = localAuthService.getCurrentUserRole();

        if (token && userId) {
          setAuthState({
            token,
            userId,
            role,
            user: {
              id: userId,
              role: role
            },
            isAuthenticated: true
          });
        }
      }
    } catch (err) {
      console.error('Auth check failed:', err);
    } finally {
      setLoading(false);
    }
  };

  const login = async (email, password) => {
    setLoading(true);
    setError(null);

    try {
      const result = await localAuthService.authenticate(email, password);
      
      if (result.success) {
        // 更新认证状态
        setAuthState({
          token: localAuthService.getToken(),
          userId: result.user.id,
          role: result.user.role,
          user: result.user,
          isAuthenticated: true
        });
        
        router.push('/dashboard');
        return { success: true };
      } else {
        setError(result.message);
        return { 
          success: false, 
          message: result.message
        };
      }
    } catch (err) {
      const errorMessage = err.message || '登录过程中发生错误';
      setError(errorMessage);
      return { 
        success: false, 
        message: errorMessage 
      };
    } finally {
      setLoading(false);
    }
  };

  const logout = () => {
    try {
      // 清除认证服务中的数据
      localAuthService.clearAuthInfo();

      // 重置认证状态
      setAuthState({
        token: null,
        userId: null,
        role: null,
        user: null,
        isAuthenticated: false
      });
      setError(null);

      // 重定向到登录页面
      router.push('/login');
    } catch (err) {
      console.error('Logout failed:', err);
      setError('登出失败');
    }
  };

  const updateUser = (userData) => {
    setAuthState(prev => ({
      ...prev,
      user: userData
    }));
  };

  return (
    <AuthContext.Provider value={{
      ...authState,
      loading,
      error,
      login,
      logout,
      updateUser
    }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};