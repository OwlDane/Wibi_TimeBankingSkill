'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function EarnedTransactionsPage() {
    const router = useRouter();

    useEffect(() => {
        router.push('/admin/transactions?filter=earned');
    }, [router]);

    return null;
}
