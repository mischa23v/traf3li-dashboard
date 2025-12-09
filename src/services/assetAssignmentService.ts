import api from './api'

// ==================== TYPES & ENUMS ====================

// Asset Assignment Status
export type AssetAssignmentStatus = 'assigned' | 'in_use' | 'returned' | 'lost' | 'damaged' | 'maintenance'

// Asset Type
export type AssetType = 'laptop' | 'desktop' | 'mobile_phone' | 'tablet' | 'monitor' |
  'keyboard' | 'mouse' | 'headset' | 'printer' | 'scanner' |
  'vehicle' | 'access_card' | 'id_badge' | 'keys' | 'uniform' |
  'tools' | 'equipment' | 'furniture' | 'books' | 'software_license' | 'other'

// Asset Category
export type AssetCategory = 'IT_equipment' | 'office_equipment' | 'vehicle' |
  'security_items' | 'tools' | 'furniture' | 'mobile_devices' |
  'software' | 'other'

// Asset Condition
export type AssetCondition = 'new' | 'excellent' | 'good' | 'fair' | 'poor'

// Assignment Type
export type AssignmentType = 'permanent' | 'temporary' | 'project_based' | 'pool'

// Work Type
export type WorkType = 'on_site' | 'remote' | 'hybrid' | 'field'

// Ownership Type
export type OwnershipType = 'company_owned' | 'leased' | 'rented' | 'employee_owned_reimbursed'

// Return Reason
export type ReturnReason = 'resignation' | 'termination' | 'upgrade' | 'project_end' |
  'replacement' | 'no_longer_needed' | 'defective' | 'lease_end'

// Incident Type
export type IncidentType = 'loss' | 'theft' | 'damage' | 'malfunction' | 'data_breach' |
  'unauthorized_access' | 'misuse' | 'accident'

// ==================== LABELS ====================

export const ASSET_ASSIGNMENT_STATUS_LABELS: Record<AssetAssignmentStatus, { ar: string; en: string; color: string }> = {
  assigned: { ar: 'مُسند', en: 'Assigned', color: 'blue' },
  in_use: { ar: 'قيد الاستخدام', en: 'In Use', color: 'emerald' },
  returned: { ar: 'مُرجع', en: 'Returned', color: 'slate' },
  lost: { ar: 'مفقود', en: 'Lost', color: 'red' },
  damaged: { ar: 'متضرر', en: 'Damaged', color: 'amber' },
  maintenance: { ar: 'صيانة', en: 'Maintenance', color: 'purple' },
}

export const ASSET_TYPE_LABELS: Record<AssetType, { ar: string; en: string; icon: string }> = {
  laptop: { ar: 'حاسب محمول', en: 'Laptop', icon: 'Laptop' },
  desktop: { ar: 'حاسب مكتبي', en: 'Desktop', icon: 'Monitor' },
  mobile_phone: { ar: 'هاتف محمول', en: 'Mobile Phone', icon: 'Smartphone' },
  tablet: { ar: 'جهاز لوحي', en: 'Tablet', icon: 'Tablet' },
  monitor: { ar: 'شاشة', en: 'Monitor', icon: 'Monitor' },
  keyboard: { ar: 'لوحة مفاتيح', en: 'Keyboard', icon: 'Keyboard' },
  mouse: { ar: 'فأرة', en: 'Mouse', icon: 'Mouse' },
  headset: { ar: 'سماعات', en: 'Headset', icon: 'Headphones' },
  printer: { ar: 'طابعة', en: 'Printer', icon: 'Printer' },
  scanner: { ar: 'ماسح ضوئي', en: 'Scanner', icon: 'ScanLine' },
  vehicle: { ar: 'مركبة', en: 'Vehicle', icon: 'Car' },
  access_card: { ar: 'بطاقة دخول', en: 'Access Card', icon: 'CreditCard' },
  id_badge: { ar: 'بطاقة هوية', en: 'ID Badge', icon: 'BadgeCheck' },
  keys: { ar: 'مفاتيح', en: 'Keys', icon: 'Key' },
  uniform: { ar: 'زي رسمي', en: 'Uniform', icon: 'Shirt' },
  tools: { ar: 'أدوات', en: 'Tools', icon: 'Wrench' },
  equipment: { ar: 'معدات', en: 'Equipment', icon: 'Settings' },
  furniture: { ar: 'أثاث', en: 'Furniture', icon: 'Armchair' },
  books: { ar: 'كتب', en: 'Books', icon: 'BookOpen' },
  software_license: { ar: 'ترخيص برمجي', en: 'Software License', icon: 'FileKey' },
  other: { ar: 'أخرى', en: 'Other', icon: 'Package' },
}

export const ASSET_CATEGORY_LABELS: Record<AssetCategory, { ar: string; en: string; color: string }> = {
  IT_equipment: { ar: 'معدات تقنية', en: 'IT Equipment', color: 'blue' },
  office_equipment: { ar: 'معدات مكتبية', en: 'Office Equipment', color: 'slate' },
  vehicle: { ar: 'مركبات', en: 'Vehicles', color: 'purple' },
  security_items: { ar: 'عناصر الأمان', en: 'Security Items', color: 'red' },
  tools: { ar: 'أدوات', en: 'Tools', color: 'amber' },
  furniture: { ar: 'أثاث', en: 'Furniture', color: 'teal' },
  mobile_devices: { ar: 'أجهزة محمولة', en: 'Mobile Devices', color: 'indigo' },
  software: { ar: 'برمجيات', en: 'Software', color: 'pink' },
  other: { ar: 'أخرى', en: 'Other', color: 'gray' },
}

export const ASSET_CONDITION_LABELS: Record<AssetCondition, { ar: string; en: string; color: string }> = {
  new: { ar: 'جديد', en: 'New', color: 'emerald' },
  excellent: { ar: 'ممتاز', en: 'Excellent', color: 'blue' },
  good: { ar: 'جيد', en: 'Good', color: 'teal' },
  fair: { ar: 'مقبول', en: 'Fair', color: 'amber' },
  poor: { ar: 'ضعيف', en: 'Poor', color: 'red' },
}

export const ASSIGNMENT_TYPE_LABELS: Record<AssignmentType, { ar: string; en: string }> = {
  permanent: { ar: 'دائم', en: 'Permanent' },
  temporary: { ar: 'مؤقت', en: 'Temporary' },
  project_based: { ar: 'مرتبط بمشروع', en: 'Project-Based' },
  pool: { ar: 'مشترك', en: 'Pool' },
}

export const WORK_TYPE_LABELS: Record<WorkType, { ar: string; en: string }> = {
  on_site: { ar: 'في المكتب', en: 'On-Site' },
  remote: { ar: 'عن بعد', en: 'Remote' },
  hybrid: { ar: 'هجين', en: 'Hybrid' },
  field: { ar: 'ميداني', en: 'Field' },
}

export const OWNERSHIP_TYPE_LABELS: Record<OwnershipType, { ar: string; en: string }> = {
  company_owned: { ar: 'ملك الشركة', en: 'Company Owned' },
  leased: { ar: 'مستأجر', en: 'Leased' },
  rented: { ar: 'إيجار', en: 'Rented' },
  employee_owned_reimbursed: { ar: 'ملك الموظف (معوض)', en: 'Employee Owned (Reimbursed)' },
}

export const RETURN_REASON_LABELS: Record<ReturnReason, { ar: string; en: string }> = {
  resignation: { ar: 'استقالة', en: 'Resignation' },
  termination: { ar: 'إنهاء خدمة', en: 'Termination' },
  upgrade: { ar: 'ترقية', en: 'Upgrade' },
  project_end: { ar: 'انتهاء المشروع', en: 'Project End' },
  replacement: { ar: 'استبدال', en: 'Replacement' },
  no_longer_needed: { ar: 'غير مطلوب', en: 'No Longer Needed' },
  defective: { ar: 'معطل', en: 'Defective' },
  lease_end: { ar: 'انتهاء الإيجار', en: 'Lease End' },
}

export const INCIDENT_TYPE_LABELS: Record<IncidentType, { ar: string; en: string; color: string }> = {
  loss: { ar: 'فقدان', en: 'Loss', color: 'red' },
  theft: { ar: 'سرقة', en: 'Theft', color: 'red' },
  damage: { ar: 'تلف', en: 'Damage', color: 'amber' },
  malfunction: { ar: 'عطل', en: 'Malfunction', color: 'orange' },
  data_breach: { ar: 'اختراق بيانات', en: 'Data Breach', color: 'purple' },
  unauthorized_access: { ar: 'وصول غير مصرح', en: 'Unauthorized Access', color: 'red' },
  misuse: { ar: 'سوء استخدام', en: 'Misuse', color: 'amber' },
  accident: { ar: 'حادث', en: 'Accident', color: 'orange' },
}

// ==================== INTERFACES ====================

// Accessory
export interface AssetAccessory {
  accessoryType: string
  description: string
  serialNumber?: string
  quantity: number
  returned: boolean
}

// Handover Details
export interface HandoverDetails {
  handedOverBy: string
  handedOverByName?: string
  handoverDate: string
  handoverTime?: string
  handoverMethod: 'in_person' | 'courier' | 'mail'
  handoverLocation?: string
  accessories?: AssetAccessory[]
  handoverChecklist?: Array<{
    item: string
    checked: boolean
    notes?: string
  }>
  employeeSignature?: string
  handoverOfficerSignature?: string
  handoverDocument?: string
  handoverPhotos?: string[]
}

// Warranty Details
export interface WarrantyDetails {
  hasWarranty: boolean
  warrantyProvider?: string
  warrantyStartDate?: string
  warrantyEndDate?: string
  warrantyDuration?: number
  warrantyType?: 'manufacturer' | 'extended' | 'insurance'
  warrantyNumber?: string
  warrantyDocument?: string
  coverageDetails?: string
  expired: boolean
}

// Insurance Details
export interface InsuranceDetails {
  insured: boolean
  insuranceProvider?: string
  policyNumber?: string
  coverageAmount?: number
  deductible?: number
  policyStartDate?: string
  policyEndDate?: string
  policyDocument?: string
  expired: boolean
}

// Maintenance Record
export interface MaintenanceRecord {
  maintenanceId: string
  maintenanceType: 'preventive' | 'corrective' | 'inspection' | 'upgrade'
  maintenanceDate: string
  performedBy: 'internal' | 'vendor' | 'manufacturer'
  technician?: string
  vendorName?: string
  workOrder?: string
  description: string
  partsReplaced?: Array<{
    partName: string
    partNumber?: string
    quantity: number
    cost?: number
  }>
  laborCost?: number
  totalCost?: number
  downtime?: number
  nextServiceDue?: string
  notes?: string
}

// Repair Record
export interface RepairRecord {
  repairId: string
  reportedDate: string
  reportedBy: string
  issueDescription: string
  severity: 'minor' | 'moderate' | 'major' | 'critical'
  causeOfDamage?: 'normal_wear' | 'accident' | 'misuse' | 'manufacturing_defect' | 'external_factors' | 'unknown'
  employeeLiable: boolean
  liabilityAmount?: number
  repairStatus: 'reported' | 'assessed' | 'approved' | 'in_progress' | 'completed' | 'unrepairable'
  repairStartDate?: string
  repairCompletionDate?: string
  repairedBy?: string
  vendorName?: string
  totalRepairCost?: number
  assetFunctional: boolean
  notes?: string
}

// Incident Record
export interface IncidentRecord {
  incidentId: string
  incidentType: IncidentType
  incidentDate: string
  reportedDate: string
  reportedBy: string
  incidentDescription: string
  location?: string
  severity: 'minor' | 'moderate' | 'major' | 'critical'
  assetRecoverable: boolean
  dataLoss: boolean
  financialLoss?: number
  resolved: boolean
  resolutionDate?: string
  resolutionAction?: string
  notes?: string
}

// Return Process
export interface ReturnProcess {
  returnInitiated: boolean
  returnInitiatedDate?: string
  returnInitiatedBy?: 'employee' | 'manager' | 'hr' | 'it' | 'system'
  returnReason?: ReturnReason
  returnReasonDetails?: string
  returnDueDate?: string
  actualReturnDate?: string
  returnedBy?: string
  returnMethod?: 'hand_delivery' | 'courier' | 'mail' | 'pickup'
  returnLocation?: string
  receivedBy?: string
  receivedByName?: string
  conditionAtReturn?: AssetCondition
  inspected: boolean
  inspectionDate?: string
  inspectedBy?: string
  damageAssessment?: {
    hasDamage: boolean
    damages: Array<{
      damageType: string
      description: string
      repairCost?: number
    }>
    totalDamage: number
    beyondNormalWear: boolean
  }
  dataWiped?: boolean
  returnCompleted: boolean
  returnCompletionDate?: string
  clearance?: {
    cleared: boolean
    clearanceDate?: string
    clearanceBy?: string
    clearanceCertificate?: string
  }
}

// Document
export interface AssetDocument {
  documentType: 'assignment_form' | 'acknowledgment' | 'handover_checklist' | 'warranty' |
    'insurance_policy' | 'invoice' | 'receipt' | 'maintenance_record' | 'repair_invoice' |
    'incident_report' | 'return_inspection' | 'clearance_certificate' | 'destruction_certificate' | 'photo' | 'other'
  documentName: string
  documentNameAr?: string
  fileUrl: string
  fileName: string
  fileSize?: number
  uploadedOn: string
  uploadedBy?: string
  expiryDate?: string
  verified: boolean
  verifiedBy?: string
}

// Main Asset Assignment Record
export interface AssetAssignment {
  _id: string
  assignmentId: string
  assignmentNumber: string

  // Employee Info
  employeeId: string
  employeeNumber: string
  employeeName: string
  employeeNameAr?: string
  nationalId?: string
  email?: string
  phone?: string
  department?: string
  departmentId?: string
  jobTitle?: string
  location?: string
  workType?: WorkType
  managerId?: string
  managerName?: string

  // Asset Info
  assetId: string
  assetTag: string
  assetNumber?: string
  serialNumber?: string
  modelNumber?: string
  assetName: string
  assetNameAr?: string
  assetType: AssetType
  assetCategory: AssetCategory
  brand?: string
  model?: string
  specifications?: {
    processor?: string
    ram?: string
    storage?: string
    screenSize?: string
    operatingSystem?: string
    imei?: string
    phoneNumber?: string
    color?: string
    customSpecs?: Array<{
      specName: string
      specValue: string
    }>
  }
  conditionAtAssignment: AssetCondition
  conditionNotes?: string
  photos?: Array<{
    photoType: 'asset' | 'serial_number' | 'damage' | 'accessories'
    photoUrl: string
    capturedDate: string
    notes?: string
  }>
  purchasePrice?: number
  currentValue?: number
  currency?: string
  ownership: OwnershipType
  warranty?: WarrantyDetails
  insurance?: InsuranceDetails

  // Assignment Details
  assignmentType: AssignmentType
  assignedDate: string
  expectedReturnDate?: string
  indefiniteAssignment: boolean
  assignmentPurpose?: string
  assignmentPurposeCategory?: 'job_requirement' | 'project' | 'training' | 'replacement' | 'temporary_need'
  projectAssignment?: {
    projectId: string
    projectName: string
    projectStartDate: string
    projectEndDate?: string
    returnAfterProject: boolean
  }
  assignmentLocation?: {
    primaryLocation: string
    mobileAsset: boolean
    allowedLocations?: string[]
    homeUseAllowed: boolean
    internationalTravelAllowed: boolean
  }
  handover?: HandoverDetails
  acknowledgment?: {
    acknowledged: boolean
    acknowledgmentDate?: string
    acknowledgmentMethod?: 'digital_signature' | 'physical_signature' | 'email_confirmation' | 'system_acceptance'
    signature?: string
    signatureUrl?: string
  }

  // Status & Tracking
  status: AssetAssignmentStatus
  currentLocation?: {
    locationType: 'office' | 'home' | 'field' | 'transit' | 'storage' | 'other'
    locationName: string
    building?: string
    floor?: string
    room?: string
    lastUpdated: string
  }
  usageTracking?: {
    lastLoginDate?: string
    activeHoursPerDay?: number
    utilizationRate?: number
    idleDays?: number
  }

  // Maintenance & Repairs
  maintenanceSchedule?: {
    required: boolean
    frequency?: 'daily' | 'weekly' | 'monthly' | 'quarterly' | 'annual'
    lastMaintenanceDate?: string
    nextMaintenanceDue?: string
    overdue: boolean
  }
  maintenanceHistory?: MaintenanceRecord[]
  repairs?: RepairRecord[]
  totalMaintenanceCost?: number
  totalRepairCost?: number

  // Incidents
  incidents?: IncidentRecord[]

  // Return Process
  returnProcess?: ReturnProcess

  // Documents
  documents?: AssetDocument[]

  // Notes
  notes?: {
    employeeNotes?: string
    itNotes?: string
    adminNotes?: string
    maintenanceNotes?: string
    internalNotes?: string
    specialInstructions?: string
  }

  // Compliance
  compliance?: {
    assetTaggingCompliance: {
      tagged: boolean
      tagType?: 'barcode' | 'qr_code' | 'rfid' | 'serial_number'
      tagLocation?: string
      tagReadable: boolean
    }
    lastAuditDate?: string
    nextAuditDue?: string
    compliant: boolean
  }

  // Analytics
  analytics?: {
    assignmentDuration: number
    utilizationRate?: number
    totalCostOfOwnership?: number
    costPerDay?: number
  }

  // Audit
  createdOn: string
  createdBy: string
  lastModifiedOn?: string
  lastModifiedBy?: string
}

// Create Asset Assignment Data
export interface CreateAssetAssignmentData {
  employeeId: string
  employeeName: string
  employeeNameAr?: string
  employeeNumber?: string
  department?: string
  jobTitle?: string
  email?: string
  phone?: string
  workType?: WorkType

  assetId?: string
  assetTag: string
  assetNumber?: string
  serialNumber?: string
  assetName: string
  assetNameAr?: string
  assetType: AssetType
  assetCategory: AssetCategory
  brand?: string
  model?: string
  specifications?: {
    processor?: string
    ram?: string
    storage?: string
    screenSize?: string
    operatingSystem?: string
    imei?: string
    phoneNumber?: string
    color?: string
    customSpecs?: Array<{
      specName: string
      specValue: string
    }>
  }
  conditionAtAssignment: AssetCondition
  conditionNotes?: string
  purchasePrice?: number
  currentValue?: number
  currency?: string
  ownership?: OwnershipType

  assignmentType: AssignmentType
  assignedDate: string
  expectedReturnDate?: string
  indefiniteAssignment?: boolean
  assignmentPurpose?: string
  assignmentPurposeCategory?: 'job_requirement' | 'project' | 'training' | 'replacement' | 'temporary_need'

  projectAssignment?: {
    projectId: string
    projectName: string
    projectStartDate: string
    projectEndDate?: string
    returnAfterProject: boolean
  }

  assignmentLocation?: {
    primaryLocation: string
    mobileAsset: boolean
    homeUseAllowed?: boolean
    internationalTravelAllowed?: boolean
  }

  accessories?: AssetAccessory[]

  notes?: {
    employeeNotes?: string
    itNotes?: string
    adminNotes?: string
    specialInstructions?: string
  }
}

// Update Asset Assignment Data
export interface UpdateAssetAssignmentData {
  assetName?: string
  assetNameAr?: string
  conditionAtAssignment?: AssetCondition
  conditionNotes?: string
  assignmentType?: AssignmentType
  expectedReturnDate?: string
  assignmentPurpose?: string
  assignmentPurposeCategory?: 'job_requirement' | 'project' | 'training' | 'replacement' | 'temporary_need'
  assignmentLocation?: {
    primaryLocation?: string
    mobileAsset?: boolean
    homeUseAllowed?: boolean
    internationalTravelAllowed?: boolean
  }
  notes?: {
    employeeNotes?: string
    itNotes?: string
    adminNotes?: string
    specialInstructions?: string
  }
}

// Filters
export interface AssetAssignmentFilters {
  status?: AssetAssignmentStatus
  assetType?: AssetType
  assetCategory?: AssetCategory
  assignmentType?: AssignmentType
  department?: string
  employeeId?: string
  condition?: AssetCondition
  dateFrom?: string
  dateTo?: string
  overdue?: boolean
  search?: string
  page?: number
  limit?: number
}

// Response
export interface AssetAssignmentResponse {
  data: AssetAssignment[]
  pagination: {
    total: number
    page: number
    limit: number
    pages: number
  }
}

// Stats
export interface AssetAssignmentStats {
  totalAssignments: number
  byStatus: Array<{ status: AssetAssignmentStatus; count: number }>
  byType: Array<{ assetType: AssetType; count: number }>
  byCategory: Array<{ category: AssetCategory; count: number }>
  activeAssignments: number
  returnedThisMonth: number
  overdueReturns: number
  pendingReturns: number
  totalAssetValue: number
  averageAssignmentDuration: number
  maintenanceDue: number
  incidentsThisMonth: number
  byDepartment: Array<{ department: string; count: number }>
}

// ==================== API FUNCTIONS ====================

// Get all asset assignments
export const getAssetAssignments = async (filters?: AssetAssignmentFilters): Promise<AssetAssignmentResponse> => {
  const params = new URLSearchParams()
  if (filters?.status) params.append('status', filters.status)
  if (filters?.assetType) params.append('assetType', filters.assetType)
  if (filters?.assetCategory) params.append('assetCategory', filters.assetCategory)
  if (filters?.assignmentType) params.append('assignmentType', filters.assignmentType)
  if (filters?.department) params.append('department', filters.department)
  if (filters?.employeeId) params.append('employeeId', filters.employeeId)
  if (filters?.condition) params.append('condition', filters.condition)
  if (filters?.dateFrom) params.append('dateFrom', filters.dateFrom)
  if (filters?.dateTo) params.append('dateTo', filters.dateTo)
  if (filters?.overdue !== undefined) params.append('overdue', filters.overdue.toString())
  if (filters?.search) params.append('search', filters.search)
  if (filters?.page) params.append('page', filters.page.toString())
  if (filters?.limit) params.append('limit', filters.limit.toString())

  const response = await api.get(`/hr/asset-assignments?${params.toString()}`)
  return response.data
}

// Get single asset assignment
export const getAssetAssignment = async (assignmentId: string): Promise<AssetAssignment> => {
  const response = await api.get(`/hr/asset-assignments/${assignmentId}`)
  return response.data
}

// Create asset assignment
export const createAssetAssignment = async (data: CreateAssetAssignmentData): Promise<AssetAssignment> => {
  const response = await api.post('/hr/asset-assignments', data)
  return response.data
}

// Update asset assignment
export const updateAssetAssignment = async (assignmentId: string, data: UpdateAssetAssignmentData): Promise<AssetAssignment> => {
  const response = await api.patch(`/hr/asset-assignments/${assignmentId}`, data)
  return response.data
}

// Delete asset assignment
export const deleteAssetAssignment = async (assignmentId: string): Promise<void> => {
  await api.delete(`/hr/asset-assignments/${assignmentId}`)
}

// Get asset assignment stats
export const getAssetAssignmentStats = async (): Promise<AssetAssignmentStats> => {
  const response = await api.get('/hr/asset-assignments/stats')
  return response.data
}

// Acknowledge assignment
export const acknowledgeAssignment = async (assignmentId: string, data: {
  signature?: string
  acknowledgmentMethod?: 'digital_signature' | 'physical_signature' | 'email_confirmation' | 'system_acceptance'
}): Promise<AssetAssignment> => {
  const response = await api.post(`/hr/asset-assignments/${assignmentId}/acknowledge`, data)
  return response.data
}

// Initiate return
export const initiateReturn = async (assignmentId: string, data: {
  returnReason: ReturnReason
  returnReasonDetails?: string
  returnDueDate: string
}): Promise<AssetAssignment> => {
  const response = await api.post(`/hr/asset-assignments/${assignmentId}/return/initiate`, data)
  return response.data
}

// Complete return
export const completeReturn = async (assignmentId: string, data: {
  actualReturnDate: string
  returnedBy: string
  returnMethod: 'hand_delivery' | 'courier' | 'mail' | 'pickup'
  returnLocation?: string
  receivedBy: string
  receivedByName?: string
  conditionAtReturn: AssetCondition
  hasDamage?: boolean
  damages?: Array<{
    damageType: string
    description: string
    repairCost?: number
  }>
  dataWiped?: boolean
  notes?: string
}): Promise<AssetAssignment> => {
  const response = await api.post(`/hr/asset-assignments/${assignmentId}/return/complete`, data)
  return response.data
}

// Record maintenance
export const recordMaintenance = async (assignmentId: string, data: {
  maintenanceType: 'preventive' | 'corrective' | 'inspection' | 'upgrade'
  maintenanceDate: string
  performedBy: 'internal' | 'vendor' | 'manufacturer'
  technician?: string
  vendorName?: string
  description: string
  partsReplaced?: Array<{
    partName: string
    partNumber?: string
    quantity: number
    cost?: number
  }>
  laborCost?: number
  totalCost?: number
  nextServiceDue?: string
  notes?: string
}): Promise<AssetAssignment> => {
  const response = await api.post(`/hr/asset-assignments/${assignmentId}/maintenance`, data)
  return response.data
}

// Report incident
export const reportIncident = async (assignmentId: string, data: {
  incidentType: IncidentType
  incidentDate: string
  incidentDescription: string
  location?: string
  severity: 'minor' | 'moderate' | 'major' | 'critical'
  dataLoss?: boolean
  financialLoss?: number
  notes?: string
}): Promise<AssetAssignment> => {
  const response = await api.post(`/hr/asset-assignments/${assignmentId}/incident`, data)
  return response.data
}

// Resolve incident
export const resolveIncident = async (assignmentId: string, incidentId: string, data: {
  resolutionAction: string
  assetRecoverable: boolean
  notes?: string
}): Promise<AssetAssignment> => {
  const response = await api.post(`/hr/asset-assignments/${assignmentId}/incidents/${incidentId}/resolve`, data)
  return response.data
}

// Update status
export const updateAssetStatus = async (assignmentId: string, data: {
  status: AssetAssignmentStatus
  notes?: string
}): Promise<AssetAssignment> => {
  const response = await api.put(`/hr/asset-assignments/${assignmentId}/status`, data)
  return response.data
}

// Bulk delete
export const bulkDeleteAssetAssignments = async (ids: string[]): Promise<{ deleted: number }> => {
  const response = await api.post('/hr/asset-assignments/bulk-delete', { ids })
  return response.data
}

// Get employee assignments
export const getEmployeeAssetAssignments = async (employeeId: string): Promise<AssetAssignment[]> => {
  const response = await api.get(`/hr/asset-assignments/by-employee/${employeeId}`)
  return response.data
}

// Get overdue returns
export const getOverdueReturns = async (): Promise<Array<{
  assignmentId: string
  employeeName: string
  assetName: string
  assetType: AssetType
  expectedReturnDate: string
  daysOverdue: number
}>> => {
  const response = await api.get('/hr/asset-assignments/overdue')
  return response.data
}

// Get maintenance due
export const getMaintenanceDue = async (): Promise<Array<{
  assignmentId: string
  employeeName: string
  assetName: string
  assetType: AssetType
  nextMaintenanceDue: string
  daysUntilDue: number
}>> => {
  const response = await api.get('/hr/asset-assignments/maintenance-due')
  return response.data
}

// Export asset assignments
export const exportAssetAssignments = async (filters?: AssetAssignmentFilters): Promise<Blob> => {
  const params = new URLSearchParams()
  if (filters?.status) params.append('status', filters.status)
  if (filters?.assetType) params.append('assetType', filters.assetType)
  if (filters?.dateFrom) params.append('dateFrom', filters.dateFrom)
  if (filters?.dateTo) params.append('dateTo', filters.dateTo)

  const response = await api.get(`/hr/asset-assignments/export?${params.toString()}`, {
    responseType: 'blob'
  })
  return response.data
}

// Issue clearance certificate
export const issueClearanceCertificate = async (assignmentId: string): Promise<AssetAssignment> => {
  const response = await api.post(`/hr/asset-assignments/${assignmentId}/clearance`)
  return response.data
}

// Transfer asset to another employee
export const transferAsset = async (assignmentId: string, data: {
  newEmployeeId: string
  newEmployeeName: string
  transferDate: string
  transferReason?: string
  notes?: string
}): Promise<AssetAssignment> => {
  const response = await api.post(`/hr/asset-assignments/${assignmentId}/transfer`, data)
  return response.data
}

// Report repair needed
export const reportRepair = async (assignmentId: string, data: {
  issueDescription: string
  severity: 'minor' | 'moderate' | 'major' | 'critical'
  causeOfDamage?: 'normal_wear' | 'accident' | 'misuse' | 'manufacturing_defect' | 'external_factors' | 'unknown'
  employeeLiable?: boolean
  liabilityAmount?: number
  notes?: string
}): Promise<AssetAssignment> => {
  const response = await api.post(`/hr/asset-assignments/${assignmentId}/repair`, data)
  return response.data
}

// Update repair status
export const updateRepairStatus = async (assignmentId: string, repairId: string, data: {
  repairStatus: 'reported' | 'assessed' | 'approved' | 'in_progress' | 'completed' | 'unrepairable'
  repairStartDate?: string
  repairCompletionDate?: string
  repairedBy?: string
  vendorName?: string
  totalRepairCost?: number
  assetFunctional?: boolean
  notes?: string
}): Promise<AssetAssignment> => {
  const response = await api.put(`/hr/asset-assignments/${assignmentId}/repair/${repairId}`, data)
  return response.data
}

// Get warranty expiring soon
export const getWarrantyExpiring = async (): Promise<Array<{
  assignmentId: string
  employeeName: string
  assetName: string
  assetType: AssetType
  warrantyEndDate: string
  daysUntilExpiry: number
}>> => {
  const response = await api.get('/hr/asset-assignments/warranty-expiring')
  return response.data
}

// Get asset policies
export const getAssetPolicies = async (): Promise<Array<{
  policyId: string
  policyName: string
  policyNameAr?: string
  policyType: string
  description?: string
  effectiveDate?: string
  document?: string
}>> => {
  const response = await api.get('/hr/asset-assignments/policies')
  return response.data
}
