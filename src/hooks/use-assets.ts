/**
 * Assets Hooks
 * React Query hooks for Asset Management operations
 */

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import assetsService from '@/services/assetsService'
import { invalidateCache } from '@/lib/cache-invalidation'
import type { AssetFilters, CreateAssetData, AssetCategory, AssetSettings } from '@/types/assets'

// Query Keys
export const assetsKeys = {
  all: ['assets'] as const,
  assets: () => [...assetsKeys.all, 'list'] as const,
  assetList: (filters?: AssetFilters) => [...assetsKeys.assets(), { filters }] as const,
  assetDetail: (id: string) => [...assetsKeys.assets(), id] as const,
  categories: () => [...assetsKeys.all, 'categories'] as const,
  categoryDetail: (id: string) => [...assetsKeys.categories(), id] as const,
  depreciation: (assetId: string) => [...assetsKeys.all, 'depreciation', assetId] as const,
  maintenance: () => [...assetsKeys.all, 'maintenance'] as const,
  movements: () => [...assetsKeys.all, 'movements'] as const,
  repairs: () => [...assetsKeys.all, 'repairs'] as const,
  repairDetail: (id: string) => [...assetsKeys.repairs(), id] as const,
  stats: () => [...assetsKeys.all, 'stats'] as const,
  settings: () => [...assetsKeys.all, 'settings'] as const,
}

// Assets
export function useAssets(filters?: AssetFilters) {
  return useQuery({
    queryKey: assetsKeys.assetList(filters),
    queryFn: () => assetsService.getAssets(filters),
  })
}

export function useAsset(id: string) {
  return useQuery({
    queryKey: assetsKeys.assetDetail(id),
    queryFn: () => assetsService.getAssetById(id),
    enabled: !!id,
  })
}

export function useCreateAsset() {
  return useMutation({
    mutationFn: (data: CreateAssetData) => assetsService.createAsset(data),
    onSuccess: () => {
      invalidateCache.assets.all()
      toast.success('تم إنشاء الأصل بنجاح | Asset created successfully')
    },
    onError: () => {
      toast.error('فشل إنشاء الأصل | Failed to create asset')
    },
  })
}

export function useUpdateAsset() {
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<CreateAssetData> }) => assetsService.updateAsset(id, data),
    onSuccess: () => {
      invalidateCache.assets.all()
      toast.success('تم تحديث الأصل بنجاح | Asset updated successfully')
    },
    onError: () => {
      toast.error('فشل تحديث الأصل | Failed to update asset')
    },
  })
}

export function useDeleteAsset() {
  return useMutation({
    mutationFn: (id: string) => assetsService.deleteAsset(id),
    onSuccess: () => {
      invalidateCache.assets.all()
      toast.success('تم حذف الأصل بنجاح | Asset deleted successfully')
    },
    onError: () => {
      toast.error('فشل حذف الأصل | Failed to delete asset')
    },
  })
}

export function useSubmitAsset() {
  return useMutation({
    mutationFn: (id: string) => assetsService.submitAsset(id),
    onSuccess: () => {
      invalidateCache.assets.all()
      toast.success('تم تقديم الأصل | Asset submitted')
    },
    onError: () => {
      toast.error('فشل تقديم الأصل | Failed to submit asset')
    },
  })
}

export function useSellAsset() {
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: { saleAmount: number; saleDate: string } }) => assetsService.sellAsset(id, data),
    onSuccess: () => {
      invalidateCache.assets.all()
      toast.success('تم بيع الأصل بنجاح | Asset sold successfully')
    },
    onError: () => {
      toast.error('فشل بيع الأصل | Failed to sell asset')
    },
  })
}

export function useScrapAsset() {
  return useMutation({
    mutationFn: (id: string) => assetsService.scrapAsset(id),
    onSuccess: () => {
      invalidateCache.assets.all()
      toast.success('تم إتلاف الأصل | Asset scrapped')
    },
    onError: () => {
      toast.error('فشل إتلاف الأصل | Failed to scrap asset')
    },
  })
}

// Asset Categories
export function useAssetCategories() {
  return useQuery({
    queryKey: assetsKeys.categories(),
    queryFn: () => assetsService.getAssetCategories(),
  })
}

export function useAssetCategory(id: string) {
  return useQuery({
    queryKey: assetsKeys.categoryDetail(id),
    queryFn: () => assetsService.getAssetCategoryById(id),
    enabled: !!id,
  })
}

export function useCreateAssetCategory() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (data: Omit<AssetCategory, '_id' | 'categoryId' | 'createdAt' | 'updatedAt'>) => assetsService.createAssetCategory(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: assetsKeys.categories() })
      toast.success('تم إنشاء الفئة بنجاح | Category created successfully')
    },
    onError: () => {
      toast.error('فشل إنشاء الفئة | Failed to create category')
    },
  })
}

export function useUpdateAssetCategory() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<AssetCategory> }) => assetsService.updateAssetCategory(id, data),
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({ queryKey: assetsKeys.categories() })
      queryClient.invalidateQueries({ queryKey: assetsKeys.categoryDetail(id) })
      toast.success('تم تحديث الفئة بنجاح | Category updated successfully')
    },
    onError: () => {
      toast.error('فشل تحديث الفئة | Failed to update category')
    },
  })
}

export function useDeleteAssetCategory() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (id: string) => assetsService.deleteAssetCategory(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: assetsKeys.categories() })
      toast.success('تم حذف الفئة بنجاح | Category deleted successfully')
    },
    onError: () => {
      toast.error('فشل حذف الفئة | Failed to delete category')
    },
  })
}

// Depreciation
export function useDepreciationSchedule(assetId: string) {
  return useQuery({
    queryKey: assetsKeys.depreciation(assetId),
    queryFn: () => assetsService.getDepreciationSchedule(assetId),
    enabled: !!assetId,
  })
}

export function useProcessDepreciation() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ assetId, date }: { assetId: string; date: string }) => assetsService.processDepreciation(assetId, date),
    onSuccess: (_, { assetId }) => {
      queryClient.invalidateQueries({ queryKey: assetsKeys.depreciation(assetId) })
      invalidateCache.assets.all()
      toast.success('تم معالجة الإهلاك بنجاح | Depreciation processed')
    },
    onError: () => {
      toast.error('فشل معالجة الإهلاك | Failed to process depreciation')
    },
  })
}

// Maintenance
export function useMaintenanceSchedules(filters?: { status?: string; assetId?: string }) {
  return useQuery({
    queryKey: [...assetsKeys.maintenance(), filters],
    queryFn: () => assetsService.getMaintenanceSchedules(filters),
  })
}

export function useCreateMaintenanceSchedule() {
  return useMutation({
    mutationFn: ({ assetId, data }: { assetId: string; data: any }) => assetsService.createMaintenanceSchedule(assetId, data),
    onSuccess: () => {
      invalidateCache.assets.maintenance()
      toast.success('تم إنشاء جدول الصيانة بنجاح | Maintenance schedule created')
    },
    onError: () => {
      toast.error('فشل إنشاء جدول الصيانة | Failed to create maintenance schedule')
    },
  })
}

export function useCompleteMaintenanceSchedule() {
  return useMutation({
    mutationFn: ({ assetId, scheduleId, data }: { assetId: string; scheduleId: string; data: any }) =>
      assetsService.completeMaintenanceSchedule(assetId, scheduleId, data),
    onSuccess: () => {
      invalidateCache.assets.maintenance()
      toast.success('تم إكمال الصيانة | Maintenance completed')
    },
    onError: () => {
      toast.error('فشل إكمال الصيانة | Failed to complete maintenance')
    },
  })
}

// Asset Movements
export function useAssetMovements(filters?: { assetId?: string; movementType?: string }) {
  return useQuery({
    queryKey: [...assetsKeys.movements(), filters],
    queryFn: () => assetsService.getAssetMovements(filters),
  })
}

export function useCreateAssetMovement() {
  return useMutation({
    mutationFn: (data: any) => assetsService.createAssetMovement(data),
    onSuccess: () => {
      invalidateCache.assets.movements()
      toast.success('تم تسجيل حركة الأصل بنجاح | Asset movement recorded')
    },
    onError: () => {
      toast.error('فشل تسجيل حركة الأصل | Failed to record asset movement')
    },
  })
}

// Asset Repairs
export function useAssetRepairs(filters?: { assetId?: string; status?: string }) {
  return useQuery({
    queryKey: [...assetsKeys.repairs(), filters],
    queryFn: () => assetsService.getAssetRepairs(filters),
  })
}

export function useAssetRepair(id: string) {
  return useQuery({
    queryKey: assetsKeys.repairDetail(id),
    queryFn: () => assetsService.getAssetRepairById(id),
    enabled: !!id,
  })
}

export function useCreateAssetRepair() {
  return useMutation({
    mutationFn: (data: any) => assetsService.createAssetRepair(data),
    onSuccess: () => {
      invalidateCache.assets.repairs()
      toast.success('تم إنشاء طلب الإصلاح بنجاح | Repair request created')
    },
    onError: () => {
      toast.error('فشل إنشاء طلب الإصلاح | Failed to create repair request')
    },
  })
}

export function useUpdateAssetRepair() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: any }) => assetsService.updateAssetRepair(id, data),
    onSuccess: (_, { id }) => {
      invalidateCache.assets.repairs()
      queryClient.invalidateQueries({ queryKey: assetsKeys.repairDetail(id) })
      toast.success('تم تحديث طلب الإصلاح بنجاح | Repair request updated')
    },
    onError: () => {
      toast.error('فشل تحديث طلب الإصلاح | Failed to update repair request')
    },
  })
}

export function useCompleteAssetRepair() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: any }) => assetsService.completeAssetRepair(id, data),
    onSuccess: (_, { id }) => {
      invalidateCache.assets.repairs()
      queryClient.invalidateQueries({ queryKey: assetsKeys.repairDetail(id) })
      toast.success('تم إكمال الإصلاح بنجاح | Repair completed')
    },
    onError: () => {
      toast.error('فشل إكمال الإصلاح | Failed to complete repair')
    },
  })
}

// Stats
export function useAssetStats() {
  return useQuery({
    queryKey: assetsKeys.stats(),
    queryFn: () => assetsService.getAssetStats(),
  })
}

// Settings
export function useAssetSettings() {
  return useQuery({
    queryKey: assetsKeys.settings(),
    queryFn: () => assetsService.getAssetSettings(),
  })
}

export function useUpdateAssetSettings() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (data: Partial<AssetSettings>) => assetsService.updateAssetSettings(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: assetsKeys.settings() })
      toast.success('تم تحديث الإعدادات بنجاح | Settings updated successfully')
    },
    onError: () => {
      toast.error('فشل تحديث الإعدادات | Failed to update settings')
    },
  })
}
