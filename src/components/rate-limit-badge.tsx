import { cn } from '@/lib/utils'
import { AxiosResponseHeaders, RawAxiosResponseHeaders } from 'axios'

export interface RateLimitBadgeProps {
  /** Axios response headers containing rate limit information */
  headers: RawAxiosResponseHeaders | AxiosResponseHeaders
  /** Optional className for additional styling */
  className?: string
}

/**
 * RateLimitBadge Component
 *
 * Displays rate limit status from API response headers.
 * Shows remaining/limit requests with color-coded badge:
 * - Green: > 50% remaining
 * - Yellow/Amber: 20-50% remaining
 * - Red: < 20% remaining
 *
 * Returns null if no rate limit headers are present.
 *
 * @example
 * ```tsx
 * <RateLimitBadge headers={response.headers} />
 * // Displays: "45/100 requests" in green
 * ```
 */
export function RateLimitBadge({ headers, className }: RateLimitBadgeProps) {
  // Extract rate limit headers
  const remaining = headers['x-ratelimit-remaining']
  const limit = headers['x-ratelimit-limit']

  // Return null if rate limit headers are not present
  if (!remaining || !limit) {
    return null
  }

  // Parse values to numbers
  const remainingNum = parseInt(remaining as string, 10)
  const limitNum = parseInt(limit as string, 10)

  // Calculate percentage remaining
  const percentageRemaining = (remainingNum / limitNum) * 100

  // Determine color based on percentage thresholds
  const getColorClasses = () => {
    if (percentageRemaining > 50) {
      // Green: > 50% remaining
      return 'bg-emerald-100 text-emerald-700 border-emerald-200'
    } else if (percentageRemaining >= 20) {
      // Yellow/Amber: 20-50% remaining
      return 'bg-amber-100 text-amber-700 border-amber-200'
    } else {
      // Red: < 20% remaining
      return 'bg-red-100 text-red-700 border-red-200'
    }
  }

  return (
    <span
      className={cn(
        'inline-flex items-center justify-center rounded-md border px-2 py-0.5 text-xs font-medium whitespace-nowrap transition-colors',
        getColorClasses(),
        className
      )}
      title={`Rate limit: ${remainingNum} requests remaining out of ${limitNum}`}
    >
      {remainingNum}/{limitNum} requests
    </span>
  )
}
