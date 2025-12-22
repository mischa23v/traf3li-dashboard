/**
 * Smart Button Component - Odoo-style
 *
 * Displays count of related records with icon, label, and navigation
 * Features:
 * - Icon + count + label display
 * - Click navigates to filtered list
 * - Loading state
 * - Color variants based on status
 * - RTL support
 */

import { type LucideIcon, Loader2 } from 'lucide-react'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'

export interface SmartButtonProps {
  /** Icon component from lucide-react */
  icon: LucideIcon
  /** Label text (should be i18n key or translated text) */
  label: string
  /** Count of related records */
  count?: number
  /** Loading state */
  isLoading?: boolean
  /** Click handler - typically navigates to filtered list */
  onClick?: () => void
  /** Color variant based on status */
  variant?: 'default' | 'primary' | 'success' | 'warning' | 'danger' | 'info'
  /** Additional CSS classes */
  className?: string
  /** Whether button is disabled */
  disabled?: boolean
}

const variantClasses = {
  default: 'bg-slate-50 hover:bg-slate-100 border-slate-200 text-slate-700 hover:text-slate-900',
  primary: 'bg-blue-50 hover:bg-blue-100 border-blue-200 text-blue-700 hover:text-blue-900',
  success: 'bg-emerald-50 hover:bg-emerald-100 border-emerald-200 text-emerald-700 hover:text-emerald-900',
  warning: 'bg-amber-50 hover:bg-amber-100 border-amber-200 text-amber-700 hover:text-amber-900',
  danger: 'bg-red-50 hover:bg-red-100 border-red-200 text-red-700 hover:text-red-900',
  info: 'bg-sky-50 hover:bg-sky-100 border-sky-200 text-sky-700 hover:text-sky-900',
}

export function SmartButton({
  icon: Icon,
  label,
  count = 0,
  isLoading = false,
  onClick,
  variant = 'default',
  className,
  disabled = false,
}: SmartButtonProps) {
  const isClickable = !disabled && !isLoading && onClick

  return (
    <button
      onClick={isClickable ? onClick : undefined}
      disabled={disabled || isLoading}
      className={cn(
        // Base styles
        'group relative flex flex-col items-center justify-center',
        'rounded-lg border transition-all duration-200',
        'min-h-[100px] p-4',
        'focus:outline-none focus:ring-2 focus:ring-offset-2',

        // Variant colors
        variantClasses[variant],

        // Focus ring color matches variant
        variant === 'primary' && 'focus:ring-blue-500',
        variant === 'success' && 'focus:ring-emerald-500',
        variant === 'warning' && 'focus:ring-amber-500',
        variant === 'danger' && 'focus:ring-red-500',
        variant === 'info' && 'focus:ring-sky-500',
        variant === 'default' && 'focus:ring-slate-500',

        // Clickable state
        isClickable && 'cursor-pointer',
        disabled && 'opacity-50 cursor-not-allowed',

        // Hover effects when clickable
        isClickable && 'hover:shadow-md hover:scale-[1.02]',

        className
      )}
      type="button"
      role={isClickable ? 'button' : 'status'}
      aria-label={`${label}: ${count}`}
    >
      {/* Icon */}
      <div className="mb-2">
        {isLoading ? (
          <Loader2 className="h-8 w-8 animate-spin" />
        ) : (
          <Icon className="h-8 w-8 transition-transform group-hover:scale-110" />
        )}
      </div>

      {/* Count */}
      <div className="text-2xl font-bold mb-1 tabular-nums">
        {isLoading ? '-' : count.toLocaleString()}
      </div>

      {/* Label */}
      <div className="text-xs font-medium text-center leading-tight">
        {label}
      </div>

      {/* Click indicator - subtle arrow */}
      {isClickable && (
        <div className="absolute top-2 end-2 opacity-0 group-hover:opacity-100 transition-opacity">
          <svg
            className="h-3 w-3"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M9 5l7 7-7 7"
            />
          </svg>
        </div>
      )}
    </button>
  )
}
