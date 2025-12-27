/**
 * Activity Timeline Component
 * Displays a vertical timeline of CRM activities with filtering and pagination
 */

import { useState, useMemo, memo } from 'react'
import { useTranslation } from 'react-i18next'
import { formatDistanceToNow, format } from 'date-fns'
import { ar, enUS } from 'date-fns/locale'
import {
  Phone,
  Mail,
  Calendar,
  CheckSquare,
  StickyNote,
  MessageSquare,
  ChevronDown,
  ChevronUp,
  Filter,
  Loader2,
  Building,
  User,
  ExternalLink,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Skeleton } from '@/components/ui/skeleton'
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuCheckboxItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
  DropdownMenuLabel,
} from '@/components/ui/dropdown-menu'
import { EmptyState } from '@/components/empty-state'
import type { CrmActivity, ActivityType, ActivityEntityType } from '@/types/crm'
import { Link } from '@tanstack/react-router'
import { ROUTES } from '@/constants/routes'

// ==================== TYPES ====================

export interface ActivityTimelineProps {
  activities: CrmActivity[]
  isLoading?: boolean
  hasMore?: boolean
  onLoadMore?: () => void
  onActivityClick?: (activity: CrmActivity) => void
  filterTypes?: string[]
  showFilter?: boolean
  emptyMessage?: string
  className?: string
}

// ==================== ICON & COLOR MAPPING ====================

const ACTIVITY_ICONS: Record<ActivityType, React.ComponentType<{ className?: string }>> = {
  call: Phone,
  email: Mail,
  sms: MessageSquare,
  whatsapp: MessageSquare,
  meeting: Calendar,
  note: StickyNote,
  task: CheckSquare,
  document: StickyNote,
  proposal: StickyNote,
  status_change: CheckSquare,
  stage_change: CheckSquare,
  lead_created: User,
  lead_converted: CheckSquare,
}

// Activity type colors as per specification
const ACTIVITY_COLORS: Record<
  ActivityType,
  { bg: string; text: string; iconBg: string; iconText: string; line: string }
> = {
  call: {
    bg: 'bg-blue-50',
    text: 'text-blue-700',
    iconBg: 'bg-blue-100',
    iconText: 'text-blue-600',
    line: 'bg-blue-400',
  },
  email: {
    bg: 'bg-green-50',
    text: 'text-green-700',
    iconBg: 'bg-green-100',
    iconText: 'text-green-600',
    line: 'bg-green-400',
  },
  sms: {
    bg: 'bg-cyan-50',
    text: 'text-cyan-700',
    iconBg: 'bg-cyan-100',
    iconText: 'text-cyan-600',
    line: 'bg-cyan-400',
  },
  whatsapp: {
    bg: 'bg-green-50',
    text: 'text-green-700',
    iconBg: 'bg-green-100',
    iconText: 'text-green-600',
    line: 'bg-green-500', // WhatsApp green
  },
  meeting: {
    bg: 'bg-purple-50',
    text: 'text-purple-700',
    iconBg: 'bg-purple-100',
    iconText: 'text-purple-600',
    line: 'bg-purple-400',
  },
  note: {
    bg: 'bg-gray-50',
    text: 'text-gray-700',
    iconBg: 'bg-gray-100',
    iconText: 'text-gray-600',
    line: 'bg-gray-400',
  },
  task: {
    bg: 'bg-orange-50',
    text: 'text-orange-700',
    iconBg: 'bg-orange-100',
    iconText: 'text-orange-600',
    line: 'bg-orange-400',
  },
  document: {
    bg: 'bg-gray-50',
    text: 'text-gray-700',
    iconBg: 'bg-gray-100',
    iconText: 'text-gray-600',
    line: 'bg-gray-400',
  },
  proposal: {
    bg: 'bg-orange-50',
    text: 'text-orange-700',
    iconBg: 'bg-orange-100',
    iconText: 'text-orange-600',
    line: 'bg-orange-400',
  },
  status_change: {
    bg: 'bg-slate-50',
    text: 'text-slate-700',
    iconBg: 'bg-slate-100',
    iconText: 'text-slate-600',
    line: 'bg-slate-400',
  },
  stage_change: {
    bg: 'bg-indigo-50',
    text: 'text-indigo-700',
    iconBg: 'bg-indigo-100',
    iconText: 'text-indigo-600',
    line: 'bg-indigo-400',
  },
  lead_created: {
    bg: 'bg-teal-50',
    text: 'text-teal-700',
    iconBg: 'bg-teal-100',
    iconText: 'text-teal-600',
    line: 'bg-teal-400',
  },
  lead_converted: {
    bg: 'bg-emerald-50',
    text: 'text-emerald-700',
    iconBg: 'bg-emerald-100',
    iconText: 'text-emerald-600',
    line: 'bg-emerald-400',
  },
}

// Activity type labels (Arabic)
const ACTIVITY_LABELS_AR: Record<ActivityType, string> = {
  call: 'مكالمة',
  email: 'بريد إلكتروني',
  sms: 'رسالة نصية',
  whatsapp: 'واتساب',
  meeting: 'اجتماع',
  note: 'ملاحظة',
  task: 'مهمة',
  document: 'مستند',
  proposal: 'عرض سعر',
  status_change: 'تغيير الحالة',
  stage_change: 'تغيير المرحلة',
  lead_created: 'عميل محتمل جديد',
  lead_converted: 'تحويل العميل',
}

// Activity type labels (English)
const ACTIVITY_LABELS_EN: Record<ActivityType, string> = {
  call: 'Call',
  email: 'Email',
  sms: 'SMS',
  whatsapp: 'WhatsApp',
  meeting: 'Meeting',
  note: 'Note',
  task: 'Task',
  document: 'Document',
  proposal: 'Proposal',
  status_change: 'Status Change',
  stage_change: 'Stage Change',
  lead_created: 'Lead Created',
  lead_converted: 'Lead Converted',
}

// Entity type labels
const ENTITY_TYPE_LABELS_AR: Record<ActivityEntityType, string> = {
  lead: 'عميل محتمل',
  client: 'عميل',
  contact: 'جهة اتصال',
  case: 'قضية',
  organization: 'منظمة',
}

const ENTITY_TYPE_LABELS_EN: Record<ActivityEntityType, string> = {
  lead: 'Lead',
  client: 'Client',
  contact: 'Contact',
  case: 'Case',
  organization: 'Organization',
}

// ==================== HELPER FUNCTIONS ====================

function getEntityIcon(entityType: ActivityEntityType) {
  switch (entityType) {
    case 'organization':
      return Building
    case 'lead':
    case 'client':
    case 'contact':
      return User
    default:
      return User
  }
}

function getEntityRoute(entityType: ActivityEntityType, entityId: string): string {
  switch (entityType) {
    case 'lead':
      return `/dashboard/crm/leads/${entityId}`
    case 'client':
      return `/dashboard/clients/${entityId}`
    case 'contact':
      return `/dashboard/contacts/${entityId}`
    case 'case':
      return `/dashboard/cases/${entityId}`
    case 'organization':
      return `/dashboard/organizations/${entityId}`
    default:
      return '#'
  }
}

// ==================== ACTIVITY ITEM COMPONENT ====================

interface ActivityItemProps {
  activity: CrmActivity
  isLast: boolean
  onClick?: (activity: CrmActivity) => void
}

const ActivityItem = memo(function ActivityItem({
  activity,
  isLast,
  onClick,
}: ActivityItemProps) {
  const { t, i18n } = useTranslation()
  const isArabic = i18n.language === 'ar'
  const [isExpanded, setIsExpanded] = useState(false)

  const Icon = ACTIVITY_ICONS[activity.type]
  const colors = ACTIVITY_COLORS[activity.type]
  const EntityIcon = getEntityIcon(activity.entityType)
  const dateLocale = isArabic ? ar : enUS

  const activityLabel = isArabic
    ? ACTIVITY_LABELS_AR[activity.type]
    : ACTIVITY_LABELS_EN[activity.type]

  const entityTypeLabel = isArabic
    ? ENTITY_TYPE_LABELS_AR[activity.entityType]
    : ENTITY_TYPE_LABELS_EN[activity.entityType]

  // Truncate description for preview
  const descriptionPreview = activity.description
    ? activity.description.length > 120
      ? `${activity.description.substring(0, 120)}...`
      : activity.description
    : null

  const hasExpandableContent =
    (activity.description && activity.description.length > 120) ||
    activity.callData ||
    activity.emailData ||
    activity.meetingData ||
    activity.taskData

  const handleClick = () => {
    if (onClick) {
      onClick(activity)
    }
  }

  return (
    <div className="flex gap-4 group relative">
      {/* Timeline Line & Icon */}
      <div className="flex flex-col items-center">
        <div
          className={cn(
            'flex items-center justify-center w-10 h-10 rounded-full flex-shrink-0 transition-transform group-hover:scale-110',
            colors.iconBg
          )}
        >
          <Icon className={cn('w-5 h-5', colors.iconText)} aria-hidden="true" />
        </div>
        {!isLast && (
          <div
            className={cn('w-0.5 flex-1 my-2 min-h-[40px]', colors.line)}
            aria-hidden="true"
          />
        )}
      </div>

      {/* Content */}
      <div className="flex-1 pb-8">
        <Collapsible open={isExpanded} onOpenChange={setIsExpanded}>
          <div
            className={cn(
              'rounded-lg border-2 transition-all',
              colors.bg,
              'hover:shadow-md cursor-pointer'
            )}
            onClick={handleClick}
          >
            {/* Header */}
            <div className="p-4">
              <div className="flex items-start justify-between gap-3">
                <div className="flex-1 min-w-0">
                  {/* Type Badge */}
                  <Badge
                    variant="secondary"
                    className={cn('mb-2', colors.text, colors.bg)}
                  >
                    {activityLabel}
                  </Badge>

                  {/* Title */}
                  <h4 className="font-semibold text-slate-900 mb-1 leading-tight">
                    {activity.title || activityLabel}
                  </h4>

                  {/* Description Preview */}
                  {descriptionPreview && (
                    <p className="text-sm text-slate-600 mb-2 leading-relaxed">
                      {descriptionPreview}
                    </p>
                  )}

                  {/* Meta Info Row */}
                  <div className="flex flex-wrap items-center gap-x-4 gap-y-2 text-xs text-slate-500">
                    {/* Date/Time */}
                    <span className="flex items-center gap-1">
                      <Calendar className="w-3 h-3" aria-hidden="true" />
                      {formatDistanceToNow(
                        new Date(activity.scheduledAt || activity.createdAt),
                        {
                          addSuffix: true,
                          locale: dateLocale,
                        }
                      )}
                    </span>

                    {/* Status */}
                    {activity.status && (
                      <Badge
                        variant={
                          activity.status === 'completed'
                            ? 'default'
                            : activity.status === 'cancelled'
                            ? 'secondary'
                            : 'outline'
                        }
                        className="text-xs"
                      >
                        {isArabic
                          ? activity.status === 'completed'
                            ? 'مكتمل'
                            : activity.status === 'scheduled'
                            ? 'مجدول'
                            : activity.status === 'in_progress'
                            ? 'قيد التنفيذ'
                            : 'ملغي'
                          : activity.status}
                      </Badge>
                    )}
                  </div>
                </div>

                {/* User Avatar */}
                {activity.performedBy && (
                  <div className="flex flex-col items-center gap-1 flex-shrink-0">
                    <Avatar className="w-10 h-10 border-2 border-white shadow-sm">
                      <AvatarImage
                        src={activity.performedBy.avatar}
                        alt={`${activity.performedBy.firstName} ${activity.performedBy.lastName}`}
                      />
                      <AvatarFallback className="text-xs font-medium">
                        {activity.performedBy.firstName?.[0]}
                        {activity.performedBy.lastName?.[0]}
                      </AvatarFallback>
                    </Avatar>
                    <span className="text-xs text-slate-600 text-center max-w-[80px] truncate">
                      {activity.performedBy.firstName}
                    </span>
                  </div>
                )}
              </div>

              {/* Related Entity Link */}
              {activity.entityName && (
                <Link
                  to={getEntityRoute(activity.entityType, activity.entityId)}
                  className="inline-flex items-center gap-2 mt-3 text-sm text-slate-600 hover:text-slate-900 transition-colors"
                  onClick={(e) => e.stopPropagation()}
                >
                  <EntityIcon className="w-4 h-4" aria-hidden="true" />
                  <span className="font-medium">{entityTypeLabel}:</span>
                  <span className="underline decoration-dotted">
                    {activity.entityName}
                  </span>
                  <ExternalLink className="w-3 h-3" aria-hidden="true" />
                </Link>
              )}

              {/* Expand/Collapse Button */}
              {hasExpandableContent && (
                <CollapsibleTrigger asChild>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="w-full mt-3 text-xs"
                    onClick={(e) => {
                      e.stopPropagation()
                      setIsExpanded(!isExpanded)
                    }}
                  >
                    {isExpanded ? (
                      <>
                        <ChevronUp className="w-4 h-4 me-1" />
                        {isArabic ? 'عرض أقل' : 'Show Less'}
                      </>
                    ) : (
                      <>
                        <ChevronDown className="w-4 h-4 me-1" />
                        {isArabic ? 'عرض المزيد' : 'Show More'}
                      </>
                    )}
                  </Button>
                </CollapsibleTrigger>
              )}
            </div>

            {/* Expandable Content */}
            <CollapsibleContent>
              <div className="px-4 pb-4 pt-0 border-t border-slate-200/50 mt-2">
                {/* Full Description */}
                {activity.description && (
                  <div className="mt-3">
                    <p className="text-sm text-slate-700 leading-relaxed whitespace-pre-wrap">
                      {activity.description}
                    </p>
                  </div>
                )}

                {/* Call Data */}
                {activity.callData && (
                  <div className="mt-3 space-y-2 text-sm">
                    <div className="flex items-center gap-2">
                      <Phone className="w-4 h-4 text-slate-400" />
                      <span className="font-medium">
                        {isArabic ? 'الاتجاه:' : 'Direction:'}
                      </span>
                      <span>
                        {activity.callData.direction === 'inbound'
                          ? isArabic
                            ? 'وارد'
                            : 'Inbound'
                          : isArabic
                          ? 'صادر'
                          : 'Outbound'}
                      </span>
                    </div>
                    {activity.callData.phoneNumber && (
                      <div className="flex items-center gap-2">
                        <span className="font-medium">
                          {isArabic ? 'الرقم:' : 'Number:'}
                        </span>
                        <span dir="ltr">{activity.callData.phoneNumber}</span>
                      </div>
                    )}
                    {activity.callData.duration && (
                      <div className="flex items-center gap-2">
                        <span className="font-medium">
                          {isArabic ? 'المدة:' : 'Duration:'}
                        </span>
                        <span>
                          {Math.floor(activity.callData.duration / 60)}
                          {isArabic ? ' دقيقة' : 'm'}{' '}
                          {activity.callData.duration % 60}
                          {isArabic ? ' ثانية' : 's'}
                        </span>
                      </div>
                    )}
                    {activity.callData.outcome && (
                      <div className="flex items-center gap-2">
                        <span className="font-medium">
                          {isArabic ? 'النتيجة:' : 'Outcome:'}
                        </span>
                        <span>{activity.callData.outcome}</span>
                      </div>
                    )}
                  </div>
                )}

                {/* Email Data */}
                {activity.emailData && (
                  <div className="mt-3 space-y-2 text-sm">
                    {activity.emailData.subject && (
                      <div className="flex items-start gap-2">
                        <span className="font-medium whitespace-nowrap">
                          {isArabic ? 'الموضوع:' : 'Subject:'}
                        </span>
                        <span>{activity.emailData.subject}</span>
                      </div>
                    )}
                    {activity.emailData.from && (
                      <div className="flex items-center gap-2">
                        <span className="font-medium">
                          {isArabic ? 'من:' : 'From:'}
                        </span>
                        <span dir="ltr">{activity.emailData.from}</span>
                      </div>
                    )}
                    {activity.emailData.to && activity.emailData.to.length > 0 && (
                      <div className="flex items-start gap-2">
                        <span className="font-medium whitespace-nowrap">
                          {isArabic ? 'إلى:' : 'To:'}
                        </span>
                        <span dir="ltr">{activity.emailData.to.join(', ')}</span>
                      </div>
                    )}
                  </div>
                )}

                {/* Meeting Data */}
                {activity.meetingData && (
                  <div className="mt-3 space-y-2 text-sm">
                    {activity.meetingData.meetingType && (
                      <div className="flex items-center gap-2">
                        <span className="font-medium">
                          {isArabic ? 'النوع:' : 'Type:'}
                        </span>
                        <span>
                          {activity.meetingData.meetingType === 'in_person'
                            ? isArabic
                              ? 'حضوري'
                              : 'In Person'
                            : activity.meetingData.meetingType === 'video'
                            ? isArabic
                              ? 'فيديو'
                              : 'Video'
                            : activity.meetingData.meetingType === 'phone'
                            ? isArabic
                              ? 'هاتف'
                              : 'Phone'
                            : activity.meetingData.meetingType}
                        </span>
                      </div>
                    )}
                    {activity.meetingData.location && (
                      <div className="flex items-center gap-2">
                        <span className="font-medium">
                          {isArabic ? 'المكان:' : 'Location:'}
                        </span>
                        <span>{activity.meetingData.location}</span>
                      </div>
                    )}
                    {activity.meetingData.scheduledStart && (
                      <div className="flex items-center gap-2">
                        <span className="font-medium">
                          {isArabic ? 'الوقت:' : 'Time:'}
                        </span>
                        <span dir="ltr">
                          {format(
                            new Date(activity.meetingData.scheduledStart),
                            'PPp',
                            { locale: dateLocale }
                          )}
                        </span>
                      </div>
                    )}
                  </div>
                )}

                {/* Task Data */}
                {activity.taskData && (
                  <div className="mt-3 space-y-2 text-sm">
                    {activity.taskData.dueDate && (
                      <div className="flex items-center gap-2">
                        <span className="font-medium">
                          {isArabic ? 'تاريخ الاستحقاق:' : 'Due Date:'}
                        </span>
                        <span dir="ltr">
                          {format(new Date(activity.taskData.dueDate), 'PP', {
                            locale: dateLocale,
                          })}
                        </span>
                      </div>
                    )}
                    {activity.taskData.priority && (
                      <div className="flex items-center gap-2">
                        <span className="font-medium">
                          {isArabic ? 'الأولوية:' : 'Priority:'}
                        </span>
                        <Badge
                          variant={
                            activity.taskData.priority === 'urgent'
                              ? 'destructive'
                              : activity.taskData.priority === 'high'
                              ? 'default'
                              : 'secondary'
                          }
                        >
                          {isArabic
                            ? activity.taskData.priority === 'urgent'
                              ? 'عاجل'
                              : activity.taskData.priority === 'high'
                              ? 'عالية'
                              : activity.taskData.priority === 'normal'
                              ? 'عادية'
                              : 'منخفضة'
                            : activity.taskData.priority}
                        </Badge>
                      </div>
                    )}
                  </div>
                )}

                {/* Tags */}
                {activity.tags && activity.tags.length > 0 && (
                  <div className="mt-3 flex flex-wrap gap-2">
                    {activity.tags.map((tag, index) => (
                      <Badge key={index} variant="outline" className="text-xs">
                        {tag}
                      </Badge>
                    ))}
                  </div>
                )}

                {/* Outcome Notes */}
                {activity.outcomeNotes && (
                  <div className="mt-3 p-3 bg-slate-50 rounded-md">
                    <p className="text-sm font-medium text-slate-700 mb-1">
                      {isArabic ? 'ملاحظات النتيجة:' : 'Outcome Notes:'}
                    </p>
                    <p className="text-sm text-slate-600 whitespace-pre-wrap">
                      {activity.outcomeNotes}
                    </p>
                  </div>
                )}
              </div>
            </CollapsibleContent>
          </div>
        </Collapsible>
      </div>
    </div>
  )
})

// ==================== LOADING SKELETON ====================

function ActivitySkeleton() {
  return (
    <div className="flex gap-4">
      <div className="flex flex-col items-center">
        <Skeleton className="w-10 h-10 rounded-full" />
        <Skeleton className="w-0.5 h-20 my-2" />
      </div>
      <div className="flex-1 pb-8">
        <div className="p-4 border-2 rounded-lg bg-slate-50">
          <Skeleton className="h-5 w-20 mb-2" />
          <Skeleton className="h-6 w-3/4 mb-2" />
          <Skeleton className="h-4 w-full mb-1" />
          <Skeleton className="h-4 w-2/3" />
        </div>
      </div>
    </div>
  )
}

// ==================== FILTER COMPONENT ====================

interface FilterProps {
  selectedTypes: Set<ActivityType>
  onFilterChange: (types: Set<ActivityType>) => void
}

const FilterDropdown = memo(function FilterDropdown({
  selectedTypes,
  onFilterChange,
}: FilterProps) {
  const { t, i18n } = useTranslation()
  const isArabic = i18n.language === 'ar'

  const allTypes: ActivityType[] = [
    'call',
    'email',
    'meeting',
    'task',
    'note',
    'whatsapp',
  ]

  const handleToggle = (type: ActivityType) => {
    const newTypes = new Set(selectedTypes)
    if (newTypes.has(type)) {
      newTypes.delete(type)
    } else {
      newTypes.add(type)
    }
    onFilterChange(newTypes)
  }

  const handleClear = () => {
    onFilterChange(new Set())
  }

  const handleSelectAll = () => {
    onFilterChange(new Set(allTypes))
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" size="sm" className="gap-2">
          <Filter className="w-4 h-4" />
          {isArabic ? 'تصفية' : 'Filter'}
          {selectedTypes.size > 0 && (
            <Badge variant="secondary" className="ms-1">
              {selectedTypes.size}
            </Badge>
          )}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-56">
        <DropdownMenuLabel>
          {isArabic ? 'تصفية حسب النوع' : 'Filter by Type'}
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        {allTypes.map((type) => {
          const Icon = ACTIVITY_ICONS[type]
          const label = isArabic ? ACTIVITY_LABELS_AR[type] : ACTIVITY_LABELS_EN[type]
          return (
            <DropdownMenuCheckboxItem
              key={type}
              checked={selectedTypes.has(type)}
              onCheckedChange={() => handleToggle(type)}
            >
              <Icon className="w-4 h-4 me-2" />
              {label}
            </DropdownMenuCheckboxItem>
          )
        })}
        <DropdownMenuSeparator />
        <div className="flex gap-2 p-2">
          <Button
            variant="ghost"
            size="sm"
            className="flex-1 text-xs"
            onClick={handleSelectAll}
          >
            {isArabic ? 'تحديد الكل' : 'Select All'}
          </Button>
          <Button
            variant="ghost"
            size="sm"
            className="flex-1 text-xs"
            onClick={handleClear}
          >
            {isArabic ? 'مسح' : 'Clear'}
          </Button>
        </div>
      </DropdownMenuContent>
    </DropdownMenu>
  )
})

// ==================== MAIN COMPONENT ====================

export function ActivityTimeline({
  activities,
  isLoading = false,
  hasMore = false,
  onLoadMore,
  onActivityClick,
  filterTypes,
  showFilter = true,
  emptyMessage,
  className,
}: ActivityTimelineProps) {
  const { t, i18n } = useTranslation()
  const isArabic = i18n.language === 'ar'
  const [selectedTypes, setSelectedTypes] = useState<Set<ActivityType>>(
    new Set(filterTypes || [])
  )

  // Filter activities by type
  const filteredActivities = useMemo(() => {
    if (selectedTypes.size === 0) {
      return activities
    }
    return activities.filter((activity) => selectedTypes.has(activity.type))
  }, [activities, selectedTypes])

  // Handle loading state
  if (isLoading && activities.length === 0) {
    return (
      <div className={cn('space-y-4', className)}>
        <ActivitySkeleton />
        <ActivitySkeleton />
        <ActivitySkeleton />
      </div>
    )
  }

  // Handle empty state
  if (filteredActivities.length === 0 && !isLoading) {
    return (
      <div className={className}>
        {showFilter && activities.length > 0 && (
          <div className="mb-4 flex justify-end">
            <FilterDropdown
              selectedTypes={selectedTypes}
              onFilterChange={setSelectedTypes}
            />
          </div>
        )}
        <EmptyState
          icon="folder"
          title={
            emptyMessage ||
            (selectedTypes.size > 0
              ? isArabic
                ? 'لا توجد أنشطة تطابق الفلتر'
                : 'No activities match the filter'
              : isArabic
              ? 'لا توجد أنشطة'
              : 'No activities')
          }
          description={
            selectedTypes.size > 0
              ? isArabic
                ? 'جرب تغيير معايير التصفية'
                : 'Try changing the filter criteria'
              : isArabic
              ? 'لم يتم تسجيل أي أنشطة بعد'
              : 'No activities have been logged yet'
          }
          size="sm"
        />
      </div>
    )
  }

  return (
    <div className={className}>
      {/* Filter */}
      {showFilter && (
        <div className="mb-6 flex justify-end">
          <FilterDropdown
            selectedTypes={selectedTypes}
            onFilterChange={setSelectedTypes}
          />
        </div>
      )}

      {/* Timeline */}
      <div className="space-y-0" role="feed" aria-label={isArabic ? 'سجل الأنشطة' : 'Activity Timeline'}>
        {filteredActivities.map((activity, index) => (
          <ActivityItem
            key={activity._id}
            activity={activity}
            isLast={index === filteredActivities.length - 1 && !hasMore}
            onClick={onActivityClick}
          />
        ))}
      </div>

      {/* Load More */}
      {hasMore && onLoadMore && (
        <div className="flex justify-center mt-6">
          <Button
            variant="outline"
            onClick={onLoadMore}
            disabled={isLoading}
            className="gap-2"
          >
            {isLoading && <Loader2 className="w-4 h-4 animate-spin" />}
            {isArabic ? 'تحميل المزيد' : 'Load More'}
          </Button>
        </div>
      )}
    </div>
  )
}

// ==================== EXPORTS ====================

export { ActivityItem, ActivitySkeleton, FilterDropdown }
export type { ActivityItemProps, FilterProps }
