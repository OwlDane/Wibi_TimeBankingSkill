import { create } from 'zustand';
import type { Notification } from '@/types';

interface NotificationStore {
    // State
    notifications: Notification[];
    unreadCount: number;
    isConnected: boolean;
    isLoading: boolean;

    // Actions
    addNotification: (notification: Notification) => void;
    removeNotification: (id: number) => void;
    markAsRead: (id: number) => void;
    markAllAsRead: () => void;
    setUnreadCount: (count: number) => void;
    setConnected: (connected: boolean) => void;
    setLoading: (loading: boolean) => void;
    setNotifications: (notifications: Notification[]) => void;
    clearAll: () => void;
}

export const useNotificationStore = create<NotificationStore>((set) => ({
    notifications: [],
    unreadCount: 0,
    isConnected: false,
    isLoading: false,

    addNotification: (notification: Notification) =>
        set((state) => ({
            notifications: [notification, ...state.notifications],
            unreadCount: state.unreadCount + 1,
        })),

    removeNotification: (id: number) =>
        set((state) => ({
            notifications: state.notifications.filter((n) => n.id !== id),
        })),

    markAsRead: (id: number) =>
        set((state) => {
            const notification = state.notifications.find((n) => n.id === id);
            if (notification && !notification.is_read) {
                return {
                    notifications: state.notifications.map((n) =>
                        n.id === id ? { ...n, is_read: true } : n
                    ),
                    unreadCount: Math.max(0, state.unreadCount - 1),
                };
            }
            return state;
        }),

    markAllAsRead: () =>
        set((state) => ({
            notifications: state.notifications.map((n) => ({
                ...n,
                is_read: true,
            })),
            unreadCount: 0,
        })),

    setUnreadCount: (count: number) =>
        set({
            unreadCount: count,
        }),

    setConnected: (connected: boolean) =>
        set({
            isConnected: connected,
        }),

    setLoading: (loading: boolean) =>
        set({
            isLoading: loading,
        }),

    setNotifications: (notifications: Notification[]) =>
        set({
            notifications,
        }),

    clearAll: () =>
        set({
            notifications: [],
            unreadCount: 0,
            isConnected: false,
            isLoading: false,
        }),
}));
