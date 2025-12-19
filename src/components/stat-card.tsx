import { memo } from 'react'
import { cn } from '@/lib/utils'
import { LucideIcon } from 'lucide-react'

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

export const StatCard = memo(function StatCard({
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
                'flex flex-col justify-between rounded-xl p-4 transition-all duration-200 border backdrop-blur-sm',
                {
                    'bg-white/[0.08] border-white/10 text-white': status === 'normal',
                    'bg-amber-500/10 border-amber-500/20 text-white': status === 'attention',
                    'bg-white/[0.03] border-white/5 text-white/40': status === 'zero',
                    'cursor-pointer hover:bg-white/[0.12] hover:border-white/15': !!onClick,
                },
                className
            )}
        >
            <div className="flex justify-between items-start mb-3">
                <div className={cn(
                    "p-2 rounded-lg",
                    {
                        'bg-emerald-500/20 text-emerald-400': status === 'normal',
                        'bg-amber-500/20 text-amber-400': status === 'attention',
                        'bg-white/5 text-white/30': status === 'zero',
                    }
                )}>
                    <Icon className="w-4 h-4" />
                </div>
                {trend && (
                    <span className={cn(
                        "text-[10px] font-semibold px-2 py-0.5 rounded-full",
                        trend.startsWith('+') ? 'bg-emerald-500/20 text-emerald-400' : 'bg-white/10 text-white/70'
                    )}>
                        {trend}
                    </span>
                )}
            </div>
            <div>
                <div className={cn(
                    "text-2xl font-bold mb-0.5 tabular-nums",
                    {
                        'text-white': status === 'normal',
                        'text-amber-400': status === 'attention',
                        'text-white/30': status === 'zero',
                    }
                )}>
                    {value}
                </div>
                <div className={cn(
                    "text-xs font-medium",
                    {
                        'text-white/50': status === 'normal' || status === 'attention',
                        'text-white/20': status === 'zero',
                    }
                )}>
                    {label}
                </div>
            </div>
        </div>
    )
})
