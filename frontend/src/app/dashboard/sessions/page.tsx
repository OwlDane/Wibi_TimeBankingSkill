'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Header } from '@/components/layout';
import { ProtectedRoute } from '@/components/auth';
import { useSessionStore } from '@/stores/session.store';
import { useAuthStore } from '@/stores/auth.store';
import { toast } from 'sonner';
import type { Session, SessionStatus } from '@/types';

function formatDate(dateString: string | null) {
    if (!dateString) return 'Not scheduled';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
        weekday: 'short',
        month: 'short',
        day: 'numeric',
        hour: 'numeric',
        minute: '2-digit',
    });
}

function getStatusColor(status: SessionStatus): string {
    switch (status) {
        case 'pending': return 'bg-yellow-500';
        case 'approved': return 'bg-blue-500';
        case 'in_progress': return 'bg-green-500';
        case 'completed': return 'bg-gray-500';
        case 'cancelled': return 'bg-red-500';
        case 'rejected': return 'bg-red-500';
        default: return 'bg-gray-500';
    }
}

function SessionCard({ session, currentUserId, onAction }: { 
    session: Session; 
    currentUserId: number;
    onAction: (action: string, sessionId: number) => void;
}) {
    const isTeacher = session.teacher_id === currentUserId;
    const isStudent = session.student_id === currentUserId;
    const otherParty = isTeacher ? session.student : session.teacher;

    return (
        <Card>
            <CardHeader>
                <div className="flex justify-between items-start">
                    <div>
                        <CardTitle className="text-lg">{session.title}</CardTitle>
                        <CardDescription>
                            {isTeacher ? 'Teaching' : 'Learning'} • {session.user_skill?.skill?.name || 'Unknown Skill'}
                        </CardDescription>
                    </div>
                    <Badge className={`${getStatusColor(session.status)} text-white capitalize`}>
                        {session.status.replace('_', ' ')}
                    </Badge>
                </div>
            </CardHeader>
            <CardContent className="space-y-3">
                <div className="flex items-center gap-2 text-sm">
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2" />
                        <circle cx="12" cy="7" r="4" />
                    </svg>
                    <span>
                        {isTeacher ? 'Student: ' : 'Teacher: '}
                        <strong>{otherParty?.full_name || 'Unknown'}</strong>
                    </span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <rect width="18" height="18" x="3" y="4" rx="2" ry="2" />
                        <line x1="16" x2="16" y1="2" y2="6" />
                        <line x1="8" x2="8" y1="2" y2="6" />
                        <line x1="3" x2="21" y1="10" y2="10" />
                    </svg>
                    <span>{formatDate(session.scheduled_at)}</span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <circle cx="12" cy="12" r="10" />
                        <polyline points="12 6 12 12 16 14" />
                    </svg>
                    <span>{session.duration} hour{session.duration !== 1 ? 's' : ''} • {session.credit_amount} credits</span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                    <Badge variant="outline" className="capitalize">{session.mode}</Badge>
                    {session.meeting_link && (
                        <a href={session.meeting_link} target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">
                            Join Meeting
                        </a>
                    )}
                </div>
            </CardContent>
            <CardFooter className="flex flex-wrap gap-2">
                {/* Pending - Teacher can approve/reject */}
                {session.status === 'pending' && isTeacher && (
                    <>
                        <Button size="sm" onClick={() => onAction('approve', session.id)}>
                            Approve
                        </Button>
                        <Button size="sm" variant="destructive" onClick={() => onAction('reject', session.id)}>
                            Reject
                        </Button>
                    </>
                )}

                {/* Pending - Student can cancel */}
                {session.status === 'pending' && isStudent && (
                    <Button size="sm" variant="outline" onClick={() => onAction('cancel', session.id)}>
                        Cancel Request
                    </Button>
                )}

                {/* Approved - Both can start or cancel */}
                {session.status === 'approved' && (
                    <>
                        <Button size="sm" onClick={() => onAction('start', session.id)}>
                            Start Session
                        </Button>
                        <Button size="sm" variant="outline" onClick={() => onAction('cancel', session.id)}>
                            Cancel
                        </Button>
                    </>
                )}

                {/* In Progress - Both can confirm completion */}
                {session.status === 'in_progress' && (
                    <>
                        <Button size="sm" onClick={() => onAction('complete', session.id)}>
                            {(isTeacher && session.teacher_confirmed) || (isStudent && session.student_confirmed)
                                ? 'Waiting for other party...'
                                : 'Confirm Completion'}
                        </Button>
                        {((isTeacher && session.teacher_confirmed) || (isStudent && session.student_confirmed)) && (
                            <Badge variant="outline">You confirmed</Badge>
                        )}
                    </>
                )}

                {/* View details for all */}
                <Link href={`/dashboard/sessions/${session.id}`}>
                    <Button size="sm" variant="ghost">View Details</Button>
                </Link>
            </CardFooter>
        </Card>
    );
}

function SessionsContent() {
    const { user } = useAuthStore();
    const { 
        sessions, 
        pendingRequests,
        upcomingSessions,
        total, 
        isLoading, 
        fetchSessions, 
        fetchPendingRequests,
        fetchUpcomingSessions,
        approveSession,
        rejectSession,
        startSession,
        confirmCompletion,
        cancelSession,
    } = useSessionStore();

    const [activeTab, setActiveTab] = useState('all');

    useEffect(() => {
        fetchSessions({ limit: 20 });
        fetchPendingRequests();
        fetchUpcomingSessions(5);
    }, [fetchSessions, fetchPendingRequests, fetchUpcomingSessions]);

    const handleAction = async (action: string, sessionId: number) => {
        try {
            switch (action) {
                case 'approve':
                    await approveSession(sessionId);
                    toast.success('Session approved! Credits have been held.');
                    break;
                case 'reject':
                    const rejectReason = prompt('Please provide a reason for rejection:');
                    if (rejectReason && rejectReason.length >= 10) {
                        await rejectSession(sessionId, { reason: rejectReason });
                        toast.success('Session rejected.');
                    } else if (rejectReason) {
                        toast.error('Reason must be at least 10 characters.');
                    }
                    break;
                case 'start':
                    await startSession(sessionId);
                    toast.success('Session started!');
                    break;
                case 'complete':
                    await confirmCompletion(sessionId);
                    toast.success('Completion confirmed!');
                    break;
                case 'cancel':
                    const cancelReason = prompt('Please provide a reason for cancellation:');
                    if (cancelReason && cancelReason.length >= 10) {
                        await cancelSession(sessionId, { reason: cancelReason });
                        toast.success('Session cancelled. Credits refunded.');
                    } else if (cancelReason) {
                        toast.error('Reason must be at least 10 characters.');
                    }
                    break;
            }
            // Refresh data
            fetchSessions({ limit: 20 });
            fetchPendingRequests();
            fetchUpcomingSessions(5);
        } catch (err: any) {
            toast.error(err.message || 'Action failed');
        }
    };

    const filterSessions = (status?: string) => {
        if (!status || status === 'all') return sessions;
        return sessions.filter(s => s.status === status);
    };

    return (
        <div className="min-h-screen bg-background">
            <Header />

            <main className="container py-8">
                <div className="flex flex-col space-y-8">
                    {/* Page Header */}
                    <div className="flex justify-between items-center">
                        <div>
                            <h1 className="text-3xl font-bold">My Sessions</h1>
                            <p className="text-muted-foreground">Manage your teaching and learning sessions</p>
                        </div>
                        <Link href="/marketplace">
                            <Button>Find New Skills</Button>
                        </Link>
                    </div>

                    {/* Pending Requests Alert */}
                    {pendingRequests.length > 0 && (
                        <Card className="border-yellow-500 bg-yellow-50 dark:bg-yellow-950">
                            <CardHeader className="pb-2">
                                <CardTitle className="text-lg flex items-center gap-2">
                                    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-yellow-600">
                                        <path d="M6 8a6 6 0 0 1 12 0c0 7 3 9 3 9H3s3-2 3-9" />
                                        <path d="M10.3 21a1.94 1.94 0 0 0 3.4 0" />
                                    </svg>
                                    {pendingRequests.length} Pending Request{pendingRequests.length > 1 ? 's' : ''}
                                </CardTitle>
                            </CardHeader>
                            <CardContent>
                                <p className="text-sm text-muted-foreground mb-4">
                                    Students are waiting for your approval
                                </p>
                                <div className="space-y-2">
                                    {pendingRequests.slice(0, 3).map((session) => (
                                        <div key={session.id} className="flex justify-between items-center p-2 bg-background rounded">
                                            <div>
                                                <p className="font-medium">{session.title}</p>
                                                <p className="text-sm text-muted-foreground">
                                                    from {session.student?.full_name || 'Unknown'}
                                                </p>
                                            </div>
                                            <div className="flex gap-2">
                                                <Button size="sm" onClick={() => handleAction('approve', session.id)}>
                                                    Approve
                                                </Button>
                                                <Button size="sm" variant="outline" onClick={() => handleAction('reject', session.id)}>
                                                    Reject
                                                </Button>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </CardContent>
                        </Card>
                    )}

                    {/* Sessions Tabs */}
                    <Tabs value={activeTab} onValueChange={setActiveTab}>
                        <TabsList>
                            <TabsTrigger value="all">All ({sessions.length})</TabsTrigger>
                            <TabsTrigger value="pending">Pending</TabsTrigger>
                            <TabsTrigger value="approved">Upcoming</TabsTrigger>
                            <TabsTrigger value="in_progress">In Progress</TabsTrigger>
                            <TabsTrigger value="completed">Completed</TabsTrigger>
                        </TabsList>

                        <div className="mt-6">
                            {isLoading ? (
                                <div className="text-center py-12">
                                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
                                    <p className="mt-2 text-muted-foreground">Loading sessions...</p>
                                </div>
                            ) : filterSessions(activeTab === 'all' ? undefined : activeTab).length === 0 ? (
                                <Card>
                                    <CardContent className="py-12 text-center text-muted-foreground">
                                        <svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mx-auto mb-4 opacity-50">
                                            <rect width="18" height="18" x="3" y="4" rx="2" ry="2" />
                                            <line x1="16" x2="16" y1="2" y2="6" />
                                            <line x1="8" x2="8" y1="2" y2="6" />
                                            <line x1="3" x2="21" y1="10" y2="10" />
                                        </svg>
                                        <p className="text-lg font-medium">No sessions found</p>
                                        <p className="text-sm mt-1">
                                            {activeTab === 'all' 
                                                ? 'Book a session from the marketplace to get started!'
                                                : `No ${activeTab.replace('_', ' ')} sessions`}
                                        </p>
                                        <Link href="/marketplace">
                                            <Button className="mt-4">Browse Skills</Button>
                                        </Link>
                                    </CardContent>
                                </Card>
                            ) : (
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    {filterSessions(activeTab === 'all' ? undefined : activeTab).map((session) => (
                                        <SessionCard 
                                            key={session.id} 
                                            session={session} 
                                            currentUserId={user?.id || 0}
                                            onAction={handleAction}
                                        />
                                    ))}
                                </div>
                            )}
                        </div>
                    </Tabs>
                </div>
            </main>
        </div>
    );
}

export default function SessionsPage() {
    return (
        <ProtectedRoute>
            <SessionsContent />
        </ProtectedRoute>
    );
}
