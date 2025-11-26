import { Scale, Users, Contact, FileText, Globe } from 'lucide-react'

// Predefined tag colors
export const tagColors = [
  { value: '#EF4444', label: 'Red', labelAr: 'أحمر' },
  { value: '#F97316', label: 'Orange', labelAr: 'برتقالي' },
  { value: '#F59E0B', label: 'Amber', labelAr: 'كهرماني' },
  { value: '#EAB308', label: 'Yellow', labelAr: 'أصفر' },
  { value: '#84CC16', label: 'Lime', labelAr: 'ليموني' },
  { value: '#22C55E', label: 'Green', labelAr: 'أخضر' },
  { value: '#10B981', label: 'Emerald', labelAr: 'زمردي' },
  { value: '#14B8A6', label: 'Teal', labelAr: 'أخضر مزرق' },
  { value: '#06B6D4', label: 'Cyan', labelAr: 'سماوي' },
  { value: '#0EA5E9', label: 'Sky', labelAr: 'سماوي فاتح' },
  { value: '#3B82F6', label: 'Blue', labelAr: 'أزرق' },
  { value: '#6366F1', label: 'Indigo', labelAr: 'نيلي' },
  { value: '#8B5CF6', label: 'Violet', labelAr: 'بنفسجي' },
  { value: '#A855F7', label: 'Purple', labelAr: 'أرجواني' },
  { value: '#D946EF', label: 'Fuchsia', labelAr: 'فوشيا' },
  { value: '#EC4899', label: 'Pink', labelAr: 'وردي' },
  { value: '#F43F5E', label: 'Rose', labelAr: 'وردي غامق' },
  { value: '#78716C', label: 'Stone', labelAr: 'رمادي' },
]

// Entity type options for filtering
export const entityTypeOptions = [
  {
    value: 'all',
    label: 'All Entities',
    labelAr: 'جميع الكيانات',
    icon: Globe,
  },
  {
    value: 'case',
    label: 'Cases',
    labelAr: 'القضايا',
    icon: Scale,
  },
  {
    value: 'client',
    label: 'Clients',
    labelAr: 'العملاء',
    icon: Users,
  },
  {
    value: 'contact',
    label: 'Contacts',
    labelAr: 'جهات الاتصال',
    icon: Contact,
  },
  {
    value: 'document',
    label: 'Documents',
    labelAr: 'المستندات',
    icon: FileText,
  },
]

// Get entity type display info
export function getEntityTypeInfo(type: string) {
  return entityTypeOptions.find((option) => option.value === type) || entityTypeOptions[0]
}

// Get color info
export function getColorInfo(colorValue: string) {
  return tagColors.find((color) => color.value === colorValue)
}
