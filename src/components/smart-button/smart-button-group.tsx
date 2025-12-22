/**
 * Smart Button Group Component
 *
 * Container for multiple smart buttons with responsive layout
 * Features:
 * - Horizontal layout on desktop
 * - Vertical/grid layout on mobile
 * - Consistent spacing
 * - RTL support
 */

import { cn } from '@/lib/utils'
import type { ReactNode } from 'react'

export interface SmartButtonGroupProps {
  /** Child SmartButton components */
  children: ReactNode
  /** Additional CSS classes */
  className?: string
  /** Layout variant */
  layout?: 'auto' | 'horizontal' | 'grid-2' | 'grid-3' | 'grid-4'
  /** Title for the button group */
  title?: string
}

const layoutClasses = {
  // Auto adapts based on number of buttons
  auto: 'grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4',
  // Always horizontal (scrollable on mobile)
  horizontal: 'flex flex-nowrap overflow-x-auto gap-4 pb-2',
  // Fixed grid layouts
  'grid-2': 'grid grid-cols-1 sm:grid-cols-2 gap-4',
  'grid-3': 'grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4',
  'grid-4': 'grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4',
}

export function SmartButtonGroup({
  children,
  className,
  layout = 'auto',
  title,
}: SmartButtonGroupProps) {
  return (
    <div className={cn('w-full', className)}>
      {/* Optional Title */}
      {title && (
        <h3 className="text-sm font-semibold text-slate-700 dark:text-slate-300 mb-3">
          {title}
        </h3>
      )}

      {/* Button Container */}
      <div
        className={cn(
          layoutClasses[layout],
          // Horizontal layout specific styles
          layout === 'horizontal' && 'scrollbar-thin scrollbar-thumb-slate-300 scrollbar-track-transparent'
        )}
      >
        {children}
      </div>
    </div>
  )
}
