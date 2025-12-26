'use client';

import { useEffect, useState } from 'react';
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Header } from "@/components/layout";
import { ProtectedRoute } from "@/components/auth";
import { useAuthStore } from "@/stores/auth.store";
import { useUserStore } from "@/stores/user.store";
import { useSessionStore } from "@/stores/session.store";
import { useBadgeStore } from "@/stores/badge.store";
import { useSkillStore } from "@/stores/skill.store";
import SessionApprovalModal from "@/components/session/SessionApprovalModal";
import TransactionDetailModal from "@/components/transaction/TransactionDetailModal";
import { LoadingSpinner, LoadingSkeleton } from "@/components/ui/loading";
import { ErrorState } from "@/components/ui/error-state";
import { EmptyState } from "@/components/ui/empty-state";
import { Calendar, Award, Receipt } from "lucide-react";
import type { Transaction, Session, Skill } from "@/types";

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
    const { userBadges, fetchUserBadges } = useBadgeStore();
    const { skills, fetchSkills } = useSkillStore();
    const [selectedSession, setSelectedSession] = useState<Session | null>(null);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedTransaction, setSelectedTransaction] = useState<Transaction | null>(null);
    const [isTransactionModalOpen, setIsTransactionModalOpen] = useState(false);

    useEffect(() => {
        fetchStats().catch(console.error);
        fetchTransactions(5, 0).catch(console.error);
        fetchUpcomingSessions(3).catch(console.error);
        fetchPendingRequests().catch(console.error);
        fetchUserBadges().catch(console.error);
        fetchSkills({ limit: 4 }).catch(console.error);
    }, [fetchStats, fetchTransactions, fetchUpcomingSessions, fetchPendingRequests, fetchUserBadges, fetchSkills]);

    const handleOpenApprovalModal = (session: Session) => {
        setSelectedSession(session);
        setIsModalOpen(true);
    };

    const handleCloseModal = () => {
        setIsModalOpen(false);
        setSelectedSession(null);
        // Refresh pending requests
        fetchPendingRequests().catch(console.error);
    };

    const firstName = user?.full_name?.split(' ')[0] || 'User';
    return (
        <div className="min-h-screen bg-background">
            <Header />

            {/* Main Content */}
            <main className="container mx-auto px-4 py-8 max-w-7xl">
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
                                    {isLoading ? (
                                        <LoadingSkeleton className="h-9 w-20" />
                                    ) : (
                                        user?.credit_balance?.toFixed(1) || '0.0'
                                    )}
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
                                    {isLoading ? (
                                        <LoadingSkeleton className="h-9 w-16" />
                                    ) : (
                                        stats?.total_sessions_as_teacher || 0
                                    )}
                                </div>
                                <p className="text-xs text-muted-foreground mt-1">
                                    {isLoading ? (
                                        <LoadingSkeleton className="h-3 w-24 mt-1" />
                                    ) : (
                                        `${stats?.total_credits_earned?.toFixed(1) || '0.0'} credits earned`
                                    )}
                                </p>
                            </CardContent>
                        </Card>
                        <Card>
                            <CardHeader className="pb-2">
                                <CardTitle className="text-sm font-medium text-muted-foreground">Sessions as Student</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="text-3xl font-bold">
                                    {isLoading ? (
                                        <LoadingSkeleton className="h-9 w-16" />
                                    ) : (
                                        stats?.total_sessions_as_student || 0
                                    )}
                                </div>
                                <p className="text-xs text-muted-foreground mt-1">
                                    {isLoading ? (
                                        <LoadingSkeleton className="h-3 w-24 mt-1" />
                                    ) : (
                                        `${stats?.total_credits_spent?.toFixed(1) || '0.0'} credits spent`
                                    )}
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
                                        {isLoading ? (
                                            <LoadingSkeleton className="h-9 w-12" />
                                        ) : (
                                            stats?.average_rating_as_teacher?.toFixed(1) || 'N/A'
                                        )}
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
                            <CardContent className="space-y-3">
                                <p className="text-sm text-muted-foreground">Students are waiting for your approval</p>
                                <div className="space-y-2">
                                    {pendingRequests.slice(0, 3).map((session: Session) => (
                                        <div key={session.id} className="flex items-center justify-between p-2 bg-white dark:bg-slate-900 rounded">
                                            <div className="flex-1">
                                                <p className="text-sm font-medium">{session.student?.full_name}</p>
                                                <p className="text-xs text-muted-foreground">{session.title}</p>
                                            </div>
                                            <Button size="sm" variant="outline" onClick={() => handleOpenApprovalModal(session)}>
                                                Review
                                            </Button>
                                        </div>
                                    ))}
                                </div>
                                {pendingRequests.length > 3 && (
                                    <Link href="/dashboard/sessions">
                                        <Button size="sm" variant="ghost" className="w-full">
                                            View All ({pendingRequests.length})
                                        </Button>
                                    </Link>
                                )}
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
                            <EmptyState
                                icon={Calendar}
                                title="No upcoming sessions"
                                description="Book a session from the marketplace to get started!"
                                action={{
                                    label: 'Browse Skills',
                                    onClick: () => window.location.href = '/marketplace',
                                }}
                                variant="card"
                            />
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

                    {/* Recommended Skills */}
                    <div>
                        <div className="flex justify-between items-center mb-4">
                            <h2 className="text-2xl font-bold">Recommended for You</h2>
                            <Link href="/marketplace">
                                <Button variant="ghost" size="sm">View All</Button>
                            </Link>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                            {skills.slice(0, 4).map((skill: Skill) => (
                                    <Card key={skill.id} className="overflow-hidden hover:shadow-lg hover:-translate-y-1 transition-all duration-200">
                                    <div className="h-32 bg-muted flex items-center justify-center text-4xl">
                                        {skill.icon || '📚'}
                                    </div>
                                    <CardHeader className="p-4 pb-2">
                                        <div className="flex justify-between items-start">
                                            <CardTitle className="text-base line-clamp-1">{skill.name}</CardTitle>
                                            <Badge variant="secondary" className="text-xs">{skill.category}</Badge>
                                        </div>
                                    </CardHeader>
                                    <CardContent className="p-4 pt-0">
                                        <p className="text-sm text-muted-foreground line-clamp-2 mb-3">
                                            {skill.description || 'No description available'}
                                        </p>
                                        <div className="flex items-center justify-between text-xs text-muted-foreground">
                                            <span>{skill.total_teachers || 0} Tutors</span>
                                            <span>{skill.total_learners || 0} Learners</span>
                                        </div>
                                    </CardContent>
                                    <CardFooter className="p-4 pt-0">
                                        <Link href={`/marketplace/${skill.id}`} className="w-full">
                                            <Button variant="outline" size="sm" className="w-full">View Details</Button>
                                        </Link>
                                    </CardFooter>
                                </Card>
                            ))}
                        </div>
                    </div>
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
                                        <LoadingSpinner size="lg" />
                                        <p className="mt-2 text-muted-foreground">Loading transactions...</p>
                                    </div>
                                ) : transactions.length === 0 ? (
                                    <EmptyState
                                        icon={Receipt}
                                        title="No transactions yet"
                                        description="Your transaction history will appear here."
                                        variant="compact"
                                    />
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
                                                    <tr 
                                                        key={transaction.id} 
                                                        className="border-b last:border-0 hover:bg-muted/50 cursor-pointer transition-colors duration-150"
                                                        onClick={() => {
                                                            setSelectedTransaction(transaction);
                                                            setIsTransactionModalOpen(true);
                                                        }}
                                                    >
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
                            <Link href="/badges">
                                <Button variant="ghost" size="sm">View All</Button>
                            </Link>
                        </div>
                        {userBadges.length === 0 ? (
                            <EmptyState
                                icon={Award}
                                title="No badges yet"
                                description="Complete sessions and achievements to earn badges!"
                                variant="card"
                            />
                        ) : (
                            <div className="flex flex-wrap gap-4">
                                {userBadges.slice(0, 6).map((userBadge: any) => (
                                    <div key={userBadge.id} className="flex flex-col items-center">
                                        <div 
                                            className={`h-16 w-16 rounded-full flex items-center justify-center text-2xl ${userBadge.is_pinned ? 'ring-2 ring-yellow-400' : ''}`}
                                            style={{ backgroundColor: userBadge.badge?.color || '#e5e7eb' }}
                                        >
                                            {userBadge.badge?.icon || '🏆'}
                                        </div>
                                        <span className="text-sm font-medium mt-2 text-center">{userBadge.badge?.name}</span>
                                        <Badge className="mt-1 text-xs">{userBadge.badge?.type}</Badge>
                                    </div>
                                ))}
                                {userBadges.length > 6 && (
                                    <div className="flex flex-col items-center justify-center">
                                        <div className="h-16 w-16 rounded-full bg-muted flex items-center justify-center">
                                            <span className="text-sm font-medium">+{userBadges.length - 6}</span>
                                        </div>
                                        <span className="text-xs text-muted-foreground mt-2">More badges</span>
                                    </div>
                                )}
                            </div>
                        )}
                    </div>
                </div>
            </main>

            {/* Session Approval Modal */}
            <SessionApprovalModal
                session={selectedSession}
                isOpen={isModalOpen}
                onClose={handleCloseModal}
                onApproved={handleCloseModal}
            />

            {/* Transaction Detail Modal */}
            <TransactionDetailModal
                transaction={selectedTransaction}
                isOpen={isTransactionModalOpen}
                onClose={() => setIsTransactionModalOpen(false)}
            />
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
