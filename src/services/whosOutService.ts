import api from './api'

// ==================== TYPES & ENUMS ====================

// Absence Type
export type AbsenceType =
  | 'annual_leave'
  | 'sick_leave'
  | 'emergency_leave'
  | 'maternity_leave'
  | 'paternity_leave'
  | 'bereavement_leave'
  | 'marriage_leave'
  | 'hajj_leave'
  | 'unpaid_leave'
  | 'study_leave'
  | 'compensatory_leave'
  | 'public_holiday'
  | 'business_trip'
  | 'remote_work'
  | 'training'
  | 'conference'
  | 'medical_appointment'
  | 'personal_leave'

// Absence Status
export type AbsenceStatus =
  | 'pending'
  | 'approved'
  | 'rejected'
  | 'cancelled'
  | 'in_progress'
  | 'completed'

// Coverage Status
export type CoverageStatus = 'covered' | 'partial' | 'uncovered' | 'critical'

// Team View Mode
export type TeamViewMode = 'daily' | 'weekly' | 'monthly' | 'quarterly'

// ==================== LABELS ====================

export const ABSENCE_TYPE_LABELS: Record<
  AbsenceType,
  { ar: string; en: string; color: string; icon: string }
> = {
  annual_leave: { ar: 'إجازة سنوية', en: 'Annual Leave', color: 'blue', icon: 'Palmtree' },
  sick_leave: { ar: 'إجازة مرضية', en: 'Sick Leave', color: 'red', icon: 'Thermometer' },
  emergency_leave: { ar: 'إجازة طارئة', en: 'Emergency Leave', color: 'orange', icon: 'AlertTriangle' },
  maternity_leave: { ar: 'إجازة أمومة', en: 'Maternity Leave', color: 'pink', icon: 'Baby' },
  paternity_leave: { ar: 'إجازة أبوة', en: 'Paternity Leave', color: 'cyan', icon: 'Baby' },
  bereavement_leave: { ar: 'إجازة عزاء', en: 'Bereavement Leave', color: 'gray', icon: 'Heart' },
  marriage_leave: { ar: 'إجازة زواج', en: 'Marriage Leave', color: 'purple', icon: 'Rings' },
  hajj_leave: { ar: 'إجازة حج', en: 'Hajj Leave', color: 'green', icon: 'Kaaba' },
  unpaid_leave: { ar: 'إجازة بدون راتب', en: 'Unpaid Leave', color: 'yellow', icon: 'DollarSign' },
  study_leave: { ar: 'إجازة دراسية', en: 'Study Leave', color: 'indigo', icon: 'GraduationCap' },
  compensatory_leave: { ar: 'إجازة تعويضية', en: 'Compensatory Leave', color: 'teal', icon: 'Clock' },
  public_holiday: { ar: 'عطلة رسمية', en: 'Public Holiday', color: 'emerald', icon: 'Flag' },
  business_trip: { ar: 'رحلة عمل', en: 'Business Trip', color: 'slate', icon: 'Plane' },
  remote_work: { ar: 'عمل عن بعد', en: 'Remote Work', color: 'sky', icon: 'Home' },
  training: { ar: 'تدريب', en: 'Training', color: 'amber', icon: 'BookOpen' },
  conference: { ar: 'مؤتمر', en: 'Conference', color: 'violet', icon: 'Users' },
  medical_appointment: { ar: 'موعد طبي', en: 'Medical Appointment', color: 'rose', icon: 'Stethoscope' },
  personal_leave: { ar: 'إجازة شخصية', en: 'Personal Leave', color: 'lime', icon: 'User' },
}

export const ABSENCE_STATUS_LABELS: Record<AbsenceStatus, { ar: string; en: string; color: string }> = {
  pending: { ar: 'قيد الانتظار', en: 'Pending', color: 'yellow' },
  approved: { ar: 'موافق عليها', en: 'Approved', color: 'green' },
  rejected: { ar: 'مرفوضة', en: 'Rejected', color: 'red' },
  cancelled: { ar: 'ملغاة', en: 'Cancelled', color: 'gray' },
  in_progress: { ar: 'جارية', en: 'In Progress', color: 'blue' },
  completed: { ar: 'مكتملة', en: 'Completed', color: 'teal' },
}

export const COVERAGE_STATUS_LABELS: Record<CoverageStatus, { ar: string; en: string; color: string }> = {
  covered: { ar: 'مغطى', en: 'Covered', color: 'green' },
  partial: { ar: 'مغطى جزئياً', en: 'Partially Covered', color: 'yellow' },
  uncovered: { ar: 'غير مغطى', en: 'Uncovered', color: 'orange' },
  critical: { ar: 'حرج', en: 'Critical', color: 'red' },
}

// ==================== INTERFACES ====================

// Absence Entry
export interface AbsenceEntry {
  _id: string
  employeeId: string
  employeeName: string
  employeeNameAr?: string
  employeeNumber: string
  employeePhoto?: string
  departmentId: string
  departmentName: string
  departmentNameAr?: string
  positionTitle: string
  positionTitleAr?: string

  // Absence Details
  absenceType: AbsenceType
  startDate: string
  endDate: string
  duration: number // in days
  isHalfDay?: boolean
  halfDayPeriod?: 'morning' | 'afternoon'
  isHourly?: boolean
  hours?: number

  // Status
  status: AbsenceStatus
  reason?: string
  reasonAr?: string
  medicalCertificate?: string
  attachments?: string[]

  // Coverage
  coveringEmployeeId?: string
  coveringEmployeeName?: string
  coveringEmployeeNameAr?: string
  coverageNotes?: string

  // Approval
  approvedBy?: string
  approvedByName?: string
  approvalDate?: string
  rejectionReason?: string

  // Audit
  requestedAt: string
  createdAt: string
  updatedAt?: string
}

// Daily Absence Summary
export interface DailyAbsenceSummary {
  date: string
  dayName: string
  dayNameAr: string
  isWeekend: boolean
  isPublicHoliday: boolean
  holidayName?: string
  holidayNameAr?: string

  // Counts
  totalAbsent: number
  onLeave: number
  onSickLeave: number
  onBusinessTrip: number
  workingRemotely: number
  inTraining: number

  // Coverage
  coverageStatus: CoverageStatus
  coveragePercentage: number
  uncoveredPositions: number
}

// Employee Absence Calendar
export interface EmployeeAbsenceCalendar {
  employeeId: string
  employeeName: string
  employeeNameAr?: string
  employeeNumber: string
  departmentId: string
  departmentName: string
  departmentNameAr?: string

  // Leave Balance
  annualLeaveBalance: number
  annualLeaveUsed: number
  annualLeaveRemaining: number
  sickLeaveUsed: number
  otherLeaveUsed: number

  // Absences by Month
  absencesByMonth: Record<
    string,
    {
      month: string
      year: number
      entries: AbsenceEntry[]
      totalDays: number
    }
  >
}

// Department Coverage
export interface DepartmentCoverage {
  departmentId: string
  departmentName: string
  departmentNameAr?: string
  managerId?: string
  managerName?: string
  managerNameAr?: string

  // Headcount
  totalEmployees: number
  presentToday: number
  absentToday: number
  workingRemotely: number
  onBusinessTrip: number

  // Coverage Analysis
  coverageStatus: CoverageStatus
  coveragePercentage: number
  criticalRolesAbsent: number
  criticalRolesCovered: number

  // Upcoming
  upcomingAbsences: AbsenceEntry[]
  peakAbsenceDates: Array<{
    date: string
    absentCount: number
    coverageStatus: CoverageStatus
  }>
}

// Team Calendar View
export interface TeamCalendarView {
  startDate: string
  endDate: string
  viewMode: TeamViewMode
  departmentId?: string

  // Days
  days: Array<{
    date: string
    dayOfWeek: number
    isWeekend: boolean
    isHoliday: boolean
    holidayName?: string
    holidayNameAr?: string
  }>

  // Members
  members: Array<{
    employeeId: string
    employeeName: string
    employeeNameAr?: string
    employeePhoto?: string
    positionTitle: string
    positionTitleAr?: string
    isCriticalRole: boolean
    absences: Array<{
      date: string
      absenceType: AbsenceType
      status: AbsenceStatus
      isHalfDay?: boolean
    }>
  }>
}

// Who's Out Today
export interface WhosOutToday {
  date: string

  // Summary
  summary: {
    totalWorkforce: number
    totalPresent: number
    totalAbsent: number
    onLeave: number
    onSickLeave: number
    onBusinessTrip: number
    workingRemotely: number
    inTraining: number
    coveragePercentage: number
  }

  // By Department
  byDepartment: Array<{
    departmentId: string
    departmentName: string
    departmentNameAr?: string
    totalEmployees: number
    present: number
    absent: number
    coverageStatus: CoverageStatus
  }>

  // Absent Employees
  absentEmployees: AbsenceEntry[]

  // Remote Workers
  remoteWorkers: Array<{
    employeeId: string
    employeeName: string
    employeeNameAr?: string
    employeePhoto?: string
    departmentName: string
    departmentNameAr?: string
    workLocation?: string
  }>

  // On Business Trip
  onBusinessTrip: Array<{
    employeeId: string
    employeeName: string
    employeeNameAr?: string
    employeePhoto?: string
    departmentName: string
    departmentNameAr?: string
    destination?: string
    returnDate?: string
  }>
}

// Upcoming Absences
export interface UpcomingAbsence {
  _id: string
  employeeId: string
  employeeName: string
  employeeNameAr?: string
  employeePhoto?: string
  departmentName: string
  departmentNameAr?: string
  absenceType: AbsenceType
  startDate: string
  endDate: string
  duration: number
  status: AbsenceStatus
  daysUntilStart: number
  coveringEmployee?: {
    employeeId: string
    employeeName: string
    employeeNameAr?: string
  }
}

// Public Holiday
export interface PublicHoliday {
  _id: string
  name: string
  nameAr: string
  date: string
  endDate?: string
  duration: number
  type: 'national' | 'religious' | 'company'
  isRecurring: boolean
  description?: string
  descriptionAr?: string
  year: number
  createdAt: string
  updatedAt?: string
}

// Absence Statistics
export interface AbsenceStatistics {
  period: {
    startDate: string
    endDate: string
  }

  // Overall
  totalAbsenceDays: number
  averageAbsencePerEmployee: number
  absenceRate: number // percentage

  // By Type
  byType: Record<AbsenceType, { count: number; days: number; percentage: number }>

  // By Department
  byDepartment: Array<{
    departmentId: string
    departmentName: string
    departmentNameAr?: string
    totalDays: number
    averagePerEmployee: number
    absenceRate: number
  }>

  // By Month
  byMonth: Array<{
    month: string
    year: number
    totalDays: number
    absenceRate: number
    peakDay?: string
    peakDayAbsences?: number
  }>

  // Trends
  trends: {
    comparedToPreviousPeriod: number // percentage change
    sickLeaveIncrease: number
    mostCommonAbsenceType: AbsenceType
    peakAbsenceDay: string
    averageDuration: number
  }
}

// Who's Out Filters
export interface WhosOutFilters {
  startDate?: string
  endDate?: string
  departmentId?: string
  absenceType?: AbsenceType
  status?: AbsenceStatus
  employeeId?: string
  includeRemote?: boolean
  includePending?: boolean
  page?: number
  limit?: number
}

// ==================== API FUNCTIONS ====================

/**
 * Get who's out today
 * GET /hr/whos-out/today
 */
export const getWhosOutToday = async (departmentId?: string): Promise<WhosOutToday> => {
  const params = departmentId ? `?departmentId=${departmentId}` : ''
  const response = await api.get(`/hr/whos-out/today${params}`)
  return response.data
}

/**
 * Get who's out for a specific date
 * GET /hr/whos-out/:date
 */
export const getWhosOutByDate = async (date: string, departmentId?: string): Promise<WhosOutToday> => {
  const params = departmentId ? `?departmentId=${departmentId}` : ''
  const response = await api.get(`/hr/whos-out/${date}${params}`)
  return response.data
}

/**
 * Get daily absence summary for a date range
 * GET /hr/whos-out/summary
 */
export const getAbsenceSummary = async (
  startDate: string,
  endDate: string,
  departmentId?: string
): Promise<DailyAbsenceSummary[]> => {
  const params = new URLSearchParams()
  params.append('startDate', startDate)
  params.append('endDate', endDate)
  if (departmentId) params.append('departmentId', departmentId)

  const response = await api.get(`/hr/whos-out/summary?${params.toString()}`)
  return response.data
}

/**
 * Get team calendar view
 * GET /hr/whos-out/calendar
 */
export const getTeamCalendar = async (
  startDate: string,
  endDate: string,
  viewMode: TeamViewMode = 'monthly',
  departmentId?: string
): Promise<TeamCalendarView> => {
  const params = new URLSearchParams()
  params.append('startDate', startDate)
  params.append('endDate', endDate)
  params.append('viewMode', viewMode)
  if (departmentId) params.append('departmentId', departmentId)

  const response = await api.get(`/hr/whos-out/calendar?${params.toString()}`)
  return response.data
}

/**
 * Get department coverage
 * GET /hr/whos-out/coverage/:departmentId
 */
export const getDepartmentCoverage = async (
  departmentId: string,
  date?: string
): Promise<DepartmentCoverage> => {
  const params = date ? `?date=${date}` : ''
  const response = await api.get(`/hr/whos-out/coverage/${departmentId}${params}`)
  return response.data
}

/**
 * Get all departments coverage
 * GET /hr/whos-out/coverage
 */
export const getAllDepartmentsCoverage = async (date?: string): Promise<DepartmentCoverage[]> => {
  const params = date ? `?date=${date}` : ''
  const response = await api.get(`/hr/whos-out/coverage${params}`)
  return response.data
}

/**
 * Get upcoming absences
 * GET /hr/whos-out/upcoming
 */
export const getUpcomingAbsences = async (
  days: number = 30,
  departmentId?: string
): Promise<UpcomingAbsence[]> => {
  const params = new URLSearchParams()
  params.append('days', days.toString())
  if (departmentId) params.append('departmentId', departmentId)

  const response = await api.get(`/hr/whos-out/upcoming?${params.toString()}`)
  return response.data
}

/**
 * Get employee absence calendar
 * GET /hr/whos-out/employee/:employeeId
 */
export const getEmployeeAbsenceCalendar = async (
  employeeId: string,
  year?: number
): Promise<EmployeeAbsenceCalendar> => {
  const params = year ? `?year=${year}` : ''
  const response = await api.get(`/hr/whos-out/employee/${employeeId}${params}`)
  return response.data
}

/**
 * Get absence entries with filters
 * GET /hr/whos-out/absences
 */
export const getAbsenceEntries = async (
  filters?: WhosOutFilters
): Promise<{ data: AbsenceEntry[]; pagination: { total: number; page: number; limit: number; pages: number } }> => {
  const params = new URLSearchParams()
  if (filters?.startDate) params.append('startDate', filters.startDate)
  if (filters?.endDate) params.append('endDate', filters.endDate)
  if (filters?.departmentId) params.append('departmentId', filters.departmentId)
  if (filters?.absenceType) params.append('absenceType', filters.absenceType)
  if (filters?.status) params.append('status', filters.status)
  if (filters?.employeeId) params.append('employeeId', filters.employeeId)
  if (filters?.includeRemote !== undefined) params.append('includeRemote', filters.includeRemote.toString())
  if (filters?.includePending !== undefined) params.append('includePending', filters.includePending.toString())
  if (filters?.page) params.append('page', filters.page.toString())
  if (filters?.limit) params.append('limit', filters.limit.toString())

  const response = await api.get(`/hr/whos-out/absences?${params.toString()}`)
  return response.data
}

/**
 * Get public holidays
 * GET /hr/whos-out/holidays
 */
export const getPublicHolidays = async (year?: number): Promise<PublicHoliday[]> => {
  const params = year ? `?year=${year}` : ''
  const response = await api.get(`/hr/whos-out/holidays${params}`)
  return response.data
}

/**
 * Create public holiday
 * POST /hr/whos-out/holidays
 */
export const createPublicHoliday = async (data: {
  name: string
  nameAr: string
  date: string
  endDate?: string
  type: 'national' | 'religious' | 'company'
  isRecurring?: boolean
  description?: string
  descriptionAr?: string
}): Promise<PublicHoliday> => {
  const response = await api.post('/hr/whos-out/holidays', data)
  return response.data
}

/**
 * Update public holiday
 * PATCH /hr/whos-out/holidays/:id
 */
export const updatePublicHoliday = async (
  holidayId: string,
  data: Partial<{
    name: string
    nameAr: string
    date: string
    endDate?: string
    type: 'national' | 'religious' | 'company'
    isRecurring?: boolean
    description?: string
    descriptionAr?: string
  }>
): Promise<PublicHoliday> => {
  const response = await api.patch(`/hr/whos-out/holidays/${holidayId}`, data)
  return response.data
}

/**
 * Delete public holiday
 * DELETE /hr/whos-out/holidays/:id
 */
export const deletePublicHoliday = async (holidayId: string): Promise<void> => {
  await api.delete(`/hr/whos-out/holidays/${holidayId}`)
}

/**
 * Get absence statistics
 * GET /hr/whos-out/statistics
 */
export const getAbsenceStatistics = async (
  startDate: string,
  endDate: string,
  departmentId?: string
): Promise<AbsenceStatistics> => {
  const params = new URLSearchParams()
  params.append('startDate', startDate)
  params.append('endDate', endDate)
  if (departmentId) params.append('departmentId', departmentId)

  const response = await api.get(`/hr/whos-out/statistics?${params.toString()}`)
  return response.data
}

/**
 * Check coverage conflicts
 * POST /hr/whos-out/check-conflicts
 */
export const checkCoverageConflicts = async (data: {
  employeeId: string
  startDate: string
  endDate: string
  departmentId?: string
}): Promise<{
  hasConflicts: boolean
  conflicts: Array<{
    type: 'overlap' | 'critical_role' | 'team_capacity' | 'coverage_gap'
    message: string
    messageAr: string
    severity: 'warning' | 'error'
    affectedDates: string[]
    affectedEmployees?: string[]
  }>
  suggestions: Array<{
    suggestion: string
    suggestionAr: string
    alternativeDates?: { startDate: string; endDate: string }
    coveringEmployee?: { employeeId: string; employeeName: string }
  }>
}> => {
  const response = await api.post('/hr/whos-out/check-conflicts', data)
  return response.data
}

/**
 * Suggest covering employees
 * POST /hr/whos-out/suggest-coverage
 */
export const suggestCoveringEmployees = async (data: {
  employeeId: string
  startDate: string
  endDate: string
}): Promise<
  Array<{
    employeeId: string
    employeeName: string
    employeeNameAr?: string
    employeePhoto?: string
    positionTitle: string
    positionTitleAr?: string
    departmentName: string
    departmentNameAr?: string
    matchScore: number // 0-100
    matchReasons: string[]
    availability: 'available' | 'partial' | 'limited'
    conflictingDays?: string[]
  }>
> => {
  const response = await api.post('/hr/whos-out/suggest-coverage', data)
  return response.data
}

/**
 * Get critical roles status
 * GET /hr/whos-out/critical-roles
 */
export const getCriticalRolesStatus = async (
  date?: string,
  departmentId?: string
): Promise<
  Array<{
    roleId: string
    roleTitle: string
    roleTitleAr?: string
    departmentName: string
    departmentNameAr?: string
    primaryHolder: {
      employeeId: string
      employeeName: string
      employeeNameAr?: string
      status: 'present' | 'absent' | 'remote'
      absenceType?: AbsenceType
      returnDate?: string
    }
    backups: Array<{
      employeeId: string
      employeeName: string
      employeeNameAr?: string
      status: 'present' | 'absent' | 'remote'
      priority: number
    }>
    coverageStatus: CoverageStatus
    riskLevel: 'low' | 'medium' | 'high' | 'critical'
  }>
> => {
  const params = new URLSearchParams()
  if (date) params.append('date', date)
  if (departmentId) params.append('departmentId', departmentId)

  const response = await api.get(`/hr/whos-out/critical-roles?${params.toString()}`)
  return response.data
}

/**
 * Export absence data
 * GET /hr/whos-out/export
 */
export const exportAbsenceData = async (
  startDate: string,
  endDate: string,
  format: 'xlsx' | 'pdf' | 'csv' = 'xlsx',
  departmentId?: string
): Promise<Blob> => {
  const params = new URLSearchParams()
  params.append('startDate', startDate)
  params.append('endDate', endDate)
  params.append('format', format)
  if (departmentId) params.append('departmentId', departmentId)

  const response = await api.get(`/hr/whos-out/export?${params.toString()}`, {
    responseType: 'blob',
  })
  return response.data
}

/**
 * Subscribe to absence notifications
 * POST /hr/whos-out/subscribe
 */
export const subscribeToAbsenceNotifications = async (data: {
  departmentIds?: string[]
  employeeIds?: string[]
  notifyOnCriticalCoverage?: boolean
  notifyOnTeamAbsence?: boolean
  notifyDaysBefore?: number
  channels?: Array<'email' | 'push' | 'sms'>
}): Promise<{ subscriptionId: string; message: string }> => {
  const response = await api.post('/hr/whos-out/subscribe', data)
  return response.data
}

/**
 * Unsubscribe from absence notifications
 * DELETE /hr/whos-out/subscribe/:subscriptionId
 */
export const unsubscribeFromAbsenceNotifications = async (subscriptionId: string): Promise<void> => {
  await api.delete(`/hr/whos-out/subscribe/${subscriptionId}`)
}

/**
 * Get my subscriptions
 * GET /hr/whos-out/subscriptions
 */
export const getMyAbsenceSubscriptions = async (): Promise<
  Array<{
    subscriptionId: string
    departmentIds?: string[]
    employeeIds?: string[]
    notifyOnCriticalCoverage: boolean
    notifyOnTeamAbsence: boolean
    notifyDaysBefore: number
    channels: Array<'email' | 'push' | 'sms'>
    createdAt: string
  }>
> => {
  const response = await api.get('/hr/whos-out/subscriptions')
  return response.data
}

// ==================== DEFAULT EXPORT ====================

const whosOutService = {
  // Today & Date Views
  getWhosOutToday,
  getWhosOutByDate,
  getAbsenceSummary,

  // Calendar
  getTeamCalendar,
  getEmployeeAbsenceCalendar,

  // Coverage
  getDepartmentCoverage,
  getAllDepartmentsCoverage,
  getCriticalRolesStatus,
  checkCoverageConflicts,
  suggestCoveringEmployees,

  // Absences
  getAbsenceEntries,
  getUpcomingAbsences,

  // Holidays
  getPublicHolidays,
  createPublicHoliday,
  updatePublicHoliday,
  deletePublicHoliday,

  // Statistics
  getAbsenceStatistics,

  // Export
  exportAbsenceData,

  // Subscriptions
  subscribeToAbsenceNotifications,
  unsubscribeFromAbsenceNotifications,
  getMyAbsenceSubscriptions,

  // Constants
  ABSENCE_TYPE_LABELS,
  ABSENCE_STATUS_LABELS,
  COVERAGE_STATUS_LABELS,
}

export default whosOutService
