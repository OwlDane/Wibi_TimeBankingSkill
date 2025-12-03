'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Header } from '@/components/layout';
import { skillService } from '@/lib/services';
import { useAuthStore } from '@/stores/auth.store';
import type { Skill, UserSkill } from '@/types';

export default function SkillDetailPage() {
    const params = useParams();
    const router = useRouter();
    const { isAuthenticated } = useAuthStore();
    const skillId = Number(params.skillId);

    const [skill, setSkill] = useState<Skill | null>(null);
    const [teachers, setTeachers] = useState<UserSkill[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const fetchData = async () => {
            try {
                setIsLoading(true);
                const skillData = await skillService.getSkillById(skillId);
                setSkill(skillData);
                
                // Fetch teachers for this skill
                const teachersData = await skillService.getSkillTeachers(skillId);
                setTeachers(teachersData);
            } catch (err: any) {
                setError(err.message || 'Failed to load skill');
            } finally {
                setIsLoading(false);
            }
        };

        if (skillId) {
            fetchData();
        }
    }, [skillId]);

    const handleBookSession = (userSkillId: number) => {
        if (!isAuthenticated) {
            router.push('/login?redirect=' + encodeURIComponent(`/book/${userSkillId}`));
            return;
        }
        router.push(`/book/${userSkillId}`);
    };

    if (isLoading) {
        return (
            <div className="min-h-screen bg-background">
                <Header />
                <main className="container py-8">
                    <div className="text-center py-12">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
                        <p className="mt-2 text-muted-foreground">Loading skill details...</p>
                    </div>
                </main>
            </div>
        );
    }

    if (error || !skill) {
        return (
            <div className="min-h-screen bg-background">
                <Header />
                <main className="container py-8">
                    <div className="text-center py-12">
                        <p className="text-red-500">{error || 'Skill not found'}</p>
                        <Link href="/marketplace">
                            <Button className="mt-4">Back to Marketplace</Button>
                        </Link>
                    </div>
                </main>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-background">
            <Header />

            <main className="container py-8">
                <div className="flex flex-col space-y-8">
                    {/* Breadcrumb */}
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <Link href="/marketplace" className="hover:underline">Marketplace</Link>
                        <span>/</span>
                        <span>{skill.name}</span>
                    </div>

                    {/* Skill Header */}
                    <div className="flex flex-col md:flex-row gap-6">
                        <div className="w-full md:w-1/3">
                            <div className="aspect-video w-full overflow-hidden bg-primary/10 rounded-lg flex items-center justify-center">
                                {skill.icon ? (
                                    <span className="text-6xl">{skill.icon}</span>
                                ) : (
                                    <svg xmlns="http://www.w3.org/2000/svg" width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-primary/50">
                                        <path d="M22 10v6M2 10l10-5 10 5-10 5z" />
                                        <path d="M6 12v5c3 3 9 3 12 0v-5" />
                                    </svg>
                                )}
                            </div>
                        </div>
                        <div className="flex-1 space-y-4">
                            <div className="flex items-start justify-between">
                                <div>
                                    <h1 className="text-3xl font-bold">{skill.name}</h1>
                                    <Badge className="mt-2 capitalize">{skill.category}</Badge>
                                </div>
                            </div>
                            <p className="text-muted-foreground">{skill.description || 'No description available'}</p>
                            <div className="flex gap-4 text-sm">
                                <div>
                                    <span className="font-medium">{skill.total_teachers || 0}</span>
                                    <span className="text-muted-foreground ml-1">teachers</span>
                                </div>
                                <div>
                                    <span className="font-medium">{skill.total_learners || 0}</span>
                                    <span className="text-muted-foreground ml-1">learners</span>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Teachers List */}
                    <div>
                        <h2 className="text-2xl font-bold mb-4">Available Teachers</h2>
                        {teachers.length === 0 ? (
                            <Card>
                                <CardContent className="py-12 text-center text-muted-foreground">
                                    <svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mx-auto mb-4 opacity-50">
                                        <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
                                        <circle cx="9" cy="7" r="4" />
                                        <path d="M22 21v-2a4 4 0 0 0-3-3.87" />
                                        <path d="M16 3.13a4 4 0 0 1 0 7.75" />
                                    </svg>
                                    <p className="text-lg font-medium">No teachers available</p>
                                    <p className="text-sm mt-1">Be the first to teach this skill!</p>
                                    <Link href="/profile">
                                        <Button className="mt-4">Add This Skill</Button>
                                    </Link>
                                </CardContent>
                            </Card>
                        ) : (
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                {teachers.map((teacher) => (
                                    <Card key={teacher.id}>
                                        <CardHeader>
                                            <div className="flex items-center gap-4">
                                                <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center text-primary font-medium">
                                                    {teacher.user?.full_name?.charAt(0) || 'T'}
                                                </div>
                                                <div>
                                                    <CardTitle className="text-lg">{teacher.user?.full_name || 'Teacher'}</CardTitle>
                                                    <CardDescription>@{teacher.user?.username || 'unknown'}</CardDescription>
                                                </div>
                                            </div>
                                        </CardHeader>
                                        <CardContent>
                                            <p className="text-sm text-muted-foreground mb-4 line-clamp-2">
                                                {teacher.description || 'No description'}
                                            </p>
                                            <div className="flex flex-wrap gap-4 text-sm">
                                                <div className="flex items-center">
                                                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mr-1 text-yellow-400">
                                                        <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
                                                    </svg>
                                                    <span>{teacher.average_rating?.toFixed(1) || 'N/A'}</span>
                                                </div>
                                                <div>
                                                    <span className="text-muted-foreground">{teacher.total_sessions || 0} sessions</span>
                                                </div>
                                                <div>
                                                    <Badge variant="outline" className="capitalize">{teacher.level}</Badge>
                                                </div>
                                            </div>
                                            <div className="mt-4 flex items-center">
                                                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mr-1">
                                                    <circle cx="12" cy="12" r="10" />
                                                    <polyline points="12 6 12 12 16 14" />
                                                </svg>
                                                <span className="font-medium">{teacher.hourly_rate || 1} Credit/hour</span>
                                            </div>
                                        </CardContent>
                                        <CardFooter>
                                            <Button 
                                                className="w-full" 
                                                onClick={() => handleBookSession(teacher.id)}
                                                disabled={!teacher.is_available}
                                            >
                                                {teacher.is_available ? 'Book Session' : 'Not Available'}
                                            </Button>
                                        </CardFooter>
                                    </Card>
                                ))}
                            </div>
                        )}
                    </div>
                </div>
            </main>
        </div>
    );
}
