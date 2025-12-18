'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function CompletedSessionsPage() {
    const router = useRouter();

    useEffect(() => {
        router.push('/admin/sessions?filter=completed');
    }, [router]);

    return null;
}
