import { cn } from '@/lib/utils'
import { type LucideIcon } from 'lucide-react'

export type StatStatus = 'normal' | 'attention' | 'zero';

export interface StatCardProps {
    /** The label explaining the statistic (e.g., "Overdue Tasks") */
    label: string;
    /** The main numerical value (e.g., "12") */
    value: string | number;
    /** The Lucide/Phosphor icon component */
    icon: LucideIcon;
    /** Optional trend indicator (e.g., "+5% from last week") - Future Proofing */
    trend?: string;
    /** Determines visual emphasis style. Defaults to 'normal'. */
    status?: StatStatus;
    /** Optional click handler for navigation */
    onClick?: () => void;
    className?: string;
}

export function StatCard({
    label,
    value,
    icon: Icon,
    trend,
    status = 'normal',
    className,
    onClick
}: StatCardProps) {
    return (
        <div
            onClick={onClick}
            className={cn(
                'flex flex-col justify-between rounded-2xl p-4 transition-all duration-200 border border-white/5',
                {
                    'bg-white/10 text-white': status === 'normal' || status === 'attention',
                    'bg-white/5 text-white/40': status === 'zero',
                    'cursor-pointer hover:bg-white/15': !!onClick,
                },
                className
            )}
        >
            <div className="flex justify-between items-start mb-2">
                <div className={cn(
                    "p-2 rounded-xl",
                    {
                        'bg-white/10 text-white': status === 'normal',
                        'bg-white/10 text-amber-400': status === 'attention',
                        'bg-white/5 text-white/40': status === 'zero',
                    }
                )}>
                    <Icon className="w-5 h-5" />
                </div>
                {trend && (
                    <span className="text-xs font-medium bg-white/10 px-2 py-1 rounded-full text-white/80">
                        {trend}
                    </span>
                )}
            </div>
            <div>
                <div className={cn(
                    "text-2xl font-bold mb-1",
                    {
                        'text-white': status === 'normal' || status === 'attention',
                        'text-white/40': status === 'zero',
                    }
                )}>
                    {value}
                </div>
                <div className={cn(
                    "text-sm font-medium",
                    {
                        'text-white/60': status === 'normal' || status === 'attention',
                        'text-white/30': status === 'zero',
                    }
                )}>
                    {label}
                </div>
            </div>
        </div>
    )
}
