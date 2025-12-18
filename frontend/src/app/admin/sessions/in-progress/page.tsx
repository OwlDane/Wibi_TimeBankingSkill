'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function InProgressSessionsPage() {
    const router = useRouter();

    useEffect(() => {
        router.push('/admin/sessions?filter=in_progress');
    }, [router]);

    return null;
}
