import api from './api'

// ==================== TYPES & ENUMS ====================

// Unit Type
export type UnitType = 'company' | 'division' | 'department' | 'section' | 'unit' |
  'team' | 'branch' | 'region' | 'subsidiary' | 'committee' | 'project_team' | 'other'

// Unit Status
export type UnitStatus = 'active' | 'inactive' | 'restructuring' | 'merged' | 'dissolved' | 'planned'

// Cost Center Type
export type CostCenterType = 'revenue_generating' | 'cost_center' | 'profit_center' |
  'investment_center' | 'shared_services' | 'support'

// Approval Authority Level
export type ApprovalAuthorityLevel = 'unlimited' | 'high' | 'medium' | 'low' | 'none'

// ==================== LABELS ====================

export const UNIT_TYPE_LABELS: Record<UnitType, { ar: string; en: string; color: string; icon: string }> = {
  company: { ar: 'شركة', en: 'Company', color: 'emerald', icon: 'Building2' },
  division: { ar: 'قطاع', en: 'Division', color: 'blue', icon: 'Network' },
  department: { ar: 'إدارة', en: 'Department', color: 'purple', icon: 'Building' },
  section: { ar: 'قسم', en: 'Section', color: 'indigo', icon: 'LayoutGrid' },
  unit: { ar: 'وحدة', en: 'Unit', color: 'cyan', icon: 'BoxSelect' },
  team: { ar: 'فريق', en: 'Team', color: 'teal', icon: 'Users' },
  branch: { ar: 'فرع', en: 'Branch', color: 'amber', icon: 'MapPin' },
  region: { ar: 'منطقة', en: 'Region', color: 'orange', icon: 'Globe' },
  subsidiary: { ar: 'شركة تابعة', en: 'Subsidiary', color: 'rose', icon: 'GitBranch' },
  committee: { ar: 'لجنة', en: 'Committee', color: 'violet', icon: 'Users2' },
  project_team: { ar: 'فريق مشروع', en: 'Project Team', color: 'sky', icon: 'FolderKanban' },
  other: { ar: 'أخرى', en: 'Other', color: 'gray', icon: 'MoreHorizontal' },
}

export const UNIT_STATUS_LABELS: Record<UnitStatus, { ar: string; en: string; color: string }> = {
  active: { ar: 'نشط', en: 'Active', color: 'emerald' },
  inactive: { ar: 'غير نشط', en: 'Inactive', color: 'gray' },
  restructuring: { ar: 'إعادة هيكلة', en: 'Restructuring', color: 'amber' },
  merged: { ar: 'مدمج', en: 'Merged', color: 'blue' },
  dissolved: { ar: 'منحل', en: 'Dissolved', color: 'red' },
  planned: { ar: 'مخطط', en: 'Planned', color: 'purple' },
}

export const COST_CENTER_TYPE_LABELS: Record<CostCenterType, { ar: string; en: string; color: string }> = {
  revenue_generating: { ar: 'مولد للإيرادات', en: 'Revenue Generating', color: 'emerald' },
  cost_center: { ar: 'مركز تكلفة', en: 'Cost Center', color: 'blue' },
  profit_center: { ar: 'مركز ربح', en: 'Profit Center', color: 'green' },
  investment_center: { ar: 'مركز استثمار', en: 'Investment Center', color: 'purple' },
  shared_services: { ar: 'خدمات مشتركة', en: 'Shared Services', color: 'cyan' },
  support: { ar: 'دعم', en: 'Support', color: 'gray' },
}

export const APPROVAL_AUTHORITY_LABELS: Record<ApprovalAuthorityLevel, { ar: string; en: string; color: string }> = {
  unlimited: { ar: 'غير محدود', en: 'Unlimited', color: 'emerald' },
  high: { ar: 'عالي', en: 'High', color: 'blue' },
  medium: { ar: 'متوسط', en: 'Medium', color: 'amber' },
  low: { ar: 'منخفض', en: 'Low', color: 'gray' },
  none: { ar: 'لا يوجد', en: 'None', color: 'slate' },
}

// ==================== INTERFACES ====================

// Leadership Position
export interface LeadershipPosition {
  positionId?: string
  positionTitle: string
  positionTitleAr?: string
  positionType: 'manager' | 'director' | 'head' | 'supervisor' | 'lead' | 'coordinator' | 'acting'
  employeeId?: string
  employeeName?: string
  employeeNameAr?: string
  isPrimary: boolean
  startDate?: string
  endDate?: string
  actingFor?: string
  reportingTo?: string
}

// Headcount Info
export interface HeadcountInfo {
  approvedHeadcount: number
  currentHeadcount: number
  vacancies: number
  vacancyRate?: number
  fullTimeEmployees: number
  partTimeEmployees: number
  contractors: number
  temporaryWorkers: number
  interns: number
  saudiCount?: number
  nonSaudiCount?: number
  saudizationRate?: number
  maleCount?: number
  femaleCount?: number
  genderRatio?: number
}

// Budget Info
export interface BudgetInfo {
  annualBudget?: number
  currentYearBudget?: number
  budgetUtilization?: number
  salaryBudget?: number
  operationalBudget?: number
  capitalBudget?: number
  trainingBudget?: number
  currency: string
  fiscalYear?: string
  budgetApprovalDate?: string
  budgetApprovedBy?: string
}

// Cost Center Info
export interface CostCenterInfo {
  costCenterId?: string
  costCenterCode: string
  costCenterName?: string
  costCenterNameAr?: string
  costCenterType: CostCenterType
  profitCenter?: string
  businessUnit?: string
}

// KPI Target
export interface KPITarget {
  kpiId: string
  kpiName: string
  kpiNameAr?: string
  targetValue: number
  actualValue?: number
  unit: string
  period: 'monthly' | 'quarterly' | 'yearly'
  status?: 'on_track' | 'at_risk' | 'behind' | 'achieved'
}

// Compliance Info
export interface ComplianceInfo {
  laborLawCompliant: boolean
  saudizationCompliant: boolean
  healthSafetyCompliant: boolean
  lastAuditDate?: string
  nextAuditDate?: string
  auditFindings?: string
  complianceScore?: number
  certifications?: string[]
  regulatoryRequirements?: string[]
}

// Approval Authority
export interface ApprovalAuthority {
  financialApproval: ApprovalAuthorityLevel
  financialLimit?: number
  hiringApproval: boolean
  terminationApproval: boolean
  leaveApproval: boolean
  procurementApproval: boolean
  procurementLimit?: number
  contractApproval: boolean
  contractLimit?: number
  travelApproval: boolean
  overtimeApproval: boolean
}

// Child Unit Summary
export interface ChildUnitSummary {
  unitId: string
  unitCode: string
  unitName: string
  unitNameAr?: string
  unitType: UnitType
  status: UnitStatus
  headcount: number
  manager?: string
}

// Organizational Unit
export interface OrganizationalUnit {
  _id: string
  unitId: string
  unitCode: string
  unitName: string
  unitNameAr?: string
  unitType: UnitType
  status: UnitStatus

  // Hierarchy
  parentUnitId?: string
  parentUnitCode?: string
  parentUnitName?: string
  level: number
  path?: string
  childUnits?: ChildUnitSummary[]

  // Description
  description?: string
  descriptionAr?: string
  mission?: string
  missionAr?: string
  vision?: string
  visionAr?: string
  objectives?: string[]
  objectivesAr?: string[]
  functions?: string[]
  functionsAr?: string[]

  // Leadership
  leadership?: LeadershipPosition[]
  managerName?: string
  managerNameAr?: string
  managerId?: string

  // Headcount
  headcount?: HeadcountInfo

  // Budget & Cost
  budget?: BudgetInfo
  costCenter?: CostCenterInfo

  // KPIs
  kpis?: KPITarget[]

  // Location
  location?: string
  locationAr?: string
  address?: string
  city?: string
  country?: string
  region?: string
  workingHours?: string

  // Contact
  email?: string
  phone?: string
  extension?: string
  fax?: string

  // Compliance
  compliance?: ComplianceInfo

  // Approval Authority
  approvalAuthority?: ApprovalAuthority

  // Dates
  establishedDate?: string
  effectiveDate?: string
  endDate?: string

  // Notes
  notes?: string
  notesAr?: string
  internalNotes?: string

  // Audit
  createdOn: string
  createdBy: string
  updatedOn?: string
  updatedBy?: string
}

// Filters
export interface OrganizationalUnitFilters {
  search?: string
  unitType?: UnitType
  status?: UnitStatus
  parentUnitId?: string
  level?: number
  costCenterType?: CostCenterType
  fromDate?: string
  toDate?: string
  page?: number
  limit?: number
  sortBy?: string
  sortOrder?: 'asc' | 'desc'
}

// Stats
export interface OrganizationalStructureStats {
  totalUnits: number
  activeUnits: number
  inactiveUnits: number
  byType: Record<UnitType, number>
  byStatus: Record<UnitStatus, number>
  totalHeadcount: number
  totalApprovedHeadcount: number
  vacancyRate: number
  totalBudget: number
  budgetUtilization: number
  avgSaudizationRate: number
  avgHeadcountPerUnit: number
  maxLevel: number
}

// Create Unit Data
export interface CreateOrganizationalUnitData {
  unitCode: string
  unitName: string
  unitNameAr?: string
  unitType: UnitType

  parentUnitId?: string

  description?: string
  descriptionAr?: string
  mission?: string
  missionAr?: string
  vision?: string
  visionAr?: string
  objectives?: string[]
  functions?: string[]

  leadership?: Omit<LeadershipPosition, 'positionId'>[]
  managerId?: string
  managerName?: string
  managerNameAr?: string

  headcount?: Partial<HeadcountInfo>
  budget?: Partial<BudgetInfo>
  costCenter?: Partial<CostCenterInfo>

  location?: string
  locationAr?: string
  address?: string
  city?: string
  country?: string
  region?: string
  workingHours?: string

  email?: string
  phone?: string
  extension?: string

  compliance?: Partial<ComplianceInfo>
  approvalAuthority?: Partial<ApprovalAuthority>

  establishedDate?: string
  effectiveDate?: string

  notes?: string
  notesAr?: string
}

// Update Unit Data
export interface UpdateOrganizationalUnitData extends Partial<CreateOrganizationalUnitData> {
  status?: UnitStatus
  endDate?: string
  internalNotes?: string
  kpis?: Omit<KPITarget, 'kpiId'>[]
}

// Hierarchy Tree Node
export interface HierarchyTreeNode {
  unitId: string
  unitCode: string
  unitName: string
  unitNameAr?: string
  unitType: UnitType
  status: UnitStatus
  level: number
  headcount: number
  managerName?: string
  children: HierarchyTreeNode[]
}

// ==================== API FUNCTIONS ====================

// Get all units
export const getOrganizationalUnits = async (filters?: OrganizationalUnitFilters) => {
  const response = await api.get<{ data: OrganizationalUnit[]; total: number; page: number; totalPages: number }>('/hr/organizational-structure', { params: filters })
  return response.data
}

// Get single unit
export const getOrganizationalUnit = async (unitId: string) => {
  const response = await api.get<OrganizationalUnit>(`/hr/organizational-structure/${unitId}`)
  return response.data
}

// Get stats
export const getOrganizationalStructureStats = async () => {
  const response = await api.get<OrganizationalStructureStats>('/hr/organizational-structure/stats')
  return response.data
}

// Get hierarchy tree
export const getHierarchyTree = async (rootUnitId?: string) => {
  const response = await api.get<HierarchyTreeNode[]>('/hr/organizational-structure/tree', { params: { rootUnitId } })
  return response.data
}

// Get child units
export const getChildUnits = async (parentUnitId: string) => {
  const response = await api.get<OrganizationalUnit[]>(`/hr/organizational-structure/${parentUnitId}/children`)
  return response.data
}

// Get unit path (ancestors)
export const getUnitPath = async (unitId: string) => {
  const response = await api.get<OrganizationalUnit[]>(`/hr/organizational-structure/${unitId}/path`)
  return response.data
}

// Create unit
export const createOrganizationalUnit = async (data: CreateOrganizationalUnitData) => {
  const response = await api.post<OrganizationalUnit>('/hr/organizational-structure', data)
  return response.data
}

// Update unit
export const updateOrganizationalUnit = async (unitId: string, data: UpdateOrganizationalUnitData) => {
  const response = await api.patch<OrganizationalUnit>(`/hr/organizational-structure/${unitId}`, data)
  return response.data
}

// Delete unit
export const deleteOrganizationalUnit = async (unitId: string) => {
  const response = await api.delete(`/hr/organizational-structure/${unitId}`)
  return response.data
}

// Bulk delete units
export const bulkDeleteOrganizationalUnits = async (ids: string[]) => {
  const response = await api.post('/hr/organizational-structure/bulk-delete', { ids })
  return response.data
}

// Move unit (change parent)
export const moveOrganizationalUnit = async (unitId: string, data: { newParentId: string; reason?: string }) => {
  const response = await api.post<OrganizationalUnit>(`/hr/organizational-structure/${unitId}/move`, data)
  return response.data
}

// Merge units
export const mergeOrganizationalUnits = async (data: { sourceUnitIds: string[]; targetUnitId: string; reason?: string }) => {
  const response = await api.post<OrganizationalUnit>('/hr/organizational-structure/merge', data)
  return response.data
}

// Dissolve unit
export const dissolveOrganizationalUnit = async (unitId: string, data: { reason: string; effectiveDate?: string; reassignTo?: string }) => {
  const response = await api.post<OrganizationalUnit>(`/hr/organizational-structure/${unitId}/dissolve`, data)
  return response.data
}

// Activate unit
export const activateOrganizationalUnit = async (unitId: string) => {
  const response = await api.post<OrganizationalUnit>(`/hr/organizational-structure/${unitId}/activate`)
  return response.data
}

// Deactivate unit
export const deactivateOrganizationalUnit = async (unitId: string, data?: { reason?: string }) => {
  const response = await api.post<OrganizationalUnit>(`/hr/organizational-structure/${unitId}/deactivate`, data)
  return response.data
}

// Update headcount
export const updateHeadcount = async (unitId: string, data: Partial<HeadcountInfo>) => {
  const response = await api.patch<OrganizationalUnit>(`/hr/organizational-structure/${unitId}/headcount`, data)
  return response.data
}

// Update budget
export const updateBudget = async (unitId: string, data: Partial<BudgetInfo>) => {
  const response = await api.patch<OrganizationalUnit>(`/hr/organizational-structure/${unitId}/budget`, data)
  return response.data
}

// Add KPI
export const addKPI = async (unitId: string, data: Omit<KPITarget, 'kpiId'>) => {
  const response = await api.post<OrganizationalUnit>(`/hr/organizational-structure/${unitId}/kpis`, data)
  return response.data
}

// Update KPI
export const updateKPI = async (unitId: string, kpiId: string, data: Partial<KPITarget>) => {
  const response = await api.patch<OrganizationalUnit>(`/hr/organizational-structure/${unitId}/kpis/${kpiId}`, data)
  return response.data
}

// Add leadership position
export const addLeadershipPosition = async (unitId: string, data: Omit<LeadershipPosition, 'positionId'>) => {
  const response = await api.post<OrganizationalUnit>(`/hr/organizational-structure/${unitId}/leadership`, data)
  return response.data
}

// Remove leadership position
export const removeLeadershipPosition = async (unitId: string, positionId: string) => {
  const response = await api.delete<OrganizationalUnit>(`/hr/organizational-structure/${unitId}/leadership/${positionId}`)
  return response.data
}

// Export organizational structure
export const exportOrganizationalStructure = async (filters?: OrganizationalUnitFilters) => {
  const response = await api.get('/hr/organizational-structure/export', {
    params: filters,
    responseType: 'blob'
  })
  return response.data
}

export default {
  getOrganizationalUnits,
  getOrganizationalUnit,
  getOrganizationalStructureStats,
  getHierarchyTree,
  getChildUnits,
  getUnitPath,
  createOrganizationalUnit,
  updateOrganizationalUnit,
  deleteOrganizationalUnit,
  bulkDeleteOrganizationalUnits,
  moveOrganizationalUnit,
  mergeOrganizationalUnits,
  dissolveOrganizationalUnit,
  activateOrganizationalUnit,
  deactivateOrganizationalUnit,
  updateHeadcount,
  updateBudget,
  addKPI,
  updateKPI,
  addLeadershipPosition,
  removeLeadershipPosition,
  exportOrganizationalStructure,
}
