/**
 * WPS (Wage Protection System) File Generator
 *
 * Generates SIF (Salary Information File) format compliant with
 * Saudi Arabia HRSD (Ministry of Human Resources and Social Development) requirements.
 *
 * IMPORTANT: This is a government compliance system. Non-compliance can result in:
 * - Fines and penalties
 * - Business license suspension
 * - Legal action
 *
 * References:
 * - HRSD WPS Technical Specifications
 * - SARIE (Saudi Arabian Riyal Interbank Express) Bank IDs
 * - Mudad Platform Requirements
 */

import { SARIE_BANK_IDS, type SarieBankId } from '@/constants/saudi-banking'

// =============================================================================
// SARIE BANK CODES (9-digit routing codes)
// =============================================================================

/**
 * SARIE routing codes for Saudi banks
 * These are 9-digit codes used in WPS files
 */
export const SARIE_ROUTING_CODES: Record<string, string> = {
  SABB: '000000045',
  ALRAJHI: '000000080',
  SNB: '000000010',
  RIYADBANK: '000000020',
  BSF: '000000055',
  ANB: '000000030',
  ALINMA: '000000005',
  ALBILAD: '000000015',
  ALJAZIRA: '000000060',
  GIB: '000000065',
  ENBD: '000000070',
  FAB: '000000075',
}

/**
 * Get bank name from SARIE code
 */
export function getBankNameFromSarieCode(code: string): string {
  const bankNames: Record<string, string> = {
    '000000005': 'Alinma Bank',
    '000000010': 'Saudi National Bank (SNB)',
    '000000015': 'Bank Albilad',
    '000000020': 'Riyad Bank',
    '000000030': 'Arab National Bank (ANB)',
    '000000045': 'Saudi British Bank (SABB)',
    '000000055': 'Banque Saudi Fransi (BSF)',
    '000000060': 'Bank AlJazira',
    '000000065': 'Gulf International Bank (GIB)',
    '000000070': 'Emirates NBD',
    '000000075': 'First Abu Dhabi Bank',
    '000000080': 'Al Rajhi Bank',
  }
  return bankNames[code] || 'Unknown Bank'
}

/**
 * Get SARIE routing code from 2-digit bank ID
 */
export function getSarieRoutingCode(bankId: string): string {
  const paddedId = bankId.padStart(2, '0')
  return paddedId.padStart(9, '0')
}

// =============================================================================
// WPS FILE TYPES
// =============================================================================

/**
 * Employee data for WPS file generation
 */
export interface WPSEmployeeRecord {
  /** Person ID from Ministry of Labor (14 digits, pad with zeros if less) */
  molPersonId: string
  /** Employee national ID (Saudi) or Iqama number (Expat) */
  nationalId: string
  /** Employee name (for reference, not in file) */
  employeeName: string
  /** Bank routing code (9 digits) */
  bankRoutingCode: string
  /** IBAN or salary card number (max 23 chars for IBAN) */
  accountNumber: string
  /** Pay period start date (YYYY-MM-DD) */
  payStartDate: string
  /** Pay period end date (YYYY-MM-DD) */
  payEndDate: string
  /** Number of days in pay period */
  daysInPeriod: number
  /** Basic salary in SAR (no decimals, in fils: multiply by 100) */
  basicSalary: number
  /** Housing allowance in SAR */
  housingAllowance: number
  /** Other earnings (transport, bonus, etc.) in SAR */
  otherEarnings: number
  /** Deductions (GOSI, loans, etc.) in SAR */
  deductions: number
  /** Leave days (if any) */
  leaveDays?: number
  /** Leave amount deducted */
  leaveDeduction?: number
}

/**
 * Employer/Establishment data for WPS file
 */
export interface WPSEstablishmentRecord {
  /** Employer Unique ID from Ministry of Labor (13 digits) */
  molEstablishmentId: string
  /** Establishment name (for reference) */
  establishmentName: string
  /** Bank routing code (9 digits) */
  bankRoutingCode: string
  /** Company bank account IBAN */
  bankAccountIban: string
}

/**
 * WPS file generation options
 */
export interface WPSGenerationOptions {
  /** Salary month (YYYY-MM format) */
  salaryMonth: string
  /** File creation date (YYYY-MM-DD) - defaults to today */
  fileCreationDate?: string
  /** File creation time (HHMM 24h format) - defaults to now */
  fileCreationTime?: string
  /** Payment currency (always SAR) */
  currency?: 'SAR'
}

/**
 * Validation result for WPS data
 */
export interface WPSValidationResult {
  isValid: boolean
  errors: WPSValidationError[]
  warnings: string[]
}

export interface WPSValidationError {
  field: string
  employeeIndex?: number
  employeeName?: string
  message: string
  code: string
}

// =============================================================================
// VALIDATION
// =============================================================================

/**
 * Validates MOL Person ID (14 digits)
 */
function validateMolPersonId(id: string): string | null {
  const cleaned = id.replace(/\D/g, '')
  if (cleaned.length > 14) {
    return 'MOL Person ID must not exceed 14 digits'
  }
  return null
}

/**
 * Validates MOL Establishment ID (13 digits)
 */
function validateMolEstablishmentId(id: string): string | null {
  const cleaned = id.replace(/\D/g, '')
  if (cleaned.length > 13) {
    return 'MOL Establishment ID must not exceed 13 digits'
  }
  return null
}

/**
 * Validates bank routing code (9 digits)
 */
function validateBankRoutingCode(code: string): string | null {
  const cleaned = code.replace(/\D/g, '')
  if (cleaned.length !== 9) {
    return 'Bank routing code must be exactly 9 digits'
  }
  return null
}

/**
 * Validates IBAN format (Saudi IBAN: SA + 22 digits = 24 chars)
 */
function validateIban(iban: string): string | null {
  const cleaned = iban.replace(/\s/g, '').toUpperCase()
  if (!cleaned.startsWith('SA')) {
    return 'Saudi IBAN must start with SA'
  }
  if (cleaned.length !== 24) {
    return 'Saudi IBAN must be exactly 24 characters'
  }
  if (!/^SA\d{22}$/.test(cleaned)) {
    return 'Invalid IBAN format'
  }
  return null
}

/**
 * Validates date format (YYYY-MM-DD)
 */
function validateDateFormat(date: string, fieldName: string): string | null {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(date)) {
    return `${fieldName} must be in YYYY-MM-DD format`
  }
  const parsed = new Date(date)
  if (isNaN(parsed.getTime())) {
    return `${fieldName} is not a valid date`
  }
  return null
}

/**
 * Validates salary month format (YYYY-MM)
 */
function validateSalaryMonth(month: string): string | null {
  if (!/^\d{4}-\d{2}$/.test(month)) {
    return 'Salary month must be in YYYY-MM format'
  }
  return null
}

/**
 * Validates that salary amounts are non-negative
 */
function validateSalaryAmount(amount: number, fieldName: string): string | null {
  if (amount < 0) {
    return `${fieldName} cannot be negative (WPS rejects negative amounts)`
  }
  return null
}

/**
 * Comprehensive validation of WPS data
 */
export function validateWPSData(
  establishment: WPSEstablishmentRecord,
  employees: WPSEmployeeRecord[],
  options: WPSGenerationOptions
): WPSValidationResult {
  const errors: WPSValidationError[] = []
  const warnings: string[] = []

  // Validate establishment
  const estIdError = validateMolEstablishmentId(establishment.molEstablishmentId)
  if (estIdError) {
    errors.push({
      field: 'molEstablishmentId',
      message: estIdError,
      code: 'EST_ID_INVALID',
    })
  }

  const estBankError = validateBankRoutingCode(establishment.bankRoutingCode)
  if (estBankError) {
    errors.push({
      field: 'bankRoutingCode',
      message: estBankError,
      code: 'EST_BANK_INVALID',
    })
  }

  const estIbanError = validateIban(establishment.bankAccountIban)
  if (estIbanError) {
    errors.push({
      field: 'bankAccountIban',
      message: estIbanError,
      code: 'EST_IBAN_INVALID',
    })
  }

  // Validate salary month
  const monthError = validateSalaryMonth(options.salaryMonth)
  if (monthError) {
    errors.push({
      field: 'salaryMonth',
      message: monthError,
      code: 'MONTH_INVALID',
    })
  }

  // Validate employees
  if (employees.length === 0) {
    errors.push({
      field: 'employees',
      message: 'At least one employee is required',
      code: 'NO_EMPLOYEES',
    })
  }

  if (employees.length > 5000) {
    errors.push({
      field: 'employees',
      message: 'Maximum 5000 employees per file',
      code: 'TOO_MANY_EMPLOYEES',
    })
  }

  employees.forEach((emp, index) => {
    const empIdError = validateMolPersonId(emp.molPersonId)
    if (empIdError) {
      errors.push({
        field: 'molPersonId',
        employeeIndex: index,
        employeeName: emp.employeeName,
        message: empIdError,
        code: 'EMP_ID_INVALID',
      })
    }

    const empBankError = validateBankRoutingCode(emp.bankRoutingCode)
    if (empBankError) {
      errors.push({
        field: 'bankRoutingCode',
        employeeIndex: index,
        employeeName: emp.employeeName,
        message: empBankError,
        code: 'EMP_BANK_INVALID',
      })
    }

    // Validate account number (IBAN)
    if (emp.accountNumber.length > 23) {
      errors.push({
        field: 'accountNumber',
        employeeIndex: index,
        employeeName: emp.employeeName,
        message: 'Account number must not exceed 23 characters',
        code: 'EMP_ACCOUNT_INVALID',
      })
    }

    // Validate dates
    const startDateError = validateDateFormat(emp.payStartDate, 'Pay start date')
    if (startDateError) {
      errors.push({
        field: 'payStartDate',
        employeeIndex: index,
        employeeName: emp.employeeName,
        message: startDateError,
        code: 'EMP_DATE_INVALID',
      })
    }

    const endDateError = validateDateFormat(emp.payEndDate, 'Pay end date')
    if (endDateError) {
      errors.push({
        field: 'payEndDate',
        employeeIndex: index,
        employeeName: emp.employeeName,
        message: endDateError,
        code: 'EMP_DATE_INVALID',
      })
    }

    // Validate pay period dates match salary month
    if (!monthError && !startDateError) {
      const payMonth = emp.payStartDate.substring(0, 7)
      if (payMonth !== options.salaryMonth) {
        errors.push({
          field: 'payStartDate',
          employeeIndex: index,
          employeeName: emp.employeeName,
          message: `Pay start date must be in salary month ${options.salaryMonth}`,
          code: 'EMP_DATE_MISMATCH',
        })
      }
    }

    // Validate salary amounts
    const basicError = validateSalaryAmount(emp.basicSalary, 'Basic salary')
    if (basicError) {
      errors.push({
        field: 'basicSalary',
        employeeIndex: index,
        employeeName: emp.employeeName,
        message: basicError,
        code: 'EMP_SALARY_NEGATIVE',
      })
    }

    const housingError = validateSalaryAmount(emp.housingAllowance, 'Housing allowance')
    if (housingError) {
      errors.push({
        field: 'housingAllowance',
        employeeIndex: index,
        employeeName: emp.employeeName,
        message: housingError,
        code: 'EMP_SALARY_NEGATIVE',
      })
    }

    const otherError = validateSalaryAmount(emp.otherEarnings, 'Other earnings')
    if (otherError) {
      errors.push({
        field: 'otherEarnings',
        employeeIndex: index,
        employeeName: emp.employeeName,
        message: otherError,
        code: 'EMP_SALARY_NEGATIVE',
      })
    }

    // Calculate net salary
    const netSalary =
      emp.basicSalary + emp.housingAllowance + emp.otherEarnings - emp.deductions
    if (netSalary < 0) {
      errors.push({
        field: 'netSalary',
        employeeIndex: index,
        employeeName: emp.employeeName,
        message: 'Net salary cannot be negative',
        code: 'EMP_NET_NEGATIVE',
      })
    }

    // Warning for low salary
    if (netSalary > 0 && netSalary < 1500) {
      warnings.push(
        `Employee ${emp.employeeName}: Net salary (${netSalary} SAR) is below GOSI minimum`
      )
    }
  })

  return {
    isValid: errors.length === 0,
    errors,
    warnings,
  }
}

// =============================================================================
// FILE GENERATION
// =============================================================================

/**
 * Formats amount to fils (no decimals, SAR amount * 100 not needed for Saudi WPS)
 * Saudi WPS uses whole SAR amounts, not fils
 */
function formatAmount(amount: number): string {
  return Math.round(amount).toString()
}

/**
 * Pads string to specified length with leading character
 */
function padLeft(str: string, length: number, char: string = '0'): string {
  return str.padStart(length, char)
}

/**
 * Pads string to specified length with trailing character
 */
function padRight(str: string, length: number, char: string = ' '): string {
  return str.padEnd(length, char)
}

/**
 * Generates Employee Detail Record (EDR)
 * Format: EDR,PersonID,BankCode,AccountNo,StartDate,EndDate,Days,Fixed,Variable,Leave,Deduction
 */
function generateEDR(employee: WPSEmployeeRecord): string {
  const fields = [
    'EDR',
    padLeft(employee.molPersonId.replace(/\D/g, ''), 14, '0'),
    padLeft(employee.bankRoutingCode.replace(/\D/g, ''), 9, '0'),
    employee.accountNumber.replace(/\s/g, '').toUpperCase().substring(0, 23),
    employee.payStartDate,
    employee.payEndDate,
    employee.daysInPeriod.toString(),
    formatAmount(employee.basicSalary + employee.housingAllowance), // Fixed income
    formatAmount(employee.otherEarnings), // Variable income
    formatAmount(employee.leaveDeduction || 0), // Leave deduction
    formatAmount(employee.deductions), // Other deductions
  ]

  return fields.join(',')
}

/**
 * Generates Salary Control Record (SCR)
 * Format: SCR,EstablishmentID,BankCode,FileDate,FileTime,SalaryMonth,EDRCount,TotalSalary,Currency
 */
function generateSCR(
  establishment: WPSEstablishmentRecord,
  employees: WPSEmployeeRecord[],
  options: WPSGenerationOptions
): string {
  // Calculate total salary
  const totalSalary = employees.reduce((sum, emp) => {
    const netSalary =
      emp.basicSalary +
      emp.housingAllowance +
      emp.otherEarnings -
      emp.deductions -
      (emp.leaveDeduction || 0)
    return sum + Math.max(0, netSalary)
  }, 0)

  const now = new Date()
  const fileDate = options.fileCreationDate || now.toISOString().split('T')[0]
  const fileTime =
    options.fileCreationTime ||
    `${padLeft(now.getHours().toString(), 2, '0')}${padLeft(now.getMinutes().toString(), 2, '0')}`

  const fields = [
    'SCR',
    padLeft(establishment.molEstablishmentId.replace(/\D/g, ''), 13, '0'),
    padLeft(establishment.bankRoutingCode.replace(/\D/g, ''), 9, '0'),
    fileDate,
    fileTime,
    options.salaryMonth,
    employees.length.toString(),
    formatAmount(totalSalary),
    options.currency || 'SAR',
  ]

  return fields.join(',')
}

/**
 * Generates complete WPS SIF file content
 */
export function generateWPSFile(
  establishment: WPSEstablishmentRecord,
  employees: WPSEmployeeRecord[],
  options: WPSGenerationOptions
): string {
  const lines: string[] = []

  // Generate EDR for each employee
  employees.forEach((emp) => {
    lines.push(generateEDR(emp))
  })

  // Generate SCR as last line (mandatory)
  lines.push(generateSCR(establishment, employees, options))

  return lines.join('\n')
}

/**
 * Generates WPS file and returns as Blob for download
 */
export function generateWPSFileBlob(
  establishment: WPSEstablishmentRecord,
  employees: WPSEmployeeRecord[],
  options: WPSGenerationOptions
): Blob {
  const content = generateWPSFile(establishment, employees, options)
  return new Blob([content], { type: 'text/plain;charset=utf-8' })
}

/**
 * Generates standard WPS filename
 * Format: WPS_ESTID_YYYYMM_YYYYMMDD_HHMM.SIF
 */
export function generateWPSFilename(
  establishment: WPSEstablishmentRecord,
  options: WPSGenerationOptions
): string {
  const now = new Date()
  const estId = establishment.molEstablishmentId.replace(/\D/g, '').substring(0, 13)
  const salaryMonth = options.salaryMonth.replace('-', '')
  const fileDate = (options.fileCreationDate || now.toISOString().split('T')[0]).replace(
    /-/g,
    ''
  )
  const fileTime =
    options.fileCreationTime ||
    `${padLeft(now.getHours().toString(), 2, '0')}${padLeft(now.getMinutes().toString(), 2, '0')}`

  return `WPS_${estId}_${salaryMonth}_${fileDate}_${fileTime}.SIF`
}

/**
 * Downloads WPS file to user's device
 */
export function downloadWPSFile(
  establishment: WPSEstablishmentRecord,
  employees: WPSEmployeeRecord[],
  options: WPSGenerationOptions
): void {
  const blob = generateWPSFileBlob(establishment, employees, options)
  const filename = generateWPSFilename(establishment, options)

  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  link.download = filename
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
  URL.revokeObjectURL(url)
}

// =============================================================================
// FILE PREVIEW
// =============================================================================

/**
 * Generates a preview of the WPS file with human-readable information
 */
export interface WPSFilePreview {
  filename: string
  establishment: {
    id: string
    name: string
    bank: string
  }
  summary: {
    employeeCount: number
    totalBasicSalary: number
    totalHousingAllowance: number
    totalOtherEarnings: number
    totalDeductions: number
    totalNetSalary: number
    salaryMonth: string
  }
  employees: Array<{
    name: string
    molId: string
    bank: string
    netSalary: number
  }>
  rawContent: string
}

export function generateWPSFilePreview(
  establishment: WPSEstablishmentRecord,
  employees: WPSEmployeeRecord[],
  options: WPSGenerationOptions
): WPSFilePreview {
  const rawContent = generateWPSFile(establishment, employees, options)

  const totalBasicSalary = employees.reduce((sum, e) => sum + e.basicSalary, 0)
  const totalHousingAllowance = employees.reduce((sum, e) => sum + e.housingAllowance, 0)
  const totalOtherEarnings = employees.reduce((sum, e) => sum + e.otherEarnings, 0)
  const totalDeductions = employees.reduce(
    (sum, e) => sum + e.deductions + (e.leaveDeduction || 0),
    0
  )
  const totalNetSalary =
    totalBasicSalary + totalHousingAllowance + totalOtherEarnings - totalDeductions

  return {
    filename: generateWPSFilename(establishment, options),
    establishment: {
      id: establishment.molEstablishmentId,
      name: establishment.establishmentName,
      bank: getBankNameFromSarieCode(establishment.bankRoutingCode),
    },
    summary: {
      employeeCount: employees.length,
      totalBasicSalary,
      totalHousingAllowance,
      totalOtherEarnings,
      totalDeductions,
      totalNetSalary,
      salaryMonth: options.salaryMonth,
    },
    employees: employees.map((e) => ({
      name: e.employeeName,
      molId: e.molPersonId,
      bank: getBankNameFromSarieCode(e.bankRoutingCode),
      netSalary:
        e.basicSalary +
        e.housingAllowance +
        e.otherEarnings -
        e.deductions -
        (e.leaveDeduction || 0),
    })),
    rawContent,
  }
}
