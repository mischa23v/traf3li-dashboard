/**
 * Inventory Hooks
 * React Query hooks for Inventory/Stock management
 */

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import { useTranslation } from 'react-i18next'
import inventoryService from '@/services/inventoryService'
import type {
  Item,
  CreateItemData,
  ItemFilters,
  Warehouse,
  CreateWarehouseData,
  StockEntry,
  CreateStockEntryData,
  StockEntryFilters,
} from '@/types/inventory'

// ==================== QUERY KEYS ====================

export const inventoryKeys = {
  all: ['inventory'] as const,
  items: () => [...inventoryKeys.all, 'items'] as const,
  itemsList: (filters?: ItemFilters) => [...inventoryKeys.items(), 'list', filters] as const,
  itemDetail: (id: string) => [...inventoryKeys.items(), 'detail', id] as const,
  itemStock: (id: string) => [...inventoryKeys.items(), 'stock', id] as const,
  warehouses: () => [...inventoryKeys.all, 'warehouses'] as const,
  warehouseDetail: (id: string) => [...inventoryKeys.warehouses(), 'detail', id] as const,
  warehouseStock: (id: string) => [...inventoryKeys.warehouses(), 'stock', id] as const,
  stockEntries: () => [...inventoryKeys.all, 'stock-entries'] as const,
  stockEntriesList: (filters?: StockEntryFilters) => [...inventoryKeys.stockEntries(), 'list', filters] as const,
  stockEntryDetail: (id: string) => [...inventoryKeys.stockEntries(), 'detail', id] as const,
  stockLedger: (filters?: any) => [...inventoryKeys.all, 'stock-ledger', filters] as const,
  batches: (itemId?: string) => [...inventoryKeys.all, 'batches', itemId] as const,
  serialNumbers: (itemId?: string) => [...inventoryKeys.all, 'serial-numbers', itemId] as const,
  reconciliations: () => [...inventoryKeys.all, 'reconciliations'] as const,
  itemGroups: () => [...inventoryKeys.all, 'item-groups'] as const,
  uoms: () => [...inventoryKeys.all, 'uoms'] as const,
  priceLists: () => [...inventoryKeys.all, 'price-lists'] as const,
  itemPrices: (filters?: any) => [...inventoryKeys.all, 'item-prices', filters] as const,
  stats: () => [...inventoryKeys.all, 'stats'] as const,
  stockBalance: (filters?: any) => [...inventoryKeys.all, 'stock-balance', filters] as const,
  lowStock: () => [...inventoryKeys.all, 'low-stock'] as const,
  settings: () => [...inventoryKeys.all, 'settings'] as const,
}

// ==================== ITEMS HOOKS ====================

export function useItems(filters?: ItemFilters) {
  return useQuery({
    queryKey: inventoryKeys.itemsList(filters),
    queryFn: () => inventoryService.getItems(filters),
  })
}

export function useItem(id: string) {
  return useQuery({
    queryKey: inventoryKeys.itemDetail(id),
    queryFn: () => inventoryService.getItem(id),
    enabled: !!id,
  })
}

export function useItemStock(id: string) {
  return useQuery({
    queryKey: inventoryKeys.itemStock(id),
    queryFn: () => inventoryService.getItemStock(id),
    enabled: !!id,
  })
}

export function useCreateItem() {
  const queryClient = useQueryClient()
  const { t } = useTranslation()

  return useMutation({
    mutationFn: (data: CreateItemData) => inventoryService.createItem(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: inventoryKeys.items() })
      toast.success(t('inventory.itemCreated', 'تم إنشاء الصنف بنجاح'))
    },
    onError: (error: Error) => {
      toast.error(error.message)
    },
  })
}

export function useUpdateItem() {
  const queryClient = useQueryClient()
  const { t } = useTranslation()

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<CreateItemData> }) =>
      inventoryService.updateItem(id, data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: inventoryKeys.items() })
      queryClient.invalidateQueries({ queryKey: inventoryKeys.itemDetail(variables.id) })
      toast.success(t('inventory.itemUpdated', 'تم تحديث الصنف بنجاح'))
    },
    onError: (error: Error) => {
      toast.error(error.message)
    },
  })
}

export function useDeleteItem() {
  const queryClient = useQueryClient()
  const { t } = useTranslation()

  return useMutation({
    mutationFn: (id: string) => inventoryService.deleteItem(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: inventoryKeys.items() })
      toast.success(t('inventory.itemDeleted', 'تم حذف الصنف بنجاح'))
    },
    onError: (error: Error) => {
      toast.error(error.message)
    },
  })
}

// ==================== WAREHOUSES HOOKS ====================

export function useWarehouses() {
  return useQuery({
    queryKey: inventoryKeys.warehouses(),
    queryFn: () => inventoryService.getWarehouses(),
  })
}

export function useWarehouse(id: string) {
  return useQuery({
    queryKey: inventoryKeys.warehouseDetail(id),
    queryFn: () => inventoryService.getWarehouse(id),
    enabled: !!id,
  })
}

export function useWarehouseStock(id: string) {
  return useQuery({
    queryKey: inventoryKeys.warehouseStock(id),
    queryFn: () => inventoryService.getWarehouseStock(id),
    enabled: !!id,
  })
}

export function useCreateWarehouse() {
  const queryClient = useQueryClient()
  const { t } = useTranslation()

  return useMutation({
    mutationFn: (data: CreateWarehouseData) => inventoryService.createWarehouse(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: inventoryKeys.warehouses() })
      toast.success(t('inventory.warehouseCreated', 'تم إنشاء المستودع بنجاح'))
    },
    onError: (error: Error) => {
      toast.error(error.message)
    },
  })
}

export function useUpdateWarehouse() {
  const queryClient = useQueryClient()
  const { t } = useTranslation()

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<CreateWarehouseData> }) =>
      inventoryService.updateWarehouse(id, data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: inventoryKeys.warehouses() })
      queryClient.invalidateQueries({ queryKey: inventoryKeys.warehouseDetail(variables.id) })
      toast.success(t('inventory.warehouseUpdated', 'تم تحديث المستودع بنجاح'))
    },
    onError: (error: Error) => {
      toast.error(error.message)
    },
  })
}

export function useDeleteWarehouse() {
  const queryClient = useQueryClient()
  const { t } = useTranslation()

  return useMutation({
    mutationFn: (id: string) => inventoryService.deleteWarehouse(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: inventoryKeys.warehouses() })
      toast.success(t('inventory.warehouseDeleted', 'تم حذف المستودع بنجاح'))
    },
    onError: (error: Error) => {
      toast.error(error.message)
    },
  })
}

// ==================== STOCK ENTRIES HOOKS ====================

export function useStockEntries(filters?: StockEntryFilters) {
  return useQuery({
    queryKey: inventoryKeys.stockEntriesList(filters),
    queryFn: () => inventoryService.getStockEntries(filters),
  })
}

export function useStockEntry(id: string) {
  return useQuery({
    queryKey: inventoryKeys.stockEntryDetail(id),
    queryFn: () => inventoryService.getStockEntry(id),
    enabled: !!id,
  })
}

export function useCreateStockEntry() {
  const queryClient = useQueryClient()
  const { t } = useTranslation()

  return useMutation({
    mutationFn: (data: CreateStockEntryData) => inventoryService.createStockEntry(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: inventoryKeys.stockEntries() })
      queryClient.invalidateQueries({ queryKey: inventoryKeys.stats() })
      toast.success(t('inventory.stockEntryCreated', 'تم إنشاء حركة المخزون بنجاح'))
    },
    onError: (error: Error) => {
      toast.error(error.message)
    },
  })
}

export function useSubmitStockEntry() {
  const queryClient = useQueryClient()
  const { t } = useTranslation()

  return useMutation({
    mutationFn: (id: string) => inventoryService.submitStockEntry(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: inventoryKeys.stockEntries() })
      queryClient.invalidateQueries({ queryKey: inventoryKeys.stockLedger() })
      queryClient.invalidateQueries({ queryKey: inventoryKeys.stats() })
      toast.success(t('inventory.stockEntrySubmitted', 'تم ترحيل حركة المخزون بنجاح'))
    },
    onError: (error: Error) => {
      toast.error(error.message)
    },
  })
}

export function useCancelStockEntry() {
  const queryClient = useQueryClient()
  const { t } = useTranslation()

  return useMutation({
    mutationFn: (id: string) => inventoryService.cancelStockEntry(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: inventoryKeys.stockEntries() })
      queryClient.invalidateQueries({ queryKey: inventoryKeys.stockLedger() })
      queryClient.invalidateQueries({ queryKey: inventoryKeys.stats() })
      toast.success(t('inventory.stockEntryCancelled', 'تم إلغاء حركة المخزون'))
    },
    onError: (error: Error) => {
      toast.error(error.message)
    },
  })
}

export function useDeleteStockEntry() {
  const queryClient = useQueryClient()
  const { t } = useTranslation()

  return useMutation({
    mutationFn: (id: string) => inventoryService.deleteStockEntry(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: inventoryKeys.stockEntries() })
      toast.success(t('inventory.stockEntryDeleted', 'تم حذف حركة المخزون'))
    },
    onError: (error: Error) => {
      toast.error(error.message)
    },
  })
}

// ==================== STOCK LEDGER HOOKS ====================

export function useStockLedger(filters?: {
  itemId?: string
  warehouseId?: string
  dateFrom?: string
  dateTo?: string
  page?: number
  limit?: number
}) {
  return useQuery({
    queryKey: inventoryKeys.stockLedger(filters),
    queryFn: () => inventoryService.getStockLedger(filters),
  })
}

// ==================== BATCHES & SERIAL NUMBERS HOOKS ====================

export function useBatches(itemId?: string) {
  return useQuery({
    queryKey: inventoryKeys.batches(itemId),
    queryFn: () => inventoryService.getBatches(itemId),
  })
}

export function useSerialNumbers(itemId?: string) {
  return useQuery({
    queryKey: inventoryKeys.serialNumbers(itemId),
    queryFn: () => inventoryService.getSerialNumbers(itemId),
  })
}

// ==================== RECONCILIATION HOOKS ====================

export function useReconciliations() {
  return useQuery({
    queryKey: inventoryKeys.reconciliations(),
    queryFn: () => inventoryService.getReconciliations(),
  })
}

export function useCreateReconciliation() {
  const queryClient = useQueryClient()
  const { t } = useTranslation()

  return useMutation({
    mutationFn: (data: Parameters<typeof inventoryService.createReconciliation>[0]) =>
      inventoryService.createReconciliation(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: inventoryKeys.reconciliations() })
      toast.success(t('inventory.reconciliationCreated', 'تم إنشاء تسوية المخزون بنجاح'))
    },
    onError: (error: Error) => {
      toast.error(error.message)
    },
  })
}

export function useSubmitReconciliation() {
  const queryClient = useQueryClient()
  const { t } = useTranslation()

  return useMutation({
    mutationFn: (id: string) => inventoryService.submitReconciliation(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: inventoryKeys.reconciliations() })
      queryClient.invalidateQueries({ queryKey: inventoryKeys.stockLedger() })
      queryClient.invalidateQueries({ queryKey: inventoryKeys.stats() })
      toast.success(t('inventory.reconciliationSubmitted', 'تم ترحيل تسوية المخزون بنجاح'))
    },
    onError: (error: Error) => {
      toast.error(error.message)
    },
  })
}

// ==================== MASTER DATA HOOKS ====================

export function useItemGroups() {
  return useQuery({
    queryKey: inventoryKeys.itemGroups(),
    queryFn: () => inventoryService.getItemGroups(),
  })
}

export function useUnitsOfMeasure() {
  return useQuery({
    queryKey: inventoryKeys.uoms(),
    queryFn: () => inventoryService.getUnitsOfMeasure(),
  })
}

export function usePriceLists() {
  return useQuery({
    queryKey: inventoryKeys.priceLists(),
    queryFn: () => inventoryService.getPriceLists(),
  })
}

export function useItemPrices(filters?: { itemId?: string; priceListId?: string }) {
  return useQuery({
    queryKey: inventoryKeys.itemPrices(filters),
    queryFn: () => inventoryService.getItemPrices(filters),
    enabled: !!filters?.itemId || !!filters?.priceListId,
  })
}

// ==================== STATS & REPORTS HOOKS ====================

export function useInventoryStats() {
  return useQuery({
    queryKey: inventoryKeys.stats(),
    queryFn: () => inventoryService.getStats(),
  })
}

export function useStockBalance(filters?: {
  itemId?: string
  warehouseId?: string
  itemGroup?: string
}) {
  return useQuery({
    queryKey: inventoryKeys.stockBalance(filters),
    queryFn: () => inventoryService.getStockBalance(filters),
  })
}

export function useLowStockItems() {
  return useQuery({
    queryKey: inventoryKeys.lowStock(),
    queryFn: () => inventoryService.getLowStockItems(),
  })
}

// ==================== SETTINGS HOOKS ====================

export function useInventorySettings() {
  return useQuery({
    queryKey: inventoryKeys.settings(),
    queryFn: () => inventoryService.getSettings(),
  })
}

export function useUpdateInventorySettings() {
  const queryClient = useQueryClient()
  const { t } = useTranslation()

  return useMutation({
    mutationFn: (data: Parameters<typeof inventoryService.updateSettings>[0]) =>
      inventoryService.updateSettings(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: inventoryKeys.settings() })
      toast.success(t('inventory.settingsUpdated', 'تم تحديث إعدادات المخزون بنجاح'))
    },
    onError: (error: Error) => {
      toast.error(error.message)
    },
  })
}
