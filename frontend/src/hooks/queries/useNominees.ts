import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useAuth } from "../useAuth";
import { nomineesAPI } from "../../services/api";

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

export const useNominees = () => {
  const queryClient = useQueryClient();
  const { user, userProfile } = useAuth();

  // Fetch nominees
  const {
    data: nominees = [],
    isLoading,
    isError,
    error,
    refetch
  } = useQuery<Nominee[]>({
    queryKey: ["nominees", user?.id],
    queryFn: async () => {
      if (!user || !userProfile) {
        throw new Error("User not authenticated");
      }

      console.log("Fetching nominees for user ID:", user.id);
      return await nomineesAPI.getAll();
    },
    enabled: !!user && !!userProfile,
    staleTime: 5 * 60 * 1000,
    gcTime: 30 * 60 * 1000,
    retry: 2,
    retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
  });

  // Create nominee mutation
  const createNominee = useMutation({
    mutationFn: async (nomineeData: NomineeInput) => {
      if (!user || !userProfile) {
        throw new Error("User not authenticated");
      }

      console.log("Creating nominee for user ID:", user.id, "with data:", nomineeData);

      // Validate required fields
      if (!nomineeData.name || !nomineeData.relation || !nomineeData.phone || !nomineeData.email) {
        throw new Error("All required fields must be filled");
      }

      if (nomineeData.allocation_percentage < 0 || nomineeData.allocation_percentage > 100) {
        throw new Error("Allocation percentage must be between 0 and 100");
      }

      // Email validation
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(nomineeData.email)) {
        throw new Error("Please enter a valid email address");
      }

      // Phone validation
      const phoneRegex = /^[+]?[0-9\s-\(\)]{10,}$/;
      if (!phoneRegex.test(nomineeData.phone)) {
        throw new Error("Please enter a valid phone number");
      }

      const response = await nomineesAPI.create({
        name: nomineeData.name,
        relation: nomineeData.relation,
        phone: nomineeData.phone,
        email: nomineeData.email,
        allocationPercentage: nomineeData.allocation_percentage,
        isExecutor: nomineeData.is_executor,
        isBackup: nomineeData.is_backup,
      });

      console.log("Nominee created successfully:", response);
      return response;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["nominees", user?.id] });
      queryClient.invalidateQueries({ queryKey: ["dashboardBatch", user?.id] });
    },
    onError: (error) => {
      console.error("Create nominee mutation error:", error);
    },
  });

  // Update nominee mutation
  const updateNominee = useMutation({
    mutationFn: async ({ id, ...nomineeData }: { id: string } & NomineeInput) => {
      console.log("Updating nominee with ID:", id, "with data:", nomineeData);
      
      // Validate required fields
      if (!nomineeData.name || !nomineeData.relation || !nomineeData.phone || !nomineeData.email) {
        throw new Error("All required fields must be filled");
      }

      if (nomineeData.allocation_percentage < 0 || nomineeData.allocation_percentage > 100) {
        throw new Error("Allocation percentage must be between 0 and 100");
      }

      // Email validation
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(nomineeData.email)) {
        throw new Error("Please enter a valid email address");
      }

      // Phone validation
      const phoneRegex = /^[+]?[0-9\s-\(\)]{10,}$/;
      if (!phoneRegex.test(nomineeData.phone)) {
        throw new Error("Please enter a valid phone number");
      }
      
      const response = await nomineesAPI.update(id, {
        name: nomineeData.name,
        relation: nomineeData.relation,
        phone: nomineeData.phone,
        email: nomineeData.email,
        allocationPercentage: nomineeData.allocation_percentage,
        isExecutor: nomineeData.is_executor,
        isBackup: nomineeData.is_backup,
      });

      console.log("Nominee updated successfully:", response);
      return response;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["nominees", user?.id] });
      queryClient.invalidateQueries({ queryKey: ["dashboardBatch", user?.id] });
    },
    onError: (error) => {
      console.error("Update nominee mutation error:", error);
    },
  });

  // Delete nominee mutation
  const deleteNominee = useMutation({
    mutationFn: async (id: string) => {
      console.log("Deleting nominee with ID:", id);
      
      if (!id) {
        throw new Error("Nominee ID is required for deletion");
      }
      
      await nomineesAPI.delete(id);

      console.log("Nominee deleted successfully");
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["nominees", user?.id] });
      queryClient.invalidateQueries({ queryKey: ["dashboardBatch", user?.id] });
    },
    onError: (error) => {
      console.error("Delete nominee mutation error:", error);
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
