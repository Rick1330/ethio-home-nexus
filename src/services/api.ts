import axios from 'axios';

// Create axios instance with base configuration
const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000/api/v1',
  withCredentials: true, // Important for HTTP-only cookies
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to handle authentication
api.interceptors.request.use(
  (config) => {
    // JWT will be automatically included via HTTP-only cookies
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor to handle errors globally
api.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    // Handle common error cases
    if (error.response?.status === 401) {
      // Redirect to login on unauthorized
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export default api;