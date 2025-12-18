'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function ActiveUsersPage() {
    const router = useRouter();

    useEffect(() => {
        // Redirect to main users page with filter
        router.push('/admin/users?filter=active');
    }, [router]);

    return null;
}
