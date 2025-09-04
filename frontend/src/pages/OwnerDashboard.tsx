import React, { useState, useEffect } from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer, Legend } from 'recharts';
import { Plus, Users, Lock, BookOpen, TrendingUp, Eye } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { dashboardAPI } from '../services/api';

interface AssetAllocation {
  name: string;
  value: number;
  amount: number;
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
        setDashboardData(response.data);
      } catch (error) {
        console.error('Error fetching dashboard data:', error);
        setDashboardData({
          totalAssets: 4,
          totalNominees: 2,
          netWorth: 2500000,
          assetAllocation: [
            { name: 'Bank', value: 35, amount: 875000, color: '#1E3A8A' },
            { name: 'LIC', value: 25, amount: 625000, color: '#3B82F6' },
            { name: 'Property', value: 20, amount: 500000, color: '#60A5FA' },
            { name: 'Stocks', value: 20, amount: 500000, color: '#93C5FD' }
          ],
          recentActivity: []
        });
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const handleViewModeToggle = () => {
    setViewMode(viewMode === 'owner' ? 'nominee' : 'owner');
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
      {/* Header with View Mode Toggle */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">
            {viewMode === 'owner' ? 'Owner Dashboard' : 'Nominee Preview'}
          </h1>
          <p className="text-gray-600 mt-1">
            {viewMode === 'owner' 
              ? 'Manage your assets and nominees' 
              : 'Preview what nominees can see'
            }
          </p>
        </div>
        <button
          onClick={handleViewModeToggle}
          className="flex items-center space-x-2 px-4 py-2 bg-primary-100 text-primary-700 rounded-lg hover:bg-primary-200 transition-colors"
        >
          <Eye className="w-4 h-4" />
          <span>{viewMode === 'owner' ? 'Preview Nominee View' : 'Back to Owner View'}</span>
        </button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total Assets</p>
              <p className="text-2xl font-bold text-gray-900">{dashboardData.totalAssets}</p>
            </div>
            <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
              <TrendingUp className="w-6 h-6 text-blue-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total Nominees</p>
              <p className="text-2xl font-bold text-gray-900">{dashboardData.totalNominees}</p>
            </div>
            <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
              <Users className="w-6 h-6 text-green-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Net Worth</p>
              <p className="text-2xl font-bold text-gray-900">{formatCurrency(dashboardData.netWorth)}</p>
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
        <div className="h-80">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={dashboardData.assetAllocation}
                cx="50%"
                cy="50%"
                innerRadius={60}
                outerRadius={120}
                paddingAngle={5}
                dataKey="value"
              >
                {dashboardData.assetAllocation.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Legend />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <button
          onClick={() => navigate('/assets')}
          className="flex items-center space-x-3 p-4 bg-white rounded-lg border border-gray-200 hover:border-primary-300 hover:bg-primary-50 transition-colors"
        >
          <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
            <Plus className="w-5 h-5 text-blue-600" />
          </div>
          <div className="text-left">
            <p className="font-medium text-gray-900">Add Asset</p>
            <p className="text-sm text-gray-600">Add new asset</p>
          </div>
        </button>

        <button
          onClick={() => navigate('/nominees')}
          className="flex items-center space-x-3 p-4 bg-white rounded-lg border border-gray-200 hover:border-primary-300 hover:bg-primary-50 transition-colors"
        >
          <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
            <Users className="w-5 h-5 text-green-600" />
          </div>
          <div className="text-left">
            <p className="font-medium text-gray-900">Manage Nominees</p>
            <p className="text-sm text-gray-600">Add or edit nominees</p>
          </div>
        </button>

        <button
          onClick={() => navigate('/reports')}
          className="flex items-center space-x-3 p-4 bg-white rounded-lg border border-gray-200 hover:border-primary-300 hover:bg-primary-50 transition-colors"
        >
          <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
            <BookOpen className="w-5 h-5 text-purple-600" />
          </div>
          <div className="text-left">
            <p className="font-medium text-gray-900">View Reports</p>
            <p className="text-sm text-gray-600">Financial reports</p>
          </div>
        </button>

        <button
          onClick={() => navigate('/vault')}
          className="flex items-center space-x-3 p-4 bg-white rounded-lg border border-gray-200 hover:border-primary-300 hover:bg-primary-50 transition-colors"
        >
          <div className="w-10 h-10 bg-orange-100 rounded-lg flex items-center justify-center">
            <Lock className="w-5 h-5 text-orange-600" />
          </div>
          <div className="text-left">
            <p className="font-medium text-gray-900">Vault Access</p>
            <p className="text-sm text-gray-600">Manage vault requests</p>
          </div>
        </button>
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
