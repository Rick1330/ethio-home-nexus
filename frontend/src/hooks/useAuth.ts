import { useEffect } from 'react';
import { useAuthStore } from '../store/authStore';

export const useAuth = () => {
  const authStore = useAuthStore();

  // Check for existing authentication on mount
  useEffect(() => {
    if (!authStore.user && !authStore.isLoading) {
      authStore.getCurrentUser();
    }
  }, []);

  return authStore;
};