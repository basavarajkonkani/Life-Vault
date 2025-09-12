import { useQuery } from "@tanstack/react-query";
import { useAuth } from "../useAuth";
import { dashboardAPI } from "../../services/api";

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

export const useDashboardStats = () => {
  const { user, userProfile } = useAuth();
  
  const { data: batchedData, isLoading, isError, error, refetch } = useQuery<BatchedDashboardData, Error>({
    queryKey: ["dashboardBatch", user?.id],
    queryFn: async () => {
      if (!user || !userProfile) {
        throw new Error("User not authenticated");
      }

      try {
        console.log("Fetching batched dashboard data for user ID:", user.id);
        
        // Try to get batched data first
        try {
          const response = await dashboardAPI.getBatchData();
          console.log("Batched dashboard data received successfully");
          return response;
        } catch (batchError) {
          console.warn("Batch API not available, fetching individual data:", batchError);
          
          // Fallback to individual API calls
          const [assets, nominees, tradingAccounts] = await Promise.all([
            dashboardAPI.getAssets().catch(() => []),
            dashboardAPI.getNominees().catch(() => []),
            dashboardAPI.getTradingAccounts().catch(() => [])
          ]);

          // Calculate stats from individual data
          const totalValue = assets.reduce((sum: number, asset: any) => sum + (asset.current_value || 0), 0);
          const assetAllocation = assets.map((asset: any, index: number) => ({
            name: asset.category || `Asset ${index + 1}`,
            value: totalValue > 0 ? (asset.current_value / totalValue) * 100 : 0,
            amount: asset.current_value || 0,
            color: `hsl(${(index * 137.5) % 360}, 70%, 50%)`
          }));

          return {
            totalAssets: assets.length,
            totalNominees: nominees.length,
            totalTradingAccounts: tradingAccounts.length,
            totalValue,
            netWorth: totalValue,
            assetAllocation,
            recentActivity: [],
            assets,
            nominees,
            tradingAccounts
          };
        }
      } catch (err) {
        console.error("Error fetching dashboard data:", err);
        throw new Error("Failed to fetch dashboard data");
      }
    },
    enabled: !!user && !!userProfile,
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 30 * 60 * 1000, // 30 minutes
    retry: 1,
    refetchOnWindowFocus: false,
    refetchOnMount: false,
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
  } : {
    totalAssets: 0,
    totalNominees: 0,
    totalTradingAccounts: 0,
    totalValue: 0,
    netWorth: 0,
    assetAllocation: [],
    recentActivity: []
  };

  return {
    stats,
    isLoading,
    isError,
    error,
    refetch,
    showDemoDataNotice: false, // Remove demo data notice
    // Additional data for other components
    assets: batchedData?.assets || [],
    nominees: batchedData?.nominees || [],
    tradingAccounts: batchedData?.tradingAccounts || [],
  };
};
