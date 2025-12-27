import * as React from 'react'
import { useTranslation } from 'react-i18next'
import { cva, type VariantProps } from 'class-variance-authority'
import { cn } from '@/lib/utils'
import { Badge } from '@/components/ui/badge'

const statusBadgeVariants = cva(
  'inline-flex items-center justify-center rounded-md border px-2 py-0.5 font-medium w-fit whitespace-nowrap shrink-0 transition-colors',
  {
    variants: {
      size: {
        sm: 'text-[10px] px-1.5 py-0.5',
        md: 'text-xs px-2 py-0.5',
        lg: 'text-sm px-3 py-1',
      },
    },
    defaultVariants: {
      size: 'md',
    },
  }
)

// Status type definitions
type LeadStatus = 'new' | 'contacted' | 'qualified' | 'proposal' | 'negotiation' | 'won' | 'lost' | 'dormant'
type QuoteStatus = 'draft' | 'sent' | 'viewed' | 'accepted' | 'rejected' | 'expired' | 'revised'
type CampaignStatus = 'draft' | 'scheduled' | 'active' | 'paused' | 'completed' | 'cancelled'
type CreditStatus = 'good' | 'warning' | 'hold' | 'blacklisted'
type ConflictStatus = 'not_checked' | 'clear' | 'potential_conflict' | 'confirmed_conflict'
type ClientStatus = 'active' | 'inactive' | 'pending' | 'suspended'
type ContactStatus = 'active' | 'inactive' | 'pending'

type AllStatusTypes = LeadStatus | QuoteStatus | CampaignStatus | CreditStatus | ConflictStatus | ClientStatus | ContactStatus

interface StatusConfig {
  label: string
  labelAr: string
  color: string
}

// Color mappings for different status types
const STATUS_CONFIGS: Record<string, Record<string, StatusConfig>> = {
  lead: {
    new: {
      label: 'New',
      labelAr: 'جديد',
      color: 'bg-blue-100 text-blue-700 border-blue-300 dark:bg-blue-900/30 dark:text-blue-400 dark:border-blue-800',
    },
    contacted: {
      label: 'Contacted',
      labelAr: 'تم التواصل',
      color: 'bg-yellow-100 text-yellow-700 border-yellow-300 dark:bg-yellow-900/30 dark:text-yellow-400 dark:border-yellow-800',
    },
    qualified: {
      label: 'Qualified',
      labelAr: 'مؤهل',
      color: 'bg-purple-100 text-purple-700 border-purple-300 dark:bg-purple-900/30 dark:text-purple-400 dark:border-purple-800',
    },
    proposal: {
      label: 'Proposal',
      labelAr: 'عرض مقدم',
      color: 'bg-orange-100 text-orange-700 border-orange-300 dark:bg-orange-900/30 dark:text-orange-400 dark:border-orange-800',
    },
    negotiation: {
      label: 'Negotiation',
      labelAr: 'مفاوضة',
      color: 'bg-cyan-100 text-cyan-700 border-cyan-300 dark:bg-cyan-900/30 dark:text-cyan-400 dark:border-cyan-800',
    },
    won: {
      label: 'Won',
      labelAr: 'مكتسب',
      color: 'bg-green-100 text-green-700 border-green-300 dark:bg-green-900/30 dark:text-green-400 dark:border-green-800',
    },
    lost: {
      label: 'Lost',
      labelAr: 'مفقود',
      color: 'bg-red-100 text-red-700 border-red-300 dark:bg-red-900/30 dark:text-red-400 dark:border-red-800',
    },
    dormant: {
      label: 'Dormant',
      labelAr: 'خامل',
      color: 'bg-gray-100 text-gray-700 border-gray-300 dark:bg-gray-900/30 dark:text-gray-400 dark:border-gray-800',
    },
  },
  quote: {
    draft: {
      label: 'Draft',
      labelAr: 'مسودة',
      color: 'bg-gray-100 text-gray-700 border-gray-300 dark:bg-gray-900/30 dark:text-gray-400 dark:border-gray-800',
    },
    sent: {
      label: 'Sent',
      labelAr: 'مُرسل',
      color: 'bg-blue-100 text-blue-700 border-blue-300 dark:bg-blue-900/30 dark:text-blue-400 dark:border-blue-800',
    },
    viewed: {
      label: 'Viewed',
      labelAr: 'تمت المشاهدة',
      color: 'bg-purple-100 text-purple-700 border-purple-300 dark:bg-purple-900/30 dark:text-purple-400 dark:border-purple-800',
    },
    accepted: {
      label: 'Accepted',
      labelAr: 'مقبول',
      color: 'bg-green-100 text-green-700 border-green-300 dark:bg-green-900/30 dark:text-green-400 dark:border-green-800',
    },
    rejected: {
      label: 'Rejected',
      labelAr: 'مرفوض',
      color: 'bg-red-100 text-red-700 border-red-300 dark:bg-red-900/30 dark:text-red-400 dark:border-red-800',
    },
    expired: {
      label: 'Expired',
      labelAr: 'منتهي الصلاحية',
      color: 'bg-orange-100 text-orange-700 border-orange-300 dark:bg-orange-900/30 dark:text-orange-400 dark:border-orange-800',
    },
    revised: {
      label: 'Revised',
      labelAr: 'تم المراجعة',
      color: 'bg-cyan-100 text-cyan-700 border-cyan-300 dark:bg-cyan-900/30 dark:text-cyan-400 dark:border-cyan-800',
    },
  },
  campaign: {
    draft: {
      label: 'Draft',
      labelAr: 'مسودة',
      color: 'bg-gray-100 text-gray-700 border-gray-300 dark:bg-gray-900/30 dark:text-gray-400 dark:border-gray-800',
    },
    scheduled: {
      label: 'Scheduled',
      labelAr: 'مجدولة',
      color: 'bg-blue-100 text-blue-700 border-blue-300 dark:bg-blue-900/30 dark:text-blue-400 dark:border-blue-800',
    },
    active: {
      label: 'Active',
      labelAr: 'نشطة',
      color: 'bg-green-100 text-green-700 border-green-300 dark:bg-green-900/30 dark:text-green-400 dark:border-green-800',
    },
    paused: {
      label: 'Paused',
      labelAr: 'متوقفة مؤقتاً',
      color: 'bg-yellow-100 text-yellow-700 border-yellow-300 dark:bg-yellow-900/30 dark:text-yellow-400 dark:border-yellow-800',
    },
    completed: {
      label: 'Completed',
      labelAr: 'مكتملة',
      color: 'bg-purple-100 text-purple-700 border-purple-300 dark:bg-purple-900/30 dark:text-purple-400 dark:border-purple-800',
    },
    cancelled: {
      label: 'Cancelled',
      labelAr: 'ملغاة',
      color: 'bg-red-100 text-red-700 border-red-300 dark:bg-red-900/30 dark:text-red-400 dark:border-red-800',
    },
  },
  credit: {
    good: {
      label: 'Good Standing',
      labelAr: 'وضع جيد',
      color: 'bg-green-100 text-green-700 border-green-300 dark:bg-green-900/30 dark:text-green-400 dark:border-green-800',
    },
    warning: {
      label: 'Warning',
      labelAr: 'تحذير',
      color: 'bg-yellow-100 text-yellow-700 border-yellow-300 dark:bg-yellow-900/30 dark:text-yellow-400 dark:border-yellow-800',
    },
    hold: {
      label: 'On Hold',
      labelAr: 'معلق',
      color: 'bg-orange-100 text-orange-700 border-orange-300 dark:bg-orange-900/30 dark:text-orange-400 dark:border-orange-800',
    },
    blacklisted: {
      label: 'Blacklisted',
      labelAr: 'في القائمة السوداء',
      color: 'bg-red-100 text-red-700 border-red-300 dark:bg-red-900/30 dark:text-red-400 dark:border-red-800',
    },
  },
  conflict: {
    not_checked: {
      label: 'Not Checked',
      labelAr: 'لم يتم الفحص',
      color: 'bg-gray-100 text-gray-700 border-gray-300 dark:bg-gray-900/30 dark:text-gray-400 dark:border-gray-800',
    },
    clear: {
      label: 'Clear',
      labelAr: 'واضح',
      color: 'bg-green-100 text-green-700 border-green-300 dark:bg-green-900/30 dark:text-green-400 dark:border-green-800',
    },
    potential_conflict: {
      label: 'Potential Conflict',
      labelAr: 'تعارض محتمل',
      color: 'bg-yellow-100 text-yellow-700 border-yellow-300 dark:bg-yellow-900/30 dark:text-yellow-400 dark:border-yellow-800',
    },
    confirmed_conflict: {
      label: 'Confirmed Conflict',
      labelAr: 'تعارض مؤكد',
      color: 'bg-red-100 text-red-700 border-red-300 dark:bg-red-900/30 dark:text-red-400 dark:border-red-800',
    },
  },
  client: {
    active: {
      label: 'Active',
      labelAr: 'نشط',
      color: 'bg-green-100 text-green-700 border-green-300 dark:bg-green-900/30 dark:text-green-400 dark:border-green-800',
    },
    inactive: {
      label: 'Inactive',
      labelAr: 'غير نشط',
      color: 'bg-gray-100 text-gray-700 border-gray-300 dark:bg-gray-900/30 dark:text-gray-400 dark:border-gray-800',
    },
    pending: {
      label: 'Pending',
      labelAr: 'قيد الانتظار',
      color: 'bg-yellow-100 text-yellow-700 border-yellow-300 dark:bg-yellow-900/30 dark:text-yellow-400 dark:border-yellow-800',
    },
    suspended: {
      label: 'Suspended',
      labelAr: 'معلق',
      color: 'bg-red-100 text-red-700 border-red-300 dark:bg-red-900/30 dark:text-red-400 dark:border-red-800',
    },
  },
  contact: {
    active: {
      label: 'Active',
      labelAr: 'نشط',
      color: 'bg-green-100 text-green-700 border-green-300 dark:bg-green-900/30 dark:text-green-400 dark:border-green-800',
    },
    inactive: {
      label: 'Inactive',
      labelAr: 'غير نشط',
      color: 'bg-gray-100 text-gray-700 border-gray-300 dark:bg-gray-900/30 dark:text-gray-400 dark:border-gray-800',
    },
    pending: {
      label: 'Pending',
      labelAr: 'قيد الانتظار',
      color: 'bg-yellow-100 text-yellow-700 border-yellow-300 dark:bg-yellow-900/30 dark:text-yellow-400 dark:border-yellow-800',
    },
  },
}

export interface StatusBadgeProps {
  status: string
  type?: 'lead' | 'quote' | 'campaign' | 'client' | 'contact' | 'credit' | 'conflict'
  label?: string
  size?: 'sm' | 'md' | 'lg'
  className?: string
}

export function StatusBadge({
  status,
  type = 'lead',
  label,
  size = 'md',
  className,
}: StatusBadgeProps) {
  const { i18n } = useTranslation()
  const isRTL = i18n.language === 'ar'

  // Get status configuration
  const statusConfig = STATUS_CONFIGS[type]?.[status.toLowerCase()]

  // If no config found, use default gray badge
  if (!statusConfig && !label) {
    return (
      <Badge
        className={cn(
          statusBadgeVariants({ size }),
          'bg-gray-100 text-gray-700 border-gray-300 dark:bg-gray-900/30 dark:text-gray-400 dark:border-gray-800',
          className
        )}
      >
        {status}
      </Badge>
    )
  }

  // Determine the display label
  const displayLabel = label || (isRTL ? statusConfig?.labelAr : statusConfig?.label) || status

  return (
    <Badge
      className={cn(
        statusBadgeVariants({ size }),
        statusConfig?.color,
        className
      )}
    >
      {displayLabel}
    </Badge>
  )
}

// Export individual status configs for external use
export { STATUS_CONFIGS }

// Helper function to get all statuses for a type
export function getStatusesForType(type: 'lead' | 'quote' | 'campaign' | 'client' | 'contact' | 'credit' | 'conflict') {
  return Object.keys(STATUS_CONFIGS[type] || {})
}

// Helper function to get status label
export function getStatusLabel(
  status: string,
  type: 'lead' | 'quote' | 'campaign' | 'client' | 'contact' | 'credit' | 'conflict',
  language: 'en' | 'ar' = 'en'
): string {
  const config = STATUS_CONFIGS[type]?.[status.toLowerCase()]
  if (!config) return status
  return language === 'ar' ? config.labelAr : config.label
}
