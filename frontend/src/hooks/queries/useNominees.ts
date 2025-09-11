import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getUserIdSync, ensureDemoUser } from '../../lib/supabase';
import { useAuth } from '../useAuth';

interface Nominee {
  id: string;
  name: string;
  relation: string;
  phone: string;
  email: string;
  allocation_percentage: number;
  is_executor: boolean;
  is_backup: boolean;
  created_at: string;
  updated_at: string;
}

interface NomineeInput {
  name: string;
  relation: string;
  phone: string;
  email: string;
  allocation_percentage: number;
  is_executor: boolean;
  is_backup: boolean;
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

export const useNominees = () => {
  const queryClient = useQueryClient();
  const { getUserId } = useAuth();
  
  // Get user ID with fallback
  const userId = getUserId() || getUserIdSync() || ensureDemoUser()?.id;

  // Fetch nominees
  const {
    data: nominees = [],
    isLoading,
    isError,
    error,
    refetch
  } = useQuery<Nominee[]>({
    queryKey: ['nominees', userId],
    queryFn: async () => {
      if (!userId) {
        console.error('No user ID available for nominees query');
        throw new Error('User not authenticated');
      }

      console.log('Fetching nominees for user ID:', userId);
      return await apiCall('/dashboard/nominees');
    },
    enabled: !!userId,
    staleTime: 5 * 60 * 1000,
    gcTime: 30 * 60 * 1000,
    retry: 2,
    retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
  });

  // Create nominee mutation
  const createNominee = useMutation({
    mutationFn: async (nomineeData: NomineeInput) => {
      const currentUserId = getUserId() || getUserIdSync() || ensureDemoUser()?.id;
      if (!currentUserId) {
        console.error('No user ID available for create nominee');
        throw new Error('User not authenticated');
      }

      console.log('Creating nominee for user ID:', currentUserId, 'with data:', nomineeData);

      // Validate required fields
      if (!nomineeData.name || !nomineeData.relation || !nomineeData.phone || !nomineeData.email) {
        throw new Error('All required fields must be filled');
      }

      if (nomineeData.allocation_percentage < 0 || nomineeData.allocation_percentage > 100) {
        throw new Error('Allocation percentage must be between 0 and 100');
      }

      // Email validation
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(nomineeData.email)) {
        throw new Error('Please enter a valid email address');
      }

      // Phone validation
      const phoneRegex = /^[+]?[0-9\s-\(\)]{10,}$/;
      if (!phoneRegex.test(nomineeData.phone)) {
        throw new Error('Please enter a valid phone number');
      }

      // Use backend API
      const response = await apiCall('/nominees', {
        method: 'POST',
        body: JSON.stringify({
          name: nomineeData.name,
          relation: nomineeData.relation,
          phone: nomineeData.phone,
          email: nomineeData.email,
          allocationPercentage: nomineeData.allocation_percentage,
          isExecutor: nomineeData.is_executor,
          isBackup: nomineeData.is_backup,
        }),
      });

      console.log('Nominee created successfully:', response);
      return response;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['nominees', userId] });
    },
    onError: (error) => {
      console.error('Create nominee mutation error:', error);
    },
  });

  // Update nominee mutation
  const updateNominee = useMutation({
    mutationFn: async ({ id, ...nomineeData }: { id: string } & NomineeInput) => {
      console.log('Updating nominee with ID:', id, 'with data:', nomineeData);
      
      // Validate required fields
      if (!nomineeData.name || !nomineeData.relation || !nomineeData.phone || !nomineeData.email) {
        throw new Error('All required fields must be filled');
      }

      if (nomineeData.allocation_percentage < 0 || nomineeData.allocation_percentage > 100) {
        throw new Error('Allocation percentage must be between 0 and 100');
      }

      // Email validation
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(nomineeData.email)) {
        throw new Error('Please enter a valid email address');
      }

      // Phone validation
      const phoneRegex = /^[+]?[0-9\s-\(\)]{10,}$/;
      if (!phoneRegex.test(nomineeData.phone)) {
        throw new Error('Please enter a valid phone number');
      }
      
      const response = await apiCall(`/nominees/${id}`, {
        method: 'PUT',
        body: JSON.stringify({
          name: nomineeData.name,
          relation: nomineeData.relation,
          phone: nomineeData.phone,
          email: nomineeData.email,
          allocationPercentage: nomineeData.allocation_percentage,
          isExecutor: nomineeData.is_executor,
          isBackup: nomineeData.is_backup,
        }),
      });

      console.log('Nominee updated successfully:', response);
      return response;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['nominees', userId] });
    },
    onError: (error) => {
      console.error('Update nominee mutation error:', error);
    },
  });

  // Delete nominee mutation
  const deleteNominee = useMutation({
    mutationFn: async (id: string) => {
      console.log('Deleting nominee with ID:', id);
      
      if (!id) {
        throw new Error('Nominee ID is required for deletion');
      }
      
      await apiCall(`/nominees/${id}`, {
        method: 'DELETE',
      });

      console.log('Nominee deleted successfully');
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['nominees', userId] });
    },
    onError: (error) => {
      console.error('Delete nominee mutation error:', error);
    },
  });

  return {
    nominees,
    isLoading,
    isError,
    error,
    refetch,
    createNominee,
    updateNominee,
    deleteNominee,
    // Individual loading states
    isCreating: createNominee.isPending,
    isUpdating: updateNominee.isPending,
    isDeleting: deleteNominee.isPending,
    // Individual error states
    createError: createNominee.error,
    updateError: updateNominee.error,
    deleteError: deleteNominee.error,
  };
};
