import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useAuth } from '../useAuth';
import { vaultAPI } from '../../services/api';

interface VaultRequest {
  id: string;
  nominee_name: string;
  relation_to_deceased: string;
  phone_number: string;
  email: string;
  death_certificate_url: string | null;
  status: string;
  notes?: string | null;
  created_at: string;
  updated_at: string;
}

interface VaultRequestInput {
  nomineeName: string;
  relationToDeceased: string;
  phoneNumber: string;
  email: string;
  deathCertificateUrl?: string | null;
  status?: string;
  notes?: string | null;
}

export const useVaultRequests = () => {
  const queryClient = useQueryClient();
  const { user, userProfile } = useAuth();

  // Fetch vault requests
  const {
    data: vaultRequests = [],
    isLoading,
    isError,
    error,
    refetch
  } = useQuery<VaultRequest[]>({
    queryKey: ['vaultRequests', user?.id],
    queryFn: async () => {
      if (!user || !userProfile) {
        throw new Error('User not authenticated');
      }

      console.log('Fetching vault requests for user ID:', user.id);
      return await vaultAPI.getRequests();
    },
    enabled: !!user && !!userProfile,
    staleTime: 5 * 60 * 1000,
    gcTime: 30 * 60 * 1000,
    retry: 2,
    retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
  });

  // Create vault request mutation
  const createVaultRequest = useMutation({
    mutationFn: async (requestData: VaultRequestInput) => {
      if (!user || !userProfile) {
        throw new Error('User not authenticated');
      }

      console.log('Creating vault request for user ID:', user.id, 'with data:', requestData);

      // Validate required fields
      if (!requestData.nomineeName || !requestData.relationToDeceased || !requestData.phoneNumber || !requestData.email) {
        throw new Error('All required fields must be filled');
      }

      // Email validation
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(requestData.email)) {
        throw new Error('Please enter a valid email address');
      }

      // Phone validation
      const phoneRegex = /^[+]?[0-9\s-\(\)]{10,}$/;
      if (!phoneRegex.test(requestData.phoneNumber)) {
        throw new Error('Please enter a valid phone number');
      }

      const response = await vaultAPI.createRequest({
        nomineeId: null,
        nomineeName: requestData.nomineeName,
        relationToDeceased: requestData.relationToDeceased,
        phoneNumber: requestData.phoneNumber,
        email: requestData.email,
        deathCertificateUrl: requestData.deathCertificateUrl,
      });

      console.log('Vault request created successfully:', response);
      return response;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['vaultRequests', user?.id] });
    },
    onError: (error) => {
      console.error('Create vault request mutation error:', error);
    },
  });

  // Update vault request mutation
  const updateVaultRequest = useMutation({
    mutationFn: async ({ id, ...requestData }: { id: string } & Partial<VaultRequestInput>) => {
      console.log('Updating vault request with ID:', id, 'with data:', requestData);
      
      // Validate required fields
      if (requestData.nomineeName && !requestData.nomineeName.trim()) {
        throw new Error('Nominee name is required');
      }
      if (requestData.relationToDeceased && !requestData.relationToDeceased.trim()) {
        throw new Error('Relation to deceased is required');
      }
      if (requestData.phoneNumber && !requestData.phoneNumber.trim()) {
        throw new Error('Phone number is required');
      }
      if (requestData.email && !requestData.email.trim()) {
        throw new Error('Email is required');
      }

      // Email validation
      if (requestData.email) {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(requestData.email)) {
          throw new Error('Please enter a valid email address');
        }
      }

      // Phone validation
      if (requestData.phoneNumber) {
        const phoneRegex = /^[+]?[0-9\s-\(\)]{10,}$/;
        if (!phoneRegex.test(requestData.phoneNumber)) {
          throw new Error('Please enter a valid phone number');
        }
      }

      const response = await vaultAPI.updateRequest(id, {
        nomineeId: null,
        nomineeName: requestData.nomineeName,
        relationToDeceased: requestData.relationToDeceased,
        phoneNumber: requestData.phoneNumber,
        email: requestData.email,
        deathCertificateUrl: requestData.deathCertificateUrl,
        status: requestData.status,
      });

      console.log('Vault request updated successfully:', response);
      return response;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['vaultRequests', user?.id] });
    },
    onError: (error) => {
      console.error('Update vault request mutation error:', error);
    },
  });

  // Delete vault request mutation
  const deleteVaultRequest = useMutation({
    mutationFn: async (id: string) => {
      console.log('Deleting vault request with ID:', id);
      
      if (!id) {
        throw new Error('Vault request ID is required for deletion');
      }
      
      await vaultAPI.deleteRequest(id);

      console.log('Vault request deleted successfully');
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['vaultRequests', user?.id] });
    },
    onError: (error) => {
      console.error('Delete vault request mutation error:', error);
    },
  });

  return {
    vaultRequests,
    isLoading,
    isError,
    error,
    refetch,
    createVaultRequest,
    updateVaultRequest,
    deleteVaultRequest,
    // Individual loading states
    isCreating: createVaultRequest.isPending,
    isUpdating: updateVaultRequest.isPending,
    isDeleting: deleteVaultRequest.isPending,
    // Individual error states
    createError: createVaultRequest.error,
    updateError: updateVaultRequest.error,
    deleteError: deleteVaultRequest.error,
  };
};
