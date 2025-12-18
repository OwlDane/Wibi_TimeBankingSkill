'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function SuspendedUsersPage() {
    const router = useRouter();

    useEffect(() => {
        // Redirect to main users page with filter
        router.push('/admin/users?filter=suspended');
    }, [router]);

    return null;
}
