import {
  Users,
  Scale,
  Contact,
  Building2,
  UsersRound,
  Receipt,
  Clock,
  FileText,
  Bell,
  Tags,
  type LucideIcon,
} from 'lucide-react'
import type { EntityType, ExportFormat } from '@/services/dataExportService'

export const entityTypes: {
  value: EntityType
  label: string
  labelAr: string
  icon: LucideIcon
}[] = [
  { value: 'clients', label: 'Clients', labelAr: 'العملاء', icon: Users },
  { value: 'cases', label: 'Cases', labelAr: 'القضايا', icon: Scale },
  { value: 'contacts', label: 'Contacts', labelAr: 'جهات الاتصال', icon: Contact },
  { value: 'organizations', label: 'Organizations', labelAr: 'المنظمات', icon: Building2 },
  { value: 'staff', label: 'Staff', labelAr: 'فريق العمل', icon: UsersRound },
  { value: 'invoices', label: 'Invoices', labelAr: 'الفواتير', icon: Receipt },
  { value: 'time_entries', label: 'Time Entries', labelAr: 'إدخالات الوقت', icon: Clock },
  { value: 'documents', label: 'Documents', labelAr: 'المستندات', icon: FileText },
  { value: 'followups', label: 'Follow-ups', labelAr: 'المتابعات', icon: Bell },
  { value: 'tags', label: 'Tags', labelAr: 'الوسوم', icon: Tags },
]

export const exportFormats: {
  value: ExportFormat
  label: string
  labelAr: string
  extension: string
  description: string
  descriptionAr: string
}[] = [
  {
    value: 'xlsx',
    label: 'Excel',
    labelAr: 'إكسل',
    extension: '.xlsx',
    description: 'Microsoft Excel format with formatting',
    descriptionAr: 'صيغة مايكروسوفت إكسل مع التنسيق',
  },
  {
    value: 'csv',
    label: 'CSV',
    labelAr: 'CSV',
    extension: '.csv',
    description: 'Comma-separated values for simple data',
    descriptionAr: 'قيم مفصولة بفواصل للبيانات البسيطة',
  },
  {
    value: 'pdf',
    label: 'PDF',
    labelAr: 'PDF',
    extension: '.pdf',
    description: 'Printable PDF document',
    descriptionAr: 'مستند PDF قابل للطباعة',
  },
  {
    value: 'json',
    label: 'JSON',
    labelAr: 'JSON',
    extension: '.json',
    description: 'Machine-readable JSON format',
    descriptionAr: 'صيغة JSON قابلة للقراءة الآلية',
  },
]

export const jobStatuses: {
  value: string
  label: string
  labelAr: string
  color: string
}[] = [
  { value: 'pending', label: 'Pending', labelAr: 'قيد الانتظار', color: 'yellow' },
  { value: 'processing', label: 'Processing', labelAr: 'قيد المعالجة', color: 'blue' },
  { value: 'completed', label: 'Completed', labelAr: 'مكتمل', color: 'green' },
  { value: 'failed', label: 'Failed', labelAr: 'فشل', color: 'red' },
  { value: 'partial', label: 'Partial', labelAr: 'جزئي', color: 'orange' },
]
