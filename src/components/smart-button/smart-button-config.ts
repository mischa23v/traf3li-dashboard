/**
 * Smart Button Configuration
 *
 * Defines which smart buttons appear on which entity detail pages
 * Configuration includes:
 * - Button metadata (icon, label, variant)
 * - Data source for counts
 * - Navigation target
 * - Filter parameters
 */

import {
  Briefcase,
  FileText,
  Receipt,
  DollarSign,
  Users,
  Phone,
  Mail,
  Calendar,
  ClipboardList,
  MessageSquare,
  AlertCircle,
  CheckCircle2,
  Clock,
  TrendingUp,
  Wallet,
  CreditCard,
  UserCheck,
  Building2,
  Scale,
  Gavel,
  FileCheck,
  FilePlus,
  type LucideIcon,
} from 'lucide-react'

export interface SmartButtonConfig {
  /** Unique identifier for the button */
  id: string
  /** Icon component */
  icon: LucideIcon
  /** Label key for i18n (or direct text) */
  labelKey: string
  /** Arabic label */
  labelAr: string
  /** English label */
  labelEn: string
  /** Color variant */
  variant: 'default' | 'primary' | 'success' | 'warning' | 'danger' | 'info'
  /** Query key for fetching count */
  countQueryKey: string[]
  /** Navigation path template (use {id} placeholder) */
  navigateTo: string
  /** Filter parameter to apply on navigation */
  filterParam?: string
  /** Whether button should be clickable */
  clickable?: boolean
}

export type EntityType = 'client' | 'case' | 'contact' | 'lead'

/**
 * Smart button configurations for each entity type
 */
export const smartButtonConfigs: Record<EntityType, SmartButtonConfig[]> = {
  // ════════════════════════════════════════════════════════════
  // CLIENT SMART BUTTONS
  // ════════════════════════════════════════════════════════════
  client: [
    {
      id: 'cases',
      icon: Briefcase,
      labelKey: 'smartButtons.cases',
      labelAr: 'القضايا',
      labelEn: 'Cases',
      variant: 'primary',
      countQueryKey: ['clients', '{id}', 'cases', 'count'],
      navigateTo: '/dashboard/cases?clientId={id}',
      filterParam: 'clientId',
      clickable: true,
    },
    {
      id: 'invoices',
      icon: Receipt,
      labelKey: 'smartButtons.invoices',
      labelAr: 'الفواتير',
      labelEn: 'Invoices',
      variant: 'info',
      countQueryKey: ['clients', '{id}', 'invoices', 'count'],
      navigateTo: '/dashboard/finance/invoices?clientId={id}',
      filterParam: 'clientId',
      clickable: true,
    },
    {
      id: 'payments',
      icon: DollarSign,
      labelKey: 'smartButtons.payments',
      labelAr: 'الدفعات',
      labelEn: 'Payments',
      variant: 'success',
      countQueryKey: ['clients', '{id}', 'payments', 'count'],
      navigateTo: '/dashboard/finance/payments?clientId={id}',
      filterParam: 'clientId',
      clickable: true,
    },
    {
      id: 'documents',
      icon: FileText,
      labelKey: 'smartButtons.documents',
      labelAr: 'المستندات',
      labelEn: 'Documents',
      variant: 'default',
      countQueryKey: ['clients', '{id}', 'documents', 'count'],
      navigateTo: '/dashboard/documents?clientId={id}',
      filterParam: 'clientId',
      clickable: true,
    },
    {
      id: 'contacts',
      icon: Users,
      labelKey: 'smartButtons.contacts',
      labelAr: 'جهات الاتصال',
      labelEn: 'Contacts',
      variant: 'default',
      countQueryKey: ['clients', '{id}', 'contacts', 'count'],
      navigateTo: '/dashboard/contacts?clientId={id}',
      filterParam: 'clientId',
      clickable: true,
    },
    {
      id: 'activities',
      icon: Clock,
      labelKey: 'smartButtons.activities',
      labelAr: 'الأنشطة',
      labelEn: 'Activities',
      variant: 'default',
      countQueryKey: ['clients', '{id}', 'activities', 'count'],
      navigateTo: '/dashboard/activities?clientId={id}',
      filterParam: 'clientId',
      clickable: true,
    },
  ],

  // ════════════════════════════════════════════════════════════
  // CASE SMART BUTTONS
  // ════════════════════════════════════════════════════════════
  case: [
    {
      id: 'hearings',
      icon: Gavel,
      labelKey: 'smartButtons.hearings',
      labelAr: 'الجلسات',
      labelEn: 'Hearings',
      variant: 'primary',
      countQueryKey: ['cases', '{id}', 'hearings', 'count'],
      navigateTo: '/dashboard/cases/{id}#hearings',
      clickable: true,
    },
    {
      id: 'documents',
      icon: FileText,
      labelKey: 'smartButtons.documents',
      labelAr: 'المستندات',
      labelEn: 'Documents',
      variant: 'info',
      countQueryKey: ['cases', '{id}', 'documents', 'count'],
      navigateTo: '/dashboard/documents?caseId={id}',
      filterParam: 'caseId',
      clickable: true,
    },
    {
      id: 'invoices',
      icon: Receipt,
      labelKey: 'smartButtons.invoices',
      labelAr: 'الفواتير',
      labelEn: 'Invoices',
      variant: 'success',
      countQueryKey: ['cases', '{id}', 'invoices', 'count'],
      navigateTo: '/dashboard/finance/invoices?caseId={id}',
      filterParam: 'caseId',
      clickable: true,
    },
    {
      id: 'tasks',
      icon: ClipboardList,
      labelKey: 'smartButtons.tasks',
      labelAr: 'المهام',
      labelEn: 'Tasks',
      variant: 'warning',
      countQueryKey: ['cases', '{id}', 'tasks', 'count'],
      navigateTo: '/dashboard/cases/{id}#tasks',
      clickable: true,
    },
    {
      id: 'timeEntries',
      icon: Clock,
      labelKey: 'smartButtons.timeEntries',
      labelAr: 'سجلات الوقت',
      labelEn: 'Time Entries',
      variant: 'default',
      countQueryKey: ['cases', '{id}', 'time-entries', 'count'],
      navigateTo: '/dashboard/time-tracking?caseId={id}',
      filterParam: 'caseId',
      clickable: true,
    },
    {
      id: 'notes',
      icon: MessageSquare,
      labelKey: 'smartButtons.notes',
      labelAr: 'الملاحظات',
      labelEn: 'Notes',
      variant: 'default',
      countQueryKey: ['cases', '{id}', 'notes', 'count'],
      navigateTo: '/dashboard/cases/{id}#notes',
      clickable: true,
    },
  ],

  // ════════════════════════════════════════════════════════════
  // CONTACT SMART BUTTONS
  // ════════════════════════════════════════════════════════════
  contact: [
    {
      id: 'cases',
      icon: Briefcase,
      labelKey: 'smartButtons.relatedCases',
      labelAr: 'القضايا المرتبطة',
      labelEn: 'Related Cases',
      variant: 'primary',
      countQueryKey: ['contacts', '{id}', 'cases', 'count'],
      navigateTo: '/dashboard/cases?contactId={id}',
      filterParam: 'contactId',
      clickable: true,
    },
    {
      id: 'activities',
      icon: Calendar,
      labelKey: 'smartButtons.activities',
      labelAr: 'الأنشطة',
      labelEn: 'Activities',
      variant: 'info',
      countQueryKey: ['contacts', '{id}', 'activities', 'count'],
      navigateTo: '/dashboard/activities?contactId={id}',
      filterParam: 'contactId',
      clickable: true,
    },
    {
      id: 'calls',
      icon: Phone,
      labelKey: 'smartButtons.calls',
      labelAr: 'المكالمات',
      labelEn: 'Calls',
      variant: 'success',
      countQueryKey: ['contacts', '{id}', 'calls', 'count'],
      navigateTo: '/dashboard/activities?contactId={id}&type=call',
      filterParam: 'contactId',
      clickable: true,
    },
    {
      id: 'emails',
      icon: Mail,
      labelKey: 'smartButtons.emails',
      labelAr: 'الرسائل',
      labelEn: 'Emails',
      variant: 'default',
      countQueryKey: ['contacts', '{id}', 'emails', 'count'],
      navigateTo: '/dashboard/activities?contactId={id}&type=email',
      filterParam: 'contactId',
      clickable: true,
    },
    {
      id: 'meetings',
      icon: UserCheck,
      labelKey: 'smartButtons.meetings',
      labelAr: 'الاجتماعات',
      labelEn: 'Meetings',
      variant: 'default',
      countQueryKey: ['contacts', '{id}', 'meetings', 'count'],
      navigateTo: '/dashboard/activities?contactId={id}&type=meeting',
      filterParam: 'contactId',
      clickable: true,
    },
  ],

  // ════════════════════════════════════════════════════════════
  // LEAD SMART BUTTONS
  // ════════════════════════════════════════════════════════════
  lead: [
    {
      id: 'activities',
      icon: Calendar,
      labelKey: 'smartButtons.activities',
      labelAr: 'الأنشطة',
      labelEn: 'Activities',
      variant: 'primary',
      countQueryKey: ['leads', '{id}', 'activities', 'count'],
      navigateTo: '/dashboard/activities?leadId={id}',
      filterParam: 'leadId',
      clickable: true,
    },
    {
      id: 'calls',
      icon: Phone,
      labelKey: 'smartButtons.calls',
      labelAr: 'المكالمات',
      labelEn: 'Calls',
      variant: 'info',
      countQueryKey: ['leads', '{id}', 'calls', 'count'],
      navigateTo: '/dashboard/activities?leadId={id}&type=call',
      filterParam: 'leadId',
      clickable: true,
    },
    {
      id: 'emails',
      icon: Mail,
      labelKey: 'smartButtons.emails',
      labelAr: 'الرسائل',
      labelEn: 'Emails',
      variant: 'success',
      countQueryKey: ['leads', '{id}', 'emails', 'count'],
      navigateTo: '/dashboard/activities?leadId={id}&type=email',
      filterParam: 'leadId',
      clickable: true,
    },
    {
      id: 'meetings',
      icon: UserCheck,
      labelKey: 'smartButtons.meetings',
      labelAr: 'الاجتماعات',
      labelEn: 'Meetings',
      variant: 'default',
      countQueryKey: ['leads', '{id}', 'meetings', 'count'],
      navigateTo: '/dashboard/activities?leadId={id}&type=meeting',
      filterParam: 'leadId',
      clickable: true,
    },
    {
      id: 'notes',
      icon: MessageSquare,
      labelKey: 'smartButtons.notes',
      labelAr: 'الملاحظات',
      labelEn: 'Notes',
      variant: 'default',
      countQueryKey: ['leads', '{id}', 'notes', 'count'],
      navigateTo: '/dashboard/crm/leads/{id}#notes',
      clickable: true,
    },
  ],
}

/**
 * Get smart button configuration for an entity type
 */
export function getSmartButtons(entityType: EntityType): SmartButtonConfig[] {
  return smartButtonConfigs[entityType] || []
}

/**
 * Get single smart button configuration
 */
export function getSmartButton(
  entityType: EntityType,
  buttonId: string
): SmartButtonConfig | undefined {
  return smartButtonConfigs[entityType]?.find((btn) => btn.id === buttonId)
}

/**
 * Replace {id} placeholder in navigation path
 */
export function resolveNavigationPath(path: string, id: string): string {
  return path.replace(/{id}/g, id)
}
