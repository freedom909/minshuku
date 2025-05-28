'use client'

export default function Loading() {
  return (
    <div className="flex items-center justify-center min-h-[200px]">
      <div className="relative">
        {/* 外圈动画 */}
        <div className="w-12 h-12 rounded-full border-4 border-gray-200 border-t-blue-500 animate-spin"></div>
        {/* 内圈动画 */}
        <div className="absolute top-1 left-1 w-10 h-10 rounded-full border-4 border-gray-200 border-t-blue-300 animate-spin"></div>
      </div>
    </div>
  )
}