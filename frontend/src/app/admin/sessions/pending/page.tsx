'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function PendingSessionsPage() {
    const router = useRouter();

    useEffect(() => {
        router.push('/admin/sessions?filter=pending');
    }, [router]);

    return null;
}
