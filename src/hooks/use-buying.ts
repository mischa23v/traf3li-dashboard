/**
 * Buying Hooks
 * React Query hooks for Buying/Procurement management
 */

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import { useTranslation } from 'react-i18next'
import buyingService from '@/services/buyingService'
import type {
  CreateSupplierData,
  SupplierFilters,
  CreatePurchaseOrderData,
  PurchaseOrderFilters,
} from '@/types/buying'

export const buyingKeys = {
  all: ['buying'] as const,
  suppliers: () => [...buyingKeys.all, 'suppliers'] as const,
  suppliersList: (filters?: SupplierFilters) => [...buyingKeys.suppliers(), 'list', filters] as const,
  supplierDetail: (id: string) => [...buyingKeys.suppliers(), 'detail', id] as const,
  supplierGroups: () => [...buyingKeys.all, 'supplier-groups'] as const,
  purchaseOrders: () => [...buyingKeys.all, 'purchase-orders'] as const,
  purchaseOrdersList: (filters?: PurchaseOrderFilters) => [...buyingKeys.purchaseOrders(), 'list', filters] as const,
  purchaseOrderDetail: (id: string) => [...buyingKeys.purchaseOrders(), 'detail', id] as const,
  purchaseReceipts: () => [...buyingKeys.all, 'purchase-receipts'] as const,
  purchaseInvoices: () => [...buyingKeys.all, 'purchase-invoices'] as const,
  materialRequests: () => [...buyingKeys.all, 'material-requests'] as const,
  stats: () => [...buyingKeys.all, 'stats'] as const,
  settings: () => [...buyingKeys.all, 'settings'] as const,
}

// ==================== SUPPLIERS HOOKS ====================

export function useSuppliers(filters?: SupplierFilters) {
  return useQuery({
    queryKey: buyingKeys.suppliersList(filters),
    queryFn: () => buyingService.getSuppliers(filters),
  })
}

export function useSupplier(id: string) {
  return useQuery({
    queryKey: buyingKeys.supplierDetail(id),
    queryFn: () => buyingService.getSupplier(id),
    enabled: !!id,
  })
}

export function useSupplierGroups() {
  return useQuery({
    queryKey: buyingKeys.supplierGroups(),
    queryFn: () => buyingService.getSupplierGroups(),
  })
}

export function useCreateSupplier() {
  const queryClient = useQueryClient()
  const { t } = useTranslation()

  return useMutation({
    mutationFn: (data: CreateSupplierData) => buyingService.createSupplier(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: buyingKeys.suppliers() })
      toast.success(t('buying.supplierCreated', 'تم إنشاء المورد بنجاح'))
    },
    onError: (error: Error) => toast.error(error.message),
  })
}

export function useUpdateSupplier() {
  const queryClient = useQueryClient()
  const { t } = useTranslation()

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<CreateSupplierData> }) =>
      buyingService.updateSupplier(id, data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: buyingKeys.suppliers() })
      queryClient.invalidateQueries({ queryKey: buyingKeys.supplierDetail(variables.id) })
      toast.success(t('buying.supplierUpdated', 'تم تحديث المورد بنجاح'))
    },
    onError: (error: Error) => toast.error(error.message),
  })
}

export function useDeleteSupplier() {
  const queryClient = useQueryClient()
  const { t } = useTranslation()

  return useMutation({
    mutationFn: (id: string) => buyingService.deleteSupplier(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: buyingKeys.suppliers() })
      toast.success(t('buying.supplierDeleted', 'تم حذف المورد بنجاح'))
    },
    onError: (error: Error) => toast.error(error.message),
  })
}

// ==================== PURCHASE ORDERS HOOKS ====================

export function usePurchaseOrders(filters?: PurchaseOrderFilters) {
  return useQuery({
    queryKey: buyingKeys.purchaseOrdersList(filters),
    queryFn: () => buyingService.getPurchaseOrders(filters),
  })
}

export function usePurchaseOrder(id: string) {
  return useQuery({
    queryKey: buyingKeys.purchaseOrderDetail(id),
    queryFn: () => buyingService.getPurchaseOrder(id),
    enabled: !!id,
  })
}

export function useCreatePurchaseOrder() {
  const queryClient = useQueryClient()
  const { t } = useTranslation()

  return useMutation({
    mutationFn: (data: CreatePurchaseOrderData) => buyingService.createPurchaseOrder(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: buyingKeys.purchaseOrders() })
      toast.success(t('buying.poCreated', 'تم إنشاء أمر الشراء بنجاح'))
    },
    onError: (error: Error) => toast.error(error.message),
  })
}

export function useSubmitPurchaseOrder() {
  const queryClient = useQueryClient()
  const { t } = useTranslation()

  return useMutation({
    mutationFn: (id: string) => buyingService.submitPurchaseOrder(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: buyingKeys.purchaseOrders() })
      toast.success(t('buying.poSubmitted', 'تم ترحيل أمر الشراء بنجاح'))
    },
    onError: (error: Error) => toast.error(error.message),
  })
}

export function useApprovePurchaseOrder() {
  const queryClient = useQueryClient()
  const { t } = useTranslation()

  return useMutation({
    mutationFn: (id: string) => buyingService.approvePurchaseOrder(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: buyingKeys.purchaseOrders() })
      toast.success(t('buying.poApproved', 'تم اعتماد أمر الشراء بنجاح'))
    },
    onError: (error: Error) => toast.error(error.message),
  })
}

// ==================== STATS HOOKS ====================

export function useBuyingStats() {
  return useQuery({
    queryKey: buyingKeys.stats(),
    queryFn: () => buyingService.getStats(),
  })
}

export function useBuyingSettings() {
  return useQuery({
    queryKey: buyingKeys.settings(),
    queryFn: () => buyingService.getSettings(),
  })
}

export function useUpdateBuyingSettings() {
  const queryClient = useQueryClient()
  const { t } = useTranslation()

  return useMutation({
    mutationFn: (data: Parameters<typeof buyingService.updateSettings>[0]) =>
      buyingService.updateSettings(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: buyingKeys.settings() })
      toast.success(t('buying.settingsUpdated', 'تم تحديث إعدادات المشتريات بنجاح'))
    },
    onError: (error: Error) => toast.error(error.message),
  })
}
