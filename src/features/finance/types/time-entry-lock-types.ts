/**
 * Time Entry Locking Types
 */

export type TimeEntryLockReason = 'approved' | 'billed' | 'period_closed' | 'manual'

export interface TimeEntryLockStatus {
  isLocked: boolean
  lockReason?: TimeEntryLockReason
  lockedAt?: string
  lockedBy?: string | { _id: string; firstName: string; lastName: string }
  unlockHistory?: TimeEntryUnlockRecord[]
}

export interface TimeEntryUnlockRecord {
  unlockedAt: string
  unlockedBy: string | { _id: string; firstName: string; lastName: string }
  reason: string
  relockedAt?: string
}

export interface LockTimeEntryData {
  entryId: string
  reason: TimeEntryLockReason
}

export interface UnlockTimeEntryData {
  entryId: string
  reason: string
}

export interface BulkLockTimeEntriesData {
  entryIds: string[]
  reason: TimeEntryLockReason
}

export interface LockByDateRangeData {
  startDate: string
  endDate: string
  reason: 'period_closed' | 'manual'
}

export interface LockOperationResult {
  locked: number
  failed: number
  results: Array<{
    entryId: string
    success: boolean
    error?: string
  }>
}

/**
 * Lock reason display names (Arabic)
 */
export const LOCK_REASON_LABELS: Record<TimeEntryLockReason, string> = {
  approved: 'تمت الموافقة',
  billed: 'تمت الفوترة',
  period_closed: 'إغلاق الفترة المالية',
  manual: 'قفل يدوي',
}

/**
 * Lock reason descriptions (Arabic)
 */
export const LOCK_REASON_DESCRIPTIONS: Record<TimeEntryLockReason, string> = {
  approved: 'تم قفل السجل بعد الموافقة عليه',
  billed: 'تم قفل السجل بعد إضافته إلى فاتورة',
  period_closed: 'تم قفل السجل بسبب إغلاق الفترة المالية',
  manual: 'تم قفل السجل يدوياً من قبل المسؤول',
}

/**
 * Check if a lock reason allows unlocking
 */
export function canUnlockReason(reason: TimeEntryLockReason): boolean {
  // Period closed and billed entries require special permissions
  return reason === 'manual' || reason === 'approved'
}

/**
 * Get lock reason badge variant
 */
export function getLockReasonVariant(reason: TimeEntryLockReason): 'default' | 'secondary' | 'destructive' | 'outline' {
  switch (reason) {
    case 'approved':
      return 'default'
    case 'billed':
      return 'secondary'
    case 'period_closed':
      return 'destructive'
    case 'manual':
      return 'outline'
    default:
      return 'outline'
  }
}
