import { useQuery } from '@tanstack/react-query';
import { getUserIdSync, ensureDemoUser } from '../../lib/supabase';
import { useAuth } from '../useAuth';

interface DashboardStats {
  totalAssets: number;
  totalNominees: number;
  totalTradingAccounts: number;
  totalValue: number;
  netWorth: number;
  assetAllocation: { name: string; value: number; amount: number; color: string }[];
  recentActivity: any[];
}

const demoStats: DashboardStats = {
  totalAssets: 6,
  totalNominees: 2,
  totalTradingAccounts: 3,
  totalValue: 3000000,
  netWorth: 3000000,
  assetAllocation: [
    { name: 'Bank Account', value: 16.7, amount: 500000, color: '#1E3A8A' },
    { name: 'Fixed Deposit', value: 33.3, amount: 1000000, color: '#3B82F6' },
    { name: 'Mutual Fund', value: 25.0, amount: 750000, color: '#60A5FA' },
    { name: 'LIC Policy', value: 8.3, amount: 250000, color: '#93C5FD' },
    { name: 'Trading Account (Zerodha)', value: 10.0, amount: 300000, color: '#A78BFA' },
    { name: 'Trading Account (Upstox)', value: 6.7, amount: 200000, color: '#DBEAFE' }
  ],
  recentActivity: []
};

// Backend API base URL
const API_BASE_URL = 'http://localhost:3001/api';

// Helper function to make authenticated API calls
const apiCall = async (endpoint: string, options: RequestInit = {}) => {
  // Use demo token for now
  const token = 'demo-token';
  
  const response = await fetch(`${API_BASE_URL}${endpoint}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
      ...options.headers,
    },
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    const errorMessage = errorData.error || `HTTP error! status: ${response.status}`;
    throw new Error(errorMessage);
  }

  return response.json();
};

export const useDashboardStats = () => {
  const { getUserId } = useAuth();
  
  // Get user ID with fallback
  const userId = getUserId() || getUserIdSync() || ensureDemoUser()?.id;

  const { data: stats, isLoading, isError, error, refetch } = useQuery<DashboardStats, Error>({
    queryKey: ['dashboardStats', userId],
    queryFn: async () => {
      if (!userId) {
        console.warn('No user ID available, returning demo data');
        return demoStats;
      }

      try {
        console.log('Fetching dashboard stats for user ID:', userId);
        
        // Fetch stats from backend
        const statsData = await apiCall('/dashboard/stats');
        
        // Fetch detailed data for asset allocation
        const [assetsData, tradingAccountsData] = await Promise.allSettled([
          apiCall('/dashboard/assets'),
          apiCall('/dashboard/trading-accounts')
        ]);

        const assets = assetsData.status === 'fulfilled' ? assetsData.value || [] : [];
        const tradingAccounts = tradingAccountsData.status === 'fulfilled' ? tradingAccountsData.value || [] : [];

        const colors = ['#1E3A8A', '#3B82F6', '#60A5FA', '#93C5FD', '#DBEAFE', '#EFF6FF', '#A78BFA'];

        const assetAllocation = [
          ...assets.map((asset: any, index: number) => ({
            name: asset.category,
            value: parseFloat(asset.current_value || '0'),
            amount: parseFloat(asset.current_value || '0'),
            color: colors[index % colors.length]
          })),
          ...tradingAccounts.map((account: any, index: number) => ({
            name: `Trading Account (${account.broker_name})`,
            value: parseFloat(account.current_value || '0'),
            amount: parseFloat(account.current_value || '0'),
            color: colors[(assets.length + index) % colors.length]
          }))
        ];

        const realStats = {
          totalAssets: statsData.totalAssets || 0,
          totalNominees: statsData.totalNominees || 0,
          totalTradingAccounts: statsData.totalTradingAccounts || 0,
          totalValue: statsData.totalValue || 0,
          netWorth: statsData.totalValue || 0,
          assetAllocation,
          recentActivity: []
        };

        console.log('Dashboard stats calculated successfully:', realStats);
        return realStats;
      } catch (err) {
        console.error('Error fetching dashboard stats:', err);
        return demoStats; // Fallback to demo data on error
      }
    },
    enabled: !!userId,
    staleTime: 5 * 60 * 1000,
    gcTime: 30 * 60 * 1000,
    retry: 2,
  });

  return {
    stats: stats || demoStats,
    isLoading,
    isError,
    error,
    refetch,
    showDemoDataNotice: isError || (stats === demoStats && !isLoading),
  };
};
