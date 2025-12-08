import { Link, useMatches } from '@tanstack/react-router'
import { ChevronLeft, ChevronRight, Home } from 'lucide-react'
import { cn } from '@/lib/utils'
import { useTranslation } from 'react-i18next'

export interface BreadcrumbItem {
  label: string
  labelAr?: string
  href?: string
  icon?: React.ReactNode
}

interface BreadcrumbProps {
  /** Custom items - if not provided, will try to auto-generate from route */
  items?: BreadcrumbItem[]
  /** Whether to show home icon at start */
  showHome?: boolean
  /** Custom className */
  className?: string
  /** Maximum items to show (rest collapsed) */
  maxItems?: number
}

export function Breadcrumb({
  items,
  showHome = true,
  className,
  maxItems = 5,
}: BreadcrumbProps) {
  const { i18n } = useTranslation()
  const isRTL = i18n.language === 'ar'
  const Chevron = isRTL ? ChevronLeft : ChevronRight

  // If no items provided, we just show home
  const breadcrumbItems = items || []

  // Collapse middle items if too many
  const shouldCollapse = breadcrumbItems.length > maxItems
  const displayItems = shouldCollapse
    ? [
        ...breadcrumbItems.slice(0, 1),
        { label: '...', labelAr: '...' },
        ...breadcrumbItems.slice(-2),
      ]
    : breadcrumbItems

  return (
    <nav aria-label="Breadcrumb" className={cn('flex items-center', className)}>
      <ol className="flex items-center gap-1 text-sm text-slate-500">
        {/* Home */}
        {showHome && (
          <li className="flex items-center">
            <Link
              to="/"
              className="flex items-center gap-1 hover:text-slate-900 transition-colors p-1 rounded-md hover:bg-slate-100"
              aria-label={isRTL ? 'الرئيسية' : 'Home'}
            >
              <Home className="w-4 h-4" aria-hidden="true" />
            </Link>
            {breadcrumbItems.length > 0 && (
              <Chevron className="w-4 h-4 mx-1 text-slate-300" aria-hidden="true" />
            )}
          </li>
        )}

        {/* Breadcrumb Items */}
        {displayItems.map((item, index) => {
          const isLast = index === displayItems.length - 1
          const label = isRTL && item.labelAr ? item.labelAr : item.label

          return (
            <li key={index} className="flex items-center">
              {item.href && !isLast ? (
                <Link
                  to={item.href}
                  className="flex items-center gap-1 hover:text-slate-900 transition-colors px-2 py-1 rounded-md hover:bg-slate-100"
                >
                  {item.icon}
                  <span>{label}</span>
                </Link>
              ) : (
                <span
                  className={cn(
                    'flex items-center gap-1 px-2 py-1',
                    isLast ? 'text-slate-900 font-medium' : ''
                  )}
                  aria-current={isLast ? 'page' : undefined}
                >
                  {item.icon}
                  <span>{label}</span>
                </span>
              )}

              {!isLast && (
                <Chevron className="w-4 h-4 mx-1 text-slate-300" aria-hidden="true" />
              )}
            </li>
          )
        })}
      </ol>
    </nav>
  )
}

// Helper hook to generate breadcrumbs from route matches
export function useBreadcrumbs(): BreadcrumbItem[] {
  const matches = useMatches()

  return matches
    .filter((match) => match.context && typeof match.context === 'object')
    .map((match) => {
      const context = match.context as { breadcrumb?: BreadcrumbItem }
      return context.breadcrumb
    })
    .filter((item): item is BreadcrumbItem => !!item)
}
