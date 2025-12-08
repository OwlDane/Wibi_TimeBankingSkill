import axios from 'axios';
import type {
    UserAnalytics,
    PlatformAnalytics,
    SessionStatistic,
    CreditStatistic,
    ApiResponse,
} from '@/types';

const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080/api/v1';

/**
 * Analytics Service - Handles all analytics API calls
 */
export const analyticsService = {
    /**
     * Get current user's analytics
     */
    async getUserAnalytics(): Promise<UserAnalytics> {
        try {
            const response = await axios.get<ApiResponse<UserAnalytics>>(
                `${API_BASE}/analytics/user`,
                { headers: { Authorization: `Bearer ${localStorage.getItem('token')}` } }
            );
            return response.data.data || ({} as UserAnalytics);
        } catch (error) {
            console.error('Failed to fetch user analytics:', error);
            throw error;
        }
    },

    /**
     * Get specific user's analytics (admin)
     */
    async getUserAnalyticsById(userId: number): Promise<UserAnalytics> {
        try {
            const response = await axios.get<ApiResponse<UserAnalytics>>(
                `${API_BASE}/analytics/user/${userId}`,
                { headers: { Authorization: `Bearer ${localStorage.getItem('token')}` } }
            );
            return response.data.data || ({} as UserAnalytics);
        } catch (error) {
            console.error('Failed to fetch user analytics:', error);
            throw error;
        }
    },

    /**
     * Get platform-wide analytics (admin)
     */
    async getPlatformAnalytics(): Promise<PlatformAnalytics> {
        try {
            const response = await axios.get<ApiResponse<PlatformAnalytics>>(
                `${API_BASE}/analytics/platform`,
                { headers: { Authorization: `Bearer ${localStorage.getItem('token')}` } }
            );
            return response.data.data || ({} as PlatformAnalytics);
        } catch (error) {
            console.error('Failed to fetch platform analytics:', error);
            throw error;
        }
    },

    /**
     * Get session statistics
     */
    async getSessionStatistics(): Promise<SessionStatistic> {
        try {
            const response = await axios.get<ApiResponse<SessionStatistic>>(
                `${API_BASE}/analytics/sessions`,
                { headers: { Authorization: `Bearer ${localStorage.getItem('token')}` } }
            );
            return response.data.data || ({} as SessionStatistic);
        } catch (error) {
            console.error('Failed to fetch session statistics:', error);
            throw error;
        }
    },

    /**
     * Get credit statistics
     */
    async getCreditStatistics(): Promise<CreditStatistic> {
        try {
            const response = await axios.get<ApiResponse<CreditStatistic>>(
                `${API_BASE}/analytics/credits`,
                { headers: { Authorization: `Bearer ${localStorage.getItem('token')}` } }
            );
            return response.data.data || ({} as CreditStatistic);
        } catch (error) {
            console.error('Failed to fetch credit statistics:', error);
            throw error;
        }
    },
};
