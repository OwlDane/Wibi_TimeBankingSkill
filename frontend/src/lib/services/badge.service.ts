import { apiClient } from '@/lib/api';
import type { Badge, UserBadge } from '@/types';

export interface LeaderboardEntry {
    user_id: number;
    username: string;
    full_name: string;
    avatar: string;
    score: number;
    score_type: string;
    rank?: number;
}

export interface LeaderboardResponse {
    type: string;
    entries: LeaderboardEntry[];
    total: number;
}

/**
 * Badge service for handling badge-related API calls
 */
export const badgeService = {
    /**
     * Get all available badges
     */
    getAllBadges: async (): Promise<Badge[]> => {
        const response = await apiClient.get<{ badges: Badge[] }>('/badges');
        return response.badges;
    },

    /**
     * Get a specific badge by ID
     */
    getBadge: async (id: number): Promise<Badge> => {
        return apiClient.get<Badge>(`/badges/${id}`);
    },

    /**
     * Get all badges earned by the current user
     */
    getUserBadges: async (): Promise<UserBadge[]> => {
        const response = await apiClient.get<{ badges: UserBadge[] }>('/user/badges');
        return response.badges;
    },

    /**
     * Get user badges filtered by type
     */
    getUserBadgesByType: async (type: 'achievement' | 'milestone' | 'quality' | 'special'): Promise<UserBadge[]> => {
        const response = await apiClient.get<{ badges: UserBadge[] }>(`/user/badges/${type}`);
        return response.badges;
    },

    /**
     * Check and award badges for the user
     */
    checkAndAwardBadges: async (): Promise<UserBadge[]> => {
        const response = await apiClient.post<{ awarded_badges: UserBadge[] }>('/user/badges/check', {});
        return response.awarded_badges;
    },

    /**
     * Pin/unpin a badge
     */
    pinBadge: async (badgeId: number, isPinned: boolean): Promise<void> => {
        return apiClient.post(`/user/badges/${badgeId}/pin`, { is_pinned: isPinned });
    },

    /**
     * Get badge leaderboard (top users by badge count)
     */
    getBadgeLeaderboard: async (limit = 10): Promise<LeaderboardResponse> => {
        return apiClient.get<LeaderboardResponse>(`/leaderboard/badges?limit=${limit}`);
    },

    /**
     * Get rarity leaderboard (top users by badge rarity)
     */
    getRarityLeaderboard: async (limit = 10): Promise<LeaderboardResponse> => {
        return apiClient.get<LeaderboardResponse>(`/leaderboard/rarity?limit=${limit}`);
    },

    /**
     * Get session leaderboard (top users by session count)
     */
    getSessionLeaderboard: async (limit = 10): Promise<LeaderboardResponse> => {
        return apiClient.get<LeaderboardResponse>(`/leaderboard/sessions?limit=${limit}`);
    },

    /**
     * Get rating leaderboard (top users by average rating)
     */
    getRatingLeaderboard: async (limit = 10): Promise<LeaderboardResponse> => {
        return apiClient.get<LeaderboardResponse>(`/leaderboard/rating?limit=${limit}`);
    },

    /**
     * Get credit leaderboard (top users by credits earned)
     */
    getCreditLeaderboard: async (limit = 10): Promise<LeaderboardResponse> => {
        return apiClient.get<LeaderboardResponse>(`/leaderboard/credits?limit=${limit}`);
    },

    /**
     * Get badge rarity color
     */
    getRarityColor: (rarity: number): string => {
        if (rarity >= 5) return 'text-purple-600 dark:text-purple-400';
        if (rarity >= 4) return 'text-blue-600 dark:text-blue-400';
        if (rarity >= 3) return 'text-green-600 dark:text-green-400';
        if (rarity >= 2) return 'text-yellow-600 dark:text-yellow-400';
        return 'text-gray-600 dark:text-gray-400';
    },

    /**
     * Get badge type label
     */
    getBadgeTypeLabel: (type: string): string => {
        const labels: Record<string, string> = {
            achievement: '🏆 Achievement',
            milestone: '🎯 Milestone',
            quality: '⭐ Quality',
            special: '✨ Special',
        };
        return labels[type] || type;
    },

    /**
     * Format leaderboard score
     */
    formatScore: (score: number, type: string): string => {
        if (type === 'rating') {
            return (score / 100).toFixed(1);
        }
        return score.toString();
    },
};
