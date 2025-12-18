import axios, { AxiosError, AxiosInstance, AxiosRequestConfig } from 'axios';
import type { ApiResponse } from '@/types';

// Create axios instance
const api: AxiosInstance = axios.create({
    baseURL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080/api/v1',
    timeout: 10000,
    headers: {
        'Content-Type': 'application/json',
    },
});

// Request interceptor - Add auth token
api.interceptors.request.use(
    (config) => {
        // Get token from localStorage
        const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;

        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
            console.log('🔐 Token added to request:', config.url);
        } else {
            console.log('⚠️ No token found for request:', config.url);
        }

        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

// Response interceptor - Handle errors
api.interceptors.response.use(
    (response) => {
        return response;
    },
    (error: AxiosError<ApiResponse>) => {
        // Handle specific error cases
        if (error.response) {
            const { status, data } = error.response;

            // Unauthorized - Clear token and redirect to login
            if (status === 401) {
                // Clear all auth tokens
                localStorage.removeItem('token');
                localStorage.removeItem('user');
                localStorage.removeItem('admin_token');
                localStorage.removeItem('admin');

                // Only redirect if not already on login/register page
                if (typeof window !== 'undefined' &&
                    !window.location.pathname.includes('/login') &&
                    !window.location.pathname.includes('/register')) {
                    
                    // Check if on admin page
                    if (window.location.pathname.includes('/admin')) {
                        window.location.href = '/admin/login';
                    } else {
                        window.location.href = '/login';
                    }
                }
            }

            // Return error message from API
            return Promise.reject(new Error(data.message || 'An error occurred'));
        } else if (error.request) {
            // Request made but no response
            return Promise.reject(new Error('No response from server'));
        } else {
            // Something else happened
            return Promise.reject(new Error(error.message || 'An error occurred'));
        }
    }
);

// API methods
export const apiClient = {
    // Generic GET request
    get: async <T = any>(url: string, config?: AxiosRequestConfig): Promise<T> => {
        const response = await api.get<ApiResponse<T>>(url, config);
        return response.data.data as T;
    },

    // Generic POST request
    post: async <T = any>(url: string, data?: any, config?: AxiosRequestConfig): Promise<T> => {
        const response = await api.post<ApiResponse<T>>(url, data, config);
        return response.data.data as T;
    },

    // Generic PUT request
    put: async <T = any>(url: string, data?: any, config?: AxiosRequestConfig): Promise<T> => {
        const response = await api.put<ApiResponse<T>>(url, data, config);
        return response.data.data as T;
    },

    // Generic PATCH request
    patch: async <T = any>(url: string, data?: any, config?: AxiosRequestConfig): Promise<T> => {
        const response = await api.patch<ApiResponse<T>>(url, data, config);
        return response.data.data as T;
    },

    // Generic DELETE request
    delete: async <T = any>(url: string, config?: AxiosRequestConfig): Promise<T> => {
        const response = await api.delete<ApiResponse<T>>(url, config);
        return response.data.data as T;
    },
};

export default api;
