# API Integration Guide

This guide covers the integration between the Ethio-Home frontend and backend APIs.

## Backend Architecture

### Base Configuration
```typescript
// API base URL configuration
const baseURL = 'http://localhost:3000/api/v1' // Development
const baseURL = 'https://your-domain.com/api/v1' // Production
```

### Authentication System
The system uses JWT tokens with HTTP-only cookies for secure authentication.

#### Cookie-Based Authentication
```typescript
// Axios configuration for cookie handling
const api = axios.create({
  baseURL: process.env.VITE_API_BASE_URL,
  withCredentials: true, // Essential for cookie handling
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 10000,
});
```

## API Endpoints Reference

### Authentication Endpoints
```
POST /api/v1/users/signup           - User registration
POST /api/v1/users/login            - User login
GET  /api/v1/users/logout           - User logout
POST /api/v1/users/forgotPassword   - Password reset request
PATCH /api/v1/users/resetPassword/:token - Password reset
PATCH /api/v1/users/updateMyPassword - Update password
PATCH /api/v1/users/send/:userId    - Resend verification
PATCH /api/v1/users/verifyEmail/:userId - Verify email
```

### User Management
```
GET   /api/v1/users           - Get all users (admin/employee)
POST  /api/v1/users           - Create user (admin)
GET   /api/v1/users/:id       - Get user by ID (admin/employee)
PATCH /api/v1/users/:id       - Update user (admin/employee)
DELETE /api/v1/users/:id      - Delete user (admin)
GET   /api/v1/users/me        - Get current user profile
PATCH /api/v1/users/updateMe  - Update current user profile
DELETE /api/v1/users/deleteMe - Deactivate account
```

### Property Management
```
GET   /api/v1/properties                - Get all properties
POST  /api/v1/properties                - Create property
GET   /api/v1/properties/property-stats - Get property statistics
GET   /api/v1/properties/:id            - Get property by ID
PATCH /api/v1/properties/:id            - Update property
DELETE /api/v1/properties/:id           - Delete property
PUT   /api/v1/properties/:id            - Verify property
```

### Interest Forms
```
POST   /api/v1/interest/buyer                    - Submit interest
GET    /api/v1/interest/buyer                    - Get buyer's interests
GET    /api/v1/interest/buyer/:id                - Get specific interest
PATCH  /api/v1/interest/buyer/:id                - Update interest
DELETE /api/v1/interest/buyer/:id                - Delete interest
GET    /api/v1/properties/:id/interest           - Get property interests
GET    /api/v1/interest/:owner                   - Get seller's interests
PATCH  /api/v1/interest/status/:id               - Update interest status
```

### Reviews
```
GET    /api/v1/reviews                  - Get all reviews
POST   /api/v1/reviews                  - Create review
GET    /api/v1/reviews/:id              - Get review by ID
PATCH  /api/v1/reviews/:id              - Update review
DELETE /api/v1/reviews/:id              - Delete review
GET    /api/v1/properties/:id/reviews   - Get property reviews
POST   /api/v1/properties/:id/reviews   - Create property review
```

### Selling & Payments
```
POST /api/v1/selling/process-payment       - Initiate payment
GET  /api/v1/selling/verify-payment/:txRef - Verify payment
POST /api/v1/selling/verify-payment/webhook - Payment webhook
GET  /api/v1/selling                       - Get selling records
POST /api/v1/selling                       - Create selling record
GET  /api/v1/selling/selling-stats         - Get selling statistics
GET  /api/v1/selling/:id                   - Get selling record
PATCH /api/v1/selling/:id                  - Update selling record
DELETE /api/v1/selling/:id                 - Delete selling record
```

### Subscriptions
```
POST   /api/v1/subscription/create-plan              - Create subscription plan
GET    /api/v1/subscription/plans                    - Get subscription plans
PATCH  /api/v1/subscription/plans/:planId            - Update subscription plan
DELETE /api/v1/subscription/plans/:planId            - Delete subscription plan
PUT    /api/v1/subscription/plans/:planId            - Update subscription status
GET    /api/v1/subscription/verify-payment/:txRef    - Verify subscription payment
POST   /api/v1/subscription/verify-subscription-webhook - Subscription webhook
```

## Service Layer Implementation

### Base API Service
```typescript
// src/services/api.ts
import axios from 'axios';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000/api/v1',
  withCredentials: true,
  headers: { 'Content-Type': 'application/json' },
  timeout: 10000,
});

// Request interceptor
api.interceptors.request.use(
  (config) => config,
  (error) => Promise.reject(error)
);

// Response interceptor for error handling
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('auth-storage');
      if (!window.location.pathname.includes('/login')) {
        window.location.href = '/login';
      }
    }
    return Promise.reject(error);
  }
);
```

### Authentication Service Pattern
```typescript
// src/services/authService.ts
class AuthService {
  async login(data: LoginData): Promise<{ user: User; token: string }> {
    const response = await api.post('/users/login', data);
    return response.data;
  }

  async getCurrentUser(): Promise<User> {
    const response = await api.get('/users/me');
    return response.data.data.user;
  }
  
  // ... other methods
}

export default new AuthService();
```

## React Query Integration

### Query Client Setup
```typescript
// src/main.tsx
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000, // 5 minutes
      retry: 3,
    },
  },
});
```

### Custom Hooks Pattern
```typescript
// src/hooks/useAuth.ts
export const useAuth = () => {
  const { data: user, isLoading, error } = useQuery({
    queryKey: ['currentUser'],
    queryFn: authService.getCurrentUser,
    retry: false,
  });

  return { user, isLoading, error };
};
```

## Error Handling

### Global Error Handler
```typescript
// src/utils/errorHandler.ts
export const handleApiError = (error: any): string => {
  if (error.response?.data?.message) {
    return error.response.data.message;
  }
  if (error.message) {
    return error.message;
  }
  return 'An unexpected error occurred';
};
```

### Error Boundaries
Implement React Error Boundaries for graceful error handling in production.

## Environment Configuration

### Development
```bash
# .env.local
VITE_API_BASE_URL=http://localhost:3000/api/v1
VITE_APP_ENV=development
```

### Production
```bash
# .env.production
VITE_API_BASE_URL=https://api.ethio-home.com/api/v1
VITE_APP_ENV=production
```

## Security Considerations

1. **HTTPS Only**: Always use HTTPS in production
2. **CORS Configuration**: Properly configure CORS on backend
3. **Cookie Security**: Use secure, httpOnly cookies
4. **Input Validation**: Validate all inputs on frontend and backend
5. **Rate Limiting**: Implement rate limiting on API endpoints

## Testing API Integration

### API Status Component
```typescript
// src/components/shared/ApiStatus.tsx
// Monitors API health and connection status
```

### API Test Dashboard
```typescript
// src/pages/ApiTest.tsx
// Comprehensive API testing interface
```

## Monitoring and Logging

### Frontend Monitoring
- Track API response times
- Monitor error rates
- Log authentication failures

### Backend Integration
- Health check endpoints
- Request/response logging
- Performance metrics

## Troubleshooting

### Common Issues

1. **CORS Errors**
   - Ensure `withCredentials: true` in axios config
   - Configure backend CORS properly

2. **Authentication Issues**
   - Check cookie settings
   - Verify token expiration handling

3. **Network Timeouts**
   - Adjust timeout values
   - Implement retry logic

4. **Data Inconsistency**
   - Use React Query for cache management
   - Implement optimistic updates carefully

### Debug Tools
- Browser Network tab
- React Query DevTools
- API logging middleware
