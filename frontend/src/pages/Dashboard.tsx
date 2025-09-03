import React, { useState, useEffect } from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer, Legend } from 'recharts';
import { Plus, Users, Lock, BookOpen, TrendingUp } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { dashboardAPI } from '../services/api';

const Dashboard: React.FC = () => {
  const navigate = useNavigate();
  
  // State for dashboard data
  const [dashboardData, setDashboardData] = useState({
    totalAssets: 0,
    totalNominees: 0,
    netWorth: 0,
    assetAllocation: [] as Array<{ name: string; value: number; amount: number; color: string }>,
    recentActivity: [] as Array<any>
  });
  const [loading, setLoading] = useState(true);

  // Fetch dashboard data on component mount
  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        const response = await dashboardAPI.getStats();
        setDashboardData(response.data);
      } catch (error) {
        console.error('Error fetching dashboard data:', error);
        // Fallback to mock data if API fails
        setDashboardData({
          totalAssets: 4,
          totalNominees: 2,
          netWorth: 2500000,
          assetAllocation: [
            { name: 'Bank', value: 35, amount: 875000, color: '#1E3A8A' },
            { name: 'LIC', value: 25, amount: 625000, color: '#3B82F6' },
            { name: 'Property', value: 20, amount: 500000, color: '#60A5FA' },
            { name: 'Stocks', value: 20, amount: 500000, color: '#93C5FD' },
          ],
          recentActivity: []
        });
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  const { totalAssets, totalNominees, netWorth, assetAllocation } = dashboardData;

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      minimumFractionDigits: 0,
    }).format(amount);
  };

  const quickActions = [
    { label: 'Add Asset', icon: Plus, action: () => navigate('/assets?add=true') },
    { label: 'Add Nominee', icon: Users, action: () => navigate('/nominees?add=true') },
    { label: 'Vault', icon: Lock, action: () => navigate('/vault') },
    { label: 'Claim Guides', icon: BookOpen, action: () => navigate('/claim-guides') },
  ];

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Total Assets Card */}
        <div className="card">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-semibold text-gray-800 mb-2">Total Assets</h3>
              <p className="text-3xl font-bold text-primary-600">{totalAssets}</p>
            </div>
            <div className="w-12 h-12 bg-primary-100 rounded-lg flex items-center justify-center">
              <TrendingUp className="w-6 h-6 text-primary-600" />
            </div>
          </div>
        </div>

        {/* Total Nominees Card */}
        <div className="card">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-semibold text-gray-800 mb-2">Total Nominees</h3>
              <p className="text-3xl font-bold text-primary-600">{totalNominees}</p>
            </div>
            <div className="w-12 h-12 bg-primary-100 rounded-lg flex items-center justify-center">
              <Users className="w-6 h-6 text-primary-600" />
            </div>
          </div>
        </div>

        {/* Net Worth Card */}
        <div className="card">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-semibold text-gray-800 mb-2">Net Worth</h3>
              <p className="text-2xl font-bold text-green-600">{formatCurrency(netWorth)}</p>
            </div>
            <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
              <TrendingUp className="w-6 h-6 text-green-600" />
            </div>
          </div>
        </div>
      </div>

      {/* Asset Allocation Chart */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="card">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">Asset Allocation</h3>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={assetAllocation}
                  cx="50%"
                  cy="50%"
                  outerRadius={100}
                  dataKey="value"
                  label={({ name, value }) => `${name}: ${value}%`}
                >
                  {assetAllocation.map((entry: any, index: number) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="card">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">Quick Actions</h3>
          <div className="grid grid-cols-2 gap-4">
            {quickActions.map((action, index) => {
              const Icon = action.icon;
              return (
                <button
                  key={index}
                  onClick={action.action}
                  className="flex flex-col items-center justify-center p-4 border-2 border-dashed border-gray-300 rounded-lg hover:border-primary-600 hover:bg-primary-50 transition-all duration-200 group active:scale-95 hover:shadow-md"
                >
                  <Icon className="w-8 h-8 text-gray-400 group-hover:text-primary-600 mb-2" />
                  <span className="text-sm font-medium text-gray-600 group-hover:text-primary-600">
                    {action.label}
                  </span>
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Recent Activity */}
      <div className="card">
        <h3 className="text-lg font-semibold text-gray-800 mb-4">Recent Activity</h3>
        <div className="space-y-3">
          <div className="flex items-center justify-between py-2 border-b border-gray-100">
            <div className="flex items-center">
              <div className="w-2 h-2 bg-green-500 rounded-full mr-3"></div>
              <span className="text-gray-700">Added SBI Savings Account</span>
            </div>
            <span className="text-sm text-gray-500">2 hours ago</span>
          </div>
          <div className="flex items-center justify-between py-2 border-b border-gray-100">
            <div className="flex items-center">
              <div className="w-2 h-2 bg-blue-500 rounded-full mr-3"></div>
              <span className="text-gray-700">Updated nominee allocation</span>
            </div>
            <span className="text-sm text-gray-500">1 day ago</span>
          </div>
          <div className="flex items-center justify-between py-2">
            <div className="flex items-center">
              <div className="w-2 h-2 bg-yellow-500 rounded-full mr-3"></div>
              <span className="text-gray-700">LIC policy renewal reminder</span>
            </div>
            <span className="text-sm text-gray-500">3 days ago</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard; 