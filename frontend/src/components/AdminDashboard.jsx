import React, { useState, useEffect } from 'react';

const AdminDashboard = () => {
  const [dashboardData, setDashboardData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('overview');

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      // Simulate API call to get dashboard data
      const response = await fetch('http://localhost:9000/ml/analytics/dashboard');
      const data = await response.json();
      setDashboardData(data.data);
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
      // Use mock data for demo
      setDashboardData({
        performance: {
          metrics: {
            response_time: 0.8,
            error_rate: 0.02,
            concurrent_users: 150,
            booking_rate: 12,
            cpu_usage: 45.2,
            memory_usage: 67.8
          },
          trends: {
            trend: 'stable',
            improvement_since_last_hour: 2.5
          }
        },
        conversion_funnel: {
          conversion_rates: {
            visitors_to_searches: 85.3,
            searches_to_bookings: 12.1,
            overall_conversion: 10.3
          }
        },
        demand_forecast: {
          peak_predictions: {
            next_24_hours: {
              peak_time: '14:00-16:00',
              expected_demand: 'high'
            }
          }
        },
        kpis: {
          uptime: 99.95,
          user_satisfaction: 4.7,
          booking_conversion_rate: 12.3,
          average_booking_value: 245.50
        }
      });
    } finally {
      setLoading(false);
    }
  };

  const runOptimization = async () => {
    try {
      const response = await fetch('http://localhost:9000/ml/optimization/comprehensive', {
        method: 'POST'
      });
      const result = await response.json();
      alert('Optimization completed! Check console for details.');
      console.log('Optimization result:', result);
    } catch (error) {
      console.error('Error running optimization:', error);
      alert('Optimization feature demo - would run comprehensive business optimization');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-xl">Loading dashboard...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-blue-900 text-white p-4">
        <h1 className="text-2xl font-bold">🧠 Minshuku AI Dashboard</h1>
        <p className="text-blue-200">Real-time analytics and optimization</p>
      </div>

      {/* Navigation */}
      <div className="bg-white border-b">
        <div className="flex space-x-4 p-4">
          {['overview', 'analytics', 'optimization', 'alerts'].map(tab => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-4 py-2 rounded-md capitalize ${
                activeTab === tab 
                  ? 'bg-blue-600 text-white' 
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              {tab}
            </button>
          ))}
        </div>
      </div>

      {/* Content */}
      <div className="p-6">
        {activeTab === 'overview' && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {/* Performance Metrics */}
            <div className="bg-white p-6 rounded-lg shadow">
              <h3 className="text-lg font-semibold mb-4">📊 Performance Metrics</h3>
              <div className="space-y-2">
                <MetricCard label="Response Time" value={`${dashboardData?.performance?.metrics?.response_time}s`} good={dashboardData?.performance?.metrics?.response_time < 1} />
                <MetricCard label="Error Rate" value={`${(dashboardData?.performance?.metrics?.error_rate * 100).toFixed(1)}%`} good={dashboardData?.performance?.metrics?.error_rate < 0.05} />
                <MetricCard label="Concurrent Users" value={dashboardData?.performance?.metrics?.concurrent_users} />
                <MetricCard label="Booking Rate" value={`${dashboardData?.performance?.metrics?.booking_rate}/min`} />
              </div>
            </div>

            {/* Conversion Funnel */}
            <div className="bg-white p-6 rounded-lg shadow">
              <h3 className="text-lg font-semibold mb-4">🔄 Conversion Funnel</h3>
              <div className="space-y-2">
                <MetricCard label="Visitors → Searches" value={`${dashboardData?.conversion_funnel?.conversion_rates?.visitors_to_searches}%`} />
                <MetricCard label="Searches → Bookings" value={`${dashboardData?.conversion_funnel?.conversion_rates?.searches_to_bookings}%`} />
                <MetricCard label="Overall Conversion" value={`${dashboardData?.conversion_funnel?.conversion_rates?.overall_conversion}%`} />
              </div>
            </div>

            {/* KPIs */}
            <div className="bg-white p-6 rounded-lg shadow">
              <h3 className="text-lg font-semibold mb-4">⭐ Key Performance Indicators</h3>
              <div className="space-y-2">
                <MetricCard label="Uptime" value={`${dashboardData?.kpis?.uptime}%`} good={dashboardData?.kpis?.uptime > 99.9} />
                <MetricCard label="User Satisfaction" value={dashboardData?.kpis?.user_satisfaction} good={dashboardData?.kpis?.user_satisfaction > 4.5} />
                <MetricCard label="Avg Booking Value" value={`$${dashboardData?.kpis?.average_booking_value}`} />
              </div>
            </div>

            {/* Demand Forecast */}
            <div className="bg-white p-6 rounded-lg shadow">
              <h3 className="text-lg font-semibold mb-4">📈 Demand Forecast</h3>
              <div className="space-y-2">
                <div className="text-sm">
                  <span className="font-medium">Next 24h Peak:</span> {dashboardData?.demand_forecast?.peak_predictions?.next_24_hours?.peak_time}
                </div>
                <div className="text-sm">
                  <span className="font-medium">Expected Demand:</span> 
                  <span className={`ml-2 px-2 py-1 rounded text-xs ${
                    dashboardData?.demand_forecast?.peak_predictions?.next_24_hours?.expected_demand === 'high' 
                      ? 'bg-red-100 text-red-800' 
                      : 'bg-green-100 text-green-800'
                  }`}>
                    {dashboardData?.demand_forecast?.peak_predictions?.next_24_hours?.expected_demand}
                  </span>
                </div>
              </div>
            </div>

            {/* Optimization Actions */}
            <div className="bg-white p-6 rounded-lg shadow">
              <h3 className="text-lg font-semibold mb-4">⚡ Quick Actions</h3>
              <div className="space-y-3">
                <button 
                  onClick={runOptimization}
                  className="w-full bg-green-600 text-white py-2 px-4 rounded-md hover:bg-green-700 transition-colors"
                >
                  Run Business Optimization
                </button>
                <button className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 transition-colors">
                  Generate Analytics Report
                </button>
                <button className="w-full bg-purple-600 text-white py-2 px-4 rounded-md hover:bg-purple-700 transition-colors">
                  Monitor System Health
                </button>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'analytics' && (
          <div className="bg-white p-6 rounded-lg shadow">
            <h3 className="text-lg font-semibold mb-4">📈 Advanced Analytics</h3>
            <p className="text-gray-600">Real-time analytics dashboard with machine learning insights.</p>
            <div className="mt-4 grid grid-cols-2 gap-4">
              <div className="p-4 bg-blue-50 rounded">
                <h4 className="font-medium">User Behavior Analysis</h4>
                <p className="text-sm text-gray-600">Track and analyze user interactions</p>
              </div>
              <div className="p-4 bg-green-50 rounded">
                <h4 className="font-medium">Performance Trends</h4>
                <p className="text-sm text-gray-600">Monitor system performance over time</p>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'optimization' && (
          <div className="bg-white p-6 rounded-lg shadow">
            <h3 className="text-lg font-semibold mb-4">🔧 Business Optimization</h3>
            <p className="text-gray-600">AI-powered optimization algorithms for business operations.</p>
            <div className="mt-4 space-y-4">
              <OptimizationCard 
                title="Pricing Strategy" 
                description="Optimize listing prices based on market conditions"
                status="active"
              />
              <OptimizationCard 
                title="Inventory Allocation" 
                description="Smart allocation of resources across listings"
                status="active"
              />
              <OptimizationCard 
                title="Marketing Budget" 
                description="Optimize marketing spend for maximum ROI"
                status="pending"
              />
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

const MetricCard = ({ label, value, good }) => (
  <div className="flex justify-between items-center p-2 bg-gray-50 rounded">
    <span className="text-sm text-gray-600">{label}</span>
    <span className={`font-medium ${good !== undefined ? (good ? 'text-green-600' : 'text-red-600') : 'text-gray-800'}`}>
      {value}
    </span>
  </div>
);

const OptimizationCard = ({ title, description, status }) => (
  <div className="p-4 border rounded-lg">
    <div className="flex justify-between items-center">
      <div>
        <h4 className="font-medium">{title}</h4>
        <p className="text-sm text-gray-600">{description}</p>
      </div>
      <span className={`px-2 py-1 rounded text-xs ${
        status === 'active' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'
      }`}>
        {status}
      </span>
    </div>
    <button className="mt-2 text-blue-600 text-sm hover:underline">
      Run Optimization
    </button>
  </div>
);

export default AdminDashboard;