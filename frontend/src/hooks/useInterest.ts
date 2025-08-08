import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import interestService, { CreateInterestData } from '@/services/interestService';

// Get user's interest forms
export const useMyInterests = () => {
  return useQuery({
    queryKey: ['interests', 'my'],
    queryFn: () => interestService.getMyInterests(),
  });
};

// Get property interest forms (for sellers/admins)
export const usePropertyInterests = (propertyId: string) => {
  return useQuery({
    queryKey: ['interests', 'property', propertyId],
    queryFn: () => interestService.getPropertyInterests(propertyId),
    enabled: !!propertyId,
  });
};

// Submit interest form mutation
export const useSubmitInterest = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (data: CreateInterestData) => interestService.submitInterest(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['interests'] });
    },
  });
};