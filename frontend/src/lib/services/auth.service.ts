import { apiClient } from '../api';
import type { LoginRequest, RegisterRequest, AuthResponse, UserProfile } from '@/types';

export const authService = {
  // Register new user
  register: async (data: RegisterRequest): Promise<AuthResponse> => {
    return apiClient.post<AuthResponse>('/auth/register', data);
  },

  // Login user
  login: async (data: LoginRequest): Promise<AuthResponse> => {
    return apiClient.post<AuthResponse>('/auth/login', data);
  },

  // Logout user
  logout: async (): Promise<void> => {
    return apiClient.post<void>('/auth/logout');
  },

  // Get current user profile
  getProfile: async (): Promise<UserProfile> => {
    return apiClient.get<UserProfile>('/auth/profile');
  },

  // Save token to localStorage
  saveToken: (token: string): void => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('token', token);
      console.log('✅ Token saved:', token.substring(0, 20) + '...');
    }
  },

  // Get token from localStorage
  getToken: (): string | null => {
    if (typeof window === 'undefined') {
      return null;
    }
    const token = localStorage.getItem('token');
    if (token) {
      console.log('✅ Token retrieved:', token.substring(0, 20) + '...');
    }
    return token;
  },

  // Remove token from localStorage
  removeToken: (): void => {
    if (typeof window !== 'undefined') {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      console.log('✅ Token removed');
    }
  },

  // Save user to localStorage
  saveUser: (user: UserProfile): void => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('user', JSON.stringify(user));
      console.log('✅ User saved:', user.username);
    }
  },

  // Get user from localStorage
  getUser: (): UserProfile | null => {
    if (typeof window === 'undefined') {
      return null;
    }
    const user = localStorage.getItem('user');
    if (user) {
      console.log('✅ User retrieved');
      return JSON.parse(user);
    }
    return null;
  },

  // Check if user is authenticated
  isAuthenticated: (): boolean => {
    return !!authService.getToken();
  },
};
