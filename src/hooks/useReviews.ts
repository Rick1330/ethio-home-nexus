import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import reviewService, { CreateReviewData } from '@/services/reviewService';

// Get property reviews
export const usePropertyReviews = (propertyId: string) => {
  return useQuery({
    queryKey: ['reviews', 'property', propertyId],
    queryFn: () => reviewService.getPropertyReviews(propertyId),
    enabled: !!propertyId,
  });
};

// Create review mutation
export const useCreateReview = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (data: CreateReviewData) => reviewService.createReview(data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ 
        queryKey: ['reviews', 'property', variables.property] 
      });
    },
  });
};