import { Badge } from '@/components/ui/badge'
import { Bell } from 'lucide-react'
import { usePendingApprovalsCount } from '@/hooks/useFinance'
import { cn } from '@/lib/utils'

interface PendingApprovalsBadgeProps {
  className?: string
  showIcon?: boolean
  showLabel?: boolean
}

/**
 * Badge component that displays pending invoice approvals count
 * Updates automatically every 30 seconds
 * Usage: <PendingApprovalsBadge /> in navigation or sidebar
 */
export function PendingApprovalsBadge({
  className,
  showIcon = true,
  showLabel = false,
}: PendingApprovalsBadgeProps) {
  const { data, isLoading } = usePendingApprovalsCount()

  const count = data?.count || 0

  // Don't show badge if no pending approvals
  if (count === 0 && !isLoading) {
    return null
  }

  return (
    <Badge
      className={cn(
        'bg-amber-500 text-white rounded-full animate-pulse',
        className
      )}
    >
      <div className="flex items-center gap-1">
        {showIcon && <Bell className="w-3 h-3" />}
        {showLabel && <span className="text-xs">قيد المراجعة:</span>}
        <span className="font-bold">{isLoading ? '...' : count}</span>
      </div>
    </Badge>
  )
}

/**
 * Inline badge for use in navigation links
 */
export function InlineApprovalsBadge({ className }: { className?: string }) {
  const { data } = usePendingApprovalsCount()
  const count = data?.count || 0

  if (count === 0) return null

  return (
    <span
      className={cn(
        'inline-flex items-center justify-center w-5 h-5 text-xs font-bold text-white bg-amber-500 rounded-full',
        className
      )}
    >
      {count}
    </span>
  )
}
