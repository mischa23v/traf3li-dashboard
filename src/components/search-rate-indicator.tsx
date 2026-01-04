import { useEffect, useRef, useState, useCallback } from 'react'
import { cn } from '@/lib/utils'
import { AlertTriangle, Zap } from 'lucide-react'
import { useTranslation } from 'react-i18next'

/**
 * Search Rate Indicator Component
 *
 * Gold Standard pattern from Algolia/Stripe:
 * - Proactively tracks search frequency
 * - Warns users before they hit rate limits
 * - Shows subtle indicator only when approaching limits
 *
 * @example
 * ```tsx
 * <SearchRateIndicator
 *   searchCount={searchCount}
 *   maxSearchesPerMinute={30}
 *   onRateLimitApproaching={() => console.log('Slow down!')}
 * />
 * ```
 */

interface SearchRateIndicatorProps {
  /** Current search count (optional - uses internal counter if not provided) */
  searchCount?: number
  /** Maximum searches per window (default: 30 per minute) */
  maxSearchesPerWindow?: number
  /** Time window in ms (default: 60000 - 1 minute) */
  windowMs?: number
  /** Callback when rate limit is approaching (80% of max) */
  onRateLimitApproaching?: () => void
  /** Additional CSS classes */
  className?: string
  /** Show only when rate limit is > 50% used */
  showOnlyWhenActive?: boolean
}

// Singleton rate tracker for app-wide search tracking
const searchTracker = {
  searches: [] as number[],
  cleanOld(windowMs: number) {
    const now = Date.now()
    this.searches = this.searches.filter((t) => now - t < windowMs)
  },
  record() {
    this.searches.push(Date.now())
  },
  getCount(windowMs: number) {
    this.cleanOld(windowMs)
    return this.searches.length
  },
}

/**
 * Hook to track search rate
 */
export function useSearchRateTracker(windowMs: number = 60000) {
  const [count, setCount] = useState(0)

  const recordSearch = useCallback(() => {
    searchTracker.record()
    setCount(searchTracker.getCount(windowMs))
  }, [windowMs])

  // Periodic refresh of count
  useEffect(() => {
    const interval = setInterval(() => {
      setCount(searchTracker.getCount(windowMs))
    }, 5000) // Refresh every 5 seconds

    return () => clearInterval(interval)
  }, [windowMs])

  return { count, recordSearch }
}

export function SearchRateIndicator({
  searchCount: externalCount,
  maxSearchesPerWindow = 30,
  windowMs = 60000,
  onRateLimitApproaching,
  className,
  showOnlyWhenActive = true,
}: SearchRateIndicatorProps) {
  const { t, i18n } = useTranslation()
  const { count: internalCount } = useSearchRateTracker(windowMs)
  const hasNotified = useRef(false)

  const searchCount = externalCount ?? internalCount
  const percentageUsed = (searchCount / maxSearchesPerWindow) * 100

  // Trigger callback when approaching limit
  useEffect(() => {
    if (percentageUsed >= 80 && !hasNotified.current) {
      hasNotified.current = true
      onRateLimitApproaching?.()
    } else if (percentageUsed < 50) {
      hasNotified.current = false
    }
  }, [percentageUsed, onRateLimitApproaching])

  // Don't show if usage is low and showOnlyWhenActive is true
  if (showOnlyWhenActive && percentageUsed < 50) {
    return null
  }

  // Determine status and styling
  const getStatus = () => {
    if (percentageUsed >= 90) {
      return {
        level: 'critical',
        color: 'bg-red-100 text-red-700 border-red-200',
        icon: AlertTriangle,
        pulse: true,
        message: i18n.language === 'ar'
          ? 'تباطأ! الحد الأقصى قريب'
          : 'Slow down! Rate limit approaching',
      }
    }
    if (percentageUsed >= 70) {
      return {
        level: 'warning',
        color: 'bg-amber-100 text-amber-700 border-amber-200',
        icon: AlertTriangle,
        pulse: false,
        message: i18n.language === 'ar'
          ? 'عمليات بحث متكررة'
          : 'High search frequency',
      }
    }
    return {
      level: 'normal',
      color: 'bg-slate-100 text-slate-600 border-slate-200',
      icon: Zap,
      pulse: false,
      message: i18n.language === 'ar'
        ? `${searchCount}/${maxSearchesPerWindow} بحث`
        : `${searchCount}/${maxSearchesPerWindow} searches`,
    }
  }

  const status = getStatus()
  const Icon = status.icon

  return (
    <div
      className={cn(
        'inline-flex items-center gap-1.5 px-2 py-1 rounded-lg border text-xs font-medium transition-all duration-300',
        status.color,
        status.pulse && 'animate-pulse',
        className
      )}
      title={status.message}
      role="status"
      aria-live="polite"
    >
      <Icon className="w-3 h-3" />
      <span className="hidden sm:inline">{status.message}</span>
      <span className="sm:hidden">{searchCount}/{maxSearchesPerWindow}</span>
    </div>
  )
}

export default SearchRateIndicator
