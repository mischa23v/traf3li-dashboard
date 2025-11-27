/**
 * Bills Hooks
 * TanStack Query hooks for vendor bills and payables management
 */

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import billsService, {
  Vendor,
  Bill,
  BillPayment,
  CreateVendorData,
  CreateBillData,
  CreateBillPaymentData,
  BillFilters,
  VendorFilters,
} from '@/services/billsService'

const QUERY_KEYS = {
  vendors: 'vendors',
  vendor: 'vendor',
  vendorSummary: 'vendor-summary',
  bills: 'bills',
  bill: 'bill',
  billsSummary: 'bills-summary',
  overdueBills: 'overdue-bills',
  recurringBills: 'recurring-bills',
  billPayments: 'bill-payments',
  billPayment: 'bill-payment',
  agingReport: 'bills-aging-report',
}

// ==================== VENDORS ====================

export const useVendors = (filters?: VendorFilters) => {
  return useQuery({
    queryKey: [QUERY_KEYS.vendors, filters],
    queryFn: () => billsService.getVendors(filters),
  })
}

export const useVendor = (id: string) => {
  return useQuery({
    queryKey: [QUERY_KEYS.vendor, id],
    queryFn: () => billsService.getVendor(id),
    enabled: !!id,
  })
}

export const useVendorSummary = (id: string) => {
  return useQuery({
    queryKey: [QUERY_KEYS.vendorSummary, id],
    queryFn: () => billsService.getVendorSummary(id),
    enabled: !!id,
  })
}

export const useCreateVendor = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (data: CreateVendorData) => billsService.createVendor(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.vendors] })
    },
  })
}

export const useUpdateVendor = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<CreateVendorData> }) =>
      billsService.updateVendor(id, data),
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.vendors] })
      queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.vendor, id] })
    },
  })
}

export const useDeleteVendor = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (id: string) => billsService.deleteVendor(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.vendors] })
    },
  })
}

// ==================== BILLS ====================

export const useBills = (filters?: BillFilters) => {
  return useQuery({
    queryKey: [QUERY_KEYS.bills, filters],
    queryFn: () => billsService.getBills(filters),
  })
}

export const useBill = (id: string) => {
  return useQuery({
    queryKey: [QUERY_KEYS.bill, id],
    queryFn: () => billsService.getBill(id),
    enabled: !!id,
  })
}

export const useBillsSummary = (filters?: Parameters<typeof billsService.getBillsSummary>[0]) => {
  return useQuery({
    queryKey: [QUERY_KEYS.billsSummary, filters],
    queryFn: () => billsService.getBillsSummary(filters),
  })
}

export const useOverdueBills = () => {
  return useQuery({
    queryKey: [QUERY_KEYS.overdueBills],
    queryFn: () => billsService.getOverdueBills(),
  })
}

export const useRecurringBills = () => {
  return useQuery({
    queryKey: [QUERY_KEYS.recurringBills],
    queryFn: () => billsService.getRecurringBills(),
  })
}

export const useCreateBill = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (data: CreateBillData) => billsService.createBill(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.bills] })
      queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.billsSummary] })
    },
  })
}

export const useUpdateBill = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<CreateBillData> }) =>
      billsService.updateBill(id, data),
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.bills] })
      queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.bill, id] })
      queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.billsSummary] })
    },
  })
}

export const useDeleteBill = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (id: string) => billsService.deleteBill(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.bills] })
      queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.billsSummary] })
    },
  })
}

export const useReceiveBill = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (id: string) => billsService.receiveBill(id),
    onSuccess: (_, id) => {
      queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.bills] })
      queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.bill, id] })
    },
  })
}

export const useCancelBill = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (id: string) => billsService.cancelBill(id),
    onSuccess: (_, id) => {
      queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.bills] })
      queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.bill, id] })
      queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.billsSummary] })
    },
  })
}

export const useDuplicateBill = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (id: string) => billsService.duplicateBill(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.bills] })
    },
  })
}

export const useUploadBillAttachment = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ billId, file }: { billId: string; file: File }) =>
      billsService.uploadAttachment(billId, file),
    onSuccess: (_, { billId }) => {
      queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.bill, billId] })
    },
  })
}

export const useDeleteBillAttachment = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ billId, attachmentId }: { billId: string; attachmentId: string }) =>
      billsService.deleteAttachment(billId, attachmentId),
    onSuccess: (_, { billId }) => {
      queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.bill, billId] })
    },
  })
}

export const useStopRecurringBill = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (id: string) => billsService.stopRecurring(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.bills] })
      queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.recurringBills] })
    },
  })
}

export const useGenerateNextBill = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (id: string) => billsService.generateNextBill(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.bills] })
      queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.recurringBills] })
    },
  })
}

// ==================== BILL PAYMENTS ====================

export const useBillPayments = (filters?: Parameters<typeof billsService.getPayments>[0]) => {
  return useQuery({
    queryKey: [QUERY_KEYS.billPayments, filters],
    queryFn: () => billsService.getPayments(filters),
  })
}

export const useBillPayment = (id: string) => {
  return useQuery({
    queryKey: [QUERY_KEYS.billPayment, id],
    queryFn: () => billsService.getPayment(id),
    enabled: !!id,
  })
}

export const useRecordBillPayment = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (data: CreateBillPaymentData) => billsService.recordPayment(data),
    onSuccess: (_, { billId }) => {
      queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.billPayments] })
      queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.bills] })
      queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.bill, billId] })
      queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.billsSummary] })
    },
  })
}

export const useCancelBillPayment = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (id: string) => billsService.cancelPayment(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.billPayments] })
      queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.bills] })
      queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.billsSummary] })
    },
  })
}

// ==================== REPORTS ====================

export const useBillsAgingReport = (filters?: { vendorId?: string }) => {
  return useQuery({
    queryKey: [QUERY_KEYS.agingReport, filters],
    queryFn: () => billsService.getAgingReport(filters),
  })
}

export const useExportBills = () => {
  return useMutation({
    mutationFn: ({
      filters,
      format,
    }: {
      filters?: BillFilters
      format?: 'csv' | 'pdf' | 'xlsx'
    }) => billsService.exportBills(filters, format),
  })
}
