'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Header } from '@/components/layout';
import { ProtectedRoute } from '@/components/auth';
import { skillService } from '@/lib/services';
import { useSessionStore } from '@/stores/session.store';
import { useAuthStore } from '@/stores/auth.store';
import { toast } from 'sonner';
import type { UserSkill, SessionMode } from '@/types';

const bookingSchema = z.object({
    title: z.string().min(5, 'Title must be at least 5 characters').max(200),
    description: z.string().max(1000).optional(),
    duration: z.number().min(0.5, 'Minimum 30 minutes').max(4, 'Maximum 4 hours'),
    mode: z.enum(['online', 'offline', 'hybrid']),
    scheduled_at: z.string().min(1, 'Please select a date and time'),
    location: z.string().optional(),
    meeting_link: z.string().optional(),
});

type BookingFormData = z.infer<typeof bookingSchema>;

function BookSessionContent() {
    const params = useParams();
    const router = useRouter();
    const userSkillId = Number(params.userSkillId);
    const { user } = useAuthStore();
    const { bookSession, isLoading: isBooking } = useSessionStore();

    const [userSkill, setUserSkill] = useState<UserSkill | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const {
        register,
        handleSubmit,
        watch,
        formState: { errors },
    } = useForm<BookingFormData>({
        resolver: zodResolver(bookingSchema),
        defaultValues: {
            duration: 1,
            mode: 'online',
        },
    });

    const selectedMode = watch('mode');
    const selectedDuration = watch('duration');

    useEffect(() => {
        const fetchUserSkill = async () => {
            try {
                setIsLoading(true);
                // We need to get user skill by ID - for now use a workaround
                const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/v1/skills/${userSkillId}/teachers`);
                // This is a temporary solution - ideally we'd have a direct endpoint
                setError('Loading teacher information...');
            } catch (err: any) {
                setError(err.message || 'Failed to load teacher information');
            } finally {
                setIsLoading(false);
            }
        };

        // For now, we'll create a mock userSkill based on the ID
        // In production, you'd fetch this from the backend
        setUserSkill({
            id: userSkillId,
            user_id: 0,
            skill_id: 0,
            skill: { id: 0, name: 'Loading...', category: 'academic', description: '', icon: '', total_teachers: 0, total_learners: 0, created_at: '' },
            level: 'intermediate',
            description: '',
            years_of_experience: 0,
            proof_url: '',
            proof_type: '',
            hourly_rate: 1,
            online_only: false,
            offline_only: false,
            is_available: true,
            total_sessions: 0,
            average_rating: 0,
            total_reviews: 0,
            created_at: '',
            updated_at: '',
        });
        setIsLoading(false);
    }, [userSkillId]);

    const onSubmit = async (data: BookingFormData) => {
        try {
            const session = await bookSession({
                user_skill_id: userSkillId,
                title: data.title,
                description: data.description || '',
                duration: data.duration,
                mode: data.mode as SessionMode,
                scheduled_at: new Date(data.scheduled_at).toISOString(),
                location: data.location,
                meeting_link: data.meeting_link,
            });

            toast.success('Session booked successfully! Waiting for teacher approval.');
            router.push('/dashboard');
        } catch (err: any) {
            toast.error(err.message || 'Failed to book session');
        }
    };

    const creditCost = (userSkill?.hourly_rate || 1) * (selectedDuration || 1);

    return (
        <div className="min-h-screen bg-background">
            <Header />

            <main className="container py-8 max-w-2xl">
                <div className="flex flex-col space-y-6">
                    {/* Breadcrumb */}
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <Link href="/marketplace" className="hover:underline">Marketplace</Link>
                        <span>/</span>
                        <span>Book Session</span>
                    </div>

                    <Card>
                        <CardHeader>
                            <CardTitle>Book a Session</CardTitle>
                            <CardDescription>
                                Fill in the details to request a learning session
                            </CardDescription>
                        </CardHeader>

                        <form onSubmit={handleSubmit(onSubmit)}>
                            <CardContent className="space-y-6">
                                {/* Credit Info */}
                                <div className="bg-primary/10 rounded-lg p-4">
                                    <div className="flex justify-between items-center">
                                        <div>
                                            <p className="font-medium">Session Cost</p>
                                            <p className="text-sm text-muted-foreground">
                                                {userSkill?.hourly_rate || 1} credit/hour × {selectedDuration} hours
                                            </p>
                                        </div>
                                        <div className="text-right">
                                            <p className="text-2xl font-bold">{creditCost.toFixed(1)}</p>
                                            <p className="text-sm text-muted-foreground">credits</p>
                                        </div>
                                    </div>
                                    <div className="mt-2 text-sm">
                                        Your balance: <span className="font-medium">{user?.credit_balance?.toFixed(1) || 0} credits</span>
                                        {user && user.credit_balance < creditCost && (
                                            <span className="text-red-500 ml-2">(Insufficient balance)</span>
                                        )}
                                    </div>
                                </div>

                                {/* Title */}
                                <div className="space-y-2">
                                    <Label htmlFor="title">Session Title *</Label>
                                    <Input
                                        id="title"
                                        placeholder="e.g., Help with Calculus Integration"
                                        {...register('title')}
                                    />
                                    {errors.title && (
                                        <p className="text-sm text-red-500">{errors.title.message}</p>
                                    )}
                                </div>

                                {/* Description */}
                                <div className="space-y-2">
                                    <Label htmlFor="description">What do you want to learn?</Label>
                                    <Textarea
                                        id="description"
                                        placeholder="Describe what you'd like to learn or get help with..."
                                        rows={4}
                                        {...register('description')}
                                    />
                                    {errors.description && (
                                        <p className="text-sm text-red-500">{errors.description.message}</p>
                                    )}
                                </div>

                                {/* Duration */}
                                <div className="space-y-2">
                                    <Label htmlFor="duration">Duration (hours) *</Label>
                                    <select
                                        id="duration"
                                        className="w-full rounded-md border border-input bg-background px-3 py-2"
                                        {...register('duration', { valueAsNumber: true })}
                                    >
                                        <option value={0.5}>30 minutes</option>
                                        <option value={1}>1 hour</option>
                                        <option value={1.5}>1.5 hours</option>
                                        <option value={2}>2 hours</option>
                                        <option value={2.5}>2.5 hours</option>
                                        <option value={3}>3 hours</option>
                                        <option value={4}>4 hours</option>
                                    </select>
                                    {errors.duration && (
                                        <p className="text-sm text-red-500">{errors.duration.message}</p>
                                    )}
                                </div>

                                {/* Mode */}
                                <div className="space-y-2">
                                    <Label>Session Mode *</Label>
                                    <div className="flex gap-4">
                                        {['online', 'offline', 'hybrid'].map((mode) => (
                                            <label key={mode} className="flex items-center gap-2 cursor-pointer">
                                                <input
                                                    type="radio"
                                                    value={mode}
                                                    {...register('mode')}
                                                    className="w-4 h-4"
                                                />
                                                <span className="capitalize">{mode}</span>
                                            </label>
                                        ))}
                                    </div>
                                    {errors.mode && (
                                        <p className="text-sm text-red-500">{errors.mode.message}</p>
                                    )}
                                </div>

                                {/* Scheduled Date/Time */}
                                <div className="space-y-2">
                                    <Label htmlFor="scheduled_at">Preferred Date & Time *</Label>
                                    <Input
                                        id="scheduled_at"
                                        type="datetime-local"
                                        min={new Date().toISOString().slice(0, 16)}
                                        {...register('scheduled_at')}
                                    />
                                    {errors.scheduled_at && (
                                        <p className="text-sm text-red-500">{errors.scheduled_at.message}</p>
                                    )}
                                </div>

                                {/* Location (for offline/hybrid) */}
                                {(selectedMode === 'offline' || selectedMode === 'hybrid') && (
                                    <div className="space-y-2">
                                        <Label htmlFor="location">Location</Label>
                                        <Input
                                            id="location"
                                            placeholder="e.g., School library, Coffee shop address"
                                            {...register('location')}
                                        />
                                    </div>
                                )}

                                {/* Meeting Link (for online/hybrid) */}
                                {(selectedMode === 'online' || selectedMode === 'hybrid') && (
                                    <div className="space-y-2">
                                        <Label htmlFor="meeting_link">Meeting Link (optional)</Label>
                                        <Input
                                            id="meeting_link"
                                            placeholder="e.g., Zoom or Google Meet link"
                                            {...register('meeting_link')}
                                        />
                                        <p className="text-xs text-muted-foreground">
                                            Leave empty if you want the teacher to provide the link
                                        </p>
                                    </div>
                                )}
                            </CardContent>

                            <CardFooter className="flex justify-between">
                                <Button type="button" variant="outline" onClick={() => router.back()}>
                                    Cancel
                                </Button>
                                <Button 
                                    type="submit" 
                                    disabled={isBooking || Boolean(user && user.credit_balance < creditCost)}
                                >
                                    {isBooking ? 'Booking...' : `Book Session (${creditCost.toFixed(1)} credits)`}
                                </Button>
                            </CardFooter>
                        </form>
                    </Card>

                    {/* Info */}
                    <div className="text-sm text-muted-foreground space-y-2">
                        <p>• Credits will be held when the teacher approves your request</p>
                        <p>• You can cancel before the session starts for a full refund</p>
                        <p>• Both parties must confirm completion for credits to transfer</p>
                    </div>
                </div>
            </main>
        </div>
    );
}

export default function BookSessionPage() {
    return (
        <ProtectedRoute>
            <BookSessionContent />
        </ProtectedRoute>
    );
}
