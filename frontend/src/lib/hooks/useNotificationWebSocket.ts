import { useEffect, useRef } from 'react';
import { useNotificationStore } from '@/stores/notification.store';
import { useAuthStore } from '@/stores/auth.store';
import type { Notification } from '@/types';
import { toast } from 'sonner';

/**
 * Hook for managing WebSocket connection to notification server
 * Automatically connects/disconnects and handles incoming notifications
 *
 * Features:
 * - Auto-reconnect on disconnect
 * - Exponential backoff for reconnection
 * - Proper cleanup on unmount
 * - Real-time notification updates
 */
export function useNotificationWebSocket() {
    const wsRef = useRef<WebSocket | null>(null);
    const reconnectTimeoutRef = useRef<NodeJS.Timeout | null>(null);
    const reconnectAttemptsRef = useRef(0);
    const maxReconnectAttempts = 5;
    const baseReconnectDelay = 1000; // 1 second

    const { user } = useAuthStore();
    const {
        addNotification,
        setConnected,
        setUnreadCount,
    } = useNotificationStore();

    /**
     * Calculate reconnect delay with exponential backoff
     * Delay increases: 1s, 2s, 4s, 8s, 16s
     */
    const getReconnectDelay = () => {
        return baseReconnectDelay * Math.pow(2, reconnectAttemptsRef.current);
    };

    /**
     * Connect to WebSocket server
     */
    const connect = () => {
        if (!user || wsRef.current) {
            return;
        }

        try {
            const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
            const wsUrl = `${protocol}//${window.location.host}/api/v1/ws/notifications`;

            wsRef.current = new WebSocket(wsUrl);

            wsRef.current.onopen = () => {
                console.log('✅ WebSocket connected');
                setConnected(true);
                reconnectAttemptsRef.current = 0;
            };

            wsRef.current.onmessage = (event) => {
                try {
                    const notification: Notification = JSON.parse(event.data);
                    addNotification(notification);

                    // Show toast for new notifications
                    toast.success(notification.title, {
                        description: notification.message,
                    });
                } catch (error) {
                    console.error('Failed to parse notification:', error);
                }
            };

            wsRef.current.onerror = (error) => {
                console.error('❌ WebSocket error:', error);
                setConnected(false);
            };

            wsRef.current.onclose = () => {
                console.log('⚠️  WebSocket disconnected');
                setConnected(false);
                wsRef.current = null;

                // Attempt to reconnect with exponential backoff
                if (reconnectAttemptsRef.current < maxReconnectAttempts) {
                    const delay = getReconnectDelay();
                    console.log(
                        `🔄 Reconnecting in ${delay}ms (attempt ${reconnectAttemptsRef.current + 1}/${maxReconnectAttempts})`
                    );

                    reconnectTimeoutRef.current = setTimeout(() => {
                        reconnectAttemptsRef.current += 1;
                        connect();
                    }, delay);
                } else {
                    console.error('❌ Max reconnection attempts reached');
                }
            };
        } catch (error) {
            console.error('Failed to connect to WebSocket:', error);
            setConnected(false);
        }
    };

    /**
     * Disconnect from WebSocket server
     */
    const disconnect = () => {
        if (reconnectTimeoutRef.current) {
            clearTimeout(reconnectTimeoutRef.current);
            reconnectTimeoutRef.current = null;
        }

        if (wsRef.current) {
            wsRef.current.close();
            wsRef.current = null;
        }

        setConnected(false);
    };

    /**
     * Effect: Connect on mount, disconnect on unmount
     */
    useEffect(() => {
        if (user) {
            connect();
        }

        return () => {
            disconnect();
        };
    }, [user]);

    return {
        isConnected: wsRef.current?.readyState === WebSocket.OPEN,
        connect,
        disconnect,
    };
}
