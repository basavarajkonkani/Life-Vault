import { useQuery } from '@tanstack/react-query';
import { useAuth } from '../../contexts/AuthContext';
import { dashboardAPI } from '../../services/api';

export interface AssetAllocation {
  name: string;
  value: number;
  amount: number;
  color: string;
}

export interface BatchedDashboardData {
  totalAssets: number;
  totalNominees: number;
  totalTradingAccounts: number;
  totalValue: number;
  netWorth: number;
  assetAllocation: AssetAllocation[];
  recentActivity: any[];
  assets: any[];
  nominees: any[];
  tradingAccounts: any[];
}

export const useDashboardStats = () => {
  const { user, userProfile } = useAuth();

  const { data: batchedData, isLoading, isError, error, refetch } = useQuery<BatchedDashboardData, Error>({
    queryKey: ["dashboardBatch", user?.id],
    queryFn: async () => {
      if (!user || !userProfile) {
        throw new Error("User not authenticated");
      }

      console.log("Fetching real dashboard data for user ID:", user.id);
      
      try {
        const response = await dashboardAPI.getBatchData();
        console.log("Real dashboard data received:", response);
        return response;
      } catch (err) {
        console.error("Error fetching dashboard data:", err);
        throw err;
      }
    },
    enabled: !!user && !!userProfile,
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 30 * 60 * 1000, // 30 minutes
    retry: 2,
    refetchOnWindowFocus: false,
    refetchOnMount: true,
  });

  return {
    stats: batchedData,
    isLoading,
    isError,
    error,
    refetch,
    showDemoDataNotice: false // No more demo data
  };
};