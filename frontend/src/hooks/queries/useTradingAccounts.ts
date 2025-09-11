import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getUserIdSync, ensureDemoUser } from '../../lib/supabase';
import { useAuth } from '../useAuth';

interface TradingAccount {
  id: string;
  broker_name: string;
  client_id: string;
  demat_number: string;
  nominee_id: string | null;
  current_value: number;
  status: string;
  notes: string;
  created_at: string;
  updated_at: string;
}

interface TradingAccountInput {
  brokerName: string;
  clientId: string;
  dematNumber: string;
  nomineeId?: string | null;
  currentValue: number;
  status: string;
  notes: string;
}

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

export const useTradingAccounts = () => {
  const queryClient = useQueryClient();
  const { getUserId } = useAuth();
  
  // Get user ID with fallback
  const userId = getUserId() || getUserIdSync() || ensureDemoUser()?.id;

  // Fetch trading accounts
  const {
    data: tradingAccounts = [],
    isLoading,
    isError,
    error,
    refetch
  } = useQuery<TradingAccount[]>({
    queryKey: ['tradingAccounts', userId],
    queryFn: async () => {
      if (!userId) {
        console.error('No user ID available for trading accounts query');
        throw new Error('User not authenticated');
      }

      console.log('Fetching trading accounts for user ID:', userId);
      return await apiCall('/dashboard/trading-accounts');
    },
    enabled: !!userId,
    staleTime: 5 * 60 * 1000,
    gcTime: 30 * 60 * 1000,
    retry: 2,
    retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
  });

  // Create trading account mutation
  const createTradingAccount = useMutation({
    mutationFn: async (accountData: TradingAccountInput) => {
      const currentUserId = getUserId() || getUserIdSync() || ensureDemoUser()?.id;
      if (!currentUserId) {
        console.error('No user ID available for create trading account');
        throw new Error('User not authenticated');
      }

      console.log('Creating trading account for user ID:', currentUserId, 'with data:', accountData);

      // Validate required fields
      if (!accountData.brokerName || !accountData.clientId || !accountData.dematNumber) {
        throw new Error('All required fields must be filled');
      }

      if (accountData.currentValue < 0) {
        throw new Error('Current value must be a positive number');
      }

      const response = await apiCall('/trading-accounts', {
        method: 'POST',
        body: JSON.stringify({
          brokerName: accountData.brokerName,
          clientId: accountData.clientId,
          dematNumber: accountData.dematNumber,
          nomineeId: accountData.nomineeId,
          currentValue: accountData.currentValue,
          status: accountData.status || 'Active',
          notes: accountData.notes || '',
        }),
      });

      console.log('Trading account created successfully:', response);
      return response;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tradingAccounts', userId] });
    },
    onError: (error) => {
      console.error('Create trading account mutation error:', error);
    },
  });

  // Update trading account mutation
  const updateTradingAccount = useMutation({
    mutationFn: async ({ id, ...accountData }: { id: string } & Partial<TradingAccountInput>) => {
      console.log('Updating trading account with ID:', id, 'with data:', accountData);
      
      // Validate required fields
      if (accountData.brokerName && !accountData.brokerName.trim()) {
        throw new Error('Broker name is required');
      }
      if (accountData.clientId && !accountData.clientId.trim()) {
        throw new Error('Client ID is required');
      }
      if (accountData.dematNumber && !accountData.dematNumber.trim()) {
        throw new Error('Demat number is required');
      }
      if (accountData.currentValue !== undefined && accountData.currentValue < 0) {
        throw new Error('Current value must be a positive number');
      }

      const response = await apiCall(`/trading-accounts/${id}`, {
        method: 'PUT',
        body: JSON.stringify({
          brokerName: accountData.brokerName,
          clientId: accountData.clientId,
          dematNumber: accountData.dematNumber,
          nomineeId: accountData.nomineeId,
          currentValue: accountData.currentValue,
          status: accountData.status,
          notes: accountData.notes,
        }),
      });

      console.log('Trading account updated successfully:', response);
      return response;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tradingAccounts', userId] });
    },
    onError: (error) => {
      console.error('Update trading account mutation error:', error);
    },
  });

  // Delete trading account mutation
  const deleteTradingAccount = useMutation({
    mutationFn: async (id: string) => {
      console.log('Deleting trading account with ID:', id);
      
      if (!id) {
        throw new Error('Trading account ID is required for deletion');
      }
      
      await apiCall(`/trading-accounts/${id}`, {
        method: 'DELETE',
      });

      console.log('Trading account deleted successfully');
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tradingAccounts', userId] });
    },
    onError: (error) => {
      console.error('Delete trading account mutation error:', error);
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
