'use client';

import FuzzyText from '@/components/FuzzyText';

export default function GlobalError({
    error,
    reset,
}: {
    error: Error & { digest?: string };
    reset: () => void;
}) {
    return (
        <html>
            <body>
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
            </body>
        </html>
    );
}
