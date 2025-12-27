/**
 * ⚠️ WARNING: Backend Endpoint Mismatch | تحذير: عدم تطابق نقاط النهاية
 *
 * EN: This hook uses /hr/expense-claims/* endpoints which DO NOT exist in the backend.
 * All mutations will fail with 404 errors until backend implements these endpoints.
 * The expenseClaimsService.ts has bilingual error handling for these failures.
 *
 * AR: تستخدم هذه الدالة نقاط النهاية /hr/expense-claims/* التي لا توجد في الخادم.
 * جميع الطلبات ستفشل بأخطاء 404 حتى يتم تنفيذ هذه النقاط في الخادم.
 * يحتوي expenseClaimsService.ts على معالجة أخطاء ثنائية اللغة لهذه الحالات.
 *
 * @deprecated These endpoints are not implemented in the backend
 * @deprecated نقاط النهاية هذه غير مطبقة في الخادم
 */

import { useQuery, useMutation } from '@tanstack/react-query'
import { CACHE_TIMES } from '@/config'
import { QueryKeys } from '@/lib/query-keys'
import { invalidateCache } from '@/lib/cache-invalidation'
import {
  getExpenseClaims,
  getExpenseClaim,
  createExpenseClaim,
  updateExpenseClaim,
  deleteExpenseClaim,
  getExpenseClaimStats,
  submitExpenseClaim,
  approveExpenseClaim,
  rejectExpenseClaim,
  requestClaimChanges,
  processClaimPayment,
  addLineItem,
  updateLineItem,
  deleteLineItem,
  uploadReceipt,
  deleteReceipt,
  verifyReceipt,
  reconcileCardTransaction,
  checkPolicyCompliance,
  approveException,
  markAsBillable,
  createBillableInvoice,
  bulkDeleteExpenseClaims,
  getEmployeeExpenseClaims,
  getPendingClaimApprovals,
  getPendingPayments,
  getMileageRates,
  getExpensePolicies,
  getCorporateCardTransactions,
  duplicateExpenseClaim,
  exportExpenseClaims,
  type ExpenseClaimFilters,
  type CreateExpenseClaimData,
  type UpdateExpenseClaimData,
  type ExpenseCategory,
  type PaymentMethod,
} from '@/services/expenseClaimsService'

// ==================== Cache Configuration ====================
const STATS_STALE_TIME = CACHE_TIMES.LONG // 30 minutes
const STATS_GC_TIME = CACHE_TIMES.GC_LONG // 1 hour
const LIST_STALE_TIME = CACHE_TIMES.MEDIUM // 5 minutes for lists

/**
 * @deprecated Use QueryKeys.expenseClaims instead
 * Local query keys deprecated in favor of centralized QueryKeys factory
 */
export const expenseClaimKeys = QueryKeys.expenseClaims

// Get all expense claims
export const useExpenseClaims = (filters?: ExpenseClaimFilters) => {
  return useQuery({
    queryKey: expenseClaimKeys.list(filters),
    queryFn: () => getExpenseClaims(filters),
    staleTime: LIST_STALE_TIME,
    gcTime: STATS_GC_TIME,
  })
}

// Get single expense claim
export const useExpenseClaim = (claimId: string) => {
  return useQuery({
    queryKey: expenseClaimKeys.detail(claimId),
    queryFn: () => getExpenseClaim(claimId),
    enabled: !!claimId,
  })
}

// Get expense claim stats
export const useExpenseClaimStats = () => {
  return useQuery({
    queryKey: expenseClaimKeys.stats(),
    queryFn: getExpenseClaimStats,
    staleTime: STATS_STALE_TIME,
    gcTime: STATS_GC_TIME,
  })
}

// Get employee expense claims
export const useEmployeeExpenseClaims = (employeeId: string) => {
  return useQuery({
    queryKey: expenseClaimKeys.byEmployee(employeeId),
    queryFn: () => getEmployeeExpenseClaims(employeeId),
    enabled: !!employeeId,
  })
}

// Get pending approvals
export const usePendingClaimApprovals = () => {
  return useQuery({
    queryKey: expenseClaimKeys.pendingApprovals(),
    queryFn: getPendingClaimApprovals,
    staleTime: LIST_STALE_TIME,
    gcTime: STATS_GC_TIME,
  })
}

// Get pending payments
export const usePendingPayments = () => {
  return useQuery({
    queryKey: expenseClaimKeys.pendingPayments(),
    queryFn: getPendingPayments,
    staleTime: LIST_STALE_TIME,
    gcTime: STATS_GC_TIME,
  })
}

// Get mileage rates
export const useMileageRates = () => {
  return useQuery({
    queryKey: expenseClaimKeys.mileageRates(),
    queryFn: getMileageRates,
    staleTime: STATS_STALE_TIME,
    gcTime: STATS_GC_TIME,
  })
}

// Get expense policies
export const useExpensePolicies = () => {
  return useQuery({
    queryKey: expenseClaimKeys.policies(),
    queryFn: getExpensePolicies,
    staleTime: STATS_STALE_TIME,
    gcTime: STATS_GC_TIME,
  })
}

// Get corporate card transactions
export const useCorporateCardTransactions = (employeeId: string, filters?: {
  dateFrom?: string
  dateTo?: string
  unreconciled?: boolean
}) => {
  return useQuery({
    queryKey: [...expenseClaimKeys.corporateCard(employeeId), filters],
    queryFn: () => getCorporateCardTransactions(employeeId, filters),
    enabled: !!employeeId,
  })
}

// Create expense claim
/**
 * @deprecated Backend endpoint not implemented - POST /hr/expense-claims
 * @deprecated نقطة النهاية غير مطبقة في الخادم
 */
export const useCreateExpenseClaim = () => {
  return useMutation({
    mutationFn: (data: CreateExpenseClaimData) => {
      console.warn(
        '⚠️  ENDPOINT NOT IMPLEMENTED | نقطة النهاية غير مطبقة\n' +
        'useCreateExpenseClaim() calls POST /hr/expense-claims which does not exist in the backend.\n' +
        'useCreateExpenseClaim() تستدعي POST /hr/expense-claims التي لا توجد في الخادم.\n' +
        'This request will fail with 404 error. | سيفشل هذا الطلب بخطأ 404.'
      )
      return createExpenseClaim(data)
    },
    onSuccess: () => {
      invalidateCache.expenseClaims.lists()
      invalidateCache.expenseClaims.stats()
    },
  })
}

// Update expense claim
/**
 * @deprecated Backend endpoint not implemented - PATCH /hr/expense-claims/:id
 * @deprecated نقطة النهاية غير مطبقة في الخادم
 */
export const useUpdateExpenseClaim = () => {
  return useMutation({
    mutationFn: ({ claimId, data }: { claimId: string; data: UpdateExpenseClaimData }) => {
      console.warn(
        '⚠️  ENDPOINT NOT IMPLEMENTED | نقطة النهاية غير مطبقة\n' +
        'useUpdateExpenseClaim() calls PATCH /hr/expense-claims/:id which does not exist in the backend.\n' +
        'useUpdateExpenseClaim() تستدعي PATCH /hr/expense-claims/:id التي لا توجد في الخادم.\n' +
        'This request will fail with 404 error. | سيفشل هذا الطلب بخطأ 404.'
      )
      return updateExpenseClaim(claimId, data)
    },
    onSuccess: (_, { claimId }) => {
      invalidateCache.expenseClaims.detail(claimId)
      invalidateCache.expenseClaims.lists()
    },
  })
}

// Delete expense claim
/**
 * @deprecated Backend endpoint not implemented - DELETE /hr/expense-claims/:id
 * @deprecated نقطة النهاية غير مطبقة في الخادم
 */
export const useDeleteExpenseClaim = () => {
  return useMutation({
    mutationFn: (claimId: string) => {
      console.warn(
        '⚠️  ENDPOINT NOT IMPLEMENTED | نقطة النهاية غير مطبقة\n' +
        'useDeleteExpenseClaim() calls DELETE /hr/expense-claims/:id which does not exist in the backend.\n' +
        'useDeleteExpenseClaim() تستدعي DELETE /hr/expense-claims/:id التي لا توجد في الخادم.\n' +
        'This request will fail with 404 error. | سيفشل هذا الطلب بخطأ 404.'
      )
      return deleteExpenseClaim(claimId)
    },
    onSuccess: () => {
      invalidateCache.expenseClaims.lists()
      invalidateCache.expenseClaims.stats()
    },
  })
}

// Submit expense claim
/**
 * @deprecated Backend endpoint not implemented - POST /hr/expense-claims/:id/submit
 * @deprecated نقطة النهاية غير مطبقة في الخادم
 */
export const useSubmitExpenseClaim = () => {
  return useMutation({
    mutationFn: (claimId: string) => {
      console.warn(
        '⚠️  ENDPOINT NOT IMPLEMENTED | نقطة النهاية غير مطبقة\n' +
        'useSubmitExpenseClaim() calls POST /hr/expense-claims/:id/submit which does not exist in the backend.\n' +
        'useSubmitExpenseClaim() تستدعي POST /hr/expense-claims/:id/submit التي لا توجد في الخادم.\n' +
        'This request will fail with 404 error. | سيفشل هذا الطلب بخطأ 404.'
      )
      return submitExpenseClaim(claimId)
    },
    onSuccess: (_, claimId) => {
      invalidateCache.expenseClaims.detail(claimId)
      invalidateCache.expenseClaims.lists()
      invalidateCache.expenseClaims.pendingApprovals()
    },
  })
}

// Approve expense claim
/**
 * @deprecated Backend endpoint not implemented - POST /hr/expense-claims/:id/approve
 * @deprecated نقطة النهاية غير مطبقة في الخادم
 */
export const useApproveExpenseClaim = () => {
  return useMutation({
    mutationFn: ({ claimId, data }: {
      claimId: string
      data: { approvedAmount?: number; comments?: string }
    }) => {
      console.warn(
        '⚠️  ENDPOINT NOT IMPLEMENTED | نقطة النهاية غير مطبقة\n' +
        'useApproveExpenseClaim() calls POST /hr/expense-claims/:id/approve which does not exist in the backend.\n' +
        'useApproveExpenseClaim() تستدعي POST /hr/expense-claims/:id/approve التي لا توجد في الخادم.\n' +
        'This request will fail with 404 error. | سيفشل هذا الطلب بخطأ 404.'
      )
      return approveExpenseClaim(claimId, data)
    },
    onSuccess: (_, { claimId }) => {
      invalidateCache.expenseClaims.detail(claimId)
      invalidateCache.expenseClaims.lists()
      invalidateCache.expenseClaims.pendingApprovals()
      invalidateCache.expenseClaims.pendingPayments()
      invalidateCache.expenseClaims.stats()
    },
  })
}

// Reject expense claim
export const useRejectExpenseClaim = () => {
  return useMutation({
    mutationFn: ({ claimId, data }: {
      claimId: string
      data: { reason: string; comments?: string }
    }) => rejectExpenseClaim(claimId, data),
    onSuccess: (_, { claimId }) => {
      invalidateCache.expenseClaims.detail(claimId)
      invalidateCache.expenseClaims.lists()
      invalidateCache.expenseClaims.pendingApprovals()
    },
  })
}

// Request changes
export const useRequestClaimChanges = () => {
  return useMutation({
    mutationFn: ({ claimId, data }: {
      claimId: string
      data: { changesRequested: string; lineItemIds?: string[] }
    }) => requestClaimChanges(claimId, data),
    onSuccess: (_, { claimId }) => {
      invalidateCache.expenseClaims.detail(claimId)
      invalidateCache.expenseClaims.lists()
    },
  })
}

// Process payment
/**
 * @deprecated Backend endpoint not implemented - POST /hr/expense-claims/:id/process-payment
 * @deprecated نقطة النهاية غير مطبقة في الخادم
 */
export const useProcessClaimPayment = () => {
  return useMutation({
    mutationFn: ({ claimId, data }: {
      claimId: string
      data: {
        paymentMethod: PaymentMethod
        paymentReference?: string
        bankDetails?: {
          bankName: string
          accountNumber: string
          iban: string
        }
      }
    }) => {
      console.warn(
        '⚠️  ENDPOINT NOT IMPLEMENTED | نقطة النهاية غير مطبقة\n' +
        'useProcessClaimPayment() calls POST /hr/expense-claims/:id/process-payment which does not exist in the backend.\n' +
        'useProcessClaimPayment() تستدعي POST /hr/expense-claims/:id/process-payment التي لا توجد في الخادم.\n' +
        'This request will fail with 404 error. | سيفشل هذا الطلب بخطأ 404.'
      )
      return processClaimPayment(claimId, data)
    },
    onSuccess: (_, { claimId }) => {
      invalidateCache.expenseClaims.detail(claimId)
      invalidateCache.expenseClaims.lists()
      invalidateCache.expenseClaims.pendingPayments()
      invalidateCache.expenseClaims.stats()
    },
  })
}

// Add line item
export const useAddLineItem = () => {
  return useMutation({
    mutationFn: ({ claimId, data }: {
      claimId: string
      data: {
        category: ExpenseCategory
        description: string
        descriptionAr?: string
        expenseDate: string
        vendor?: string
        amount: number
        vatAmount?: number
        currency?: string
        isBillable?: boolean
        clientId?: string
        caseId?: string
      }
    }) => addLineItem(claimId, data),
    onSuccess: (_, { claimId }) => {
      invalidateCache.expenseClaims.detail(claimId)
    },
  })
}

// Update line item
export const useUpdateLineItem = () => {
  return useMutation({
    mutationFn: ({ claimId, lineItemId, data }: {
      claimId: string
      lineItemId: string
      data: {
        category?: ExpenseCategory
        description?: string
        descriptionAr?: string
        expenseDate?: string
        vendor?: string
        amount?: number
        vatAmount?: number
        isBillable?: boolean
        clientId?: string
        caseId?: string
      }
    }) => updateLineItem(claimId, lineItemId, data),
    onSuccess: (_, { claimId }) => {
      invalidateCache.expenseClaims.detail(claimId)
    },
  })
}

// Delete line item
export const useDeleteLineItem = () => {
  return useMutation({
    mutationFn: ({ claimId, lineItemId }: { claimId: string; lineItemId: string }) =>
      deleteLineItem(claimId, lineItemId),
    onSuccess: (_, { claimId }) => {
      invalidateCache.expenseClaims.detail(claimId)
    },
  })
}

// Upload receipt
export const useUploadReceipt = () => {
  return useMutation({
    mutationFn: ({ claimId, data }: { claimId: string; data: FormData }) =>
      uploadReceipt(claimId, data),
    onSuccess: (_, { claimId }) => {
      invalidateCache.expenseClaims.detail(claimId)
    },
  })
}

// Delete receipt
export const useDeleteReceipt = () => {
  return useMutation({
    mutationFn: ({ claimId, receiptId }: { claimId: string; receiptId: string }) =>
      deleteReceipt(claimId, receiptId),
    onSuccess: (_, { claimId }) => {
      invalidateCache.expenseClaims.detail(claimId)
    },
  })
}

// Verify receipt
export const useVerifyReceipt = () => {
  return useMutation({
    mutationFn: ({ claimId, receiptId }: { claimId: string; receiptId: string }) =>
      verifyReceipt(claimId, receiptId),
    onSuccess: (_, { claimId }) => {
      invalidateCache.expenseClaims.detail(claimId)
    },
  })
}

// Reconcile card transaction
export const useReconcileCardTransaction = () => {
  return useMutation({
    mutationFn: ({ claimId, data }: {
      claimId: string
      data: { transactionId: string; lineItemId: string }
    }) => reconcileCardTransaction(claimId, data),
    onSuccess: (_, { claimId }) => {
      invalidateCache.expenseClaims.detail(claimId)
    },
  })
}

// Check policy compliance
export const useCheckPolicyCompliance = () => {
  return useMutation({
    mutationFn: (claimId: string) => checkPolicyCompliance(claimId),
  })
}

// Approve exception
export const useApproveException = () => {
  return useMutation({
    mutationFn: ({ claimId, data }: {
      claimId: string
      data: { exceptionReason: string }
    }) => approveException(claimId, data),
    onSuccess: (_, { claimId }) => {
      invalidateCache.expenseClaims.detail(claimId)
      invalidateCache.expenseClaims.lists()
    },
  })
}

// Mark as billable
export const useMarkAsBillable = () => {
  return useMutation({
    mutationFn: ({ claimId, data }: {
      claimId: string
      data: { lineItemIds: string[]; clientId: string; caseId?: string }
    }) => markAsBillable(claimId, data),
    onSuccess: (_, { claimId }) => {
      invalidateCache.expenseClaims.detail(claimId)
    },
  })
}

// Create billable invoice
export const useCreateBillableInvoice = () => {
  return useMutation({
    mutationFn: (claimId: string) => createBillableInvoice(claimId),
    onSuccess: (_, claimId) => {
      invalidateCache.expenseClaims.detail(claimId)
      invalidateCache.expenseClaims.stats()
    },
  })
}

// Bulk delete
export const useBulkDeleteExpenseClaims = () => {
  return useMutation({
    mutationFn: (ids: string[]) => bulkDeleteExpenseClaims(ids),
    onSuccess: () => {
      invalidateCache.expenseClaims.lists()
      invalidateCache.expenseClaims.stats()
    },
  })
}

// Duplicate expense claim
export const useDuplicateExpenseClaim = () => {
  return useMutation({
    mutationFn: (claimId: string) => duplicateExpenseClaim(claimId),
    onSuccess: () => {
      invalidateCache.expenseClaims.lists()
    },
  })
}

// Export expense claims
export const useExportExpenseClaims = () => {
  return useMutation({
    mutationFn: (filters?: ExpenseClaimFilters) => exportExpenseClaims(filters),
  })
}
