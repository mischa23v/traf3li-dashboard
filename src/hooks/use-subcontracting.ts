/**
 * Subcontracting Hooks
 * React Query hooks for Subcontracting operations
 */

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import subcontractingService from '@/services/subcontractingService'
import type { SubcontractingFilters, CreateSubcontractingOrderData, SubcontractingSettings } from '@/types/subcontracting'

// Query Keys
export const subcontractingKeys = {
  all: ['subcontracting'] as const,
  orders: () => [...subcontractingKeys.all, 'orders'] as const,
  orderList: (filters?: SubcontractingFilters) => [...subcontractingKeys.orders(), { filters }] as const,
  orderDetail: (id: string) => [...subcontractingKeys.orders(), id] as const,
  receipts: () => [...subcontractingKeys.all, 'receipts'] as const,
  receiptDetail: (id: string) => [...subcontractingKeys.receipts(), id] as const,
  boms: () => [...subcontractingKeys.all, 'boms'] as const,
  bomDetail: (id: string) => [...subcontractingKeys.boms(), id] as const,
  stats: () => [...subcontractingKeys.all, 'stats'] as const,
  settings: () => [...subcontractingKeys.all, 'settings'] as const,
}

// Orders
export function useSubcontractingOrders(filters?: SubcontractingFilters) {
  return useQuery({
    queryKey: subcontractingKeys.orderList(filters),
    queryFn: () => subcontractingService.getOrders(filters),
  })
}

export function useSubcontractingOrder(id: string) {
  return useQuery({
    queryKey: subcontractingKeys.orderDetail(id),
    queryFn: () => subcontractingService.getOrderById(id),
    enabled: !!id,
  })
}

export function useCreateSubcontractingOrder() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (data: CreateSubcontractingOrderData) => subcontractingService.createOrder(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: subcontractingKeys.orders() })
      toast.success('تم إنشاء أمر التصنيع الخارجي بنجاح | Subcontracting order created successfully')
    },
    onError: () => {
      toast.error('فشل إنشاء أمر التصنيع الخارجي | Failed to create subcontracting order')
    },
  })
}

export function useUpdateSubcontractingOrder() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<CreateSubcontractingOrderData> }) => subcontractingService.updateOrder(id, data),
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({ queryKey: subcontractingKeys.orders() })
      queryClient.invalidateQueries({ queryKey: subcontractingKeys.orderDetail(id) })
      toast.success('تم تحديث أمر التصنيع الخارجي بنجاح | Subcontracting order updated successfully')
    },
    onError: () => {
      toast.error('فشل تحديث أمر التصنيع الخارجي | Failed to update subcontracting order')
    },
  })
}

export function useDeleteSubcontractingOrder() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (id: string) => subcontractingService.deleteOrder(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: subcontractingKeys.orders() })
      toast.success('تم حذف أمر التصنيع الخارجي بنجاح | Subcontracting order deleted successfully')
    },
    onError: () => {
      toast.error('فشل حذف أمر التصنيع الخارجي | Failed to delete subcontracting order')
    },
  })
}

export function useSubmitSubcontractingOrder() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (id: string) => subcontractingService.submitOrder(id),
    onSuccess: (_, id) => {
      queryClient.invalidateQueries({ queryKey: subcontractingKeys.orders() })
      queryClient.invalidateQueries({ queryKey: subcontractingKeys.orderDetail(id) })
      toast.success('تم تقديم الأمر | Order submitted')
    },
    onError: () => {
      toast.error('فشل تقديم الأمر | Failed to submit order')
    },
  })
}

export function useCancelSubcontractingOrder() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (id: string) => subcontractingService.cancelOrder(id),
    onSuccess: (_, id) => {
      queryClient.invalidateQueries({ queryKey: subcontractingKeys.orders() })
      queryClient.invalidateQueries({ queryKey: subcontractingKeys.orderDetail(id) })
      toast.success('تم إلغاء الأمر | Order cancelled')
    },
    onError: () => {
      toast.error('فشل إلغاء الأمر | Failed to cancel order')
    },
  })
}

// Receipts
export function useSubcontractingReceipts(filters?: { orderId?: string; status?: string }) {
  return useQuery({
    queryKey: [...subcontractingKeys.receipts(), filters],
    queryFn: () => subcontractingService.getReceipts(filters),
  })
}

export function useSubcontractingReceipt(id: string) {
  return useQuery({
    queryKey: subcontractingKeys.receiptDetail(id),
    queryFn: () => subcontractingService.getReceiptById(id),
    enabled: !!id,
  })
}

export function useCreateSubcontractingReceipt() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (data: any) => subcontractingService.createReceipt(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: subcontractingKeys.receipts() })
      queryClient.invalidateQueries({ queryKey: subcontractingKeys.orders() })
      toast.success('تم إنشاء إيصال الاستلام بنجاح | Subcontracting receipt created')
    },
    onError: () => {
      toast.error('فشل إنشاء إيصال الاستلام | Failed to create receipt')
    },
  })
}

export function useUpdateSubcontractingReceipt() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: any }) => subcontractingService.updateReceipt(id, data),
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({ queryKey: subcontractingKeys.receipts() })
      queryClient.invalidateQueries({ queryKey: subcontractingKeys.receiptDetail(id) })
      toast.success('تم تحديث إيصال الاستلام بنجاح | Receipt updated successfully')
    },
    onError: () => {
      toast.error('فشل تحديث إيصال الاستلام | Failed to update receipt')
    },
  })
}

export function useSubmitSubcontractingReceipt() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (id: string) => subcontractingService.submitReceipt(id),
    onSuccess: (_, id) => {
      queryClient.invalidateQueries({ queryKey: subcontractingKeys.receipts() })
      queryClient.invalidateQueries({ queryKey: subcontractingKeys.receiptDetail(id) })
      queryClient.invalidateQueries({ queryKey: subcontractingKeys.orders() })
      toast.success('تم تقديم الإيصال | Receipt submitted')
    },
    onError: () => {
      toast.error('فشل تقديم الإيصال | Failed to submit receipt')
    },
  })
}

// BOMs
export function useSubcontractingBoms(filters?: { serviceItemId?: string; isActive?: boolean }) {
  return useQuery({
    queryKey: [...subcontractingKeys.boms(), filters],
    queryFn: () => subcontractingService.getBoms(filters),
  })
}

export function useSubcontractingBom(id: string) {
  return useQuery({
    queryKey: subcontractingKeys.bomDetail(id),
    queryFn: () => subcontractingService.getBomById(id),
    enabled: !!id,
  })
}

export function useCreateSubcontractingBom() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (data: any) => subcontractingService.createBom(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: subcontractingKeys.boms() })
      toast.success('تم إنشاء قائمة مواد التصنيع الخارجي بنجاح | Subcontracting BOM created')
    },
    onError: () => {
      toast.error('فشل إنشاء قائمة المواد | Failed to create BOM')
    },
  })
}

export function useUpdateSubcontractingBom() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: any }) => subcontractingService.updateBom(id, data),
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({ queryKey: subcontractingKeys.boms() })
      queryClient.invalidateQueries({ queryKey: subcontractingKeys.bomDetail(id) })
      toast.success('تم تحديث قائمة المواد بنجاح | BOM updated successfully')
    },
    onError: () => {
      toast.error('فشل تحديث قائمة المواد | Failed to update BOM')
    },
  })
}

export function useDeleteSubcontractingBom() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (id: string) => subcontractingService.deleteBom(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: subcontractingKeys.boms() })
      toast.success('تم حذف قائمة المواد بنجاح | BOM deleted successfully')
    },
    onError: () => {
      toast.error('فشل حذف قائمة المواد | Failed to delete BOM')
    },
  })
}

// Stats
export function useSubcontractingStats() {
  return useQuery({
    queryKey: subcontractingKeys.stats(),
    queryFn: () => subcontractingService.getSubcontractingStats(),
  })
}

// Settings
export function useSubcontractingSettings() {
  return useQuery({
    queryKey: subcontractingKeys.settings(),
    queryFn: () => subcontractingService.getSubcontractingSettings(),
  })
}

export function useUpdateSubcontractingSettings() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (data: Partial<SubcontractingSettings>) => subcontractingService.updateSubcontractingSettings(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: subcontractingKeys.settings() })
      toast.success('تم تحديث الإعدادات بنجاح | Settings updated successfully')
    },
    onError: () => {
      toast.error('فشل تحديث الإعدادات | Failed to update settings')
    },
  })
}
