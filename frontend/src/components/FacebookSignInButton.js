'use client';
import { useState } from "react";

export default function FacebookSignInButton({ onClick }) {
  const [loading, setLoading] = useState(false);

  const handleClick = async () => {
    setLoading(true);
    try {
      await onClick?.();
    } catch (error) {
      console.error("Facebook sign-in error:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <button
      onClick={handleClick}
      disabled={loading}
      className={`w-full flex items-center justify-center gap-3 bg-[#3b82f6] text-white px-4 py-3 rounded h-12 ${
        loading ? 'opacity-70' : 'hover:bg-[#2563eb]'
      } transition-colors focus:outline-none focus:ring-2 focus:ring-blue-400`}
    >
      <svg 
        xmlns="http://www.w3.org/2000/svg" 
        width="20" 
        height="20" 
        viewBox="0 0 24 24" 
        fill="currentColor"
      >
        <path d="M9.19795 21.5H13.198V13.4901H16.8021L17.198 9.50977H13.198V7.5C13.198 6.94772 13.6457 6.5 14.198 6.5H17.198V2.5H14.198C11.4365 2.5 9.19795 4.73858 9.19795 7.5V9.50977H7.19795L6.80206 13.4901H9.19795V21.5Z" />
      </svg>
      <span>
        {loading ? '登录中...' : '使用Facebook登录'}
      </span>
    </button>
  );
}