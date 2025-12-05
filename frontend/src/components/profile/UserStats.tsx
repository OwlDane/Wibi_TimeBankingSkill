'use client'

import React, { useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import {
    TrendingUp,
    Coins,
    Clock,
    Star,
    Users,
    BookOpen,
    Award,
    Target,
    Zap
} from 'lucide-react'
import { useUserStore } from '@/stores'

export default function UserStats() {
    const { stats, isLoading, error, fetchStats } = useUserStore()

    useEffect(() => {
        fetchStats()
    }, [fetchStats])

    if (isLoading) {
        return (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {Array.from({ length: 8 }).map((_, index) => (
                    <Card key={index} className="animate-pulse">
                        <CardHeader className="pb-2">
                            <div className="h-4 bg-muted rounded w-3/4"></div>
                        </CardHeader>
                        <CardContent>
                            <div className="h-8 bg-muted rounded mb-2"></div>
                            <div className="h-3 bg-muted rounded w-1/2"></div>
                        </CardContent>
                    </Card>
                ))}
            </div>
        )
    }

    if (error || !stats) {
        return (
            <Card>
                <CardContent className="text-center py-8">
                    <p className="text-muted-foreground">
                        {error || 'Failed to load user statistics'}
                    </p>
                </CardContent>
            </Card>
        )
    }

    const StatCard = ({ 
        title, 
        value, 
        subtitle, 
        icon: Icon, 
        trend, 
        color = "default",
        progress 
    }: {
        title: string
        value: string | number
        subtitle?: string
        icon: React.ComponentType<{ className?: string }>
        trend?: { value: number; isPositive: boolean }
        color?: "default" | "success" | "warning" | "danger"
        progress?: number
    }) => {
        const iconColorClass = 
            color === 'success' ? 'text-green-600' :
            color === 'warning' ? 'text-yellow-600' :
            color === 'danger' ? 'text-red-600' :
            'text-muted-foreground'

        return (
        <Card className={`${color === 'success' ? 'border-green-200' : 
                        color === 'warning' ? 'border-yellow-200' : 
                        color === 'danger' ? 'border-red-200' : ''}`}>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                    {title}
                </CardTitle>
                <Icon className={`h-4 w-4 ${iconColorClass}`} />
            </CardHeader>
            <CardContent>
                <div className="text-2xl font-bold">{value}</div>
                {subtitle && (
                    <p className="text-xs text-muted-foreground mt-1">
                        {subtitle}
                    </p>
                )}
                {trend && (
                    <div className={`flex items-center text-xs mt-2 ${
                        trend.isPositive ? 'text-green-600' : 'text-red-600'
                    }`}>
                        <TrendingUp className={`h-3 w-3 mr-1 ${
                            !trend.isPositive ? 'rotate-180' : ''
                        }`} />
                        {Math.abs(trend.value)}% from last month
                    </div>
                )}
                {typeof progress === 'number' && (
                    <div className="mt-2">
                        <div className="w-full bg-muted rounded-full h-1">
                            <div 
                                className="bg-primary h-1 rounded-full transition-all" 
                                style={{ width: `${Math.min(100, Math.max(0, progress))}%` }}
                            />
                        </div>
                    </div>
                )}
            </CardContent>
        </Card>
        )
    }

    // Calculate some derived stats
    const totalSessions = stats.total_sessions_as_teacher + stats.total_sessions_as_student
    const totalHours = stats.total_teaching_hours + stats.total_learning_hours
    const netCredits = stats.total_credits_earned - stats.total_credits_spent
    const teachingRatio = totalSessions > 0 ? 
        (stats.total_sessions_as_teacher / totalSessions) * 100 : 0

    return (
        <div className="space-y-6">
            {/* Credit Overview */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <StatCard
                    title="Current Balance"
                    value={stats.credit_balance}
                    subtitle="Available credits"
                    icon={Coins}
                    color={stats.credit_balance < 1 ? 'danger' : 'success'}
                />

                <StatCard
                    title="Credits Earned"
                    value={stats.total_credits_earned}
                    subtitle="Total lifetime earnings"
                    icon={TrendingUp}
                    color="success"
                />

                <StatCard
                    title="Credits Spent"
                    value={stats.total_credits_spent}
                    subtitle="Total invested in learning"
                    icon={Zap}
                    color="warning"
                />

                <StatCard
                    title="Net Credits"
                    value={netCredits > 0 ? `+${netCredits}` : netCredits}
                    subtitle="Earned - Spent"
                    icon={Target}
                    color={netCredits > 0 ? 'success' : netCredits < 0 ? 'danger' : 'default'}
                />
            </div>

            {/* Learning & Teaching Stats */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <StatCard
                    title="Teaching Sessions"
                    value={stats.total_sessions_as_teacher}
                    subtitle="Sessions completed as teacher"
                    icon={Users}
                    progress={teachingRatio}
                />

                <StatCard
                    title="Learning Sessions"
                    value={stats.total_sessions_as_student}
                    subtitle="Sessions completed as student"
                    icon={BookOpen}
                    progress={100 - teachingRatio}
                />

                <StatCard
                    title="Teaching Hours"
                    value={`${stats.total_teaching_hours}h`}
                    subtitle="Hours spent teaching"
                    icon={Clock}
                    color="success"
                />

                <StatCard
                    title="Learning Hours"
                    value={`${stats.total_learning_hours}h`}
                    subtitle="Hours spent learning"
                    icon={Clock}
                    color="warning"
                />
            </div>

            {/* Ratings & Performance */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                <StatCard
                    title="Teaching Rating"
                    value={stats.average_rating_as_teacher > 0 ? 
                        `${stats.average_rating_as_teacher.toFixed(1)}/5.0` : 'N/A'}
                    subtitle={stats.total_sessions_as_teacher > 0 ? 
                        `Based on ${stats.total_sessions_as_teacher} sessions` : 'No sessions yet'}
                    icon={Star}
                    color={stats.average_rating_as_teacher >= 4.5 ? 'success' : 
                           stats.average_rating_as_teacher >= 3.5 ? 'warning' : 'danger'}
                    progress={stats.average_rating_as_teacher * 20}
                />

                <StatCard
                    title="Learning Rating"
                    value={stats.average_rating_as_student > 0 ? 
                        `${stats.average_rating_as_student.toFixed(1)}/5.0` : 'N/A'}
                    subtitle={stats.total_sessions_as_student > 0 ? 
                        `Based on ${stats.total_sessions_as_student} sessions` : 'No sessions yet'}
                    icon={Award}
                    color={stats.average_rating_as_student >= 4.5 ? 'success' : 
                           stats.average_rating_as_student >= 3.5 ? 'warning' : 'danger'}
                    progress={stats.average_rating_as_student * 20}
                />

                <StatCard
                    title="Total Hours"
                    value={`${totalHours}h`}
                    subtitle="Combined teaching + learning"
                    icon={Clock}
                />
            </div>

            {/* Achievements & Milestones */}
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <Award className="h-5 w-5" />
                        Achievements & Milestones
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {/* First Session */}
                        <div className="flex items-center gap-3 p-3 border rounded-lg">
                            <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
                                <BookOpen className="h-5 w-5 text-green-600" />
                            </div>
                            <div>
                                <p className="font-medium text-sm">First Session</p>
                                <p className="text-xs text-muted-foreground">
                                    {totalSessions > 0 ? 'Completed ✓' : 'Pending...'}
                                </p>
                            </div>
                        </div>

                        {/* 10 Sessions */}
                        <div className="flex items-center gap-3 p-3 border rounded-lg">
                            <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                                <Users className="h-5 w-5 text-blue-600" />
                            </div>
                            <div>
                                <p className="font-medium text-sm">Session Veteran</p>
                                <p className="text-xs text-muted-foreground">
                                    {totalSessions >= 10 ? 'Completed ✓' : `${totalSessions}/10 sessions`}
                                </p>
                            </div>
                        </div>

                        {/* High Rating */}
                        <div className="flex items-center gap-3 p-3 border rounded-lg">
                            <div className="w-10 h-10 bg-yellow-100 rounded-full flex items-center justify-center">
                                <Star className="h-5 w-5 text-yellow-600" />
                            </div>
                            <div>
                                <p className="font-medium text-sm">Top Rated</p>
                                <p className="text-xs text-muted-foreground">
                                    {Math.max(stats.average_rating_as_teacher, stats.average_rating_as_student) >= 4.5 
                                        ? 'Completed ✓' : 'Get 4.5+ rating'}
                                </p>
                            </div>
                        </div>

                        {/* Credit Milestone */}
                        <div className="flex items-center gap-3 p-3 border rounded-lg">
                            <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
                                <Coins className="h-5 w-5 text-green-600" />
                            </div>
                            <div>
                                <p className="font-medium text-sm">Credit Collector</p>
                                <p className="text-xs text-muted-foreground">
                                    {stats.total_credits_earned >= 50 ? 'Completed ✓' : 
                                        `${stats.total_credits_earned}/50 credits`}
                                </p>
                            </div>
                        </div>

                        {/* Teaching Hours */}
                        <div className="flex items-center gap-3 p-3 border rounded-lg">
                            <div className="w-10 h-10 bg-purple-100 rounded-full flex items-center justify-center">
                                <Clock className="h-5 w-5 text-purple-600" />
                            </div>
                            <div>
                                <p className="font-medium text-sm">Time Master</p>
                                <p className="text-xs text-muted-foreground">
                                    {totalHours >= 100 ? 'Completed ✓' : `${totalHours}/100 hours`}
                                </p>
                            </div>
                        </div>

                        {/* Balanced Learner */}
                        <div className="flex items-center gap-3 p-3 border rounded-lg">
                            <div className="w-10 h-10 bg-orange-100 rounded-full flex items-center justify-center">
                                <Target className="h-5 w-5 text-orange-600" />
                            </div>
                            <div>
                                <p className="font-medium text-sm">Balanced Learner</p>
                                <p className="text-xs text-muted-foreground">
                                    {stats.total_sessions_as_teacher > 0 && stats.total_sessions_as_student > 0 
                                        ? 'Completed ✓' : 'Teach & learn skills'}
                                </p>
                            </div>
                        </div>
                    </div>
                </CardContent>
            </Card>
        </div>
    )
}
