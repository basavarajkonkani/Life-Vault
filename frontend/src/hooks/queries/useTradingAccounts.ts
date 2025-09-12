import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useAuth } from "../useAuth";
import { tradingAccountsAPI } from "../../services/api";

interface TradingAccount {
  id: string;
  platform: string;
  account_number: string;
  current_value: number;
  status: string;
  notes: string;
  created_at: string;
  updated_at: string;
}

interface TradingAccountInput {
  platform: string;
  accountNumber: string;
  currentValue: number;
  status: string;
  notes: string;
}

export const useTradingAccounts = () => {
  const queryClient = useQueryClient();
  const { user, userProfile } = useAuth();

  // Fetch trading accounts
  const {
    data: tradingAccounts = [],
    isLoading,
    isError,
    error,
    refetch
  } = useQuery<TradingAccount[]>({
    queryKey: ["tradingAccounts", user?.id],
    queryFn: async () => {
      if (!user || !userProfile) {
        throw new Error("User not authenticated");
      }

      console.log("Fetching trading accounts for user ID:", user.id);
      return await tradingAccountsAPI.getAll();
    },
    enabled: !!user && !!userProfile,
    staleTime: 5 * 60 * 1000,
    gcTime: 30 * 60 * 1000,
    retry: 2,
    retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
  });

  // Create trading account mutation
  const createTradingAccount = useMutation({
    mutationFn: async (tradingAccountData: TradingAccountInput) => {
      if (!user || !userProfile) {
        throw new Error("User not authenticated");
      }

      console.log("Creating trading account for user ID:", user.id, "with data:", tradingAccountData);

      // Validate required fields
      if (!tradingAccountData.platform || !tradingAccountData.accountNumber) {
        throw new Error("All required fields must be filled");
      }

      if (tradingAccountData.currentValue < 0) {
        throw new Error("Current value must be a positive number");
      }

      const response = await tradingAccountsAPI.create({
        platform: tradingAccountData.platform,
        accountNumber: tradingAccountData.accountNumber,
        currentValue: tradingAccountData.currentValue,
        status: tradingAccountData.status || "Active",
        notes: tradingAccountData.notes || "",
      });

      console.log("Trading account created successfully:", response);
      return response;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["tradingAccounts", user?.id] });
      queryClient.invalidateQueries({ queryKey: ["dashboardBatch", user?.id] });
    },
    onError: (error) => {
      console.error("Create trading account mutation error:", error);
    },
  });

  // Update trading account mutation
  const updateTradingAccount = useMutation({
    mutationFn: async ({ id, ...tradingAccountData }: { id: string } & Partial<TradingAccountInput>) => {
      console.log("Updating trading account with ID:", id, "with data:", tradingAccountData);
      
      // Validate required fields
      if (tradingAccountData.platform && !tradingAccountData.platform.trim()) {
        throw new Error("Platform is required");
      }
      if (tradingAccountData.accountNumber && !tradingAccountData.accountNumber.trim()) {
        throw new Error("Account number is required");
      }
      if (tradingAccountData.currentValue !== undefined && tradingAccountData.currentValue < 0) {
        throw new Error("Current value must be a positive number");
      }

      const response = await tradingAccountsAPI.update(id, {
        platform: tradingAccountData.platform,
        accountNumber: tradingAccountData.accountNumber,
        currentValue: tradingAccountData.currentValue,
        status: tradingAccountData.status,
        notes: tradingAccountData.notes,
      });

      console.log("Trading account updated successfully:", response);
      return response;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["tradingAccounts", user?.id] });
      queryClient.invalidateQueries({ queryKey: ["dashboardBatch", user?.id] });
    },
    onError: (error) => {
      console.error("Update trading account mutation error:", error);
    },
  });

  // Delete trading account mutation
  const deleteTradingAccount = useMutation({
    mutationFn: async (id: string) => {
      console.log("Deleting trading account with ID:", id);
      
      if (!id) {
        throw new Error("Trading account ID is required for deletion");
      }
      
      await tradingAccountsAPI.delete(id);

      console.log("Trading account deleted successfully");
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["tradingAccounts", user?.id] });
      queryClient.invalidateQueries({ queryKey: ["dashboardBatch", user?.id] });
    },
    onError: (error) => {
      console.error("Delete trading account mutation error:", error);
    },
  });

  return {
    tradingAccounts,
    isLoading,
    isError,
    error,
    refetch,
    createTradingAccount,
    updateTradingAccount,
    deleteTradingAccount,
    // Individual loading states
    isCreating: createTradingAccount.isPending,
    isUpdating: updateTradingAccount.isPending,
    isDeleting: deleteTradingAccount.isPending,
    // Individual error states
    createError: createTradingAccount.error,
    updateError: updateTradingAccount.error,
    deleteError: deleteTradingAccount.error,
  };
};
