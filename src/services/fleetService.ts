import api from './api'

// ==================== TYPES & ENUMS ====================

// Vehicle Status
export type VehicleStatus =
  | 'active'
  | 'maintenance'
  | 'out_of_service'
  | 'reserved'
  | 'disposed'
  | 'in_use'
  | 'available'

// Vehicle Type
export type VehicleType =
  | 'sedan'
  | 'suv'
  | 'pickup'
  | 'van'
  | 'truck'
  | 'bus'
  | 'motorcycle'
  | 'heavy_equipment'
  | 'other'

// Fuel Type
export type FuelType = 'gasoline' | 'diesel' | 'hybrid' | 'electric' | 'lpg' | 'cng'

// Transmission Type
export type TransmissionType = 'automatic' | 'manual' | 'cvt' | 'semi_automatic'

// Trip Status
export type TripStatus = 'scheduled' | 'in_progress' | 'completed' | 'cancelled'

// Incident Severity
export type IncidentSeverity = 'minor' | 'moderate' | 'major' | 'critical'

// Incident Type
export type IncidentType =
  | 'accident'
  | 'breakdown'
  | 'theft'
  | 'vandalism'
  | 'traffic_violation'
  | 'mechanical_failure'
  | 'tire_issue'
  | 'other'

// Driver License Type
export type DriverLicenseType = 'light' | 'heavy' | 'motorcycle' | 'commercial' | 'all'

// ==================== LABELS ====================

export const VEHICLE_STATUS_LABELS: Record<VehicleStatus, { ar: string; en: string; color: string }> = {
  active: { ar: 'نشط', en: 'Active', color: 'green' },
  maintenance: { ar: 'صيانة', en: 'Maintenance', color: 'yellow' },
  out_of_service: { ar: 'خارج الخدمة', en: 'Out of Service', color: 'red' },
  reserved: { ar: 'محجوز', en: 'Reserved', color: 'blue' },
  disposed: { ar: 'تم التخلص', en: 'Disposed', color: 'gray' },
  in_use: { ar: 'قيد الاستخدام', en: 'In Use', color: 'cyan' },
  available: { ar: 'متاح', en: 'Available', color: 'emerald' },
}

export const VEHICLE_TYPE_LABELS: Record<VehicleType, { ar: string; en: string; icon: string }> = {
  sedan: { ar: 'سيدان', en: 'Sedan', icon: 'Car' },
  suv: { ar: 'دفع رباعي', en: 'SUV', icon: 'CarFront' },
  pickup: { ar: 'بيك أب', en: 'Pickup', icon: 'Truck' },
  van: { ar: 'فان', en: 'Van', icon: 'Bus' },
  truck: { ar: 'شاحنة', en: 'Truck', icon: 'Truck' },
  bus: { ar: 'حافلة', en: 'Bus', icon: 'Bus' },
  motorcycle: { ar: 'دراجة نارية', en: 'Motorcycle', icon: 'Bike' },
  heavy_equipment: { ar: 'معدات ثقيلة', en: 'Heavy Equipment', icon: 'Cog' },
  other: { ar: 'أخرى', en: 'Other', icon: 'Car' },
}

export const FUEL_TYPE_LABELS: Record<FuelType, { ar: string; en: string }> = {
  gasoline: { ar: 'بنزين', en: 'Gasoline' },
  diesel: { ar: 'ديزل', en: 'Diesel' },
  hybrid: { ar: 'هجين', en: 'Hybrid' },
  electric: { ar: 'كهربائي', en: 'Electric' },
  lpg: { ar: 'غاز البترول', en: 'LPG' },
  cng: { ar: 'الغاز الطبيعي', en: 'CNG' },
}

export const TRIP_STATUS_LABELS: Record<TripStatus, { ar: string; en: string; color: string }> = {
  scheduled: { ar: 'مجدول', en: 'Scheduled', color: 'blue' },
  in_progress: { ar: 'قيد التنفيذ', en: 'In Progress', color: 'yellow' },
  completed: { ar: 'مكتمل', en: 'Completed', color: 'green' },
  cancelled: { ar: 'ملغي', en: 'Cancelled', color: 'red' },
}

export const INCIDENT_SEVERITY_LABELS: Record<IncidentSeverity, { ar: string; en: string; color: string }> = {
  minor: { ar: 'طفيف', en: 'Minor', color: 'blue' },
  moderate: { ar: 'متوسط', en: 'Moderate', color: 'yellow' },
  major: { ar: 'كبير', en: 'Major', color: 'orange' },
  critical: { ar: 'حرج', en: 'Critical', color: 'red' },
}

export const INCIDENT_TYPE_LABELS: Record<IncidentType, { ar: string; en: string }> = {
  accident: { ar: 'حادث', en: 'Accident' },
  breakdown: { ar: 'عطل', en: 'Breakdown' },
  theft: { ar: 'سرقة', en: 'Theft' },
  vandalism: { ar: 'تخريب', en: 'Vandalism' },
  traffic_violation: { ar: 'مخالفة مرورية', en: 'Traffic Violation' },
  mechanical_failure: { ar: 'عطل ميكانيكي', en: 'Mechanical Failure' },
  tire_issue: { ar: 'مشكلة إطار', en: 'Tire Issue' },
  other: { ar: 'أخرى', en: 'Other' },
}

// ==================== INTERFACES ====================

// Vehicle Insurance
export interface VehicleInsurance {
  provider: string
  policyNumber: string
  insuranceType: 'comprehensive' | 'third_party' | 'basic'
  startDate: string
  endDate: string
  premium: number
  premiumFrequency: 'monthly' | 'quarterly' | 'annual'
  coverageAmount: number
  deductible: number
  isActive: boolean
  daysRemaining?: number
}

// Vehicle Registration
export interface VehicleRegistration {
  plateNumber: string
  registrationNumber: string
  registrationDate: string
  expiryDate: string
  registrationAuthority: string
  fees: number
  isValid: boolean
  daysToExpiry?: number
}

// Vehicle Maintenance Schedule
export interface VehicleMaintenanceSchedule {
  scheduleId: string
  maintenanceType: 'oil_change' | 'tire_rotation' | 'brake_inspection' | 'full_service' | 'ac_service' | 'battery_check' | 'other'
  intervalKm?: number
  intervalMonths?: number
  lastPerformed?: string
  lastOdometer?: number
  nextDueDate?: string
  nextDueOdometer?: number
  status: 'upcoming' | 'due' | 'overdue' | 'completed'
}

// Fuel Log
export interface FuelLog {
  _id: string
  fuelLogId: string
  vehicleId: string
  vehiclePlate?: string
  date: string
  time?: string
  fuelType: FuelType
  quantity: number
  unitPrice: number
  totalCost: number
  odometer: number
  station?: string
  stationLocation?: string
  paymentMethod: 'cash' | 'card' | 'company_account' | 'fuel_card'
  fuelCardNumber?: string
  receiptNumber?: string
  receiptUrl?: string
  driverId?: string
  driverName?: string
  tripId?: string
  notes?: string
  verified: boolean
  verifiedBy?: string
  createdAt: string
  createdBy?: string
}

// Trip
export interface Trip {
  _id: string
  tripId: string
  tripNumber: string

  // Vehicle
  vehicleId: string
  vehiclePlate: string
  vehicleName?: string

  // Driver
  driverId: string
  driverName: string
  driverPhone?: string

  // Trip Details
  purpose: string
  purposeAr?: string
  tripType: 'business' | 'personal' | 'delivery' | 'pickup' | 'client_visit' | 'other'

  // Route
  startLocation: string
  startLocationAr?: string
  endLocation: string
  endLocationAr?: string
  waypoints?: Array<{
    location: string
    arrivalTime?: string
    departureTime?: string
  }>
  estimatedDistance?: number
  actualDistance?: number

  // Timing
  scheduledStart: string
  scheduledEnd: string
  actualStart?: string
  actualEnd?: string

  // Odometer
  startOdometer?: number
  endOdometer?: number

  // GPS Tracking
  gpsEnabled: boolean
  gpsData?: Array<{
    timestamp: string
    latitude: number
    longitude: number
    speed?: number
  }>
  trackingUrl?: string

  // Status
  status: TripStatus

  // Passengers
  passengers?: Array<{
    name: string
    employeeId?: string
    pickupLocation?: string
    dropoffLocation?: string
  }>

  // Costs
  fuelCost?: number
  tollCost?: number
  parkingCost?: number
  otherCosts?: number
  totalCost?: number

  // Approval
  requiresApproval: boolean
  approvalStatus?: 'pending' | 'approved' | 'rejected'
  approvedBy?: string
  approvalDate?: string
  rejectionReason?: string

  // Notes
  notes?: string
  driverNotes?: string

  // Audit
  createdAt: string
  createdBy: string
  updatedAt?: string
}

// Incident
export interface Incident {
  _id: string
  incidentId: string
  incidentNumber: string

  // Vehicle
  vehicleId: string
  vehiclePlate: string
  vehicleName?: string

  // Driver
  driverId: string
  driverName: string

  // Incident Details
  incidentDate: string
  incidentTime: string
  incidentType: IncidentType
  severity: IncidentSeverity
  description: string
  descriptionAr?: string

  // Location
  location: string
  locationAr?: string
  gpsCoordinates?: {
    latitude: number
    longitude: number
  }

  // Related Trip
  tripId?: string

  // Parties Involved
  partiesInvolved?: Array<{
    name: string
    contact?: string
    vehiclePlate?: string
    insuranceInfo?: string
    role: 'driver' | 'passenger' | 'third_party' | 'witness'
  }>

  // Damage
  vehicleDamage?: {
    hasDamage: boolean
    description?: string
    estimatedCost?: number
    actualCost?: number
    photos?: string[]
  }
  injuries?: {
    hasInjuries: boolean
    description?: string
    injuredParties?: Array<{
      name: string
      injuryType: string
      severity: 'minor' | 'moderate' | 'severe'
    }>
  }

  // Police Report
  policeReport?: {
    filed: boolean
    reportNumber?: string
    filingDate?: string
    officerName?: string
    reportUrl?: string
  }

  // Insurance Claim
  insuranceClaim?: {
    filed: boolean
    claimNumber?: string
    filingDate?: string
    status: 'pending' | 'approved' | 'rejected' | 'settled'
    claimAmount?: number
    settledAmount?: number
    settlementDate?: string
  }

  // Resolution
  status: 'reported' | 'under_investigation' | 'resolved' | 'closed'
  resolution?: string
  resolvedDate?: string
  resolvedBy?: string

  // Documents
  documents?: Array<{
    type: 'photo' | 'police_report' | 'insurance_doc' | 'repair_estimate' | 'witness_statement' | 'other'
    name: string
    url: string
    uploadedAt: string
  }>

  // Audit
  createdAt: string
  createdBy: string
  updatedAt?: string
}

// Driver
export interface Driver {
  _id: string
  driverId: string
  employeeId: string
  employeeNumber?: string
  name: string
  nameAr?: string
  phone: string
  email?: string
  department?: string
  departmentId?: string

  // License
  license: {
    number: string
    type: DriverLicenseType
    issueDate: string
    expiryDate: string
    issuingAuthority: string
    isValid: boolean
    daysToExpiry?: number
    restrictions?: string[]
    endorsements?: string[]
    documentUrl?: string
  }

  // Medical
  medicalCertificate?: {
    number: string
    issueDate: string
    expiryDate: string
    isValid: boolean
    documentUrl?: string
  }

  // Assignment
  assignedVehicles: Array<{
    vehicleId: string
    vehiclePlate: string
    isPrimary: boolean
    assignmentDate: string
  }>

  // Driving Record
  drivingRecord: {
    totalTrips: number
    totalDistance: number
    totalHours: number
    incidents: number
    violations: number
    accidents: number
    rating: number
  }

  // Status
  status: 'active' | 'inactive' | 'suspended' | 'on_leave'
  suspensionReason?: string
  suspensionEndDate?: string

  // Availability
  isAvailable: boolean
  currentTripId?: string

  // Notes
  notes?: string

  // Audit
  createdAt: string
  createdBy?: string
  updatedAt?: string
}

// Vehicle
export interface Vehicle {
  _id: string
  vehicleId: string
  vehicleNumber: string

  // Basic Info
  name: string
  nameAr?: string
  make: string
  model: string
  year: number
  color: string
  colorAr?: string

  // Classification
  vehicleType: VehicleType
  fuelType: FuelType
  transmission: TransmissionType

  // Identification
  vin: string
  engineNumber?: string
  chassisNumber?: string

  // Registration
  registration: VehicleRegistration

  // Specifications
  specifications: {
    engineSize?: number
    horsepower?: number
    fuelCapacity?: number
    seatingCapacity?: number
    cargoCapacity?: number
    weight?: number
    dimensions?: {
      length: number
      width: number
      height: number
    }
  }

  // Current State
  currentState: {
    odometer: number
    lastOdometerUpdate: string
    fuelLevel?: number
    location?: string
    gpsEnabled: boolean
    gpsDeviceId?: string
    lastGpsUpdate?: string
    coordinates?: {
      latitude: number
      longitude: number
    }
  }

  // Acquisition
  acquisition: {
    method: 'purchase' | 'lease' | 'rental'
    date: string
    vendor?: string
    cost?: number
    leaseDetails?: {
      leasingCompany: string
      monthlyPayment: number
      leaseStartDate: string
      leaseEndDate: string
      mileageLimit?: number
    }
  }

  // Insurance
  insurance: VehicleInsurance

  // Maintenance
  maintenance: {
    schedules: VehicleMaintenanceSchedule[]
    lastServiceDate?: string
    lastServiceOdometer?: number
    nextServiceDue?: string
    nextServiceOdometer?: number
    totalMaintenanceCost: number
  }

  // Assignment
  assignment?: {
    assignedToType: 'employee' | 'department' | 'pool'
    assignedToId?: string
    assignedToName?: string
    assignmentDate?: string
    primaryDriverId?: string
    primaryDriverName?: string
  }

  // Usage Tracking
  usage: {
    totalTrips: number
    totalDistance: number
    totalFuelCost: number
    averageFuelConsumption?: number
    utilizationRate?: number
  }

  // Status
  status: VehicleStatus
  isOperational: boolean
  condition: 'excellent' | 'good' | 'fair' | 'poor'

  // Documents
  documents?: Array<{
    type: 'registration' | 'insurance' | 'inspection' | 'photo' | 'other'
    name: string
    url: string
    expiryDate?: string
    uploadedAt: string
  }>

  // Tags
  tags?: string[]

  // Notes
  notes?: string

  // Audit
  createdAt: string
  createdBy?: string
  updatedAt?: string
}

// Create Vehicle Data
export interface CreateVehicleData {
  name: string
  nameAr?: string
  make: string
  model: string
  year: number
  color: string
  vehicleType: VehicleType
  fuelType: FuelType
  transmission: TransmissionType
  vin: string
  engineNumber?: string
  chassisNumber?: string
  registration: {
    plateNumber: string
    registrationNumber: string
    registrationDate: string
    expiryDate: string
    registrationAuthority: string
    fees?: number
  }
  specifications?: Vehicle['specifications']
  acquisition: {
    method: 'purchase' | 'lease' | 'rental'
    date: string
    vendor?: string
    cost?: number
    leaseDetails?: Vehicle['acquisition']['leaseDetails']
  }
  insurance?: Partial<VehicleInsurance>
  assignment?: Vehicle['assignment']
  tags?: string[]
  notes?: string
}

// Update Vehicle Data
export interface UpdateVehicleData extends Partial<CreateVehicleData> {
  status?: VehicleStatus
  currentOdometer?: number
  condition?: Vehicle['condition']
}

// Vehicle Filters
export interface VehicleFilters {
  status?: VehicleStatus
  vehicleType?: VehicleType
  fuelType?: FuelType
  assignedToType?: 'employee' | 'department' | 'pool'
  assignedToId?: string
  registrationExpiring?: boolean
  insuranceExpiring?: boolean
  maintenanceDue?: boolean
  search?: string
  page?: number
  limit?: number
  sortBy?: string
  sortOrder?: 'asc' | 'desc'
}

// Trip Filters
export interface TripFilters {
  vehicleId?: string
  driverId?: string
  status?: TripStatus
  tripType?: Trip['tripType']
  dateFrom?: string
  dateTo?: string
  search?: string
  page?: number
  limit?: number
}

// Response Types
export interface VehicleResponse {
  data: Vehicle[]
  pagination: {
    total: number
    page: number
    limit: number
    pages: number
  }
}

export interface TripResponse {
  data: Trip[]
  pagination: {
    total: number
    page: number
    limit: number
    pages: number
  }
}

export interface FuelLogResponse {
  data: FuelLog[]
  pagination: {
    total: number
    page: number
    limit: number
    pages: number
  }
}

export interface IncidentResponse {
  data: Incident[]
  pagination: {
    total: number
    page: number
    limit: number
    pages: number
  }
}

export interface DriverResponse {
  data: Driver[]
  pagination: {
    total: number
    page: number
    limit: number
    pages: number
  }
}

// Fleet Statistics
export interface FleetStatistics {
  totalVehicles: number
  activeVehicles: number
  inMaintenanceVehicles: number
  availableVehicles: number
  byStatus: Array<{ status: VehicleStatus; count: number }>
  byType: Array<{ type: VehicleType; count: number }>
  totalDrivers: number
  activeDrivers: number
  totalTripsThisMonth: number
  totalDistanceThisMonth: number
  totalFuelCostThisMonth: number
  averageFuelConsumption: number
  vehiclesWithExpiringDocs: number
  overdueMaintenanceCount: number
  incidentsThisMonth: number
  utilizationRate: number
}

// Fuel Report
export interface FuelReport {
  period: { from: string; to: string }
  totalQuantity: number
  totalCost: number
  averagePricePerLiter: number
  byVehicle: Array<{
    vehicleId: string
    vehiclePlate: string
    quantity: number
    cost: number
    distance: number
    efficiency: number
  }>
  byFuelType: Array<{
    fuelType: FuelType
    quantity: number
    cost: number
  }>
  trend: Array<{
    date: string
    quantity: number
    cost: number
  }>
}

// ==================== API FUNCTIONS ====================

// ----- Vehicles -----

/**
 * Get all vehicles with filters
 * GET /fleet/vehicles
 */
export const getVehicles = async (filters?: VehicleFilters): Promise<VehicleResponse> => {
  const params = new URLSearchParams()
  if (filters?.status) params.append('status', filters.status)
  if (filters?.vehicleType) params.append('vehicleType', filters.vehicleType)
  if (filters?.fuelType) params.append('fuelType', filters.fuelType)
  if (filters?.assignedToType) params.append('assignedToType', filters.assignedToType)
  if (filters?.assignedToId) params.append('assignedToId', filters.assignedToId)
  if (filters?.registrationExpiring !== undefined) params.append('registrationExpiring', filters.registrationExpiring.toString())
  if (filters?.insuranceExpiring !== undefined) params.append('insuranceExpiring', filters.insuranceExpiring.toString())
  if (filters?.maintenanceDue !== undefined) params.append('maintenanceDue', filters.maintenanceDue.toString())
  if (filters?.search) params.append('search', filters.search)
  if (filters?.page) params.append('page', filters.page.toString())
  if (filters?.limit) params.append('limit', filters.limit.toString())
  if (filters?.sortBy) params.append('sortBy', filters.sortBy)
  if (filters?.sortOrder) params.append('sortOrder', filters.sortOrder)

  const response = await api.get(`/fleet/vehicles?${params.toString()}`)
  return response.data
}

/**
 * Get single vehicle
 * GET /fleet/vehicles/:id
 */
export const getVehicle = async (vehicleId: string): Promise<Vehicle> => {
  const response = await api.get(`/fleet/vehicles/${vehicleId}`)
  return response.data
}

/**
 * Create vehicle
 * POST /fleet/vehicles
 */
export const createVehicle = async (data: CreateVehicleData): Promise<Vehicle> => {
  const response = await api.post('/fleet/vehicles', data)
  return response.data
}

/**
 * Update vehicle
 * PATCH /fleet/vehicles/:id
 */
export const updateVehicle = async (vehicleId: string, data: UpdateVehicleData): Promise<Vehicle> => {
  const response = await api.patch(`/fleet/vehicles/${vehicleId}`, data)
  return response.data
}

/**
 * Delete vehicle
 * DELETE /fleet/vehicles/:id
 */
export const deleteVehicle = async (vehicleId: string): Promise<void> => {
  await api.delete(`/fleet/vehicles/${vehicleId}`)
}

/**
 * Update vehicle status
 * PATCH /fleet/vehicles/:id/status
 */
export const updateVehicleStatus = async (vehicleId: string, status: VehicleStatus, reason?: string): Promise<Vehicle> => {
  const response = await api.patch(`/fleet/vehicles/${vehicleId}/status`, { status, reason })
  return response.data
}

/**
 * Update vehicle odometer
 * PATCH /fleet/vehicles/:id/odometer
 */
export const updateVehicleOdometer = async (vehicleId: string, odometer: number): Promise<Vehicle> => {
  const response = await api.patch(`/fleet/vehicles/${vehicleId}/odometer`, { odometer })
  return response.data
}

/**
 * Assign vehicle
 * POST /fleet/vehicles/:id/assign
 */
export const assignVehicle = async (
  vehicleId: string,
  data: {
    assignedToType: 'employee' | 'department' | 'pool'
    assignedToId?: string
    assignedToName?: string
    primaryDriverId?: string
  }
): Promise<Vehicle> => {
  const response = await api.post(`/fleet/vehicles/${vehicleId}/assign`, data)
  return response.data
}

/**
 * Unassign vehicle
 * POST /fleet/vehicles/:id/unassign
 */
export const unassignVehicle = async (vehicleId: string): Promise<Vehicle> => {
  const response = await api.post(`/fleet/vehicles/${vehicleId}/unassign`)
  return response.data
}

/**
 * Get available vehicles
 * GET /fleet/vehicles/available
 */
export const getAvailableVehicles = async (params?: {
  vehicleType?: VehicleType
  dateFrom?: string
  dateTo?: string
}): Promise<Vehicle[]> => {
  const queryParams = new URLSearchParams()
  if (params?.vehicleType) queryParams.append('vehicleType', params.vehicleType)
  if (params?.dateFrom) queryParams.append('dateFrom', params.dateFrom)
  if (params?.dateTo) queryParams.append('dateTo', params.dateTo)

  const response = await api.get(`/fleet/vehicles/available?${queryParams.toString()}`)
  return response.data
}

// ----- Fuel Logs -----

/**
 * Get fuel logs
 * GET /fleet/fuel-logs
 */
export const getFuelLogs = async (filters?: {
  vehicleId?: string
  driverId?: string
  dateFrom?: string
  dateTo?: string
  page?: number
  limit?: number
}): Promise<FuelLogResponse> => {
  const params = new URLSearchParams()
  if (filters?.vehicleId) params.append('vehicleId', filters.vehicleId)
  if (filters?.driverId) params.append('driverId', filters.driverId)
  if (filters?.dateFrom) params.append('dateFrom', filters.dateFrom)
  if (filters?.dateTo) params.append('dateTo', filters.dateTo)
  if (filters?.page) params.append('page', filters.page.toString())
  if (filters?.limit) params.append('limit', filters.limit.toString())

  const response = await api.get(`/fleet/fuel-logs?${params.toString()}`)
  return response.data
}

/**
 * Create fuel log
 * POST /fleet/fuel-logs
 */
export const createFuelLog = async (data: Partial<FuelLog>): Promise<FuelLog> => {
  const response = await api.post('/fleet/fuel-logs', data)
  return response.data
}

/**
 * Update fuel log
 * PATCH /fleet/fuel-logs/:id
 */
export const updateFuelLog = async (fuelLogId: string, data: Partial<FuelLog>): Promise<FuelLog> => {
  const response = await api.patch(`/fleet/fuel-logs/${fuelLogId}`, data)
  return response.data
}

/**
 * Delete fuel log
 * DELETE /fleet/fuel-logs/:id
 */
export const deleteFuelLog = async (fuelLogId: string): Promise<void> => {
  await api.delete(`/fleet/fuel-logs/${fuelLogId}`)
}

/**
 * Verify fuel log
 * POST /fleet/fuel-logs/:id/verify
 */
export const verifyFuelLog = async (fuelLogId: string): Promise<FuelLog> => {
  const response = await api.post(`/fleet/fuel-logs/${fuelLogId}/verify`)
  return response.data
}

/**
 * Get fuel report
 * GET /fleet/fuel-logs/report
 */
export const getFuelReport = async (params: {
  periodFrom: string
  periodTo: string
  vehicleId?: string
}): Promise<FuelReport> => {
  const queryParams = new URLSearchParams()
  queryParams.append('periodFrom', params.periodFrom)
  queryParams.append('periodTo', params.periodTo)
  if (params.vehicleId) queryParams.append('vehicleId', params.vehicleId)

  const response = await api.get(`/fleet/fuel-logs/report?${queryParams.toString()}`)
  return response.data
}

// ----- Trips -----

/**
 * Get trips
 * GET /fleet/trips
 */
export const getTrips = async (filters?: TripFilters): Promise<TripResponse> => {
  const params = new URLSearchParams()
  if (filters?.vehicleId) params.append('vehicleId', filters.vehicleId)
  if (filters?.driverId) params.append('driverId', filters.driverId)
  if (filters?.status) params.append('status', filters.status)
  if (filters?.tripType) params.append('tripType', filters.tripType)
  if (filters?.dateFrom) params.append('dateFrom', filters.dateFrom)
  if (filters?.dateTo) params.append('dateTo', filters.dateTo)
  if (filters?.search) params.append('search', filters.search)
  if (filters?.page) params.append('page', filters.page.toString())
  if (filters?.limit) params.append('limit', filters.limit.toString())

  const response = await api.get(`/fleet/trips?${params.toString()}`)
  return response.data
}

/**
 * Get single trip
 * GET /fleet/trips/:id
 */
export const getTrip = async (tripId: string): Promise<Trip> => {
  const response = await api.get(`/fleet/trips/${tripId}`)
  return response.data
}

/**
 * Create trip
 * POST /fleet/trips
 */
export const createTrip = async (data: Partial<Trip>): Promise<Trip> => {
  const response = await api.post('/fleet/trips', data)
  return response.data
}

/**
 * Update trip
 * PATCH /fleet/trips/:id
 */
export const updateTrip = async (tripId: string, data: Partial<Trip>): Promise<Trip> => {
  const response = await api.patch(`/fleet/trips/${tripId}`, data)
  return response.data
}

/**
 * Start trip
 * POST /fleet/trips/:id/start
 */
export const startTrip = async (tripId: string, startOdometer: number): Promise<Trip> => {
  const response = await api.post(`/fleet/trips/${tripId}/start`, { startOdometer })
  return response.data
}

/**
 * Complete trip
 * POST /fleet/trips/:id/complete
 */
export const completeTrip = async (
  tripId: string,
  data: {
    endOdometer: number
    fuelCost?: number
    tollCost?: number
    parkingCost?: number
    otherCosts?: number
    driverNotes?: string
  }
): Promise<Trip> => {
  const response = await api.post(`/fleet/trips/${tripId}/complete`, data)
  return response.data
}

/**
 * Cancel trip
 * POST /fleet/trips/:id/cancel
 */
export const cancelTrip = async (tripId: string, reason: string): Promise<Trip> => {
  const response = await api.post(`/fleet/trips/${tripId}/cancel`, { reason })
  return response.data
}

/**
 * Approve trip
 * POST /fleet/trips/:id/approve
 */
export const approveTrip = async (tripId: string): Promise<Trip> => {
  const response = await api.post(`/fleet/trips/${tripId}/approve`)
  return response.data
}

/**
 * Reject trip
 * POST /fleet/trips/:id/reject
 */
export const rejectTrip = async (tripId: string, reason: string): Promise<Trip> => {
  const response = await api.post(`/fleet/trips/${tripId}/reject`, { reason })
  return response.data
}

// ----- Incidents -----

/**
 * Get incidents
 * GET /fleet/incidents
 */
export const getIncidents = async (filters?: {
  vehicleId?: string
  driverId?: string
  incidentType?: IncidentType
  severity?: IncidentSeverity
  status?: Incident['status']
  dateFrom?: string
  dateTo?: string
  page?: number
  limit?: number
}): Promise<IncidentResponse> => {
  const params = new URLSearchParams()
  if (filters?.vehicleId) params.append('vehicleId', filters.vehicleId)
  if (filters?.driverId) params.append('driverId', filters.driverId)
  if (filters?.incidentType) params.append('incidentType', filters.incidentType)
  if (filters?.severity) params.append('severity', filters.severity)
  if (filters?.status) params.append('status', filters.status)
  if (filters?.dateFrom) params.append('dateFrom', filters.dateFrom)
  if (filters?.dateTo) params.append('dateTo', filters.dateTo)
  if (filters?.page) params.append('page', filters.page.toString())
  if (filters?.limit) params.append('limit', filters.limit.toString())

  const response = await api.get(`/fleet/incidents?${params.toString()}`)
  return response.data
}

/**
 * Get single incident
 * GET /fleet/incidents/:id
 */
export const getIncident = async (incidentId: string): Promise<Incident> => {
  const response = await api.get(`/fleet/incidents/${incidentId}`)
  return response.data
}

/**
 * Create incident
 * POST /fleet/incidents
 */
export const createIncident = async (data: Partial<Incident>): Promise<Incident> => {
  const response = await api.post('/fleet/incidents', data)
  return response.data
}

/**
 * Update incident
 * PATCH /fleet/incidents/:id
 */
export const updateIncident = async (incidentId: string, data: Partial<Incident>): Promise<Incident> => {
  const response = await api.patch(`/fleet/incidents/${incidentId}`, data)
  return response.data
}

/**
 * Resolve incident
 * POST /fleet/incidents/:id/resolve
 */
export const resolveIncident = async (incidentId: string, resolution: string): Promise<Incident> => {
  const response = await api.post(`/fleet/incidents/${incidentId}/resolve`, { resolution })
  return response.data
}

/**
 * Close incident
 * POST /fleet/incidents/:id/close
 */
export const closeIncident = async (incidentId: string): Promise<Incident> => {
  const response = await api.post(`/fleet/incidents/${incidentId}/close`)
  return response.data
}

// ----- Drivers -----

/**
 * Get drivers
 * GET /fleet/drivers
 */
export const getDrivers = async (filters?: {
  status?: Driver['status']
  isAvailable?: boolean
  licenseExpiring?: boolean
  search?: string
  page?: number
  limit?: number
}): Promise<DriverResponse> => {
  const params = new URLSearchParams()
  if (filters?.status) params.append('status', filters.status)
  if (filters?.isAvailable !== undefined) params.append('isAvailable', filters.isAvailable.toString())
  if (filters?.licenseExpiring !== undefined) params.append('licenseExpiring', filters.licenseExpiring.toString())
  if (filters?.search) params.append('search', filters.search)
  if (filters?.page) params.append('page', filters.page.toString())
  if (filters?.limit) params.append('limit', filters.limit.toString())

  const response = await api.get(`/fleet/drivers?${params.toString()}`)
  return response.data
}

/**
 * Get single driver
 * GET /fleet/drivers/:id
 */
export const getDriver = async (driverId: string): Promise<Driver> => {
  const response = await api.get(`/fleet/drivers/${driverId}`)
  return response.data
}

/**
 * Create driver
 * POST /fleet/drivers
 */
export const createDriver = async (data: Partial<Driver>): Promise<Driver> => {
  const response = await api.post('/fleet/drivers', data)
  return response.data
}

/**
 * Update driver
 * PATCH /fleet/drivers/:id
 */
export const updateDriver = async (driverId: string, data: Partial<Driver>): Promise<Driver> => {
  const response = await api.patch(`/fleet/drivers/${driverId}`, data)
  return response.data
}

/**
 * Update driver status
 * PATCH /fleet/drivers/:id/status
 */
export const updateDriverStatus = async (
  driverId: string,
  status: Driver['status'],
  reason?: string
): Promise<Driver> => {
  const response = await api.patch(`/fleet/drivers/${driverId}/status`, { status, reason })
  return response.data
}

/**
 * Assign vehicle to driver
 * POST /fleet/drivers/:id/assign-vehicle
 */
export const assignVehicleToDriver = async (
  driverId: string,
  vehicleId: string,
  isPrimary?: boolean
): Promise<Driver> => {
  const response = await api.post(`/fleet/drivers/${driverId}/assign-vehicle`, { vehicleId, isPrimary })
  return response.data
}

/**
 * Unassign vehicle from driver
 * POST /fleet/drivers/:id/unassign-vehicle
 */
export const unassignVehicleFromDriver = async (driverId: string, vehicleId: string): Promise<Driver> => {
  const response = await api.post(`/fleet/drivers/${driverId}/unassign-vehicle`, { vehicleId })
  return response.data
}

/**
 * Get available drivers
 * GET /fleet/drivers/available
 */
export const getAvailableDrivers = async (): Promise<Driver[]> => {
  const response = await api.get('/fleet/drivers/available')
  return response.data
}

// ----- Statistics & Reports -----

/**
 * Get fleet statistics
 * GET /fleet/stats
 */
export const getFleetStats = async (): Promise<FleetStatistics> => {
  const response = await api.get('/fleet/stats')
  return response.data
}

/**
 * Get vehicle history
 * GET /fleet/vehicles/:id/history
 */
export const getVehicleHistory = async (vehicleId: string): Promise<{
  trips: Trip[]
  fuelLogs: FuelLog[]
  incidents: Incident[]
  maintenanceRecords: Vehicle['maintenance']['schedules']
}> => {
  const response = await api.get(`/fleet/vehicles/${vehicleId}/history`)
  return response.data
}

/**
 * Get driver history
 * GET /fleet/drivers/:id/history
 */
export const getDriverHistory = async (driverId: string): Promise<{
  trips: Trip[]
  incidents: Incident[]
  violations: Array<{ date: string; type: string; description: string }>
}> => {
  const response = await api.get(`/fleet/drivers/${driverId}/history`)
  return response.data
}

/**
 * Export fleet data
 * GET /fleet/export
 */
export const exportFleetData = async (params: {
  type: 'vehicles' | 'trips' | 'fuel' | 'incidents' | 'drivers'
  format?: 'excel' | 'pdf'
  dateFrom?: string
  dateTo?: string
}): Promise<Blob> => {
  const queryParams = new URLSearchParams()
  queryParams.append('type', params.type)
  if (params.format) queryParams.append('format', params.format)
  if (params.dateFrom) queryParams.append('dateFrom', params.dateFrom)
  if (params.dateTo) queryParams.append('dateTo', params.dateTo)

  const response = await api.get(`/fleet/export?${queryParams.toString()}`, {
    responseType: 'blob',
  })
  return response.data
}

// ==================== DEFAULT EXPORT ====================

const fleetService = {
  // Vehicles
  getVehicles,
  getVehicle,
  createVehicle,
  updateVehicle,
  deleteVehicle,
  updateVehicleStatus,
  updateVehicleOdometer,
  assignVehicle,
  unassignVehicle,
  getAvailableVehicles,
  getVehicleHistory,

  // Fuel Logs
  getFuelLogs,
  createFuelLog,
  updateFuelLog,
  deleteFuelLog,
  verifyFuelLog,
  getFuelReport,

  // Trips
  getTrips,
  getTrip,
  createTrip,
  updateTrip,
  startTrip,
  completeTrip,
  cancelTrip,
  approveTrip,
  rejectTrip,

  // Incidents
  getIncidents,
  getIncident,
  createIncident,
  updateIncident,
  resolveIncident,
  closeIncident,

  // Drivers
  getDrivers,
  getDriver,
  createDriver,
  updateDriver,
  updateDriverStatus,
  assignVehicleToDriver,
  unassignVehicleFromDriver,
  getAvailableDrivers,
  getDriverHistory,

  // Statistics & Reports
  getFleetStats,
  exportFleetData,

  // Labels
  VEHICLE_STATUS_LABELS,
  VEHICLE_TYPE_LABELS,
  FUEL_TYPE_LABELS,
  TRIP_STATUS_LABELS,
  INCIDENT_SEVERITY_LABELS,
  INCIDENT_TYPE_LABELS,
}

export default fleetService
