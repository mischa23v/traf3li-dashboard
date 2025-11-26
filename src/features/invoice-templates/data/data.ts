import {
  FileText,
  FileSpreadsheet,
  FileMinus,
  Receipt,
  Heart,
  Settings,
  type LucideIcon,
} from 'lucide-react'

export const templateTypes: {
  value: string
  label: string
  labelAr: string
  icon: LucideIcon
  description: string
  descriptionAr: string
}[] = [
  {
    value: 'standard',
    label: 'Standard',
    labelAr: 'قياسي',
    icon: FileText,
    description: 'Standard invoice template with all basic fields',
    descriptionAr: 'قالب فاتورة قياسي مع جميع الحقول الأساسية',
  },
  {
    value: 'detailed',
    label: 'Detailed',
    labelAr: 'تفصيلي',
    icon: FileSpreadsheet,
    description: 'Detailed breakdown with time entries and expenses',
    descriptionAr: 'تفصيل شامل مع إدخالات الوقت والمصروفات',
  },
  {
    value: 'summary',
    label: 'Summary',
    labelAr: 'ملخص',
    icon: FileMinus,
    description: 'Simplified summary invoice',
    descriptionAr: 'فاتورة ملخصة مبسطة',
  },
  {
    value: 'retainer',
    label: 'Retainer',
    labelAr: 'أتعاب مقدمة',
    icon: Receipt,
    description: 'Template for retainer billing',
    descriptionAr: 'قالب لفواتير الأتعاب المقدمة',
  },
  {
    value: 'pro_bono',
    label: 'Pro Bono',
    labelAr: 'تطوعي',
    icon: Heart,
    description: 'Template for pro bono work documentation',
    descriptionAr: 'قالب لتوثيق العمل التطوعي',
  },
  {
    value: 'custom',
    label: 'Custom',
    labelAr: 'مخصص',
    icon: Settings,
    description: 'Fully customizable template',
    descriptionAr: 'قالب قابل للتخصيص بالكامل',
  },
]

export const fontFamilies: { value: string; label: string; labelAr: string }[] = [
  { value: 'cairo', label: 'Cairo', labelAr: 'القاهرة' },
  { value: 'tajawal', label: 'Tajawal', labelAr: 'تجول' },
  { value: 'arial', label: 'Arial', labelAr: 'أريال' },
  { value: 'times', label: 'Times New Roman', labelAr: 'تايمز نيو رومان' },
]

export const fontSizes: { value: string; label: string; labelAr: string }[] = [
  { value: 'small', label: 'Small', labelAr: 'صغير' },
  { value: 'medium', label: 'Medium', labelAr: 'متوسط' },
  { value: 'large', label: 'Large', labelAr: 'كبير' },
]

export const tableStyles: { value: string; label: string; labelAr: string }[] = [
  { value: 'striped', label: 'Striped', labelAr: 'مخطط' },
  { value: 'bordered', label: 'Bordered', labelAr: 'محدود' },
  { value: 'minimal', label: 'Minimal', labelAr: 'بسيط' },
]

export const pageSizes: { value: string; label: string; labelAr: string }[] = [
  { value: 'a4', label: 'A4', labelAr: 'A4' },
  { value: 'letter', label: 'Letter', labelAr: 'ليتر' },
]

export const orientations: { value: string; label: string; labelAr: string }[] = [
  { value: 'portrait', label: 'Portrait', labelAr: 'عمودي' },
  { value: 'landscape', label: 'Landscape', labelAr: 'أفقي' },
]

export const logoPositions: { value: string; label: string; labelAr: string }[] = [
  { value: 'left', label: 'Left', labelAr: 'يسار' },
  { value: 'center', label: 'Center', labelAr: 'وسط' },
  { value: 'right', label: 'Right', labelAr: 'يمين' },
]

export const vatDisplayModes: { value: string; label: string; labelAr: string }[] = [
  { value: 'inclusive', label: 'Inclusive (VAT included in prices)', labelAr: 'شامل (الأسعار تشمل الضريبة)' },
  { value: 'exclusive', label: 'Exclusive (VAT added separately)', labelAr: 'منفصل (الضريبة تضاف بشكل منفصل)' },
  { value: 'none', label: 'None (No VAT)', labelAr: 'بدون ضريبة' },
]

export const templateColors: { value: string; label: string; labelAr: string }[] = [
  { value: '#1E40AF', label: 'Blue', labelAr: 'أزرق' },
  { value: '#047857', label: 'Green', labelAr: 'أخضر' },
  { value: '#7C3AED', label: 'Purple', labelAr: 'بنفسجي' },
  { value: '#DC2626', label: 'Red', labelAr: 'أحمر' },
  { value: '#D97706', label: 'Orange', labelAr: 'برتقالي' },
  { value: '#0891B2', label: 'Teal', labelAr: 'أزرق مخضر' },
  { value: '#4B5563', label: 'Gray', labelAr: 'رمادي' },
  { value: '#0F172A', label: 'Dark', labelAr: 'داكن' },
]
