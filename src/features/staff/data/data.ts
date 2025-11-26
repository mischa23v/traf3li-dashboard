import {
  Shield,
  Scale,
  FileText,
  UserCog,
  UserCheck,
  UserX,
} from 'lucide-react'
import { type StaffStatus, type StaffRole } from './schema'

export const staffStatusColors = new Map<StaffStatus, string>([
  ['active', 'bg-teal-100/30 text-teal-900 dark:text-teal-200 border-teal-200'],
  ['inactive', 'bg-neutral-300/40 border-neutral-300'],
])

export const staffStatuses = [
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
] as const

export const staffRoles = [
  {
    label: 'مدير',
    labelEn: 'Admin',
    value: 'admin' as StaffRole,
    icon: Shield,
  },
  {
    label: 'محامي',
    labelEn: 'Lawyer',
    value: 'lawyer' as StaffRole,
    icon: Scale,
  },
  {
    label: 'مساعد قانوني',
    labelEn: 'Paralegal',
    value: 'paralegal' as StaffRole,
    icon: FileText,
  },
  {
    label: 'مساعد',
    labelEn: 'Assistant',
    value: 'assistant' as StaffRole,
    icon: UserCog,
  },
] as const

export const specializations = [
  { label: 'قضايا عمالية', labelEn: 'Labor Law', value: 'labor' },
  { label: 'قضايا تجارية', labelEn: 'Commercial Law', value: 'commercial' },
  { label: 'قضايا مدنية', labelEn: 'Civil Law', value: 'civil' },
  { label: 'قضايا جنائية', labelEn: 'Criminal Law', value: 'criminal' },
  { label: 'أحوال شخصية', labelEn: 'Family Law', value: 'family' },
  { label: 'قضايا إدارية', labelEn: 'Administrative Law', value: 'administrative' },
  { label: 'عام', labelEn: 'General', value: 'general' },
] as const
