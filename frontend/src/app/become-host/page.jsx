"use client";

import React, { useEffect } from "react";
import BecomeHostApplication from '@/components/BecomeHostApplication';
import Link from 'next/link';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';

export default function BecomeHostPage() {
  const { data: session, status } = useSession();
  const router = useRouter();

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/api/auth/signin');
    }
  }, [status, router]);

  // 1. 在会话加载或未认证时显示加载状态
  if (status === 'loading') {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <p>正在加载会话...</p>
      </div>
    );
  }

  // 3. 如果用户已经是房东或申请正在审核中，显示状态
  if (session?.user?.role === 'HOST' || session?.user?.role === 'PENDING_HOST') {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold">申请状态</h1>
          <p className="mt-2">您已经是 {session.user.role === 'HOST' ? '房东' : '待审核的房东'}。</p>
          <Link href="/dashboard" className="mt-4 inline-block bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700">前往仪表盘</Link>
        </div>
      </div>
    );
  }

  // 4. 只有在用户已认证且不是房东时，才渲染申请页面
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-blue-900 text-white">
        <div className="container mx-auto px-4 py-4">
          <div className="flex justify-between items-center">
            <Link href="/" className="text-2xl font-bold">🏠 MINSHUKU</Link>
            <nav className="space-x-4">
              <Link href="/" className="hover:underline">Home</Link>
              <Link href="/listings" className="hover:underline">Listings</Link>
              {status === 'authenticated' ? (
                <button onClick={() => router.push('/api/auth/signout')} className="hover:underline">登出</button>
              ) : (
                <Link href="/api/auth/signin" className="hover:underline">登录</Link>
              )}
            </nav>
          </div>
        </div>
      </div>
      {/* Hero Section */}
      <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white py-16">
        <div className="container mx-auto px-4 text-center">
          <h1 className="text-4xl md:text-5xl font-bold mb-4">Become a Host</h1>
          <p className="text-xl md:text-2xl mb-6">Turn your extra space into extra income</p>
          <div className="flex flex-wrap justify-center gap-4 text-sm">
            <div className="flex items-center"><span className="mr-2">💰</span> Earn up to $5,000/month</div>
            <div className="flex items-center"><span className="mr-2">🏠</span> Share your unique space</div>
            <div className="flex items-center"><span className="mr-2">🌟</span> Join 2M+ hosts worldwide</div>
          </div>
        </div>
      </div>
      {/* Main Content */}
      <div className="container mx-auto px-4 py-12">
        <div className="max-w-4xl mx-auto">
          {/* Benefits Section */}
          <div className="grid md:grid-cols-3 gap-8 mb-12">
            {/* ... benefits content ... */}
          </div>
          {/* Application Section */}
          <div className="bg-white rounded-lg shadow-lg overflow-hidden">
            <div className="bg-blue-600 text-white p-6">
              <h2 className="text-2xl font-bold">Ready to Get Started?</h2>
              <p className="text-blue-100">Complete your host application in just a few minutes</p>
            </div>
            <div className="p-6">
              <BecomeHostApplication session={session} />
            </div>
          </div>
          {/* FAQ Section */}
          <div className="mt-16">
            {/* ... faq content ... */}
          </div>
          {/* Support Section */}
          <div className="mt-12 text-center">
            {/* ... support content ... */}
          </div>
        </div>
      </div>
      {/* Footer */}
      <footer className="bg-gray-800 text-white py-8">
        {/* ... footer content ... */}
      </footer>
    </div>
  );
}