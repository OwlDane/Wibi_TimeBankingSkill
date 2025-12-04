import { apiClient } from "@/lib/api";
import type { Transaction } from "@/types";

export interface TransactionHistoryResponse {
    transactions: Transaction[];
    total: number;
    limit: number;
    offset: number;
}

/**
 * Transaction service for handling credit transactions
 */
export const transactionService = {
    /**
     * Get user's transaction history with pagination
     * @param limit - Number of transactions per page (default: 10)
     * @param offset - Pagination offset (default: 0)
     */
    getTransactionHistory: async (
        limit = 10,
        offset = 0
    ): Promise<TransactionHistoryResponse> => {
        return apiClient.get<TransactionHistoryResponse>(
            `/user/transactions?limit=${limit}&offset=${offset}`
        );
    },

    /**
     * Get a specific transaction by ID
     * @param id - Transaction ID
     */
    getTransaction: async (id: number): Promise<Transaction> => {
        return apiClient.get<Transaction>(`/user/transactions/${id}`);
    },

    /**
     * Format transaction type for display
     */
    formatTransactionType: (type: string): string => {
        const typeMap: Record<string, string> = {
            earned: "Earned",
            spent: "Spent",
            bonus: "Bonus",
            refund: "Refunded",
            penalty: "Penalty",
            initial: "Welcome Bonus",
            hold: "On Hold",
        };
        return typeMap[type] || type;
    },

    /**
     * Get color for transaction type
     */
    getTransactionTypeColor: (type: string): string => {
        switch (type) {
            case "earned":
            case "initial":
            case "bonus":
            case "refund":
                return "text-green-600 dark:text-green-400";
            case "spent":
            case "hold":
            case "penalty":
                return "text-red-600 dark:text-red-400";
            default:
                return "text-gray-600 dark:text-gray-400";
        }
    },

    /**
     * Get icon for transaction type
     */
    getTransactionTypeIcon: (type: string): string => {
        switch (type) {
            case "earned":
                return "📈";
            case "spent":
                return "📉";
            case "bonus":
                return "🎁";
            case "refund":
                return "↩️";
            case "penalty":
                return "⚠️";
            case "initial":
                return "🎉";
            case "hold":
                return "⏸️";
            default:
                return "💳";
        }
    },

    /**
     * Format amount for display
     */
    formatAmount: (amount: number): string => {
        const sign = amount > 0 ? "+" : "";
        return `${sign}${amount.toFixed(1)}`;
    },
};
