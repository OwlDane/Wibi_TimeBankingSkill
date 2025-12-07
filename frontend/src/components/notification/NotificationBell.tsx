'use client';

import { useEffect, useState } from 'react';
import { Bell } from 'lucide-react';
import { useNotificationStore } from '@/stores/notification.store';
import { notificationService } from '@/lib/services/notification.service';
import { useNotificationWebSocket } from '@/lib/hooks/useNotificationWebSocket';
import { cn } from '@/lib/utils';

/**
 * NotificationBell Component
 * Displays notification bell icon with unread count badge
 * Connects to WebSocket for real-time updates
 */
export function NotificationBell() {
    const [isLoading, setIsLoading] = useState(true);
    const { unreadCount, setUnreadCount } = useNotificationStore();
    const { isConnected } = useNotificationWebSocket();

    /**
     * Fetch initial unread count on mount
     */
    useEffect(() => {
        const fetchUnreadCount = async () => {
            try {
                const count = await notificationService.getUnreadCount();
                setUnreadCount(count);
            } catch (error) {
                console.error('Failed to fetch unread count:', error);
            } finally {
                setIsLoading(false);
            }
        };

        fetchUnreadCount();
    }, [setUnreadCount]);

    return (
        <div className="relative">
            <button
                className={cn(
                    'relative p-2 text-gray-600 hover:text-gray-900 transition-colors',
                    'dark:text-gray-400 dark:hover:text-gray-200'
                )}
                aria-label="Notifications"
                title={isConnected ? 'Connected' : 'Connecting...'}
            >
                <Bell className="w-6 h-6" />

                {/* Unread count badge */}
                {unreadCount > 0 && (
                    <span
                        className={cn(
                            'absolute top-0 right-0 inline-flex items-center justify-center',
                            'px-2 py-1 text-xs font-bold leading-none text-white',
                            'transform translate-x-1/2 -translate-y-1/2',
                            'bg-red-600 rounded-full min-w-[20px]'
                        )}
                    >
                        {unreadCount > 99 ? '99+' : unreadCount}
                    </span>
                )}

                {/* Connection indicator */}
                <span
                    className={cn(
                        'absolute bottom-0 right-0 w-2 h-2 rounded-full',
                        'transform translate-x-1/4 translate-y-1/4',
                        isConnected ? 'bg-green-500' : 'bg-yellow-500'
                    )}
                    title={isConnected ? 'Connected' : 'Connecting...'}
                />
            </button>
        </div>
    );
}
