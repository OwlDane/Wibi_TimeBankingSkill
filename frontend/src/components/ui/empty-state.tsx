'use client';

import * as React from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { cn } from '@/lib/utils';
import type { LucideIcon } from 'lucide-react';

/**
 * EmptyState - Reusable empty state component
 * 
 * Used when there's no data to display (empty lists, no results, etc.)
 * 
 * @param icon - Optional icon component
 * @param title - Empty state title
 * @param description - Empty state description
 * @param action - Optional action button
 * @param className - Additional CSS classes
 */
interface EmptyStateProps {
    icon?: LucideIcon;
    title: string;
    description?: string;
    action?: {
        label: string;
        onClick: () => void;
        variant?: 'default' | 'outline' | 'ghost';
    };
    className?: string;
    variant?: 'default' | 'compact' | 'card';
}

export function EmptyState({
    icon: Icon,
    title,
    description,
    action,
    className,
    variant = 'default',
}: EmptyStateProps) {
    const content = (
        <div className={cn('text-center space-y-4', className)}>
            {Icon && (
                <div className="flex items-center justify-center">
                    <div className="rounded-full bg-muted p-4">
                        <Icon className="h-8 w-8 text-muted-foreground" />
                    </div>
                </div>
            )}
            <div>
                <h3 className="text-lg font-semibold">{title}</h3>
                {description && (
                    <p className="text-sm text-muted-foreground mt-2">{description}</p>
                )}
            </div>
            {action && (
                <Button
                    variant={action.variant || 'default'}
                    onClick={action.onClick}
                    size="sm"
                >
                    {action.label}
                </Button>
            )}
        </div>
    );

    if (variant === 'compact') {
        return <div className={cn('py-8', className)}>{content}</div>;
    }

    if (variant === 'card') {
        return (
            <Card className={className}>
                <CardContent className="py-12">{content}</CardContent>
            </Card>
        );
    }

    // Default variant
    return (
        <div className={cn('py-12', className)}>
            {content}
        </div>
    );
}

// Note: EmptyStatePresets can be created using the EmptyState component
// Example usage:
// <EmptyState {...EmptyStatePresets.noSessions} />

