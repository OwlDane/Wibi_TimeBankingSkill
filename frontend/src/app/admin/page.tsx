'use client'

import React, { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Header } from '@/components/layout'
import { ProtectedRoute } from '@/components/auth'
import { analyticsService } from '@/lib/services/analytics.service'
import { toast } from 'sonner'
import { 
    Users, 
    Clock, 
    BookOpen,
    CreditCard,
    TrendingUp,
    TrendingDown,
    Activity,
    BarChart3,
    Search,
    RefreshCw,
    Loader2,
    Star,
    Award,
    CheckCircle,
    XCircle,
    AlertCircle,
    Settings,
    Shield,
    LayoutDashboard
} from 'lucide-react'
import type { PlatformAnalytics, SessionStatistic, CreditStatistic, SkillStatistic } from '@/types'

// Stat Card Component
function StatCard({ 
    title, 
    value, 
    subtitle, 
    icon: Icon, 
    trend, 
    trendValue,
    gradient 
}: { 
    title: string
    value: string | number
    subtitle?: string
    icon: React.ComponentType<{ className?: string }>
    trend?: 'up' | 'down' | 'neutral'
    trendValue?: string
    gradient: string
}) {
    return (
        <Card className={`relative overflow-hidden ${gradient}`}>
            <CardContent className="pt-6">
                <div className="flex items-start justify-between">
                    <div className="space-y-1">
                        <p className="text-sm font-medium text-white/80">{title}</p>
                        <p className="text-3xl font-bold text-white">{value}</p>
                        {subtitle && <p className="text-xs text-white/70">{subtitle}</p>}
                        {trend && trendValue && (
                            <div className={`flex items-center gap-1 text-xs ${
                                trend === 'up' ? 'text-green-200' : 
                                trend === 'down' ? 'text-red-200' : 'text-white/70'
                            }`}>
                                {trend === 'up' ? <TrendingUp className="h-3 w-3" /> : 
                                 trend === 'down' ? <TrendingDown className="h-3 w-3" /> : null}
                                {trendValue}
                            </div>
                        )}
                    </div>
                    <div className="p-3 bg-white/10 rounded-lg">
                        <Icon className="h-6 w-6 text-white" />
                    </div>
                </div>
            </CardContent>
        </Card>
    )
}

// Navigation Sidebar
function AdminSidebar({ activeTab, setActiveTab }: { activeTab: string; setActiveTab: (tab: string) => void }) {
    const navItems = [
        { id: 'overview', label: 'Overview', icon: LayoutDashboard },
        { id: 'sessions', label: 'Sessions', icon: Clock },
        { id: 'credits', label: 'Credits', icon: CreditCard },
        { id: 'skills', label: 'Top Skills', icon: BookOpen },
    ]

    return (
        <nav className="space-y-1">
            {navItems.map((item) => (
                <button
                    key={item.id}
                    onClick={() => setActiveTab(item.id)}
                    className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-colors ${
                        activeTab === item.id
                            ? 'bg-primary text-primary-foreground'
                            : 'text-muted-foreground hover:bg-muted hover:text-foreground'
                    }`}
                >
                    <item.icon className="h-5 w-5" />
                    {item.label}
                </button>
            ))}
        </nav>
    )
}

// Top Skills Table
function TopSkillsTable({ skills }: { skills: SkillStatistic[] }) {
    const [searchTerm, setSearchTerm] = useState('')
    
    const filteredSkills = skills.filter(skill => 
        skill.skill_name.toLowerCase().includes(searchTerm.toLowerCase())
    )

    return (
        <Card>
            <CardHeader>
                <div className="flex items-center justify-between">
                    <div>
                        <CardTitle>Top Skills</CardTitle>
                        <CardDescription>Most popular skills on the platform</CardDescription>
                    </div>
                    <div className="relative w-64">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                        <Input
                            placeholder="Search skills..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="pl-9"
                        />
                    </div>
                </div>
            </CardHeader>
            <CardContent>
                <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead>
                            <tr className="border-b">
                                <th className="text-left py-3 px-4 font-medium text-muted-foreground">Skill</th>
                                <th className="text-center py-3 px-4 font-medium text-muted-foreground">Teachers</th>
                                <th className="text-center py-3 px-4 font-medium text-muted-foreground">Learners</th>
                                <th className="text-center py-3 px-4 font-medium text-muted-foreground">Sessions</th>
                                <th className="text-center py-3 px-4 font-medium text-muted-foreground">Rating</th>
                            </tr>
                        </thead>
                        <tbody>
                            {filteredSkills.length > 0 ? filteredSkills.map((skill, index) => (
                                <tr key={skill.skill_id} className="border-b last:border-0 hover:bg-muted/50">
                                    <td className="py-3 px-4">
                                        <div className="flex items-center gap-3">
                                            <span className="text-sm text-muted-foreground">#{index + 1}</span>
                                            <span className="font-medium">{skill.skill_name}</span>
                                        </div>
                                    </td>
                                    <td className="text-center py-3 px-4">{skill.teacher_count}</td>
                                    <td className="text-center py-3 px-4">{skill.learner_count}</td>
                                    <td className="text-center py-3 px-4">{skill.session_count}</td>
                                    <td className="text-center py-3 px-4">
                                        <div className="flex items-center justify-center gap-1">
                                            <Star className="h-4 w-4 text-yellow-500 fill-yellow-500" />
                                            <span>{skill.average_rating.toFixed(1)}</span>
                                        </div>
                                    </td>
                                </tr>
                            )) : (
                                <tr>
                                    <td colSpan={5} className="text-center py-8 text-muted-foreground">
                                        No skills found
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </CardContent>
        </Card>
    )
}

// Session Statistics Panel
function SessionStatsPanel({ stats }: { stats: SessionStatistic }) {
    return (
        <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <Card>
                    <CardContent className="pt-6">
                        <div className="flex items-center gap-3">
                            <div className="p-2 bg-blue-100 dark:bg-blue-900 rounded-lg">
                                <Activity className="h-5 w-5 text-blue-600" />
                            </div>
                            <div>
                                <p className="text-sm text-muted-foreground">Total Sessions</p>
                                <p className="text-2xl font-bold">{stats.total_sessions}</p>
                            </div>
                        </div>
                    </CardContent>
                </Card>
                
                <Card>
                    <CardContent className="pt-6">
                        <div className="flex items-center gap-3">
                            <div className="p-2 bg-green-100 dark:bg-green-900 rounded-lg">
                                <CheckCircle className="h-5 w-5 text-green-600" />
                            </div>
                            <div>
                                <p className="text-sm text-muted-foreground">Completed</p>
                                <p className="text-2xl font-bold">{stats.completed_sessions}</p>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                <Card>
                    <CardContent className="pt-6">
                        <div className="flex items-center gap-3">
                            <div className="p-2 bg-yellow-100 dark:bg-yellow-900 rounded-lg">
                                <AlertCircle className="h-5 w-5 text-yellow-600" />
                            </div>
                            <div>
                                <p className="text-sm text-muted-foreground">Pending</p>
                                <p className="text-2xl font-bold">{stats.pending_sessions}</p>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                <Card>
                    <CardContent className="pt-6">
                        <div className="flex items-center gap-3">
                            <div className="p-2 bg-red-100 dark:bg-red-900 rounded-lg">
                                <XCircle className="h-5 w-5 text-red-600" />
                            </div>
                            <div>
                                <p className="text-sm text-muted-foreground">Cancelled</p>
                                <p className="text-2xl font-bold">{stats.cancelled_sessions}</p>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </div>

            <Card>
                <CardHeader>
                    <CardTitle>Session Breakdown</CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        <div className="text-center p-4 bg-muted rounded-lg">
                            <p className="text-3xl font-bold">{stats.average_duration.toFixed(1)}</p>
                            <p className="text-sm text-muted-foreground">Avg Duration (hours)</p>
                        </div>
                        <div className="text-center p-4 bg-muted rounded-lg">
                            <div className="flex items-center justify-center gap-1">
                                <Star className="h-5 w-5 text-yellow-500 fill-yellow-500" />
                                <p className="text-3xl font-bold">{stats.average_rating.toFixed(1)}</p>
                            </div>
                            <p className="text-sm text-muted-foreground">Avg Rating</p>
                        </div>
                        <div className="text-center p-4 bg-muted rounded-lg">
                            <p className="text-3xl font-bold">
                                {stats.online_sessions}/{stats.offline_sessions}
                            </p>
                            <p className="text-sm text-muted-foreground">Online/Offline</p>
                        </div>
                    </div>
                </CardContent>
            </Card>
        </div>
    )
}

// Credit Statistics Panel
function CreditStatsPanel({ stats }: { stats: CreditStatistic }) {
    return (
        <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Card className="bg-gradient-to-br from-green-500 to-emerald-600 text-white">
                    <CardContent className="pt-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-green-100 text-sm">Total Earned</p>
                                <p className="text-3xl font-bold">{stats.total_earned}</p>
                                <p className="text-xs text-green-200">Avg: {stats.average_earned.toFixed(1)}</p>
                            </div>
                            <TrendingUp className="h-10 w-10 opacity-80" />
                        </div>
                    </CardContent>
                </Card>

                <Card className="bg-gradient-to-br from-blue-500 to-indigo-600 text-white">
                    <CardContent className="pt-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-blue-100 text-sm">Total Spent</p>
                                <p className="text-3xl font-bold">{stats.total_spent}</p>
                                <p className="text-xs text-blue-200">Avg: {stats.average_spent.toFixed(1)}</p>
                            </div>
                            <TrendingDown className="h-10 w-10 opacity-80" />
                        </div>
                    </CardContent>
                </Card>

                <Card className="bg-gradient-to-br from-orange-500 to-amber-600 text-white">
                    <CardContent className="pt-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-orange-100 text-sm">Currently Held</p>
                                <p className="text-3xl font-bold">{stats.total_held}</p>
                                <p className="text-xs text-orange-200">{stats.transaction_count} transactions</p>
                            </div>
                            <CreditCard className="h-10 w-10 opacity-80" />
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    )
}

function AdminContent() {
    const router = useRouter()
    const [activeTab, setActiveTab] = useState('overview')
    const [isLoading, setIsLoading] = useState(true)
    const [isRefreshing, setIsRefreshing] = useState(false)
    const [platformData, setPlatformData] = useState<PlatformAnalytics | null>(null)
    const [sessionStats, setSessionStats] = useState<SessionStatistic | null>(null)
    const [creditStats, setCreditStats] = useState<CreditStatistic | null>(null)

    const fetchAllData = async (showRefresh = false) => {
        try {
            if (showRefresh) setIsRefreshing(true)
            else setIsLoading(true)

            const [platform, sessions, credits] = await Promise.all([
                analyticsService.getPlatformAnalytics(),
                analyticsService.getSessionStatistics(),
                analyticsService.getCreditStatistics(),
            ])

            setPlatformData(platform)
            setSessionStats(sessions)
            setCreditStats(credits)
        } catch (error) {
            console.error('Failed to load admin data:', error)
            toast.error('Failed to load dashboard data')
        } finally {
            setIsLoading(false)
            setIsRefreshing(false)
        }
    }

    useEffect(() => {
        fetchAllData()
    }, [])

    if (isLoading) {
        return (
            <div className="min-h-screen bg-background flex items-center justify-center">
                <div className="text-center">
                    <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4" />
                    <p className="text-muted-foreground">Loading admin dashboard...</p>
                </div>
            </div>
        )
    }

    return (
        <div className="min-h-screen bg-background">
            <Header />

            <div className="container mx-auto px-4 py-8 max-w-7xl">
                {/* Page Header */}
                <div className="flex items-center justify-between mb-8">
                    <div>
                        <h1 className="text-3xl font-bold flex items-center gap-3">
                            <Shield className="h-8 w-8 text-primary" />
                            Admin Dashboard
                        </h1>
                        <p className="text-muted-foreground mt-1">
                            Platform overview and analytics
                        </p>
                    </div>
                    <Button 
                        variant="outline" 
                        onClick={() => fetchAllData(true)}
                        disabled={isRefreshing}
                    >
                        <RefreshCw className={`h-4 w-4 mr-2 ${isRefreshing ? 'animate-spin' : ''}`} />
                        Refresh
                    </Button>
                </div>

                <div className="flex gap-8">
                    {/* Sidebar */}
                    <aside className="w-56 shrink-0 hidden lg:block">
                        <Card className="sticky top-24">
                            <CardContent className="p-4">
                                <AdminSidebar activeTab={activeTab} setActiveTab={setActiveTab} />
                            </CardContent>
                        </Card>
                    </aside>

                    {/* Main Content */}
                    <main className="flex-1 space-y-6">
                        {/* Mobile Tab Navigation */}
                        <div className="lg:hidden flex gap-2 overflow-x-auto pb-2">
                            {['overview', 'sessions', 'credits', 'skills'].map((tab) => (
                                <Button
                                    key={tab}
                                    variant={activeTab === tab ? 'default' : 'outline'}
                                    size="sm"
                                    onClick={() => setActiveTab(tab)}
                                    className="capitalize"
                                >
                                    {tab}
                                </Button>
                            ))}
                        </div>

                        {/* Overview Tab */}
                        {activeTab === 'overview' && platformData && (
                            <div className="space-y-6">
                                {/* Main Stats */}
                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                                    <StatCard
                                        title="Total Users"
                                        value={platformData.total_users}
                                        subtitle={`${platformData.active_users} active`}
                                        icon={Users}
                                        gradient="bg-gradient-to-br from-blue-500 to-blue-600"
                                    />
                                    <StatCard
                                        title="Total Sessions"
                                        value={platformData.total_sessions}
                                        subtitle={`${platformData.completed_sessions} completed`}
                                        icon={Clock}
                                        gradient="bg-gradient-to-br from-purple-500 to-purple-600"
                                    />
                                    <StatCard
                                        title="Credits in Flow"
                                        value={platformData.total_credits_in_flow}
                                        icon={CreditCard}
                                        gradient="bg-gradient-to-br from-green-500 to-green-600"
                                    />
                                    <StatCard
                                        title="Avg Session Rating"
                                        value={platformData.average_session_rating.toFixed(1)}
                                        subtitle={`${platformData.total_skills} skills available`}
                                        icon={Star}
                                        gradient="bg-gradient-to-br from-orange-500 to-orange-600"
                                    />
                                </div>

                                {/* Top Skills */}
                                {platformData.top_skills && (
                                    <TopSkillsTable skills={platformData.top_skills} />
                                )}
                            </div>
                        )}

                        {/* Sessions Tab */}
                        {activeTab === 'sessions' && sessionStats && (
                            <SessionStatsPanel stats={sessionStats} />
                        )}

                        {/* Credits Tab */}
                        {activeTab === 'credits' && creditStats && (
                            <CreditStatsPanel stats={creditStats} />
                        )}

                        {/* Skills Tab */}
                        {activeTab === 'skills' && platformData?.top_skills && (
                            <TopSkillsTable skills={platformData.top_skills} />
                        )}
                    </main>
                </div>
            </div>
        </div>
    )
}

export default function AdminPage() {
    return (
        <ProtectedRoute>
            <AdminContent />
        </ProtectedRoute>
    )
}
