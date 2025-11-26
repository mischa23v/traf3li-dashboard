import {
  Phone,
  Mail,
  Users,
  Scale,
  FileText,
  CreditCard,
  CircleDot,
} from 'lucide-react'
import { type FollowupType, type FollowupStatus, type FollowupPriority, type FollowupEntityType } from './schema'

// Type options
export const typeOptions: {
  value: FollowupType
  label: string
  labelAr: string
  icon: typeof Phone
  color: string
}[] = [
  {
    value: 'call',
    label: 'Phone Call',
    labelAr: 'مكالمة هاتفية',
    icon: Phone,
    color: '#3B82F6', // Blue
  },
  {
    value: 'email',
    label: 'Email',
    labelAr: 'بريد إلكتروني',
    icon: Mail,
    color: '#10B981', // Green
  },
  {
    value: 'meeting',
    label: 'Meeting',
    labelAr: 'اجتماع',
    icon: Users,
    color: '#8B5CF6', // Purple
  },
  {
    value: 'court_date',
    label: 'Court Date',
    labelAr: 'موعد محكمة',
    icon: Scale,
    color: '#EF4444', // Red
  },
  {
    value: 'document_deadline',
    label: 'Document Deadline',
    labelAr: 'موعد تسليم مستند',
    icon: FileText,
    color: '#F59E0B', // Amber
  },
  {
    value: 'payment_reminder',
    label: 'Payment Reminder',
    labelAr: 'تذكير دفع',
    icon: CreditCard,
    color: '#06B6D4', // Cyan
  },
  {
    value: 'general',
    label: 'General',
    labelAr: 'عام',
    icon: CircleDot,
    color: '#6B7280', // Gray
  },
]

// Status options
export const statusOptions: {
  value: FollowupStatus
  label: string
  labelAr: string
  color: string
}[] = [
  {
    value: 'pending',
    label: 'Pending',
    labelAr: 'معلق',
    color: '#F59E0B', // Amber
  },
  {
    value: 'completed',
    label: 'Completed',
    labelAr: 'مكتمل',
    color: '#10B981', // Green
  },
  {
    value: 'cancelled',
    label: 'Cancelled',
    labelAr: 'ملغي',
    color: '#6B7280', // Gray
  },
  {
    value: 'rescheduled',
    label: 'Rescheduled',
    labelAr: 'مؤجل',
    color: '#3B82F6', // Blue
  },
]

// Priority options
export const priorityOptions: {
  value: FollowupPriority
  label: string
  labelAr: string
  color: string
}[] = [
  {
    value: 'low',
    label: 'Low',
    labelAr: 'منخفضة',
    color: '#6B7280', // Gray
  },
  {
    value: 'medium',
    label: 'Medium',
    labelAr: 'متوسطة',
    color: '#3B82F6', // Blue
  },
  {
    value: 'high',
    label: 'High',
    labelAr: 'عالية',
    color: '#F59E0B', // Amber
  },
  {
    value: 'urgent',
    label: 'Urgent',
    labelAr: 'عاجلة',
    color: '#EF4444', // Red
  },
]

// Entity type options
export const entityTypeOptions: {
  value: FollowupEntityType
  label: string
  labelAr: string
}[] = [
  {
    value: 'case',
    label: 'Case',
    labelAr: 'قضية',
  },
  {
    value: 'client',
    label: 'Client',
    labelAr: 'عميل',
  },
  {
    value: 'contact',
    label: 'Contact',
    labelAr: 'جهة اتصال',
  },
  {
    value: 'organization',
    label: 'Organization',
    labelAr: 'منظمة',
  },
]

// Frequency options for recurring
export const frequencyOptions = [
  { value: 'daily', label: 'Daily', labelAr: 'يومياً' },
  { value: 'weekly', label: 'Weekly', labelAr: 'أسبوعياً' },
  { value: 'biweekly', label: 'Biweekly', labelAr: 'كل أسبوعين' },
  { value: 'monthly', label: 'Monthly', labelAr: 'شهرياً' },
  { value: 'quarterly', label: 'Quarterly', labelAr: 'ربع سنوي' },
]

// Remind before options (in minutes)
export const remindBeforeOptions = [
  { value: 15, label: '15 minutes', labelAr: '15 دقيقة' },
  { value: 30, label: '30 minutes', labelAr: '30 دقيقة' },
  { value: 60, label: '1 hour', labelAr: 'ساعة واحدة' },
  { value: 120, label: '2 hours', labelAr: 'ساعتين' },
  { value: 1440, label: '1 day', labelAr: 'يوم واحد' },
  { value: 2880, label: '2 days', labelAr: 'يومين' },
  { value: 10080, label: '1 week', labelAr: 'أسبوع واحد' },
]

// Get info helpers
export function getTypeInfo(type: string) {
  return typeOptions.find((opt) => opt.value === type) || typeOptions[6]
}

export function getStatusInfo(status: string) {
  return statusOptions.find((opt) => opt.value === status) || statusOptions[0]
}

export function getPriorityInfo(priority: string) {
  return priorityOptions.find((opt) => opt.value === priority) || priorityOptions[1]
}

export function getEntityTypeInfo(entityType: string) {
  return entityTypeOptions.find((opt) => opt.value === entityType) || entityTypeOptions[0]
}
