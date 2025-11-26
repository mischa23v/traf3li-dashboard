import {
  Clock,
  DollarSign,
  Percent,
  CalendarDays,
  ListTodo,
  Target,
  MessageSquare,
  Gavel,
  FileText,
  Search,
  Users,
  Car,
  Settings,
  MoreHorizontal,
  type LucideIcon,
} from 'lucide-react'

/**
 * Rate Type Options
 */
export const rateTypes = [
  { value: 'hourly', label: 'Hourly', labelAr: 'بالساعة', icon: Clock },
  { value: 'flat', label: 'Flat Fee', labelAr: 'رسوم ثابتة', icon: DollarSign },
  { value: 'contingency', label: 'Contingency', labelAr: 'نسبة من الحكم', icon: Percent },
  { value: 'retainer', label: 'Retainer', labelAr: 'اشتراك', icon: CalendarDays },
  { value: 'task_based', label: 'Task Based', labelAr: 'حسب المهمة', icon: ListTodo },
  { value: 'milestone', label: 'Milestone', labelAr: 'حسب المرحلة', icon: Target },
] as const

/**
 * Get rate type info
 */
export function getRateTypeInfo(type: string): { label: string; labelAr: string; icon: LucideIcon } {
  const found = rateTypes.find((t) => t.value === type)
  return found || { label: type, labelAr: type, icon: DollarSign }
}

/**
 * Rate Category Options
 */
export const rateCategories = [
  { value: 'consultation', label: 'Consultation', labelAr: 'استشارة', icon: MessageSquare },
  { value: 'court_appearance', label: 'Court Appearance', labelAr: 'حضور جلسة', icon: Gavel },
  { value: 'document_preparation', label: 'Document Preparation', labelAr: 'إعداد مستندات', icon: FileText },
  { value: 'research', label: 'Research', labelAr: 'بحث', icon: Search },
  { value: 'meeting', label: 'Meeting', labelAr: 'اجتماع', icon: Users },
  { value: 'travel', label: 'Travel', labelAr: 'سفر/تنقل', icon: Car },
  { value: 'administrative', label: 'Administrative', labelAr: 'إداري', icon: Settings },
  { value: 'other', label: 'Other', labelAr: 'أخرى', icon: MoreHorizontal },
] as const

/**
 * Get rate category info
 */
export function getRateCategoryInfo(category: string): { label: string; labelAr: string; icon: LucideIcon } {
  const found = rateCategories.find((c) => c.value === category)
  return found || { label: category, labelAr: category, icon: MoreHorizontal }
}

/**
 * Currency Options
 */
export const currencies = [
  { value: 'SAR', label: 'Saudi Riyal', labelAr: 'ريال سعودي', symbol: 'ر.س' },
  { value: 'USD', label: 'US Dollar', labelAr: 'دولار أمريكي', symbol: '$' },
  { value: 'EUR', label: 'Euro', labelAr: 'يورو', symbol: '€' },
  { value: 'GBP', label: 'British Pound', labelAr: 'جنيه إسترليني', symbol: '£' },
  { value: 'AED', label: 'UAE Dirham', labelAr: 'درهم إماراتي', symbol: 'د.إ' },
] as const

/**
 * Get currency info
 */
export function getCurrencyInfo(currency: string): { label: string; labelAr: string; symbol: string } {
  const found = currencies.find((c) => c.value === currency)
  return found || { label: currency, labelAr: currency, symbol: currency }
}

/**
 * Time Entry Status Options
 */
export const timeEntryStatuses = [
  { value: 'draft', label: 'Draft', labelAr: 'مسودة', color: 'bg-slate-500' },
  { value: 'approved', label: 'Approved', labelAr: 'معتمد', color: 'bg-blue-500' },
  { value: 'billed', label: 'Billed', labelAr: 'مفوتر', color: 'bg-amber-500' },
  { value: 'paid', label: 'Paid', labelAr: 'مدفوع', color: 'bg-green-500' },
] as const

/**
 * Get time entry status info
 */
export function getTimeEntryStatusInfo(status: string): { label: string; labelAr: string; color: string } {
  const found = timeEntryStatuses.find((s) => s.value === status)
  return found || { label: status, labelAr: status, color: 'bg-slate-500' }
}

/**
 * Applicable To Options
 */
export const applicableToOptions = [
  { value: 'clients', label: 'Clients', labelAr: 'العملاء' },
  { value: 'cases', label: 'Cases', labelAr: 'القضايا' },
  { value: 'services', label: 'Services', labelAr: 'الخدمات' },
] as const

/**
 * Rounding Increment Options (in minutes)
 */
export const roundingIncrements = [
  { value: 1, label: '1 minute', labelAr: '1 دقيقة' },
  { value: 6, label: '6 minutes (1/10 hour)', labelAr: '6 دقائق' },
  { value: 10, label: '10 minutes', labelAr: '10 دقائق' },
  { value: 15, label: '15 minutes (1/4 hour)', labelAr: '15 دقيقة' },
  { value: 30, label: '30 minutes (1/2 hour)', labelAr: '30 دقيقة' },
  { value: 60, label: '60 minutes (1 hour)', labelAr: '60 دقيقة' },
] as const

/**
 * Group Color Options
 */
export const groupColors = [
  { value: '#3B82F6', label: 'Blue', labelAr: 'أزرق' },
  { value: '#10B981', label: 'Green', labelAr: 'أخضر' },
  { value: '#F59E0B', label: 'Amber', labelAr: 'كهرماني' },
  { value: '#EF4444', label: 'Red', labelAr: 'أحمر' },
  { value: '#8B5CF6', label: 'Purple', labelAr: 'بنفسجي' },
  { value: '#EC4899', label: 'Pink', labelAr: 'وردي' },
  { value: '#06B6D4', label: 'Cyan', labelAr: 'سماوي' },
  { value: '#F97316', label: 'Orange', labelAr: 'برتقالي' },
] as const

/**
 * Format currency amount
 */
export function formatAmount(amount: number, currency: string, isArabic: boolean): string {
  const currencyInfo = getCurrencyInfo(currency)
  const formatted = new Intl.NumberFormat(isArabic ? 'ar-SA' : 'en-US', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(amount)

  return isArabic ? `${formatted} ${currencyInfo.symbol}` : `${currencyInfo.symbol}${formatted}`
}

/**
 * Format duration (minutes to readable format)
 */
export function formatDuration(minutes: number, isArabic: boolean): string {
  const hours = Math.floor(minutes / 60)
  const mins = minutes % 60

  if (isArabic) {
    if (hours === 0) return `${mins} دقيقة`
    if (mins === 0) return `${hours} ساعة`
    return `${hours} ساعة و ${mins} دقيقة`
  } else {
    if (hours === 0) return `${mins} min`
    if (mins === 0) return `${hours} hr`
    return `${hours}h ${mins}m`
  }
}
