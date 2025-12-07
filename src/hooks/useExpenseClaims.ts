import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
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

// Query keys
export const expenseClaimKeys = {
  all: ['expense-claims'] as const,
  lists: () => [...expenseClaimKeys.all, 'list'] as const,
  list: (filters?: ExpenseClaimFilters) => [...expenseClaimKeys.lists(), filters] as const,
  details: () => [...expenseClaimKeys.all, 'detail'] as const,
  detail: (id: string) => [...expenseClaimKeys.details(), id] as const,
  stats: () => [...expenseClaimKeys.all, 'stats'] as const,
  byEmployee: (employeeId: string) => [...expenseClaimKeys.all, 'employee', employeeId] as const,
  pendingApprovals: () => [...expenseClaimKeys.all, 'pending-approvals'] as const,
  pendingPayments: () => [...expenseClaimKeys.all, 'pending-payments'] as const,
  mileageRates: () => [...expenseClaimKeys.all, 'mileage-rates'] as const,
  policies: () => [...expenseClaimKeys.all, 'policies'] as const,
  corporateCard: (employeeId: string) => [...expenseClaimKeys.all, 'corporate-card', employeeId] as const,
}

// Get all expense claims
export const useExpenseClaims = (filters?: ExpenseClaimFilters) => {
  return useQuery({
    queryKey: expenseClaimKeys.list(filters),
    queryFn: () => getExpenseClaims(filters),
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
  })
}

// Get pending payments
export const usePendingPayments = () => {
  return useQuery({
    queryKey: expenseClaimKeys.pendingPayments(),
    queryFn: getPendingPayments,
  })
}

// Get mileage rates
export const useMileageRates = () => {
  return useQuery({
    queryKey: expenseClaimKeys.mileageRates(),
    queryFn: getMileageRates,
  })
}

// Get expense policies
export const useExpensePolicies = () => {
  return useQuery({
    queryKey: expenseClaimKeys.policies(),
    queryFn: getExpensePolicies,
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
export const useCreateExpenseClaim = () => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (data: CreateExpenseClaimData) => createExpenseClaim(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: expenseClaimKeys.lists() })
      queryClient.invalidateQueries({ queryKey: expenseClaimKeys.stats() })
    },
  })
}

// Update expense claim
export const useUpdateExpenseClaim = () => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ claimId, data }: { claimId: string; data: UpdateExpenseClaimData }) =>
      updateExpenseClaim(claimId, data),
    onSuccess: (_, { claimId }) => {
      queryClient.invalidateQueries({ queryKey: expenseClaimKeys.detail(claimId) })
      queryClient.invalidateQueries({ queryKey: expenseClaimKeys.lists() })
    },
  })
}

// Delete expense claim
export const useDeleteExpenseClaim = () => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (claimId: string) => deleteExpenseClaim(claimId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: expenseClaimKeys.lists() })
      queryClient.invalidateQueries({ queryKey: expenseClaimKeys.stats() })
    },
  })
}

// Submit expense claim
export const useSubmitExpenseClaim = () => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (claimId: string) => submitExpenseClaim(claimId),
    onSuccess: (_, claimId) => {
      queryClient.invalidateQueries({ queryKey: expenseClaimKeys.detail(claimId) })
      queryClient.invalidateQueries({ queryKey: expenseClaimKeys.lists() })
      queryClient.invalidateQueries({ queryKey: expenseClaimKeys.pendingApprovals() })
    },
  })
}

// Approve expense claim
export const useApproveExpenseClaim = () => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ claimId, data }: {
      claimId: string
      data: { approvedAmount?: number; comments?: string }
    }) => approveExpenseClaim(claimId, data),
    onSuccess: (_, { claimId }) => {
      queryClient.invalidateQueries({ queryKey: expenseClaimKeys.detail(claimId) })
      queryClient.invalidateQueries({ queryKey: expenseClaimKeys.lists() })
      queryClient.invalidateQueries({ queryKey: expenseClaimKeys.pendingApprovals() })
      queryClient.invalidateQueries({ queryKey: expenseClaimKeys.pendingPayments() })
      queryClient.invalidateQueries({ queryKey: expenseClaimKeys.stats() })
    },
  })
}

// Reject expense claim
export const useRejectExpenseClaim = () => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ claimId, data }: {
      claimId: string
      data: { reason: string; comments?: string }
    }) => rejectExpenseClaim(claimId, data),
    onSuccess: (_, { claimId }) => {
      queryClient.invalidateQueries({ queryKey: expenseClaimKeys.detail(claimId) })
      queryClient.invalidateQueries({ queryKey: expenseClaimKeys.lists() })
      queryClient.invalidateQueries({ queryKey: expenseClaimKeys.pendingApprovals() })
    },
  })
}

// Request changes
export const useRequestClaimChanges = () => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ claimId, data }: {
      claimId: string
      data: { changesRequested: string; lineItemIds?: string[] }
    }) => requestClaimChanges(claimId, data),
    onSuccess: (_, { claimId }) => {
      queryClient.invalidateQueries({ queryKey: expenseClaimKeys.detail(claimId) })
      queryClient.invalidateQueries({ queryKey: expenseClaimKeys.lists() })
    },
  })
}

// Process payment
export const useProcessClaimPayment = () => {
  const queryClient = useQueryClient()
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
    }) => processClaimPayment(claimId, data),
    onSuccess: (_, { claimId }) => {
      queryClient.invalidateQueries({ queryKey: expenseClaimKeys.detail(claimId) })
      queryClient.invalidateQueries({ queryKey: expenseClaimKeys.lists() })
      queryClient.invalidateQueries({ queryKey: expenseClaimKeys.pendingPayments() })
      queryClient.invalidateQueries({ queryKey: expenseClaimKeys.stats() })
    },
  })
}

// Add line item
export const useAddLineItem = () => {
  const queryClient = useQueryClient()
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
      queryClient.invalidateQueries({ queryKey: expenseClaimKeys.detail(claimId) })
    },
  })
}

// Update line item
export const useUpdateLineItem = () => {
  const queryClient = useQueryClient()
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
      queryClient.invalidateQueries({ queryKey: expenseClaimKeys.detail(claimId) })
    },
  })
}

// Delete line item
export const useDeleteLineItem = () => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ claimId, lineItemId }: { claimId: string; lineItemId: string }) =>
      deleteLineItem(claimId, lineItemId),
    onSuccess: (_, { claimId }) => {
      queryClient.invalidateQueries({ queryKey: expenseClaimKeys.detail(claimId) })
    },
  })
}

// Upload receipt
export const useUploadReceipt = () => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ claimId, data }: { claimId: string; data: FormData }) =>
      uploadReceipt(claimId, data),
    onSuccess: (_, { claimId }) => {
      queryClient.invalidateQueries({ queryKey: expenseClaimKeys.detail(claimId) })
    },
  })
}

// Delete receipt
export const useDeleteReceipt = () => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ claimId, receiptId }: { claimId: string; receiptId: string }) =>
      deleteReceipt(claimId, receiptId),
    onSuccess: (_, { claimId }) => {
      queryClient.invalidateQueries({ queryKey: expenseClaimKeys.detail(claimId) })
    },
  })
}

// Verify receipt
export const useVerifyReceipt = () => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ claimId, receiptId }: { claimId: string; receiptId: string }) =>
      verifyReceipt(claimId, receiptId),
    onSuccess: (_, { claimId }) => {
      queryClient.invalidateQueries({ queryKey: expenseClaimKeys.detail(claimId) })
    },
  })
}

// Reconcile card transaction
export const useReconcileCardTransaction = () => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ claimId, data }: {
      claimId: string
      data: { transactionId: string; lineItemId: string }
    }) => reconcileCardTransaction(claimId, data),
    onSuccess: (_, { claimId }) => {
      queryClient.invalidateQueries({ queryKey: expenseClaimKeys.detail(claimId) })
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
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ claimId, data }: {
      claimId: string
      data: { exceptionReason: string }
    }) => approveException(claimId, data),
    onSuccess: (_, { claimId }) => {
      queryClient.invalidateQueries({ queryKey: expenseClaimKeys.detail(claimId) })
      queryClient.invalidateQueries({ queryKey: expenseClaimKeys.lists() })
    },
  })
}

// Mark as billable
export const useMarkAsBillable = () => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ claimId, data }: {
      claimId: string
      data: { lineItemIds: string[]; clientId: string; caseId?: string }
    }) => markAsBillable(claimId, data),
    onSuccess: (_, { claimId }) => {
      queryClient.invalidateQueries({ queryKey: expenseClaimKeys.detail(claimId) })
    },
  })
}

// Create billable invoice
export const useCreateBillableInvoice = () => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (claimId: string) => createBillableInvoice(claimId),
    onSuccess: (_, claimId) => {
      queryClient.invalidateQueries({ queryKey: expenseClaimKeys.detail(claimId) })
      queryClient.invalidateQueries({ queryKey: expenseClaimKeys.stats() })
    },
  })
}

// Bulk delete
export const useBulkDeleteExpenseClaims = () => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (ids: string[]) => bulkDeleteExpenseClaims(ids),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: expenseClaimKeys.lists() })
      queryClient.invalidateQueries({ queryKey: expenseClaimKeys.stats() })
    },
  })
}

// Duplicate expense claim
export const useDuplicateExpenseClaim = () => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (claimId: string) => duplicateExpenseClaim(claimId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: expenseClaimKeys.lists() })
    },
  })
}

// Export expense claims
export const useExportExpenseClaims = () => {
  return useMutation({
    mutationFn: (filters?: ExpenseClaimFilters) => exportExpenseClaims(filters),
  })
}
