'use client'

import React, { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { AdminProtectedRoute } from '@/components/auth/AdminProtectedRoute'
import { useAdminStore } from '@/stores/admin.store'
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
    Search,
    RefreshCw,
    Loader2,
    Star,
    Shield,
    LayoutDashboard,
    FileText,
    Settings,
    LogOut,
    Lock,
    CheckSquare,
    Trash2,
    Edit,
    MoreHorizontal,
    Menu
} from 'lucide-react'
import type { PlatformAnalytics, SessionStatistic, CreditStatistic, SkillStatistic } from '@/types'

// --- Components ---

// 1. Security Overlay
function AdminSecurityCheck({ onVerified }: { onVerified: () => void }) {
    const [pin, setPin] = useState('')
    const [isLoading, setIsLoading] = useState(false)

    const handleVerify = (e: React.FormEvent) => {
        e.preventDefault()
        setIsLoading(true)
        // Simulate verification delay
        setTimeout(() => {
            if (pin === '123456') { // Mock PIN
                onVerified()
                toast.success('Admin access granted')
            } else {
                toast.error('Invalid Admin PIN')
            }
            setIsLoading(false)
        }, 1000)
    }

    return (
        <div className="fixed inset-0 bg-background/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <Card className="w-full max-w-md shadow-2xl border-primary/20">
                <CardHeader className="text-center space-y-2">
                    <div className="mx-auto bg-primary/10 p-4 rounded-full w-fit">
                        <Lock className="h-8 w-8 text-primary" />
                    </div>
                    <CardTitle className="text-2xl">Admin Access Required</CardTitle>
                    <CardDescription>
                        This area is restricted to administrators only.
                        <br />Please enter your security PIN.
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <form onSubmit={handleVerify} className="space-y-4">
                        <div className="space-y-2">
                            <Input
                                type="password"
                                placeholder="Enter 6-digit PIN (Try 123456)"
                                value={pin}
                                onChange={(e) => setPin(e.target.value)}
                                maxLength={6}
                                className="text-center text-2xl tracking-widest"
                                autoFocus
                            />
                        </div>
                        <Button type="submit" className="w-full" disabled={isLoading || pin.length < 6}>
                            {isLoading ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <Shield className="h-4 w-4 mr-2" />}
                            Verify Identity
                        </Button>
                    </form>
                </CardContent>
            </Card>
        </div>
    )
}

// 2. Stat Card
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
        <Card className={`relative overflow-hidden ${gradient} border-0 shadow-lg`}>
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
                    <div className="p-3 bg-white/10 rounded-lg backdrop-blur-sm">
                        <Icon className="h-6 w-6 text-white" />
                    </div>
                </div>
            </CardContent>
        </Card>
    )
}

// 3. User Management (Mock)
function UserManagement() {
    const [selectedUsers, setSelectedUsers] = useState<number[]>([])
    const [searchTerm, setSearchTerm] = useState('')

    // Mock users
    const users = [
        { id: 1, name: 'Alice Johnson', email: 'alice@example.com', role: 'Student', status: 'Active', joined: '2023-01-15' },
        { id: 2, name: 'Bob Smith', email: 'bob@example.com', role: 'Teacher', status: 'Active', joined: '2023-02-20' },
        { id: 3, name: 'Charlie Brown', email: 'charlie@example.com', role: 'Student', status: 'Inactive', joined: '2023-03-10' },
        { id: 4, name: 'Diana Prince', email: 'diana@example.com', role: 'Teacher', status: 'Active', joined: '2023-04-05' },
        { id: 5, name: 'Evan Wright', email: 'evan@example.com', role: 'Student', status: 'Suspended', joined: '2023-05-12' },
    ]

    const filteredUsers = users.filter(u => 
        u.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
        u.email.toLowerCase().includes(searchTerm.toLowerCase())
    )

    const toggleSelectAll = () => {
        if (selectedUsers.length === filteredUsers.length) {
            setSelectedUsers([])
        } else {
            setSelectedUsers(filteredUsers.map(u => u.id))
        }
    }

    const toggleSelectUser = (id: number) => {
        if (selectedUsers.includes(id)) {
            setSelectedUsers(selectedUsers.filter(uid => uid !== id))
        } else {
            setSelectedUsers([...selectedUsers, id])
        }
    }

    return (
        <div className="space-y-4">
            <div className="flex flex-col sm:flex-row justify-between gap-4">
                <div className="relative w-full sm:w-72">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input 
                        placeholder="Search users..." 
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="pl-9"
                    />
                </div>
                <div className="flex gap-2">
                    {selectedUsers.length > 0 && (
                        <>
                            <Button variant="destructive" size="sm">
                                <Trash2 className="h-4 w-4 mr-2" />
                                Delete ({selectedUsers.length})
                            </Button>
                            <Button variant="outline" size="sm">
                                <Lock className="h-4 w-4 mr-2" />
                                Suspend ({selectedUsers.length})
                            </Button>
                        </>
                    )}
                    <Button>
                        <Users className="h-4 w-4 mr-2" />
                        Add User
                    </Button>
                </div>
            </div>

            <Card>
                <CardContent className="p-0">
                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead className="bg-muted/50">
                                <tr>
                                    <th className="p-4 w-12">
                                        <input 
                                            type="checkbox" 
                                            checked={selectedUsers.length === filteredUsers.length && filteredUsers.length > 0}
                                            onChange={toggleSelectAll}
                                            className="rounded border-gray-300"
                                        />
                                    </th>
                                    <th className="text-left p-4 font-medium text-muted-foreground">User</th>
                                    <th className="text-left p-4 font-medium text-muted-foreground">Role</th>
                                    <th className="text-left p-4 font-medium text-muted-foreground">Status</th>
                                    <th className="text-left p-4 font-medium text-muted-foreground">Joined</th>
                                    <th className="text-right p-4 font-medium text-muted-foreground">Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {filteredUsers.map(user => (
                                    <tr key={user.id} className="border-b last:border-0 hover:bg-muted/50 transition-colors">
                                        <td className="p-4">
                                            <input 
                                                type="checkbox" 
                                                checked={selectedUsers.includes(user.id)}
                                                onChange={() => toggleSelectUser(user.id)}
                                                className="rounded border-gray-300"
                                            />
                                        </td>
                                        <td className="p-4">
                                            <div className="font-medium">{user.name}</div>
                                            <div className="text-sm text-muted-foreground">{user.email}</div>
                                        </td>
                                        <td className="p-4">
                                            <Badge variant="outline">{user.role}</Badge>
                                        </td>
                                        <td className="p-4">
                                            <Badge className={
                                                user.status === 'Active' ? 'bg-green-100 text-green-700 hover:bg-green-100' : 
                                                user.status === 'Inactive' ? 'bg-gray-100 text-gray-700 hover:bg-gray-100' : 
                                                'bg-red-100 text-red-700 hover:bg-red-100'
                                            }>
                                                {user.status}
                                            </Badge>
                                        </td>
                                        <td className="p-4 text-sm text-muted-foreground">{user.joined}</td>
                                        <td className="p-4 text-right">
                                            <Button variant="ghost" size="icon">
                                                <MoreHorizontal className="h-4 w-4" />
                                            </Button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </CardContent>
            </Card>
        </div>
    )
}

// 4. Content Management (Mock WYSIWYG)
function ContentManagement() {
    return (
        <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <Card className="md:col-span-2">
                    <CardHeader>
                        <CardTitle>Content Editor</CardTitle>
                        <CardDescription>Create and edit platform content</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="space-y-2">
                            <label className="text-sm font-medium">Title</label>
                            <Input placeholder="Enter content title" />
                        </div>
                        <div className="space-y-2">
                            <label className="text-sm font-medium">Category</label>
                            <select className="w-full p-2 border rounded-md bg-background">
                                <option>Announcement</option>
                                <option>Success Story</option>
                                <option>Help Article</option>
                            </select>
                        </div>
                        <div className="space-y-2">
                            <label className="text-sm font-medium">Content</label>
                            <div className="min-h-[300px] border rounded-md p-4 bg-muted/20">
                                {/* Mock Toolbar */}
                                <div className="flex gap-2 border-b pb-2 mb-2">
                                    <Button variant="ghost" size="sm" className="h-8 w-8 p-0"><b>B</b></Button>
                                    <Button variant="ghost" size="sm" className="h-8 w-8 p-0"><i>I</i></Button>
                                    <Button variant="ghost" size="sm" className="h-8 w-8 p-0"><u>U</u></Button>
                                    <div className="w-px h-6 bg-border mx-1" />
                                    <Button variant="ghost" size="sm" className="h-8 w-8 p-0">H1</Button>
                                    <Button variant="ghost" size="sm" className="h-8 w-8 p-0">H2</Button>
                                    <div className="w-px h-6 bg-border mx-1" />
                                    <Button variant="ghost" size="sm" className="h-8 w-8 p-0">🔗</Button>
                                    <Button variant="ghost" size="sm" className="h-8 w-8 p-0">📷</Button>
                                </div>
                                <textarea 
                                    className="w-full h-full min-h-[250px] bg-transparent border-0 focus:ring-0 resize-none p-0"
                                    placeholder="Start typing your content here..."
                                />
                            </div>
                        </div>
                        <div className="flex justify-end gap-2">
                            <Button variant="outline">Save Draft</Button>
                            <Button>Publish Content</Button>
                        </div>
                    </CardContent>
                </Card>

                <div className="space-y-6">
                    <Card>
                        <CardHeader>
                            <CardTitle className="text-lg">Recent Content</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            {[1, 2, 3].map(i => (
                                <div key={i} className="flex items-start gap-3 p-3 rounded-lg hover:bg-muted/50 transition-colors cursor-pointer">
                                    <div className="p-2 bg-primary/10 rounded">
                                        <FileText className="h-4 w-4 text-primary" />
                                    </div>
                                    <div>
                                        <p className="font-medium text-sm">Platform Update v2.{i}</p>
                                        <p className="text-xs text-muted-foreground">Published 2 days ago</p>
                                    </div>
                                </div>
                            ))}
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader>
                            <CardTitle className="text-lg">Quick Stats</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="flex justify-between items-center">
                                <span className="text-sm text-muted-foreground">Total Posts</span>
                                <span className="font-bold">124</span>
                            </div>
                            <div className="flex justify-between items-center">
                                <span className="text-sm text-muted-foreground">Drafts</span>
                                <span className="font-bold">5</span>
                            </div>
                            <div className="flex justify-between items-center">
                                <span className="text-sm text-muted-foreground">Pending Review</span>
                                <span className="font-bold text-yellow-600">12</span>
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </div>
    )
}

// --- Main Admin Page ---

function AdminContent() {
    const router = useRouter()
    const [isVerified, setIsVerified] = useState(false)
    const [activeTab, setActiveTab] = useState('overview')
    const [isSidebarOpen, setIsSidebarOpen] = useState(true)
    const [platformData, setPlatformData] = useState<PlatformAnalytics | null>(null)
    const [isLoading, setIsLoading] = useState(true)

    useEffect(() => {
        const loadData = async () => {
            try {
                const data = await analyticsService.getPlatformAnalytics()
                setPlatformData(data)
            } catch (error) {
                console.error('Failed to load analytics', error)
            } finally {
                setIsLoading(false)
            }
        }
        loadData()
    }, [])

    if (!isVerified) {
        return <AdminSecurityCheck onVerified={() => setIsVerified(true)} />
    }

    const navItems = [
        { id: 'overview', label: 'Dashboard', icon: LayoutDashboard },
        { id: 'users', label: 'User Management', icon: Users },
        { id: 'content', label: 'Content', icon: FileText },
        { id: 'sessions', label: 'Sessions', icon: Clock },
        { id: 'finance', label: 'Finance', icon: CreditCard },
        { id: 'settings', label: 'Settings', icon: Settings },
    ]

    return (
        <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex">
            {/* Sidebar */}
            <aside className={`${isSidebarOpen ? 'w-64' : 'w-20'} bg-white dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700 transition-all duration-300 flex flex-col fixed h-full z-20`}>
                <div className="p-4 flex items-center justify-between border-b border-gray-200 dark:border-gray-700 h-16">
                    {isSidebarOpen ? (
                        <div className="flex items-center gap-2 font-bold text-xl text-primary">
                            <Shield className="h-6 w-6" />
                            <span>Wibi Admin</span>
                        </div>
                    ) : (
                        <Shield className="h-6 w-6 text-primary mx-auto" />
                    )}
                </div>

                <nav className="flex-1 p-4 space-y-2 overflow-y-auto">
                    {navItems.map((item) => (
                        <button
                            key={item.id}
                            onClick={() => setActiveTab(item.id)}
                            className={`w-full flex items-center gap-3 px-3 py-3 rounded-lg text-sm font-medium transition-colors ${
                                activeTab === item.id
                                    ? 'bg-primary/10 text-primary'
                                    : 'text-muted-foreground hover:bg-muted hover:text-foreground'
                            } ${!isSidebarOpen && 'justify-center'}`}
                            title={!isSidebarOpen ? item.label : ''}
                        >
                            <item.icon className="h-5 w-5 shrink-0" />
                            {isSidebarOpen && <span>{item.label}</span>}
                        </button>
                    ))}
                </nav>

                <div className="p-4 border-t border-gray-200 dark:border-gray-700">
                    <button 
                        onClick={() => router.push('/dashboard')}
                        className={`w-full flex items-center gap-3 px-3 py-3 rounded-lg text-sm font-medium text-red-500 hover:bg-red-50 transition-colors ${!isSidebarOpen && 'justify-center'}`}
                    >
                        <LogOut className="h-5 w-5 shrink-0" />
                        {isSidebarOpen && <span>Exit Admin</span>}
                    </button>
                </div>
            </aside>

            {/* Main Content */}
            <main className={`flex-1 transition-all duration-300 ${isSidebarOpen ? 'ml-64' : 'ml-20'}`}>
                {/* Topbar */}
                <header className="h-16 bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 sticky top-0 z-10 px-6 flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <Button variant="ghost" size="icon" onClick={() => setIsSidebarOpen(!isSidebarOpen)}>
                            <Menu className="h-5 w-5" />
                        </Button>
                        <h2 className="text-lg font-semibold capitalize">{activeTab.replace('-', ' ')}</h2>
                    </div>
                    <div className="flex items-center gap-4">
                        <div className="flex items-center gap-2 text-sm text-muted-foreground bg-muted/50 px-3 py-1.5 rounded-full">
                            <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
                            System Operational
                        </div>
                        <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold">
                            A
                        </div>
                    </div>
                </header>

                {/* Content Area */}
                <div className="p-6">
                    {activeTab === 'overview' && (
                        <div className="space-y-6">
                            {/* Stats Grid */}
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                                <StatCard
                                    title="Total Users"
                                    value={platformData?.total_users || 0}
                                    subtitle={`${platformData?.active_users || 0} active now`}
                                    icon={Users}
                                    trend="up"
                                    trendValue="+12% vs last month"
                                    gradient="bg-gradient-to-br from-blue-600 to-blue-700"
                                />
                                <StatCard
                                    title="Total Sessions"
                                    value={platformData?.total_sessions || 0}
                                    subtitle={`${platformData?.completed_sessions || 0} completed`}
                                    icon={Clock}
                                    trend="up"
                                    trendValue="+5% vs last week"
                                    gradient="bg-gradient-to-br from-purple-600 to-purple-700"
                                />
                                <StatCard
                                    title="Credits Flow"
                                    value={platformData?.total_credits_in_flow || 0}
                                    icon={CreditCard}
                                    trend="neutral"
                                    trendValue="Stable"
                                    gradient="bg-gradient-to-br from-emerald-600 to-emerald-700"
                                />
                                <StatCard
                                    title="Platform Rating"
                                    value={platformData?.average_session_rating.toFixed(1) || '0.0'}
                                    icon={Star}
                                    trend="up"
                                    trendValue="+0.2"
                                    gradient="bg-gradient-to-br from-orange-500 to-red-600"
                                />
                            </div>

                            {/* Recent Activity & Quick Actions */}
                            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                                <Card className="lg:col-span-2">
                                    <CardHeader>
                                        <CardTitle>Platform Activity</CardTitle>
                                        <CardDescription>Real-time system events</CardDescription>
                                    </CardHeader>
                                    <CardContent>
                                        <div className="space-y-4">
                                            {[1, 2, 3, 4, 5].map((i) => (
                                                <div key={i} className="flex items-center gap-4 pb-4 border-b last:border-0 last:pb-0">
                                                    <div className="w-2 h-2 rounded-full bg-blue-500" />
                                                    <div className="flex-1">
                                                        <p className="text-sm font-medium">New user registration verified</p>
                                                        <p className="text-xs text-muted-foreground">2 minutes ago • User ID #123{i}</p>
                                                    </div>
                                                    <Button variant="ghost" size="sm">View</Button>
                                                </div>
                                            ))}
                                        </div>
                                    </CardContent>
                                </Card>

                                <Card>
                                    <CardHeader>
                                        <CardTitle>System Health</CardTitle>
                                    </CardHeader>
                                    <CardContent className="space-y-6">
                                        <div className="space-y-2">
                                            <div className="flex justify-between text-sm">
                                                <span>Server Load</span>
                                                <span className="text-green-600">24%</span>
                                            </div>
                                            <div className="h-2 bg-muted rounded-full overflow-hidden">
                                                <div className="h-full w-[24%] bg-green-500 rounded-full" />
                                            </div>
                                        </div>
                                        <div className="space-y-2">
                                            <div className="flex justify-between text-sm">
                                                <span>Database Connections</span>
                                                <span className="text-blue-600">45/100</span>
                                            </div>
                                            <div className="h-2 bg-muted rounded-full overflow-hidden">
                                                <div className="h-full w-[45%] bg-blue-500 rounded-full" />
                                            </div>
                                        </div>
                                        <div className="space-y-2">
                                            <div className="flex justify-between text-sm">
                                                <span>Storage Usage</span>
                                                <span className="text-yellow-600">68%</span>
                                            </div>
                                            <div className="h-2 bg-muted rounded-full overflow-hidden">
                                                <div className="h-full w-[68%] bg-yellow-500 rounded-full" />
                                            </div>
                                        </div>
                                    </CardContent>
                                </Card>
                            </div>
                        </div>
                    )}

                    {activeTab === 'users' && <UserManagement />}
                    
                    {activeTab === 'content' && <ContentManagement />}

                    {['sessions', 'finance', 'settings'].includes(activeTab) && (
                        <div className="flex flex-col items-center justify-center h-[60vh] text-muted-foreground">
                            <div className="p-4 bg-muted rounded-full mb-4">
                                <Settings className="h-8 w-8" />
                            </div>
                            <h3 className="text-xl font-semibold">Module Under Construction</h3>
                            <p>This admin module is currently being developed.</p>
                        </div>
                    )}
                </div>
            </main>
        </div>
    )
}

export default function AdminPage() {
    return (
        <AdminProtectedRoute>
            <AdminContent />
        </AdminProtectedRoute>
    )
}
