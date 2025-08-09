import { toast } from '@/hooks/use-toast';

export interface ApiError {
  message: string;
  statusCode?: number;
  status?: string;
  errors?: Record<string, string[]>;
}

export const handleApiError = (error: any, defaultMessage = 'An error occurred') => {
  let message = defaultMessage;
  let title = 'Error';

  if (error?.response?.data) {
    const apiError = error.response.data as ApiError;
    message = apiError.message || defaultMessage;
    
    // Handle validation errors
    if (apiError.errors) {
      const errorMessages = Object.values(apiError.errors).flat();
      message = errorMessages.join(', ');
      title = 'Validation Error';
    }
    
    // Handle specific status codes
    switch (error.response.status) {
      case 401:
        title = 'Authentication Required';
        message = 'Please log in to continue';
        break;
      case 403:
        title = 'Access Denied';
        message = 'You do not have permission to perform this action';
        break;
      case 404:
        title = 'Not Found';
        message = 'The requested resource was not found';
        break;
      case 429:
        title = 'Rate Limited';
        message = 'Too many requests. Please try again later';
        break;
      case 500:
        title = 'Server Error';
        message = 'Internal server error. Please try again later';
        break;
    }
  } else if (error?.message) {
    message = error.message;
  }

  toast({
    title,
    description: message,
    variant: 'destructive',
  });

  return { title, message };
};

export const validateEmail = (email: string): boolean => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

export const validatePhone = (phone: string): boolean => {
  const phoneRegex = /^\+?[\d\s\-\(\)]{10,}$/;
  return phoneRegex.test(phone);
};

export const validatePassword = (password: string): { isValid: boolean; errors: string[] } => {
  const errors: string[] = [];
  
  if (password.length < 8) {
    errors.push('Password must be at least 8 characters long');
  }
  
  if (!/[A-Z]/.test(password)) {
    errors.push('Password must contain at least one uppercase letter');
  }
  
  if (!/[a-z]/.test(password)) {
    errors.push('Password must contain at least one lowercase letter');
  }
  
  if (!/\d/.test(password)) {
    errors.push('Password must contain at least one number');
  }
  
  return {
    isValid: errors.length === 0,
    errors,
  };
};