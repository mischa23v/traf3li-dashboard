import api from './api'

// ==================== TYPES & ENUMS ====================

// Asset Status
export type AssetStatus =
  | 'draft'
  | 'submitted'
  | 'active'
  | 'in_use'
  | 'partially_depreciated'
  | 'fully_depreciated'
  | 'sold'
  | 'scrapped'
  | 'in_maintenance'
  | 'disposed'
  | 'lost'
  | 'stolen'

// Asset Category
export type AssetCategory =
  | 'land'
  | 'buildings'
  | 'machinery'
  | 'vehicles'
  | 'furniture'
  | 'office_equipment'
  | 'computer_equipment'
  | 'software'
  | 'leasehold_improvements'
  | 'other'

// Depreciation Method
export type DepreciationMethod =
  | 'straight_line'
  | 'double_declining_balance'
  | 'written_down_value'
  | 'sum_of_years'
  | 'units_of_production'
  | 'none'

// Maintenance Type
export type MaintenanceType = 'preventive' | 'corrective' | 'predictive' | 'emergency'

// Maintenance Priority
export type MaintenancePriority = 'low' | 'medium' | 'high' | 'critical'

// Maintenance Status
export type MaintenanceStatus = 'scheduled' | 'in_progress' | 'completed' | 'cancelled' | 'overdue'

// Disposal Method
export type DisposalMethod = 'sale' | 'scrap' | 'donation' | 'trade_in' | 'write_off' | 'transfer'

// ==================== LABELS ====================

export const ASSET_STATUS_LABELS: Record<AssetStatus, { ar: string; en: string; color: string }> = {
  draft: { ar: 'مسودة', en: 'Draft', color: 'gray' },
  submitted: { ar: 'مقدم', en: 'Submitted', color: 'blue' },
  active: { ar: 'نشط', en: 'Active', color: 'green' },
  in_use: { ar: 'قيد الاستخدام', en: 'In Use', color: 'cyan' },
  partially_depreciated: { ar: 'مستهلك جزئياً', en: 'Partially Depreciated', color: 'yellow' },
  fully_depreciated: { ar: 'مستهلك بالكامل', en: 'Fully Depreciated', color: 'orange' },
  sold: { ar: 'مباع', en: 'Sold', color: 'purple' },
  scrapped: { ar: 'متلف', en: 'Scrapped', color: 'red' },
  in_maintenance: { ar: 'في الصيانة', en: 'In Maintenance', color: 'amber' },
  disposed: { ar: 'تم التخلص', en: 'Disposed', color: 'slate' },
  lost: { ar: 'مفقود', en: 'Lost', color: 'red' },
  stolen: { ar: 'مسروق', en: 'Stolen', color: 'red' },
}

export const ASSET_CATEGORY_LABELS: Record<AssetCategory, { ar: string; en: string; icon: string }> = {
  land: { ar: 'أرض', en: 'Land', icon: 'MapPin' },
  buildings: { ar: 'مباني', en: 'Buildings', icon: 'Building2' },
  machinery: { ar: 'آلات', en: 'Machinery', icon: 'Cog' },
  vehicles: { ar: 'مركبات', en: 'Vehicles', icon: 'Car' },
  furniture: { ar: 'أثاث', en: 'Furniture', icon: 'Armchair' },
  office_equipment: { ar: 'معدات مكتبية', en: 'Office Equipment', icon: 'Printer' },
  computer_equipment: { ar: 'معدات حاسوبية', en: 'Computer Equipment', icon: 'Monitor' },
  software: { ar: 'برمجيات', en: 'Software', icon: 'Code' },
  leasehold_improvements: { ar: 'تحسينات مستأجرة', en: 'Leasehold Improvements', icon: 'Wrench' },
  other: { ar: 'أخرى', en: 'Other', icon: 'Package' },
}

export const DEPRECIATION_METHOD_LABELS: Record<DepreciationMethod, { ar: string; en: string }> = {
  straight_line: { ar: 'القسط الثابت', en: 'Straight Line' },
  double_declining_balance: { ar: 'القسط المتناقص المضاعف', en: 'Double Declining Balance' },
  written_down_value: { ar: 'القيمة المكتوبة', en: 'Written Down Value' },
  sum_of_years: { ar: 'مجموع سنوات العمر', en: 'Sum of Years' },
  units_of_production: { ar: 'وحدات الإنتاج', en: 'Units of Production' },
  none: { ar: 'بدون استهلاك', en: 'None' },
}

export const MAINTENANCE_TYPE_LABELS: Record<MaintenanceType, { ar: string; en: string; color: string }> = {
  preventive: { ar: 'وقائية', en: 'Preventive', color: 'blue' },
  corrective: { ar: 'تصحيحية', en: 'Corrective', color: 'orange' },
  predictive: { ar: 'تنبؤية', en: 'Predictive', color: 'purple' },
  emergency: { ar: 'طارئة', en: 'Emergency', color: 'red' },
}

export const MAINTENANCE_STATUS_LABELS: Record<MaintenanceStatus, { ar: string; en: string; color: string }> = {
  scheduled: { ar: 'مجدول', en: 'Scheduled', color: 'blue' },
  in_progress: { ar: 'قيد التنفيذ', en: 'In Progress', color: 'yellow' },
  completed: { ar: 'مكتمل', en: 'Completed', color: 'green' },
  cancelled: { ar: 'ملغي', en: 'Cancelled', color: 'gray' },
  overdue: { ar: 'متأخر', en: 'Overdue', color: 'red' },
}

export const DISPOSAL_METHOD_LABELS: Record<DisposalMethod, { ar: string; en: string }> = {
  sale: { ar: 'بيع', en: 'Sale' },
  scrap: { ar: 'إتلاف', en: 'Scrap' },
  donation: { ar: 'تبرع', en: 'Donation' },
  trade_in: { ar: 'استبدال', en: 'Trade-In' },
  write_off: { ar: 'شطب', en: 'Write Off' },
  transfer: { ar: 'نقل', en: 'Transfer' },
}

// ==================== INTERFACES ====================

// Depreciation Schedule Entry
export interface DepreciationScheduleEntry {
  period: number
  periodStart: string
  periodEnd: string
  openingValue: number
  depreciationAmount: number
  accumulatedDepreciation: number
  closingValue: number
}

// Depreciation Info
export interface DepreciationInfo {
  method: DepreciationMethod
  usefulLifeYears: number
  usefulLifeMonths: number
  salvageValue: number
  salvageValuePercentage: number
  annualRate: number
  startDate: string
  schedule?: DepreciationScheduleEntry[]
}

// Depreciation Status
export interface DepreciationStatus {
  originalCost: number
  accumulatedDepreciation: number
  currentBookValue: number
  depreciationToDate: number
  remainingValue: number
  percentageDepreciated: number
  monthsRemaining: number
  fullyDepreciated: boolean
  lastCalculatedDate: string
}

// Maintenance Record
export interface MaintenanceRecord {
  maintenanceId: string
  type: MaintenanceType
  priority: MaintenancePriority
  status: MaintenanceStatus
  description: string
  descriptionAr?: string
  scheduledDate: string
  completedDate?: string
  provider?: string
  providerContact?: string
  laborCost: number
  partsCost: number
  totalCost: number
  warranty?: {
    covered: boolean
    warrantyId?: string
    claimReference?: string
  }
  notes?: string
  attachments?: Array<{
    name: string
    url: string
    uploadedAt: string
  }>
  performedBy?: string
  approvedBy?: string
  createdAt: string
  updatedAt?: string
}

// Warranty Info
export interface WarrantyInfo {
  hasWarranty: boolean
  warrantyType?: 'manufacturer' | 'extended' | 'third_party'
  warrantyProvider?: string
  startDate?: string
  endDate?: string
  coverageDetails?: string
  warrantyNumber?: string
  contactInfo?: string
  isActive?: boolean
  daysRemaining?: number
}

// Insurance Info
export interface InsuranceInfo {
  hasInsurance: boolean
  insuranceType?: 'full' | 'partial' | 'liability'
  provider?: string
  policyNumber?: string
  startDate?: string
  endDate?: string
  coverageAmount?: number
  premium?: number
  premiumFrequency?: 'monthly' | 'quarterly' | 'annual'
  deductible?: number
  isActive?: boolean
}

// Disposal Info
export interface DisposalInfo {
  disposed: boolean
  disposalDate?: string
  disposalMethod?: DisposalMethod
  disposalReason?: string
  salePrice?: number
  buyer?: string
  gainLoss?: number
  approvedBy?: string
  approvalDate?: string
  documents?: Array<{
    type: string
    url: string
    uploadedAt: string
  }>
}

// Asset Location
export interface AssetLocation {
  building?: string
  floor?: string
  room?: string
  department?: string
  departmentId?: string
  address?: string
  city?: string
  country?: string
  gpsCoordinates?: {
    latitude: number
    longitude: number
  }
}

// Asset Document
export interface AssetDocument {
  documentId: string
  type: 'purchase_invoice' | 'warranty_card' | 'manual' | 'certificate' | 'inspection_report' | 'photo' | 'other'
  name: string
  url: string
  uploadedAt: string
  uploadedBy?: string
  expiryDate?: string
}

// Fixed Asset
export interface FixedAsset {
  _id: string
  assetId: string
  assetNumber: string
  assetTag?: string

  // Basic Info
  name: string
  nameAr?: string
  description?: string
  descriptionAr?: string

  // Classification
  category: AssetCategory
  subcategory?: string
  assetClass?: string
  assetType?: string

  // Identification
  serialNumber?: string
  modelNumber?: string
  manufacturer?: string
  brand?: string

  // Acquisition
  acquisition: {
    method: 'purchase' | 'lease' | 'donation' | 'transfer' | 'construction'
    date: string
    vendor?: string
    vendorId?: string
    invoiceNumber?: string
    invoiceDate?: string
    poNumber?: string
    cost: number
    additionalCosts?: number
    totalCost: number
    currency: string
  }

  // Valuation
  valuation: {
    originalCost: number
    currentValue: number
    fairMarketValue?: number
    replacementCost?: number
    lastValuationDate?: string
    valuationMethod?: string
  }

  // Depreciation
  depreciation: DepreciationInfo
  depreciationStatus: DepreciationStatus

  // Location
  location: AssetLocation

  // Assignment
  assignment?: {
    assigned: boolean
    assignedTo?: string
    assignedToName?: string
    assignedToType?: 'employee' | 'department' | 'project' | 'cost_center'
    assignmentDate?: string
    expectedReturnDate?: string
  }

  // Condition
  condition: 'new' | 'excellent' | 'good' | 'fair' | 'poor' | 'non_functional'
  conditionNotes?: string
  lastInspectionDate?: string

  // Warranty & Insurance
  warranty: WarrantyInfo
  insurance: InsuranceInfo

  // Maintenance
  maintenance: {
    requiresMaintenance: boolean
    maintenanceSchedule?: 'weekly' | 'monthly' | 'quarterly' | 'semi_annual' | 'annual'
    lastMaintenanceDate?: string
    nextMaintenanceDate?: string
    maintenanceHistory: MaintenanceRecord[]
    totalMaintenanceCost: number
  }

  // Disposal
  disposal: DisposalInfo

  // Status
  status: AssetStatus
  isOperational: boolean

  // Documents
  documents: AssetDocument[]
  photos?: string[]

  // Financial
  accounting?: {
    glAccountCode?: string
    costCenter?: string
    project?: string
    capitalizedDate?: string
    depreciationExpenseAccount?: string
    accumulatedDepreciationAccount?: string
  }

  // Compliance
  compliance?: {
    regulatoryRequirements?: string[]
    certifications?: Array<{
      name: string
      number: string
      issueDate: string
      expiryDate: string
    }>
    nextAuditDate?: string
  }

  // Tags
  tags?: string[]

  // Notes
  notes?: string

  // Audit
  createdAt: string
  createdBy: string
  updatedAt?: string
  updatedBy?: string
}

// Asset Category Configuration
export interface AssetCategoryConfig {
  _id: string
  categoryId: string
  category: AssetCategory
  name: string
  nameAr: string
  description?: string
  descriptionAr?: string
  defaultDepreciationMethod: DepreciationMethod
  defaultUsefulLifeYears: number
  defaultSalvageValuePercentage: number
  glAccountCode?: string
  depreciationExpenseAccount?: string
  accumulatedDepreciationAccount?: string
  subcategories?: Array<{
    subcategoryId: string
    name: string
    nameAr?: string
    usefulLifeYears?: number
    salvageValuePercentage?: number
  }>
  isActive: boolean
  createdAt: string
  updatedAt?: string
}

// Create Asset Data
export interface CreateAssetData {
  name: string
  nameAr?: string
  description?: string
  descriptionAr?: string
  category: AssetCategory
  subcategory?: string
  serialNumber?: string
  modelNumber?: string
  manufacturer?: string
  brand?: string
  acquisition: {
    method: 'purchase' | 'lease' | 'donation' | 'transfer' | 'construction'
    date: string
    vendor?: string
    vendorId?: string
    invoiceNumber?: string
    invoiceDate?: string
    poNumber?: string
    cost: number
    additionalCosts?: number
    currency?: string
  }
  depreciation: {
    method: DepreciationMethod
    usefulLifeYears: number
    salvageValue?: number
    salvageValuePercentage?: number
    startDate?: string
  }
  location?: AssetLocation
  condition?: FixedAsset['condition']
  warranty?: Partial<WarrantyInfo>
  insurance?: Partial<InsuranceInfo>
  tags?: string[]
  notes?: string
}

// Update Asset Data
export interface UpdateAssetData extends Partial<CreateAssetData> {
  status?: AssetStatus
  assignment?: FixedAsset['assignment']
  conditionNotes?: string
  accounting?: FixedAsset['accounting']
}

// Asset Filters
export interface AssetFilters {
  category?: AssetCategory
  subcategory?: string
  status?: AssetStatus
  condition?: FixedAsset['condition']
  departmentId?: string
  locationBuilding?: string
  assignedTo?: string
  warrantyExpiring?: boolean
  maintenanceDue?: boolean
  fullyDepreciated?: boolean
  search?: string
  page?: number
  limit?: number
  sortBy?: string
  sortOrder?: 'asc' | 'desc'
}

// Response
export interface AssetResponse {
  data: FixedAsset[]
  pagination: {
    total: number
    page: number
    limit: number
    pages: number
  }
}

// Asset Statistics
export interface AssetStatistics {
  totalAssets: number
  totalValue: number
  totalBookValue: number
  totalDepreciation: number
  byCategory: Array<{
    category: AssetCategory
    count: number
    totalValue: number
    bookValue: number
  }>
  byStatus: Array<{
    status: AssetStatus
    count: number
  }>
  byCondition: Array<{
    condition: string
    count: number
  }>
  warrantyExpiringSoon: number
  maintenanceOverdue: number
  fullyDepreciatedAssets: number
  recentAcquisitions: number
  recentDisposals: number
}

// Depreciation Report
export interface DepreciationReport {
  reportDate: string
  period: {
    from: string
    to: string
  }
  summary: {
    totalAssets: number
    totalOriginalCost: number
    totalAccumulatedDepreciation: number
    totalBookValue: number
    periodDepreciation: number
  }
  byCategory: Array<{
    category: AssetCategory
    assetCount: number
    originalCost: number
    accumulatedDepreciation: number
    bookValue: number
    periodDepreciation: number
  }>
  assets: Array<{
    assetId: string
    assetNumber: string
    name: string
    category: AssetCategory
    acquisitionDate: string
    originalCost: number
    accumulatedDepreciation: number
    bookValue: number
    periodDepreciation: number
    depreciationMethod: DepreciationMethod
  }>
}

// ==================== API FUNCTIONS ====================

/**
 * Get all fixed assets with filters
 * GET /finance/assets
 */
export const getAssets = async (filters?: AssetFilters): Promise<AssetResponse> => {
  const params = new URLSearchParams()
  if (filters?.category) params.append('category', filters.category)
  if (filters?.subcategory) params.append('subcategory', filters.subcategory)
  if (filters?.status) params.append('status', filters.status)
  if (filters?.condition) params.append('condition', filters.condition)
  if (filters?.departmentId) params.append('departmentId', filters.departmentId)
  if (filters?.locationBuilding) params.append('locationBuilding', filters.locationBuilding)
  if (filters?.assignedTo) params.append('assignedTo', filters.assignedTo)
  if (filters?.warrantyExpiring !== undefined) params.append('warrantyExpiring', filters.warrantyExpiring.toString())
  if (filters?.maintenanceDue !== undefined) params.append('maintenanceDue', filters.maintenanceDue.toString())
  if (filters?.fullyDepreciated !== undefined) params.append('fullyDepreciated', filters.fullyDepreciated.toString())
  if (filters?.search) params.append('search', filters.search)
  if (filters?.page) params.append('page', filters.page.toString())
  if (filters?.limit) params.append('limit', filters.limit.toString())
  if (filters?.sortBy) params.append('sortBy', filters.sortBy)
  if (filters?.sortOrder) params.append('sortOrder', filters.sortOrder)

  const response = await api.get(`/finance/assets?${params.toString()}`)
  return response.data
}

/**
 * Get single asset by ID
 * GET /finance/assets/:id
 */
export const getAsset = async (assetId: string): Promise<FixedAsset> => {
  const response = await api.get(`/finance/assets/${assetId}`)
  return response.data
}

/**
 * Create a new asset
 * POST /finance/assets
 */
export const createAsset = async (data: CreateAssetData): Promise<FixedAsset> => {
  const response = await api.post('/finance/assets', data)
  return response.data
}

/**
 * Update an asset
 * PATCH /finance/assets/:id
 */
export const updateAsset = async (assetId: string, data: UpdateAssetData): Promise<FixedAsset> => {
  const response = await api.patch(`/finance/assets/${assetId}`, data)
  return response.data
}

/**
 * Delete an asset
 * DELETE /finance/assets/:id
 */
export const deleteAsset = async (assetId: string): Promise<void> => {
  await api.delete(`/finance/assets/${assetId}`)
}

/**
 * Get asset statistics
 * GET /finance/assets/stats
 */
export const getAssetStats = async (): Promise<AssetStatistics> => {
  const response = await api.get('/finance/assets/stats')
  return response.data
}

/**
 * Calculate depreciation for an asset
 * POST /finance/assets/:id/calculate-depreciation
 */
export const calculateDepreciation = async (assetId: string): Promise<FixedAsset> => {
  const response = await api.post(`/finance/assets/${assetId}/calculate-depreciation`)
  return response.data
}

/**
 * Run depreciation for all assets (batch)
 * POST /finance/assets/run-depreciation
 */
export const runDepreciation = async (data: {
  periodEnd: string
  category?: AssetCategory
  dryRun?: boolean
}): Promise<{
  processed: number
  totalDepreciation: number
  errors: Array<{ assetId: string; error: string }>
}> => {
  const response = await api.post('/finance/assets/run-depreciation', data)
  return response.data
}

/**
 * Get depreciation report
 * GET /finance/assets/depreciation-report
 */
export const getDepreciationReport = async (params: {
  periodFrom: string
  periodTo: string
  category?: AssetCategory
}): Promise<DepreciationReport> => {
  const queryParams = new URLSearchParams()
  queryParams.append('periodFrom', params.periodFrom)
  queryParams.append('periodTo', params.periodTo)
  if (params.category) queryParams.append('category', params.category)

  const response = await api.get(`/finance/assets/depreciation-report?${queryParams.toString()}`)
  return response.data
}

/**
 * Get depreciation schedule for an asset
 * GET /finance/assets/:id/depreciation-schedule
 */
export const getDepreciationSchedule = async (assetId: string): Promise<DepreciationScheduleEntry[]> => {
  const response = await api.get(`/finance/assets/${assetId}/depreciation-schedule`)
  return response.data
}

/**
 * Add maintenance record
 * POST /finance/assets/:id/maintenance
 */
export const addMaintenanceRecord = async (
  assetId: string,
  data: Partial<MaintenanceRecord>
): Promise<FixedAsset> => {
  const response = await api.post(`/finance/assets/${assetId}/maintenance`, data)
  return response.data
}

/**
 * Update maintenance record
 * PATCH /finance/assets/:id/maintenance/:maintenanceId
 */
export const updateMaintenanceRecord = async (
  assetId: string,
  maintenanceId: string,
  data: Partial<MaintenanceRecord>
): Promise<FixedAsset> => {
  const response = await api.patch(`/finance/assets/${assetId}/maintenance/${maintenanceId}`, data)
  return response.data
}

/**
 * Complete maintenance record
 * POST /finance/assets/:id/maintenance/:maintenanceId/complete
 */
export const completeMaintenanceRecord = async (
  assetId: string,
  maintenanceId: string,
  data: {
    completedDate: string
    laborCost: number
    partsCost: number
    notes?: string
  }
): Promise<FixedAsset> => {
  const response = await api.post(`/finance/assets/${assetId}/maintenance/${maintenanceId}/complete`, data)
  return response.data
}

/**
 * Get assets due for maintenance
 * GET /finance/assets/maintenance-due
 */
export const getAssetsDueForMaintenance = async (days?: number): Promise<FixedAsset[]> => {
  const params = new URLSearchParams()
  if (days) params.append('days', days.toString())

  const response = await api.get(`/finance/assets/maintenance-due?${params.toString()}`)
  return response.data
}

/**
 * Dispose asset
 * POST /finance/assets/:id/dispose
 */
export const disposeAsset = async (
  assetId: string,
  data: {
    disposalDate: string
    disposalMethod: DisposalMethod
    disposalReason?: string
    salePrice?: number
    buyer?: string
  }
): Promise<FixedAsset> => {
  const response = await api.post(`/finance/assets/${assetId}/dispose`, data)
  return response.data
}

/**
 * Reactivate asset
 * POST /finance/assets/:id/reactivate
 */
export const reactivateAsset = async (assetId: string, reason: string): Promise<FixedAsset> => {
  const response = await api.post(`/finance/assets/${assetId}/reactivate`, { reason })
  return response.data
}

/**
 * Transfer asset
 * POST /finance/assets/:id/transfer
 */
export const transferAsset = async (
  assetId: string,
  data: {
    toDepartmentId?: string
    toLocation?: AssetLocation
    transferDate: string
    reason?: string
  }
): Promise<FixedAsset> => {
  const response = await api.post(`/finance/assets/${assetId}/transfer`, data)
  return response.data
}

/**
 * Upload asset document
 * POST /finance/assets/:id/documents
 */
export const uploadAssetDocument = async (
  assetId: string,
  file: File,
  documentType: AssetDocument['type']
): Promise<AssetDocument> => {
  const formData = new FormData()
  formData.append('file', file)
  formData.append('type', documentType)

  const response = await api.post(`/finance/assets/${assetId}/documents`, formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  })
  return response.data
}

/**
 * Delete asset document
 * DELETE /finance/assets/:id/documents/:documentId
 */
export const deleteAssetDocument = async (assetId: string, documentId: string): Promise<void> => {
  await api.delete(`/finance/assets/${assetId}/documents/${documentId}`)
}

/**
 * Get assets with expiring warranty
 * GET /finance/assets/warranty-expiring
 */
export const getAssetsWithExpiringWarranty = async (days?: number): Promise<FixedAsset[]> => {
  const params = new URLSearchParams()
  if (days) params.append('days', days.toString())

  const response = await api.get(`/finance/assets/warranty-expiring?${params.toString()}`)
  return response.data
}

/**
 * Get asset categories
 * GET /finance/assets/categories
 */
export const getAssetCategories = async (): Promise<AssetCategoryConfig[]> => {
  const response = await api.get('/finance/assets/categories')
  return response.data
}

/**
 * Create asset category
 * POST /finance/assets/categories
 */
export const createAssetCategory = async (data: Partial<AssetCategoryConfig>): Promise<AssetCategoryConfig> => {
  const response = await api.post('/finance/assets/categories', data)
  return response.data
}

/**
 * Update asset category
 * PATCH /finance/assets/categories/:id
 */
export const updateAssetCategory = async (
  categoryId: string,
  data: Partial<AssetCategoryConfig>
): Promise<AssetCategoryConfig> => {
  const response = await api.patch(`/finance/assets/categories/${categoryId}`, data)
  return response.data
}

/**
 * Bulk update assets
 * POST /finance/assets/bulk-update
 */
export const bulkUpdateAssets = async (
  assetIds: string[],
  updates: { status?: AssetStatus; departmentId?: string; tags?: string[] }
): Promise<{ updated: number }> => {
  const response = await api.post('/finance/assets/bulk-update', { ids: assetIds, ...updates })
  return response.data
}

/**
 * Export assets
 * GET /finance/assets/export
 */
export const exportAssets = async (filters?: AssetFilters, format?: 'excel' | 'pdf'): Promise<Blob> => {
  const params = new URLSearchParams()
  if (filters?.category) params.append('category', filters.category)
  if (filters?.status) params.append('status', filters.status)
  if (format) params.append('format', format)

  const response = await api.get(`/finance/assets/export?${params.toString()}`, {
    responseType: 'blob',
  })
  return response.data
}

/**
 * Import assets
 * POST /finance/assets/import
 */
export const importAssets = async (
  file: File,
  options?: { skipDuplicates?: boolean; validateOnly?: boolean }
): Promise<{
  imported: number
  skipped: number
  errors: Array<{ row: number; error: string }>
}> => {
  const formData = new FormData()
  formData.append('file', file)
  if (options?.skipDuplicates) formData.append('skipDuplicates', 'true')
  if (options?.validateOnly) formData.append('validateOnly', 'true')

  const response = await api.post('/finance/assets/import', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  })
  return response.data
}

/**
 * Perform asset stocktake
 * POST /finance/assets/stocktake
 */
export const performStocktake = async (data: {
  stocktakeDate: string
  locationBuilding?: string
  departmentId?: string
  assets: Array<{
    assetId: string
    found: boolean
    condition?: FixedAsset['condition']
    locationNotes?: string
  }>
}): Promise<{
  verified: number
  discrepancies: Array<{
    assetId: string
    assetNumber: string
    issue: 'not_found' | 'condition_change' | 'location_mismatch'
    details: string
  }>
}> => {
  const response = await api.post('/finance/assets/stocktake', data)
  return response.data
}

/**
 * Get asset audit trail
 * GET /finance/assets/:id/audit-trail
 */
export const getAssetAuditTrail = async (assetId: string): Promise<
  Array<{
    action: string
    timestamp: string
    performedBy: string
    changes: Record<string, { from: unknown; to: unknown }>
  }>
> => {
  const response = await api.get(`/finance/assets/${assetId}/audit-trail`)
  return response.data
}

// ==================== DEFAULT EXPORT ====================

const assetService = {
  // CRUD
  getAssets,
  getAsset,
  createAsset,
  updateAsset,
  deleteAsset,
  getAssetStats,

  // Depreciation
  calculateDepreciation,
  runDepreciation,
  getDepreciationReport,
  getDepreciationSchedule,

  // Maintenance
  addMaintenanceRecord,
  updateMaintenanceRecord,
  completeMaintenanceRecord,
  getAssetsDueForMaintenance,

  // Lifecycle
  disposeAsset,
  reactivateAsset,
  transferAsset,

  // Documents
  uploadAssetDocument,
  deleteAssetDocument,

  // Warranty & Expiring
  getAssetsWithExpiringWarranty,

  // Categories
  getAssetCategories,
  createAssetCategory,
  updateAssetCategory,

  // Bulk Operations
  bulkUpdateAssets,
  exportAssets,
  importAssets,

  // Stocktake & Audit
  performStocktake,
  getAssetAuditTrail,

  // Labels
  ASSET_STATUS_LABELS,
  ASSET_CATEGORY_LABELS,
  DEPRECIATION_METHOD_LABELS,
  MAINTENANCE_TYPE_LABELS,
  MAINTENANCE_STATUS_LABELS,
  DISPOSAL_METHOD_LABELS,
}

export default assetService
