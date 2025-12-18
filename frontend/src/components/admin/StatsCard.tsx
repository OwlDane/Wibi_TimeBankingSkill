import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { LucideIcon } from 'lucide-react';
import { cn } from '@/lib/utils';

interface StatsCardProps {
    title: string;
    value: string | number;
    description?: string;
    icon: LucideIcon;
    trend?: {
        value: string;
        isPositive: boolean;
    };
    className?: string;
}

export function StatsCard({
    title,
    value,
    description,
    icon: Icon,
    trend,
    className,
}: StatsCardProps) {
    return (
        <Card className={cn('', className)}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">{title}</CardTitle>
                <Icon className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
                <div className="text-2xl font-bold">{value}</div>
                {description && (
                    <p className="text-xs text-muted-foreground">{description}</p>
                )}
                {trend && (
                    <div
                        className={cn(
                            'mt-2 flex items-center text-xs font-medium',
                            trend.isPositive ? 'text-green-600' : 'text-red-600'
                        )}
                    >
                        <span>{trend.isPositive ? '↑' : '↓'}</span>
                        <span className="ml-1">{trend.value}</span>
                        <span className="ml-1 text-muted-foreground">from last month</span>
                    </div>
                )}
            </CardContent>
        </Card>
    );
}
