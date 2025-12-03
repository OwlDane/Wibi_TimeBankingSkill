import { apiClient } from '@/lib/api';
import type { UserProfile, UserStats, Transaction } from '@/types';

export interface UpdateProfileRequest {
    full_name?: string;
    username?: string;
    school?: string;
    grade?: string;
    major?: string;
    bio?: string;
    phone_number?: string;
    location?: string;
}

export interface ChangePasswordRequest {
    old_password: string;
    new_password: string;
}

export interface TransactionHistoryResponse {
    transactions: Transaction[];
    total: number;
    limit: number;
    offset: number;
}

export const userService = {
    // Get current user profile
    getProfile: async (): Promise<UserProfile> => {
        return apiClient.get<UserProfile>('/user/profile');
    },

    // Update user profile
    updateProfile: async (data: UpdateProfileRequest): Promise<UserProfile> => {
        return apiClient.put<UserProfile>('/user/profile', data);
    },

    // Change password
    changePassword: async (data: ChangePasswordRequest): Promise<void> => {
        return apiClient.post('/user/change-password', data);
    },

    // Get user stats
    getStats: async (): Promise<UserStats> => {
        return apiClient.get<UserStats>('/user/stats');
    },

    // Update avatar
    updateAvatar: async (avatarUrl: string): Promise<UserProfile> => {
        return apiClient.post<UserProfile>('/user/avatar', { avatar_url: avatarUrl });
    },

    // Get transaction history
    getTransactions: async (limit = 10, offset = 0): Promise<TransactionHistoryResponse> => {
        return apiClient.get<TransactionHistoryResponse>(`/user/transactions?limit=${limit}&offset=${offset}`);
    },

    // Get public profile by ID
    getPublicProfile: async (userId: number): Promise<UserProfile> => {
        return apiClient.get<UserProfile>(`/users/${userId}/profile`);
    },

    // Get public profile by username
    getPublicProfileByUsername: async (username: string): Promise<UserProfile> => {
        return apiClient.get<UserProfile>(`/users/@${username}`);
    },
};
