'use client';
import { GoogleOAuthProvider, GoogleLogin } from '@react-oauth/google';
import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

const GoogleLoginComponent = () => {
    const router = useRouter();
    const googleClientId = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID;

    const handleLoginSuccess = (response) => {
        console.log('Google 登录成功，JWT ID 令牌:', response.credential);
        // 发送令牌到后端验证
        fetch('/api/oauth/google', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ token: response.credential })
        })
          .then(res => {
                if (!res.ok) {
                    throw new Error('服务器响应错误');
                }
                return res.json();
            })
          .then(data => {
                console.log('后端验证成功:', data);
                // 登录成功后跳转页面
                router.push('/dashboard');
            })
          .catch(error => {
                console.error('登录验证失败:', error);
            });
    };

    const handleLoginError = (error) => {
        console.error('Google 登录失败:', error);
    };

    if (!googleClientId) {
        return <div>未配置 Google 客户端 ID，请检查环境变量。</div>;
    }

    return (
        <GoogleOAuthProvider clientId={googleClientId}>
            <GoogleLogin
                onSuccess={handleLoginSuccess}
                onError={handleLoginError}
                useOneTap
            />
        </GoogleOAuthProvider>
    );
};

export default GoogleLoginComponent;