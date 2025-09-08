import React, { useState, useEffect } from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from 'recharts';
import { Plus, Users, Lock, BookOpen, TrendingUp, Eye, Building2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { dashboardAPI } from '../services/api';

interface AssetAllocation {
  name: string;
  value: number; // This is the actual amount from backend
  color: string;
}

interface DashboardData {
  totalAssets: number;
  totalNominees: number;
  netWorth: number;
  assetAllocation: AssetAllocation[];
  recentActivity: Array<{
    id: number;
    type: string;
    description: string;
    timestamp: Date;
    status: 'success' | 'info' | 'warning';
  }>;
}

const OwnerDashboard: React.FC = () => {
  const navigate = useNavigate();
  const [dashboardData, setDashboardData] = useState<DashboardData>({
    totalAssets: 0,
    totalNominees: 0,
    netWorth: 0,
    assetAllocation: [],
    recentActivity: []
  });
  const [loading, setLoading] = useState(true);
  const [viewMode, setViewMode] = useState<'owner' | 'nominee'>('owner');

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        const response = await dashboardAPI.getStats();
        console.log('Dashboard data received:', response.data);
        setDashboardData({
          ...response.data,
          recentActivity: []
        });
      } catch (error) {
        console.error('Error fetching dashboard data:', error);
        // Fallback data with proper format
        setDashboardData({
          totalAssets: 4,
          totalNominees: 2,
          netWorth: 2500000,
          assetAllocation: [
            { name: 'Bank', value: 500000, color: '#1E40AF' },
            { name: 'LIC', value: 300000, color: '#2563EB' },
            { name: 'Property', value: 2500000, color: '#3B82F6' },
            { name: 'Stocks', value: 450000, color: '#60A5FA' },
            { name: 'Trading Accounts', value: 225000, color: '#93C5FD' }
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
    { label: 'Add Asset', icon: Plus, action: () => navigate('/assets') },
    { label: 'Manage Nominees', icon: Users, action: () => navigate('/nominees') },
    { label: 'View Reports', icon: BookOpen, action: () => navigate('/reports') },
    { label: 'Vault Access', icon: Lock, action: () => navigate('/vault') },
    { label: 'Trading Accounts', icon: Building2, action: () => navigate('/trading-accounts') },
  ];

  // Custom tooltip for the pie chart
  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0];
      return (
        <div className="bg-white p-3 border border-gray-200 rounded-lg shadow-lg">
          <p className="font-semibold text-gray-900">{data.payload.name}</p>
          <p className="text-blue-600">{formatCurrency(data.value)}</p>
          <p className="text-gray-600 text-sm">
            {((data.value / netWorth) * 100).toFixed(1)}% of total
          </p>
        </div>
      );
    }
    return null;
  };

  // Custom label renderer
  const renderCustomLabel = ({ name, value, percent }: any) => {
    return `${name}: ${(percent * 100).toFixed(1)}%`;
  };

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
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total Assets</p>
              <p className="text-2xl font-bold text-gray-900">{totalAssets}</p>
            </div>
            <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
              <TrendingUp className="w-6 h-6 text-blue-600" />
            </div>
          </div>
        </div>

        {/* Total Nominees Card */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total Nominees</p>
              <p className="text-2xl font-bold text-gray-900">{totalNominees}</p>
            </div>
            <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
              <Users className="w-6 h-6 text-green-600" />
            </div>
          </div>
        </div>

        {/* Net Worth Card */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Net Worth</p>
              <p className="text-2xl font-bold text-gray-900">{formatCurrency(netWorth)}</p>
            </div>
            <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
              <Lock className="w-6 h-6 text-purple-600" />
            </div>
          </div>
        </div>
      </div>

      {/* Asset Allocation Chart */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Asset Allocation</h2>
        {assetAllocation && assetAllocation.length > 0 ? (
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={assetAllocation}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={renderCustomLabel}
                  outerRadius={120}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {assetAllocation.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip content={<CustomTooltip />} />
                <Legend 
                  formatter={(value, entry: any) => `${value}: ${formatCurrency(entry.payload.value)}`}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
        ) : (
          <div className="h-80 flex items-center justify-center">
            <div className="text-center">
              <TrendingUp className="w-16 h-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No Asset Data</h3>
              <p className="text-gray-600">Add some assets to see your allocation chart.</p>
            </div>
          </div>
        )}
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
        {quickActions.map((action, index) => (
          <button
            key={index}
            onClick={action.action}
            className="flex items-center space-x-3 p-4 bg-white rounded-lg border border-gray-200 hover:border-primary-300 hover:bg-primary-50 transition-colors"
          >
            <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
              index === 0 ? 'bg-blue-100' :
              index === 1 ? 'bg-green-100' :
              index === 2 ? 'bg-purple-100' :
              index === 3 ? 'bg-orange-100' :
              'bg-amber-100'
            }`}>
              <action.icon className={`w-5 h-5 ${
                index === 0 ? 'text-blue-600' :
                index === 1 ? 'text-green-600' :
                index === 2 ? 'text-purple-600' :
                index === 3 ? 'text-orange-600' :
                'text-amber-600'
              }`} />
            </div>
            <div className="text-left">
              <p className="font-medium text-gray-900">{action.label}</p>
              <p className="text-sm text-gray-600">
                {index === 0 ? 'Add new asset' :
                 index === 1 ? 'Add or edit nominees' :
                 index === 2 ? 'Financial reports' :
                 index === 3 ? 'Manage vault requests' :
                 'Manage demat accounts'}
              </p>
            </div>
          </button>
        ))}
      </div>

      {/* View Mode Notice */}
      {viewMode === 'nominee' && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <div className="flex items-center space-x-2">
            <Eye className="w-5 h-5 text-blue-600" />
            <p className="text-blue-800 font-medium">Nominee Preview Mode</p>
          </div>
          <p className="text-blue-700 text-sm mt-1">
            This is what your nominees will see when they access their assigned assets. 
            They can only view assets you've specifically assigned to them.
          </p>
        </div>
      )}
    </div>
  );
};

export default OwnerDashboard;
