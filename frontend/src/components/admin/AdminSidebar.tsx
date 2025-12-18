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
    ChevronDown,
    UserCheck,
    UserX,
    Clock,
    CheckCircle,
    XCircle,
    Award,
    Star,
    TrendingUp,
    FileText,
    Image as ImageIcon,
    ThumbsUp,
} from 'lucide-react';
import { Button } from '@/components/ui/button';

interface SubMenuItem {
    title: string;
    href: string;
    badge?: number;
}

interface NavItem {
    title: string;
    href?: string;
    icon: React.ElementType;
    badge?: number;
    subItems?: SubMenuItem[];
}

const navItems: NavItem[] = [
    {
        title: 'Dashboard',
        href: '/admin',
        icon: LayoutDashboard,
    },
    {
        title: 'Users',
        icon: Users,
        badge: 2,
        subItems: [
            { title: 'All Users', href: '/admin/users' },
            { title: 'Active Users', href: '/admin/users/active' },
            { title: 'Suspended', href: '/admin/users/suspended', badge: 2 },
            { title: 'Verification', href: '/admin/users/verification' },
        ],
    },
    {
        title: 'Sessions',
        icon: GraduationCap,
        subItems: [
            { title: 'All Sessions', href: '/admin/sessions' },
            { title: 'Pending', href: '/admin/sessions/pending' },
            { title: 'In Progress', href: '/admin/sessions/in-progress' },
            { title: 'Completed', href: '/admin/sessions/completed' },
            { title: 'Cancelled', href: '/admin/sessions/cancelled' },
        ],
    },
    {
        title: 'Skills',
        href: '/admin/skills',
        icon: BookOpen,
    },
    {
        title: 'Transactions',
        icon: CreditCard,
        subItems: [
            { title: 'All Transactions', href: '/admin/transactions' },
            { title: 'Credits Earned', href: '/admin/transactions/earned' },
            { title: 'Credits Spent', href: '/admin/transactions/spent' },
            { title: 'Refunds', href: '/admin/transactions/refunds' },
        ],
    },
    {
        title: 'Gamification',
        icon: Trophy,
        subItems: [
            { title: 'Badges', href: '/admin/gamification/badges' },
            { title: 'Leaderboards', href: '/admin/gamification/leaderboards' },
            { title: 'Achievements', href: '/admin/gamification/achievements' },
        ],
    },
    {
        title: 'Community',
        icon: MessageSquare,
        badge: 3,
        subItems: [
            { title: 'Forum', href: '/admin/community/forum' },
            { title: 'Stories', href: '/admin/community/stories' },
            { title: 'Reports', href: '/admin/community/reports', badge: 3 },
            { title: 'Moderation', href: '/admin/community/moderation' },
        ],
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
    const [expandedItems, setExpandedItems] = useState<string[]>([]);

    const toggleExpand = (title: string) => {
        setExpandedItems((prev) =>
            prev.includes(title)
                ? prev.filter((item) => item !== title)
                : [...prev, title]
        );
    };

    const isItemActive = (item: NavItem) => {
        if (item.href) {
            return pathname === item.href;
        }
        if (item.subItems) {
            return item.subItems.some((sub) => pathname === sub.href);
        }
        return false;
    };

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
                    const isActive = isItemActive(item);
                    const isExpanded = expandedItems.includes(item.title);
                    const IconComponent = item.icon;
                    const hasSubItems = item.subItems && item.subItems.length > 0;

                    // Single item (no submenu)
                    if (!hasSubItems) {
                        return (
                            <Link
                                key={item.title}
                                href={item.href || '#'}
                                className={cn(
                                    'flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors',
                                    isActive
                                        ? 'bg-primary text-primary-foreground'
                                        : 'text-muted-foreground hover:bg-muted hover:text-foreground',
                                    isCollapsed && 'justify-center'
                                )}
                                title={isCollapsed ? item.title : undefined}
                            >
                                <IconComponent className="h-5 w-5 shrink-0" />
                                {!isCollapsed && <span className="flex-1">{item.title}</span>}
                                {!isCollapsed && item.badge && (
                                    <span className="flex h-5 w-5 items-center justify-center rounded-full bg-primary text-xs text-primary-foreground">
                                        {item.badge}
                                    </span>
                                )}
                            </Link>
                        );
                    }

                    // Item with submenu
                    return (
                        <div key={item.title}>
                            <button
                                onClick={() => !isCollapsed && toggleExpand(item.title)}
                                className={cn(
                                    'flex w-full items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors',
                                    isActive
                                        ? 'bg-muted text-foreground'
                                        : 'text-muted-foreground hover:bg-muted hover:text-foreground',
                                    isCollapsed && 'justify-center'
                                )}
                                title={isCollapsed ? item.title : undefined}
                            >
                                <IconComponent className="h-5 w-5 shrink-0" />
                                {!isCollapsed && (
                                    <>
                                        <span className="flex-1 text-left">{item.title}</span>
                                        {item.badge && (
                                            <span className="flex h-5 w-5 items-center justify-center rounded-full bg-primary text-xs text-primary-foreground">
                                                {item.badge}
                                            </span>
                                        )}
                                        <ChevronDown
                                            className={cn(
                                                'h-4 w-4 transition-transform',
                                                isExpanded && 'rotate-180'
                                            )}
                                        />
                                    </>
                                )}
                            </button>

                            {/* Submenu */}
                            {!isCollapsed && isExpanded && (
                                <div className="ml-4 mt-1 space-y-1 border-l pl-4">
                                    {item.subItems?.map((subItem) => {
                                        const isSubActive = pathname === subItem.href;
                                        return (
                                            <Link
                                                key={subItem.href}
                                                href={subItem.href}
                                                className={cn(
                                                    'flex items-center gap-2 rounded-lg px-3 py-1.5 text-sm transition-colors',
                                                    isSubActive
                                                        ? 'bg-primary text-primary-foreground'
                                                        : 'text-muted-foreground hover:bg-muted hover:text-foreground'
                                                )}
                                            >
                                                <span className="flex-1">{subItem.title}</span>
                                                {subItem.badge && (
                                                    <span className="flex h-4 w-4 items-center justify-center rounded-full bg-primary text-xs text-primary-foreground">
                                                        {subItem.badge}
                                                    </span>
                                                )}
                                            </Link>
                                        );
                                    })}
                                </div>
                            )}
                        </div>
                    );
                })}
            </nav>
        </aside>
    );
}
