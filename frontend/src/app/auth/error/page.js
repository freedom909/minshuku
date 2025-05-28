'use client';

import { useSearchParams } from 'next/navigation';
import Link from 'next/link';

export default function ErrorPage() {
  const searchParams = useSearchParams();
  const error = searchParams.get('error');

  const getErrorMessage = (errorCode) => {
    switch (errorCode) {
      case 'AccessDenied':
        return '访问被拒绝。请确保您的账号已被授权访问。';
      case 'Configuration':
        return '系统配置错误。请联系管理员检查API服务是否正常运行。';
      case 'Verification':
        return '验证失败。请重新尝试登录。';
      case 'OAuthSignin':
        return 'Google登录初始化失败。请重试。';
      case 'OAuthCallback':
        return 'Google登录回调处理失败。请重试。';
      case 'OAuthCreateAccount':
        return '无法创建关联账号。请联系管理员。';
      case 'EmailSignin':
        return '邮箱登录失败。请检查您的邮箱地址。';
      case 'CredentialsSignin':
        return '登录凭证无效。请检查您的登录信息。';
      case 'SessionRequired':
        return '需要登录会话。请先登录。';
      default:
        return '登录过程中发生错误。请重试或联系支持团队。';
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="max-w-md w-full bg-white rounded-xl shadow-lg p-8">
        <div className="text-center">
          <div className="mb-4">
            <svg className="mx-auto h-12 w-12 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-4">登录失败</h2>
          <div className="text-gray-600 mb-6">
            {getErrorMessage(error)}
          </div>
          <div className="space-y-4">
            <Link
              href="/login"
              className="inline-block w-full bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors duration-200"
            >
              返回登录页面
            </Link>
            <div className="text-sm text-gray-500">
              <p>如果问题持续存在，请尝试：</p>
              <ul className="mt-2 space-y-1 text-left list-disc list-inside">
                <li>清除浏览器缓存和 Cookie</li>
                <li>使用其他浏览器尝试</li>
                <li>检查网络连接</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}