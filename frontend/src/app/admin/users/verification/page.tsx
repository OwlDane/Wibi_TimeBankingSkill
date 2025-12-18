'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function VerificationUsersPage() {
    const router = useRouter();

    useEffect(() => {
        // Redirect to main users page with filter
        router.push('/admin/users?filter=verification');
    }, [router]);

    return null;
}
