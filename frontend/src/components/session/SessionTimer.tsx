'use client';

import { useEffect, useState } from 'react';
import { Clock } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';

interface SessionTimerProps {
    startTime: string; // ISO string
    durationHours: number;
    onTimeUp?: () => void;
}

/**
 * SessionTimer - Real-time countdown timer for active sessions
 * 
 * Displays remaining time and progress bar for an active session.
 * Updates every second and triggers callback when time expires.
 * 
 * Features:
 * - Real-time countdown (HH:MM:SS format)
 * - Progress bar showing session completion percentage
 * - Visual feedback when session expires (red border)
 * - Automatic cleanup on unmount
 * 
 * @param startTime - ISO string of session start time
 * @param durationHours - Session duration in hours
 * @param onTimeUp - Optional callback when timer reaches zero
 */
export function SessionTimer({ startTime, durationHours, onTimeUp }: SessionTimerProps) {
    const [timeLeft, setTimeLeft] = useState<string>('');
    const [progress, setProgress] = useState(0);
    const [isExpired, setIsExpired] = useState(false);

    useEffect(() => {
        const start = new Date(startTime).getTime();
        const durationMs = durationHours * 60 * 60 * 1000;
        const end = start + durationMs;

        const timer = setInterval(() => {
            const now = new Date().getTime();
            const distance = end - now;
            const elapsed = now - start;

            // Calculate progress percentage
            const progressValue = Math.min(100, Math.max(0, (elapsed / durationMs) * 100));
            setProgress(progressValue);

            if (distance < 0) {
                clearInterval(timer);
                setTimeLeft('00:00:00');
                setIsExpired(true);
                if (onTimeUp) onTimeUp();
                return;
            }

            const hours = Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
            const minutes = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60));
            const seconds = Math.floor((distance % (1000 * 60)) / 1000);

            setTimeLeft(
                `${hours.toString().padStart(2, '0')}:${minutes
                    .toString()
                    .padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`
            );
        }, 1000);

        return () => clearInterval(timer);
    }, [startTime, durationHours, onTimeUp]);

    return (
        <Card className={`border-2 ${isExpired ? 'border-red-500' : 'border-blue-500'}`}>
            <CardHeader className="pb-2">
                <CardTitle className="text-lg flex items-center gap-2">
                    <Clock className={`h-5 w-5 ${isExpired ? 'text-red-500' : 'text-blue-500'}`} />
                    Session Timer
                </CardTitle>
            </CardHeader>
            <CardContent>
                <div className="text-4xl font-bold text-center mb-4 font-mono">
                    {timeLeft || '--:--:--'}
                </div>
                <Progress value={progress} className="h-2" />
                <p className="text-xs text-center text-muted-foreground mt-2">
                    {isExpired ? 'Session time expired' : 'Time remaining'}
                </p>
            </CardContent>
        </Card>
    );
}
