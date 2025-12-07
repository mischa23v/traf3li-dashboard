import api from './api'

// ==================== TYPES & ENUMS ====================

// Grievance Type
export type GrievanceType = 'compensation' | 'benefits' | 'working_conditions' | 'safety' |
  'harassment' | 'discrimination' | 'bullying' | 'retaliation' |
  'wrongful_termination' | 'disciplinary_action' | 'performance_evaluation' |
  'promotion' | 'transfer' | 'leave' | 'overtime' | 'contract_violation' |
  'unfair_treatment' | 'whistleblower' | 'other'

// Grievance Category
export type GrievanceCategory = 'individual' | 'collective' | 'policy_related' |
  'legal_violation' | 'ethical_violation'

// Grievance Status
export type GrievanceStatus = 'submitted' | 'under_review' | 'investigating' |
  'resolved' | 'escalated' | 'closed' | 'withdrawn'

// Grievance Priority
export type GrievancePriority = 'low' | 'medium' | 'high' | 'urgent'

// Grievance Severity
export type GrievanceSeverity = 'minor' | 'moderate' | 'serious' | 'critical'

// Resolution Method
export type ResolutionMethod = 'investigation_findings' | 'mediation_settlement' |
  'management_decision' | 'labor_office_decision' | 'court_judgment' |
  'withdrawal' | 'dismissal'

// Outcome Type
export type OutcomeType = 'grievance_upheld' | 'grievance_partially_upheld' |
  'grievance_denied' | 'settlement_reached' | 'withdrawn' | 'dismissed'

// ==================== LABELS ====================

export const GRIEVANCE_TYPE_LABELS: Record<GrievanceType, { ar: string; en: string; color: string; icon: string }> = {
  compensation: { ar: 'التعويضات', en: 'Compensation', color: 'amber', icon: 'Wallet' },
  benefits: { ar: 'المزايا', en: 'Benefits', color: 'blue', icon: 'Gift' },
  working_conditions: { ar: 'ظروف العمل', en: 'Working Conditions', color: 'slate', icon: 'Building' },
  safety: { ar: 'السلامة', en: 'Safety', color: 'orange', icon: 'Shield' },
  harassment: { ar: 'التحرش', en: 'Harassment', color: 'red', icon: 'AlertTriangle' },
  discrimination: { ar: 'التمييز', en: 'Discrimination', color: 'purple', icon: 'Ban' },
  bullying: { ar: 'التنمر', en: 'Bullying', color: 'rose', icon: 'UserX' },
  retaliation: { ar: 'الانتقام', en: 'Retaliation', color: 'red', icon: 'Angry' },
  wrongful_termination: { ar: 'إنهاء خدمة تعسفي', en: 'Wrongful Termination', color: 'red', icon: 'XCircle' },
  disciplinary_action: { ar: 'إجراء تأديبي', en: 'Disciplinary Action', color: 'yellow', icon: 'Gavel' },
  performance_evaluation: { ar: 'تقييم الأداء', en: 'Performance Evaluation', color: 'indigo', icon: 'Star' },
  promotion: { ar: 'الترقية', en: 'Promotion', color: 'emerald', icon: 'TrendingUp' },
  transfer: { ar: 'النقل', en: 'Transfer', color: 'cyan', icon: 'ArrowRightLeft' },
  leave: { ar: 'الإجازات', en: 'Leave', color: 'teal', icon: 'Calendar' },
  overtime: { ar: 'العمل الإضافي', en: 'Overtime', color: 'violet', icon: 'Clock' },
  contract_violation: { ar: 'مخالفة العقد', en: 'Contract Violation', color: 'red', icon: 'FileX' },
  unfair_treatment: { ar: 'معاملة غير عادلة', en: 'Unfair Treatment', color: 'gray', icon: 'Frown' },
  whistleblower: { ar: 'الإبلاغ عن المخالفات', en: 'Whistleblower', color: 'sky', icon: 'Megaphone' },
  other: { ar: 'أخرى', en: 'Other', color: 'gray', icon: 'MoreHorizontal' },
}

export const GRIEVANCE_CATEGORY_LABELS: Record<GrievanceCategory, { ar: string; en: string; color: string }> = {
  individual: { ar: 'فردية', en: 'Individual', color: 'blue' },
  collective: { ar: 'جماعية', en: 'Collective', color: 'purple' },
  policy_related: { ar: 'متعلقة بالسياسات', en: 'Policy Related', color: 'amber' },
  legal_violation: { ar: 'مخالفة قانونية', en: 'Legal Violation', color: 'red' },
  ethical_violation: { ar: 'مخالفة أخلاقية', en: 'Ethical Violation', color: 'rose' },
}

export const GRIEVANCE_STATUS_LABELS: Record<GrievanceStatus, { ar: string; en: string; color: string }> = {
  submitted: { ar: 'مقدمة', en: 'Submitted', color: 'slate' },
  under_review: { ar: 'قيد المراجعة', en: 'Under Review', color: 'blue' },
  investigating: { ar: 'قيد التحقيق', en: 'Investigating', color: 'amber' },
  resolved: { ar: 'تم الحل', en: 'Resolved', color: 'emerald' },
  escalated: { ar: 'تم التصعيد', en: 'Escalated', color: 'red' },
  closed: { ar: 'مغلقة', en: 'Closed', color: 'gray' },
  withdrawn: { ar: 'منسحبة', en: 'Withdrawn', color: 'purple' },
}

export const GRIEVANCE_PRIORITY_LABELS: Record<GrievancePriority, { ar: string; en: string; color: string }> = {
  low: { ar: 'منخفضة', en: 'Low', color: 'slate' },
  medium: { ar: 'متوسطة', en: 'Medium', color: 'blue' },
  high: { ar: 'عالية', en: 'High', color: 'amber' },
  urgent: { ar: 'عاجلة', en: 'Urgent', color: 'red' },
}

export const GRIEVANCE_SEVERITY_LABELS: Record<GrievanceSeverity, { ar: string; en: string; color: string }> = {
  minor: { ar: 'بسيطة', en: 'Minor', color: 'slate' },
  moderate: { ar: 'متوسطة', en: 'Moderate', color: 'blue' },
  serious: { ar: 'خطيرة', en: 'Serious', color: 'amber' },
  critical: { ar: 'حرجة', en: 'Critical', color: 'red' },
}

export const RESOLUTION_METHOD_LABELS: Record<ResolutionMethod, { ar: string; en: string }> = {
  investigation_findings: { ar: 'نتائج التحقيق', en: 'Investigation Findings' },
  mediation_settlement: { ar: 'تسوية بالوساطة', en: 'Mediation Settlement' },
  management_decision: { ar: 'قرار الإدارة', en: 'Management Decision' },
  labor_office_decision: { ar: 'قرار مكتب العمل', en: 'Labor Office Decision' },
  court_judgment: { ar: 'حكم المحكمة', en: 'Court Judgment' },
  withdrawal: { ar: 'انسحاب', en: 'Withdrawal' },
  dismissal: { ar: 'رفض', en: 'Dismissal' },
}

export const OUTCOME_TYPE_LABELS: Record<OutcomeType, { ar: string; en: string; color: string }> = {
  grievance_upheld: { ar: 'قبول الشكوى', en: 'Grievance Upheld', color: 'emerald' },
  grievance_partially_upheld: { ar: 'قبول جزئي', en: 'Partially Upheld', color: 'amber' },
  grievance_denied: { ar: 'رفض الشكوى', en: 'Grievance Denied', color: 'red' },
  settlement_reached: { ar: 'تم التسوية', en: 'Settlement Reached', color: 'blue' },
  withdrawn: { ar: 'منسحبة', en: 'Withdrawn', color: 'gray' },
  dismissed: { ar: 'مرفوضة', en: 'Dismissed', color: 'slate' },
}

// ==================== INTERFACES ====================

// Witness
export interface Witness {
  witnessId?: string
  witnessName?: string
  witnessNameAr?: string
  witnessType: 'employee' | 'external' | 'anonymous'
  contactInfo?: string
  relationshipToIncident: string
  statementProvided: boolean
  statementDate?: string
  statementUrl?: string
  willingToTestify: boolean
  interviewed: boolean
  interviewDate?: string
  interviewNotes?: string
}

// Evidence
export interface Evidence {
  evidenceId: string
  evidenceType: 'document' | 'email' | 'message' | 'photo' | 'video' |
    'audio' | 'record' | 'testimony' | 'other'
  evidenceDescription: string
  evidenceUrl?: string
  dateObtained?: string
  verified: boolean
  verifiedBy?: string
  admissible: boolean
}

// Timeline Event
export interface TimelineEvent {
  eventId: string
  eventType: 'filed' | 'acknowledged' | 'assessed' | 'investigation_started' |
    'interview' | 'evidence_collected' | 'investigation_completed' |
    'mediation' | 'resolution' | 'appeal' | 'labor_office' | 'court' |
    'closure' | 'other'
  eventDate: string
  eventDescription: string
  eventDescriptionAr?: string
  performedBy?: string
  dueDate?: string
  onTime?: boolean
  documents?: string[]
  notes?: string
}

// Respondent
export interface Respondent {
  employeeId?: string
  employeeName?: string
  employeeNameAr?: string
  jobTitle?: string
  department?: string
  relationshipToComplainant: 'manager' | 'supervisor' | 'colleague' |
    'subordinate' | 'hr' | 'senior_management' | 'other'
}

// Investigation Info
export interface InvestigationInfo {
  investigationRequired: boolean
  investigationStartDate?: string
  investigationEndDate?: string
  investigationDuration?: number
  investigatorName?: string
  investigatorType?: 'internal_hr' | 'internal_legal' | 'external_investigator' |
    'external_law_firm' | 'labor_inspector' | 'committee'
  substantiated?: boolean
  findingsNarrative?: string
  findingsNarrativeAr?: string
  investigationCompleted: boolean
}

// Resolution Info
export interface ResolutionInfo {
  resolved: boolean
  resolutionDate?: string
  resolutionMethod?: ResolutionMethod
  decisionMaker?: string
  decisionDate?: string
  decisionSummary?: string
  decisionSummaryAr?: string
  outcome?: OutcomeType
  actionsTaken?: string[]
}

// Grievance
export interface Grievance {
  _id: string
  grievanceId: string
  grievanceNumber: string

  // Employee (complainant)
  employeeId: string
  employeeNumber: string
  employeeName: string
  employeeNameAr?: string
  department?: string
  departmentId?: string
  jobTitle?: string
  email?: string
  phone?: string

  // Grievance Details
  grievanceType: GrievanceType
  grievanceCategory?: GrievanceCategory
  grievanceSubject: string
  grievanceSubjectAr?: string
  grievanceDescription: string
  grievanceDescriptionAr?: string

  // Against whom
  respondent?: Respondent
  additionalRespondents?: Respondent[]
  againstDepartment?: string
  againstPolicy?: string

  // Dates
  filedDate: string
  incidentDate?: string

  // Status
  status: GrievanceStatus
  statusDate?: string
  statusReason?: string

  // Priority & Severity
  priority: GrievancePriority
  severity?: GrievanceSeverity

  // Confidentiality
  confidential: boolean
  anonymousComplaint?: boolean
  protectedDisclosure?: boolean

  // Evidence & Witnesses
  witnesses?: Witness[]
  evidence?: Evidence[]

  // Desired outcome
  desiredOutcome?: string
  desiredOutcomeAr?: string

  // Investigation
  investigation?: InvestigationInfo

  // Resolution
  resolution?: ResolutionInfo

  // Timeline
  timeline?: TimelineEvent[]

  // Notes
  notes?: {
    complainantNotes?: string
    hrNotes?: string
    investigatorNotes?: string
    internalNotes?: string
  }

  // Audit
  createdOn: string
  createdBy: string
  updatedOn?: string
  updatedBy?: string
}

// Filters
export interface GrievanceFilters {
  search?: string
  employeeId?: string
  grievanceType?: GrievanceType
  grievanceCategory?: GrievanceCategory
  status?: GrievanceStatus
  priority?: GrievancePriority
  fromDate?: string
  toDate?: string
  page?: number
  limit?: number
  sortBy?: string
  sortOrder?: 'asc' | 'desc'
}

// Stats
export interface GrievanceStats {
  totalGrievances: number
  activeGrievances: number
  resolvedGrievances: number
  pendingInvestigation: number
  escalatedCases: number
  averageResolutionDays: number
  byType: Record<GrievanceType, number>
  byStatus: Record<GrievanceStatus, number>
  byPriority: Record<GrievancePriority, number>
  resolutionRate: number
  upheldRate: number
}

// Create Grievance Data
export interface CreateGrievanceData {
  employeeId: string
  employeeName: string
  employeeNameAr?: string
  employeeNumber?: string
  department?: string
  jobTitle?: string
  email?: string
  phone?: string

  grievanceType: GrievanceType
  grievanceCategory?: GrievanceCategory
  grievanceSubject: string
  grievanceSubjectAr?: string
  grievanceDescription: string
  grievanceDescriptionAr?: string

  respondent?: Omit<Respondent, 'employeeId'>
  againstDepartment?: string
  againstPolicy?: string

  filedDate: string
  incidentDate?: string

  priority: GrievancePriority
  severity?: GrievanceSeverity

  confidential?: boolean
  anonymousComplaint?: boolean
  protectedDisclosure?: boolean

  desiredOutcome?: string
  desiredOutcomeAr?: string

  witnesses?: Omit<Witness, 'witnessId'>[]
  evidence?: Omit<Evidence, 'evidenceId'>[]

  notes?: {
    complainantNotes?: string
    hrNotes?: string
  }
}

// Update Grievance Data
export interface UpdateGrievanceData extends Partial<CreateGrievanceData> {
  status?: GrievanceStatus
  statusReason?: string
  investigation?: Partial<InvestigationInfo>
  resolution?: Partial<ResolutionInfo>
}

// ==================== API FUNCTIONS ====================

// Get all grievances
export const getGrievances = async (filters?: GrievanceFilters) => {
  const response = await api.get<{ data: Grievance[]; total: number; page: number; totalPages: number }>('/hr/grievances', { params: filters })
  return response.data
}

// Get single grievance
export const getGrievance = async (grievanceId: string) => {
  const response = await api.get<Grievance>(`/hr/grievances/${grievanceId}`)
  return response.data
}

// Get grievance stats
export const getGrievanceStats = async () => {
  const response = await api.get<GrievanceStats>('/hr/grievances/stats')
  return response.data
}

// Get employee grievances
export const getEmployeeGrievances = async (employeeId: string) => {
  const response = await api.get<Grievance[]>(`/hr/grievances/employee/${employeeId}`)
  return response.data
}

// Create grievance
export const createGrievance = async (data: CreateGrievanceData) => {
  const response = await api.post<Grievance>('/hr/grievances', data)
  return response.data
}

// Update grievance
export const updateGrievance = async (grievanceId: string, data: UpdateGrievanceData) => {
  const response = await api.patch<Grievance>(`/hr/grievances/${grievanceId}`, data)
  return response.data
}

// Delete grievance
export const deleteGrievance = async (grievanceId: string) => {
  const response = await api.delete(`/hr/grievances/${grievanceId}`)
  return response.data
}

// Bulk delete grievances
export const bulkDeleteGrievances = async (ids: string[]) => {
  const response = await api.post('/hr/grievances/bulk-delete', { ids })
  return response.data
}

// Start investigation
export const startInvestigation = async (grievanceId: string, data: { investigatorName: string; investigatorType: string }) => {
  const response = await api.post<Grievance>(`/hr/grievances/${grievanceId}/start-investigation`, data)
  return response.data
}

// Complete investigation
export const completeInvestigation = async (grievanceId: string, data: { substantiated: boolean; findingsNarrative: string }) => {
  const response = await api.post<Grievance>(`/hr/grievances/${grievanceId}/complete-investigation`, data)
  return response.data
}

// Resolve grievance
export const resolveGrievance = async (grievanceId: string, data: {
  resolutionMethod: ResolutionMethod
  outcome: OutcomeType
  decisionSummary: string
  actionsTaken?: string[]
}) => {
  const response = await api.post<Grievance>(`/hr/grievances/${grievanceId}/resolve`, data)
  return response.data
}

// Escalate grievance
export const escalateGrievance = async (grievanceId: string, data: { reason: string; escalateTo?: string }) => {
  const response = await api.post<Grievance>(`/hr/grievances/${grievanceId}/escalate`, data)
  return response.data
}

// Withdraw grievance
export const withdrawGrievance = async (grievanceId: string, data: { reason: string }) => {
  const response = await api.post<Grievance>(`/hr/grievances/${grievanceId}/withdraw`, data)
  return response.data
}

// Close grievance
export const closeGrievance = async (grievanceId: string, data?: { notes?: string }) => {
  const response = await api.post<Grievance>(`/hr/grievances/${grievanceId}/close`, data)
  return response.data
}

// Add timeline event
export const addTimelineEvent = async (grievanceId: string, data: Omit<TimelineEvent, 'eventId'>) => {
  const response = await api.post<Grievance>(`/hr/grievances/${grievanceId}/timeline`, data)
  return response.data
}

// Add witness
export const addWitness = async (grievanceId: string, data: Omit<Witness, 'witnessId'>) => {
  const response = await api.post<Grievance>(`/hr/grievances/${grievanceId}/witnesses`, data)
  return response.data
}

// Add evidence
export const addEvidence = async (grievanceId: string, data: Omit<Evidence, 'evidenceId'>) => {
  const response = await api.post<Grievance>(`/hr/grievances/${grievanceId}/evidence`, data)
  return response.data
}

// Export grievances
export const exportGrievances = async (filters?: GrievanceFilters) => {
  const response = await api.get('/hr/grievances/export', {
    params: filters,
    responseType: 'blob'
  })
  return response.data
}

export default {
  getGrievances,
  getGrievance,
  getGrievanceStats,
  getEmployeeGrievances,
  createGrievance,
  updateGrievance,
  deleteGrievance,
  bulkDeleteGrievances,
  startInvestigation,
  completeInvestigation,
  resolveGrievance,
  escalateGrievance,
  withdrawGrievance,
  closeGrievance,
  addTimelineEvent,
  addWitness,
  addEvidence,
  exportGrievances,
}
