'use client';

import { useEffect } from 'react';
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Header } from "@/components/layout";
import { ProtectedRoute } from "@/components/auth";
import { useAuthStore } from "@/stores/auth.store";
import { useUserStore } from "@/stores/user.store";
import { useSessionStore } from "@/stores/session.store";
import type { Transaction, Session } from "@/types";

// Format date
function formatDate(dateString: string) {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
        weekday: "short",
        month: "short",
        day: "numeric",
        hour: "numeric",
        minute: "2-digit",
    });
}

// Get transaction type display
function getTransactionTypeColor(type: string): string {
    switch (type) {
        case 'earned':
        case 'initial':
        case 'bonus':
            return 'text-green-500';
        case 'spent':
        case 'hold':
            return 'text-red-500';
        case 'refund':
            return 'text-blue-500';
        default:
            return '';
    }
}

function DashboardContent() {
    const { user } = useAuthStore();
    const { stats, transactions, isLoading, fetchStats, fetchTransactions } = useUserStore();
    const { upcomingSessions, pendingRequests, fetchUpcomingSessions, fetchPendingRequests } = useSessionStore();

    useEffect(() => {
        fetchStats().catch(console.error);
        fetchTransactions(5, 0).catch(console.error);
        fetchUpcomingSessions(3).catch(console.error);
        fetchPendingRequests().catch(console.error);
    }, [fetchStats, fetchTransactions, fetchUpcomingSessions, fetchPendingRequests]);

    const firstName = user?.full_name?.split(' ')[0] || 'User';
    return (
        <div className="min-h-screen bg-background">
            <Header />

            {/* Main Content */}
            <main className="container py-8">
                <div className="flex flex-col space-y-8">
                    {/* Welcome Section */}
                    <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                        <div>
                            <h1 className="text-3xl font-bold">Welcome back, {firstName}!</h1>
                            <p className="text-muted-foreground">Here's what's happening with your Time Banking account</p>
                        </div>
                        <div className="flex gap-2">
                            <Link href="/marketplace">
                                <Button variant="outline">Find Skills</Button>
                            </Link>
                            <Link href="/profile/skills/new">
                                <Button>Add New Skill</Button>
                            </Link>
                        </div>
                    </div>

                    {/* Stats Cards */}
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                        <Card>
                            <CardHeader className="pb-2">
                                <CardTitle className="text-sm font-medium text-muted-foreground">Credit Balance</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="text-3xl font-bold">
                                    {isLoading ? '...' : (user?.credit_balance?.toFixed(1) || '0.0')}
                                </div>
                                <p className="text-xs text-muted-foreground mt-1">Available credits</p>
                            </CardContent>
                        </Card>
                        <Card>
                            <CardHeader className="pb-2">
                                <CardTitle className="text-sm font-medium text-muted-foreground">Sessions as Teacher</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="text-3xl font-bold">
                                    {isLoading ? '...' : (stats?.total_sessions_as_teacher || 0)}
                                </div>
                                <p className="text-xs text-muted-foreground mt-1">
                                    {stats?.total_credits_earned?.toFixed(1) || '0.0'} credits earned
                                </p>
                            </CardContent>
                        </Card>
                        <Card>
                            <CardHeader className="pb-2">
                                <CardTitle className="text-sm font-medium text-muted-foreground">Sessions as Student</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="text-3xl font-bold">
                                    {isLoading ? '...' : (stats?.total_sessions_as_student || 0)}
                                </div>
                                <p className="text-xs text-muted-foreground mt-1">
                                    {stats?.total_credits_spent?.toFixed(1) || '0.0'} credits spent
                                </p>
                            </CardContent>
                        </Card>
                        <Card>
                            <CardHeader className="pb-2">
                                <CardTitle className="text-sm font-medium text-muted-foreground">Average Rating</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="flex items-center">
                                    <div className="text-3xl font-bold">
                                        {isLoading ? '...' : (stats?.average_rating_as_teacher?.toFixed(1) || 'N/A')}
                                    </div>
                                    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-5 w-5 text-yellow-400 ml-1">
                                        <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
                                    </svg>
                                </div>
                                <p className="text-xs text-muted-foreground mt-1">As teacher</p>
                            </CardContent>
                        </Card>
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
                                <p className="text-sm text-muted-foreground">Students are waiting for your approval</p>
                                <Link href="/dashboard/sessions">
                                    <Button size="sm" className="mt-2">Review Requests</Button>
                                </Link>
                            </CardContent>
                        </Card>
                    )}

                    {/* Upcoming Sessions */}
                    <div>
                        <div className="flex justify-between items-center mb-4">
                            <h2 className="text-2xl font-bold">Upcoming Sessions</h2>
                            <Link href="/dashboard/sessions">
                                <Button variant="ghost" size="sm">View All</Button>
                            </Link>
                        </div>
                        {upcomingSessions.length === 0 ? (
                            <Card>
                                <CardContent className="py-12">
                                    <div className="text-center text-muted-foreground">
                                        <svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mx-auto mb-4 opacity-50">
                                            <rect width="18" height="18" x="3" y="4" rx="2" ry="2" />
                                            <line x1="16" x2="16" y1="2" y2="6" />
                                            <line x1="8" x2="8" y1="2" y2="6" />
                                            <line x1="3" x2="21" y1="10" y2="10" />
                                        </svg>
                                        <p className="text-lg font-medium">No upcoming sessions</p>
                                        <p className="text-sm mt-1">Book a session from the marketplace to get started!</p>
                                        <Link href="/marketplace">
                                            <Button className="mt-4">Browse Skills</Button>
                                        </Link>
                                    </div>
                                </CardContent>
                            </Card>
                        ) : (
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                {upcomingSessions.map((session: Session) => (
                                    <Card key={session.id}>
                                        <CardHeader>
                                            <div className="flex justify-between items-start">
                                                <CardTitle className="text-lg">{session.title}</CardTitle>
                                                <Badge>{session.status}</Badge>
                                            </div>
                                            <CardDescription>
                                                {session.scheduled_at ? formatDate(session.scheduled_at) : 'Not scheduled'}
                                            </CardDescription>
                                        </CardHeader>
                                        <CardContent>
                                            <div className="space-y-2 text-sm">
                                                <div className="flex items-center">
                                                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mr-2">
                                                        <circle cx="12" cy="12" r="10" />
                                                        <polyline points="12 6 12 12 16 14" />
                                                    </svg>
                                                    <span>{session.duration} hour{session.duration !== 1 ? 's' : ''}</span>
                                                </div>
                                                <div className="flex items-center">
                                                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mr-2">
                                                        <path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2" />
                                                        <circle cx="12" cy="7" r="4" />
                                                    </svg>
                                                    <span>
                                                        {session.teacher_id === user?.id 
                                                            ? `Teaching ${session.student?.full_name || 'Student'}`
                                                            : `Learning from ${session.teacher?.full_name || 'Teacher'}`}
                                                    </span>
                                                </div>
                                            </div>
                                        </CardContent>
                                        <CardFooter>
                                            <Link href={`/dashboard/sessions`} className="w-full">
                                                <Button variant="outline" size="sm" className="w-full">View Details</Button>
                                            </Link>
                                        </CardFooter>
                                    </Card>
                                ))}
                            </div>
                        )}
                    </div>

                    {/* Transaction History */}
                    <div>
                        <div className="flex justify-between items-center mb-4">
                            <h2 className="text-2xl font-bold">Transaction History</h2>
                            <Link href="/dashboard/transactions">
                                <Button variant="ghost" size="sm">View All</Button>
                            </Link>
                        </div>
                        <Card>
                            <CardContent className="p-0">
                                {isLoading ? (
                                    <div className="p-8 text-center">
                                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
                                        <p className="mt-2 text-muted-foreground">Loading transactions...</p>
                                    </div>
                                ) : transactions.length === 0 ? (
                                    <div className="p-8 text-center text-muted-foreground">
                                        <p>No transactions yet</p>
                                    </div>
                                ) : (
                                    <div className="overflow-x-auto">
                                        <table className="w-full">
                                            <thead>
                                                <tr className="border-b">
                                                    <th className="text-left p-4">Date</th>
                                                    <th className="text-left p-4">Description</th>
                                                    <th className="text-right p-4">Amount</th>
                                                    <th className="text-right p-4">Balance</th>
                                                </tr>
                                            </thead>
                                            <tbody>
                                                {transactions.map((transaction: Transaction) => (
                                                    <tr key={transaction.id} className="border-b last:border-0 hover:bg-muted/50">
                                                        <td className="p-4">{formatDate(transaction.created_at)}</td>
                                                        <td className="p-4">{transaction.description}</td>
                                                        <td className={`p-4 text-right ${getTransactionTypeColor(transaction.type)}`}>
                                                            {transaction.amount > 0 ? `+${transaction.amount.toFixed(1)}` : transaction.amount.toFixed(1)}
                                                        </td>
                                                        <td className="p-4 text-right font-medium">{transaction.balance_after.toFixed(1)}</td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>
                                    </div>
                                )}
                            </CardContent>
                        </Card>
                    </div>

                    {/* Badges */}
                    <div>
                        <div className="flex justify-between items-center mb-4">
                            <h2 className="text-2xl font-bold">Your Badges</h2>
                            <Link href="/dashboard/badges">
                                <Button variant="ghost" size="sm">View All</Button>
                            </Link>
                        </div>
                        <div className="flex flex-wrap gap-4">
                            <div className="flex flex-col items-center">
                                <div className="h-16 w-16 rounded-full bg-primary/10 flex items-center justify-center text-primary">
                                    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-8 w-8">
                                        <path d="M6 10c0-4.4 3.6-8 8-8s8 3.6 8 8-3.6 8-8 8h-8" />
                                        <polyline points="15 14 18 10 21 14" />
                                        <path d="M6 14H3" />
                                        <path d="M6 18H3" />
                                        <path d="M6 22H3" />
                                    </svg>
                                </div>
                                <span className="text-sm font-medium mt-2">Early Bird</span>
                            </div>
                            <div className="flex flex-col items-center">
                                <div className="h-16 w-16 rounded-full bg-primary/10 flex items-center justify-center text-primary">
                                    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-8 w-8">
                                        <path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z" />
                                        <polyline points="14 2 14 8 20 8" />
                                        <path d="M16 13H8" />
                                        <path d="M16 17H8" />
                                        <path d="M10 9H8" />
                                    </svg>
                                </div>
                                <span className="text-sm font-medium mt-2">Quick Learner</span>
                            </div>
                            <div className="flex flex-col items-center opacity-40">
                                <div className="h-16 w-16 rounded-full bg-primary/10 flex items-center justify-center text-primary">
                                    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-8 w-8">
                                        <path d="M12 20h9" />
                                        <path d="M16.5 3.5a2.12 2.12 0 0 1 3 3L7 19l-4 1 1-4Z" />
                                        <path d="m15 5 3 3" />
                                    </svg>
                                </div>
                                <span className="text-sm font-medium mt-2">Top Tutor</span>
                                <span className="text-xs text-muted-foreground">In progress</span>
                            </div>
                        </div>
                    </div>
                </div>
            </main>
        </div>
    );
}

export default function DashboardPage() {
    return (
        <ProtectedRoute>
            <DashboardContent />
        </ProtectedRoute>
    );
}
