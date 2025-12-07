'use client';

import { useEffect, useState } from 'react';
import { X, Loader2 } from 'lucide-react';
import { useNotificationStore } from '@/stores/notification.store';
import { notificationService } from '@/lib/services/notification.service';
import { NotificationItem } from './NotificationItem';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';

interface NotificationDropdownProps {
    isOpen: boolean;
    onClose: () => void;
}

/**
 * NotificationDropdown Component
 * Displays list of recent notifications in a dropdown
 * Allows marking as read and deleting notifications
 */
export function NotificationDropdown({
    isOpen,
    onClose,
}: NotificationDropdownProps) {
    const [isLoading, setIsLoading] = useState(false);
    const { notifications, setNotifications, markAsRead, removeNotification } =
        useNotificationStore();

    /**
     * Fetch notifications when dropdown opens
     */
    useEffect(() => {
        if (isOpen) {
            fetchNotifications();
        }
    }, [isOpen]);

    /**
     * Fetch recent notifications
     */
    const fetchNotifications = async () => {
        setIsLoading(true);
        try {
            const data = await notificationService.getNotifications(10, 0);
            setNotifications(data.notifications);
        } catch (error) {
            console.error('Failed to fetch notifications:', error);
            toast.error('Failed to load notifications');
        } finally {
            setIsLoading(false);
        }
    };

    /**
     * Handle marking notification as read
     */
    const handleMarkAsRead = async (id: number) => {
        try {
            await notificationService.markAsRead(id);
            markAsRead(id);
        } catch (error) {
            console.error('Failed to mark notification as read:', error);
            toast.error('Failed to update notification');
        }
    };

    /**
     * Handle deleting notification
     */
    const handleDelete = async (id: number) => {
        try {
            await notificationService.deleteNotification(id);
            removeNotification(id);
            toast.success('Notification deleted');
        } catch (error) {
            console.error('Failed to delete notification:', error);
            toast.error('Failed to delete notification');
        }
    };

    if (!isOpen) {
        return null;
    }

    return (
        <div
            className={cn(
                'absolute right-0 top-12 w-96 max-h-96 overflow-y-auto',
                'bg-white dark:bg-gray-900 rounded-lg shadow-lg border',
                'border-gray-200 dark:border-gray-700 z-50'
            )}
        >
            {/* Header */}
            <div className="sticky top-0 flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900">
                <h3 className="font-semibold text-gray-900 dark:text-white">
                    Notifications
                </h3>
                <button
                    onClick={onClose}
                    className="p-1 hover:bg-gray-100 dark:hover:bg-gray-800 rounded"
                    aria-label="Close"
                >
                    <X className="w-4 h-4" />
                </button>
            </div>

            {/* Content */}
            <div className="divide-y divide-gray-200 dark:divide-gray-700">
                {isLoading ? (
                    <div className="flex items-center justify-center py-8">
                        <Loader2 className="w-5 h-5 animate-spin text-gray-400" />
                    </div>
                ) : notifications.length === 0 ? (
                    <div className="py-8 text-center text-gray-500 dark:text-gray-400">
                        <p>No notifications yet</p>
                    </div>
                ) : (
                    notifications.map((notification) => (
                        <NotificationItem
                            key={notification.id}
                            notification={notification}
                            onMarkAsRead={() => handleMarkAsRead(notification.id)}
                            onDelete={() => handleDelete(notification.id)}
                        />
                    ))
                )}
            </div>

            {/* Footer */}
            {notifications.length > 0 && (
                <div className="p-3 border-t border-gray-200 dark:border-gray-700 text-center">
                    <button
                        onClick={() => {
                            onClose();
                            // Navigate to notifications page
                            window.location.href = '/notifications';
                        }}
                        className="text-sm text-blue-600 dark:text-blue-400 hover:underline"
                    >
                        View all notifications
                    </button>
                </div>
            )}
        </div>
    );
}
