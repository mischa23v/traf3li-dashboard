/**
 * Time Entry Approval Hooks
 * Add these hooks to useFinance.ts
 * After the existing time tracking hooks section
 */

import { useQuery, useMutation } from '@tanstack/react-query'
import { CACHE_TIMES } from '@/config'
import { toast } from 'sonner'
import financeService from '@/services/financeService'
import { invalidateCache } from '@/lib/cache-invalidation'

// ==================== Cache Configuration ====================
const STATS_STALE_TIME = CACHE_TIMES.LONG // 30 minutes
const STATS_GC_TIME = CACHE_TIMES.GC_LONG // 1 hour
const LIST_STALE_TIME = CACHE_TIMES.MEDIUM // 5 minutes for lists

// ==================== TIME ENTRY APPROVALS ====================

/**
 * Submit time entry for approval
 */
export const useSubmitTimeEntryForApproval = () => {
  return useMutation({
    mutationFn: (id: string) => financeService.submitTimeEntryForApproval(id),
    onSuccess: () => {
      toast.success('تم إرسال السجل للموافقة بنجاح')
    },
    onError: (error: Error) => {
      toast.error(error.message || 'فشل إرسال السجل للموافقة')
    },
    onSettled: async () => {
      await invalidateCache.timeEntries.all()
      return await invalidateCache.timeEntries.pending()
    },
  })
}

/**
 * Approve time entry
 */
export const useApproveTimeEntry = () => {
  return useMutation({
    mutationFn: (id: string) => financeService.approveTimeEntry(id),
    onSuccess: () => {
      toast.success('تمت الموافقة على السجل بنجاح')
    },
    onError: (error: Error) => {
      toast.error(error.message || 'فشلت الموافقة على السجل')
    },
    onSettled: async () => {
      await invalidateCache.timeEntries.all()
      return await invalidateCache.timeEntries.pending()
    },
  })
}

/**
 * Reject time entry
 */
export const useRejectTimeEntry = () => {
  return useMutation({
    mutationFn: ({ id, reason }: { id: string; reason: string }) =>
      financeService.rejectTimeEntry(id, reason),
    onSuccess: () => {
      toast.success('تم رفض السجل بنجاح')
    },
    onError: (error: Error) => {
      toast.error(error.message || 'فشل رفض السجل')
    },
    onSettled: async () => {
      await invalidateCache.timeEntries.all()
      return await invalidateCache.timeEntries.pending()
    },
  })
}

/**
 * Request changes on time entry
 */
export const useRequestTimeEntryChanges = () => {
  return useMutation({
    mutationFn: ({ id, comments }: { id: string; comments: string }) =>
      financeService.requestTimeEntryChanges(id, comments),
    onSuccess: () => {
      toast.success('تم طلب التعديلات بنجاح')
    },
    onError: (error: Error) => {
      toast.error(error.message || 'فشل طلب التعديلات')
    },
    onSettled: async () => {
      await invalidateCache.timeEntries.all()
      return await invalidateCache.timeEntries.pending()
    },
  })
}

/**
 * Bulk submit time entries
 */
export const useBulkSubmitTimeEntries = () => {
  return useMutation({
    mutationFn: (entryIds: string[]) => financeService.bulkSubmitTimeEntries(entryIds),
    onSuccess: (data) => {
      toast.success(`تم إرسال ${data.submitted} سجل للموافقة بنجاح`)
      if (data.failed > 0) {
        toast.warning(`فشل إرسال ${data.failed} سجل`)
      }
    },
    onError: (error: Error) => {
      toast.error(error.message || 'فشل إرسال السجلات للموافقة')
    },
    onSettled: async () => {
      await invalidateCache.timeEntries.all()
      return await invalidateCache.timeEntries.pending()
    },
  })
}

/**
 * Bulk approve time entries
 */
export const useBulkApproveTimeEntries = () => {
  return useMutation({
    mutationFn: (entryIds: string[]) => financeService.bulkApproveTimeEntries(entryIds),
    onSuccess: (data) => {
      toast.success(`تمت الموافقة على ${data.approved} سجل بنجاح`)
      if (data.failed > 0) {
        toast.warning(`فشلت الموافقة على ${data.failed} سجل`)
      }
    },
    onError: (error: Error) => {
      toast.error(error.message || 'فشلت الموافقة على السجلات')
    },
    onSettled: async () => {
      await invalidateCache.timeEntries.all()
      return await invalidateCache.timeEntries.pending()
    },
  })
}

/**
 * Bulk reject time entries
 */
export const useBulkRejectTimeEntries = () => {
  return useMutation({
    mutationFn: ({ entryIds, reason }: { entryIds: string[]; reason: string }) =>
      financeService.bulkRejectTimeEntries(entryIds, reason),
    onSuccess: (data) => {
      toast.success(`تم رفض ${data.rejected} سجل بنجاح`)
      if (data.failed > 0) {
        toast.warning(`فشل رفض ${data.failed} سجل`)
      }
    },
    onError: (error: Error) => {
      toast.error(error.message || 'فشل رفض السجلات')
    },
    onSettled: async () => {
      await invalidateCache.timeEntries.all()
      return await invalidateCache.timeEntries.pending()
    },
  })
}

/**
 * Get pending time entries (for approval queue)
 */
export const usePendingTimeEntries = (filters?: {
  userId?: string
  startDate?: string
  endDate?: string
  caseId?: string
}) => {
  return useQuery({
    queryKey: ['pendingTimeEntries', filters],
    queryFn: () => financeService.getPendingTimeEntries(filters),
    staleTime: LIST_STALE_TIME,
    gcTime: STATS_GC_TIME,
  })
}

/**
 * INSTRUCTIONS FOR MERGING:
 *
 * 1. Open src/hooks/useFinance.ts
 * 2. Find the time tracking section (after useDeleteTimeEntry around line 850)
 * 3. Add all the hooks above before the PAYMENTS section
 * 4. Make sure to export all the new hooks
 * 5. Update the imports at the top if needed (they should already be there)
 */
