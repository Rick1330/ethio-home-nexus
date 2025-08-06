// Re-export all types for easy importing
export * from '../services/authService';
export * from '../services/propertyService';
export * from '../services/interestService';
export * from '../services/reviewService';

// Additional common types
export interface APIResponse<T> {
  status: 'success' | 'error';
  data?: T;
  message?: string;
}

export interface PaginationMeta {
  page: number;
  limit: number;
  pages: number;
  total: number;
}

export interface APIError {
  message: string;
  statusCode: number;
  status: string;
  isOperational?: boolean;
}