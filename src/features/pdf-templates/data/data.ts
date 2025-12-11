import {
  FileText,
  FileSpreadsheet,
  FileMinus,
  Receipt,
  FileContract,
  Mail,
  Award,
  Settings,
  type LucideIcon,
} from 'lucide-react'

export const templateCategories: {
  value: string
  label: string
  labelAr: string
  icon: LucideIcon
}[] = [
  {
    value: 'invoice',
    label: 'Invoice',
    labelAr: 'فاتورة',
    icon: FileText,
  },
  {
    value: 'contract',
    label: 'Contract',
    labelAr: 'عقد',
    icon: FileContract,
  },
  {
    value: 'receipt',
    label: 'Receipt',
    labelAr: 'إيصال',
    icon: Receipt,
  },
  {
    value: 'report',
    label: 'Report',
    labelAr: 'تقرير',
    icon: FileSpreadsheet,
  },
  {
    value: 'statement',
    label: 'Statement',
    labelAr: 'كشف حساب',
    icon: FileMinus,
  },
  {
    value: 'letter',
    label: 'Letter',
    labelAr: 'خطاب',
    icon: Mail,
  },
  {
    value: 'certificate',
    label: 'Certificate',
    labelAr: 'شهادة',
    icon: Award,
  },
  {
    value: 'custom',
    label: 'Custom',
    labelAr: 'مخصص',
    icon: Settings,
  },
]

export const templateTypes: {
  value: string
  label: string
  labelAr: string
  icon: LucideIcon
}[] = [
  {
    value: 'standard',
    label: 'Standard',
    labelAr: 'قياسي',
    icon: FileText,
  },
  {
    value: 'detailed',
    label: 'Detailed',
    labelAr: 'تفصيلي',
    icon: FileSpreadsheet,
  },
  {
    value: 'summary',
    label: 'Summary',
    labelAr: 'ملخص',
    icon: FileMinus,
  },
  {
    value: 'minimal',
    label: 'Minimal',
    labelAr: 'بسيط',
    icon: FileMinus,
  },
  {
    value: 'custom',
    label: 'Custom',
    labelAr: 'مخصص',
    icon: Settings,
  },
]
