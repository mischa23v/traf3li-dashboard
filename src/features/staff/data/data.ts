import {
  Shield,
  Scale,
  FileText,
  UserCog,
  UserCheck,
  UserX,
  Crown,
  Users,
  Briefcase,
  Calculator,
  UserMinus,
  Clock,
  Ban,
  HourglassIcon,
} from 'lucide-react'
import { type StaffStatus, type StaffRole, type DepartureReason } from './schema'

export const staffStatusColors = new Map<StaffStatus, string>([
  ['active', 'bg-teal-100/30 text-teal-900 dark:text-teal-200 border-teal-200'],
  ['departed', 'bg-amber-100/30 text-amber-900 dark:text-amber-200 border-amber-200'],
  ['suspended', 'bg-red-100/30 text-red-900 dark:text-red-200 border-red-200'],
  ['pending', 'bg-blue-100/30 text-blue-900 dark:text-blue-200 border-blue-200'],
  ['pending_approval', 'bg-purple-100/30 text-purple-900 dark:text-purple-200 border-purple-200'],
])

export const staffStatuses = [
  {
    label: 'نشط',
    labelEn: 'Active',
    value: 'active' as const,
    icon: UserCheck,
  },
  {
    label: 'مغادر',
    labelEn: 'Departed',
    value: 'departed' as const,
    icon: UserMinus,
  },
  {
    label: 'موقوف',
    labelEn: 'Suspended',
    value: 'suspended' as const,
    icon: Ban,
  },
  {
    label: 'قيد الانتظار',
    labelEn: 'Pending',
    value: 'pending' as const,
    icon: Clock,
  },
  {
    label: 'بانتظار الموافقة',
    labelEn: 'Pending Approval',
    value: 'pending_approval' as const,
    icon: HourglassIcon,
  },
] as const

export const staffRoles = [
  {
    label: 'المالك',
    labelEn: 'Owner',
    value: 'owner' as StaffRole,
    icon: Crown,
  },
  {
    label: 'مدير النظام',
    labelEn: 'Admin',
    value: 'admin' as StaffRole,
    icon: Shield,
  },
  {
    label: 'شريك',
    labelEn: 'Partner',
    value: 'partner' as StaffRole,
    icon: Users,
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
    label: 'سكرتير',
    labelEn: 'Secretary',
    value: 'secretary' as StaffRole,
    icon: Briefcase,
  },
  {
    label: 'محاسب',
    labelEn: 'Accountant',
    value: 'accountant' as StaffRole,
    icon: Calculator,
  },
  {
    label: 'موظف مغادر',
    labelEn: 'Departed',
    value: 'departed' as StaffRole,
    icon: UserMinus,
  },
] as const

export const departureReasons = [
  {
    label: 'استقالة',
    labelEn: 'Resignation',
    value: 'resignation' as DepartureReason,
  },
  {
    label: 'إنهاء خدمات',
    labelEn: 'Termination',
    value: 'termination' as DepartureReason,
  },
  {
    label: 'تقاعد',
    labelEn: 'Retirement',
    value: 'retirement' as DepartureReason,
  },
  {
    label: 'نقل',
    labelEn: 'Transfer',
    value: 'transfer' as DepartureReason,
  },
  {
    label: 'أخرى',
    labelEn: 'Other',
    value: 'other' as DepartureReason,
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
