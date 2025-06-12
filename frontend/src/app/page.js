"use client"
import { useSession } from "next-auth/react";
import { signOut } from 'next-auth/react';
import Link from 'next/link';

export default function Home() {
  const { data: session, status } = useSession();

  if (status === "loading") {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-500"></div>
      </div>
    );
  }

  if (!session) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-yellow-5">
        <h1 className="text-4xl font-bold text-white mb-8">欢迎来到民宿预订系统</h1>
        <div className="space-y-4">
          <Link 
            href="/auth/register" 
            className="inline-block px-6 py-3 bg-indigo-600 text-white font-medium rounded-md hover:bg-indigo-700 transition-colors"
          >
            注册新账户
          </Link>
          <div className="text-center">
            <Link 
              href="/login" 
              className="text-indigo-600 hover:text-indigo-800 font-medium"
            >
              已有账户？立即登录
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4">
      <div className="max-w-md mx-auto bg-white rounded-lg shadow-lg p-6">
        <div className="text-center">
          <img 
            src={session.user.image} 
            alt="User Avatar" 
            className="w-20 h-20 rounded-full mx-auto mb-4"
          />
          <h2 className="text-2xl font-bold text-gray-900 mb-2">
            {session.user.name}
          </h2>
          <p className="text-gray-600 mb-4">
            {session.user.email}
          </p>
          <button 
            onClick={() => signOut({ callbackUrl: '/' })}
            className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 transition-colors"
          >
            退出登录
          </button>
        </div>
      </div>
    </div>
  );
}