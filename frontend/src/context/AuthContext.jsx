import React, { createContext, useState, useEffect, useContext } from 'react';
import { useApolloClient } from '@apollo/client';
import { useMutation } from '@apollo/client';
import { OAUTH_LOGIN_MUTATION } from '../graphql/auth';

const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [token, setToken] = useState(localStorage.getItem('authToken'));
  const [userId, setUserId] = useState(localStorage.getItem('userId'));
  const [userInfo, setUserInfo] = useState(
    JSON.parse(localStorage.getItem('userInfo') || 'null')
  );
  const client = useApolloClient();
  const [oauthLoginMutation] = useMutation(OAUTH_LOGIN_MUTATION);

  const login = (newToken, newUserId, userData = null) => {
    localStorage.setItem('authToken', newToken);
    localStorage.setItem('userId', newUserId);
    setToken(newToken);
    setUserId(newUserId);
    
    if (userData) {
      localStorage.setItem('userInfo', JSON.stringify(userData));
      setUserInfo(userData);
    }
  };

  const handleOAuthLogin = async (provider, token) => {
    try {
      const { data } = await oauthLoginMutation({
        variables: {
          input: {
            provider,
            token
          }
        }
      });

      if (data?.oauthLogin) {
        login(
          data.oauthLogin.token,
          data.oauthLogin.userId,
          {
            email: data.oauthLogin.email,
            name: data.oauthLogin.name,
            picture: data.oauthLogin.picture
          }
        );
        return true;
      }
    } catch (error) {
      console.error('OAuth login failed:', error);
      return false;
    }
  };

  const logout = () => {
    localStorage.removeItem('authToken');
    localStorage.removeItem('userId');
    localStorage.removeItem('userInfo');
    setToken(null);
    setUserId(null);
    setUserInfo(null);
    client.clearStore();
  };

  // Check for existing session on mount
  useEffect(() => {
    if (token && !userInfo) {
      // Optionally fetch user info if missing
    }
  }, [token, userInfo]);

  return (
    <AuthContext.Provider
      value={{
        token,
        userId,
        userInfo,
        isAuthenticated: !!token,
        login,
        handleOAuthLogin,
        logout
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}