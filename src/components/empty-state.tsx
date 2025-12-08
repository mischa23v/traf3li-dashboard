import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import {
  FileText,
  Users,
  Briefcase,
  Calendar,
  Mail,
  Search,
  FolderOpen,
  AlertCircle,
  type LucideIcon,
} from 'lucide-react'
import { useTranslation } from 'react-i18next'

// Preset icons for common empty states
const PRESET_ICONS: Record<string, LucideIcon> = {
  document: FileText,
  users: Users,
  cases: Briefcase,
  calendar: Calendar,
  mail: Mail,
  search: Search,
  folder: FolderOpen,
  error: AlertCircle,
}

export interface EmptyStateProps {
  /** Icon to display - can be a preset name or custom LucideIcon */
  icon?: keyof typeof PRESET_ICONS | LucideIcon
  /** Main title */
  title: string
  /** Description text */
  description?: string
  /** Primary action button text */
  actionLabel?: string
  /** Primary action click handler */
  onAction?: () => void
  /** Secondary action button text */
  secondaryActionLabel?: string
  /** Secondary action click handler */
  onSecondaryAction?: () => void
  /** Custom className */
  className?: string
  /** Size variant */
  size?: 'sm' | 'md' | 'lg'
  /** Show as error state */
  variant?: 'default' | 'error' | 'search'
}

export function EmptyState({
  icon = 'folder',
  title,
  description,
  actionLabel,
  onAction,
  secondaryActionLabel,
  onSecondaryAction,
  className,
  size = 'md',
  variant = 'default',
}: EmptyStateProps) {
  const { t } = useTranslation()

  // Resolve icon
  const IconComponent =
    typeof icon === 'string' ? PRESET_ICONS[icon] || FolderOpen : icon

  const sizeClasses = {
    sm: {
      container: 'py-8',
      icon: 'w-10 h-10',
      iconWrapper: 'w-16 h-16',
      title: 'text-base',
      description: 'text-sm',
    },
    md: {
      container: 'py-12',
      icon: 'w-12 h-12',
      iconWrapper: 'w-20 h-20',
      title: 'text-lg',
      description: 'text-sm',
    },
    lg: {
      container: 'py-16',
      icon: 'w-16 h-16',
      iconWrapper: 'w-24 h-24',
      title: 'text-xl',
      description: 'text-base',
    },
  }

  const variantClasses = {
    default: {
      iconBg: 'bg-slate-100',
      iconColor: 'text-slate-400',
    },
    error: {
      iconBg: 'bg-red-50',
      iconColor: 'text-red-400',
    },
    search: {
      iconBg: 'bg-blue-50',
      iconColor: 'text-blue-400',
    },
  }

  const sizes = sizeClasses[size]
  const variants = variantClasses[variant]

  return (
    <div
      className={cn(
        'flex flex-col items-center justify-center text-center',
        sizes.container,
        className
      )}
    >
      {/* Icon */}
      <div
        className={cn(
          'rounded-full flex items-center justify-center mb-4',
          sizes.iconWrapper,
          variants.iconBg
        )}
      >
        <IconComponent
          className={cn(sizes.icon, variants.iconColor)}
          aria-hidden="true"
        />
      </div>

      {/* Title */}
      <h3
        className={cn(
          'font-semibold text-slate-900 mb-2',
          sizes.title
        )}
      >
        {title}
      </h3>

      {/* Description */}
      {description && (
        <p
          className={cn(
            'text-slate-500 max-w-sm mb-6',
            sizes.description
          )}
        >
          {description}
        </p>
      )}

      {/* Actions */}
      {(actionLabel || secondaryActionLabel) && (
        <div className="flex items-center gap-3">
          {actionLabel && onAction && (
            <Button onClick={onAction} size={size === 'sm' ? 'sm' : 'default'}>
              {actionLabel}
            </Button>
          )}
          {secondaryActionLabel && onSecondaryAction && (
            <Button
              variant="outline"
              onClick={onSecondaryAction}
              size={size === 'sm' ? 'sm' : 'default'}
            >
              {secondaryActionLabel}
            </Button>
          )}
        </div>
      )}
    </div>
  )
}

// Pre-configured empty states for common use cases
export function NoResultsState({
  searchQuery,
  onClear,
}: {
  searchQuery?: string
  onClear?: () => void
}) {
  const { t, i18n } = useTranslation()
  const isArabic = i18n.language === 'ar'

  return (
    <EmptyState
      icon="search"
      variant="search"
      title={isArabic ? 'لا توجد نتائج' : 'No results found'}
      description={
        searchQuery
          ? isArabic
            ? `لم يتم العثور على نتائج لـ "${searchQuery}"`
            : `No results found for "${searchQuery}"`
          : isArabic
            ? 'حاول تعديل معايير البحث'
            : 'Try adjusting your search criteria'
      }
      actionLabel={onClear ? (isArabic ? 'مسح البحث' : 'Clear search') : undefined}
      onAction={onClear}
    />
  )
}

export function NoDataState({
  entityName,
  onAdd,
}: {
  entityName: string
  onAdd?: () => void
}) {
  const { i18n } = useTranslation()
  const isArabic = i18n.language === 'ar'

  return (
    <EmptyState
      icon="folder"
      title={isArabic ? `لا يوجد ${entityName}` : `No ${entityName}`}
      description={
        isArabic
          ? `لم يتم إضافة ${entityName} بعد`
          : `No ${entityName} have been added yet`
      }
      actionLabel={onAdd ? (isArabic ? `إضافة ${entityName}` : `Add ${entityName}`) : undefined}
      onAction={onAdd}
    />
  )
}

export function ErrorState({
  message,
  onRetry,
}: {
  message?: string
  onRetry?: () => void
}) {
  const { i18n } = useTranslation()
  const isArabic = i18n.language === 'ar'

  return (
    <EmptyState
      icon="error"
      variant="error"
      title={isArabic ? 'حدث خطأ' : 'Something went wrong'}
      description={message || (isArabic ? 'يرجى المحاولة مرة أخرى' : 'Please try again')}
      actionLabel={onRetry ? (isArabic ? 'إعادة المحاولة' : 'Try again') : undefined}
      onAction={onRetry}
    />
  )
}
