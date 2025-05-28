'use client';
import { signIn } from "next-auth/react";
import { useState } from "react";
import Image from "next/image";

export default function GoogleSignInButton({ onSuccess, onError, buttonStyle }) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleGoogleSignIn = async () => {
    setLoading(true);
    setError(null);
    
    try {
      const result = await signIn('google', { 
        callbackUrl: '/', // 登录成功后重定向到首页
        redirect: false // 不自动重定向，让我们可以处理结果
      });

      if (result?.error) {
        throw new Error(result.error);
      }
      
      // 如果登录成功且提供了成功回调，则调用它
      if (onSuccess && !result?.error) {
        onSuccess(result);
      }

      // 如果登录成功，手动重定向
      if (!result?.error) {
        window.location.href = result?.url || '/';
      }
    } catch (err) {
      const errorMessage = err.message || 'Failed to sign in with Google';
      setError(errorMessage);
      
      // 如果提供了错误回调，则调用它
      if (onError) {
        onError(errorMessage);
      }
    } finally {
      setLoading(false);
    }
  };

  // 合并传入的样式和默认样式
  const containerStyle = {
    width: '100%',
    ...(buttonStyle || {})
  };

  return (
    <div style={containerStyle}>
      <button
        onClick={handleGoogleSignIn}
        disabled={loading}
        style={{
          width: '100%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: '8px',
          padding: '10px',
          border: '1px solid #ddd',
          borderRadius: '4px',
          backgroundColor: loading ? '#f1f1f1' : '#ffffff',
          cursor: loading ? 'default' : 'pointer',
          transition: 'background-color 0.3s'
        }}
        onMouseOver={(e) => {
          if (!loading) e.currentTarget.style.backgroundColor = '#f5f5f5';
        }}
        onMouseOut={(e) => {
          if (!loading) e.currentTarget.style.backgroundColor = '#ffffff';
        }}
      >
        <Image
          src="/google.svg"
          alt="Google logo"
          width={20}
          height={20}
          priority
        />
        <span style={{ color: '#444', fontWeight: '500' }}>
          {loading ? '登录中...' : '使用 Google 账号登录'}
        </span>
      </button>
      {error && (
        <p style={{ 
          marginTop: '8px', 
          fontSize: '14px', 
          color: '#d32f2f', 
          textAlign: 'center' 
        }}>
          {error}
        </p>
      )}
    </div>
  );
}