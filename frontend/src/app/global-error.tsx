'use client';

import GlobalErrorContent from '@/app/error-page/global-error';

export default function GlobalError(props: {
    error: Error & { digest?: string };
    reset: () => void;
}) {
    return <GlobalErrorContent {...props} />;
}
