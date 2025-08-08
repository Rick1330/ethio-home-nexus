import api from './api';

export interface LoginData {
  email: string;
  password: string;
}

export interface SignupData {
  name: string;
  email: string;
  phone: string;
  password: string;
  passwordConfirm: string;
  role: 'buyer' | 'seller' | 'agent';
}

export interface User {
  _id: string;
  name: string;
  email: string;
  phone: string;
  role: 'buyer' | 'seller' | 'agent' | 'admin' | 'employee';
  isVerified: boolean;
  active: boolean;
  photo?: string;
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
  name?: string;
  email?: string;
  phone?: string;
  photo?: string;
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

  // Email verification
  async resendVerification(userId: string): Promise<{ message: string }> {
    const response = await api.patch(`/users/send/${userId}`);
    return response.data;
  }

  async verifyEmail(userId: string): Promise<{ user: User; token: string }> {
    const response = await api.patch(`/users/verifyEmail/${userId}`);
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

  async deactivateAccount(): Promise<void> {
    await api.delete('/users/deleteMe');
  }
}

export default new AuthService();