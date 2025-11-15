"use client"

import React, { useState, useEffect } from 'react';

export default function HostBookings() {
  const [bookings, setBookings] = useState([]);
  const [filter, setFilter] = useState('all');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // 模拟获取预订数据
    setTimeout(() => {
      setBookings([
        {
          id: 'booking-1',
          guestName: '李小明',
          guestEmail: 'liming@example.com',
          listingTitle: '京都传统日式旅馆',
          checkIn: '2024-02-01',
          checkOut: '2024-02-05',
          guests: 2,
          totalAmount: 600,
          status: 'CONFIRMED',
          createdAt: '2024-01-10'
        },
        {
          id: 'booking-2',
          guestName: '王小红',
          guestEmail: 'wanghong@example.com',
          listingTitle: '大阪现代公寓',
          checkIn: '2024-02-10',
          checkOut: '2024-02-12',
          guests: 1,
          totalAmount: 240,
          status: 'PENDING',
          createdAt: '2024-01-15'
        },
        {
          id: 'booking-3',
          guestName: '张伟',
          guestEmail: 'zhangwei@example.com',
          listingTitle: '京都传统日式旅馆',
          checkIn: '2024-03-01',
          checkOut: '2024-03-07',
          guests: 3,
          totalAmount: 900,
          status: 'CANCELLED',
          createdAt: '2024-01-05'
        }
      ]);
      setLoading(false);
    }, 1000);
  }, []);

  const filteredBookings = bookings.filter(booking => {
    if (filter === 'all') return true;
    return booking.status === filter;
  });

  const handleBookingAction = (bookingId, action) => {
    console.log('处理预订:', bookingId, action);
    // 这里可以调用API处理预订
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'CONFIRMED': return 'bg-green-100 text-green-800';
      case 'PENDING': return 'bg-yellow-100 text-yellow-800';
      case 'CANCELLED': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusText = (status) => {
    switch (status) {
      case 'CONFIRMED': return '已确认';
      case 'PENDING': return '待确认';
      case 'CANCELLED': return '已取消';
      default: return status;
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">加载预订数据...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-6">预订管理</h1>

        {/* 筛选器 */}
        <div className="bg-white rounded-lg shadow p-4 mb-6">
          <div className="flex space-x-4">
            {[
              { value: 'all', label: '全部', count: bookings.length },
              { value: 'PENDING', label: '待确认', count: bookings.filter(b => b.status === 'PENDING').length },
              { value: 'CONFIRMED', label: '已确认', count: bookings.filter(b => b.status === 'CONFIRMED').length },
              { value: 'CANCELLED', label: '已取消', count: bookings.filter(b => b.status === 'CANCELLED').length }
            ].map((filterOption) => (
              <button
                key={filterOption.value}
                onClick={() => setFilter(filterOption.value)}
                className={`px-4 py-2 rounded-md text-sm font-medium ${
                  filter === filterOption.value
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                {filterOption.label} ({filterOption.count})
              </button>
            ))}
          </div>
        </div>

        {/* 预订列表 */}
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">预订信息</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">入住信息</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">金额</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">状态</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">操作</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredBookings.map((booking) => (
                  <tr key={booking.id}>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">{booking.guestName}</div>
                      <div className="text-sm text-gray-500">{booking.guestEmail}</div>
                      <div className="text-sm text-gray-600">{booking.listingTitle}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">
                        <div>入住: {booking.checkIn}</div>
                        <div>退房: {booking.checkOut}</div>
                        <div>人数: {booking.guests}人</div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      ¥{booking.totalAmount}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusColor(booking.status)}`}>
                        {getStatusText(booking.status)}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      {booking.status === 'PENDING' && (
                        <div className="flex space-x-2">
                          <button 
                            onClick={() => handleBookingAction(booking.id, 'confirm')}
                            className="text-green-600 hover:text-green-900"
                          >
                            确认
                          </button>
                          <button 
                            onClick={() => handleBookingAction(booking.id, 'reject')}
                            className="text-red-600 hover:text-red-900"
                          >
                            拒绝
                          </button>
                        </div>
                      )}
                      {booking.status === 'CONFIRMED' && (
                        <button 
                          onClick={() => handleBookingAction(booking.id, 'cancel')}
                          className="text-gray-600 hover:text-gray-900"
                        >
                          取消
                        </button>
                      )}
                      {booking.status === 'CANCELLED' && (
                        <span className="text-gray-400">无操作</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {filteredBookings.length === 0 && (
            <div className="text-center py-12">
              <div className="text-6xl mb-4">📅</div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">暂无预订</h3>
              <p className="text-gray-600">当前筛选条件下没有预订记录</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}