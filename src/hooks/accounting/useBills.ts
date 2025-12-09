/**
 * Bills & Vendors Hooks
 * TanStack Query hooks for bill and vendor management
 */

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import {
  accountingService,
  Bill,
  BillFilters,
  CreateBillData,
  Vendor,
  VendorFilters,
  CreateVendorData,
} from '@/services/accountingService'
import { accountKeys } from './useAccounts'

// ==================== QUERY KEYS ====================

export const billKeys = {
  all: ['accounting'] as const,
  // Bills
  bills: () => [...billKeys.all, 'bills'] as const,
  billsList: (filters?: BillFilters) => [...billKeys.bills(), 'list', filters] as const,
  bill: (id: string) => [...billKeys.bills(), id] as const,
  // Vendors
  vendors: () => [...billKeys.all, 'vendors'] as const,
  vendorsList: (filters?: VendorFilters) => [...billKeys.vendors(), 'list', filters] as const,
  vendor: (id: string) => [...billKeys.vendors(), id] as const,
}

// ==================== BILL HOOKS ====================

/**
 * Fetch bills with optional filtering
 * @param filters - Optional filters for bills
 * @returns Query result with bills data
 */
export const useBills = (filters?: BillFilters) => {
  return useQuery({
    queryKey: billKeys.billsList(filters),
    queryFn: () => accountingService.getBills(filters),
  })
}

/**
 * Fetch a single bill by ID
 * @param id - Bill ID
 * @returns Query result with bill data
 */
export const useBill = (id: string) => {
  return useQuery({
    queryKey: billKeys.bill(id),
    queryFn: () => accountingService.getBill(id),
    enabled: !!id,
  })
}

/**
 * Create a new bill
 * @returns Mutation for creating a bill
 */
export const useCreateBill = () => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (data: CreateBillData) => accountingService.createBill(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: billKeys.bills() })
      toast.success('تم إنشاء الفاتورة بنجاح')
    },
    onError: () => {
      toast.error('فشل في إنشاء الفاتورة')
    },
  })
}

/**
 * Update an existing bill
 * @returns Mutation for updating a bill
 */
export const useUpdateBill = () => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<CreateBillData> }) =>
      accountingService.updateBill(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: billKeys.bills() })
      toast.success('تم تحديث الفاتورة')
    },
    onError: () => {
      toast.error('فشل في تحديث الفاتورة')
    },
  })
}

/**
 * Approve a bill
 * @returns Mutation for approving a bill
 */
export const useApproveBill = () => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (id: string) => accountingService.approveBill(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: billKeys.bills() })
      toast.success('تم اعتماد الفاتورة')
    },
    onError: () => {
      toast.error('فشل في اعتماد الفاتورة')
    },
  })
}

/**
 * Pay a bill
 * @returns Mutation for paying a bill
 */
export const usePayBill = () => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: { amount: number; paymentMethod: string; notes?: string } }) =>
      accountingService.payBill(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: billKeys.bills() })
      queryClient.invalidateQueries({ queryKey: accountKeys.glEntries() })
      toast.success('تم تسجيل الدفع بنجاح')
    },
    onError: () => {
      toast.error('فشل في تسجيل الدفع')
    },
  })
}

/**
 * Post a bill to the general ledger
 * @returns Mutation for posting bill to GL
 */
export const usePostBillToGL = () => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (id: string) => accountingService.postBillToGL(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: billKeys.bills() })
      queryClient.invalidateQueries({ queryKey: accountKeys.glEntries() })
      toast.success('تم ترحيل الفاتورة للقيود')
    },
    onError: () => {
      toast.error('فشل في ترحيل الفاتورة')
    },
  })
}

/**
 * Delete a bill
 * @returns Mutation for deleting a bill
 */
export const useDeleteBill = () => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (id: string) => accountingService.deleteBill(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: billKeys.bills() })
      toast.success('تم حذف الفاتورة')
    },
    onError: () => {
      toast.error('فشل في حذف الفاتورة')
    },
  })
}

// ==================== VENDOR HOOKS ====================

/**
 * Fetch vendors with optional filtering
 * @param filters - Optional filters for vendors
 * @returns Query result with vendors data
 */
export const useVendors = (filters?: VendorFilters) => {
  return useQuery({
    queryKey: billKeys.vendorsList(filters),
    queryFn: () => accountingService.getVendors(filters),
  })
}

/**
 * Fetch a single vendor by ID
 * @param id - Vendor ID
 * @returns Query result with vendor data
 */
export const useVendor = (id: string) => {
  return useQuery({
    queryKey: billKeys.vendor(id),
    queryFn: () => accountingService.getVendor(id),
    enabled: !!id,
  })
}

/**
 * Create a new vendor
 * @returns Mutation for creating a vendor
 */
export const useCreateVendor = () => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (data: CreateVendorData) => accountingService.createVendor(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: billKeys.vendors() })
      toast.success('تم إنشاء المورد بنجاح')
    },
    onError: () => {
      toast.error('فشل في إنشاء المورد')
    },
  })
}

/**
 * Update an existing vendor
 * @returns Mutation for updating a vendor
 */
export const useUpdateVendor = () => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<CreateVendorData> }) =>
      accountingService.updateVendor(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: billKeys.vendors() })
      toast.success('تم تحديث المورد')
    },
    onError: () => {
      toast.error('فشل في تحديث المورد')
    },
  })
}

/**
 * Delete a vendor
 * @returns Mutation for deleting a vendor
 */
export const useDeleteVendor = () => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (id: string) => accountingService.deleteVendor(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: billKeys.vendors() })
      toast.success('تم حذف المورد')
    },
    onError: () => {
      toast.error('فشل في حذف المورد')
    },
  })
}
