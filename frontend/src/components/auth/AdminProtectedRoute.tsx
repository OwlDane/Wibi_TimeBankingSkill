'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAdminStore } from '@/stores/admin.store';

interface AdminProtectedRouteProps {
    children: React.ReactNode;
}

export function AdminProtectedRoute({ children }: AdminProtectedRouteProps) {
    const router = useRouter();
    const { isAuthenticated, isHydrated } = useAdminStore();

    useEffect(() => {
        // Only redirect after hydration is complete
        if (isHydrated && !isAuthenticated) {
            console.log('🔐 Admin not authenticated, redirecting to admin login');
            router.push('/admin/login');
        }
    }, [isAuthenticated, isHydrated, router]);

    // Show loading while hydrating or checking auth
    if (!isHydrated || !isAuthenticated) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-linear-to-br from-slate-900 to-slate-800">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
                    <p className="text-slate-400">Loading admin portal...</p>
                </div>
            </div>
        );
    }

    return <>{children}</>;
}
