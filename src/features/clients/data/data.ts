import {
  User,
  UserCheck,
  UserX,
  Archive,
  Clock,
  Mail,
  Phone,
  MessageSquare,
  MessageCircle,
  IdCard,
  CreditCard,
  Globe,
  Plane,
  Shield,
  BadgeCheck,
  AlertCircle,
  Building2,
} from 'lucide-react'
import { type ClientStatus, type PreferredContactMethod, type NajizIdentityType } from './schema'

export const clientStatusColors = new Map<ClientStatus, string>([
  ['active', 'bg-teal-100/30 text-teal-900 dark:text-teal-200 border-teal-200'],
  ['inactive', 'bg-neutral-300/40 border-neutral-300'],
  [
    'archived',
    'bg-amber-100/30 text-amber-900 dark:text-amber-200 border-amber-200',
  ],
  ['pending', 'bg-blue-100/30 text-blue-900 dark:text-blue-200 border-blue-200'],
])

export const clientStatuses = [
  {
    label: 'نشط',
    labelEn: 'Active',
    value: 'active' as const,
    icon: UserCheck,
  },
  {
    label: 'غير نشط',
    labelEn: 'Inactive',
    value: 'inactive' as const,
    icon: UserX,
  },
  {
    label: 'مؤرشف',
    labelEn: 'Archived',
    value: 'archived' as const,
    icon: Archive,
  },
  {
    label: 'معلق',
    labelEn: 'Pending',
    value: 'pending' as const,
    icon: Clock,
  },
] as const

export const contactMethods = [
  {
    label: 'البريد الإلكتروني',
    labelEn: 'Email',
    value: 'email' as PreferredContactMethod,
    icon: Mail,
  },
  {
    label: 'الهاتف',
    labelEn: 'Phone',
    value: 'phone' as PreferredContactMethod,
    icon: Phone,
  },
  {
    label: 'رسالة نصية',
    labelEn: 'SMS',
    value: 'sms' as PreferredContactMethod,
    icon: MessageSquare,
  },
  {
    label: 'واتساب',
    labelEn: 'WhatsApp',
    value: 'whatsapp' as PreferredContactMethod,
    icon: MessageCircle,
  },
] as const

export const clientTypes = [
  {
    label: 'فرد',
    labelEn: 'Individual',
    value: 'individual',
    icon: User,
  },
  {
    label: 'شركة',
    labelEn: 'Company',
    value: 'company',
    icon: Building2,
  },
] as const

// Najiz Identity Types
export const identityTypes: Array<{
  label: string
  labelEn: string
  value: NajizIdentityType
  icon: typeof IdCard
}> = [
  {
    label: 'الهوية الوطنية',
    labelEn: 'Saudi National ID',
    value: 'national_id',
    icon: IdCard,
  },
  {
    label: 'الإقامة',
    labelEn: 'Resident ID (Iqama)',
    value: 'iqama',
    icon: CreditCard,
  },
  {
    label: 'هوية مواطني الخليج',
    labelEn: 'GCC Citizen ID',
    value: 'gcc_id',
    icon: Globe,
  },
  {
    label: 'جواز السفر',
    labelEn: 'Passport',
    value: 'passport',
    icon: Plane,
  },
  {
    label: 'رقم الحدود',
    labelEn: 'Border Number',
    value: 'border_number',
    icon: Shield,
  },
  {
    label: 'هوية زائر',
    labelEn: 'Visitor ID',
    value: 'visitor_id',
    icon: User,
  },
  {
    label: 'هوية مؤقتة',
    labelEn: 'Temporary ID',
    value: 'temporary_id',
    icon: Clock,
  },
  {
    label: 'هوية دبلوماسية',
    labelEn: 'Diplomatic ID',
    value: 'diplomatic_id',
    icon: Shield,
  },
]

// Verification status colors
export const verificationStatusColors = new Map<string, string>([
  ['verified', 'bg-emerald-100/30 text-emerald-900 dark:text-emerald-200 border-emerald-200'],
  ['pending', 'bg-amber-100/30 text-amber-900 dark:text-amber-200 border-amber-200'],
  ['not_verified', 'bg-neutral-300/40 border-neutral-300'],
  ['failed', 'bg-red-100/30 text-red-900 dark:text-red-200 border-red-200'],
])

export const verificationStatuses = [
  {
    label: 'موثق',
    labelEn: 'Verified',
    value: 'verified',
    icon: BadgeCheck,
  },
  {
    label: 'قيد التحقق',
    labelEn: 'Pending',
    value: 'pending',
    icon: Clock,
  },
  {
    label: 'غير موثق',
    labelEn: 'Not Verified',
    value: 'not_verified',
    icon: AlertCircle,
  },
] as const

// Conflict check status colors
export const conflictStatusColors = new Map<string, string>([
  ['not_checked', 'bg-neutral-300/40 border-neutral-300'],
  ['clear', 'bg-emerald-100/30 text-emerald-900 dark:text-emerald-200 border-emerald-200'],
  ['potential_conflict', 'bg-amber-100/30 text-amber-900 dark:text-amber-200 border-amber-200'],
  ['confirmed_conflict', 'bg-red-100/30 text-red-900 dark:text-red-200 border-red-200'],
])

export const conflictStatuses = [
  {
    label: 'لم يتم الفحص',
    labelEn: 'Not Checked',
    value: 'not_checked',
  },
  {
    label: 'لا يوجد تعارض',
    labelEn: 'Clear',
    value: 'clear',
  },
  {
    label: 'تعارض محتمل',
    labelEn: 'Potential Conflict',
    value: 'potential_conflict',
  },
  {
    label: 'تعارض مؤكد',
    labelEn: 'Confirmed Conflict',
    value: 'confirmed_conflict',
  },
] as const
