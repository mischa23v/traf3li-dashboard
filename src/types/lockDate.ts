/**
 * Lock Date Types
 * For fiscal period management and date locking
 */

// ═══════════════════════════════════════════════════════════════
// LOCK TYPE DEFINITIONS
// ═══════════════════════════════════════════════════════════════

export type LockType = 'fiscal' | 'tax' | 'purchase' | 'sale' | 'hard'

export interface LockTypeConfig {
  key: LockType
  label: string
  labelAr: string
  description: string
  descriptionAr: string
  requiresAdmin?: boolean
  color: string
}

export const LOCK_TYPE_CONFIGS: LockTypeConfig[] = [
  {
    key: 'fiscal',
    label: 'Fiscal Lock',
    labelAr: 'القفل المالي',
    description: 'Prevent modifications to accounting entries before this date',
    descriptionAr: 'منع تعديل القيود المحاسبية قبل هذا التاريخ',
    color: 'blue',
  },
  {
    key: 'tax',
    label: 'Tax Lock',
    labelAr: 'قفل الضرائب',
    description: 'Prevent modifications to tax-related entries before this date',
    descriptionAr: 'منع تعديل القيود الضريبية قبل هذا التاريخ',
    color: 'green',
  },
  {
    key: 'purchase',
    label: 'Purchase Lock',
    labelAr: 'قفل المشتريات',
    description: 'Prevent modifications to purchase entries before this date',
    descriptionAr: 'منع تعديل سجلات المشتريات قبل هذا التاريخ',
    color: 'purple',
  },
  {
    key: 'sale',
    label: 'Sale Lock',
    labelAr: 'قفل المبيعات',
    description: 'Prevent modifications to sales entries before this date',
    descriptionAr: 'منع تعديل سجلات المبيعات قبل هذا التاريخ',
    color: 'orange',
  },
  {
    key: 'hard',
    label: 'Hard Lock',
    labelAr: 'القفل النهائي',
    description: 'Absolutely no modifications allowed before this date (Admin only)',
    descriptionAr: 'لا يمكن تعديل أي سجلات قبل هذا التاريخ (المسؤول فقط)',
    requiresAdmin: true,
    color: 'red',
  },
]

// ═══════════════════════════════════════════════════════════════
// PERIOD LOCK INTERFACE
// ═══════════════════════════════════════════════════════════════

export interface PeriodLockUser {
  _id: string
  firstName: string
  lastName: string
}

export interface PeriodLock {
  _id?: string
  period_name: string
  period_name_ar?: string
  start_date: string
  end_date: string
  locked_at: string
  locked_by: PeriodLockUser | string
  reopened_at?: string
  reopened_by?: PeriodLockUser | string
  reopen_reason?: string
  reopen_reason_ar?: string
  is_locked: boolean
}

// ═══════════════════════════════════════════════════════════════
// LOCK DATE CONFIGURATION
// ═══════════════════════════════════════════════════════════════

export interface FiscalYearEnd {
  month: number // 1-12
  day: number // 1-31
}

export interface LockDateConfig {
  _id: string
  firmId: string
  fiscalLockDate?: string
  taxLockDate?: string
  purchaseLockDate?: string
  saleLockDate?: string
  hardLockDate?: string
  fiscalYearEnd: FiscalYearEnd
  periodLockHistory: PeriodLock[]
  createdAt: string
  updatedAt: string
}

// ═══════════════════════════════════════════════════════════════
// LOCK DATE UPDATES
// ═══════════════════════════════════════════════════════════════

export interface UpdateLockDateData {
  lock_date: string
  reason?: string
  reasonAr?: string
}

export interface LockPeriodData {
  period_name: string
  period_name_ar?: string
  start_date: string
  end_date: string
}

export interface ReopenPeriodData {
  period_id: string
  reason: string
  reasonAr?: string
}

// ═══════════════════════════════════════════════════════════════
// LOCK CHECK RESULT
// ═══════════════════════════════════════════════════════════════

export interface LockCheckResult {
  is_locked: boolean
  lock_date?: string
  lock_type?: LockType
  message?: string
  messageAr?: string
}

// ═══════════════════════════════════════════════════════════════
// LOCK DATE HISTORY
// ═══════════════════════════════════════════════════════════════

export interface LockDateHistoryEntry {
  _id: string
  lock_type: LockType
  previous_date?: string
  new_date: string
  changed_by: PeriodLockUser | string
  changed_at: string
  reason?: string
  reasonAr?: string
}

export interface LockDateHistory {
  entries: LockDateHistoryEntry[]
  total: number
}

// ═══════════════════════════════════════════════════════════════
// FISCAL PERIODS (Generated based on fiscal year)
// ═══════════════════════════════════════════════════════════════

export interface FiscalPeriod {
  period_name: string
  period_name_ar: string
  start_date: string
  end_date: string
  is_current: boolean
  is_locked: boolean
  lock_info?: PeriodLock
}

// ═══════════════════════════════════════════════════════════════
// UTILITY FUNCTIONS
// ═══════════════════════════════════════════════════════════════

export function getLockTypeConfig(lockType: LockType): LockTypeConfig | undefined {
  return LOCK_TYPE_CONFIGS.find((c) => c.key === lockType)
}

export function formatLockDate(date: string | undefined, locale: 'ar' | 'en' = 'ar'): string {
  if (!date) {
    return locale === 'ar' ? 'غير محدد' : 'Not set'
  }
  return new Date(date).toLocaleDateString(locale === 'ar' ? 'ar-SA' : 'en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  })
}
