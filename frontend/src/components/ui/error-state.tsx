'use client';

import * as React from 'react';
import { AlertCircle, RefreshCw, Home } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { cn } from '@/lib/utils';

/**
 * ErrorState - Reusable error state component
 * 
 * @param title - Error title
 * @param message - Error message
 * @param onRetry - Optional retry callback
 * @param onHome - Optional navigate home callback
 * @param className - Additional CSS classes
 */
interface ErrorStateProps {
    title?: string;
    message?: string;
    onRetry?: () => void;
    onHome?: () => void;
    className?: string;
    variant?: 'default' | 'compact' | 'full';
}

export function ErrorState({
    title = 'Something went wrong',
    message = 'An error occurred while loading this content. Please try again.',
    onRetry,
    onHome,
    className,
    variant = 'default',
}: ErrorStateProps) {
    if (variant === 'compact') {
        return (
            <div className={cn('flex items-center gap-2 text-destructive', className)}>
                <AlertCircle className="h-4 w-4" />
                <span className="text-sm">{message}</span>
                {onRetry && (
                    <Button
                        variant="ghost"
                        size="sm"
                        onClick={onRetry}
                        className="ml-auto"
                    >
                        <RefreshCw className="h-4 w-4 mr-2" />
                        Retry
                    </Button>
                )}
            </div>
        );
    }

    if (variant === 'full') {
        return (
            <div className={cn('min-h-screen flex items-center justify-center bg-background p-4', className)}>
                <Card className="max-w-md w-full">
                    <CardHeader>
                        <div className="flex items-center justify-center mb-4">
                            <div className="rounded-full bg-destructive/10 p-3">
                                <AlertCircle className="h-8 w-8 text-destructive" />
                            </div>
                        </div>
                        <CardTitle className="text-center">{title}</CardTitle>
                        <CardDescription className="text-center">{message}</CardDescription>
                    </CardHeader>
                    <CardContent className="flex flex-col gap-3">
                        {onRetry && (
                            <Button onClick={onRetry} className="w-full">
                                <RefreshCw className="h-4 w-4 mr-2" />
                                Try Again
                            </Button>
                        )}
                        {onHome && (
                            <Button variant="outline" onClick={onHome} className="w-full">
                                <Home className="h-4 w-4 mr-2" />
                                Go Home
                            </Button>
                        )}
                    </CardContent>
                </Card>
            </div>
        );
    }

    // Default variant
    return (
        <Card className={cn('border-destructive/50', className)}>
            <CardContent className="py-12">
                <div className="text-center space-y-4">
                    <div className="flex items-center justify-center">
                        <div className="rounded-full bg-destructive/10 p-3">
                            <AlertCircle className="h-8 w-8 text-destructive" />
                        </div>
                    </div>
                    <div>
                        <h3 className="text-lg font-semibold">{title}</h3>
                        <p className="text-sm text-muted-foreground mt-2">{message}</p>
                    </div>
                    {(onRetry || onHome) && (
                        <div className="flex gap-2 justify-center">
                            {onRetry && (
                                <Button variant="outline" size="sm" onClick={onRetry}>
                                    <RefreshCw className="h-4 w-4 mr-2" />
                                    Retry
                                </Button>
                            )}
                            {onHome && (
                                <Button variant="ghost" size="sm" onClick={onHome}>
                                    <Home className="h-4 w-4 mr-2" />
                                    Home
                                </Button>
                            )}
                        </div>
                    )}
                </div>
            </CardContent>
        </Card>
    );
}

/**
 * ErrorBoundaryFallback - Error boundary fallback component
 */
interface ErrorBoundaryFallbackProps {
    error: Error;
    resetErrorBoundary: () => void;
}

export function ErrorBoundaryFallback({ error, resetErrorBoundary }: ErrorBoundaryFallbackProps) {
    return (
        <ErrorState
            title="Unexpected Error"
            message={error.message || 'An unexpected error occurred'}
            onRetry={resetErrorBoundary}
            variant="full"
        />
    );
}

