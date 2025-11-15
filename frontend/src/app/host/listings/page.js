"use client"

import React, { useState, useEffect } from 'react';

export default function HostListings() {
  const [listings, setListings] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // 模拟获取房源数据
    setTimeout(() => {
      setListings([
        {
          id: 'listing-1',
          title: '京都传统日式旅馆',
          description: '位于京都中心的传统日式旅馆，体验纯正日本文化',
          price: 150,
          location: '京都',
          status: 'ACTIVE',
          bookings: 12,
          rating: 4.7,
          images: ['/images/kyoto-inn.jpg']
        },
        {
          id: 'listing-2',
          title: '大阪现代公寓',
          description: '大阪市中心现代化公寓，交通便利',
          price: 120,
          location: '大阪',
          status: 'ACTIVE',
          bookings: 8,
          rating: 4.5,
          images: ['/images/osaka-apartment.jpg']
        },
        {
          id: 'listing-3',
          title: '富士山景观小屋',
          description: '富士山脚下的小屋，享受宁静的自然风光',
          price: 200,
          location: '山梨县',
          status: 'PENDING',
          bookings: 0,
          rating: null,
          images: ['/images/fuji-cabin.jpg']
        }
      ]);
      setLoading(false);
    }, 1000);
  }, []);

  const handleEdit = (listingId) => {
    console.log('编辑房源:', listingId);
  };

  const handleStatusChange = (listingId, newStatus) => {
    console.log('更新状态:', listingId, newStatus);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">加载房源数据...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold text-gray-900">我的房源</h1>
          <a 
            href="/create-listing"
            className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700"
          >
            创建新房源
          </a>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {listings.map((listing) => (
            <div key={listing.id} className="bg-white rounded-lg shadow-md overflow-hidden">
              <div className="h-48 bg-gray-200 flex items-center justify-center">
                <span className="text-gray-500">房源图片</span>
              </div>
              
              <div className="p-6">
                <div className="flex justify-between items-start mb-2">
                  <h3 className="text-lg font-semibold text-gray-900">{listing.title}</h3>
                  <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                    listing.status === 'ACTIVE' ? 'bg-green-100 text-green-800' :
                    listing.status === 'PENDING' ? 'bg-yellow-100 text-yellow-800' :
                    'bg-red-100 text-red-800'
                  }`}>
                    {listing.status === 'ACTIVE' ? '活跃' : 
                     listing.status === 'PENDING' ? '审核中' : '已下架'}
                  </span>
                </div>
                
                <p className="text-gray-600 text-sm mb-4">{listing.description}</p>
                
                <div className="flex justify-between items-center mb-4">
                  <div>
                    <span className="text-2xl font-bold text-gray-900">¥{listing.price}</span>
                    <span className="text-gray-600 text-sm">/晚</span>
                  </div>
                  <div className="text-sm text-gray-600">
                    {listing.location}
                  </div>
                </div>

                <div className="flex justify-between items-center text-sm text-gray-600 mb-4">
                  <span>预订数: {listing.bookings}</span>
                  <span>{listing.rating ? `${listing.rating} ⭐` : '暂无评分'}</span>
                </div>

                <div className="flex space-x-2">
                  <button 
                    onClick={() => handleEdit(listing.id)}
                    className="flex-1 bg-blue-600 text-white py-2 px-4 rounded hover:bg-blue-700"
                  >
                    编辑
                  </button>
                  <button 
                    onClick={() => handleStatusChange(listing.id, 
                      listing.status === 'ACTIVE' ? 'INACTIVE' : 'ACTIVE')}
                    className={`flex-1 py-2 px-4 rounded ${
                      listing.status === 'ACTIVE' 
                        ? 'bg-red-600 text-white hover:bg-red-700' 
                        : 'bg-green-600 text-white hover:bg-green-700'
                    }`}
                  >
                    {listing.status === 'ACTIVE' ? '下架' : '上架'}
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>

        {listings.length === 0 && (
          <div className="text-center py-12">
            <div className="text-6xl mb-4">🏠</div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">暂无房源</h3>
            <p className="text-gray-600 mb-4">开始您的房东之旅，创建第一个房源</p>
            <a 
              href="/create-listing"
              className="bg-blue-600 text-white px-6 py-3 rounded-md hover:bg-blue-700"
            >
              创建新房源
            </a>
          </div>
        )}
      </div>
    </div>
  );
}