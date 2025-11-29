import {
  Building2,
  Scale,
  DollarSign,
  Users,
  Monitor,
  Megaphone,
  Settings,
  MoreHorizontal,
} from 'lucide-react'

export const departments = [
  { value: 'legal', label: 'القانونية', labelEn: 'Legal', icon: Scale },
  { value: 'finance', label: 'المالية', labelEn: 'Finance', icon: DollarSign },
  { value: 'hr', label: 'الموارد البشرية', labelEn: 'HR', icon: Users },
  { value: 'admin', label: 'الإدارة', labelEn: 'Admin', icon: Building2 },
  { value: 'it', label: 'تقنية المعلومات', labelEn: 'IT', icon: Monitor },
  { value: 'marketing', label: 'التسويق', labelEn: 'Marketing', icon: Megaphone },
  { value: 'operations', label: 'العمليات', labelEn: 'Operations', icon: Settings },
  { value: 'other', label: 'أخرى', labelEn: 'Other', icon: MoreHorizontal },
] as const

export const employmentTypes = [
  { value: 'full_time', label: 'دوام كامل', labelEn: 'Full Time' },
  { value: 'part_time', label: 'دوام جزئي', labelEn: 'Part Time' },
  { value: 'contract', label: 'عقد', labelEn: 'Contract' },
  { value: 'intern', label: 'متدرب', labelEn: 'Intern' },
  { value: 'probation', label: 'فترة تجربة', labelEn: 'Probation' },
] as const

export const employeeStatuses = [
  { value: 'active', label: 'نشط', labelEn: 'Active', color: 'bg-green-500/10 text-green-500' },
  { value: 'inactive', label: 'غير نشط', labelEn: 'Inactive', color: 'bg-gray-500/10 text-gray-500' },
  { value: 'on_leave', label: 'في إجازة', labelEn: 'On Leave', color: 'bg-yellow-500/10 text-yellow-500' },
  { value: 'terminated', label: 'منتهي', labelEn: 'Terminated', color: 'bg-red-500/10 text-red-500' },
  { value: 'resigned', label: 'مستقيل', labelEn: 'Resigned', color: 'bg-purple-500/10 text-purple-500' },
] as const

export const genders = [
  { value: 'male', label: 'ذكر', labelEn: 'Male' },
  { value: 'female', label: 'أنثى', labelEn: 'Female' },
] as const

export const maritalStatuses = [
  { value: 'single', label: 'أعزب', labelEn: 'Single' },
  { value: 'married', label: 'متزوج', labelEn: 'Married' },
  { value: 'divorced', label: 'مطلق', labelEn: 'Divorced' },
  { value: 'widowed', label: 'أرمل', labelEn: 'Widowed' },
] as const

export const employeeStatusColors = new Map([
  ['active', 'bg-green-500/10 text-green-500 border-green-500/20'],
  ['inactive', 'bg-gray-500/10 text-gray-500 border-gray-500/20'],
  ['on_leave', 'bg-yellow-500/10 text-yellow-500 border-yellow-500/20'],
  ['terminated', 'bg-red-500/10 text-red-500 border-red-500/20'],
  ['resigned', 'bg-purple-500/10 text-purple-500 border-purple-500/20'],
])

export const departmentColors = new Map([
  ['legal', 'bg-blue-500/10 text-blue-500'],
  ['finance', 'bg-green-500/10 text-green-500'],
  ['hr', 'bg-purple-500/10 text-purple-500'],
  ['admin', 'bg-gray-500/10 text-gray-500'],
  ['it', 'bg-cyan-500/10 text-cyan-500'],
  ['marketing', 'bg-pink-500/10 text-pink-500'],
  ['operations', 'bg-orange-500/10 text-orange-500'],
  ['other', 'bg-slate-500/10 text-slate-500'],
])
