'use client';

import { useRouter } from 'next/navigation';
import { useAdminStore } from '@/stores/admin.store';
import { Button } from '@/components/ui/button';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { LogOut, Settings, User } from 'lucide-react';
import { toast } from 'sonner';

export function AdminHeader() {
    const router = useRouter();
    const { admin, logout } = useAdminStore();

    const handleLogout = async () => {
        await logout();
        toast.success('Logged out successfully');
        router.push('/admin/login');
    };

    const getInitials = (name: string) => {
        return name
            .split(' ')
            .map((n) => n[0])
            .join('')
            .toUpperCase()
            .slice(0, 2);
    };

    return (
        <header className="sticky top-0 z-30 flex h-16 items-center justify-between border-b bg-background px-6">
            <div className="flex items-center gap-4">
                <div>
                    <h2 className="text-lg font-semibold">Admin Dashboard</h2>
                    <p className="text-sm text-muted-foreground">
                        Manage your platform
                    </p>
                </div>
            </div>

            <div className="flex items-center gap-4">
                {/* System Status */}
                <div className="flex items-center gap-2 rounded-full bg-green-50 px-3 py-1.5 text-sm text-green-700 dark:bg-green-950 dark:text-green-300">
                    <div className="h-2 w-2 animate-pulse rounded-full bg-green-500" />
                    <span className="hidden sm:inline">System Operational</span>
                </div>

                {/* Admin Profile */}
                <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                        <Button variant="ghost" className="relative h-10 w-10 rounded-full">
                            <Avatar className="h-10 w-10">
                                <AvatarFallback className="bg-primary text-primary-foreground">
                                    {admin?.full_name ? getInitials(admin.full_name) : 'A'}
                                </AvatarFallback>
                            </Avatar>
                        </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent className="w-56" align="end" forceMount>
                        <DropdownMenuLabel className="font-normal">
                            <div className="flex flex-col space-y-1">
                                <p className="text-sm font-medium leading-none">
                                    {admin?.full_name || 'Admin'}
                                </p>
                                <p className="text-xs leading-none text-muted-foreground">
                                    {admin?.email || 'admin@wibi.com'}
                                </p>
                                <p className="text-xs capitalize text-muted-foreground">
                                    {admin?.role || 'admin'}
                                </p>
                            </div>
                        </DropdownMenuLabel>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem onClick={() => router.push('/admin/settings')}>
                            <User className="mr-2 h-4 w-4" />
                            <span>Profile</span>
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => router.push('/admin/settings')}>
                            <Settings className="mr-2 h-4 w-4" />
                            <span>Settings</span>
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem onClick={handleLogout} className="text-red-600">
                            <LogOut className="mr-2 h-4 w-4" />
                            <span>Logout</span>
                        </DropdownMenuItem>
                    </DropdownMenuContent>
                </DropdownMenu>
            </div>
        </header>
    );
}
