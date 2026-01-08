/**
 * Saudi Banking Constants
 *
 * Centralized constants for Saudi banking compliance features:
 * - GOSI (General Organization for Social Insurance)
 * - WPS (Wage Protection System)
 * - Mudad (Payroll Compliance Platform)
 * - Nitaqat (Saudization Program)
 * - SADAD (Bill Payment System)
 */

// =============================================================================
// GOSI CONTRIBUTION RATES
// =============================================================================

/**
 * GOSI rates for Saudi employees hired BEFORE July 3, 2024 (Legacy)
 * Reference: GOSI Contribution Guide 2024
 */
export const GOSI_RATES_SAUDI_LEGACY = {
  /** Employee pension contribution: 9.75% */
  employee: 0.0975,
  /** Employer pension contribution: 9.75% */
  employerPension: 0.0975,
  /** Employer OHI (Occupational Hazard Insurance): 2% */
  employerOHI: 0.02,
  /** Total employer contribution: 11.75% */
  employer: 0.1175,
  /** Combined total: 21.5% */
  total: 0.215,
} as const

/**
 * GOSI rates for Saudi employees hired ON OR AFTER July 3, 2024 (Reform)
 * Reference: GOSI 2024 Reform Announcement
 */
export const GOSI_RATES_SAUDI_REFORM = {
  /** Employee pension contribution: 0% (fully employer-paid) */
  employee: 0,
  /** Employer pension contribution: 21.5% */
  employerPension: 0.215,
  /** Employer OHI (Occupational Hazard Insurance): 2% */
  employerOHI: 0.02,
  /** Total employer contribution: 23.5% */
  employer: 0.235,
  /** Combined total: 23.5% */
  total: 0.235,
} as const

/**
 * GOSI rates for Non-Saudi employees
 * Only OHI applies - no pension contributions
 */
export const GOSI_RATES_NON_SAUDI = {
  /** Employee contribution: 0% */
  employee: 0,
  /** Employer OHI only: 2% */
  employer: 0.02,
  /** Combined total: 2% */
  total: 0.02,
} as const

/**
 * SANED (Unemployment Insurance) rates
 * Applies to Saudi employees only
 */
export const SANED_RATES = {
  /** Employee contribution: 0.75% */
  employee: 0.0075,
  /** Employer contribution: 0.75% */
  employer: 0.0075,
  /** Combined total: 1.5% */
  total: 0.015,
} as const

// =============================================================================
// SALARY CONSTRAINTS
// =============================================================================

/**
 * GOSI salary constraints
 * Base salary for GOSI includes: Basic + Housing Allowance
 */
export const GOSI_SALARY_CONSTRAINTS = {
  /** Minimum base salary for GOSI calculation: SAR 1,500 */
  MIN_BASE: 1500,
  /** Maximum base salary for GOSI calculation: SAR 45,000 */
  MAX_BASE: 45000,
  /** Standard housing allowance percentage: 25% of basic */
  HOUSING_ALLOWANCE_PERCENT: 0.25,
} as const

/**
 * Nitaqat wage constraints
 */
export const NITAQAT_SALARY_CONSTRAINTS = {
  /** Minimum wage for full Nitaqat point: SAR 4,000 */
  MIN_FULL_POINT_WAGE: 4000,
  /** Minimum wage for half Nitaqat point: SAR 3,000 */
  MIN_HALF_POINT_WAGE: 3000,
} as const

/**
 * WPS file constraints
 */
export const WPS_CONSTRAINTS = {
  /** Maximum employees per batch */
  MAX_EMPLOYEES_PER_BATCH: 5000,
  /** Supported file format */
  FILE_FORMAT: 'SIF',
  /** File encoding */
  ENCODING: 'UTF-8',
} as const

// =============================================================================
// IMPORTANT DATES
// =============================================================================

/**
 * Key regulatory dates
 */
export const REGULATORY_DATES = {
  /** GOSI 2024 Reform effective date - employees hired on/after this use new rates */
  GOSI_REFORM_DATE: '2024-07-03',
  /** WPS mandatory compliance date */
  WPS_MANDATORY_DATE: '2013-09-01',
} as const

// =============================================================================
// BANK IDENTIFIERS (SARIE)
// =============================================================================

/**
 * Saudi Arabian Riyal Interbank Express (SARIE) Bank IDs
 * Used in WPS file generation and bank transfers
 */
export const SARIE_BANK_IDS = {
  SABB: '45',
  ALRAJHI: '80',
  SNB: '10',
  ALAHLI: '10', // Same as SNB (merged)
  RIYADBANK: '20',
  BANQUE_SAUDI_FRANSI: '55',
  ARAB_NATIONAL_BANK: '30',
  SAMBA: '40', // Merged with SNB
  ALINMA: '05',
  ALBILAD: '15',
  ALJAZIRA: '60',
  GULF_INTERNATIONAL: '65',
  EMIRATES_NBD: '70',
  FIRST_ABU_DHABI: '75',
} as const

export type SarieBankId = (typeof SARIE_BANK_IDS)[keyof typeof SARIE_BANK_IDS]

// =============================================================================
// ENUMS
// =============================================================================

/**
 * Employee nationality for GOSI/Nitaqat calculations
 */
export enum EmployeeNationality {
  SAUDI = 'SA',
  GCC = 'GCC',
  EXPAT = 'EXPAT',
}

/**
 * Nitaqat color bands
 * Determines hiring/visa privileges for companies
 */
export enum NitaqatBand {
  PLATINUM = 'platinum',
  GREEN_HIGH = 'green_high',
  GREEN_MID = 'green_mid',
  GREEN_LOW = 'green_low',
  YELLOW = 'yellow',
  RED = 'red',
}

/**
 * Nitaqat band display colors for UI
 */
export const NITAQAT_BAND_COLORS: Record<NitaqatBand, string> = {
  [NitaqatBand.PLATINUM]: '#E5E4E2', // Platinum silver
  [NitaqatBand.GREEN_HIGH]: '#006400', // Dark green
  [NitaqatBand.GREEN_MID]: '#228B22', // Forest green
  [NitaqatBand.GREEN_LOW]: '#90EE90', // Light green
  [NitaqatBand.YELLOW]: '#FFD700', // Gold/Yellow
  [NitaqatBand.RED]: '#DC143C', // Crimson red
}

/**
 * GOSI registration status
 */
export enum GosiRegistrationStatus {
  ACTIVE = 'active',
  PENDING = 'pending',
  SUSPENDED = 'suspended',
  TERMINATED = 'terminated',
}

/**
 * WPS payment status
 */
export enum WpsPaymentStatus {
  PENDING = 'pending',
  SUBMITTED = 'submitted',
  PROCESSING = 'processing',
  COMPLETED = 'completed',
  REJECTED = 'rejected',
  FAILED = 'failed',
}

/**
 * SADAD payment status
 */
export enum SadadPaymentStatus {
  PENDING = 'pending',
  PAID = 'paid',
  OVERDUE = 'overdue',
  CANCELLED = 'cancelled',
}

/**
 * Mudad submission status
 */
export enum MudadSubmissionStatus {
  DRAFT = 'draft',
  SUBMITTED = 'submitted',
  ACCEPTED = 'accepted',
  REJECTED = 'rejected',
  CORRECTION_REQUIRED = 'correction_required',
}

// =============================================================================
// NITAQAT WEIGHTING RULES
// =============================================================================

/**
 * Nitaqat employee weighting based on wage
 * Determines how much each Saudi employee counts toward Saudization %
 */
export const NITAQAT_WAGE_WEIGHTS = {
  /** SAR 4,000+ = 1.0 point (full weight) */
  FULL_WEIGHT: { minWage: 4000, weight: 1.0 },
  /** SAR 3,000-3,999 = 0.5 point (half weight) */
  HALF_WEIGHT: { minWage: 3000, maxWage: 3999, weight: 0.5 },
  /** Below SAR 3,000 = 0 points (not counted) */
  NO_WEIGHT: { maxWage: 2999, weight: 0 },
} as const

/**
 * Calculate Nitaqat weight for a Saudi employee based on salary
 */
export function calculateNitaqatWeight(monthlySalary: number): number {
  if (monthlySalary >= NITAQAT_WAGE_WEIGHTS.FULL_WEIGHT.minWage) {
    return NITAQAT_WAGE_WEIGHTS.FULL_WEIGHT.weight
  }
  if (monthlySalary >= NITAQAT_WAGE_WEIGHTS.HALF_WEIGHT.minWage) {
    return NITAQAT_WAGE_WEIGHTS.HALF_WEIGHT.weight
  }
  return NITAQAT_WAGE_WEIGHTS.NO_WEIGHT.weight
}

// =============================================================================
// COMPLIANCE DEADLINES
// =============================================================================

/**
 * Monthly compliance deadlines (day of month)
 */
export const COMPLIANCE_DEADLINES = {
  /** GOSI contributions due by 15th of following month */
  GOSI_PAYMENT: 15,
  /** WPS file submission deadline */
  WPS_SUBMISSION: 10,
  /** Mudad submission deadline */
  MUDAD_SUBMISSION: 10,
} as const

// =============================================================================
// ERROR CODES
// =============================================================================

/**
 * Saudi Banking API error codes
 */
export const SAUDI_BANKING_ERROR_CODES = {
  // GOSI Errors
  GOSI_INVALID_ID: 'GOSI_001',
  GOSI_EMPLOYEE_NOT_FOUND: 'GOSI_002',
  GOSI_DUPLICATE_REGISTRATION: 'GOSI_003',
  GOSI_INVALID_SALARY: 'GOSI_004',
  GOSI_SUBSCRIPTION_EXPIRED: 'GOSI_005',

  // WPS Errors
  WPS_INVALID_FILE_FORMAT: 'WPS_001',
  WPS_MISSING_EMPLOYEE_DATA: 'WPS_002',
  WPS_INVALID_BANK_CODE: 'WPS_003',
  WPS_BATCH_SIZE_EXCEEDED: 'WPS_004',
  WPS_DUPLICATE_PAYMENT: 'WPS_005',

  // SADAD Errors
  SADAD_INVALID_BILL_NUMBER: 'SADAD_001',
  SADAD_PAYMENT_FAILED: 'SADAD_002',
  SADAD_INSUFFICIENT_BALANCE: 'SADAD_003',
  SADAD_BILL_ALREADY_PAID: 'SADAD_004',

  // Mudad Errors
  MUDAD_SUBMISSION_FAILED: 'MUDAD_001',
  MUDAD_VALIDATION_ERROR: 'MUDAD_002',
  MUDAD_DEADLINE_MISSED: 'MUDAD_003',

  // Nitaqat Errors
  NITAQAT_CALCULATION_ERROR: 'NITAQAT_001',
  NITAQAT_DATA_UNAVAILABLE: 'NITAQAT_002',

  // Validation Errors
  INVALID_IBAN: 'VAL_001',
  INVALID_SAUDI_ID: 'VAL_002',
  INVALID_IQAMA_NUMBER: 'VAL_003',
} as const

export type SaudiBankingErrorCode =
  (typeof SAUDI_BANKING_ERROR_CODES)[keyof typeof SAUDI_BANKING_ERROR_CODES]

// =============================================================================
// GOSI CALCULATION HELPERS
// =============================================================================

/**
 * Determines if an employee uses 2024 reform rates
 * Reform applies to Saudi employees hired on or after July 3, 2024
 */
export function isReformEmployee(
  nationality: EmployeeNationality,
  employeeStartDate: Date | string
): boolean {
  if (nationality !== EmployeeNationality.SAUDI) {
    return false
  }

  const startDate =
    typeof employeeStartDate === 'string'
      ? new Date(employeeStartDate)
      : employeeStartDate
  const reformDate = new Date(REGULATORY_DATES.GOSI_REFORM_DATE)

  return startDate >= reformDate
}

/**
 * Get applicable GOSI rates based on nationality and hire date
 */
export function getApplicableGosiRates(
  nationality: EmployeeNationality,
  employeeStartDate?: Date | string
) {
  if (nationality !== EmployeeNationality.SAUDI) {
    return GOSI_RATES_NON_SAUDI
  }

  if (employeeStartDate && isReformEmployee(nationality, employeeStartDate)) {
    return GOSI_RATES_SAUDI_REFORM
  }

  return GOSI_RATES_SAUDI_LEGACY
}

/**
 * Calculate GOSI base salary (capped between min and max)
 * Base = Basic Salary + Housing Allowance
 */
export function calculateGosiBaseSalary(
  basicSalary: number,
  housingAllowance?: number
): number {
  // If housing allowance not provided, calculate as 25% of basic
  const housing =
    housingAllowance ?? basicSalary * GOSI_SALARY_CONSTRAINTS.HOUSING_ALLOWANCE_PERCENT

  const totalBase = basicSalary + housing

  // Cap between min and max
  return Math.min(
    Math.max(totalBase, GOSI_SALARY_CONSTRAINTS.MIN_BASE),
    GOSI_SALARY_CONSTRAINTS.MAX_BASE
  )
}

/**
 * Full GOSI contribution calculation
 */
export interface GosiContributionBreakdown {
  /** Capped base salary used for calculation */
  baseSalary: number
  /** Employee pension contribution */
  employeeContribution: number
  /** Employer pension contribution */
  employerPensionContribution: number
  /** Employer OHI contribution */
  employerOhiContribution: number
  /** Total employer contribution */
  employerTotalContribution: number
  /** SANED employee contribution (Saudi only) */
  sanedEmployeeContribution: number
  /** SANED employer contribution (Saudi only) */
  sanedEmployerContribution: number
  /** Grand total (employee + employer) */
  totalContribution: number
  /** Whether 2024 reform rates apply */
  isReformRate: boolean
}

export function calculateGosiContribution(
  basicSalary: number,
  housingAllowance: number | undefined,
  nationality: EmployeeNationality,
  employeeStartDate?: Date | string
): GosiContributionBreakdown {
  const baseSalary = calculateGosiBaseSalary(basicSalary, housingAllowance)
  const isReform = employeeStartDate
    ? isReformEmployee(nationality, employeeStartDate)
    : false
  const rates = getApplicableGosiRates(nationality, employeeStartDate)

  // GOSI contributions
  const employeeContribution = baseSalary * rates.employee
  const employerPensionContribution = baseSalary * (rates.employerPension ?? rates.employer - 0.02)
  const employerOhiContribution = baseSalary * (rates.employerOHI ?? 0.02)
  const employerTotalContribution = baseSalary * rates.employer

  // SANED (Saudi only)
  const isSaudi = nationality === EmployeeNationality.SAUDI
  const sanedEmployeeContribution = isSaudi ? baseSalary * SANED_RATES.employee : 0
  const sanedEmployerContribution = isSaudi ? baseSalary * SANED_RATES.employer : 0

  // Total
  const totalContribution =
    employeeContribution +
    employerTotalContribution +
    sanedEmployeeContribution +
    sanedEmployerContribution

  return {
    baseSalary,
    employeeContribution,
    employerPensionContribution,
    employerOhiContribution,
    employerTotalContribution,
    sanedEmployeeContribution,
    sanedEmployerContribution,
    totalContribution,
    isReformRate: isReform,
  }
}
