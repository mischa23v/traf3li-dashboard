import { Loader2 } from 'lucide-react'
import { cn } from '@/lib/utils'

interface LoadingOverlayProps {
  /**
   * Whether the overlay is visible
   */
  visible?: boolean
  /**
   * Optional loading text to display below the spinner
   */
  text?: string
  /**
   * Whether the overlay should be full screen or positioned relative to parent
   * @default 'fullscreen'
   */
  mode?: 'fullscreen' | 'container'
  /**
   * Custom className for the overlay
   */
  className?: string
  /**
   * Spinner size
   * @default 'md'
   */
  spinnerSize?: 'sm' | 'md' | 'lg'
}

function LoadingOverlay({
  visible = true,
  text,
  mode = 'fullscreen',
  className,
  spinnerSize = 'md'
}: LoadingOverlayProps) {
  if (!visible) return null

  const spinnerSizes = {
    sm: 'size-6',
    md: 'size-8',
    lg: 'size-12'
  }

  return (
    <div
      data-slot="loading-overlay"
      className={cn(
        'z-50 flex items-center justify-center bg-background/80 backdrop-blur-sm',
        mode === 'fullscreen' ? 'fixed inset-0' : 'absolute inset-0',
        className
      )}
      role="status"
      aria-live="polite"
      aria-busy="true"
    >
      <div className="flex flex-col items-center gap-4">
        <Loader2
          className={cn('animate-spin text-primary', spinnerSizes[spinnerSize])}
          aria-hidden="true"
        />
        {text && (
          <p className="text-sm text-muted-foreground font-medium">
            {text}
          </p>
        )}
        <span className="sr-only">Loading...</span>
      </div>
    </div>
  )
}

export { LoadingOverlay }
export type { LoadingOverlayProps }
