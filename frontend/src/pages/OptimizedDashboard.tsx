import React, { memo, useMemo } from 'react';
import { useOptimizedDashboardStats } from '../hooks/queries/useOptimizedDashboardStats';
import LoadingSpinner from '../components/LoadingSpinner';
import { 
  TrendingUp, 
  Users, 
  Building2, 
  DollarSign,
  Activity,
  PieChart,
  BarChart3
} from 'lucide-react';

// Memoized components for better performance
const StatCard = memo(({ 
  title, 
  value, 
  icon: Icon, 
  color, 
  trend 
}: {
  title: string;
  value: string | number;
  icon: React.ComponentType<any>;
  color: string;
  trend?: string;
}) => (
  <div className="card optimize-rendering">
    <div className="flex items-center justify-between">
      <div>
        <p className="text-sm font-medium text-gray-600">{title}</p>
        <p className="text-2xl font-bold text-gray-900">{value}</p>
        {trend && (
          <p className="text-sm text-green-600 flex items-center mt-1">
            <TrendingUp className="w-4 h-4 mr-1" />
            {trend}
          </p>
        )}
      </div>
      <div className={`p-3 rounded-lg ${color}`}>
        <Icon className="w-6 h-6 text-white" />
      </div>
    </div>
  </div>
));

const ChartCard = memo(({ 
  title, 
  children, 
  className = "" 
}: {
  title: string;
  children: React.ReactNode;
  className?: string;
}) => (
  <div className={`card optimize-rendering ${className}`}>
    <h3 className="text-lg font-semibold text-gray-900 mb-4">{title}</h3>
    {children}
  </div>
));

const OptimizedDashboard: React.FC = () => {
  const { data, isLoading, error } = useOptimizedDashboardStats();

  // Memoize expensive calculations
  const statsData = useMemo(() => {
    if (!data) return null;
    
    return {
      totalAssets: data.totalAssets || 0,
      totalNominees: data.totalNominees || 0,
      totalTradingAccounts: data.totalTradingAccounts || 0,
      totalValue: data.totalValue || 0,
      netWorth: data.netWorth || 0,
      assetAllocation: data.assetAllocation || [],
      recentActivity: data.recentActivity || []
    };
  }, [data]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-96">
        <LoadingSpinner />
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-12">
        <div className="text-red-600 mb-4">
          <Activity className="w-12 h-12 mx-auto mb-2" />
          <p className="text-lg font-medium">Error loading dashboard</p>
          <p className="text-sm">{error.message}</p>
        </div>
        <button 
          onClick={() => window.location.reload()}
          className="btn-primary"
        >
          Retry
        </button>
      </div>
    );
  }

  if (!statsData) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-500">No data available</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">Dashboard</h1>
          <p className="text-gray-600 mt-1">Welcome back! Here's your financial overview.</p>
        </div>
        <div className="mt-4 sm:mt-0">
          <div className="flex items-center text-sm text-gray-500">
            <Activity className="w-4 h-4 mr-2" />
            Last updated: {new Date().toLocaleTimeString()}
          </div>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="responsive-grid">
        <StatCard
          title="Total Assets"
          value={statsData.totalAssets}
          icon={TrendingUp}
          color="bg-blue-500"
          trend="+12% from last month"
        />
        <StatCard
          title="Total Nominees"
          value={statsData.totalNominees}
          icon={Users}
          color="bg-green-500"
        />
        <StatCard
          title="Trading Accounts"
          value={statsData.totalTradingAccounts}
          icon={Building2}
          color="bg-purple-500"
        />
        <StatCard
          title="Net Worth"
          value={`$${statsData.netWorth.toLocaleString()}`}
          icon={DollarSign}
          color="bg-yellow-500"
          trend="+8% from last month"
        />
      </div>

      {/* Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Asset Allocation Chart */}
        <ChartCard title="Asset Allocation">
          <div className="h-64 flex items-center justify-center">
            {statsData.assetAllocation.length > 0 ? (
              <div className="w-full h-full">
                <PieChart className="w-full h-full text-gray-400" />
                <p className="text-center text-sm text-gray-500 mt-2">
                  {statsData.assetAllocation.length} asset categories
                </p>
              </div>
            ) : (
              <div className="text-center text-gray-500">
                <PieChart className="w-12 h-12 mx-auto mb-2" />
                <p>No asset data available</p>
              </div>
            )}
          </div>
        </ChartCard>

        {/* Recent Activity */}
        <ChartCard title="Recent Activity">
          <div className="space-y-3">
            {statsData.recentActivity.length > 0 ? (
              statsData.recentActivity.slice(0, 5).map((activity: any, index: number) => (
                <div key={index} className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
                  <div className={`w-2 h-2 rounded-full ${
                    activity.status === 'success' ? 'bg-green-500' : 'bg-red-500'
                  }`} />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-900 truncate">
                      {activity.description}
                    </p>
                    <p className="text-xs text-gray-500">
                      {new Date(activity.timestamp).toLocaleDateString()}
                    </p>
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center text-gray-500 py-8">
                <Activity className="w-8 h-8 mx-auto mb-2" />
                <p>No recent activity</p>
              </div>
            )}
          </div>
        </ChartCard>
      </div>

      {/* Quick Actions */}
      <div className="card optimize-rendering">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h3>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          <button className="btn-primary text-center py-3">
            Add Asset
          </button>
          <button className="btn-secondary text-center py-3">
            Add Nominee
          </button>
          <button className="btn-secondary text-center py-3">
            View Reports
          </button>
          <button className="btn-secondary text-center py-3">
            Settings
          </button>
        </div>
      </div>
    </div>
  );
};

export default OptimizedDashboard;
