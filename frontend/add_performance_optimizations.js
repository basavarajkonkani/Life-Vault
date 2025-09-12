const fs = require('fs');

// Add performance optimizations to the dashboard
let content = fs.readFileSync('src/pages/Dashboard.tsx', 'utf8');

// Add React.memo and useMemo optimizations
const optimizedContent = `import React, { Suspense, useState, useEffect, useMemo, memo } from 'react';
import { Plus, Users, Lock, TrendingUp, Eye, Building2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useDashboardStats } from '../hooks/queries/useDashboardStats';
import DashboardSkeleton from '../components/skeletons/DashboardSkeleton';

// Lazy load the heavy chart component
const PieChart = React.lazy(() => 
  import('recharts').then(module => ({
    default: module.PieChart
  }))
);

const Pie = React.lazy(() => 
  import('recharts').then(module => ({
    default: module.Pie
  }))
);

const Cell = React.lazy(() => 
  import('recharts').then(module => ({
    default: module.Cell
  }))
);

const ResponsiveContainer = React.lazy(() => 
  import('recharts').then(module => ({
    default: module.ResponsiveContainer
  }))
);

const Legend = React.lazy(() => 
  import('recharts').then(module => ({
    default: module.Legend
  }))
);

const Tooltip = React.lazy(() => 
  import('recharts').then(module => ({
    default: module.Tooltip
  }))
);

// Memoized components for better performance
const StatCard = memo(({ title, value, icon: Icon, color, onClick }) => (
  <div 
    className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow cursor-pointer"
    onClick={onClick}
  >
    <div className="flex items-center justify-between">
      <div>
        <p className="text-sm font-medium text-gray-600">{title}</p>
        <p className="text-2xl font-bold text-gray-900">{value}</p>
      </div>
      <div className={`p-3 rounded-full ${color}`}>
        <Icon className="h-6 w-6 text-white" />
      </div>
    </div>
  </div>
));

const Dashboard: React.FC = () => {
  const navigate = useNavigate();
  const [showChart, setShowChart] = useState(false);

  // Use optimized React Query for dashboard stats
  const { stats, isLoading, isError, error, refetch, showDemoDataNotice } = useDashboardStats();

  // Lazy load chart after initial render
  useEffect(() => {
    const timer = setTimeout(() => {
      setShowChart(true);
    }, 100); // Small delay to prioritize initial content

    return () => clearTimeout(timer);
  }, []);

  // Memoized currency formatter
  const formatCurrency = useMemo(() => (amount: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0,
    }).format(amount);
  }, []);

  // Memoized stat cards data
  const statCards = useMemo(() => [
    {
      title: 'Total Assets',
      value: stats?.totalAssets || 0,
      icon: Building2,
      color: 'bg-blue-500',
      onClick: () => navigate('/assets')
    },
    {
      title: 'Nominees',
      value: stats?.totalNominees || 0,
      icon: Users,
      color: 'bg-green-500',
      onClick: () => navigate('/nominees')
    },
    {
      title: 'Trading Accounts',
      value: stats?.totalTradingAccounts || 0,
      icon: TrendingUp,
      color: 'bg-purple-500',
      onClick: () => navigate('/trading-accounts')
    },
    {
      title: 'Net Worth',
      value: formatCurrency(stats?.netWorth || 0),
      icon: Lock,
      color: 'bg-orange-500',
      onClick: () => navigate('/reports')
    }
  ], [stats, formatCurrency, navigate]);

  if (isLoading) {
    return <DashboardSkeleton />;
  }

  if (isError) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-red-600 mb-4">Error Loading Dashboard</h2>
          <p className="text-gray-600 mb-4">{error?.message || 'Failed to load dashboard data'}</p>
          <button
            onClick={() => refetch()}
            className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
          <p className="mt-2 text-gray-600">Overview of your financial assets and nominees.</p>
        </div>

        {/* Demo Data Notice */}
        {showDemoDataNotice && (
          <div className="mb-6 bg-yellow-50 border border-yellow-200 rounded-md p-4">
            <div className="flex">
              <div className="flex-shrink-0">
                <Eye className="h-5 w-5 text-yellow-400" />
              </div>
              <div className="ml-3">
                <h3 className="text-sm font-medium text-yellow-800">
                  Demo Data Notice
                </h3>
                <div className="mt-2 text-sm text-yellow-700">
                  <p>You are currently viewing demo data. Connect to your Supabase database to see real data.</p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {statCards.map((card, index) => (
            <StatCard key={index} {...card} />
          ))}
        </div>

        {/* Action Buttons */}
        <div className="flex flex-wrap gap-4 mb-8">
          <button
            onClick={() => navigate('/assets')}
            className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            <Plus className="h-5 w-5 mr-2" />
            Add Asset
          </button>
          <button
            onClick={() => navigate('/nominees')}
            className="flex items-center px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
          >
            <Users className="h-5 w-5 mr-2" />
            Add Nominee
          </button>
        </div>

        {/* Charts Section */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Asset Allocation Chart */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Asset Allocation</h3>
            {showChart && stats?.assetAllocation && stats.assetAllocation.length > 0 ? (
              <Suspense fallback={<div className="h-64 flex items-center justify-center">Loading chart...</div>}>
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      data={stats.assetAllocation}
                      cx="50%"
                      cy="50%"
                      innerRadius={60}
                      outerRadius={120}
                      paddingAngle={5}
                      dataKey="value"
                    >
                      {stats.assetAllocation.map((entry, index) => (
                        <Cell key={`cell-\${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip 
                      formatter={(value: number) => [`\${value.toFixed(1)}%`, 'Allocation']}
                      labelFormatter={(label) => `\${label}`}
                    />
                    <Legend />
                  </PieChart>
                </ResponsiveContainer>
              </Suspense>
            ) : (
              <div className="h-64 flex items-center justify-center text-gray-500">
                No asset data available
              </div>
            )}
          </div>

          {/* Recent Activity */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Recent Activity</h3>
            {stats?.recentActivity && stats.recentActivity.length > 0 ? (
              <div className="space-y-4">
                {stats.recentActivity.map((activity, index) => (
                  <div key={index} className="flex items-center space-x-3">
                    <div className="flex-shrink-0">
                      <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm text-gray-900">{activity.description}</p>
                      <p className="text-xs text-gray-500">
                        {new Date(activity.timestamp).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-gray-500 text-center py-8">
                No recent activity
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;`;

fs.writeFileSync('src/pages/Dashboard.tsx', optimizedContent);
console.log('✅ Dashboard performance optimizations added');
