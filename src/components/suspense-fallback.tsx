import { cn } from '@/lib/utils'
import { SkeletonCard, SkeletonText } from './skeleton-loader'

interface SuspenseFallbackProps {
  /**
   * The type of fallback to display
   * @default 'default'
   */
  type?: 'default' | 'card' | 'list' | 'grid'
  /**
   * Optional message to display
   */
  message?: string
  /**
   * Custom className
   */
  className?: string
}

function SuspenseFallback({
  type = 'default',
  message,
  className
}: SuspenseFallbackProps) {
  return (
    <div
      data-slot="suspense-fallback"
      className={cn('w-full', className)}
      role="status"
      aria-live="polite"
      aria-busy="true"
    >
      {message && (
        <div className="mb-4 text-sm text-muted-foreground font-medium">
          {message}
        </div>
      )}

      {type === 'default' && (
        <div className="space-y-4">
          <SkeletonText lines={5} />
        </div>
      )}

      {type === 'card' && (
        <SkeletonCard showHeader showFooter />
      )}

      {type === 'list' && (
        <div className="space-y-3">
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="flex items-center gap-3 p-4 border rounded-lg">
              <SkeletonText lines={2} className="flex-1" />
            </div>
          ))}
        </div>
      )}

      {type === 'grid' && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {Array.from({ length: 6 }).map((_, i) => (
            <SkeletonCard key={i} showHeader />
          ))}
        </div>
      )}

      <span className="sr-only">Loading content...</span>
    </div>
  )
}

export { SuspenseFallback }
export type { SuspenseFallbackProps }
