import { create } from 'zustand';
import { userService } from '@/lib/services/user.service';
import type { UserProfile, UserStats, Transaction } from '@/types';

interface UserState {
    profile: UserProfile | null;
    stats: UserStats | null;
    transactions: Transaction[];
    transactionsTotal: number;
    isLoading: boolean;
    error: string | null;

    // Actions
    fetchProfile: () => Promise<void>;
    fetchStats: () => Promise<void>;
    fetchTransactions: (limit?: number, offset?: number) => Promise<void>;
    updateProfile: (data: Partial<UserProfile>) => Promise<void>;
    clearError: () => void;
    reset: () => void;
}

const initialState = {
    profile: null,
    stats: null,
    transactions: [],
    transactionsTotal: 0,
    isLoading: false,
    error: null,
};

export const useUserStore = create<UserState>((set) => ({
    ...initialState,

    fetchProfile: async () => {
        set({ isLoading: true, error: null });
        try {
            const profile = await userService.getProfile();
            set({ profile, isLoading: false });
        } catch (error: any) {
            set({ isLoading: false, error: error.message || 'Failed to fetch profile' });
            throw error;
        }
    },

    fetchStats: async () => {
        set({ isLoading: true, error: null });
        try {
            const stats = await userService.getStats();
            set({ stats, isLoading: false });
        } catch (error: any) {
            set({ isLoading: false, error: error.message || 'Failed to fetch stats' });
            throw error;
        }
    },

    fetchTransactions: async (limit = 10, offset = 0) => {
        set({ isLoading: true, error: null });
        try {
            const response = await userService.getTransactions(limit, offset);
            set({
                transactions: response.transactions,
                transactionsTotal: response.total,
                isLoading: false,
            });
        } catch (error: any) {
            set({ isLoading: false, error: error.message || 'Failed to fetch transactions' });
            throw error;
        }
    },

    updateProfile: async (data) => {
        set({ isLoading: true, error: null });
        try {
            const profile = await userService.updateProfile(data);
            set({ profile, isLoading: false });
        } catch (error: any) {
            set({ isLoading: false, error: error.message || 'Failed to update profile' });
            throw error;
        }
    },

    clearError: () => set({ error: null }),

    reset: () => set(initialState),
}));
