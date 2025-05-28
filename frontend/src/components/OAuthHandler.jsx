//frontend/src/components/OAuthHandler.jsx
// 'use client';
import React, { useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import OAuthService from '../userService/oauthService';

const providerInfo = {
  google: {
    tokenKey: 'googleToken',
  },
  github: {
    tokenKey: 'githubToken',
  },
  facebook: {
    tokenKey: 'facebookToken',
  },
  twitter: {
    tokenKey: 'twitterToken',
  },
};

const OAuthHandler = ({ code }) => {
  const navigate = useNavigate();
  
  const oauthService = useMemo(() => new OAuthService(), []);

  useEffect(() => {
    const authenticateWithSubgraph = async () => {
      try {
        // Detect which provider token is available
        const provider = Object.keys(providerInfo).find((p) => code[providerInfo[p].tokenKey]);

        if (!provider) {
          throw new Error('No valid OAuth provider token found');
        }

        const token = code[providerInfo[provider].tokenKey];

        // 构造用户数据对象
        const userData = {
          email: code.email || '',
          name: code.name || '',
          image: code.picture || '',
          provider: provider,
          accessToken: token, // 确保这里是正确的 token 键名 idToken?
          id: code.sub || code.id || ''
        };

        // 使用 oauthService 发送认证请求
        const authResponse = await oauthService.signIn(userData);

        if (authResponse.success) {
          console.log('✅ OAuth登录成功');
          // 登录成功，重定向到仪表板
          navigate('/dashboard');
        } else {
          console.error('❌ OAuth登录失败:', authResponse.error);
          throw new Error(authResponse.error || '认证失败');
        }
      } catch (err) {
        console.error('❌ Failed to authenticate with OAuth:', err.message);
        // 登录失败，可以重定向到登录页
        navigate('/login');
      }
    };

    if (code) {
      authenticateWithSubgraph();
    }
  }, [code, navigate]);

  return <p>Logging in...</p>;
};

export default OAuthHandler;