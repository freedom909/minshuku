// frontend/src/context/AuthContext.jsx
import { createContext, useContext, useState, useEffect } from 'react';

export const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [authState, setAuthState] = useState({
    token: null,
    refreshToken: null,
    userId: null,
    role: null,
    userInfo: null,
    isAuthenticated: false
  });

  // 在组件挂载时从 localStorage 加载认证状态
  useEffect(() => {
    const token = localStorage.getItem('jwt_token');
    const refreshToken = localStorage.getItem('refresh_token');
    const userId = localStorage.getItem('user_id');
    const role = localStorage.getItem('user_role');
    const userInfo = JSON.parse(localStorage.getItem('user') || 'null');

    if (token && userId) {
      setAuthState({
        token,
        refreshToken,
        userId,
        role,
        userInfo,
        isAuthenticated: true
      });
    }
  }, []);

  const login = (authData) => {
    const { token, refreshToken, userId, role, user } = authData;
    
    // 存储认证数据到 localStorage
    localStorage.setItem('jwt_token', token);
    localStorage.setItem('refresh_token', refreshToken);
    localStorage.setItem('user_id', userId);
    localStorage.setItem('user_role', role);
    localStorage.setItem('user', JSON.stringify(user));

    // 更新认证状态
    setAuthState({
      token,
      refreshToken,
      userId,
      role,
      userInfo: user,
      isAuthenticated: true
    });
  };

  const logout = () => {
    // 清除 localStorage 中的认证数据
    localStorage.removeItem('jwt_token');
    localStorage.removeItem('refresh_token');
    localStorage.removeItem('user_id');
    localStorage.removeItem('user_role');
    localStorage.removeItem('user');

    // 重置认证状态
    setAuthState({
      token: null,
      refreshToken: null,
      userId: null,
      role: null,
      userInfo: null,
      isAuthenticated: false
    });
  };

  const updateUserInfo = (newUserInfo) => {
    localStorage.setItem('user', JSON.stringify(newUserInfo));
    setAuthState(prev => ({
      ...prev,
      userInfo: newUserInfo
    }));
  };

  return (
    <AuthContext.Provider 
      value={{ 
        ...authState, 
        login, 
        logout,
        updateUserInfo,
        isAuthenticated: authState.isAuthenticated 
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}