"use client";
// src/app/page.js
import { useEffect } from "react";
//import { useAuth } from "@/contexts/AuthContext"; 
import React from 'react';
import Image from 'next/image';
import Button from '@/components/ui/button';
import Link from 'next/link';
import JoinNowButton from '@/components/JoinNowButton';

export default function HomePage() {
const { user, loading } = useAuth();

  return (
    <div className="min-h-screen bg-white">
      {/* Top Banner */}
      <div className="bg-blue-900 text-white px-4 py-2 text-sm flex justify-between items-center">
        <div className="flex space-x-4">
          <span>trusted</span>
          <span>unforgotten</span>
        </div>
        <div className="flex space-x-4 items-center">
          <a href="#" className="underline">Get the Minshuku App</a>

          {!loading && (
            user
              ? <span className="font-semibold">Hello, {user.name || user.userId}</span>
              : <JoinNowButton />
          )}
        </div>
      </div>
      // ... 其余代码保持不变
    </div>
  );
}