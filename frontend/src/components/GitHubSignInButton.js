"use client";
import { useState } from "react";
import { FaGithub } from "react-icons/fa";

export default function GitHubSignInButton({ onClick }) {
  const [loading, setLoading] = useState(false);

  const handleClick = async () => {
    setLoading(true);
    try {
      await onClick?.();
    } catch (error) {
      console.error("Github sign-in error:", error);
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
      <FaGithub className="w-5 h-5" />
      <span>
        {loading ? '登录中...' : '使用GitHub登录'}
      </span>
    </button>
  );
}