import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import sellingService, { PaymentData, CreateSellingData } from '@/services/sellingService';

// Initiate payment
export const useInitiatePayment = () => {
  return useMutation({
    mutationFn: (data: PaymentData) => sellingService.initiatePayment(data),
  });
};

// Verify payment
export const useVerifyPayment = () => {
  return useMutation({
    mutationFn: (txRef: string) => sellingService.verifyPayment(txRef),
  });
};

// Get all selling records (admin/employee only)
export const useSellingRecords = () => {
  return useQuery({
    queryKey: ['selling-records'],
    queryFn: () => sellingService.getAllSellingRecords(),
  });
};

// Create selling record (admin only)
export const useCreateSellingRecord = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (data: CreateSellingData) => sellingService.createSellingRecord(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['selling-records'] });
    },
  });
};

// Get selling statistics (admin only)
export const useSellingStats = () => {
  return useQuery({
    queryKey: ['selling-stats'],
    queryFn: () => sellingService.getSellingStats(),
  });
};

// Get selling record by ID (admin only)
export const useSellingRecord = (id: string) => {
  return useQuery({
    queryKey: ['selling-record', id],
    queryFn: () => sellingService.getSellingRecord(id),
    enabled: !!id,
  });
};

// Update selling record (admin only)
export const useUpdateSellingRecord = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<CreateSellingData> }) =>
      sellingService.updateSellingRecord(id, data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['selling-records'] });
      queryClient.invalidateQueries({ queryKey: ['selling-record', variables.id] });
    },
  });
};

// Delete selling record (admin only)
export const useDeleteSellingRecord = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (id: string) => sellingService.deleteSellingRecord(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['selling-records'] });
    },
  });
};