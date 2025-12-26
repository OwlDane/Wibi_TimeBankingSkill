'use client';

import * as React from 'react';
import { cn } from '@/lib/utils';
import { Loader2 } from 'lucide-react';

/**
 * LoadingSpinner - Reusable loading spinner component
 * 
 * @param size - Size variant: 'sm', 'md', 'lg'
 * @param className - Additional CSS classes
 */
interface LoadingSpinnerProps {
    size?: 'sm' | 'md' | 'lg';
    className?: string;
}

export function LoadingSpinner({ size = 'md', className }: LoadingSpinnerProps) {
    const sizeClasses = {
        sm: 'h-4 w-4',
        md: 'h-8 w-8',
        lg: 'h-12 w-12',
    };

    return (
        <Loader2
            className={cn('animate-spin text-primary', sizeClasses[size], className)}
            aria-label="Loading"
        />
    );
}

/**
 * LoadingSkeleton - Skeleton loader for content placeholders
 * 
 * @param className - Additional CSS classes
 */
interface LoadingSkeletonProps {
    className?: string;
}

export function LoadingSkeleton({ className }: LoadingSkeletonProps) {
    return (
        <div
            className={cn(
                'animate-pulse rounded-md bg-muted',
                className
            )}
            aria-label="Loading content"
        />
    );
}

/**
 * LoadingCard - Card skeleton for loading states
 */
export function LoadingCard() {
    return (
        <div className="rounded-lg border bg-card p-6 animate-pulse">
            <div className="space-y-4">
                <div className="h-4 bg-muted rounded w-3/4" />
                <div className="h-4 bg-muted rounded w-1/2" />
                <div className="h-20 bg-muted rounded" />
            </div>
        </div>
    );
}

/**
 * LoadingGrid - Grid of skeleton cards
 * 
 * @param count - Number of skeleton cards to show
 * @param columns - Number of columns (responsive)
 */
interface LoadingGridProps {
    count?: number;
    columns?: {
        mobile?: number;
        tablet?: number;
        desktop?: number;
    };
}

export function LoadingGrid({ count = 3, columns = { mobile: 1, tablet: 2, desktop: 3 } }: LoadingGridProps) {
    return (
        <div
            className={cn(
                'grid gap-6',
                `grid-cols-${columns.mobile || 1}`,
                `md:grid-cols-${columns.tablet || 2}`,
                `lg:grid-cols-${columns.desktop || 3}`
            )}
        >
            {Array.from({ length: count }).map((_, index) => (
                <LoadingCard key={index} />
            ))}
        </div>
    );
}

/**
 * LoadingPage - Full page loading state
 * 
 * @param message - Optional loading message
 */
interface LoadingPageProps {
    message?: string;
}

export function LoadingPage({ message = 'Loading...' }: LoadingPageProps) {
    return (
        <div className="min-h-screen flex items-center justify-center bg-background">
            <div className="text-center space-y-4">
                <LoadingSpinner size="lg" />
                <p className="text-muted-foreground">{message}</p>
            </div>
        </div>
    );
}

/**
 * LoadingInline - Inline loading state for buttons/actions
 */
export function LoadingInline() {
    return (
        <div className="inline-flex items-center gap-2">
            <LoadingSpinner size="sm" />
            <span className="text-sm text-muted-foreground">Loading...</span>
        </div>
    );
}

