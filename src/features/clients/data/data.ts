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
} from 'lucide-react'
import { type ClientStatus, type PreferredContactMethod } from './schema'

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
    icon: User,
  },
] as const
