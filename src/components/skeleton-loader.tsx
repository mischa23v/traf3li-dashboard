import { cn } from '@/lib/utils'
import { Skeleton } from '@/components/ui/skeleton'

interface SkeletonTextProps {
  lines?: number
  className?: string
}

function SkeletonText({ lines = 3, className }: SkeletonTextProps) {
  return (
    <div className={cn('space-y-2', className)}>
      {Array.from({ length: lines }).map((_, i) => (
        <Skeleton
          key={i}
          className={cn(
            'h-4',
            i === lines - 1 && lines > 1 && 'w-4/5' // Last line is shorter
          )}
        />
      ))}
    </div>
  )
}

interface SkeletonCardProps {
  className?: string
  showHeader?: boolean
  showFooter?: boolean
}

function SkeletonCard({
  className,
  showHeader = true,
  showFooter = false
}: SkeletonCardProps) {
  return (
    <div
      className={cn(
        'bg-card flex flex-col gap-6 rounded-xl border p-6 shadow-sm',
        className
      )}
    >
      {showHeader && (
        <div className="space-y-2">
          <Skeleton className="h-6 w-2/3" />
          <Skeleton className="h-4 w-1/2" />
        </div>
      )}
      <div className="space-y-3">
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-4 w-4/5" />
      </div>
      {showFooter && (
        <div className="flex items-center justify-between pt-4 border-t">
          <Skeleton className="h-8 w-24" />
          <Skeleton className="h-8 w-24" />
        </div>
      )}
    </div>
  )
}

interface SkeletonTableProps {
  rows?: number
  columns?: number
  className?: string
  showHeader?: boolean
}

function SkeletonTable({
  rows = 5,
  columns = 4,
  className,
  showHeader = true
}: SkeletonTableProps) {
  return (
    <div className={cn('w-full', className)}>
      {showHeader && (
        <div className="border-b pb-3 mb-3">
          <div className="grid gap-4" style={{ gridTemplateColumns: `repeat(${columns}, 1fr)` }}>
            {Array.from({ length: columns }).map((_, i) => (
              <Skeleton key={`header-${i}`} className="h-4" />
            ))}
          </div>
        </div>
      )}
      <div className="space-y-3">
        {Array.from({ length: rows }).map((_, rowIndex) => (
          <div
            key={rowIndex}
            className="grid gap-4"
            style={{ gridTemplateColumns: `repeat(${columns}, 1fr)` }}
          >
            {Array.from({ length: columns }).map((_, colIndex) => (
              <Skeleton
                key={`${rowIndex}-${colIndex}`}
                className="h-8"
              />
            ))}
          </div>
        ))}
      </div>
    </div>
  )
}

interface SkeletonAvatarProps {
  size?: 'sm' | 'md' | 'lg' | 'xl'
  className?: string
}

function SkeletonAvatar({ size = 'md', className }: SkeletonAvatarProps) {
  const sizeClasses = {
    sm: 'size-8',
    md: 'size-10',
    lg: 'size-12',
    xl: 'size-16'
  }

  return (
    <Skeleton
      className={cn('rounded-full', sizeClasses[size], className)}
    />
  )
}

export { SkeletonText, SkeletonCard, SkeletonTable, SkeletonAvatar }
