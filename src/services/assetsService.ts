/**
 * Assets Service
 * API client for Asset Management operations
 */

import api from '@/lib/api'
import type {
  Asset,
  AssetCategory,
  DepreciationEntry,
  MaintenanceSchedule,
  AssetMovement,
  AssetRepair,
  AssetSettings,
  AssetFilters,
  AssetStats,
  CreateAssetData,
} from '@/types/assets'

// Assets
export const getAssets = async (filters?: AssetFilters) => {
  const response = await api.get<{ assets: Asset[]; total: number; page: number; limit: number }>('/assets', { params: filters })
  return response.data
}

export const getAssetById = async (id: string) => {
  const response = await api.get<Asset>(`/assets/${id}`)
  return response.data
}

export const createAsset = async (data: CreateAssetData) => {
  const response = await api.post<Asset>('/assets', data)
  return response.data
}

export const updateAsset = async (id: string, data: Partial<CreateAssetData>) => {
  const response = await api.put<Asset>(`/assets/${id}`, data)
  return response.data
}

export const deleteAsset = async (id: string) => {
  const response = await api.delete(`/assets/${id}`)
  return response.data
}

export const submitAsset = async (id: string) => {
  const response = await api.patch<Asset>(`/assets/${id}/submit`)
  return response.data
}

export const sellAsset = async (id: string, data: { saleAmount: number; saleDate: string }) => {
  const response = await api.patch<Asset>(`/assets/${id}/sell`, data)
  return response.data
}

export const scrapAsset = async (id: string) => {
  const response = await api.patch<Asset>(`/assets/${id}/scrap`)
  return response.data
}

// Asset Categories
export const getAssetCategories = async () => {
  const response = await api.get<AssetCategory[]>('/assets/categories')
  return response.data
}

export const getAssetCategoryById = async (id: string) => {
  const response = await api.get<AssetCategory>(`/assets/categories/${id}`)
  return response.data
}

export const createAssetCategory = async (data: Omit<AssetCategory, '_id' | 'categoryId' | 'createdAt' | 'updatedAt'>) => {
  const response = await api.post<AssetCategory>('/assets/categories', data)
  return response.data
}

export const updateAssetCategory = async (id: string, data: Partial<AssetCategory>) => {
  const response = await api.put<AssetCategory>(`/assets/categories/${id}`, data)
  return response.data
}

export const deleteAssetCategory = async (id: string) => {
  const response = await api.delete(`/assets/categories/${id}`)
  return response.data
}

// Depreciation
export const getDepreciationSchedule = async (assetId: string) => {
  const response = await api.get<DepreciationEntry[]>(`/assets/${assetId}/depreciation`)
  return response.data
}

export const processDepreciation = async (assetId: string, date: string) => {
  const response = await api.post<DepreciationEntry>(`/assets/${assetId}/depreciation`, { date })
  return response.data
}

// Maintenance
export const getMaintenanceSchedules = async (filters?: { status?: string; assetId?: string }) => {
  const response = await api.get<MaintenanceSchedule[]>('/assets/maintenance', { params: filters })
  return response.data
}

export const createMaintenanceSchedule = async (assetId: string, data: Omit<MaintenanceSchedule, '_id'>) => {
  const response = await api.post<MaintenanceSchedule>(`/assets/${assetId}/maintenance`, data)
  return response.data
}

export const updateMaintenanceSchedule = async (assetId: string, scheduleId: string, data: Partial<MaintenanceSchedule>) => {
  const response = await api.put<MaintenanceSchedule>(`/assets/${assetId}/maintenance/${scheduleId}`, data)
  return response.data
}

export const completeMaintenanceSchedule = async (assetId: string, scheduleId: string, data: { completedDate: string; cost?: number; remarks?: string }) => {
  const response = await api.patch<MaintenanceSchedule>(`/assets/${assetId}/maintenance/${scheduleId}/complete`, data)
  return response.data
}

// Asset Movements
export const getAssetMovements = async (filters?: { assetId?: string; movementType?: string }) => {
  const response = await api.get<AssetMovement[]>('/assets/movements', { params: filters })
  return response.data
}

export const createAssetMovement = async (data: Omit<AssetMovement, '_id' | 'movementId' | 'createdAt'>) => {
  const response = await api.post<AssetMovement>('/assets/movements', data)
  return response.data
}

// Asset Repairs
export const getAssetRepairs = async (filters?: { assetId?: string; status?: string }) => {
  const response = await api.get<AssetRepair[]>('/assets/repairs', { params: filters })
  return response.data
}

export const getAssetRepairById = async (id: string) => {
  const response = await api.get<AssetRepair>(`/assets/repairs/${id}`)
  return response.data
}

export const createAssetRepair = async (data: Omit<AssetRepair, '_id' | 'repairId' | 'repairNumber' | 'createdAt' | 'updatedAt'>) => {
  const response = await api.post<AssetRepair>('/assets/repairs', data)
  return response.data
}

export const updateAssetRepair = async (id: string, data: Partial<AssetRepair>) => {
  const response = await api.put<AssetRepair>(`/assets/repairs/${id}`, data)
  return response.data
}

export const completeAssetRepair = async (id: string, data: { repairCost?: number; actionsPerformed?: string }) => {
  const response = await api.patch<AssetRepair>(`/assets/repairs/${id}/complete`, data)
  return response.data
}

// Stats
export const getAssetStats = async () => {
  const response = await api.get<AssetStats>('/assets/stats')
  return response.data
}

// Settings
export const getAssetSettings = async () => {
  const response = await api.get<AssetSettings>('/assets/settings')
  return response.data
}

export const updateAssetSettings = async (data: Partial<AssetSettings>) => {
  const response = await api.put<AssetSettings>('/assets/settings', data)
  return response.data
}

export const assetsService = {
  getAssets,
  getAssetById,
  createAsset,
  updateAsset,
  deleteAsset,
  submitAsset,
  sellAsset,
  scrapAsset,
  getAssetCategories,
  getAssetCategoryById,
  createAssetCategory,
  updateAssetCategory,
  deleteAssetCategory,
  getDepreciationSchedule,
  processDepreciation,
  getMaintenanceSchedules,
  createMaintenanceSchedule,
  updateMaintenanceSchedule,
  completeMaintenanceSchedule,
  getAssetMovements,
  createAssetMovement,
  getAssetRepairs,
  getAssetRepairById,
  createAssetRepair,
  updateAssetRepair,
  completeAssetRepair,
  getAssetStats,
  getAssetSettings,
  updateAssetSettings,
}

export default assetsService
