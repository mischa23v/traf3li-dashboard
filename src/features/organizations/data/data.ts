import {
  Building2,
  Landmark,
  Scale,
  Briefcase,
  Heart,
  MoreHorizontal,
} from 'lucide-react'

// Organization status colors
export const organizationStatusColors = new Map<string, string>([
  ['active', 'bg-green-100/50 text-green-700 border-green-200 dark:bg-green-900/20 dark:text-green-400 dark:border-green-800'],
  ['inactive', 'bg-gray-100/50 text-gray-700 border-gray-200 dark:bg-gray-900/20 dark:text-gray-400 dark:border-gray-800'],
  ['archived', 'bg-orange-100/50 text-orange-700 border-orange-200 dark:bg-orange-900/20 dark:text-orange-400 dark:border-orange-800'],
])

// Organization types with icons
export const organizationTypes = [
  { value: 'company', label: 'Company', icon: Building2 },
  { value: 'government', label: 'Government', icon: Landmark },
  { value: 'court', label: 'Court', icon: Scale },
  { value: 'law_firm', label: 'Law Firm', icon: Briefcase },
  { value: 'nonprofit', label: 'Nonprofit', icon: Heart },
  { value: 'other', label: 'Other', icon: MoreHorizontal },
] as const

// Organization sizes
export const organizationSizes = [
  { value: 'small', label: 'Small (1-50)' },
  { value: 'medium', label: 'Medium (51-200)' },
  { value: 'large', label: 'Large (201-1000)' },
  { value: 'enterprise', label: 'Enterprise (1000+)' },
] as const

// Organization statuses
export const organizationStatuses = [
  { value: 'active', label: 'Active' },
  { value: 'inactive', label: 'Inactive' },
  { value: 'archived', label: 'Archived' },
] as const
