import { create } from 'zustand';
import { badgeService } from '@/lib/services';
import type { Badge, UserBadge } from '@/types';
import type { LeaderboardEntry, LeaderboardResponse } from '@/lib/services/badge.service';

interface BadgeState {
    // State
    badges: Badge[];
    userBadges: UserBadge[];
    leaderboards: Record<string, LeaderboardEntry[]>;
    isLoading: boolean;
    error: string | null;

    // Actions
    fetchAllBadges: () => Promise<void>;
    fetchUserBadges: () => Promise<void>;
    fetchUserBadgesByType: (type: 'achievement' | 'milestone' | 'quality' | 'special') => Promise<void>;
    checkAndAwardBadges: () => Promise<UserBadge[]>;
    pinBadge: (badgeId: number, isPinned: boolean) => Promise<void>;
    fetchLeaderboard: (type: 'badges' | 'rarity' | 'sessions' | 'rating' | 'credits', limit?: number) => Promise<void>;
    clearError: () => void;
    reset: () => void;
}

const initialState = {
    badges: [],
    userBadges: [],
    leaderboards: {},
    isLoading: false,
    error: null,
};

/**
 * Badge store for managing badge state
 */
export const useBadgeStore = create<BadgeState>((set) => ({
    ...initialState,

    /**
     * Fetch all available badges
     */
    fetchAllBadges: async () => {
        set({ isLoading: true, error: null });
        try {
            const badges = await badgeService.getAllBadges();
            set({ badges, isLoading: false });
        } catch (error: any) {
            const errorMessage = error.message || 'Failed to fetch badges';
            set({ isLoading: false, error: errorMessage });
            throw error;
        }
    },

    /**
     * Fetch all badges earned by the user
     */
    fetchUserBadges: async () => {
        set({ isLoading: true, error: null });
        try {
            const userBadges = await badgeService.getUserBadges();
            set({ userBadges, isLoading: false });
        } catch (error: any) {
            const errorMessage = error.message || 'Failed to fetch user badges';
            set({ isLoading: false, error: errorMessage });
            throw error;
        }
    },

    /**
     * Fetch user badges filtered by type
     */
    fetchUserBadgesByType: async (type) => {
        set({ isLoading: true, error: null });
        try {
            const userBadges = await badgeService.getUserBadgesByType(type);
            set({ userBadges, isLoading: false });
        } catch (error: any) {
            const errorMessage = error.message || 'Failed to fetch user badges';
            set({ isLoading: false, error: errorMessage });
            throw error;
        }
    },

    /**
     * Check and award badges
     */
    checkAndAwardBadges: async () => {
        set({ isLoading: true, error: null });
        try {
            const awardedBadges = await badgeService.checkAndAwardBadges();
            set({ isLoading: false });
            return awardedBadges;
        } catch (error: any) {
            const errorMessage = error.message || 'Failed to check badges';
            set({ isLoading: false, error: errorMessage });
            throw error;
        }
    },

    /**
     * Pin/unpin a badge
     */
    pinBadge: async (badgeId, isPinned) => {
        set({ isLoading: true, error: null });
        try {
            await badgeService.pinBadge(badgeId, isPinned);
            set((state) => ({
                userBadges: state.userBadges.map((ub) =>
                    ub.badge_id === badgeId ? { ...ub, is_pinned: isPinned } : ub
                ),
                isLoading: false,
            }));
        } catch (error: any) {
            const errorMessage = error.message || 'Failed to pin badge';
            set({ isLoading: false, error: errorMessage });
            throw error;
        }
    },

    /**
     * Fetch leaderboard
     */
    fetchLeaderboard: async (type, limit = 10) => {
        set({ isLoading: true, error: null });
        try {
            let response: LeaderboardResponse;

            switch (type) {
                case 'badges':
                    response = await badgeService.getBadgeLeaderboard(limit);
                    break;
                case 'rarity':
                    response = await badgeService.getRarityLeaderboard(limit);
                    break;
                case 'sessions':
                    response = await badgeService.getSessionLeaderboard(limit);
                    break;
                case 'rating':
                    response = await badgeService.getRatingLeaderboard(limit);
                    break;
                case 'credits':
                    response = await badgeService.getCreditLeaderboard(limit);
                    break;
                default:
                    throw new Error('Invalid leaderboard type');
            }

            set((state) => ({
                leaderboards: {
                    ...state.leaderboards,
                    [type]: response.entries,
                },
                isLoading: false,
            }));
        } catch (error: any) {
            const errorMessage = error.message || 'Failed to fetch leaderboard';
            set({ isLoading: false, error: errorMessage });
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

export default useBadgeStore;
