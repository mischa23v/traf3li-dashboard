import {
  User,
  Building2,
  Scale,
  Briefcase,
  GraduationCap,
  Landmark,
  MoreHorizontal,
  UserCheck,
  UserX,
  Users,
  Shield,
  Gavel,
  UserCog,
} from 'lucide-react'

// Contact status colors
export const contactStatusColors = new Map<string, string>([
  ['active', 'bg-green-100/50 text-green-700 border-green-200 dark:bg-green-900/20 dark:text-green-400 dark:border-green-800'],
  ['inactive', 'bg-gray-100/50 text-gray-700 border-gray-200 dark:bg-gray-900/20 dark:text-gray-500 dark:border-gray-800'],
  ['archived', 'bg-orange-100/50 text-orange-700 border-orange-200 dark:bg-orange-900/20 dark:text-orange-400 dark:border-orange-800'],
  ['deceased', 'bg-red-100/50 text-red-700 border-red-200 dark:bg-red-900/20 dark:text-red-400 dark:border-red-800'],
])

// Contact types with icons
export const contactTypes = [
  { value: 'individual', label: 'Individual', icon: User },
  { value: 'organization', label: 'Organization', icon: Building2 },
  { value: 'court', label: 'Court', icon: Scale },
  { value: 'attorney', label: 'Attorney', icon: Briefcase },
  { value: 'expert', label: 'Expert', icon: GraduationCap },
  { value: 'government', label: 'Government', icon: Landmark },
  { value: 'other', label: 'Other', icon: MoreHorizontal },
] as const

// Contact categories
export const contactCategories = [
  { value: 'client_contact', label: 'Client Contact', icon: UserCheck },
  { value: 'opposing_party', label: 'Opposing Party', icon: UserX },
  { value: 'witness', label: 'Witness', icon: Users },
  { value: 'expert_witness', label: 'Expert Witness', icon: Shield },
  { value: 'judge', label: 'Judge', icon: Gavel },
  { value: 'court_clerk', label: 'Court Clerk', icon: UserCog },
  { value: 'other', label: 'Other', icon: MoreHorizontal },
] as const

// Contact statuses
export const contactStatuses = [
  { value: 'active', label: 'Active' },
  { value: 'inactive', label: 'Inactive' },
  { value: 'archived', label: 'Archived' },
  { value: 'deceased', label: 'Deceased' },
] as const
