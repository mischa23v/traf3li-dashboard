import { apiClient } from '@/lib/api'

// ==================== ENUMS & TYPES ====================

export type ComponentType = 'earning' | 'deduction'
export type ApplicableFor = 'all' | 'saudi' | 'non_saudi' | 'custom'
export type GosiType = 'employee_contribution' | 'employer_contribution'

// ==================== INTERFACES ====================

export interface SalaryComponent {
  _id: string
  componentId: string
  name: string
  nameAr: string
  abbr: string // e.g., "HRA", "GOSI"

  type: ComponentType

  description: string
  descriptionAr: string

  // Calculation
  amountBasedOnFormula: boolean
  formula?: string // e.g., "base_salary * 0.25"
  amount?: number // fixed amount if not formula-based

  // Conditions
  condition?: string // e.g., "employee.is_saudi == true"

  // Tax settings
  isTaxApplicable: boolean
  exemptFromIncomeTax: boolean

  // GOSI settings (Saudi-specific)
  isGosiApplicable: boolean
  gosiType?: GosiType
  gosiPercentage?: number

  // Dependency
  dependsOnPaymentDays: boolean

  // Flexible benefit
  isFlexibleBenefit: boolean
  maxBenefitAmount?: number

  // Statistical (for reports only, not in payslip)
  statisticalComponent: boolean

  // Variable component
  isVariableComponent: boolean
  variableBasedOnTaxableSalary: boolean

  // Round settings
  roundToNearest: number // e.g., 1, 5, 10

  // Applicability
  applicableFor: ApplicableFor

  isActive: boolean

  createdAt: string
  updatedAt: string
  createdBy?: string
  updatedBy?: string
}

export interface CreateSalaryComponentData {
  name: string
  nameAr: string
  abbr: string
  type: ComponentType
  description: string
  descriptionAr: string
  amountBasedOnFormula: boolean
  formula?: string
  amount?: number
  condition?: string
  isTaxApplicable?: boolean
  exemptFromIncomeTax?: boolean
  isGosiApplicable?: boolean
  gosiType?: GosiType
  gosiPercentage?: number
  dependsOnPaymentDays?: boolean
  isFlexibleBenefit?: boolean
  maxBenefitAmount?: number
  statisticalComponent?: boolean
  isVariableComponent?: boolean
  variableBasedOnTaxableSalary?: boolean
  roundToNearest?: number
  applicableFor?: ApplicableFor
  isActive?: boolean
}

export type UpdateSalaryComponentData = Partial<CreateSalaryComponentData>

export interface SalaryComponentFilters {
  type?: ComponentType
  applicableFor?: ApplicableFor
  isActive?: boolean
  search?: string
  sortBy?: string
  sortOrder?: 'asc' | 'desc'
  page?: number
  limit?: number
}

export interface SalaryComponentsResponse {
  components: SalaryComponent[]
  pagination: {
    total: number
    page: number
    limit: number
    pages: number
  }
}

export interface CalculateComponentParams {
  componentId: string
  employeeId: string
  baseSalary: number
  grossSalary?: number
  workingDays?: number
  daysWorked?: number
  employeeData?: Record<string, any>
}

export interface CalculateComponentResult {
  componentId: string
  componentName: string
  componentNameAr: string
  calculatedAmount: number
  formula?: string
  variables?: Record<string, any>
  roundedAmount: number
}

// Predefined Saudi components
export const saudiDefaultComponents: Omit<CreateSalaryComponentData, 'description' | 'descriptionAr'>[] = [
  {
    name: 'Basic Salary',
    nameAr: 'الراتب الأساسي',
    type: 'earning',
    abbr: 'BASIC',
    amountBasedOnFormula: false,
    isTaxApplicable: true,
    exemptFromIncomeTax: false,
    isGosiApplicable: true,
    dependsOnPaymentDays: true,
    isFlexibleBenefit: false,
    statisticalComponent: false,
    isVariableComponent: false,
    variableBasedOnTaxableSalary: false,
    roundToNearest: 1,
    applicableFor: 'all',
    isActive: true,
  },
  {
    name: 'Housing Allowance',
    nameAr: 'بدل السكن',
    type: 'earning',
    abbr: 'HRA',
    amountBasedOnFormula: true,
    formula: 'base_salary * 0.25',
    isTaxApplicable: true,
    exemptFromIncomeTax: false,
    isGosiApplicable: true,
    dependsOnPaymentDays: false,
    isFlexibleBenefit: false,
    statisticalComponent: false,
    isVariableComponent: false,
    variableBasedOnTaxableSalary: false,
    roundToNearest: 1,
    applicableFor: 'all',
    isActive: true,
  },
  {
    name: 'Transport Allowance',
    nameAr: 'بدل النقل',
    type: 'earning',
    abbr: 'TA',
    amountBasedOnFormula: false,
    amount: 500,
    isTaxApplicable: true,
    exemptFromIncomeTax: false,
    isGosiApplicable: true,
    dependsOnPaymentDays: false,
    isFlexibleBenefit: false,
    statisticalComponent: false,
    isVariableComponent: false,
    variableBasedOnTaxableSalary: false,
    roundToNearest: 1,
    applicableFor: 'all',
    isActive: true,
  },
  {
    name: 'Food Allowance',
    nameAr: 'بدل الطعام',
    type: 'earning',
    abbr: 'FA',
    amountBasedOnFormula: false,
    amount: 300,
    isTaxApplicable: true,
    exemptFromIncomeTax: false,
    isGosiApplicable: true,
    dependsOnPaymentDays: false,
    isFlexibleBenefit: false,
    statisticalComponent: false,
    isVariableComponent: false,
    variableBasedOnTaxableSalary: false,
    roundToNearest: 1,
    applicableFor: 'all',
    isActive: true,
  },
  {
    name: 'GOSI Employee',
    nameAr: 'حصة الموظف من التأمينات',
    type: 'deduction',
    abbr: 'GOSI_EMP',
    amountBasedOnFormula: true,
    formula: 'gosi_salary * 0.10',
    condition: 'employee.is_saudi == true',
    isTaxApplicable: false,
    exemptFromIncomeTax: true,
    isGosiApplicable: true,
    gosiType: 'employee_contribution',
    gosiPercentage: 10,
    dependsOnPaymentDays: false,
    isFlexibleBenefit: false,
    statisticalComponent: false,
    isVariableComponent: false,
    variableBasedOnTaxableSalary: false,
    roundToNearest: 1,
    applicableFor: 'saudi',
    isActive: true,
  },
  {
    name: 'GOSI Employer',
    nameAr: 'حصة صاحب العمل من التأمينات',
    type: 'earning',
    abbr: 'GOSI_ER',
    amountBasedOnFormula: true,
    formula: 'gosi_salary * 0.12',
    isTaxApplicable: false,
    exemptFromIncomeTax: true,
    isGosiApplicable: true,
    gosiType: 'employer_contribution',
    gosiPercentage: 12,
    dependsOnPaymentDays: false,
    isFlexibleBenefit: false,
    statisticalComponent: true,
    isVariableComponent: false,
    variableBasedOnTaxableSalary: false,
    roundToNearest: 1,
    applicableFor: 'saudi',
    isActive: true,
  },
  {
    name: 'Overtime',
    nameAr: 'العمل الإضافي',
    type: 'earning',
    abbr: 'OT',
    amountBasedOnFormula: true,
    formula: '(base_salary / 30 / 8) * overtime_hours * 1.5',
    isTaxApplicable: true,
    exemptFromIncomeTax: false,
    isGosiApplicable: true,
    dependsOnPaymentDays: false,
    isFlexibleBenefit: false,
    statisticalComponent: false,
    isVariableComponent: true,
    variableBasedOnTaxableSalary: false,
    roundToNearest: 1,
    applicableFor: 'all',
    isActive: true,
  },
  {
    name: 'Late Deduction',
    nameAr: 'خصم التأخير',
    type: 'deduction',
    abbr: 'LATE',
    amountBasedOnFormula: true,
    formula: '(base_salary / 30 / 8) * late_hours',
    isTaxApplicable: false,
    exemptFromIncomeTax: true,
    isGosiApplicable: false,
    dependsOnPaymentDays: false,
    isFlexibleBenefit: false,
    statisticalComponent: false,
    isVariableComponent: true,
    variableBasedOnTaxableSalary: false,
    roundToNearest: 1,
    applicableFor: 'all',
    isActive: true,
  },
  {
    name: 'Absence Deduction',
    nameAr: 'خصم الغياب',
    type: 'deduction',
    abbr: 'ABS',
    amountBasedOnFormula: true,
    formula: '(base_salary / 30) * absent_days',
    isTaxApplicable: false,
    exemptFromIncomeTax: true,
    isGosiApplicable: false,
    dependsOnPaymentDays: false,
    isFlexibleBenefit: false,
    statisticalComponent: false,
    isVariableComponent: true,
    variableBasedOnTaxableSalary: false,
    roundToNearest: 1,
    applicableFor: 'all',
    isActive: true,
  },
]

// ==================== API FUNCTIONS ====================

export const salaryComponentService = {
  // Get all salary components with filters
  getSalaryComponents: async (filters?: SalaryComponentFilters): Promise<SalaryComponentsResponse> => {
    const params = new URLSearchParams()
    if (filters) {
      Object.entries(filters).forEach(([key, value]) => {
        if (value !== undefined && value !== null && value !== '') {
          params.append(key, String(value))
        }
      })
    }
    const response = await apiClient.get(`/hr/salary-components?${params.toString()}`)
    return response.data
  },

  // Get single salary component
  getSalaryComponent: async (id: string): Promise<SalaryComponent> => {
    const response = await apiClient.get(`/hr/salary-components/${id}`)
    return response.data
  },

  // Create salary component
  createSalaryComponent: async (data: CreateSalaryComponentData): Promise<SalaryComponent> => {
    const response = await apiClient.post('/hr/salary-components', data)
    return response.data
  },

  // Update salary component
  updateSalaryComponent: async (
    id: string,
    data: UpdateSalaryComponentData
  ): Promise<SalaryComponent> => {
    const response = await apiClient.put(`/hr/salary-components/${id}`, data)
    return response.data
  },

  // Delete salary component
  deleteSalaryComponent: async (id: string): Promise<void> => {
    await apiClient.delete(`/hr/salary-components/${id}`)
  },

  // Bulk delete salary components
  bulkDeleteSalaryComponents: async (ids: string[]): Promise<{ deleted: number }> => {
    const response = await apiClient.post('/hr/salary-components/bulk-delete', { ids })
    return response.data
  },

  // Get earning components
  getEarningComponents: async (): Promise<SalaryComponent[]> => {
    const response = await apiClient.get('/hr/salary-components?type=earning&isActive=true')
    return response.data.components || response.data
  },

  // Get deduction components
  getDeductionComponents: async (): Promise<SalaryComponent[]> => {
    const response = await apiClient.get('/hr/salary-components?type=deduction&isActive=true')
    return response.data.components || response.data
  },

  // Calculate component for an employee
  calculateComponent: async (params: CalculateComponentParams): Promise<CalculateComponentResult> => {
    const response = await apiClient.post('/hr/salary-components/calculate', params)
    return response.data
  },

  // Seed default Saudi components
  seedDefaultSaudiComponents: async (): Promise<{ created: number; components: SalaryComponent[] }> => {
    const response = await apiClient.post('/hr/salary-components/seed-defaults', {
      components: saudiDefaultComponents.map((comp) => ({
        ...comp,
        description: `Standard ${comp.name} component`,
        descriptionAr: `مكون ${comp.nameAr} قياسي`,
      })),
    })
    return response.data
  },

  // Duplicate component
  duplicateComponent: async (id: string): Promise<SalaryComponent> => {
    const response = await apiClient.post(`/hr/salary-components/${id}/duplicate`)
    return response.data
  },

  // Validate formula
  validateFormula: async (formula: string): Promise<{ valid: boolean; error?: string; variables?: string[] }> => {
    const response = await apiClient.post('/hr/salary-components/validate-formula', { formula })
    return response.data
  },

  // Get component usage statistics
  getComponentUsage: async (id: string): Promise<{
    componentId: string
    usedInEmployees: number
    usedInSalaryStructures: number
    totalAmount: number
    canDelete: boolean
  }> => {
    const response = await apiClient.get(`/hr/salary-components/${id}/usage`)
    return response.data
  },

  // Toggle component active status
  toggleComponentStatus: async (id: string): Promise<SalaryComponent> => {
    const response = await apiClient.patch(`/hr/salary-components/${id}/toggle-status`)
    return response.data
  },

  // Get components by type
  getComponentsByType: async (type: ComponentType): Promise<SalaryComponent[]> => {
    const response = await apiClient.get(`/hr/salary-components?type=${type}&isActive=true`)
    return response.data.components || response.data
  },

  // Get components statistics
  getComponentsStats: async (): Promise<{
    totalComponents: number
    earningComponents: number
    deductionComponents: number
    activeComponents: number
    inactiveComponents: number
    formulaBasedComponents: number
    fixedComponents: number
  }> => {
    const response = await apiClient.get('/hr/salary-components/stats')
    return response.data
  },
}

export default salaryComponentService
