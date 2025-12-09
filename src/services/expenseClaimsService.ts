import api from './api'

// ==================== TYPES & ENUMS ====================

// Expense Category
export type ExpenseCategory = 'travel' | 'meals' | 'accommodation' | 'transportation' |
  'office_supplies' | 'communication' | 'professional_services' | 'training' |
  'entertainment' | 'court_fees' | 'legal_research' | 'client_expenses' |
  'mileage' | 'parking' | 'tolls' | 'other'

// Claim Status
export type ClaimStatus = 'draft' | 'submitted' | 'under_review' | 'pending_approval' |
  'approved' | 'rejected' | 'processing' | 'paid' | 'cancelled'

// Payment Status
export type PaymentStatus = 'pending' | 'processing' | 'paid' | 'failed' | 'cancelled'

// Payment Method
export type PaymentMethod = 'bank_transfer' | 'cash' | 'check' | 'payroll_addition' | 'corporate_card_credit'

// Expense Type
export type ExpenseType = 'reimbursement' | 'corporate_card' | 'petty_cash' | 'advance_settlement'

// Receipt Status
export type ReceiptStatus = 'attached' | 'missing' | 'invalid' | 'verified'

// Travel Class
export type TravelClass = 'economy' | 'premium_economy' | 'business' | 'first'

// Mileage Vehicle Type
export type VehicleType = 'personal_car' | 'company_car' | 'rental'

// ==================== LABELS ====================

export const EXPENSE_CATEGORY_LABELS: Record<ExpenseCategory, { ar: string; en: string; color: string; icon: string }> = {
  travel: { ar: 'سفر', en: 'Travel', color: 'blue', icon: 'Plane' },
  meals: { ar: 'وجبات', en: 'Meals', color: 'orange', icon: 'Utensils' },
  accommodation: { ar: 'إقامة', en: 'Accommodation', color: 'purple', icon: 'Hotel' },
  transportation: { ar: 'مواصلات', en: 'Transportation', color: 'teal', icon: 'Car' },
  office_supplies: { ar: 'مستلزمات مكتبية', en: 'Office Supplies', color: 'slate', icon: 'Paperclip' },
  communication: { ar: 'اتصالات', en: 'Communication', color: 'cyan', icon: 'Phone' },
  professional_services: { ar: 'خدمات مهنية', en: 'Professional Services', color: 'indigo', icon: 'Briefcase' },
  training: { ar: 'تدريب', en: 'Training', color: 'emerald', icon: 'GraduationCap' },
  entertainment: { ar: 'ضيافة', en: 'Entertainment', color: 'pink', icon: 'Wine' },
  court_fees: { ar: 'رسوم محاكم', en: 'Court Fees', color: 'amber', icon: 'Scale' },
  legal_research: { ar: 'أبحاث قانونية', en: 'Legal Research', color: 'violet', icon: 'BookOpen' },
  client_expenses: { ar: 'مصاريف موكلين', en: 'Client Expenses', color: 'rose', icon: 'Users' },
  mileage: { ar: 'مسافات', en: 'Mileage', color: 'green', icon: 'Gauge' },
  parking: { ar: 'مواقف', en: 'Parking', color: 'gray', icon: 'ParkingCircle' },
  tolls: { ar: 'رسوم طرق', en: 'Tolls', color: 'yellow', icon: 'Route' },
  other: { ar: 'أخرى', en: 'Other', color: 'gray', icon: 'MoreHorizontal' },
}

export const CLAIM_STATUS_LABELS: Record<ClaimStatus, { ar: string; en: string; color: string }> = {
  draft: { ar: 'مسودة', en: 'Draft', color: 'gray' },
  submitted: { ar: 'مُقدّم', en: 'Submitted', color: 'blue' },
  under_review: { ar: 'قيد المراجعة', en: 'Under Review', color: 'amber' },
  pending_approval: { ar: 'بانتظار الاعتماد', en: 'Pending Approval', color: 'orange' },
  approved: { ar: 'معتمد', en: 'Approved', color: 'emerald' },
  rejected: { ar: 'مرفوض', en: 'Rejected', color: 'red' },
  processing: { ar: 'قيد المعالجة', en: 'Processing', color: 'purple' },
  paid: { ar: 'مدفوع', en: 'Paid', color: 'green' },
  cancelled: { ar: 'ملغي', en: 'Cancelled', color: 'slate' },
}

export const PAYMENT_STATUS_LABELS: Record<PaymentStatus, { ar: string; en: string; color: string }> = {
  pending: { ar: 'قيد الانتظار', en: 'Pending', color: 'slate' },
  processing: { ar: 'قيد المعالجة', en: 'Processing', color: 'blue' },
  paid: { ar: 'مدفوع', en: 'Paid', color: 'emerald' },
  failed: { ar: 'فشل', en: 'Failed', color: 'red' },
  cancelled: { ar: 'ملغي', en: 'Cancelled', color: 'gray' },
}

export const EXPENSE_TYPE_LABELS: Record<ExpenseType, { ar: string; en: string; color: string }> = {
  reimbursement: { ar: 'سداد', en: 'Reimbursement', color: 'blue' },
  corporate_card: { ar: 'بطاقة الشركة', en: 'Corporate Card', color: 'purple' },
  petty_cash: { ar: 'صندوق نثرية', en: 'Petty Cash', color: 'amber' },
  advance_settlement: { ar: 'تسوية سلفة', en: 'Advance Settlement', color: 'teal' },
}

export const TRAVEL_CLASS_LABELS: Record<TravelClass, { ar: string; en: string }> = {
  economy: { ar: 'اقتصادية', en: 'Economy' },
  premium_economy: { ar: 'اقتصادية ممتازة', en: 'Premium Economy' },
  business: { ar: 'رجال أعمال', en: 'Business' },
  first: { ar: 'درجة أولى', en: 'First Class' },
}

// ==================== INTERFACES ====================

// Expense Line Item
export interface ExpenseLineItem {
  lineItemId: string
  category: ExpenseCategory
  description: string
  descriptionAr?: string
  expenseDate: string
  vendor?: string
  vendorAr?: string
  amount: number
  vatAmount?: number
  totalAmount: number
  currency: string
  exchangeRate?: number
  amountInSAR?: number
  receiptStatus: ReceiptStatus
  receiptUrl?: string
  receiptNumber?: string
  isBillable?: boolean
  clientId?: string
  clientName?: string
  caseId?: string
  caseNumber?: string
  projectCode?: string
  costCenter?: string
  notes?: string
}

// Travel Details
export interface TravelDetails {
  tripPurpose: string
  tripPurposeAr?: string
  departureCity: string
  arrivalCity: string
  departureDate: string
  returnDate: string
  tripDays: number
  flights?: Array<{
    flightNumber: string
    airline: string
    departureCity: string
    arrivalCity: string
    departureDate: string
    class: TravelClass
    ticketCost: number
    baggageCost?: number
    bookingReference: string
  }>
  accommodation?: {
    hotelName: string
    checkInDate: string
    checkOutDate: string
    nights: number
    roomRate: number
    totalCost: number
    bookingReference?: string
  }
  groundTransport?: Array<{
    type: 'taxi' | 'uber' | 'rental' | 'company_driver' | 'other'
    description: string
    amount: number
    date: string
  }>
  perDiem?: {
    dailyRate: number
    days: number
    totalPerDiem: number
  }
}

// Mileage Claim
export interface MileageClaim {
  journeys: Array<{
    journeyDate: string
    fromLocation: string
    toLocation: string
    purpose: string
    purposeAr?: string
    distanceKm: number
    roundTrip: boolean
    clientId?: string
    caseId?: string
  }>
  totalDistance: number
  ratePerKm: number
  totalMileageAmount: number
  vehicleType: VehicleType
  vehiclePlate?: string
}

// Corporate Card Transaction
export interface CorporateCardTransaction {
  transactionId: string
  cardLastFour: string
  transactionDate: string
  merchantName: string
  merchantCategory: string
  originalAmount: number
  originalCurrency: string
  billedAmount: number
  billedCurrency: string
  isReconciled: boolean
  reconciledLineItemId?: string
  isDisputed: boolean
  disputeReason?: string
}

// Approval Step
export interface ApprovalStep {
  stepNumber: number
  stepName: string
  stepNameAr?: string
  approverRole: string
  approverId?: string
  approverName?: string
  status: 'pending' | 'approved' | 'rejected' | 'skipped'
  actionDate?: string
  decision?: 'approve' | 'reject' | 'request_changes'
  approvedAmount?: number
  comments?: string
  commentsAr?: string
  notificationSent: boolean
}

// Receipt
export interface Receipt {
  receiptId: string
  lineItemId?: string
  fileName: string
  fileUrl: string
  fileType: string
  fileSize: number
  uploadedOn: string
  uploadedBy: string
  ocrExtracted?: boolean
  extractedData?: {
    vendor?: string
    amount?: number
    date?: string
    vatNumber?: string
  }
  verified: boolean
  verifiedBy?: string
  verifiedOn?: string
}

// Payment Details
export interface PaymentDetails {
  paymentMethod: PaymentMethod
  paymentStatus: PaymentStatus
  paymentDate?: string
  paymentReference?: string
  bankTransfer?: {
    bankName: string
    accountNumber: string
    iban: string
    transferReference: string
    transferDate: string
  }
  processedBy?: string
  processedOn?: string
}

// VAT Details
export interface VATDetails {
  vatApplicable: boolean
  totalVatAmount: number
  vatBreakdown: Array<{
    vatRate: number
    baseAmount: number
    vatAmount: number
  }>
  vatReceiptAttached: boolean
  vendorVatNumbers?: string[]
}

// Main Expense Claim Record
export interface ExpenseClaimRecord {
  _id: string
  claimId: string
  claimNumber: string

  // Employee
  employeeId: string
  employeeNumber: string
  employeeName: string
  employeeNameAr?: string
  department?: string
  jobTitle?: string
  costCenter?: string

  // Claim Details
  claimTitle: string
  claimTitleAr?: string
  expenseType: ExpenseType
  claimPeriod: {
    startDate: string
    endDate: string
  }
  description?: string
  descriptionAr?: string

  // Line Items
  lineItems: ExpenseLineItem[]
  lineItemsCount: number

  // Totals
  totals: {
    subtotal: number
    vatTotal: number
    grandTotal: number
    currency: string
    approvedAmount?: number
    paidAmount?: number
    pendingAmount?: number
  }

  // Travel (if applicable)
  travelDetails?: TravelDetails

  // Mileage (if applicable)
  mileageClaim?: MileageClaim

  // Corporate Card (if applicable)
  corporateCard?: {
    cardNumber: string
    transactions: CorporateCardTransaction[]
    totalTransactions: number
    reconciledCount: number
    pendingReconciliation: number
  }

  // Advance Settlement (if applicable)
  advanceSettlement?: {
    advanceId: string
    advanceNumber: string
    advanceAmount: number
    spentAmount: number
    refundDue?: number
    additionalClaim?: number
  }

  // Billable
  billable?: {
    isBillable: boolean
    billableAmount: number
    clientId?: string
    clientName?: string
    caseId?: string
    caseNumber?: string
    invoiced: boolean
    invoiceNumber?: string
    invoiceDate?: string
  }

  // Status
  status: ClaimStatus

  // VAT
  vatDetails?: VATDetails

  // Receipts
  receipts: Receipt[]
  allReceiptsAttached: boolean
  missingReceiptsCount: number

  // Approval Workflow
  approvalWorkflow?: {
    required: boolean
    workflowSteps: ApprovalStep[]
    currentStep: number
    totalSteps: number
    finalStatus: 'pending' | 'approved' | 'rejected'
    finalApprover?: string
    finalApprovalDate?: string
    rejectionReason?: string
    changesRequested?: string
  }

  // Payment
  payment?: PaymentDetails

  // Policy Compliance
  policyCompliance?: {
    compliant: boolean
    violations: Array<{
      violationType: string
      violationTypeAr?: string
      description: string
      descriptionAr?: string
      severity: 'warning' | 'violation' | 'exception_required'
      lineItemId?: string
    }>
    exceptionApproved: boolean
    exceptionApprovedBy?: string
    exceptionReason?: string
  }

  // Dates
  submissionDate?: string
  reviewDate?: string
  approvalDate?: string
  paymentDate?: string

  // Notes
  notes?: {
    employeeNotes?: string
    managerNotes?: string
    financeNotes?: string
    internalNotes?: string
  }

  // Audit
  createdOn: string
  createdBy: string
  lastModifiedOn?: string
  lastModifiedBy?: string
}

// Create Expense Claim Data
export interface CreateExpenseClaimData {
  employeeId: string
  employeeNumber?: string
  employeeName: string
  employeeNameAr?: string
  department?: string
  jobTitle?: string
  costCenter?: string
  claimTitle: string
  claimTitleAr?: string
  expenseType: ExpenseType
  claimPeriod: {
    startDate: string
    endDate: string
  }
  description?: string
  descriptionAr?: string
  lineItems: Array<{
    category: ExpenseCategory
    description: string
    descriptionAr?: string
    expenseDate: string
    vendor?: string
    vendorAr?: string
    amount: number
    vatAmount?: number
    currency?: string
    isBillable?: boolean
    clientId?: string
    caseId?: string
    projectCode?: string
    costCenter?: string
    notes?: string
  }>
  travelDetails?: TravelDetails
  mileageClaim?: Omit<MileageClaim, 'totalMileageAmount'>
  advanceSettlement?: {
    advanceId: string
  }
  notes?: {
    employeeNotes?: string
  }
}

// Update Expense Claim Data
export interface UpdateExpenseClaimData {
  claimTitle?: string
  claimTitleAr?: string
  description?: string
  descriptionAr?: string
  claimPeriod?: {
    startDate: string
    endDate: string
  }
  lineItems?: Array<{
    lineItemId?: string
    category: ExpenseCategory
    description: string
    descriptionAr?: string
    expenseDate: string
    vendor?: string
    vendorAr?: string
    amount: number
    vatAmount?: number
    currency?: string
    isBillable?: boolean
    clientId?: string
    caseId?: string
    projectCode?: string
    costCenter?: string
    notes?: string
  }>
  travelDetails?: TravelDetails
  mileageClaim?: Omit<MileageClaim, 'totalMileageAmount'>
  notes?: {
    employeeNotes?: string
    financeNotes?: string
    internalNotes?: string
  }
}

// Filters
export interface ExpenseClaimFilters {
  status?: ClaimStatus
  expenseType?: ExpenseType
  category?: ExpenseCategory
  department?: string
  employeeId?: string
  dateFrom?: string
  dateTo?: string
  minAmount?: number
  maxAmount?: number
  isBillable?: boolean
  clientId?: string
  search?: string
  page?: number
  limit?: number
}

// Response
export interface ExpenseClaimResponse {
  data: ExpenseClaimRecord[]
  pagination: {
    total: number
    page: number
    limit: number
    pages: number
  }
}

// Stats
export interface ExpenseClaimStats {
  totalClaims: number
  byStatus: Array<{ status: ClaimStatus; count: number; amount: number }>
  byCategory: Array<{ category: ExpenseCategory; count: number; amount: number }>
  byType: Array<{ expenseType: ExpenseType; count: number; amount: number }>
  totalSubmitted: number
  totalApproved: number
  totalPaid: number
  totalPending: number
  pendingApproval: number
  pendingPayment: number
  thisMonth: {
    submissions: number
    approvals: number
    payments: number
    totalAmount: number
  }
  averageProcessingDays: number
  complianceRate: number
  billableExpenses: {
    total: number
    invoiced: number
    pending: number
  }
}

// ==================== API FUNCTIONS ====================

// Get all expense claims
export const getExpenseClaims = async (filters?: ExpenseClaimFilters): Promise<ExpenseClaimResponse> => {
  const params = new URLSearchParams()
  if (filters?.status) params.append('status', filters.status)
  if (filters?.expenseType) params.append('expenseType', filters.expenseType)
  if (filters?.category) params.append('category', filters.category)
  if (filters?.department) params.append('department', filters.department)
  if (filters?.employeeId) params.append('employeeId', filters.employeeId)
  if (filters?.dateFrom) params.append('dateFrom', filters.dateFrom)
  if (filters?.dateTo) params.append('dateTo', filters.dateTo)
  if (filters?.minAmount) params.append('minAmount', filters.minAmount.toString())
  if (filters?.maxAmount) params.append('maxAmount', filters.maxAmount.toString())
  if (filters?.isBillable !== undefined) params.append('isBillable', filters.isBillable.toString())
  if (filters?.clientId) params.append('clientId', filters.clientId)
  if (filters?.search) params.append('search', filters.search)
  if (filters?.page) params.append('page', filters.page.toString())
  if (filters?.limit) params.append('limit', filters.limit.toString())

  const response = await api.get(`/hr/expense-claims?${params.toString()}`)
  return response.data
}

// Get single expense claim
export const getExpenseClaim = async (claimId: string): Promise<ExpenseClaimRecord> => {
  const response = await api.get(`/hr/expense-claims/${claimId}`)
  return response.data
}

// Create expense claim
export const createExpenseClaim = async (data: CreateExpenseClaimData): Promise<ExpenseClaimRecord> => {
  const response = await api.post('/hr/expense-claims', data)
  return response.data
}

// Update expense claim
export const updateExpenseClaim = async (claimId: string, data: UpdateExpenseClaimData): Promise<ExpenseClaimRecord> => {
  const response = await api.patch(`/hr/expense-claims/${claimId}`, data)
  return response.data
}

// Delete expense claim
export const deleteExpenseClaim = async (claimId: string): Promise<void> => {
  await api.delete(`/hr/expense-claims/${claimId}`)
}

// Get expense claim stats
export const getExpenseClaimStats = async (): Promise<ExpenseClaimStats> => {
  const response = await api.get('/hr/expense-claims/stats')
  return response.data
}

// Submit expense claim
export const submitExpenseClaim = async (claimId: string): Promise<ExpenseClaimRecord> => {
  const response = await api.post(`/hr/expense-claims/${claimId}/submit`)
  return response.data
}

// Approve expense claim
export const approveExpenseClaim = async (claimId: string, data: {
  approvedAmount?: number
  comments?: string
}): Promise<ExpenseClaimRecord> => {
  const response = await api.post(`/hr/expense-claims/${claimId}/approve`, data)
  return response.data
}

// Reject expense claim
export const rejectExpenseClaim = async (claimId: string, data: {
  reason: string
  comments?: string
}): Promise<ExpenseClaimRecord> => {
  const response = await api.post(`/hr/expense-claims/${claimId}/reject`, data)
  return response.data
}

// Request changes
export const requestClaimChanges = async (claimId: string, data: {
  changesRequested: string
  lineItemIds?: string[]
}): Promise<ExpenseClaimRecord> => {
  const response = await api.post(`/hr/expense-claims/${claimId}/request-changes`, data)
  return response.data
}

// Process payment
export const processClaimPayment = async (claimId: string, data: {
  paymentMethod: PaymentMethod
  paymentReference?: string
  bankDetails?: {
    bankName: string
    accountNumber: string
    iban: string
  }
}): Promise<ExpenseClaimRecord> => {
  const response = await api.post(`/hr/expense-claims/${claimId}/process-payment`, data)
  return response.data
}

// Confirm payment
export const confirmClaimPayment = async (claimId: string, data: {
  paymentDate: string
  paymentReference: string
  amountPaid: number
  notes?: string
}): Promise<ExpenseClaimRecord> => {
  const response = await api.post(`/hr/expense-claims/${claimId}/confirm-payment`, data)
  return response.data
}

// Add line item
export const addLineItem = async (claimId: string, data: {
  category: ExpenseCategory
  description: string
  descriptionAr?: string
  expenseDate: string
  vendor?: string
  amount: number
  vatAmount?: number
  currency?: string
  isBillable?: boolean
  clientId?: string
  caseId?: string
}): Promise<ExpenseClaimRecord> => {
  const response = await api.post(`/hr/expense-claims/${claimId}/line-items`, data)
  return response.data
}

// Update line item
export const updateLineItem = async (claimId: string, lineItemId: string, data: {
  category?: ExpenseCategory
  description?: string
  descriptionAr?: string
  expenseDate?: string
  vendor?: string
  amount?: number
  vatAmount?: number
  isBillable?: boolean
  clientId?: string
  caseId?: string
}): Promise<ExpenseClaimRecord> => {
  const response = await api.patch(`/hr/expense-claims/${claimId}/line-items/${lineItemId}`, data)
  return response.data
}

// Delete line item
export const deleteLineItem = async (claimId: string, lineItemId: string): Promise<ExpenseClaimRecord> => {
  const response = await api.delete(`/hr/expense-claims/${claimId}/line-items/${lineItemId}`)
  return response.data
}

// Upload receipt
export const uploadReceipt = async (claimId: string, data: FormData): Promise<Receipt> => {
  const response = await api.post(`/hr/expense-claims/${claimId}/receipts`, data, {
    headers: { 'Content-Type': 'multipart/form-data' }
  })
  return response.data
}

// Delete receipt
export const deleteReceipt = async (claimId: string, receiptId: string): Promise<void> => {
  await api.delete(`/hr/expense-claims/${claimId}/receipts/${receiptId}`)
}

// Verify receipt
export const verifyReceipt = async (claimId: string, receiptId: string): Promise<Receipt> => {
  const response = await api.post(`/hr/expense-claims/${claimId}/receipts/${receiptId}/verify`)
  return response.data
}

// Reconcile corporate card transaction
export const reconcileCardTransaction = async (claimId: string, data: {
  transactionId: string
  lineItemId: string
}): Promise<ExpenseClaimRecord> => {
  const response = await api.post(`/hr/expense-claims/${claimId}/reconcile-card`, data)
  return response.data
}

// Check policy compliance
export const checkPolicyCompliance = async (claimId: string): Promise<{
  compliant: boolean
  violations: Array<{
    violationType: string
    description: string
    severity: 'warning' | 'violation' | 'exception_required'
    lineItemId?: string
  }>
}> => {
  const response = await api.post(`/hr/expense-claims/${claimId}/check-compliance`)
  return response.data
}

// Approve exception
export const approveException = async (claimId: string, data: {
  exceptionReason: string
}): Promise<ExpenseClaimRecord> => {
  const response = await api.post(`/hr/expense-claims/${claimId}/approve-exception`, data)
  return response.data
}

// Mark as billable
export const markAsBillable = async (claimId: string, data: {
  lineItemIds: string[]
  clientId: string
  caseId?: string
}): Promise<ExpenseClaimRecord> => {
  const response = await api.post(`/hr/expense-claims/${claimId}/mark-billable`, data)
  return response.data
}

// Create invoice for billable
export const createBillableInvoice = async (claimId: string): Promise<{
  invoiceNumber: string
  invoiceUrl: string
}> => {
  const response = await api.post(`/hr/expense-claims/${claimId}/create-invoice`)
  return response.data
}

// Bulk delete
export const bulkDeleteExpenseClaims = async (ids: string[]): Promise<{ deleted: number }> => {
  const response = await api.post('/hr/expense-claims/bulk-delete', { ids })
  return response.data
}

// Get employee expense claims
export const getEmployeeExpenseClaims = async (employeeId: string): Promise<ExpenseClaimRecord[]> => {
  const response = await api.get(`/hr/expense-claims/by-employee/${employeeId}`)
  return response.data
}

// Get pending approvals
export const getPendingClaimApprovals = async (): Promise<Array<{
  claimId: string
  employeeName: string
  claimTitle: string
  expenseType: ExpenseType
  totalAmount: number
  lineItemsCount: number
  submissionDate: string
}>> => {
  const response = await api.get('/hr/expense-claims/pending-approvals')
  return response.data
}

// Get pending payments
export const getPendingPayments = async (): Promise<Array<{
  claimId: string
  employeeName: string
  claimTitle: string
  approvedAmount: number
  approvalDate: string
  paymentMethod?: PaymentMethod
}>> => {
  const response = await api.get('/hr/expense-claims/pending-payments')
  return response.data
}

// Get mileage rates
export const getMileageRates = async (): Promise<{
  personal_car: number
  company_car: number
  rental: number
  effectiveDate: string
}> => {
  const response = await api.get('/hr/expense-claims/mileage-rates')
  return response.data
}

// Get expense policies
export const getExpensePolicies = async (): Promise<{
  dailyLimits: Record<ExpenseCategory, number>
  requiresReceipt: Record<ExpenseCategory, boolean>
  requiresApproval: Record<ExpenseCategory, number>
  travelPolicies: {
    domesticPerDiem: number
    internationalPerDiem: number
    maxHotelRate: number
    allowedTravelClasses: TravelClass[]
  }
}> => {
  const response = await api.get('/hr/expense-claims/policies')
  return response.data
}

// Get corporate card transactions
export const getCorporateCardTransactions = async (employeeId: string, filters?: {
  dateFrom?: string
  dateTo?: string
  unreconciled?: boolean
}): Promise<CorporateCardTransaction[]> => {
  const params = new URLSearchParams()
  if (filters?.dateFrom) params.append('dateFrom', filters.dateFrom)
  if (filters?.dateTo) params.append('dateTo', filters.dateTo)
  if (filters?.unreconciled) params.append('unreconciled', 'true')

  const response = await api.get(`/hr/expense-claims/corporate-card/${employeeId}?${params.toString()}`)
  return response.data
}

// Duplicate claim
export const duplicateExpenseClaim = async (claimId: string): Promise<ExpenseClaimRecord> => {
  const response = await api.post(`/hr/expense-claims/${claimId}/duplicate`)
  return response.data
}

// Export claims
export const exportExpenseClaims = async (filters?: ExpenseClaimFilters): Promise<Blob> => {
  const params = new URLSearchParams()
  if (filters?.status) params.append('status', filters.status)
  if (filters?.dateFrom) params.append('dateFrom', filters.dateFrom)
  if (filters?.dateTo) params.append('dateTo', filters.dateTo)

  const response = await api.get(`/hr/expense-claims/export?${params.toString()}`, {
    responseType: 'blob'
  })
  return response.data
}
