'use client';

import FuzzyText from '@/components/FuzzyText';
import { useEffect } from 'react';

export default function Error({
    error,
    reset,
}: {
    error: Error & { digest?: string };
    reset: () => void;
}) {
    useEffect(() => {
        console.error(error);
    }, [error]);

    return (
        <div className="flex flex-col items-center justify-center h-screen gap-4">
            <FuzzyText
                baseIntensity={0.2}
                hoverIntensity={0.5}
                enableHover={true}
            >
                Error
            </FuzzyText>
            <button
                onClick={() => reset()}
                className="px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90"
            >
                Try again
            </button>
        </div>
    );
}
