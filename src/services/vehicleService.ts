import api from './api'

// ==================== TYPES & ENUMS ====================

// Vehicle Type
export type VehicleType = 'sedan' | 'suv' | 'van' | 'truck' | 'motorcycle' | 'bus'

// Fuel Type
export type FuelType = 'gasoline' | 'diesel' | 'electric' | 'hybrid'

// Assignment Type
export type VehicleAssignmentType = 'permanent' | 'temporary' | 'pool'

// Vehicle Status
export type VehicleStatus = 'active' | 'maintenance' | 'retired' | 'sold'

// Odometer Unit
export type OdometerUnit = 'km' | 'miles'

// Trip Purpose
export type TripPurpose = 'business' | 'personal' | 'commute' | 'client_visit' | 'court' | 'other'

// Service Type
export type ServiceType = 'fuel' | 'service' | 'repair' | 'insurance' | 'registration' | 'toll' | 'parking' | 'other'

// Reimbursement Status
export type ReimbursementStatus = 'pending' | 'approved' | 'rejected' | 'paid'

// ==================== LABELS ====================

export const VEHICLE_TYPE_LABELS: Record<VehicleType, { ar: string; en: string; icon: string }> = {
  sedan: { ar: 'سيدان', en: 'Sedan', icon: 'Car' },
  suv: { ar: 'دفع رباعي', en: 'SUV', icon: 'Truck' },
  van: { ar: 'فان', en: 'Van', icon: 'Bus' },
  truck: { ar: 'شاحنة', en: 'Truck', icon: 'Truck' },
  motorcycle: { ar: 'دراجة نارية', en: 'Motorcycle', icon: 'Bike' },
  bus: { ar: 'حافلة', en: 'Bus', icon: 'Bus' },
}

export const FUEL_TYPE_LABELS: Record<FuelType, { ar: string; en: string; color: string }> = {
  gasoline: { ar: 'بنزين', en: 'Gasoline', color: 'blue' },
  diesel: { ar: 'ديزل', en: 'Diesel', color: 'amber' },
  electric: { ar: 'كهربائي', en: 'Electric', color: 'emerald' },
  hybrid: { ar: 'هجين', en: 'Hybrid', color: 'purple' },
}

export const VEHICLE_STATUS_LABELS: Record<VehicleStatus, { ar: string; en: string; color: string }> = {
  active: { ar: 'نشط', en: 'Active', color: 'emerald' },
  maintenance: { ar: 'صيانة', en: 'Maintenance', color: 'amber' },
  retired: { ar: 'متقاعد', en: 'Retired', color: 'slate' },
  sold: { ar: 'مباع', en: 'Sold', color: 'red' },
}

export const ASSIGNMENT_TYPE_LABELS: Record<VehicleAssignmentType, { ar: string; en: string; color: string }> = {
  permanent: { ar: 'دائم', en: 'Permanent', color: 'blue' },
  temporary: { ar: 'مؤقت', en: 'Temporary', color: 'amber' },
  pool: { ar: 'مشترك', en: 'Pool', color: 'purple' },
}

export const TRIP_PURPOSE_LABELS: Record<TripPurpose, { ar: string; en: string; color: string }> = {
  business: { ar: 'عمل', en: 'Business', color: 'blue' },
  personal: { ar: 'شخصي', en: 'Personal', color: 'purple' },
  commute: { ar: 'تنقل', en: 'Commute', color: 'teal' },
  client_visit: { ar: 'زيارة عميل', en: 'Client Visit', color: 'indigo' },
  court: { ar: 'محكمة', en: 'Court', color: 'amber' },
  other: { ar: 'أخرى', en: 'Other', color: 'slate' },
}

export const SERVICE_TYPE_LABELS: Record<ServiceType, { ar: string; en: string; icon: string }> = {
  fuel: { ar: 'وقود', en: 'Fuel', icon: 'Fuel' },
  service: { ar: 'صيانة', en: 'Service', icon: 'Wrench' },
  repair: { ar: 'إصلاح', en: 'Repair', icon: 'Tool' },
  insurance: { ar: 'تأمين', en: 'Insurance', icon: 'Shield' },
  registration: { ar: 'تسجيل', en: 'Registration', icon: 'FileText' },
  toll: { ar: 'رسوم طريق', en: 'Toll', icon: 'DollarSign' },
  parking: { ar: 'موقف', en: 'Parking', icon: 'ParkingSquare' },
  other: { ar: 'أخرى', en: 'Other', icon: 'MoreHorizontal' },
}

export const REIMBURSEMENT_STATUS_LABELS: Record<ReimbursementStatus, { ar: string; en: string; color: string }> = {
  pending: { ar: 'قيد الانتظار', en: 'Pending', color: 'amber' },
  approved: { ar: 'موافق عليه', en: 'Approved', color: 'emerald' },
  rejected: { ar: 'مرفوض', en: 'Rejected', color: 'red' },
  paid: { ar: 'مدفوع', en: 'Paid', color: 'blue' },
}

// ==================== INTERFACES ====================

export interface Vehicle {
  _id: string
  vehicleId: string

  // Vehicle info
  licensePlate: string
  make: string
  model: string
  year: number
  color: string
  colorAr: string

  vehicleType: VehicleType
  fuelType: FuelType

  // Registration
  registrationNumber: string
  registrationExpiry: string
  insuranceNumber: string
  insuranceExpiry: string

  // Assignment
  assignedTo?: string // employeeId
  assignedToName?: string
  assignmentDate?: string
  assignmentType: VehicleAssignmentType

  // Odometer
  lastOdometerReading: number
  odometerUnit: OdometerUnit

  // Maintenance
  lastServiceDate?: string
  nextServiceDue?: string
  nextServiceOdometer?: number

  // Cost tracking
  purchaseDate: string
  purchaseValue: number
  currentValue: number

  status: VehicleStatus

  location: string // which branch

  createdAt: string
  updatedAt: string
}

export interface VehicleLog {
  _id: string
  logId: string

  vehicleId: string
  licensePlate: string

  employeeId: string
  employeeName: string

  // Trip details
  date: string
  startTime?: string
  endTime?: string

  odometerStart: number
  odometerEnd: number
  distanceTraveled: number

  // Purpose
  purpose: TripPurpose
  destination?: string

  // Fuel
  fuelQty?: number
  fuelPrice?: number
  fuelCost?: number

  // Expenses
  serviceType?: ServiceType
  serviceCost?: number
  serviceDescription?: string

  // Invoice
  invoiceNumber?: string
  invoiceAttachment?: string

  // Reimbursement
  isReimbursable: boolean
  reimbursementStatus?: ReimbursementStatus

  createdAt: string
}

export interface CreateVehicleData {
  licensePlate: string
  make: string
  model: string
  year: number
  color: string
  colorAr: string
  vehicleType: VehicleType
  fuelType: FuelType
  registrationNumber: string
  registrationExpiry: string
  insuranceNumber: string
  insuranceExpiry: string
  assignmentType: VehicleAssignmentType
  lastOdometerReading: number
  odometerUnit: OdometerUnit
  purchaseDate: string
  purchaseValue: number
  currentValue: number
  location: string
  assignedTo?: string
  assignedToName?: string
  assignmentDate?: string
}

export interface UpdateVehicleData {
  licensePlate?: string
  make?: string
  model?: string
  year?: number
  color?: string
  colorAr?: string
  vehicleType?: VehicleType
  fuelType?: FuelType
  registrationNumber?: string
  registrationExpiry?: string
  insuranceNumber?: string
  insuranceExpiry?: string
  assignmentType?: VehicleAssignmentType
  lastOdometerReading?: number
  odometerUnit?: OdometerUnit
  lastServiceDate?: string
  nextServiceDue?: string
  nextServiceOdometer?: number
  purchaseValue?: number
  currentValue?: number
  status?: VehicleStatus
  location?: string
}

export interface CreateVehicleLogData {
  vehicleId: string
  employeeId: string
  employeeName: string
  date: string
  startTime?: string
  endTime?: string
  odometerStart: number
  odometerEnd: number
  purpose: TripPurpose
  destination?: string
  fuelQty?: number
  fuelPrice?: number
  serviceType?: ServiceType
  serviceCost?: number
  serviceDescription?: string
  invoiceNumber?: string
  invoiceAttachment?: string
  isReimbursable: boolean
}

export interface VehicleFilters {
  status?: VehicleStatus
  vehicleType?: VehicleType
  fuelType?: FuelType
  assignmentType?: VehicleAssignmentType
  location?: string
  assignedTo?: string
  search?: string
  page?: number
  limit?: number
}

export interface VehicleLogFilters {
  vehicleId?: string
  employeeId?: string
  purpose?: TripPurpose
  dateFrom?: string
  dateTo?: string
  reimbursementStatus?: ReimbursementStatus
  page?: number
  limit?: number
}

export interface VehicleResponse {
  data: Vehicle[]
  pagination: {
    total: number
    page: number
    limit: number
    pages: number
  }
}

export interface VehicleLogResponse {
  data: VehicleLog[]
  pagination: {
    total: number
    page: number
    limit: number
    pages: number
  }
}

export interface VehicleStats {
  totalVehicles: number
  byStatus: Array<{ status: VehicleStatus; count: number }>
  byType: Array<{ vehicleType: VehicleType; count: number }>
  byFuelType: Array<{ fuelType: FuelType; count: number }>
  activeVehicles: number
  inMaintenance: number
  assignedVehicles: number
  poolVehicles: number
  serviceDueThisMonth: number
  insuranceExpiringSoon: number
  registrationExpiringSoon: number
  totalFleetValue: number
  averageOdometerReading: number
  totalDistanceThisMonth: number
  totalFuelCostThisMonth: number
}

export interface FleetSummary {
  totalVehicles: number
  activeVehicles: number
  totalValue: number
  monthlyFuelCost: number
  monthlyDistance: number
  averageAge: number
  utilizationRate: number
}

export interface VehicleUtilization {
  vehicleId: string
  licensePlate: string
  totalTrips: number
  totalDistance: number
  averageDistance: number
  totalFuelCost: number
  averageFuelCost: number
  utilizationRate: number
  lastTripDate?: string
}

export interface VehicleExpenses {
  vehicleId: string
  licensePlate: string
  period: {
    from: string
    to: string
  }
  totalExpenses: number
  byType: Array<{
    serviceType: ServiceType
    count: number
    totalCost: number
  }>
  fuelExpenses: number
  serviceExpenses: number
  repairExpenses: number
  otherExpenses: number
}

export interface ServiceReminder {
  vehicleId: string
  vehicleNumber: string
  licensePlate: string
  make: string
  model: string
  lastServiceDate?: string
  nextServiceDue?: string
  currentOdometer: number
  nextServiceOdometer?: number
  daysUntilService?: number
  odometerUntilService?: number
  isOverdue: boolean
}

// ==================== API FUNCTIONS ====================

// Get all vehicles
export const getVehicles = async (filters?: VehicleFilters): Promise<VehicleResponse> => {
  const params = new URLSearchParams()
  if (filters?.status) params.append('status', filters.status)
  if (filters?.vehicleType) params.append('vehicleType', filters.vehicleType)
  if (filters?.fuelType) params.append('fuelType', filters.fuelType)
  if (filters?.assignmentType) params.append('assignmentType', filters.assignmentType)
  if (filters?.location) params.append('location', filters.location)
  if (filters?.assignedTo) params.append('assignedTo', filters.assignedTo)
  if (filters?.search) params.append('search', filters.search)
  if (filters?.page) params.append('page', filters.page.toString())
  if (filters?.limit) params.append('limit', filters.limit.toString())

  const response = await api.get(`/hr/vehicles?${params.toString()}`)
  return response.data
}

// Get single vehicle
export const getVehicle = async (vehicleId: string): Promise<Vehicle> => {
  const response = await api.get(`/hr/vehicles/${vehicleId}`)
  return response.data
}

// Create vehicle
export const createVehicle = async (data: CreateVehicleData): Promise<Vehicle> => {
  const response = await api.post('/hr/vehicles', data)
  return response.data
}

// Update vehicle
export const updateVehicle = async (vehicleId: string, data: UpdateVehicleData): Promise<Vehicle> => {
  const response = await api.patch(`/hr/vehicles/${vehicleId}`, data)
  return response.data
}

// Delete vehicle
export const deleteVehicle = async (vehicleId: string): Promise<void> => {
  await api.delete(`/hr/vehicles/${vehicleId}`)
}

// Assign vehicle
export const assignVehicle = async (vehicleId: string, data: {
  employeeId: string
  employeeName: string
  assignmentType: VehicleAssignmentType
  assignmentDate: string
}): Promise<Vehicle> => {
  const response = await api.post(`/hr/vehicles/${vehicleId}/assign`, data)
  return response.data
}

// Unassign vehicle
export const unassignVehicle = async (vehicleId: string): Promise<Vehicle> => {
  const response = await api.post(`/hr/vehicles/${vehicleId}/unassign`)
  return response.data
}

// Get vehicle logs
export const getVehicleLogs = async (filters?: VehicleLogFilters): Promise<VehicleLogResponse> => {
  const params = new URLSearchParams()
  if (filters?.vehicleId) params.append('vehicleId', filters.vehicleId)
  if (filters?.employeeId) params.append('employeeId', filters.employeeId)
  if (filters?.purpose) params.append('purpose', filters.purpose)
  if (filters?.dateFrom) params.append('dateFrom', filters.dateFrom)
  if (filters?.dateTo) params.append('dateTo', filters.dateTo)
  if (filters?.reimbursementStatus) params.append('reimbursementStatus', filters.reimbursementStatus)
  if (filters?.page) params.append('page', filters.page.toString())
  if (filters?.limit) params.append('limit', filters.limit.toString())

  const response = await api.get(`/hr/vehicle-logs?${params.toString()}`)
  return response.data
}

// Create vehicle log
export const createVehicleLog = async (data: CreateVehicleLogData): Promise<VehicleLog> => {
  // Calculate distance and fuel cost
  const distanceTraveled = data.odometerEnd - data.odometerStart
  const fuelCost = data.fuelQty && data.fuelPrice ? data.fuelQty * data.fuelPrice : undefined

  const response = await api.post('/hr/vehicle-logs', {
    ...data,
    distanceTraveled,
    fuelCost,
  })
  return response.data
}

// Get vehicle expenses
export const getVehicleExpenses = async (vehicleId: string, dateRange?: {
  from: string
  to: string
}): Promise<VehicleExpenses> => {
  const params = new URLSearchParams()
  if (dateRange?.from) params.append('from', dateRange.from)
  if (dateRange?.to) params.append('to', dateRange.to)

  const response = await api.get(`/hr/vehicles/${vehicleId}/expenses?${params.toString()}`)
  return response.data
}

// Get vehicles due for service
export const getVehiclesDueForService = async (): Promise<ServiceReminder[]> => {
  const response = await api.get('/hr/vehicles/service-due')
  return response.data
}

// Get vehicle utilization
export const getVehicleUtilization = async (vehicleId: string, dateRange?: {
  from: string
  to: string
}): Promise<VehicleUtilization> => {
  const params = new URLSearchParams()
  if (dateRange?.from) params.append('from', dateRange.from)
  if (dateRange?.to) params.append('to', dateRange.to)

  const response = await api.get(`/hr/vehicles/${vehicleId}/utilization?${params.toString()}`)
  return response.data
}

// Get fleet summary
export const getFleetSummary = async (): Promise<FleetSummary> => {
  const response = await api.get('/hr/vehicles/fleet-summary')
  return response.data
}

// Get vehicle stats
export const getVehicleStats = async (): Promise<VehicleStats> => {
  const response = await api.get('/hr/vehicles/stats')
  return response.data
}

// Update reimbursement status
export const updateReimbursementStatus = async (logId: string, data: {
  reimbursementStatus: ReimbursementStatus
  notes?: string
}): Promise<VehicleLog> => {
  const response = await api.patch(`/hr/vehicle-logs/${logId}/reimbursement`, data)
  return response.data
}

// Bulk delete vehicles
export const bulkDeleteVehicles = async (ids: string[]): Promise<{ deleted: number }> => {
  const response = await api.post('/hr/vehicles/bulk-delete', { ids })
  return response.data
}

// Export vehicles
export const exportVehicles = async (filters?: VehicleFilters): Promise<Blob> => {
  const params = new URLSearchParams()
  if (filters?.status) params.append('status', filters.status)
  if (filters?.vehicleType) params.append('vehicleType', filters.vehicleType)
  if (filters?.location) params.append('location', filters.location)

  const response = await api.get(`/hr/vehicles/export?${params.toString()}`, {
    responseType: 'blob'
  })
  return response.data
}

// Export vehicle logs
export const exportVehicleLogs = async (filters?: VehicleLogFilters): Promise<Blob> => {
  const params = new URLSearchParams()
  if (filters?.vehicleId) params.append('vehicleId', filters.vehicleId)
  if (filters?.dateFrom) params.append('dateFrom', filters.dateFrom)
  if (filters?.dateTo) params.append('dateTo', filters.dateTo)

  const response = await api.get(`/hr/vehicle-logs/export?${params.toString()}`, {
    responseType: 'blob'
  })
  return response.data
}
