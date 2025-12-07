'use client';

import { Trash2 } from 'lucide-react';
import type { Notification } from '@/types';
import { cn } from '@/lib/utils';
import { formatDistanceToNow } from 'date-fns';

interface NotificationItemProps {
    notification: Notification;
    onMarkAsRead: () => void;
    onDelete: () => void;
}

/**
 * NotificationItem Component
 * Displays a single notification in the dropdown
 */
export function NotificationItem({
    notification,
    onMarkAsRead,
    onDelete,
}: NotificationItemProps) {
    /**
     * Get icon based on notification type
     */
    const getTypeIcon = () => {
        switch (notification.type) {
            case 'session':
                return '📅';
            case 'credit':
                return '💰';
            case 'achievement':
                return '🏆';
            case 'review':
                return '⭐';
            case 'social':
                return '👥';
            default:
                return '📢';
        }
    };

    /**
     * Get color based on notification type
     */
    const getTypeColor = () => {
        switch (notification.type) {
            case 'session':
                return 'bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800';
            case 'credit':
                return 'bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800';
            case 'achievement':
                return 'bg-yellow-50 dark:bg-yellow-900/20 border-yellow-200 dark:border-yellow-800';
            case 'review':
                return 'bg-purple-50 dark:bg-purple-900/20 border-purple-200 dark:border-purple-800';
            case 'social':
                return 'bg-pink-50 dark:bg-pink-900/20 border-pink-200 dark:border-pink-800';
            default:
                return 'bg-gray-50 dark:bg-gray-900/20 border-gray-200 dark:border-gray-800';
        }
    };

    return (
        <div
            className={cn(
                'p-4 border-l-4 hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors',
                'cursor-pointer group',
                notification.is_read
                    ? 'border-gray-300 dark:border-gray-700 opacity-75'
                    : 'border-blue-500 dark:border-blue-400 bg-blue-50/30 dark:bg-blue-900/10'
            )}
            onClick={onMarkAsRead}
        >
            <div className="flex items-start gap-3">
                {/* Icon */}
                <span className="text-xl shrink-0 mt-1">{getTypeIcon()}</span>

                {/* Content */}
                <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2">
                        <div className="flex-1">
                            <h4
                                className={cn(
                                    'font-semibold text-sm',
                                    notification.is_read
                                        ? 'text-gray-700 dark:text-gray-300'
                                        : 'text-gray-900 dark:text-white'
                                )}
                            >
                                {notification.title}
                            </h4>
                            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                                {formatDistanceToNow(new Date(notification.created_at), {
                                    addSuffix: true,
                                })}
                            </p>
                        </div>

                        {/* Delete button */}
                        <button
                            onClick={(e) => {
                                e.stopPropagation();
                                onDelete();
                            }}
                            className={cn(
                                'p-1 rounded opacity-0 group-hover:opacity-100 transition-opacity',
                                'hover:bg-red-100 dark:hover:bg-red-900/30 text-red-600 dark:text-red-400'
                            )}
                            aria-label="Delete notification"
                        >
                            <Trash2 className="w-4 h-4" />
                        </button>
                    </div>

                    {/* Message */}
                    <p className="text-sm text-gray-600 dark:text-gray-400 mt-2 line-clamp-2">
                        {notification.message}
                    </p>

                    {/* Unread indicator */}
                    {!notification.is_read && (
                        <div className="mt-2 flex items-center gap-2">
                            <span className="inline-block w-2 h-2 bg-blue-500 rounded-full" />
                            <span className="text-xs text-blue-600 dark:text-blue-400 font-medium">
                                Unread
                            </span>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
