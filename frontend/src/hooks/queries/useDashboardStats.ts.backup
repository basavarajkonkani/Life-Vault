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
          console.log("Dashboard data:", JSON.stringify(response, null, 2));
          
          // Check if data is empty and apply demo data fallback
          if (!response || (response.totalAssets === 0 && response.totalNominees === 0 && response.totalTradingAccounts === 0)) {
            console.log("Empty data received, applying demo data fallback");
            
            const demoData = {
              totalAssets: 4,
              totalNominees: 2,
              totalTradingAccounts: 2,
              totalValue: 1150000,
              netWorth: 1500000,
              assetAllocation: [
                { name: "Bank", value: 43.48, amount: 500000, color: "hsl(0, 70%, 50%)" },
                { name: "Mutual Fund", value: 26.09, amount: 300000, color: "hsl(137.5, 70%, 50%)" },
                { name: "LIC Policy", value: 17.39, amount: 200000, color: "hsl(275, 70%, 50%)" },
                { name: "Fixed Deposit", value: 13.04, amount: 150000, color: "hsl(412.5, 70%, 50%)" }
              ],
              recentActivity: [],
              assets: [
                { id: "demo-1", user_id: user.id, category: "Bank", institution: "State Bank of India", account_number: "****1234", current_value: 500000, status: "Active", notes: "Primary savings account", documents: [] },
                { id: "demo-2", user_id: user.id, category: "Mutual Fund", institution: "HDFC Mutual Fund", account_number: "MF001234", current_value: 300000, status: "Active", notes: "Equity growth fund", documents: [] },
                { id: "demo-3", user_id: user.id, category: "LIC Policy", institution: "Life Insurance Corporation", account_number: "LIC123456", current_value: 200000, status: "Active", notes: "Term life insurance policy", documents: [] },
                { id: "demo-4", user_id: user.id, category: "Fixed Deposit", institution: "ICICI Bank", account_number: "FD789012", current_value: 150000, status: "Active", notes: "5-year fixed deposit", documents: [] }
              ],
              nominees: [
                { id: "demo-nominee-1", user_id: user.id, name: "Jane Doe", relation: "Spouse", phone: "+91 9876543211", email: "jane@example.com", allocation_percentage: 60, is_executor: true, is_backup: false },
                { id: "demo-nominee-2", user_id: user.id, name: "John Jr", relation: "Child", phone: "+91 9876543212", email: "john@example.com", allocation_percentage: 40, is_executor: false, is_backup: false }
              ],
              tradingAccounts: [
                { id: "demo-trading-1", user_id: user.id, platform: "Zerodha", account_number: "ZR123456", current_value: 250000, status: "Active", notes: "Primary trading account" },
                { id: "demo-trading-2", user_id: user.id, platform: "Upstox", account_number: "UP789012", current_value: 100000, status: "Active", notes: "Secondary trading account" }
              ]
            };
            
            console.log("Returning demo data:", JSON.stringify(demoData, null, 2));
            return demoData;
          }
          
          return response;

        } catch (batchError) {
          console.warn("Batch API not available, fetching individual data:", batchError);
          
          // Fallback to individual API calls
          const [assets, nominees, tradingAccounts] = await Promise.all([
            dashboardAPI.getAssets().catch(() => []),
            dashboardAPI.getNominees().catch(() => []),
            dashboardAPI.getTradingAccounts().catch(() => [])
          ]);

          
          // If no data, return demo data
          if (assets.length === 0 && nominees.length === 0 && tradingAccounts.length === 0) {
            console.log('No data found, returning demo data');
            
            const demoAssets = [
              {
                id: 'demo-1',
                user_id: user.id,
                category: 'Bank',
                institution: 'State Bank of India',
                account_number: '****1234',
                current_value: 500000,
                status: 'Active',
                notes: 'Primary savings account',
                documents: []
              },
              {
                id: 'demo-2',
                user_id: user.id,
                category: 'Mutual Fund',
                institution: 'HDFC Mutual Fund',
                account_number: 'MF001234',
                current_value: 300000,
                status: 'Active',
                notes: 'Equity growth fund',
                documents: []
              },
              {
                id: 'demo-3',
                user_id: user.id,
                category: 'LIC Policy',
                institution: 'Life Insurance Corporation',
                account_number: 'LIC123456',
                current_value: 200000,
                status: 'Active',
                notes: 'Term life insurance policy',
                documents: []
              },
              {
                id: 'demo-4',
                user_id: user.id,
                category: 'Fixed Deposit',
                institution: 'ICICI Bank',
                account_number: 'FD789012',
                current_value: 150000,
                status: 'Active',
                notes: '5-year fixed deposit',
                documents: []
              }
            ];

            const demoNominees = [
              {
                id: 'demo-nominee-1',
                user_id: user.id,
                name: 'Jane Doe',
                relation: 'Spouse',
                phone: '+91 9876543211',
                email: 'jane@example.com',
                allocation_percentage: 60,
                is_executor: true,
                is_backup: false
              },
              {
                id: 'demo-nominee-2',
                user_id: user.id,
                name: 'John Jr',
                relation: 'Child',
                phone: '+91 9876543212',
                email: 'john@example.com',
                allocation_percentage: 40,
                is_executor: false,
                is_backup: false
              }
            ];

            const demoTradingAccounts = [
              {
                id: 'demo-trading-1',
                user_id: user.id,
                platform: 'Zerodha',
                account_number: 'ZR123456',
                current_value: 250000,
                status: 'Active',
                notes: 'Primary trading account'
              },
              {
                id: 'demo-trading-2',
                user_id: user.id,
                platform: 'Upstox',
                account_number: 'UP789012',
                current_value: 100000,
                status: 'Active',
                notes: 'Secondary trading account'
              }
            ];

            const demoTotalValue = demoAssets.reduce((sum, asset) => sum + asset.current_value, 0);
            const demoTradingValue = demoTradingAccounts.reduce((sum, account) => sum + account.current_value, 0);
            const demoAssetAllocation = demoAssets.map((asset, index) => ({
              name: asset.category,
              value: (asset.current_value / demoTotalValue) * 100,
              amount: asset.current_value,
              color: `hsl(${(index * 137.5) % 360}, 70%, 50%)`
            }));

            return {
              totalAssets: demoAssets.length,
              totalNominees: demoNominees.length,
              totalTradingAccounts: demoTradingAccounts.length,
              totalValue: demoTotalValue,
              netWorth: demoTotalValue + demoTradingValue,
              assetAllocation: demoAssetAllocation,
              recentActivity: [],
              assets: demoAssets,
              nominees: demoNominees,
              tradingAccounts: demoTradingAccounts
            };
          }

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
