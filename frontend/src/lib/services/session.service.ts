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

/**
 * Session Service - Handles all session-related API calls
 * 
 * Provides methods for:
 * - Booking sessions (students)
 * - Approving/rejecting sessions (teachers)
 * - Starting and completing sessions
 * - Managing session lifecycle
 */
export const sessionService = {
    /**
     * Book a new session request
     * Student requests to learn a skill from a teacher
     * 
     * Flow:
     * 1. Validates student has sufficient credits
     * 2. Creates session with "pending" status
     * 3. Sends notification to teacher
     * 
     * @param data - Session request details (skill, duration, schedule, etc)
     * @returns Created session object
     */
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

    /**
     * Approve a session request (teacher only)
     * Teacher accepts the session and credits are held in escrow
     * 
     * Credit Flow:
     * - Credits are deducted from student's available balance
     * - Credits remain in escrow until session completes
     * - Credits transfer to teacher when both parties confirm completion
     * 
     * @param id - Session ID to approve
     * @param data - Optional approval details (meeting link, notes, etc)
     * @returns Updated session with approved status
     */
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

    /**
     * Confirm session completion
     * Both teacher and student must confirm before credits are transferred
     * 
     * Completion Flow:
     * - First confirmation: Marks user's confirmation (waits for other party)
     * - Second confirmation: Completes session and transfers credits
     * - Credits are released from escrow to teacher
     * 
     * @param id - Session ID to confirm
     * @param data - Optional completion notes
     * @returns Updated session (may be completed if both confirmed)
     */
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
