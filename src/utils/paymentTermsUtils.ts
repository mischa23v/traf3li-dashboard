/**
 * Payment Terms Utilities
 * Helper functions for working with payment terms
 */

import type { PaymentTerms } from '@/services/paymentTermsService'

/**
 * Calculate due date based on issue date and payment terms
 */
export function calculateDueDate(issueDate: Date | string, dueDays: number): Date {
  const date = new Date(issueDate)
  date.setDate(date.getDate() + dueDays)
  return date
}

/**
 * Calculate discount deadline based on issue date and discount days
 */
export function calculateDiscountDeadline(
  issueDate: Date | string,
  discountDays?: number
): Date | null {
  if (!discountDays || discountDays <= 0) return null

  const date = new Date(issueDate)
  date.setDate(date.getDate() + discountDays)
  return date
}

/**
 * Calculate discounted amount based on original amount and discount percentage
 */
export function calculateDiscountedAmount(
  amount: number,
  discountPercent?: number
): number {
  if (!discountPercent || discountPercent <= 0) return amount

  const discount = (amount * discountPercent) / 100
  return amount - discount
}

/**
 * Calculate discount amount
 */
export function calculateDiscountAmount(
  amount: number,
  discountPercent?: number
): number {
  if (!discountPercent || discountPercent <= 0) return 0

  return (amount * discountPercent) / 100
}

/**
 * Check if payment is eligible for early payment discount
 */
export function isEligibleForDiscount(
  issueDate: Date | string,
  paymentDate: Date | string,
  discountDays?: number
): boolean {
  if (!discountDays || discountDays <= 0) return false

  const deadline = calculateDiscountDeadline(issueDate, discountDays)
  if (!deadline) return false

  const payment = new Date(paymentDate)
  return payment <= deadline
}

/**
 * Format payment terms for display
 */
export function formatPaymentTerms(terms: PaymentTerms, language: 'ar' | 'en' = 'ar'): string {
  const name = language === 'ar' ? terms.nameAr : terms.name

  if (terms.discountPercent && terms.discountDays && terms.discountPercent > 0) {
    return language === 'ar'
      ? `${terms.discountPercent}% خصم خلال ${terms.discountDays} يوم، وإلا صافي ${terms.dueDays} يوم`
      : `${terms.discountPercent}% discount within ${terms.discountDays} days, otherwise net ${terms.dueDays} days`
  }

  return name
}

/**
 * Get payment terms summary for invoice/quote
 */
export function getPaymentTermsSummary(
  terms: PaymentTerms,
  issueDate: Date | string,
  language: 'ar' | 'en' = 'ar'
): {
  dueDate: Date
  dueDateFormatted: string
  discountDeadline?: Date
  discountDeadlineFormatted?: string
  discountPercent?: number
  discountAmount?: number
  hasDiscount: boolean
  displayText: string
} {
  const dueDate = calculateDueDate(issueDate, terms.dueDays)
  const discountDeadline = calculateDiscountDeadline(issueDate, terms.discountDays)

  const dueDateFormatted = dueDate.toLocaleDateString(
    language === 'ar' ? 'ar-SA' : 'en-US',
    { year: 'numeric', month: 'long', day: 'numeric' }
  )

  const discountDeadlineFormatted = discountDeadline?.toLocaleDateString(
    language === 'ar' ? 'ar-SA' : 'en-US',
    { year: 'numeric', month: 'long', day: 'numeric' }
  )

  const hasDiscount = !!(terms.discountPercent && terms.discountDays && terms.discountPercent > 0)

  let displayText = formatPaymentTerms(terms, language)

  return {
    dueDate,
    dueDateFormatted,
    discountDeadline: discountDeadline || undefined,
    discountDeadlineFormatted,
    discountPercent: terms.discountPercent,
    hasDiscount,
    displayText,
  }
}

/**
 * Calculate end of month date
 */
export function calculateEndOfMonth(date: Date | string): Date {
  const d = new Date(date)
  return new Date(d.getFullYear(), d.getMonth() + 1, 0)
}

/**
 * Calculate end of following month date
 */
export function calculateEndOfFollowingMonth(date: Date | string): Date {
  const d = new Date(date)
  return new Date(d.getFullYear(), d.getMonth() + 2, 0)
}

/**
 * Get pre-built payment terms templates
 */
export function getPreBuiltTemplates() {
  return [
    {
      name: 'Due on Receipt',
      nameAr: 'استحقاق عند الاستلام',
      description: 'Payment is due immediately upon receipt',
      descriptionAr: 'الدفع مستحق فوراً عند الاستلام',
      dueDays: 0,
    },
    {
      name: 'Net 7',
      nameAr: 'صافي 7 أيام',
      description: 'Payment due within 7 days',
      descriptionAr: 'الدفع مستحق خلال 7 أيام',
      dueDays: 7,
    },
    {
      name: 'Net 15',
      nameAr: 'صافي 15 يوم',
      description: 'Payment due within 15 days',
      descriptionAr: 'الدفع مستحق خلال 15 يوم',
      dueDays: 15,
    },
    {
      name: 'Net 30',
      nameAr: 'صافي 30 يوم',
      description: 'Payment due within 30 days',
      descriptionAr: 'الدفع مستحق خلال 30 يوم',
      dueDays: 30,
    },
    {
      name: 'Net 45',
      nameAr: 'صافي 45 يوم',
      description: 'Payment due within 45 days',
      descriptionAr: 'الدفع مستحق خلال 45 يوم',
      dueDays: 45,
    },
    {
      name: 'Net 60',
      nameAr: 'صافي 60 يوم',
      description: 'Payment due within 60 days',
      descriptionAr: 'الدفع مستحق خلال 60 يوم',
      dueDays: 60,
    },
    {
      name: 'Net 90',
      nameAr: 'صافي 90 يوم',
      description: 'Payment due within 90 days',
      descriptionAr: 'الدفع مستحق خلال 90 يوم',
      dueDays: 90,
    },
    {
      name: '2/10 Net 30',
      nameAr: '2/10 صافي 30',
      description: '2% discount if paid within 10 days, otherwise net 30',
      descriptionAr: 'خصم 2% إذا تم الدفع خلال 10 أيام، وإلا صافي 30 يوم',
      dueDays: 30,
      discountDays: 10,
      discountPercent: 2,
    },
    {
      name: '1/15 Net 45',
      nameAr: '1/15 صافي 45',
      description: '1% discount if paid within 15 days, otherwise net 45',
      descriptionAr: 'خصم 1% إذا تم الدفع خلال 15 يوم، وإلا صافي 45 يوم',
      dueDays: 45,
      discountDays: 15,
      discountPercent: 1,
    },
    {
      name: 'End of Month',
      nameAr: 'نهاية الشهر',
      description: 'Payment due at the end of the current month',
      descriptionAr: 'الدفع مستحق في نهاية الشهر الحالي',
      dueDays: 30, // Approximate, actual calculation should use calculateEndOfMonth
    },
    {
      name: 'End of Following Month',
      nameAr: 'نهاية الشهر التالي',
      description: 'Payment due at the end of the following month',
      descriptionAr: 'الدفع مستحق في نهاية الشهر التالي',
      dueDays: 60, // Approximate, actual calculation should use calculateEndOfFollowingMonth
    },
  ]
}
