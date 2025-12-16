import api from './api'

// ==================== TYPES & ENUMS ====================

// Break Type
export type BreakType = 'paid' | 'unpaid'

// Day of Week
export type DayOfWeek = 'sunday' | 'monday' | 'tuesday' | 'wednesday' | 'thursday' | 'friday' | 'saturday'

// ==================== LABELS ====================

export const BREAK_TYPE_LABELS: Record<BreakType, { ar: string; en: string }> = {
  paid: { ar: 'مدفوعة', en: 'Paid' },
  unpaid: { ar: 'غير مدفوعة', en: 'Unpaid' },
}

export const DAY_OF_WEEK_LABELS: Record<DayOfWeek, { ar: string; en: string }> = {
  sunday: { ar: 'الأحد', en: 'Sunday' },
  monday: { ar: 'الاثنين', en: 'Monday' },
  tuesday: { ar: 'الثلاثاء', en: 'Tuesday' },
  wednesday: { ar: 'الأربعاء', en: 'Wednesday' },
  thursday: { ar: 'الخميس', en: 'Thursday' },
  friday: { ar: 'الجمعة', en: 'Friday' },
  saturday: { ar: 'السبت', en: 'Saturday' },
}

// ==================== INTERFACES ====================

// Shift Type Interface
export interface ShiftType {
  _id: string
  shiftTypeId: string
  name: string
  nameAr: string

  // Timing
  startTime: string // "08:00"
  endTime: string // "17:00"

  // Auto attendance settings
  enableAutoAttendance: boolean
  processAttendanceAfter: number // minutes after shift end
  lastSyncOfCheckin?: string

  // Grace periods
  beginCheckInBeforeShiftStart: number // minutes
  allowCheckOutAfterShiftEnd: number // minutes
  lateEntryGracePeriod: number // minutes
  earlyExitGracePeriod: number // minutes

  // Working hours thresholds
  workingHoursThresholdForHalfDay: number // hours
  workingHoursThresholdForAbsent: number // hours

  // Break settings
  breakDuration: number // minutes
  breakType: BreakType
  breakStartTime?: string
  breakEndTime?: string

  // Overtime settings
  allowOvertime: boolean
  maxOvertimeHours: number
  overtimeMultiplier: number // e.g., 1.5

  // Ramadan settings (Saudi-specific)
  isRamadanShift: boolean
  ramadanStartTime?: string
  ramadanEndTime?: string

  // Applicability
  applicableDays: DayOfWeek[]

  isActive: boolean
  isDefault: boolean

  createdAt: string
  updatedAt: string
}

// Create Shift Type Data
export interface CreateShiftTypeData {
  name: string
  nameAr: string

  // Timing
  startTime: string
  endTime: string

  // Auto attendance settings
  enableAutoAttendance?: boolean
  processAttendanceAfter?: number

  // Grace periods
  beginCheckInBeforeShiftStart?: number
  allowCheckOutAfterShiftEnd?: number
  lateEntryGracePeriod?: number
  earlyExitGracePeriod?: number

  // Working hours thresholds
  workingHoursThresholdForHalfDay?: number
  workingHoursThresholdForAbsent?: number

  // Break settings
  breakDuration?: number
  breakType?: BreakType
  breakStartTime?: string
  breakEndTime?: string

  // Overtime settings
  allowOvertime?: boolean
  maxOvertimeHours?: number
  overtimeMultiplier?: number

  // Ramadan settings
  isRamadanShift?: boolean
  ramadanStartTime?: string
  ramadanEndTime?: string

  // Applicability
  applicableDays?: DayOfWeek[]

  isActive?: boolean
  isDefault?: boolean
}

// Update Shift Type Data
export interface UpdateShiftTypeData extends Partial<CreateShiftTypeData> {}

// Shift Type Filters
export interface ShiftTypeFilters {
  search?: string
  isActive?: boolean
  isDefault?: boolean
  isRamadanShift?: boolean
  applicableDay?: DayOfWeek
  page?: number
  limit?: number
  sortBy?: string
  sortOrder?: 'asc' | 'desc'
}

// Shift Type Stats
export interface ShiftTypeStats {
  totalShifts: number
  activeShifts: number
  inactiveShifts: number
  defaultShifts: number
  ramadanShifts: number
  shiftsWithAutoAttendance: number
  shiftsWithOvertime: number
  averageShiftDuration: number
  byDay: Record<DayOfWeek, number>
}

// Working Hours Calculation Result
export interface WorkingHoursCalculation {
  shiftTypeId: string
  shiftTypeName: string
  checkInTime: string
  checkOutTime: string
  scheduledStartTime: string
  scheduledEndTime: string
  scheduledHours: number
  actualHours: number
  regularHours: number
  overtimeHours: number
  breakDuration: number
  netWorkingHours: number
  isLate: boolean
  lateMinutes: number
  isEarlyDeparture: boolean
  earlyDepartureMinutes: number
  isWithinGracePeriod: boolean
  status: 'present' | 'late' | 'early_departure' | 'half_day' | 'absent'
  overtimeAllowed: boolean
  ramadanShift: boolean
}

// ==================== API FUNCTIONS ====================

// Get all shift types
export const getShiftTypes = async (filters?: ShiftTypeFilters) => {
  const response = await api.get<{ data: ShiftType[]; total: number; page: number; totalPages: number }>('/hr/shift-types', { params: filters })
  return response.data
}

// Get single shift type
export const getShiftType = async (shiftTypeId: string) => {
  const response = await api.get<ShiftType>(`/hr/shift-types/${shiftTypeId}`)
  return response.data
}

// Get stats
export const getShiftTypeStats = async () => {
  const response = await api.get<ShiftTypeStats>('/hr/shift-types/stats')
  return response.data
}

// Get default shift
export const getDefaultShift = async () => {
  const response = await api.get<ShiftType>('/hr/shift-types/default')
  return response.data
}

// Create shift type
export const createShiftType = async (data: CreateShiftTypeData) => {
  const response = await api.post<ShiftType>('/hr/shift-types', data)
  return response.data
}

// Update shift type
export const updateShiftType = async (shiftTypeId: string, data: UpdateShiftTypeData) => {
  const response = await api.patch<ShiftType>(`/hr/shift-types/${shiftTypeId}`, data)
  return response.data
}

// Delete shift type
export const deleteShiftType = async (shiftTypeId: string) => {
  const response = await api.delete(`/hr/shift-types/${shiftTypeId}`)
  return response.data
}

// Bulk delete shift types
export const bulkDeleteShiftTypes = async (ids: string[]) => {
  const response = await api.post('/hr/shift-types/bulk-delete', { ids })
  return response.data
}

// Set as default
export const setAsDefaultShift = async (shiftTypeId: string) => {
  const response = await api.post<ShiftType>(`/hr/shift-types/${shiftTypeId}/set-default`)
  return response.data
}

// Activate shift type
export const activateShiftType = async (shiftTypeId: string) => {
  const response = await api.post<ShiftType>(`/hr/shift-types/${shiftTypeId}/activate`)
  return response.data
}

// Deactivate shift type
export const deactivateShiftType = async (shiftTypeId: string) => {
  const response = await api.post<ShiftType>(`/hr/shift-types/${shiftTypeId}/deactivate`)
  return response.data
}

// Clone shift type
export const cloneShiftType = async (shiftTypeId: string, data?: { name?: string; nameAr?: string }) => {
  const response = await api.post<ShiftType>(`/hr/shift-types/${shiftTypeId}/clone`, data)
  return response.data
}

// Calculate working hours
export const calculateWorkingHours = async (
  shiftTypeId: string,
  checkIn: string,
  checkOut: string,
  date?: string
) => {
  const response = await api.post<WorkingHoursCalculation>(`/hr/shift-types/${shiftTypeId}/calculate-hours`, {
    checkIn,
    checkOut,
    date,
  })
  return response.data
}

// Get shifts by day
export const getShiftsByDay = async (day: DayOfWeek) => {
  const response = await api.get<ShiftType[]>(`/hr/shift-types/by-day/${day}`)
  return response.data
}

// Get active shifts
export const getActiveShifts = async () => {
  const response = await api.get<ShiftType[]>('/hr/shift-types/active')
  return response.data
}

// Get Ramadan shifts
export const getRamadanShifts = async () => {
  const response = await api.get<ShiftType[]>('/hr/shift-types/ramadan')
  return response.data
}

// Export shift types
export const exportShiftTypes = async (filters?: ShiftTypeFilters) => {
  const response = await api.get('/hr/shift-types/export', {
    params: filters,
    responseType: 'blob'
  })
  return response.data
}

// Import shift types
export const importShiftTypes = async (file: File) => {
  const formData = new FormData()
  formData.append('file', file)

  const response = await api.post<{
    success: number
    failed: number
    errors: Array<{ row: number; error: string }>
  }>('/hr/shift-types/import', formData, {
    headers: { 'Content-Type': 'multipart/form-data' }
  })
  return response.data
}

// Validate shift times
export const validateShiftTimes = async (data: {
  startTime: string
  endTime: string
  breakStartTime?: string
  breakEndTime?: string
}) => {
  const response = await api.post<{
    valid: boolean
    errors?: string[]
    warnings?: string[]
    calculatedDuration?: number
  }>('/hr/shift-types/validate-times', data)
  return response.data
}

export default {
  getShiftTypes,
  getShiftType,
  getShiftTypeStats,
  getDefaultShift,
  createShiftType,
  updateShiftType,
  deleteShiftType,
  bulkDeleteShiftTypes,
  setAsDefaultShift,
  activateShiftType,
  deactivateShiftType,
  cloneShiftType,
  calculateWorkingHours,
  getShiftsByDay,
  getActiveShifts,
  getRamadanShifts,
  exportShiftTypes,
  importShiftTypes,
  validateShiftTimes,
}
