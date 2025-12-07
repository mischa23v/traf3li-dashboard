import api from './api'

// ==================== TYPES & ENUMS ====================

// Asset Type
export type AssetType = 'laptop' | 'desktop' | 'mobile_phone' | 'tablet' | 'monitor' |
  'keyboard' | 'mouse' | 'headset' | 'printer' | 'scanner' |
  'vehicle' | 'access_card' | 'id_badge' | 'keys' | 'uniform' |
  'tools' | 'equipment' | 'furniture' | 'books' | 'software_license' | 'other'

// Asset Category
export type AssetCategory = 'IT_equipment' | 'office_equipment' | 'vehicle' |
  'security_items' | 'tools' | 'furniture' | 'mobile_devices' |
  'software' | 'other'

// Asset Status
export type AssetStatus = 'assigned' | 'in_use' | 'returned' | 'lost' | 'damaged' |
  'maintenance' | 'repair' | 'retired' | 'available'

// Assignment Type
export type AssignmentType = 'permanent' | 'temporary' | 'project_based' | 'pool'

// Condition
export type AssetCondition = 'new' | 'excellent' | 'good' | 'fair' | 'poor' | 'damaged' | 'not_functional'

// Ownership
export type OwnershipType = 'company_owned' | 'leased' | 'rented' | 'employee_owned_reimbursed'

// Request Reason
export type RequestReason = 'new_hire' | 'replacement' | 'upgrade' | 'additional' |
  'temporary_need' | 'project' | 'business_requirement'

// Return Reason
export type ReturnReason = 'resignation' | 'termination' | 'upgrade' | 'project_end' |
  'replacement' | 'no_longer_needed' | 'defective' | 'lease_end'

// Incident Type
export type IncidentType = 'loss' | 'theft' | 'damage' | 'malfunction' | 'data_breach' |
  'unauthorized_access' | 'misuse' | 'accident'

// ==================== LABELS ====================

export const ASSET_TYPE_LABELS: Record<AssetType, { ar: string; en: string; icon: string; color: string }> = {
  laptop: { ar: 'حاسب محمول', en: 'Laptop', icon: 'Laptop', color: 'blue' },
  desktop: { ar: 'حاسب مكتبي', en: 'Desktop', icon: 'Monitor', color: 'slate' },
  mobile_phone: { ar: 'هاتف جوال', en: 'Mobile Phone', icon: 'Smartphone', color: 'purple' },
  tablet: { ar: 'جهاز لوحي', en: 'Tablet', icon: 'Tablet', color: 'indigo' },
  monitor: { ar: 'شاشة', en: 'Monitor', icon: 'Monitor', color: 'gray' },
  keyboard: { ar: 'لوحة مفاتيح', en: 'Keyboard', icon: 'Keyboard', color: 'slate' },
  mouse: { ar: 'فأرة', en: 'Mouse', icon: 'Mouse', color: 'slate' },
  headset: { ar: 'سماعة رأس', en: 'Headset', icon: 'Headphones', color: 'pink' },
  printer: { ar: 'طابعة', en: 'Printer', icon: 'Printer', color: 'orange' },
  scanner: { ar: 'ماسح ضوئي', en: 'Scanner', icon: 'ScanLine', color: 'teal' },
  vehicle: { ar: 'مركبة', en: 'Vehicle', icon: 'Car', color: 'emerald' },
  access_card: { ar: 'بطاقة دخول', en: 'Access Card', icon: 'CreditCard', color: 'amber' },
  id_badge: { ar: 'بطاقة هوية', en: 'ID Badge', icon: 'IdCard', color: 'cyan' },
  keys: { ar: 'مفاتيح', en: 'Keys', icon: 'Key', color: 'yellow' },
  uniform: { ar: 'زي موحد', en: 'Uniform', icon: 'Shirt', color: 'violet' },
  tools: { ar: 'أدوات', en: 'Tools', icon: 'Wrench', color: 'red' },
  equipment: { ar: 'معدات', en: 'Equipment', icon: 'Settings', color: 'slate' },
  furniture: { ar: 'أثاث', en: 'Furniture', icon: 'Armchair', color: 'brown' },
  books: { ar: 'كتب', en: 'Books', icon: 'BookOpen', color: 'emerald' },
  software_license: { ar: 'ترخيص برمجي', en: 'Software License', icon: 'FileCode', color: 'blue' },
  other: { ar: 'أخرى', en: 'Other', icon: 'Package', color: 'gray' },
}

export const ASSET_CATEGORY_LABELS: Record<AssetCategory, { ar: string; en: string; color: string }> = {
  IT_equipment: { ar: 'معدات تقنية', en: 'IT Equipment', color: 'blue' },
  office_equipment: { ar: 'معدات مكتبية', en: 'Office Equipment', color: 'slate' },
  vehicle: { ar: 'مركبات', en: 'Vehicles', color: 'emerald' },
  security_items: { ar: 'عناصر أمنية', en: 'Security Items', color: 'red' },
  tools: { ar: 'أدوات', en: 'Tools', color: 'orange' },
  furniture: { ar: 'أثاث', en: 'Furniture', color: 'amber' },
  mobile_devices: { ar: 'أجهزة محمولة', en: 'Mobile Devices', color: 'purple' },
  software: { ar: 'برمجيات', en: 'Software', color: 'indigo' },
  other: { ar: 'أخرى', en: 'Other', color: 'gray' },
}

export const ASSET_STATUS_LABELS: Record<AssetStatus, { ar: string; en: string; color: string }> = {
  assigned: { ar: 'مُخصص', en: 'Assigned', color: 'blue' },
  in_use: { ar: 'قيد الاستخدام', en: 'In Use', color: 'emerald' },
  returned: { ar: 'مُرجع', en: 'Returned', color: 'slate' },
  lost: { ar: 'مفقود', en: 'Lost', color: 'red' },
  damaged: { ar: 'تالف', en: 'Damaged', color: 'orange' },
  maintenance: { ar: 'صيانة', en: 'Maintenance', color: 'amber' },
  repair: { ar: 'إصلاح', en: 'Repair', color: 'yellow' },
  retired: { ar: 'متقاعد', en: 'Retired', color: 'gray' },
  available: { ar: 'متاح', en: 'Available', color: 'teal' },
}

export const ASSIGNMENT_TYPE_LABELS: Record<AssignmentType, { ar: string; en: string }> = {
  permanent: { ar: 'دائم', en: 'Permanent' },
  temporary: { ar: 'مؤقت', en: 'Temporary' },
  project_based: { ar: 'مرتبط بمشروع', en: 'Project Based' },
  pool: { ar: 'مشترك', en: 'Pool' },
}

export const CONDITION_LABELS: Record<AssetCondition, { ar: string; en: string; color: string }> = {
  new: { ar: 'جديد', en: 'New', color: 'emerald' },
  excellent: { ar: 'ممتاز', en: 'Excellent', color: 'blue' },
  good: { ar: 'جيد', en: 'Good', color: 'teal' },
  fair: { ar: 'مقبول', en: 'Fair', color: 'amber' },
  poor: { ar: 'ضعيف', en: 'Poor', color: 'orange' },
  damaged: { ar: 'تالف', en: 'Damaged', color: 'red' },
  not_functional: { ar: 'غير صالح', en: 'Not Functional', color: 'gray' },
}

export const OWNERSHIP_LABELS: Record<OwnershipType, { ar: string; en: string }> = {
  company_owned: { ar: 'ملك الشركة', en: 'Company Owned' },
  leased: { ar: 'مستأجر', en: 'Leased' },
  rented: { ar: 'مؤجر', en: 'Rented' },
  employee_owned_reimbursed: { ar: 'ملك الموظف (معوض)', en: 'Employee Owned (Reimbursed)' },
}

export const REQUEST_REASON_LABELS: Record<RequestReason, { ar: string; en: string }> = {
  new_hire: { ar: 'موظف جديد', en: 'New Hire' },
  replacement: { ar: 'استبدال', en: 'Replacement' },
  upgrade: { ar: 'ترقية', en: 'Upgrade' },
  additional: { ar: 'إضافي', en: 'Additional' },
  temporary_need: { ar: 'حاجة مؤقتة', en: 'Temporary Need' },
  project: { ar: 'مشروع', en: 'Project' },
  business_requirement: { ar: 'متطلب عمل', en: 'Business Requirement' },
}

export const INCIDENT_TYPE_LABELS: Record<IncidentType, { ar: string; en: string; color: string }> = {
  loss: { ar: 'فقدان', en: 'Loss', color: 'red' },
  theft: { ar: 'سرقة', en: 'Theft', color: 'red' },
  damage: { ar: 'تلف', en: 'Damage', color: 'orange' },
  malfunction: { ar: 'خلل', en: 'Malfunction', color: 'amber' },
  data_breach: { ar: 'اختراق بيانات', en: 'Data Breach', color: 'purple' },
  unauthorized_access: { ar: 'وصول غير مصرح', en: 'Unauthorized Access', color: 'indigo' },
  misuse: { ar: 'سوء استخدام', en: 'Misuse', color: 'yellow' },
  accident: { ar: 'حادث', en: 'Accident', color: 'slate' },
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

// Warranty
export interface AssetWarranty {
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

// Insurance
export interface AssetInsurance {
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

// Specifications
export interface AssetSpecifications {
  processor?: string
  ram?: string
  storage?: string
  screenSize?: string
  operatingSystem?: string
  imei?: string
  phoneNumber?: string
  simCardNumber?: string
  dataAllowance?: string
  vehicleMake?: string
  vehicleModel?: string
  vehicleYear?: number
  licensePlate?: string
  chassisNumber?: string
  engineNumber?: string
  color?: string
  size?: string
  capacity?: string
  customSpecs?: Array<{
    specName: string
    specValue: string
  }>
}

// Handover
export interface AssetHandover {
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

// Acknowledgment
export interface AssetAcknowledgment {
  acknowledged: boolean
  acknowledgmentDate?: string
  acknowledgmentMethod: 'digital_signature' | 'physical_signature' | 'email_confirmation' | 'system_acceptance'
  acknowledgedTerms: Array<{
    term: string
    termAr?: string
    accepted: boolean
  }>
  signature?: string
  signatureUrl?: string
  witnessName?: string
  witnessSignature?: string
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
  mileageAtMaintenance?: number
  partsReplaced?: Array<{
    partName: string
    partNumber?: string
    quantity: number
    cost?: number
  }>
  laborCost?: number
  totalCost?: number
  downtime?: number
  warranty?: {
    underWarranty: boolean
    coveragePercentage?: number
  }
  nextServiceDue?: string
  invoiceNumber?: string
  invoiceUrl?: string
  maintenanceReport?: string
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
  assessment?: {
    assessedDate: string
    assessedBy: string
    diagnosis: string
    repairEstimate: number
    repairRecommendation: 'repair' | 'replace' | 'write_off'
    repairTimeEstimate?: number
  }
  approvalRequired: boolean
  approved?: boolean
  approvedBy?: string
  approvalDate?: string
  repairStartDate?: string
  repairCompletionDate?: string
  repairedBy?: string
  vendorName?: string
  workOrder?: string
  partsUsed?: Array<{
    partName: string
    partNumber?: string
    quantity: number
    cost?: number
  }>
  laborCost?: number
  totalRepairCost?: number
  employeeCharge?: {
    chargeAmount: number
    deductedFromSalary: boolean
    deductionDate?: string
    paymentPlan?: {
      installments: number
      installmentAmount: number
    }
    paid: boolean
    paymentDate?: string
  }
  assetFunctional: boolean
  invoiceNumber?: string
  invoiceUrl?: string
  repairReport?: string
  photos?: string[]
  notes?: string
}

// Incident
export interface AssetIncident {
  incidentId: string
  incidentType: IncidentType
  incidentDate: string
  reportedDate: string
  reportedBy: string
  incidentDescription: string
  location?: string
  circumstances: {
    howItHappened?: string
    witnessPresent: boolean
    witnesses?: Array<{
      witnessName: string
      witnessContact?: string
      statement?: string
    }>
    policeReportFiled?: boolean
    policeReportNumber?: string
    policeStation?: string
    cctv?: {
      cctvAvailable: boolean
      cctvReviewed?: boolean
      cctvFootage?: string
    }
  }
  investigation?: {
    conducted: boolean
    investigatedBy: string
    investigationDate?: string
    findings: string
    rootCause?: string
    employeeFault: boolean
    faultPercentage?: number
    investigationReport?: string
  }
  impact: {
    severity: 'minor' | 'moderate' | 'major' | 'critical'
    assetRecoverable: boolean
    dataLoss: boolean
    dataType?: string
    businessImpact?: string
    financialLoss?: number
    reputationalImpact?: boolean
  }
  insuranceClaim?: {
    claimFiled: boolean
    claimDate?: string
    claimNumber?: string
    claimAmount: number
    claimStatus: 'pending' | 'approved' | 'rejected' | 'settled'
    approvedAmount?: number
    deductiblePaid?: number
    settlementDate?: string
    settlementAmount?: number
    claimDocuments?: string[]
  }
  liability: {
    employeeLiable: boolean
    liabilityAmount?: number
    recoveryMethod?: 'salary_deduction' | 'payment_plan' | 'insurance' | 'write_off' | 'legal_action'
    recovered: boolean
    recoveryAmount?: number
    recoveryDate?: string
  }
  resolution: {
    resolved: boolean
    resolutionDate?: string
    resolutionAction: 'asset_recovered' | 'asset_replaced' | 'asset_repaired' | 'insurance_settled' | 'employee_charged' | 'written_off'
    replacementAssetId?: string
    lessonsLearned?: string
    preventiveMeasures?: string[]
  }
  disciplinaryAction?: {
    actionTaken: boolean
    actionType: 'verbal_warning' | 'written_warning' | 'suspension' | 'termination' | 'legal_action'
    violationCode?: string
    actionDate?: string
    actionDetails?: string
  }
  incidentReport?: string
  photos?: string[]
  notes?: string
}

// Return Inspection
export interface ReturnInspection {
  inspected: boolean
  inspectionDate?: string
  inspectedBy?: string
  conditionAtReturn: AssetCondition
  damageAssessment?: {
    hasDamage: boolean
    damages: Array<{
      damageType: string
      description: string
      photos?: string[]
      repairCost?: number
    }>
    totalDamage: number
    beyondNormalWear: boolean
  }
  completenessCheck: {
    complete: boolean
    missingItems?: Array<{
      itemType: string
      description: string
      replacementCost: number
    }>
    totalMissing: number
  }
  dataCheck?: {
    dataWiped: boolean
    wipingMethod?: 'software' | 'physical_destruction'
    verificationCertificate?: string
    personalDataFound: boolean
    companyDataFound: boolean
    dataRecovered?: boolean
  }
  functionalityTest?: {
    tested: boolean
    functional: boolean
    issues?: string[]
    usableForReassignment: boolean
  }
  inspectionReport?: string
  inspectionPhotos?: string[]
  inspectionNotes?: string
}

// Return Process
export interface ReturnProcess {
  returnInitiated: boolean
  returnInitiatedDate?: string
  returnInitiatedBy: 'employee' | 'manager' | 'hr' | 'it' | 'system'
  returnReason: ReturnReason
  returnReasonDetails?: string
  returnDueDate: string
  returnReminders?: Array<{
    reminderDate: string
    reminderMethod: 'email' | 'sms' | 'system_notification'
    acknowledged?: boolean
  }>
  actualReturnDate?: string
  returnedBy?: string
  returnMethod: 'hand_delivery' | 'courier' | 'mail' | 'pickup'
  returnLocation?: string
  receivedBy?: string
  receivedByName?: string
  inspection: ReturnInspection
  returnCharges?: {
    hasCharges: boolean
    charges: Array<{
      chargeType: 'damage' | 'missing_item' | 'cleaning' | 'data_recovery' | 'late_return' | 'lost_asset'
      description: string
      amount: number
    }>
    totalCharges: number
    recoveryMethod: 'salary_deduction' | 'final_settlement' | 'payment' | 'waived'
    recovered: boolean
    recoveryAmount?: number
    recoveryDate?: string
    waived?: boolean
    waiverReason?: string
    waivedBy?: string
  }
  clearance: {
    cleared: boolean
    clearanceDate?: string
    clearanceBy?: string
    clearanceCertificate?: string
    outstandingIssues?: string[]
  }
  nextSteps: {
    assetStatus: 'available_for_reassignment' | 'needs_repair' | 'needs_maintenance' | 'retired' | 'disposed'
    reassignmentDate?: string
    retirementDate?: string
    retirementReason?: string
    disposalDate?: string
    disposalMethod?: 'sale' | 'donation' | 'recycling' | 'destruction'
  }
  returnCompleted: boolean
  returnCompletionDate?: string
}

// Main Asset Assignment Record
export interface AssetAssignment {
  _id: string
  assignmentId: string
  assignmentNumber: string

  // Asset
  assetId: string
  assetTag: string
  assetName: string
  assetNameAr?: string
  serialNumber?: string
  modelNumber?: string
  assetType: AssetType
  assetCategory: AssetCategory
  brand?: string
  model?: string
  specifications?: AssetSpecifications

  // Condition
  conditionAtAssignment: AssetCondition
  conditionNotes?: string
  photos?: Array<{
    photoType: 'asset' | 'serial_number' | 'damage' | 'accessories'
    photoUrl: string
    capturedDate: string
    notes?: string
  }>

  // Value
  purchasePrice?: number
  currentValue?: number
  currency?: string
  depreciationRate?: number
  warranty?: AssetWarranty
  insurance?: AssetInsurance
  ownership: OwnershipType

  // Employee
  employeeId: string
  employeeNumber: string
  employeeName: string
  employeeNameAr?: string
  department?: string
  jobTitle?: string
  email?: string
  phone?: string
  workType?: 'on_site' | 'remote' | 'hybrid' | 'field'
  managerId?: string
  managerName?: string

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

  // Handover & Acknowledgment
  handover?: AssetHandover
  acknowledgment?: AssetAcknowledgment

  // Status
  status: AssetStatus

  // Tracking
  currentLocation?: {
    locationType: 'office' | 'home' | 'field' | 'transit' | 'storage' | 'other'
    locationName: string
    building?: string
    floor?: string
    room?: string
    desk?: string
    coordinates?: {
      latitude: number
      longitude: number
      accuracy?: number
      timestamp: string
    }
    lastUpdated: string
  }
  locationHistory?: Array<{
    location: string
    movedOn: string
    movedBy?: string
    reason?: string
  }>

  // Maintenance & Repairs
  maintenanceSchedule?: {
    required: boolean
    maintenanceType: 'preventive' | 'periodic' | 'condition_based'
    frequency: 'daily' | 'weekly' | 'monthly' | 'quarterly' | 'annual' | 'mileage_based'
    maintenanceMileageInterval?: number
    lastMaintenanceDate?: string
    lastMaintenanceMileage?: number
    nextMaintenanceDue?: string
    nextMaintenanceMileage?: number
    overdue: boolean
    daysOverdue?: number
  }
  maintenanceHistory?: MaintenanceRecord[]
  repairs?: RepairRecord[]
  totalMaintenanceCost?: number
  totalRepairCost?: number

  // Incidents
  incidents?: AssetIncident[]

  // Software License (if applicable)
  softwareLicense?: {
    isSoftwareLicense: boolean
    licenseType: 'perpetual' | 'subscription' | 'concurrent' | 'named_user' | 'device'
    softwareName: string
    softwareVersion?: string
    vendor: string
    licenseKey?: string
    activationCode?: string
    licensedTo: string
    subscriptionStartDate?: string
    subscriptionEndDate?: string
    subscriptionDuration?: number
    autoRenew?: boolean
    renewalDate?: string
    renewalCost?: number
    installationsAllowed: number
    installationsUsed: number
    installedOn?: Array<{
      deviceId: string
      deviceName: string
      installDate: string
      activated: boolean
      activationDate?: string
      deactivated?: boolean
      deactivationDate?: string
    }>
    compliant: boolean
    complianceIssues?: string[]
    auditRequired: boolean
    lastAuditDate?: string
    nextAuditDue?: string
  }

  // Vehicle (if applicable)
  vehicleDetails?: {
    isVehicle: boolean
    vehicleType: 'car' | 'van' | 'truck' | 'motorcycle' | 'bus'
    make: string
    model: string
    year: number
    color: string
    licensePlate: string
    registrationNumber?: string
    chassisNumber: string
    engineNumber: string
    fuelType: 'petrol' | 'diesel' | 'hybrid' | 'electric'
    registration: {
      registeredOwner: string
      registrationDate: string
      registrationExpiry: string
      registrationDocument?: string
      renewalDue: boolean
      renewalCost?: number
    }
    insurance: {
      insuranceProvider: string
      policyNumber: string
      policyType: 'comprehensive' | 'third_party' | 'third_party_fire_theft'
      coverageAmount: number
      policyStartDate: string
      policyEndDate: string
      premium: number
      paymentFrequency?: 'annual' | 'semi_annual' | 'quarterly' | 'monthly'
      policyDocument?: string
      renewalDue: boolean
    }
    permittedDrivers: Array<{
      driverId: string
      driverName: string
      licenseNumber: string
      licenseExpiry: string
      licenseVerified: boolean
      authorizedDate: string
      restrictions?: string
    }>
    usageLimits?: {
      personalUseAllowed: boolean
      geographicLimits?: string[]
      mileageLimit?: number
      currentMileage: number
      fuelCard?: {
        provided: boolean
        cardNumber?: string
        monthlyLimit?: number
      }
    }
    trafficViolations?: Array<{
      violationDate: string
      violationType: string
      location: string
      fineAmount: number
      driverAtFault: string
      employeeLiable: boolean
      paid: boolean
      paidBy?: 'company' | 'employee'
      receiptUrl?: string
      points?: number
    }>
  }

  // Return Process
  returnProcess?: ReturnProcess

  // Transfers
  transfers?: Array<{
    transferId: string
    transferType: 'employee_transfer' | 'department_transfer' | 'location_transfer' | 'temporary_reassignment'
    transferDate: string
    transferFrom: {
      employeeId?: string
      department?: string
      location?: string
    }
    transferTo: {
      employeeId?: string
      department?: string
      location?: string
    }
    transferReason: string
    temporary: boolean
    expectedReturnDate?: string
    approvedBy?: string
    approvalDate?: string
    transferCompleted: boolean
    notes?: string
  }>

  // Disposal
  disposal?: {
    retired: boolean
    retirementDate?: string
    retirementReason: 'end_of_life' | 'obsolete' | 'damaged_beyond_repair' | 'upgrade' | 'lease_end' | 'cost_ineffective'
    retirementApproved: boolean
    approvedBy?: string
    approvalDate?: string
    bookValue?: number
    disposalMethod: 'sale' | 'donation' | 'recycling' | 'trade_in' | 'return_to_vendor' | 'destruction' | 'storage'
    disposalDate?: string
    sale?: {
      soldTo: string
      salePrice: number
      saleDate: string
      saleReceipt?: string
      profit?: number
      loss?: number
    }
    donation?: {
      donatedTo: string
      donationValue: number
      donationDate: string
      taxDeductible: boolean
      donationReceipt?: string
    }
    dataDestruction?: {
      required: boolean
      destructionMethod: 'software_wipe' | 'degaussing' | 'physical_destruction' | 'shredding'
      destructionDate?: string
      certificateOfDestruction?: string
      witnessedBy?: string
    }
    disposalDocument?: string
    notes?: string
  }

  // Notes
  notes?: {
    employeeNotes?: string
    itNotes?: string
    adminNotes?: string
    maintenanceNotes?: string
    internalNotes?: string
    specialInstructions?: string
  }

  // Analytics
  analytics?: {
    assignmentDuration: number
    utilizationRate?: number
    totalCostOfOwnership: number
    costPerDay?: number
    maintenanceCostPercentage?: number
    uptimePercentage?: number
    meanTimeBetweenFailures?: number
  }

  // Audit
  createdOn: string
  createdBy: string
  lastModifiedOn?: string
  lastModifiedBy?: string
}

// Create Asset Assignment Data
export interface CreateAssetAssignmentData {
  assetId?: string
  assetTag: string
  assetName: string
  assetNameAr?: string
  serialNumber?: string
  modelNumber?: string
  assetType: AssetType
  assetCategory: AssetCategory
  brand?: string
  model?: string
  specifications?: Partial<AssetSpecifications>
  conditionAtAssignment: AssetCondition
  conditionNotes?: string
  purchasePrice?: number
  currentValue?: number
  currency?: string
  ownership: OwnershipType
  warranty?: Partial<AssetWarranty>
  insurance?: Partial<AssetInsurance>
  employeeId: string
  employeeName: string
  employeeNameAr?: string
  employeeNumber?: string
  department?: string
  jobTitle?: string
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
    mobileAsset?: boolean
    homeUseAllowed?: boolean
    internationalTravelAllowed?: boolean
  }
  accessories?: AssetAccessory[]
  softwareLicense?: Partial<AssetAssignment['softwareLicense']>
  vehicleDetails?: Partial<AssetAssignment['vehicleDetails']>
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
  conditionNotes?: string
  currentValue?: number
  warranty?: Partial<AssetWarranty>
  insurance?: Partial<AssetInsurance>
  assignmentType?: AssignmentType
  expectedReturnDate?: string
  assignmentPurpose?: string
  assignmentLocation?: {
    primaryLocation?: string
    mobileAsset?: boolean
    homeUseAllowed?: boolean
  }
  status?: AssetStatus
  currentLocation?: {
    locationType: 'office' | 'home' | 'field' | 'transit' | 'storage' | 'other'
    locationName: string
    building?: string
    floor?: string
    room?: string
  }
  notes?: {
    employeeNotes?: string
    itNotes?: string
    adminNotes?: string
    maintenanceNotes?: string
    specialInstructions?: string
  }
}

// Filters
export interface AssetFilters {
  status?: AssetStatus
  assetType?: AssetType
  assetCategory?: AssetCategory
  department?: string
  employeeId?: string
  ownership?: OwnershipType
  assignmentType?: AssignmentType
  conditionAtAssignment?: AssetCondition
  warrantyExpired?: boolean
  maintenanceOverdue?: boolean
  dateFrom?: string
  dateTo?: string
  search?: string
  page?: number
  limit?: number
}

// Response
export interface AssetResponse {
  data: AssetAssignment[]
  pagination: {
    total: number
    page: number
    limit: number
    pages: number
  }
}

// Stats
export interface AssetStats {
  totalAssets: number
  totalAssigned: number
  totalAvailable: number
  totalInMaintenance: number
  totalLostDamaged: number
  byType: Array<{ assetType: AssetType; count: number }>
  byCategory: Array<{ category: AssetCategory; count: number }>
  byStatus: Array<{ status: AssetStatus; count: number }>
  byDepartment: Array<{ department: string; count: number }>
  totalValue: number
  warrantyExpiringSoon: number
  maintenanceOverdue: number
  insuranceExpiringSoon: number
  pendingReturns: number
  thisMonth: {
    assigned: number
    returned: number
    incidents: number
    maintenanceCost: number
  }
}

// ==================== API FUNCTIONS ====================

// Get all asset assignments
export const getAssets = async (filters?: AssetFilters): Promise<AssetResponse> => {
  const params = new URLSearchParams()
  if (filters?.status) params.append('status', filters.status)
  if (filters?.assetType) params.append('assetType', filters.assetType)
  if (filters?.assetCategory) params.append('assetCategory', filters.assetCategory)
  if (filters?.department) params.append('department', filters.department)
  if (filters?.employeeId) params.append('employeeId', filters.employeeId)
  if (filters?.ownership) params.append('ownership', filters.ownership)
  if (filters?.assignmentType) params.append('assignmentType', filters.assignmentType)
  if (filters?.conditionAtAssignment) params.append('conditionAtAssignment', filters.conditionAtAssignment)
  if (filters?.warrantyExpired !== undefined) params.append('warrantyExpired', filters.warrantyExpired.toString())
  if (filters?.maintenanceOverdue !== undefined) params.append('maintenanceOverdue', filters.maintenanceOverdue.toString())
  if (filters?.dateFrom) params.append('dateFrom', filters.dateFrom)
  if (filters?.dateTo) params.append('dateTo', filters.dateTo)
  if (filters?.search) params.append('search', filters.search)
  if (filters?.page) params.append('page', filters.page.toString())
  if (filters?.limit) params.append('limit', filters.limit.toString())

  const response = await api.get(`/hr/assets?${params.toString()}`)
  return response.data
}

// Get single asset assignment
export const getAsset = async (assignmentId: string): Promise<AssetAssignment> => {
  const response = await api.get(`/hr/assets/${assignmentId}`)
  return response.data
}

// Create asset assignment
export const createAsset = async (data: CreateAssetAssignmentData): Promise<AssetAssignment> => {
  const response = await api.post('/hr/assets', data)
  return response.data
}

// Update asset assignment
export const updateAsset = async (assignmentId: string, data: UpdateAssetAssignmentData): Promise<AssetAssignment> => {
  const response = await api.patch(`/hr/assets/${assignmentId}`, data)
  return response.data
}

// Delete asset assignment
export const deleteAsset = async (assignmentId: string): Promise<void> => {
  await api.delete(`/hr/assets/${assignmentId}`)
}

// Get asset stats
export const getAssetStats = async (): Promise<AssetStats> => {
  const response = await api.get('/hr/assets/stats')
  return response.data
}

// Record handover
export const recordHandover = async (assignmentId: string, data: {
  handedOverBy: string
  handoverDate: string
  handoverMethod: 'in_person' | 'courier' | 'mail'
  handoverLocation?: string
  accessories?: AssetAccessory[]
  handoverChecklist?: Array<{ item: string; checked: boolean; notes?: string }>
  employeeSignature?: string
}): Promise<AssetAssignment> => {
  const response = await api.post(`/hr/assets/${assignmentId}/handover`, data)
  return response.data
}

// Record acknowledgment
export const recordAcknowledgment = async (assignmentId: string, data: {
  acknowledgmentMethod: 'digital_signature' | 'physical_signature' | 'email_confirmation' | 'system_acceptance'
  signature?: string
  termsAccepted: string[]
}): Promise<AssetAssignment> => {
  const response = await api.post(`/hr/assets/${assignmentId}/acknowledgment`, data)
  return response.data
}

// Update location
export const updateAssetLocation = async (assignmentId: string, data: {
  locationType: 'office' | 'home' | 'field' | 'transit' | 'storage' | 'other'
  locationName: string
  building?: string
  floor?: string
  room?: string
  coordinates?: { latitude: number; longitude: number }
  reason?: string
}): Promise<AssetAssignment> => {
  const response = await api.post(`/hr/assets/${assignmentId}/location`, data)
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
  partsReplaced?: Array<{ partName: string; partNumber?: string; quantity: number; cost?: number }>
  laborCost?: number
  totalCost?: number
  downtime?: number
  nextServiceDue?: string
  notes?: string
}): Promise<AssetAssignment> => {
  const response = await api.post(`/hr/assets/${assignmentId}/maintenance`, data)
  return response.data
}

// Report repair
export const reportRepair = async (assignmentId: string, data: {
  issueDescription: string
  severity: 'minor' | 'moderate' | 'major' | 'critical'
  causeOfDamage?: 'normal_wear' | 'accident' | 'misuse' | 'manufacturing_defect' | 'external_factors' | 'unknown'
  photos?: string[]
}): Promise<AssetAssignment> => {
  const response = await api.post(`/hr/assets/${assignmentId}/repairs`, data)
  return response.data
}

// Update repair status
export const updateRepairStatus = async (assignmentId: string, repairId: string, data: {
  repairStatus: 'assessed' | 'approved' | 'in_progress' | 'completed' | 'unrepairable'
  assessment?: {
    diagnosis: string
    repairEstimate: number
    repairRecommendation: 'repair' | 'replace' | 'write_off'
    repairTimeEstimate?: number
  }
  approved?: boolean
  approvedBy?: string
  repairedBy?: string
  vendorName?: string
  partsUsed?: Array<{ partName: string; quantity: number; cost?: number }>
  laborCost?: number
  totalRepairCost?: number
  assetFunctional?: boolean
  notes?: string
}): Promise<AssetAssignment> => {
  const response = await api.patch(`/hr/assets/${assignmentId}/repairs/${repairId}`, data)
  return response.data
}

// Report incident
export const reportIncident = async (assignmentId: string, data: {
  incidentType: IncidentType
  incidentDate: string
  incidentDescription: string
  location?: string
  circumstances: {
    howItHappened?: string
    witnessPresent: boolean
    witnesses?: Array<{ witnessName: string; witnessContact?: string }>
    policeReportFiled?: boolean
    policeReportNumber?: string
  }
  photos?: string[]
}): Promise<AssetAssignment> => {
  const response = await api.post(`/hr/assets/${assignmentId}/incidents`, data)
  return response.data
}

// Initiate return
export const initiateReturn = async (assignmentId: string, data: {
  returnReason: ReturnReason
  returnReasonDetails?: string
  returnDueDate: string
  returnMethod: 'hand_delivery' | 'courier' | 'mail' | 'pickup'
  returnLocation?: string
}): Promise<AssetAssignment> => {
  const response = await api.post(`/hr/assets/${assignmentId}/return/initiate`, data)
  return response.data
}

// Complete return
export const completeReturn = async (assignmentId: string, data: {
  actualReturnDate: string
  returnedBy: string
  receivedBy: string
  inspection: {
    conditionAtReturn: AssetCondition
    damageAssessment?: {
      hasDamage: boolean
      damages?: Array<{ damageType: string; description: string; repairCost?: number }>
    }
    completenessCheck: {
      complete: boolean
      missingItems?: Array<{ itemType: string; description: string; replacementCost: number }>
    }
    dataCheck?: {
      dataWiped: boolean
      wipingMethod?: 'software' | 'physical_destruction'
    }
    functionalityTest?: {
      tested: boolean
      functional: boolean
      issues?: string[]
    }
    inspectionNotes?: string
  }
  returnCharges?: {
    hasCharges: boolean
    charges?: Array<{ chargeType: string; description: string; amount: number }>
    recoveryMethod?: 'salary_deduction' | 'final_settlement' | 'payment' | 'waived'
  }
  nextSteps: {
    assetStatus: 'available_for_reassignment' | 'needs_repair' | 'needs_maintenance' | 'retired' | 'disposed'
  }
}): Promise<AssetAssignment> => {
  const response = await api.post(`/hr/assets/${assignmentId}/return/complete`, data)
  return response.data
}

// Transfer asset
export const transferAsset = async (assignmentId: string, data: {
  transferType: 'employee_transfer' | 'department_transfer' | 'location_transfer' | 'temporary_reassignment'
  transferTo: {
    employeeId?: string
    department?: string
    location?: string
  }
  transferReason: string
  temporary: boolean
  expectedReturnDate?: string
}): Promise<AssetAssignment> => {
  const response = await api.post(`/hr/assets/${assignmentId}/transfer`, data)
  return response.data
}

// Retire/Dispose asset
export const disposeAsset = async (assignmentId: string, data: {
  retirementReason: 'end_of_life' | 'obsolete' | 'damaged_beyond_repair' | 'upgrade' | 'lease_end' | 'cost_ineffective'
  disposalMethod: 'sale' | 'donation' | 'recycling' | 'trade_in' | 'return_to_vendor' | 'destruction' | 'storage'
  bookValue?: number
  sale?: { soldTo: string; salePrice: number }
  donation?: { donatedTo: string; donationValue: number; taxDeductible: boolean }
  dataDestruction?: {
    required: boolean
    destructionMethod?: 'software_wipe' | 'degaussing' | 'physical_destruction' | 'shredding'
  }
  notes?: string
}): Promise<AssetAssignment> => {
  const response = await api.post(`/hr/assets/${assignmentId}/dispose`, data)
  return response.data
}

// Bulk delete
export const bulkDeleteAssets = async (ids: string[]): Promise<{ deleted: number }> => {
  const response = await api.post('/hr/assets/bulk-delete', { ids })
  return response.data
}

// Get employee assets
export const getEmployeeAssets = async (employeeId: string): Promise<AssetAssignment[]> => {
  const response = await api.get(`/hr/assets/by-employee/${employeeId}`)
  return response.data
}

// Get pending returns
export const getPendingReturns = async (): Promise<Array<{
  assignmentId: string
  assetName: string
  assetTag: string
  employeeName: string
  returnDueDate: string
  daysOverdue?: number
}>> => {
  const response = await api.get('/hr/assets/pending-returns')
  return response.data
}

// Get maintenance due
export const getMaintenanceDue = async (): Promise<Array<{
  assignmentId: string
  assetName: string
  assetTag: string
  maintenanceType: string
  dueDate: string
  daysOverdue?: number
}>> => {
  const response = await api.get('/hr/assets/maintenance-due')
  return response.data
}

// Get warranty expiring
export const getWarrantyExpiring = async (): Promise<Array<{
  assignmentId: string
  assetName: string
  assetTag: string
  warrantyEndDate: string
  daysRemaining: number
}>> => {
  const response = await api.get('/hr/assets/warranty-expiring')
  return response.data
}

// Get available assets
export const getAvailableAssets = async (assetType?: AssetType): Promise<Array<{
  assetId: string
  assetTag: string
  assetName: string
  assetType: AssetType
  condition: AssetCondition
  location?: string
}>> => {
  const params = assetType ? `?assetType=${assetType}` : ''
  const response = await api.get(`/hr/assets/available${params}`)
  return response.data
}

// Export assets
export const exportAssets = async (filters?: AssetFilters): Promise<Blob> => {
  const params = new URLSearchParams()
  if (filters?.status) params.append('status', filters.status)
  if (filters?.assetType) params.append('assetType', filters.assetType)
  if (filters?.dateFrom) params.append('dateFrom', filters.dateFrom)
  if (filters?.dateTo) params.append('dateTo', filters.dateTo)

  const response = await api.get(`/hr/assets/export?${params.toString()}`, {
    responseType: 'blob'
  })
  return response.data
}
