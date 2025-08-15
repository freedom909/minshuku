'use client';
import { useAuth } from '@/contexts/AuthContext';
import Image from 'next/image';
import { useState } from 'react';

export default function ProfileMenu() {
const { user, logout } = useAuth();
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  // 只有在用户已认证时才显示
  if (!user) return null;

  // 默认头像
  const avatarSrc = '/chart.png';

  return (
    <div className="relative">
      <button
        onClick={() => setIsMenuOpen(!isMenuOpen)}
        className="flex items-center space-x-2 p-1 rounded-full hover:bg-blue-800 transition-colors"
      >
        <div className="w-8 h-8 rounded-full overflow-hidden border-2 border-white">
          <Image
            src={avatarSrc}
            alt="User avatar"
            width={32}
            height={32}
            className="object-cover"
          />
        </div>
        <span className="font-semibold text-sm hidden sm:inline-block">
          {user.firstName ||user.email}
        </span>
      </button>

      {/* 下拉菜单 */}
      {isMenuOpen && (
        <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg py-1 z-10 border border-gray-100">
          <div className="px-4 py-2 border-b border-gray-100">
            <p className="font-medium text-sm text-gray-900">
              {user.firstName ||user.email}
            </p>
            <p className="text-xs text-gray-500">
              {user.role || 'User'}
            </p>
          </div>
          <button
            onClick={logout}
            className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
          >
            Logout
          </button>
        </div>
      )}
    </div>
  );
}