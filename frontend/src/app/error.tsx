'use client';

import ErrorContent from '@/app/error-page/error';

export default function Error(props: {
    error: Error & { digest?: string };
    reset: () => void;
}) {
    return <ErrorContent {...props} />;
}
