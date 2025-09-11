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

interface BatchedDashboardData extends DashboardStats {
  assets: any[];
  nominees: any[];
  tradingAccounts: any[];
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

  const { data: batchedData, isLoading, isError, error, refetch } = useQuery<BatchedDashboardData, Error>({
    queryKey: ['dashboardBatch', userId],
    queryFn: async () => {
      if (!userId) {
        console.warn('No user ID available, returning demo data');
        return {
          ...demoStats,
          assets: [],
          nominees: [],
          tradingAccounts: []
        };
      }

      try {
        console.log('Fetching batched dashboard data for user ID:', userId);
        
        // Single API call to get all dashboard data
        const response = await apiCall('/dashboard/batch');
        
        console.log('Batched dashboard data received successfully');
        return response;
      } catch (err) {
        console.error('Error fetching batched dashboard data:', err);
        return {
          ...demoStats,
          assets: [],
          nominees: [],
          tradingAccounts: []
        };
      }
    },
    enabled: !!userId,
    staleTime: 10 * 60 * 1000, // 10 minutes - increased from 5
    gcTime: 30 * 60 * 1000, // 30 minutes
    retry: 1, // Reduced retries for faster failure
    refetchOnWindowFocus: false,
    refetchOnMount: false, // Don't refetch if data exists
  });

  // Extract stats from batched data
  const stats: DashboardStats = batchedData ? {
    totalAssets: batchedData.totalAssets,
    totalNominees: batchedData.totalNominees,
    totalTradingAccounts: batchedData.totalTradingAccounts,
    totalValue: batchedData.totalValue,
    netWorth: batchedData.netWorth,
    assetAllocation: batchedData.assetAllocation,
    recentActivity: batchedData.recentActivity
  } : demoStats;

  return {
    stats,
    isLoading,
    isError,
    error,
    refetch,
    showDemoDataNotice: isError || (stats === demoStats && !isLoading),
    // Additional data for other components
    assets: batchedData?.assets || [],
    nominees: batchedData?.nominees || [],
    tradingAccounts: batchedData?.tradingAccounts || [],
  };
};
