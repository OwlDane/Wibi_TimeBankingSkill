import { create } from 'zustand';
import { transactionService } from '@/lib/services';
import type { Transaction } from '@/types';

interface TransactionHistoryResponse {
    transactions: Transaction[];
    total: number;
    limit: number;
    offset: number;
}

interface TransactionState {
    // State
    transactions: Transaction[];
    total: number;
    isLoading: boolean;
    error: string | null;

    // Actions
    fetchTransactions: (limit?: number, offset?: number) => Promise<void>;
    clearError: () => void;
    reset: () => void;
}

const initialState = {
    transactions: [],
    total: 0,
    isLoading: false,
    error: null,
};

/**
 * Transaction store for managing credit transaction history
 */
export const useTransactionStore = create<TransactionState>((set) => ({
    ...initialState,

    /**
     * Fetch transaction history with pagination
     */
    fetchTransactions: async (limit = 10, offset = 0) => {
        set({ isLoading: true, error: null });
        try {
            const response = await transactionService.getTransactionHistory(limit, offset);
            set({
                transactions: response.transactions,
                total: response.total,
                isLoading: false,
            });
        } catch (error: any) {
            const errorMessage = error.message || 'Failed to fetch transactions';
            set({
                isLoading: false,
                error: errorMessage,
            });
            throw error;
        }
    },

    /**
     * Clear error message
     */
    clearError: () => set({ error: null }),

    /**
     * Reset to initial state
     */
    reset: () => set(initialState),
}));

export default useTransactionStore;
