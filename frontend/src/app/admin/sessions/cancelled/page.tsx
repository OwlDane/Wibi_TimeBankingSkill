'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function CancelledSessionsPage() {
    const router = useRouter();

    useEffect(() => {
        router.push('/admin/sessions?filter=cancelled');
    }, [router]);

    return null;
}
