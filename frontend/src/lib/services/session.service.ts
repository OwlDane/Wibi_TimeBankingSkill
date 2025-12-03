import api from '../api';
import type {
    Session,
    CreateSessionRequest,
    ApproveSessionRequest,
    RejectSessionRequest,
    CancelSessionRequest,
    CompleteSessionRequest,
    SessionListResponse,
    ApiResponse,
} from '@/types';

export const sessionService = {
    // Book a new session
    async bookSession(data: CreateSessionRequest): Promise<Session> {
        const response = await api.post<ApiResponse<Session>>('/sessions', data);
        return response.data.data!;
    },

    // Get user's sessions
    async getUserSessions(params?: {
        role?: 'teacher' | 'student';
        status?: string;
        limit?: number;
        offset?: number;
    }): Promise<SessionListResponse> {
        const response = await api.get<ApiResponse<SessionListResponse>>('/sessions', { params });
        return response.data.data!;
    },

    // Get upcoming sessions
    async getUpcomingSessions(limit: number = 5): Promise<Session[]> {
        const response = await api.get<ApiResponse<Session[]>>('/sessions/upcoming', {
            params: { limit },
        });
        return response.data.data || [];
    },

    // Get pending session requests (for teachers)
    async getPendingRequests(): Promise<Session[]> {
        const response = await api.get<ApiResponse<Session[]>>('/sessions/pending');
        return response.data.data || [];
    },

    // Get session by ID
    async getSession(id: number): Promise<Session> {
        const response = await api.get<ApiResponse<Session>>(`/sessions/${id}`);
        return response.data.data!;
    },

    // Approve a session (teacher only)
    async approveSession(id: number, data?: ApproveSessionRequest): Promise<Session> {
        const response = await api.post<ApiResponse<Session>>(`/sessions/${id}/approve`, data || {});
        return response.data.data!;
    },

    // Reject a session (teacher only)
    async rejectSession(id: number, data: RejectSessionRequest): Promise<Session> {
        const response = await api.post<ApiResponse<Session>>(`/sessions/${id}/reject`, data);
        return response.data.data!;
    },

    // Start a session
    async startSession(id: number): Promise<Session> {
        const response = await api.post<ApiResponse<Session>>(`/sessions/${id}/start`);
        return response.data.data!;
    },

    // Confirm session completion
    async confirmCompletion(id: number, data?: CompleteSessionRequest): Promise<Session> {
        const response = await api.post<ApiResponse<Session>>(`/sessions/${id}/complete`, data || {});
        return response.data.data!;
    },

    // Cancel a session
    async cancelSession(id: number, data: CancelSessionRequest): Promise<Session> {
        const response = await api.post<ApiResponse<Session>>(`/sessions/${id}/cancel`, data);
        return response.data.data!;
    },
};

export default sessionService;
