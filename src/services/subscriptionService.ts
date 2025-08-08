import api from './api';

export interface SubscriptionPlan {
  _id: string;
  name: string;
  description: string;
  price: number;
  duration: number; // in days
  features: string[];
  isActive: boolean;
  createdAt: string;
}

export interface CreateSubscriptionPlanData {
  name: string;
  description: string;
  price: number;
  duration: number;
  features: string[];
}

export interface UpdateSubscriptionStatusData {
  status: 'active' | 'inactive';
}

class SubscriptionService {
  // Create subscription plan (buyer/seller/agent)
  async createSubscriptionPlan(data: CreateSubscriptionPlanData): Promise<SubscriptionPlan> {
    const response = await api.post('/subscription/create-plan', data);
    return response.data.data.plan;
  }

  // Get subscription plans (admin/seller/agent)
  async getSubscriptionPlans(): Promise<SubscriptionPlan[]> {
    const response = await api.get('/subscription/plans');
    return response.data.data.plans;
  }

  // Update subscription plan (admin/seller/agent)
  async updateSubscriptionPlan(planId: string, data: Partial<CreateSubscriptionPlanData>): Promise<SubscriptionPlan> {
    const response = await api.patch(`/subscription/plans/${planId}`, data);
    return response.data.data.plan;
  }

  // Delete subscription plan (admin only)
  async deleteSubscriptionPlan(planId: string): Promise<void> {
    await api.delete(`/subscription/plans/${planId}`);
  }

  // Update subscription status (admin only)
  async updateSubscriptionStatus(planId: string, data: UpdateSubscriptionStatusData): Promise<SubscriptionPlan> {
    const response = await api.put(`/subscription/plans/${planId}`, data);
    return response.data.data.plan;
  }

  // Verify subscription payment
  async verifySubscriptionPayment(txRef: string): Promise<any> {
    const response = await api.get(`/subscription/verify-payment/${txRef}`);
    return response.data;
  }
}

export default new SubscriptionService();