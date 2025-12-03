import { create } from 'zustand';
import { sessionService } from '@/lib/services';
import type {
    Session,
    CreateSessionRequest,
    ApproveSessionRequest,
    RejectSessionRequest,
    CancelSessionRequest,
    CompleteSessionRequest,
} from '@/types';

interface SessionState {
    // State
    sessions: Session[];
    upcomingSessions: Session[];
    pendingRequests: Session[];
    currentSession: Session | null;
    total: number;
    isLoading: boolean;
    error: string | null;

    // Actions
    fetchSessions: (params?: { role?: 'teacher' | 'student'; status?: string; limit?: number; offset?: number }) => Promise<void>;
    fetchUpcomingSessions: (limit?: number) => Promise<void>;
    fetchPendingRequests: () => Promise<void>;
    fetchSession: (id: number) => Promise<void>;
    bookSession: (data: CreateSessionRequest) => Promise<Session>;
    approveSession: (id: number, data?: ApproveSessionRequest) => Promise<Session>;
    rejectSession: (id: number, data: RejectSessionRequest) => Promise<Session>;
    startSession: (id: number) => Promise<Session>;
    confirmCompletion: (id: number, data?: CompleteSessionRequest) => Promise<Session>;
    cancelSession: (id: number, data: CancelSessionRequest) => Promise<Session>;
    clearError: () => void;
    reset: () => void;
}

const initialState = {
    sessions: [],
    upcomingSessions: [],
    pendingRequests: [],
    currentSession: null,
    total: 0,
    isLoading: false,
    error: null,
};

export const useSessionStore = create<SessionState>((set, get) => ({
    ...initialState,

    fetchSessions: async (params) => {
        set({ isLoading: true, error: null });
        try {
            const response = await sessionService.getUserSessions(params);
            set({
                sessions: response.sessions,
                total: response.total,
                isLoading: false,
            });
        } catch (error: any) {
            set({
                error: error.response?.data?.error || 'Failed to fetch sessions',
                isLoading: false,
            });
        }
    },

    fetchUpcomingSessions: async (limit = 5) => {
        set({ isLoading: true, error: null });
        try {
            const sessions = await sessionService.getUpcomingSessions(limit);
            set({ upcomingSessions: sessions, isLoading: false });
        } catch (error: any) {
            set({
                error: error.response?.data?.error || 'Failed to fetch upcoming sessions',
                isLoading: false,
            });
        }
    },

    fetchPendingRequests: async () => {
        set({ isLoading: true, error: null });
        try {
            const sessions = await sessionService.getPendingRequests();
            set({ pendingRequests: sessions, isLoading: false });
        } catch (error: any) {
            set({
                error: error.response?.data?.error || 'Failed to fetch pending requests',
                isLoading: false,
            });
        }
    },

    fetchSession: async (id) => {
        set({ isLoading: true, error: null });
        try {
            const session = await sessionService.getSession(id);
            set({ currentSession: session, isLoading: false });
        } catch (error: any) {
            set({
                error: error.response?.data?.error || 'Failed to fetch session',
                isLoading: false,
            });
        }
    },

    bookSession: async (data) => {
        set({ isLoading: true, error: null });
        try {
            const session = await sessionService.bookSession(data);
            set((state) => ({
                sessions: [session, ...state.sessions],
                isLoading: false,
            }));
            return session;
        } catch (error: any) {
            const errorMessage = error.response?.data?.error || 'Failed to book session';
            set({ error: errorMessage, isLoading: false });
            throw new Error(errorMessage);
        }
    },

    approveSession: async (id, data) => {
        set({ isLoading: true, error: null });
        try {
            const session = await sessionService.approveSession(id, data);
            set((state) => ({
                sessions: state.sessions.map((s) => (s.id === id ? session : s)),
                pendingRequests: state.pendingRequests.filter((s) => s.id !== id),
                currentSession: state.currentSession?.id === id ? session : state.currentSession,
                isLoading: false,
            }));
            return session;
        } catch (error: any) {
            const errorMessage = error.response?.data?.error || 'Failed to approve session';
            set({ error: errorMessage, isLoading: false });
            throw new Error(errorMessage);
        }
    },

    rejectSession: async (id, data) => {
        set({ isLoading: true, error: null });
        try {
            const session = await sessionService.rejectSession(id, data);
            set((state) => ({
                sessions: state.sessions.map((s) => (s.id === id ? session : s)),
                pendingRequests: state.pendingRequests.filter((s) => s.id !== id),
                currentSession: state.currentSession?.id === id ? session : state.currentSession,
                isLoading: false,
            }));
            return session;
        } catch (error: any) {
            const errorMessage = error.response?.data?.error || 'Failed to reject session';
            set({ error: errorMessage, isLoading: false });
            throw new Error(errorMessage);
        }
    },

    startSession: async (id) => {
        set({ isLoading: true, error: null });
        try {
            const session = await sessionService.startSession(id);
            set((state) => ({
                sessions: state.sessions.map((s) => (s.id === id ? session : s)),
                upcomingSessions: state.upcomingSessions.filter((s) => s.id !== id),
                currentSession: state.currentSession?.id === id ? session : state.currentSession,
                isLoading: false,
            }));
            return session;
        } catch (error: any) {
            const errorMessage = error.response?.data?.error || 'Failed to start session';
            set({ error: errorMessage, isLoading: false });
            throw new Error(errorMessage);
        }
    },

    confirmCompletion: async (id, data) => {
        set({ isLoading: true, error: null });
        try {
            const session = await sessionService.confirmCompletion(id, data);
            set((state) => ({
                sessions: state.sessions.map((s) => (s.id === id ? session : s)),
                currentSession: state.currentSession?.id === id ? session : state.currentSession,
                isLoading: false,
            }));
            return session;
        } catch (error: any) {
            const errorMessage = error.response?.data?.error || 'Failed to confirm completion';
            set({ error: errorMessage, isLoading: false });
            throw new Error(errorMessage);
        }
    },

    cancelSession: async (id, data) => {
        set({ isLoading: true, error: null });
        try {
            const session = await sessionService.cancelSession(id, data);
            set((state) => ({
                sessions: state.sessions.map((s) => (s.id === id ? session : s)),
                upcomingSessions: state.upcomingSessions.filter((s) => s.id !== id),
                pendingRequests: state.pendingRequests.filter((s) => s.id !== id),
                currentSession: state.currentSession?.id === id ? session : state.currentSession,
                isLoading: false,
            }));
            return session;
        } catch (error: any) {
            const errorMessage = error.response?.data?.error || 'Failed to cancel session';
            set({ error: errorMessage, isLoading: false });
            throw new Error(errorMessage);
        }
    },

    clearError: () => set({ error: null }),
    reset: () => set(initialState),
}));

export default useSessionStore;
