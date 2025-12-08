/**
 * Biometric Types
 * Type definitions for biometric attendance, geofencing, and related features
 */

// ═══════════════════════════════════════════════════════════════
// BIOMETRIC DEVICE TYPES
// ═══════════════════════════════════════════════════════════════

export type DeviceType = 'fingerprint' | 'facial' | 'card_reader' | 'iris' | 'palm' | 'multi_modal'
export type DeviceManufacturer = 'zkteco' | 'suprema' | 'hikvision' | 'dahua' | 'generic'
export type DeviceStatus = 'online' | 'offline' | 'maintenance' | 'error'
export type ConnectionType = 'tcp' | 'http' | 'usb' | 'serial'
export type EnrollmentStatus = 'pending' | 'partial' | 'complete' | 'suspended' | 'revoked'

export interface DeviceConnection {
  type: ConnectionType
  ipAddress?: string
  port?: number
  serialPort?: string
}

export interface DeviceLocation {
  name: string
  coordinates?: {
    latitude: number
    longitude: number
  }
  geofenceRadius?: number
}

export interface DeviceCapabilities {
  fingerprint: boolean
  facial: boolean
  card: boolean
  pin: boolean
  antiSpoofing: boolean
}

export interface BiometricDevice {
  _id: string
  firmId: string
  deviceId: string
  deviceName: string
  deviceType: DeviceType
  manufacturer: DeviceManufacturer
  status: DeviceStatus
  connection: DeviceConnection
  location: DeviceLocation
  capabilities: DeviceCapabilities
  lastSync?: Date
  firmwareVersion?: string
  createdAt: Date
  updatedAt: Date
}

export interface CreateDeviceData {
  deviceId: string
  deviceName: string
  deviceType: DeviceType
  manufacturer: DeviceManufacturer
  connection: DeviceConnection
  location: DeviceLocation
  capabilities?: Partial<DeviceCapabilities>
}

export interface UpdateDeviceData extends Partial<CreateDeviceData> {
  status?: DeviceStatus
}

export interface DeviceFilters {
  status?: DeviceStatus
  deviceType?: DeviceType
  manufacturer?: DeviceManufacturer
  locationName?: string
}

// ═══════════════════════════════════════════════════════════════
// BIOMETRIC ENROLLMENT TYPES
// ═══════════════════════════════════════════════════════════════

export type FingerType = 'left_thumb' | 'left_index' | 'left_middle' | 'left_ring' | 'left_pinky' |
                         'right_thumb' | 'right_index' | 'right_middle' | 'right_ring' | 'right_pinky'

export type CardType = 'rfid' | 'nfc' | 'magnetic' | 'smart'

export interface FingerprintData {
  finger: FingerType
  template: string
  quality: number
  enrolledAt: Date
}

export interface FacialData {
  photo: string
  template: string
  quality: number
  enrolledAt: Date
}

export interface CardData {
  cardNumber: string
  cardType: CardType
  issuedAt: Date
  expiresAt?: Date
}

export interface BiometricEnrollment {
  _id: string
  firmId: string
  employeeId: string
  employeeName?: string
  status: EnrollmentStatus
  fingerprints: FingerprintData[]
  facial?: FacialData
  card?: CardData
  pin?: string
  enrolledBy?: string
  createdAt: Date
  updatedAt: Date
}

export interface CreateEnrollmentData {
  employeeId: string
  fingerprints?: Omit<FingerprintData, 'enrolledAt'>[]
  facial?: Omit<FacialData, 'enrolledAt'>
  card?: Omit<CardData, 'issuedAt'>
  pin?: string
}

export interface EnrollmentFilters {
  status?: EnrollmentStatus
  employeeId?: string
  hasFingerprint?: boolean
  hasFacial?: boolean
  hasCard?: boolean
}

// ═══════════════════════════════════════════════════════════════
// VERIFICATION LOG TYPES
// ═══════════════════════════════════════════════════════════════

export type VerificationType = 'clock_in' | 'clock_out' | 'break_start' | 'break_end' | 'access'
export type VerificationMethod = 'fingerprint' | 'facial' | 'card' | 'pin' | 'manual'
export type VerificationResult = 'success' | 'failed' | 'spoofing_detected' | 'unknown_user' | 'device_error'

export interface VerificationLog {
  _id: string
  firmId: string
  employeeId?: string
  employeeName?: string
  deviceId: string
  deviceName?: string
  verificationType: VerificationType
  verificationMethod: VerificationMethod
  result: VerificationResult
  confidence?: number
  location?: {
    latitude: number
    longitude: number
    withinGeofence?: boolean
  }
  photo?: string
  timestamp: Date
  notes?: string
}

export interface VerificationFilters {
  employeeId?: string
  deviceId?: string
  verificationType?: VerificationType
  verificationMethod?: VerificationMethod
  result?: VerificationResult
  startDate?: string
  endDate?: string
  withinGeofence?: boolean
}

// ═══════════════════════════════════════════════════════════════
// GEOFENCE TYPES
// ═══════════════════════════════════════════════════════════════

export type GeofenceType = 'circle' | 'polygon'

export interface GeofenceSettings {
  allowClockIn: boolean
  allowClockOut: boolean
  alertOnEntry: boolean
  alertOnExit: boolean
  restrictedHours?: {
    start: string
    end: string
  }
}

export interface GeofenceZone {
  _id: string
  firmId: string
  name: string
  type: GeofenceType
  center?: {
    latitude: number
    longitude: number
  }
  radius?: number
  coordinates?: Array<{
    latitude: number
    longitude: number
  }>
  settings: GeofenceSettings
  isActive: boolean
  assignedEmployees?: string[]
  createdAt: Date
  updatedAt: Date
}

export interface CreateGeofenceData {
  name: string
  type: GeofenceType
  center?: {
    latitude: number
    longitude: number
  }
  radius?: number
  coordinates?: Array<{
    latitude: number
    longitude: number
  }>
  settings: GeofenceSettings
  assignedEmployees?: string[]
}

export interface GeofenceFilters {
  type?: GeofenceType
  isActive?: boolean
  search?: string
}

export interface LocationCheckResult {
  withinZone: boolean
  zones: Array<{
    zoneId: string
    zoneName: string
    distance?: number
  }>
}

// ═══════════════════════════════════════════════════════════════
// HR ANALYTICS TYPES
// ═══════════════════════════════════════════════════════════════

export interface WorkforceOverview {
  totalEmployees: number
  activeEmployees: number
  newHires: number
  terminations: number
  turnoverRate: number
  averageTenure: number
  headcountChange: number
  avgSalary: number
}

export interface HeadcountTrend {
  period: string
  headcount: number
  hires: number
  terminations: number
  netChange: number
}

export interface DepartmentBreakdown {
  department: string
  count: number
  percentage: number
  avgSalary: number
  turnoverRate: number
}

export interface TenureDistribution {
  range: string
  count: number
  percentage: number
}

export interface AttendanceAnalytics {
  averageAttendanceRate: number
  lateArrivals: number
  earlyDepartures: number
  absences: number
  overtimeHours: number
  trends: Array<{
    date: string
    attendanceRate: number
    lateCount: number
  }>
}

export interface LeaveAnalytics {
  totalLeavesTaken: number
  averageLeaveBalance: number
  leavesByType: Array<{
    type: string
    count: number
    days: number
  }>
  pendingRequests: number
  upcomingLeaves: number
}

export interface PayrollAnalytics {
  totalPayroll: number
  averageSalary: number
  medianSalary: number
  salaryRange: {
    min: number
    max: number
  }
  byDepartment: Array<{
    department: string
    total: number
    average: number
  }>
  ytdGrowth: number
}

export interface PerformanceAnalytics {
  averageScore: number
  distribution: Array<{
    rating: string
    count: number
    percentage: number
  }>
  topPerformers: number
  needsImprovement: number
  pendingReviews: number
}

export interface RecruitmentAnalytics {
  openPositions: number
  totalApplications: number
  interviewsScheduled: number
  offersExtended: number
  hireRate: number
  averageTimeToHire: number
  sourceEffectiveness: Array<{
    source: string
    applications: number
    hires: number
    conversionRate: number
  }>
}

export interface DiversityAnalytics {
  genderDistribution: Array<{
    gender: string
    count: number
    percentage: number
  }>
  ageDistribution: Array<{
    range: string
    count: number
    percentage: number
  }>
  nationalityDistribution: Array<{
    nationality: string
    count: number
    percentage: number
  }>
}

export interface AttritionAnalytics {
  voluntaryTurnover: number
  involuntaryTurnover: number
  retirements: number
  averageTenureAtExit: number
  exitReasons: Array<{
    reason: string
    count: number
    percentage: number
  }>
  byDepartment: Array<{
    department: string
    turnoverRate: number
  }>
}

// ═══════════════════════════════════════════════════════════════
// AI PREDICTION TYPES
// ═══════════════════════════════════════════════════════════════

export type RiskLevel = 'low' | 'medium' | 'high' | 'critical'

export interface RiskFactor {
  factor: string
  impact: 'positive' | 'negative'
  weight: number
  description: string
}

export interface AttritionRiskPrediction {
  employeeId: string
  employee: {
    name: string
    department: string
    position: string
    avatar?: string
  }
  riskScore: number
  riskLevel: RiskLevel
  factors: RiskFactor[]
  recommendations: string[]
  estimatedCost: number
  lastUpdated: Date
}

export interface WorkforceForecast {
  month: string
  projectedHeadcount: number
  expectedHires: number
  expectedTerminations: number
  confidence: number
}

export interface PromotionReadiness {
  employeeId: string
  employee: {
    name: string
    department: string
    currentPosition: string
    avatar?: string
  }
  readinessScore: number
  suggestedPositions: string[]
  developmentAreas: string[]
  timeToReadiness: string
}

export interface AttritionRiskSummary {
  highRisk: AttritionRiskPrediction[]
  mediumRisk: AttritionRiskPrediction[]
  lowRisk: AttritionRiskPrediction[]
  summary: {
    totalAtRisk: number
    averageRisk: number
    costAtRisk: number
  }
}
