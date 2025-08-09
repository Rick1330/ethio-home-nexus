import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import subscriptionService, { CreateSubscriptionPlanData, UpdateSubscriptionStatusData } from '@/services/subscriptionService';

// Create subscription plan
export const useCreateSubscriptionPlan = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (data: CreateSubscriptionPlanData) => subscriptionService.createSubscriptionPlan(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['subscription-plans'] });
    },
  });
};

// Get subscription plans
export const useSubscriptionPlans = () => {
  return useQuery({
    queryKey: ['subscription-plans'],
    queryFn: () => subscriptionService.getSubscriptionPlans(),
  });
};

// Update subscription plan
export const useUpdateSubscriptionPlan = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ planId, data }: { planId: string; data: Partial<CreateSubscriptionPlanData> }) =>
      subscriptionService.updateSubscriptionPlan(planId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['subscription-plans'] });
    },
  });
};

// Delete subscription plan
export const useDeleteSubscriptionPlan = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (planId: string) => subscriptionService.deleteSubscriptionPlan(planId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['subscription-plans'] });
    },
  });
};

// Update subscription status
export const useUpdateSubscriptionStatus = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ planId, data }: { planId: string; data: UpdateSubscriptionStatusData }) =>
      subscriptionService.updateSubscriptionStatus(planId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['subscription-plans'] });
    },
  });
};

// Verify subscription payment
export const useVerifySubscriptionPayment = () => {
  return useMutation({
    mutationFn: (txRef: string) => subscriptionService.verifySubscriptionPayment(txRef),
  });
};