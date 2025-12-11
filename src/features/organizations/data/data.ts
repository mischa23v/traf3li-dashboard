import {
  Building2,
  Landmark,
  Scale,
  Briefcase,
  Building,
  Globe,
  Heart,
  MoreHorizontal,
} from 'lucide-react'

// Organization status colors
export const organizationStatusColors = new Map<string, string>([
  ['active', 'bg-green-100/50 text-green-700 border-green-200 dark:bg-green-900/20 dark:text-green-400 dark:border-green-800'],
  ['inactive', 'bg-gray-100/50 text-gray-700 border-gray-200 dark:bg-gray-900/20 dark:text-gray-500 dark:border-gray-800'],
  ['suspended', 'bg-yellow-100/50 text-yellow-700 border-yellow-200 dark:bg-yellow-900/20 dark:text-yellow-400 dark:border-yellow-800'],
  ['dissolved', 'bg-red-100/50 text-red-700 border-red-200 dark:bg-red-900/20 dark:text-red-400 dark:border-red-800'],
  ['pending', 'bg-blue-100/50 text-blue-700 border-blue-200 dark:bg-blue-900/20 dark:text-blue-400 dark:border-blue-800'],
  ['archived', 'bg-orange-100/50 text-orange-700 border-orange-200 dark:bg-orange-900/20 dark:text-orange-400 dark:border-orange-800'],
])

// Organization types with icons
export const organizationTypes = [
  { value: 'llc', label: 'LLC', icon: Building2 },
  { value: 'joint_stock', label: 'Joint Stock', icon: Building },
  { value: 'partnership', label: 'Partnership', icon: Briefcase },
  { value: 'sole_proprietorship', label: 'Sole Proprietorship', icon: Building2 },
  { value: 'branch', label: 'Branch', icon: Building },
  { value: 'government', label: 'Government', icon: Landmark },
  { value: 'nonprofit', label: 'Nonprofit', icon: Heart },
  { value: 'professional', label: 'Professional', icon: Briefcase },
  { value: 'holding', label: 'Holding', icon: Globe },
  { value: 'company', label: 'Company', icon: Building2 },
  { value: 'court', label: 'Court', icon: Scale },
  { value: 'law_firm', label: 'Law Firm', icon: Scale },
  { value: 'other', label: 'Other', icon: MoreHorizontal },
] as const

// Organization sizes
export const organizationSizes = [
  { value: 'micro', label: 'Micro' },
  { value: 'small', label: 'Small' },
  { value: 'medium', label: 'Medium' },
  { value: 'large', label: 'Large' },
  { value: 'enterprise', label: 'Enterprise' },
] as const

// Organization statuses
export const organizationStatuses = [
  { value: 'active', label: 'Active' },
  { value: 'inactive', label: 'Inactive' },
  { value: 'suspended', label: 'Suspended' },
  { value: 'dissolved', label: 'Dissolved' },
  { value: 'pending', label: 'Pending' },
  { value: 'archived', label: 'Archived' },
] as const
