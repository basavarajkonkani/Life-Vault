import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getUserIdSync, ensureDemoUser } from '../../lib/supabase';
import { useAuth } from '../useAuth';

interface Asset {
  id: string;
  category: string;
  institution: string;
  account_number: string;
  current_value: number;
  status: string;
  notes: string;
  documents: string[];
  created_at: string;
  updated_at: string;
}

interface AssetInput {
  category: string;
  institution: string;
  accountNumber: string;
  currentValue: number;
  status: string;
  notes: string;
  documents: string[];
}

// Backend API base URL
const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:3001/api';

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

export const useAssets = () => {
  const queryClient = useQueryClient();
  const { getUserId } = useAuth();
  
  // Get user ID with fallback
  const userId = getUserId() || getUserIdSync() || ensureDemoUser()?.id;

  // Fetch assets
  const {
    data: assets = [],
    isLoading,
    isError,
    error,
    refetch
  } = useQuery<Asset[]>({
    queryKey: ['assets', userId],
    queryFn: async () => {
      if (!userId) {
        console.error('No user ID available for assets query');
        throw new Error('User not authenticated');
      }

      console.log('Fetching assets for user ID:', userId);
      return await apiCall('/dashboard/assets');
    },
    enabled: !!userId,
    staleTime: 5 * 60 * 1000,
    gcTime: 30 * 60 * 1000,
    retry: 2,
    retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
  });

  // Create asset mutation
  const createAsset = useMutation({
    mutationFn: async (assetData: AssetInput) => {
      const currentUserId = getUserId() || getUserIdSync() || ensureDemoUser()?.id;
      if (!currentUserId) {
        console.error('No user ID available for create asset');
        throw new Error('User not authenticated');
      }

      console.log('Creating asset for user ID:', currentUserId, 'with data:', assetData);

      // Validate required fields
      if (!assetData.category || !assetData.institution || !assetData.accountNumber) {
        throw new Error('All required fields must be filled');
      }

      if (assetData.currentValue < 0) {
        throw new Error('Current value must be a positive number');
      }

      const response = await apiCall('/assets', {
        method: 'POST',
        body: JSON.stringify({
          category: assetData.category,
          institution: assetData.institution,
          accountNumber: assetData.accountNumber,
          currentValue: assetData.currentValue,
          status: assetData.status || 'Active',
          notes: assetData.notes || '',
          documents: assetData.documents || [],
        }),
      });

      console.log('Asset created successfully:', response);
      return response;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['assets', userId] });
    },
    onError: (error) => {
      console.error('Create asset mutation error:', error);
    },
  });

  // Update asset mutation
  const updateAsset = useMutation({
    mutationFn: async ({ id, ...assetData }: { id: string } & Partial<AssetInput>) => {
      console.log('Updating asset with ID:', id, 'with data:', assetData);
      
      // Validate required fields
      if (assetData.category && !assetData.category.trim()) {
        throw new Error('Category is required');
      }
      if (assetData.institution && !assetData.institution.trim()) {
        throw new Error('Institution is required');
      }
      if (assetData.accountNumber && !assetData.accountNumber.trim()) {
        throw new Error('Account number is required');
      }
      if (assetData.currentValue !== undefined && assetData.currentValue < 0) {
        throw new Error('Current value must be a positive number');
      }

      const response = await apiCall(`/assets/${id}`, {
        method: 'PUT',
        body: JSON.stringify({
          category: assetData.category,
          institution: assetData.institution,
          accountNumber: assetData.accountNumber,
          currentValue: assetData.currentValue,
          status: assetData.status,
          notes: assetData.notes,
          documents: assetData.documents,
        }),
      });

      console.log('Asset updated successfully:', response);
      return response;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['assets', userId] });
    },
    onError: (error) => {
      console.error('Update asset mutation error:', error);
    },
  });

  // Delete asset mutation
  const deleteAsset = useMutation({
    mutationFn: async (id: string) => {
      console.log('Deleting asset with ID:', id);
      
      if (!id) {
        throw new Error('Asset ID is required for deletion');
      }
      
      await apiCall(`/assets/${id}`, {
        method: 'DELETE',
      });

      console.log('Asset deleted successfully');
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['assets', userId] });
    },
    onError: (error) => {
      console.error('Delete asset mutation error:', error);
    },
  });

  return {
    assets,
    isLoading,
    isError,
    error,
    refetch,
    createAsset,
    updateAsset,
    deleteAsset,
    // Individual loading states
    isCreating: createAsset.isPending,
    isUpdating: updateAsset.isPending,
    isDeleting: deleteAsset.isPending,
    // Individual error states
    createError: createAsset.error,
    updateError: updateAsset.error,
    deleteError: deleteAsset.error,
  };
};
