'use client';

import { useSession, signOut } from 'next-auth/react';
import Image from 'next/image';
import { redirect } from 'next/navigation';
import { useEffect, useState } from 'react';
import { useQuery, gql } from '@apollo/client';
import client from '@/lib/apolloClient';

// GraphQL query for user dashboard data
const USER_DASHBOARD_QUERY = gql`
  query GetUserDashboard($userId: ID!) {
    userDashboard(userId: $userId) {
      user {
        id
        name
        email
        role
        status
      }
      totalListings
      totalBookings
      recentBookings {
        id
        listingTitle
        checkIn
        checkOut
        totalPrice
        createdAt
      }
      recentListings {
        id
        title
        price
        imageUrl
        createdAt
      }
    }
  }
`;

export default function Dashboard() {
  const { data: session, status } = useSession();
  const [dashboardData, setDashboardData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchDashboardData = async () => {
      if (status === 'authenticated' && session?.user?.id) {
        try {
          setLoading(true);
          const result = await client.query({
            query: USER_DASHBOARD_QUERY,
            variables: { userId: session.user.id }
          });
          
          if (result.data?.userDashboard) {
            setDashboardData(result.data.userDashboard);
          }
        } catch (err) {
          console.error('Error fetching dashboard data:', err);
          setError('Failed to load dashboard data');
        } finally {
          setLoading(false);
        }
      }
    };

    fetchDashboardData();
  }, [session, status]);

  if (status === 'loading' || loading) return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
        <p className="mt-4 text-gray-600">Loading dashboard...</p>
      </div>
    </div>
  );

  if (status === 'unauthenticated') {
    redirect('/login');
    return null;
  }

  let imageSrc = session?.user?.image;
  if (!imageSrc || !imageSrc.startsWith('http')) {
    imageSrc = '/chart.png';
  }

  const handleLogout = () => {
    signOut({ callbackUrl: '/login' });
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header Section */}
        <div className="bg-white rounded-lg shadow p-6 mb-8">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <Image
                src={imageSrc}
                alt="User Avatar"
                width={80}
                height={80}
                className="rounded-full border-4 border-blue-100"
                priority
              />
              <div>
                <h1 className="text-2xl font-bold text-gray-900">
                  Welcome back, {session?.user?.name || 'User'}!
                </h1>
                <p className="text-gray-600">{session?.user?.email}</p>
                <p className="text-sm text-blue-600 font-medium">
                  {dashboardData?.user?.role || 'GUEST'}
                </p>
              </div>
            </div>
            <button 
              onClick={handleLogout}
              className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-md transition-colors"
            >
              Logout
            </button>
          </div>
        </div>

        {/* Error Message */}
        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-6">
            {error}
          </div>
        )}

        {/* Dashboard Stats */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="p-3 rounded-full bg-blue-100 text-blue-600">
                <span className="text-2xl">🏠</span>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Total Listings</p>
                <p className="text-2xl font-bold text-gray-900">
                  {dashboardData?.totalListings || 0}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="p-3 rounded-full bg-green-100 text-green-600">
                <span className="text-2xl">📅</span>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Total Bookings</p>
                <p className="text-2xl font-bold text-gray-900">
                  {dashboardData?.totalBookings || 0}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="p-3 rounded-full bg-purple-100 text-purple-600">
                <span className="text-2xl">⭐</span>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">User Status</p>
                <p className="text-lg font-bold text-gray-900 capitalize">
                  {dashboardData?.user?.status?.toLowerCase() || 'active'}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="p-3 rounded-full bg-yellow-100 text-yellow-600">
                <span className="text-2xl">👤</span>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Account Type</p>
                <p className="text-lg font-bold text-gray-900">
                  {dashboardData?.user?.role === 'HOST' ? 'Host' : 'Guest'}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Recent Activity Sections */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Recent Bookings */}
          <div className="bg-white rounded-lg shadow">
            <div className="p-6 border-b border-gray-200">
              <h3 className="text-lg font-semibold text-gray-900">📅 Recent Bookings</h3>
            </div>
            <div className="p-6">
              {dashboardData?.recentBookings?.length > 0 ? (
                <div className="space-y-4">
                  {dashboardData.recentBookings.slice(0, 5).map((booking) => (
                    <div key={booking.id} className="flex items-center justify-between p-3 bg-gray-50 rounded">
                      <div>
                        <p className="font-medium text-gray-900">{booking.listingTitle}</p>
                        <p className="text-sm text-gray-600">
                          {new Date(booking.checkIn).toLocaleDateString()} - {new Date(booking.checkOut).toLocaleDateString()}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="font-bold text-green-600">¥{booking.totalPrice}</p>
                        <p className="text-xs text-gray-500">
                          {new Date(booking.createdAt).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-gray-500 text-center py-8">No recent bookings found</p>
              )}
            </div>
          </div>

          {/* Recent Listings */}
          <div className="bg-white rounded-lg shadow">
            <div className="p-6 border-b border-gray-200">
              <h3 className="text-lg font-semibold text-gray-900">🏠 Recent Listings</h3>
            </div>
            <div className="p-6">
              {dashboardData?.recentListings?.length > 0 ? (
                <div className="space-y-4">
                  {dashboardData.recentListings.slice(0, 5).map((listing) => (
                    <div key={listing.id} className="flex items-center space-x-4 p-3 bg-gray-50 rounded">
                      {listing.imageUrl && (
                        <img 
                          src={listing.imageUrl} 
                          alt={listing.title}
                          className="w-16 h-16 object-cover rounded"
                        />
                      )}
                      <div className="flex-1">
                        <p className="font-medium text-gray-900">{listing.title}</p>
                        <p className="text-sm text-gray-600">¥{listing.price} per night</p>
                      </div>
                      <div className="text-right">
                        <p className="text-xs text-gray-500">
                          {new Date(listing.createdAt).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-gray-500 text-center py-8">No listings found</p>
              )}
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="mt-8 bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">🚀 Quick Actions</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <a 
              href="/create-listing" 
              className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-3 rounded-md text-center transition-colors"
            >
              ➕ Create New Listing
            </a>
            <a 
              href="/search" 
              className="bg-green-600 hover:bg-green-700 text-white px-4 py-3 rounded-md text-center transition-colors"
            >
              🔍 Search Listings
            </a>
            <a 
              href="/become-host" 
              className="bg-purple-600 hover:bg-purple-700 text-white px-4 py-3 rounded-md text-center transition-colors"
            >
              🏠 Become a Host
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}
