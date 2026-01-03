/**
 * Character Count Component
 *
 * Displays character count for text inputs with warning/error states.
 */

import { cn } from '@/lib/utils'

interface CharacterCountProps {
  current: number
  max: number
  className?: string
}

export function CharacterCount({ current, max, className }: CharacterCountProps) {
  const remaining = max - current
  const isWarning = remaining <= Math.floor(max * 0.2) && remaining > 0
  const isError = remaining < 0

  return (
    <span
      className={cn(
        'text-xs transition-colors',
        isError && 'text-red-500 font-medium',
        isWarning && !isError && 'text-yellow-600',
        !isWarning && !isError && 'text-slate-400',
        className
      )}
    >
      {remaining} حرف متبقي
    </span>
  )
}
