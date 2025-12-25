/**
 * Assets Types
 * Types for Asset Management, Depreciation, and Maintenance
 */

import { z } from 'zod'

export type AssetStatus = 'draft' | 'submitted' | 'partially_depreciated' | 'fully_depreciated' | 'sold' | 'scrapped' | 'in_maintenance'
export type DepreciationMethod = 'straight_line' | 'double_declining_balance' | 'written_down_value'
export type MaintenanceStatus = 'planned' | 'overdue' | 'completed' | 'cancelled'
export type MovementType = 'issue' | 'receipt' | 'transfer'

export interface Asset {
  _id: string
  assetId: string
  assetNumber: string
  assetName: string
  assetNameAr?: string
  assetCategory?: string
  itemId?: string
  itemCode?: string
  status: AssetStatus
  isExistingAsset?: boolean
  location?: string
  custodian?: string
  custodianName?: string
  department?: string
  company?: string
  purchaseDate?: string
  purchaseInvoiceId?: string
  supplierId?: string
  supplierName?: string
  grossPurchaseAmount: number
  purchaseReceiptAmount?: number
  currency: string
  assetQuantity: number
  availableForUseDate?: string
  depreciationMethod: DepreciationMethod
  totalNumberOfDepreciations?: number
  frequencyOfDepreciation?: number
  depreciationStartDate?: string
  expectedValueAfterUsefulLife?: number
  openingAccumulatedDepreciation?: number
  currentValue?: number
  accumulatedDepreciation?: number
  valueAfterDepreciation?: number
  serialNo?: string
  warrantyExpiryDate?: string
  insuranceDetails?: {
    insurer?: string
    policyNo?: string
    startDate?: string
    endDate?: string
    insuredValue?: number
  }
  maintenanceSchedule?: MaintenanceSchedule[]
  depreciationSchedule?: DepreciationEntry[]
  movementHistory?: AssetMovement[]
  image?: string
  description?: string
  tags?: string[]
  createdAt: string
  updatedAt: string
}

export interface AssetCategory {
  _id: string
  categoryId: string
  name: string
  nameAr?: string
  parentCategory?: string
  depreciationMethod: DepreciationMethod
  totalNumberOfDepreciations: number
  frequencyOfDepreciation: number
  accounts?: {
    fixedAssetAccount?: string
    accumulatedDepreciationAccount?: string
    depreciationExpenseAccount?: string
  }
  createdAt: string
  updatedAt: string
}

export interface DepreciationEntry {
  _id?: string
  depreciationDate: string
  depreciationAmount: number
  accumulatedDepreciation: number
  valueAfterDepreciation: number
  journalEntryId?: string
  isBooked: boolean
}

export interface MaintenanceSchedule {
  _id?: string
  maintenanceType: string
  maintenanceDate: string
  dueDate?: string
  assignedTo?: string
  assignedToName?: string
  description?: string
  status: MaintenanceStatus
  completedDate?: string
  cost?: number
  remarks?: string
}

export interface AssetMovement {
  _id: string
  movementId: string
  assetId: string
  assetNumber?: string
  movementType: MovementType
  transactionDate: string
  sourceLocation?: string
  targetLocation?: string
  fromEmployee?: string
  toEmployee?: string
  quantity: number
  referenceDocType?: string
  referenceDocId?: string
  remarks?: string
  createdAt: string
}

export interface AssetRepair {
  _id: string
  repairId: string
  repairNumber: string
  assetId: string
  assetNumber?: string
  assetName?: string
  failureDate: string
  repairStatus: 'pending' | 'in_progress' | 'completed' | 'cancelled'
  description?: string
  actionsPerformed?: string
  downtime?: number
  repairCost?: number
  completedDate?: string
  createdAt: string
  updatedAt: string
}

export interface AssetSettings {
  _id: string
  assetNamingSeries?: string
  depreciationScheduleCreation?: 'manual' | 'automatic'
  scheduleDateBasedOn?: 'purchase_date' | 'available_for_use_date'
  dayOfMonth?: number
  enableDepreciationPosting?: boolean
  defaultDepreciationMethod?: DepreciationMethod
  updatedAt: string
}

export interface AssetFilters {
  status?: AssetStatus
  assetCategory?: string
  location?: string
  custodian?: string
  department?: string
  dateFrom?: string
  dateTo?: string
  search?: string
  sortBy?: 'assetName' | 'purchaseDate' | 'currentValue' | 'createdAt'
  sortOrder?: 'asc' | 'desc'
  page?: number
  limit?: number
}

export interface AssetStats {
  totalAssets: number
  totalValue: number
  totalDepreciation: number
  netValue: number
  byStatus: Record<AssetStatus, number>
  byCategory: { category: string; count: number; value: number }[]
  upcomingMaintenance: number
  overdueMaintenance: number
}

export interface CreateAssetData {
  assetName: string
  assetNameAr?: string
  assetCategory?: string
  itemId?: string
  location?: string
  custodian?: string
  department?: string
  purchaseDate?: string
  supplierId?: string
  grossPurchaseAmount: number
  currency?: string
  assetQuantity?: number
  depreciationMethod: DepreciationMethod
  totalNumberOfDepreciations?: number
  frequencyOfDepreciation?: number
  depreciationStartDate?: string
  serialNo?: string
  warrantyExpiryDate?: string
  description?: string
  image?: string
  tags?: string[]
}

export const createAssetSchema = z.object({
  assetName: z.string().min(1, 'اسم الأصل مطلوب'),
  assetNameAr: z.string().optional(),
  assetCategory: z.string().optional(),
  itemId: z.string().optional(),
  location: z.string().optional(),
  custodian: z.string().optional(),
  department: z.string().optional(),
  purchaseDate: z.string().optional(),
  supplierId: z.string().optional(),
  grossPurchaseAmount: z.number().min(0, 'قيمة الشراء مطلوبة'),
  currency: z.string().default('SAR'),
  assetQuantity: z.number().min(1).default(1),
  depreciationMethod: z.enum(['straight_line', 'double_declining_balance', 'written_down_value']).default('straight_line'),
  totalNumberOfDepreciations: z.number().min(1).optional(),
  frequencyOfDepreciation: z.number().min(1).optional(),
  depreciationStartDate: z.string().optional(),
  serialNo: z.string().optional(),
  warrantyExpiryDate: z.string().optional(),
  description: z.string().optional(),
  tags: z.array(z.string()).optional(),
})

export type CreateAssetInput = z.infer<typeof createAssetSchema>
