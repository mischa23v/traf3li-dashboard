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
  CreateMaterialRequestData,
  RfqFilters,
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
  materialRequestsList: (filters?: any) => [...buyingKeys.materialRequests(), 'list', filters] as const,
  materialRequestDetail: (id: string) => [...buyingKeys.materialRequests(), 'detail', id] as const,
  rfqs: () => [...buyingKeys.all, 'rfqs'] as const,
  rfqsList: (filters?: RfqFilters) => [...buyingKeys.rfqs(), 'list', filters] as const,
  rfqDetail: (id: string) => [...buyingKeys.rfqs(), 'detail', id] as const,
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

export function useCancelPurchaseOrder() {
  const queryClient = useQueryClient()
  const { t } = useTranslation()

  return useMutation({
    mutationFn: (id: string) => buyingService.cancelPurchaseOrder(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: buyingKeys.purchaseOrders() })
      toast.success(t('buying.poCancelled', 'تم إلغاء أمر الشراء بنجاح'))
    },
    onError: (error: Error) => toast.error(error.message),
  })
}

export function useDeletePurchaseOrder() {
  const queryClient = useQueryClient()
  const { t } = useTranslation()

  return useMutation({
    mutationFn: (id: string) => buyingService.deletePurchaseOrder(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: buyingKeys.purchaseOrders() })
      toast.success(t('buying.poDeleted', 'تم حذف أمر الشراء بنجاح'))
    },
    onError: (error: Error) => toast.error(error.message),
  })
}

// ==================== PURCHASE RECEIPTS HOOKS ====================

export function usePurchaseReceipts(filters?: any) {
  return useQuery({
    queryKey: [...buyingKeys.purchaseReceipts(), 'list', filters],
    queryFn: () => buyingService.getPurchaseReceipts(filters),
  })
}

export function usePurchaseReceipt(id: string) {
  return useQuery({
    queryKey: [...buyingKeys.purchaseReceipts(), 'detail', id],
    queryFn: () => buyingService.getPurchaseReceipt(id),
    enabled: !!id,
  })
}

// ==================== PURCHASE INVOICES HOOKS ====================

export function usePurchaseInvoices(filters?: any) {
  return useQuery({
    queryKey: [...buyingKeys.purchaseInvoices(), 'list', filters],
    queryFn: () => buyingService.getPurchaseInvoices(filters),
  })
}

export function usePurchaseInvoice(id: string) {
  return useQuery({
    queryKey: [...buyingKeys.purchaseInvoices(), 'detail', id],
    queryFn: () => buyingService.getPurchaseInvoice(id),
    enabled: !!id,
  })
}

// ==================== MATERIAL REQUEST HOOKS ====================

export function useMaterialRequests(filters?: any) {
  return useQuery({
    queryKey: buyingKeys.materialRequestsList(filters),
    queryFn: () => buyingService.getMaterialRequests(filters),
  })
}

export function useMaterialRequest(id: string) {
  return useQuery({
    queryKey: buyingKeys.materialRequestDetail(id),
    queryFn: () => buyingService.getMaterialRequest(id),
    enabled: !!id,
  })
}

export function useCreateMaterialRequest() {
  const queryClient = useQueryClient()
  const { t } = useTranslation()

  return useMutation({
    mutationFn: (data: CreateMaterialRequestData) =>
      buyingService.createMaterialRequest(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: buyingKeys.materialRequests() })
      toast.success(t('buying.materialRequestCreated', 'تم إنشاء طلب المواد بنجاح'))
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

export function usePendingPurchaseOrders() {
  return useQuery({
    queryKey: buyingKeys.purchaseOrdersList({ status: 'submitted' }),
    queryFn: () => buyingService.getPurchaseOrders({ status: 'submitted' }),
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

// ==================== RFQ HOOKS ====================

export function useRfqs(filters?: RfqFilters) {
  return useQuery({
    queryKey: buyingKeys.rfqsList(filters),
    queryFn: () => buyingService.getRfqs(filters),
  })
}

export function useRfq(id: string) {
  return useQuery({
    queryKey: buyingKeys.rfqDetail(id),
    queryFn: () => buyingService.getRfq(id),
    enabled: !!id,
  })
}

export function useCreateRfq() {
  const queryClient = useQueryClient()
  const { t } = useTranslation()

  return useMutation({
    mutationFn: (data: Parameters<typeof buyingService.createRfq>[0]) =>
      buyingService.createRfq(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: buyingKeys.rfqs() })
      toast.success(t('buying.rfqCreated', 'تم إنشاء طلب عرض السعر بنجاح'))
    },
    onError: (error: Error) => toast.error(error.message),
  })
}

export function useDeleteRfq() {
  const queryClient = useQueryClient()
  const { t } = useTranslation()

  return useMutation({
    mutationFn: (id: string) => buyingService.deleteRfq(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: buyingKeys.rfqs() })
      toast.success(t('buying.rfqDeleted', 'تم حذف طلب عرض السعر بنجاح'))
    },
    onError: (error: Error) => toast.error(error.message),
  })
}

// ==================== MATERIAL REQUESTS HOOKS ====================

export function useMaterialRequests(filters?: any) {
  return useQuery({
    queryKey: [...buyingKeys.materialRequests(), 'list', filters],
    queryFn: () => buyingService.getMaterialRequests(filters),
  })
}

export function useMaterialRequest(id: string) {
  return useQuery({
    queryKey: [...buyingKeys.materialRequests(), 'detail', id],
    queryFn: () => buyingService.getMaterialRequest(id),
    enabled: !!id,
  })
}

export function useCreateMaterialRequest() {
  const queryClient = useQueryClient()
  const { t } = useTranslation()

  return useMutation({
    mutationFn: (data: Parameters<typeof buyingService.createMaterialRequest>[0]) =>
      buyingService.createMaterialRequest(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: buyingKeys.materialRequests() })
      toast.success(t('buying.materialRequest.created', 'تم إنشاء طلب المواد بنجاح'))
    },
    onError: (error: Error) => toast.error(error.message),
  })
}
