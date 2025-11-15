"use client"

import React, { useState, useEffect } from 'react';

export default function HostDashboard() {
  const [activeTab, setActiveTab] = useState('listings');
  const [listings, setListings] = useState([]);
  const [bookings, setBookings] = useState([]);
  const [analytics, setAnalytics] = useState({});
  const [loading, setLoading] = useState(true);

  // 模拟房东数据
  const hostData = {
    id: 'host-123',
    name: '房东张先生',
    email: 'host@example.com',
    totalListings: 5,
    totalBookings: 32,
    totalRevenue: 12500,
    rating: 4.8
  };

  // 模拟获取房源数据
  useEffect(() => {
    const fetchHostData = async () => {
      setLoading(true);
      
      // 模拟API调用
      setTimeout(() => {
        setListings([
          {
            id: 'listing-1',
            title: '京都传统日式旅馆',
            status: 'ACTIVE',
            price: 150,
            bookings: 12,
            rating: 4.7,
            lastBooking: '2024-01-15'
          },
          {
            id: 'listing-2',
            title: '大阪现代公寓',
            status: 'ACTIVE',
            price: 120,
            bookings: 8,
            rating: 4.5,
            lastBooking: '2024-01-10'
          },
          {
            id: 'listing-3',
            title: '富士山景观小屋',
            status: 'PENDING',
            price: 200,
            bookings: 0,
            rating: null,
            lastBooking: null
          }
        ]);

        setBookings([
          {
            id: 'booking-1',
            guestName: '李小明',
            listingTitle: '京都传统日式旅馆',
            checkIn: '2024-02-01',
            checkOut: '2024-02-05',
            status: 'CONFIRMED',
            totalAmount: 600
          },
          {
            id: 'booking-2',
            guestName: '王小红',
            listingTitle: '大阪现代公寓',
            checkIn: '2024-02-10',
            checkOut: '2024-02-12',
            status: 'PENDING',
            totalAmount: 240
          }
        ]);

        setAnalytics({
          monthlyRevenue: [3200, 2800, 3500, 3000],
          occupancyRate: 78,
          averageRating: 4.6,
          upcomingBookings: 5
        });

        setLoading(false);
      }, 1000);
    };

    fetchHostData();
  }, []);

  // 创建新房源
  const handleCreateListing = () => {
    window.location.href = '/create-listing';
  };

  // 编辑房源
  const handleEditListing = (listingId) => {
    console.log('编辑房源:', listingId);
    // 这里可以跳转到编辑页面
  };

  // 更新房源状态
  const handleUpdateListingStatus = (listingId, newStatus) => {
    console.log('更新房源状态:', listingId, newStatus);
    // 这里可以调用API更新状态
  };

  // 处理预订
  const handleBookingAction = (bookingId, action) => {
    console.log('处理预订:', bookingId, action);
    // 这里可以调用API处理预订
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">加载中...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* 顶部导航 */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">房东管理中心</h1>
              <p className="text-gray-600">欢迎回来，{hostData.name}</p>
            </div>
            <div className="flex items-center space-x-4">
              <button className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700">
                创建新房源
              </button>
              <button className="text-gray-600 hover:text-gray-900">
                设置
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* 统计卡片 */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="rounded-full bg-blue-100 p-3">
                <span className="text-blue-600 text-xl">🏠</span>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">房源数量</p>
                <p className="text-2xl font-bold text-gray-900">{hostData.totalListings}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="rounded-full bg-green-100 p-3">
                <span className="text-green-600 text-xl">📅</span>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">总预订数</p>
                <p className="text-2xl font-bold text-gray-900">{hostData.totalBookings}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="rounded-full bg-purple-100 p-3">
                <span className="text-purple-600 text-xl">💰</span>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">总收入</p>
                <p className="text-2xl font-bold text-gray-900">¥{hostData.totalRevenue}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="rounded-full bg-yellow-100 p-3">
                <span className="text-yellow-600 text-xl">⭐</span>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">平均评分</p>
                <p className="text-2xl font-bold text-gray-900">{hostData.rating}</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 标签页导航 */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="border-b border-gray-200">
          <nav className="-mb-px flex space-x-8">
            {[
              { id: 'listings', name: '房源管理', icon: '🏠' },
              { id: 'bookings', name: '预订管理', icon: '📅' },
              { id: 'analytics', name: '数据分析', icon: '📊' },
              { id: 'reviews', name: '评价管理', icon: '⭐' }
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`py-2 px-1 border-b-2 font-medium text-sm ${
                  activeTab === tab.id
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                {tab.icon} {tab.name}
              </button>
            ))}
          </nav>
        </div>
      </div>

      {/* 标签页内容 */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {activeTab === 'listings' && (
          <div className="bg-white rounded-lg shadow">
            <div className="px-6 py-4 border-b border-gray-200">
              <div className="flex justify-between items-center">
                <h3 className="text-lg font-medium text-gray-900">房源管理</h3>
                <button 
                  onClick={handleCreateListing}
                  className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700"
                >
                  创建新房源
                </button>
              </div>
            </div>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">房源信息</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">价格</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">预订数</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">评分</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">状态</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">操作</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {listings.map((listing) => (
                    <tr key={listing.id}>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900">{listing.title}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">¥{listing.price}/晚</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{listing.bookings}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {listing.rating ? `${listing.rating} ⭐` : '暂无评分'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                          listing.status === 'ACTIVE' ? 'bg-green-100 text-green-800' :
                          listing.status === 'PENDING' ? 'bg-yellow-100 text-yellow-800' :
                          'bg-red-100 text-red-800'
                        }`}>
                          {listing.status === 'ACTIVE' ? '活跃' : 
                           listing.status === 'PENDING' ? '审核中' : '已下架'}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <button 
                          onClick={() => handleEditListing(listing.id)}
                          className="text-blue-600 hover:text-blue-900 mr-3"
                        >
                          编辑
                        </button>
                        <button 
                          onClick={() => handleUpdateListingStatus(listing.id, 
                            listing.status === 'ACTIVE' ? 'INACTIVE' : 'ACTIVE')}
                          className="text-gray-600 hover:text-gray-900"
                        >
                          {listing.status === 'ACTIVE' ? '下架' : '上架'}
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {activeTab === 'bookings' && (
          <div className="bg-white rounded-lg shadow">
            <div className="px-6 py-4 border-b border-gray-200">
              <h3 className="text-lg font-medium text-gray-900">预订管理</h3>
            </div>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">预订信息</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">入住日期</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">退房日期</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">金额</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">状态</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">操作</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {bookings.map((booking) => (
                    <tr key={booking.id}>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900">{booking.guestName}</div>
                        <div className="text-sm text-gray-500">{booking.listingTitle}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{booking.checkIn}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{booking.checkOut}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">¥{booking.totalAmount}</td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                          booking.status === 'CONFIRMED' ? 'bg-green-100 text-green-800' :
                          booking.status === 'PENDING' ? 'bg-yellow-100 text-yellow-800' :
                          'bg-red-100 text-red-800'
                        }`}>
                          {booking.status === 'CONFIRMED' ? '已确认' : 
                           booking.status === 'PENDING' ? '待确认' : '已取消'}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        {booking.status === 'PENDING' && (
                          <>
                            <button 
                              onClick={() => handleBookingAction(booking.id, 'confirm')}
                              className="text-green-600 hover:text-green-900 mr-3"
                            >
                              确认
                            </button>
                            <button 
                              onClick={() => handleBookingAction(booking.id, 'reject')}
                              className="text-red-600 hover:text-red-900"
                            >
                              拒绝
                            </button>
                          </>
                        )}
                        {booking.status === 'CONFIRMED' && (
                          <button 
                            onClick={() => handleBookingAction(booking.id, 'cancel')}
                            className="text-gray-600 hover:text-gray-900"
                          >
                            取消
                          </button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {activeTab === 'analytics' && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="bg-white rounded-lg shadow p-6">
              <h4 className="text-lg font-medium text-gray-900 mb-4">月度收入趋势</h4>
              <div className="h-64 flex items-end space-x-2">
                {analytics.monthlyRevenue?.map((amount, index) => (
                  <div key={index} className="flex-1 flex flex-col items-center">
                    <div 
                      className="bg-blue-500 rounded-t w-full"
                      style={{ height: `${(amount / 4000) * 200}px` }}
                    ></div>
                    <div className="text-xs text-gray-500 mt-2">第{index + 1}月</div>
                    <div className="text-xs font-medium">¥{amount}</div>
                  </div>
                ))}
              </div>
            </div>

            <div className="bg-white rounded-lg shadow p-6">
              <h4 className="text-lg font-medium text-gray-900 mb-4">关键指标</h4>
              <div className="space-y-4">
                <div>
                  <div className="flex justify-between mb-1">
                    <span className="text-sm font-medium text-gray-700">入住率</span>
                    <span className="text-sm font-bold text-gray-900">{analytics.occupancyRate}%</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div 
                      className="bg-green-600 h-2 rounded-full" 
                      style={{ width: `${analytics.occupancyRate}%` }}
                    ></div>
                  </div>
                </div>

                <div>
                  <div className="flex justify-between mb-1">
                    <span className="text-sm font-medium text-gray-700">平均评分</span>
                    <span className="text-sm font-bold text-gray-900">{analytics.averageRating} ⭐</span>
                  </div>
                </div>

                <div>
                  <div className="flex justify-between">
                    <span className="text-sm font-medium text-gray-700">即将入住</span>
                    <span className="text-sm font-bold text-gray-900">{analytics.upcomingBookings} 个预订</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'reviews' && (
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-lg font-medium text-gray-900 mb-4">评价管理</h3>
            <p className="text-gray-600">评价管理功能正在开发中...</p>
          </div>
        )}
      </div>
    </div>
  );
}