'use client';

import { useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Search, MoreVertical, UserCheck, UserX, Eye, Loader2, Filter } from 'lucide-react';
import { toast } from 'sonner';

interface User {
    id: number;
    full_name: string;
    email: string;
    username: string;
    school: string;
    grade: string;
    credit_balance: number;
    is_active: boolean;
    is_verified: boolean;
    created_at: string;
}

export default function UsersPage() {
    const searchParams = useSearchParams();
    const [users, setUsers] = useState<User[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');
    
    // Initialize filter from URL params
    const initialFilter = searchParams.get('filter');
    const [filterStatus, setFilterStatus] = useState<'all' | 'active' | 'suspended' | 'verification'>(
        (initialFilter && ['active', 'suspended', 'verification'].includes(initialFilter)) 
            ? initialFilter as 'active' | 'suspended' | 'verification'
            : 'all'
    );

    // Update filter when URL params change
    useEffect(() => {
        const filter = searchParams.get('filter');
        if (filter && ['active', 'suspended', 'verification'].includes(filter)) {
            setFilterStatus(filter as 'active' | 'suspended' | 'verification');
        } else {
            setFilterStatus('all');
        }
    }, [searchParams]);

    useEffect(() => {
        fetchUsers();
    }, []);

    const fetchUsers = async () => {
        try {
            setIsLoading(true);
            // TODO: Replace with actual admin API endpoint
            const response = await fetch('/api/v1/admin/users', {
                headers: {
                    Authorization: `Bearer ${localStorage.getItem('admin_token')}`,
                },
            });
            if (response.ok) {
                const data = await response.json();
                setUsers(data.data || []);
            }
        } catch (error) {
            console.error('Failed to fetch users:', error);
            toast.error('Failed to load users');
        } finally {
            setIsLoading(false);
        }
    };

    const handleSuspendUser = async (userId: number) => {
        try {
            // TODO: Implement suspend API
            toast.success('User suspended successfully');
            fetchUsers();
        } catch (error) {
            toast.error('Failed to suspend user');
        }
    };

    const handleActivateUser = async (userId: number) => {
        try {
            // TODO: Implement activate API
            toast.success('User activated successfully');
            fetchUsers();
        } catch (error) {
            toast.error('Failed to activate user');
        }
    };

    const filteredUsers = users.filter((user) => {
        const matchesSearch =
            user.full_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
            user.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
            user.username.toLowerCase().includes(searchQuery.toLowerCase());

        const matchesFilter =
            filterStatus === 'all' ||
            (filterStatus === 'active' && user.is_active) ||
            (filterStatus === 'suspended' && !user.is_active) ||
            (filterStatus === 'verification' && !user.is_verified);

        return matchesSearch && matchesFilter;
    });

    if (isLoading) {
        return (
            <div className="flex h-full items-center justify-center">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
        );
    }

    // Get dynamic title based on filter
    const getPageTitle = () => {
        switch (filterStatus) {
            case 'active':
                return 'Active Users';
            case 'suspended':
                return 'Suspended Users';
            case 'verification':
                return 'Unverified Users';
            default:
                return 'All Users';
        }
    };

    return (
        <div className="space-y-6">
            {/* Page Header */}
            <div>
                <div className="flex items-center gap-3">
                    <h1 className="text-3xl font-bold tracking-tight">Users Management</h1>
                    {filterStatus !== 'all' && (
                        <Badge variant="secondary" className="text-sm">
                            {getPageTitle()}
                        </Badge>
                    )}
                </div>
                <p className="text-muted-foreground">
                    {filterStatus === 'all' 
                        ? 'Manage and monitor all platform users'
                        : `Viewing ${getPageTitle().toLowerCase()}`
                    }
                </p>
            </div>

            {/* Stats Cards */}
            <div className="grid gap-4 md:grid-cols-4">
                <Card>
                    <CardHeader className="pb-2">
                        <CardTitle className="text-sm font-medium">Total Users</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{users.length}</div>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="pb-2">
                        <CardTitle className="text-sm font-medium">Active Users</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">
                            {users.filter((u) => u.is_active).length}
                        </div>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="pb-2">
                        <CardTitle className="text-sm font-medium">Suspended</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">
                            {users.filter((u) => !u.is_active).length}
                        </div>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="pb-2">
                        <CardTitle className="text-sm font-medium">Verified</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">
                            {users.filter((u) => u.is_verified).length}
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* Users Table */}
            <Card>
                <CardHeader>
                    <div className="flex items-center justify-between">
                        <div>
                            <CardTitle>{getPageTitle()}</CardTitle>
                            <CardDescription>
                                {filterStatus === 'all' 
                                    ? 'View and manage all registered users'
                                    : filterStatus === 'active'
                                    ? 'Users who are currently active on the platform'
                                    : filterStatus === 'suspended'
                                    ? 'Users who have been suspended'
                                    : 'Users pending email verification'
                                }
                            </CardDescription>
                        </div>
                        <div className="flex items-center gap-2">
                            <div className="relative">
                                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                                <Input
                                    placeholder="Search users..."
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                    className="w-64 pl-8"
                                />
                            </div>
                            <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                    <Button variant="outline" size="icon">
                                        <Filter className="h-4 w-4" />
                                    </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent align="end">
                                    <DropdownMenuLabel>Filter by Status</DropdownMenuLabel>
                                    <DropdownMenuSeparator />
                                    <DropdownMenuItem onClick={() => setFilterStatus('all')}>
                                        All Users
                                    </DropdownMenuItem>
                                    <DropdownMenuItem onClick={() => setFilterStatus('active')}>
                                        Active Only
                                    </DropdownMenuItem>
                                    <DropdownMenuItem onClick={() => setFilterStatus('suspended')}>
                                        Suspended Only
                                    </DropdownMenuItem>
                                </DropdownMenuContent>
                            </DropdownMenu>
                        </div>
                    </div>
                </CardHeader>
                <CardContent>
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>User</TableHead>
                                <TableHead>School</TableHead>
                                <TableHead>Grade</TableHead>
                                <TableHead>Credits</TableHead>
                                <TableHead>Status</TableHead>
                                <TableHead>Joined</TableHead>
                                <TableHead className="text-right">Actions</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {filteredUsers.length === 0 ? (
                                <TableRow>
                                    <TableCell colSpan={7} className="text-center text-muted-foreground">
                                        No users found
                                    </TableCell>
                                </TableRow>
                            ) : (
                                filteredUsers.map((user) => (
                                    <TableRow key={user.id}>
                                        <TableCell>
                                            <div>
                                                <div className="font-medium">{user.full_name}</div>
                                                <div className="text-sm text-muted-foreground">@{user.username}</div>
                                                <div className="text-xs text-muted-foreground">{user.email}</div>
                                            </div>
                                        </TableCell>
                                        <TableCell>{user.school || '-'}</TableCell>
                                        <TableCell>{user.grade || '-'}</TableCell>
                                        <TableCell>
                                            <span className="font-medium">{user.credit_balance} CR</span>
                                        </TableCell>
                                        <TableCell>
                                            <div className="flex items-center gap-2">
                                                <Badge variant={user.is_active ? 'default' : 'destructive'}>
                                                    {user.is_active ? 'Active' : 'Suspended'}
                                                </Badge>
                                                {user.is_verified && (
                                                    <Badge variant="outline" className="text-xs">
                                                        Verified
                                                    </Badge>
                                                )}
                                            </div>
                                        </TableCell>
                                        <TableCell>
                                            {new Date(user.created_at).toLocaleDateString()}
                                        </TableCell>
                                        <TableCell className="text-right">
                                            <DropdownMenu>
                                                <DropdownMenuTrigger asChild>
                                                    <Button variant="ghost" size="icon">
                                                        <MoreVertical className="h-4 w-4" />
                                                    </Button>
                                                </DropdownMenuTrigger>
                                                <DropdownMenuContent align="end">
                                                    <DropdownMenuLabel>Actions</DropdownMenuLabel>
                                                    <DropdownMenuSeparator />
                                                    <DropdownMenuItem>
                                                        <Eye className="mr-2 h-4 w-4" />
                                                        View Details
                                                    </DropdownMenuItem>
                                                    {user.is_active ? (
                                                        <DropdownMenuItem
                                                            onClick={() => handleSuspendUser(user.id)}
                                                            className="text-red-600"
                                                        >
                                                            <UserX className="mr-2 h-4 w-4" />
                                                            Suspend User
                                                        </DropdownMenuItem>
                                                    ) : (
                                                        <DropdownMenuItem
                                                            onClick={() => handleActivateUser(user.id)}
                                                            className="text-green-600"
                                                        >
                                                            <UserCheck className="mr-2 h-4 w-4" />
                                                            Activate User
                                                        </DropdownMenuItem>
                                                    )}
                                                </DropdownMenuContent>
                                            </DropdownMenu>
                                        </TableCell>
                                    </TableRow>
                                ))
                            )}
                        </TableBody>
                    </Table>
                </CardContent>
            </Card>
        </div>
    );
}
