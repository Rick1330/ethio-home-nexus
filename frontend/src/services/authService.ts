import api from './api';

export interface LoginData {
  email: string;
  password: string;
}

export interface SignupData {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  password: string;
  role: 'buyer' | 'seller';
}

export interface User {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  role: 'buyer' | 'seller' | 'admin';
  isVerified: boolean;
  createdAt: string;
}

export interface ForgotPasswordData {
  email: string;
}

export interface ResetPasswordData {
  password: string;
  passwordConfirm: string;
}

export interface UpdateUserData {
  firstName?: string;
  lastName?: string;
  phone?: string;
}

export interface UpdatePasswordData {
  currentPassword: string;
  password: string;
  passwordConfirm: string;
}

class AuthService {
  // Authentication endpoints
  async signup(data: SignupData): Promise<{ user: User; token: string }> {
    const response = await api.post('/users/signup', data);
    return response.data;
  }

  async login(data: LoginData): Promise<{ user: User; token: string }> {
    const response = await api.post('/users/login', data);
    return response.data;
  }

  async logout(): Promise<void> {
    await api.get('/users/logout');
  }

  async forgotPassword(data: ForgotPasswordData): Promise<{ message: string }> {
    const response = await api.post('/users/forgotPassword', data);
    return response.data;
  }

  async resetPassword(token: string, data: ResetPasswordData): Promise<{ user: User; token: string }> {
    const response = await api.patch(`/users/resetPassword/${token}`, data);
    return response.data;
  }

  // User profile endpoints
  async getCurrentUser(): Promise<User> {
    const response = await api.get('/users/me');
    return response.data.data.user;
  }

  async updateProfile(data: UpdateUserData): Promise<User> {
    const response = await api.patch('/users/updateMe', data);
    return response.data.data.user;
  }

  async updatePassword(data: UpdatePasswordData): Promise<User> {
    const response = await api.patch('/users/updateMyPassword', data);
    return response.data.data.user;
  }
}

export default new AuthService();