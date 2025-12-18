'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';
import {
    LayoutDashboard,
    Users,
    BookOpen,
    GraduationCap,
    CreditCard,
    Trophy,
    MessageSquare,
    BarChart3,
    Settings,
    ChevronLeft,
    ChevronRight,
} from 'lucide-react';
import { Button } from '@/components/ui/button';

interface NavItem {
    title: string;
    href: string;
    icon: React.ElementType;
    badge?: number;
}

const navItems: NavItem[] = [
    {
        title: 'Dashboard',
        href: '/admin',
        icon: LayoutDashboard,
    },
    {
        title: 'Users',
        href: '/admin/users',
        icon: Users,
    },
    {
        title: 'Sessions',
        href: '/admin/sessions',
        icon: GraduationCap,
    },
    {
        title: 'Skills',
        href: '/admin/skills',
        icon: BookOpen,
    },
    {
        title: 'Transactions',
        href: '/admin/transactions',
        icon: CreditCard,
    },
    {
        title: 'Gamification',
        href: '/admin/gamification',
        icon: Trophy,
    },
    {
        title: 'Community',
        href: '/admin/community',
        icon: MessageSquare,
    },
    {
        title: 'Analytics',
        href: '/admin/analytics',
        icon: BarChart3,
    },
    {
        title: 'Settings',
        href: '/admin/settings',
        icon: Settings,
    },
];

interface AdminSidebarProps {
    isCollapsed: boolean;
    onToggle: () => void;
}

export function AdminSidebar({ isCollapsed, onToggle }: AdminSidebarProps) {
    const pathname = usePathname();

    return (
        <aside
            className={cn(
                'fixed left-0 top-0 z-40 h-screen border-r bg-background transition-all duration-300',
                isCollapsed ? 'w-16' : 'w-64'
            )}
        >
            {/* Header */}
            <div className="flex h-16 items-center justify-between border-b px-4">
                {!isCollapsed && (
                    <div className="flex items-center gap-2">
                        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary">
                            <span className="text-sm font-bold text-primary-foreground">W</span>
                        </div>
                        <span className="font-semibold">Wibi Admin</span>
                    </div>
                )}
                <Button
                    variant="ghost"
                    size="icon"
                    onClick={onToggle}
                    className={cn('h-8 w-8', isCollapsed && 'mx-auto')}
                >
                    {isCollapsed ? (
                        <ChevronRight className="h-4 w-4" />
                    ) : (
                        <ChevronLeft className="h-4 w-4" />
                    )}
                </Button>
            </div>

            {/* Navigation */}
            <nav className="space-y-1 p-2">
                {navItems.map((item) => {
                    const isActive = pathname === item.href;
                    const Icon = item.icon;

                    return (
                        <Link
                            key={item.href}
                            href={item.href}
                            className={cn(
                                'flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors',
                                isActive
                                    ? 'bg-primary text-primary-foreground'
                                    : 'text-muted-foreground hover:bg-muted hover:text-foreground',
                                isCollapsed && 'justify-center'
                            )}
                            title={isCollapsed ? item.title : ''}
                        >
                            <Icon className="h-5 w-5 shrink-0" />
                            {!isCollapsed && (
                                <span className="flex-1">{item.title}</span>
                            )}
                            {!isCollapsed && item.badge && (
                                <span className="flex h-5 w-5 items-center justify-center rounded-full bg-primary text-xs text-primary-foreground">
                                    {item.badge}
                                </span>
                            )}
                        </Link>
                    );
                })}
            </nav>
        </aside>
    );
}
