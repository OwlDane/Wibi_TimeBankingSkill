import dynamic from 'next/dynamic'
import React, { ReactNode } from 'react'

/**
 * LoadingComponent - Default loading skeleton for lazy-loaded components
 * Shows a simple loading state while component is being loaded
 */
const LoadingComponent = (): ReactNode => {
    return React.createElement(
        'div',
        { className: 'flex items-center justify-center p-8' },
        React.createElement('div', {
            className: 'animate-spin rounded-full h-8 w-8 border-b-2 border-primary',
        })
    )
}

/**
 * ErrorComponent - Default error fallback for lazy-loaded components
 * Shows error message if component fails to load
 */
const ErrorComponent = ({ error }: { error: Error }): ReactNode => {
    return React.createElement(
        'div',
        { className: 'flex items-center justify-center p-8 text-red-500' },
        React.createElement('p', null, `Failed to load component: ${error.message}`)
    )
}

/**
 * createLazyComponent - Helper function to create lazy-loaded components
 * with consistent loading and error handling
 *
 * @param importFunc - Dynamic import function
 * @param options - Configuration options
 * @returns Lazy-loaded component
 *
 * @example
 * const Dashboard = dynamic(
 *   () => import('@/app/dashboard/page'),
 *   { loading: LoadingComponent, ssr: true }
 * )
 */
export const createLazyComponent = (
    importFunc: () => Promise<any>,
    options?: {
        ssr?: boolean
    }
) => {
    return dynamic(importFunc, {
        loading: LoadingComponent,
        ssr: options?.ssr !== false,
    })
}

/**
 * Lazy-loaded page components
 * These are loaded on-demand to reduce initial bundle size
 * Improves initial page load time and reduces bundle size
 */
export const LazyDashboard = dynamic(
    () => import('@/app/dashboard/page'),
    { loading: LoadingComponent, ssr: true }
)

export const LazyMarketplace = dynamic(
    () => import('@/app/marketplace/page'),
    { loading: LoadingComponent, ssr: true }
)

export const LazyProfile = dynamic(
    () => import('@/app/profile/page'),
    { loading: LoadingComponent, ssr: true }
)

export const LazyBadges = dynamic(
    () => import('@/app/badges/page'),
    { loading: LoadingComponent, ssr: true }
)

/**
 * Lazy-loaded component components
 * These are loaded on-demand within pages
 * Reduces initial bundle size and improves perceived performance
 */
export const LazyUserStats = dynamic(
    () => import('@/components/profile/UserStats'),
    { loading: LoadingComponent, ssr: true }
)

/**
 * Note: BadgeCollection and LeaderboardTabs are imported directly
 * as they are used within other components and don't need lazy loading
 */

export const LazySessionApprovalModal = dynamic(
    () => import('@/components/session/SessionApprovalModal'),
    { loading: LoadingComponent, ssr: false }
)

export const LazyTransactionDetailModal = dynamic(
    () => import('@/components/transaction/TransactionDetailModal'),
    { loading: LoadingComponent, ssr: false }
)
