/**
 * Company Service
 * Handles all company-related API calls for multi-company support
 */

import apiClient, { handleApiError } from '@/lib/api'

/**
 * Company Interface
 */
export interface Company {
  _id: string
  name: string
  nameAr?: string
  code?: string
  logo?: string
  parentCompanyId?: string | null
  level: number // 0 = root, 1 = child, 2 = grandchild, etc.
  industry?: string
  taxId?: string
  commercialRegistration?: string
  address?: {
    street?: string
    city?: string
    country?: string
    postalCode?: string
  }
  contact?: {
    email?: string
    phone?: string
    website?: string
  }
  status: 'active' | 'inactive' | 'suspended'
  fiscalYearStart?: string // MM-DD format
  currency?: string
  timezone?: string
  settings?: {
    allowConsolidatedView?: boolean
    allowCrossCompanyTransactions?: boolean
    requireApprovalForCrossCompany?: boolean
  }
  // Computed fields
  childCompanies?: Company[]
  parentCompany?: Company
  userCount?: number
  employeeCount?: number
  createdAt: string
  updatedAt: string
  createdBy?: string
  updatedBy?: string
}

/**
 * User-Company Access Interface
 */
export interface UserCompanyAccess {
  _id: string
  userId: string
  companyId: string
  role: 'owner' | 'admin' | 'manager' | 'employee' | 'viewer'
  permissions?: string[]
  canAccessChildren?: boolean // Can access child companies
  canAccessParent?: boolean // Can access parent company
  isDefault?: boolean // Default company for user
  status: 'active' | 'inactive' | 'pending'
  createdAt: string
  updatedAt: string
}

/**
 * Company Filters
 */
export interface CompanyFilters {
  parentCompanyId?: string | null
  status?: 'active' | 'inactive' | 'suspended'
  search?: string
  level?: number
  includeChildren?: boolean
}

/**
 * Create Company Data
 */
export interface CreateCompanyData {
  name: string
  nameAr?: string
  code?: string
  logo?: string
  parentCompanyId?: string | null
  industry?: string
  taxId?: string
  commercialRegistration?: string
  address?: Company['address']
  contact?: Company['contact']
  status?: 'active' | 'inactive' | 'suspended'
  fiscalYearStart?: string
  currency?: string
  timezone?: string
  settings?: Company['settings']
}

/**
 * Update Company Data
 */
export interface UpdateCompanyData extends Partial<CreateCompanyData> {}

/**
 * Company Tree Node (for hierarchical view)
 */
export interface CompanyTreeNode extends Company {
  children: CompanyTreeNode[]
  expanded?: boolean
}

/**
 * API Response Types
 */
interface CompanyResponse {
  success: boolean
  data: Company
}

interface CompaniesResponse {
  success: boolean
  data: Company[]
  total?: number
}

interface CompanyTreeResponse {
  success: boolean
  data: CompanyTreeNode[]
}

interface UserCompanyAccessResponse {
  success: boolean
  data: UserCompanyAccess[]
}

interface SwitchCompanyResponse {
  success: boolean
  data: {
    companyId: string
    company: Company
    access: UserCompanyAccess
  }
}

/**
 * Company Service
 */
const companyService = {
  /**
   * Get all companies accessible to current user
   * GET /api/companies
   */
  getAll: async (filters?: CompanyFilters): Promise<{ companies: Company[]; total: number }> => {
    try {
      const response = await apiClient.get<CompaniesResponse>('/companies', {
        params: filters,
      })
      return {
        companies: response.data.data,
        total: response.data.total || response.data.data.length,
      }
    } catch (error: any) {
      throw new Error(handleApiError(error))
    }
  },

  /**
   * Get company by ID
   * GET /api/companies/:id
   */
  getById: async (id: string): Promise<Company> => {
    try {
      const response = await apiClient.get<CompanyResponse>(`/companies/${id}`)
      return response.data.data
    } catch (error: any) {
      throw new Error(handleApiError(error))
    }
  },

  /**
   * Get company hierarchy tree
   * GET /api/companies/tree
   */
  getTree: async (rootCompanyId?: string): Promise<CompanyTreeNode[]> => {
    try {
      const response = await apiClient.get<CompanyTreeResponse>('/companies/tree', {
        params: rootCompanyId ? { rootCompanyId } : undefined,
      })
      return response.data.data
    } catch (error: any) {
      throw new Error(handleApiError(error))
    }
  },

  /**
   * Get child companies
   * GET /api/companies/:id/children
   */
  getChildren: async (parentId: string): Promise<Company[]> => {
    try {
      const response = await apiClient.get<CompaniesResponse>(`/companies/${parentId}/children`)
      return response.data.data
    } catch (error: any) {
      throw new Error(handleApiError(error))
    }
  },

  /**
   * Create new company
   * POST /api/companies
   */
  create: async (data: CreateCompanyData): Promise<Company> => {
    try {
      const response = await apiClient.post<CompanyResponse>('/companies', data)
      return response.data.data
    } catch (error: any) {
      throw new Error(handleApiError(error))
    }
  },

  /**
   * Update company
   * PUT /api/companies/:id
   */
  update: async (id: string, data: UpdateCompanyData): Promise<Company> => {
    try {
      const response = await apiClient.put<CompanyResponse>(`/companies/${id}`, data)
      return response.data.data
    } catch (error: any) {
      throw new Error(handleApiError(error))
    }
  },

  /**
   * Delete company
   * DELETE /api/companies/:id
   */
  delete: async (id: string): Promise<void> => {
    try {
      await apiClient.delete(`/companies/${id}`)
    } catch (error: any) {
      throw new Error(handleApiError(error))
    }
  },

  /**
   * Move company to different parent
   * PUT /api/companies/:id/move
   */
  move: async (id: string, newParentId: string | null): Promise<Company> => {
    try {
      const response = await apiClient.put<CompanyResponse>(`/companies/${id}/move`, {
        parentCompanyId: newParentId,
      })
      return response.data.data
    } catch (error: any) {
      throw new Error(handleApiError(error))
    }
  },

  /**
   * Get user's accessible companies
   * GET /api/companies/user/accessible
   */
  getUserAccessibleCompanies: async (): Promise<{
    companies: Company[]
    access: UserCompanyAccess[]
  }> => {
    try {
      const response = await apiClient.get<{
        success: boolean
        data: { companies: Company[]; access: UserCompanyAccess[] }
      }>('/companies/user/accessible')
      return response.data.data
    } catch (error: any) {
      throw new Error(handleApiError(error))
    }
  },

  /**
   * Switch active company context
   * POST /api/companies/switch
   */
  switchCompany: async (companyId: string): Promise<{
    companyId: string
    company: Company
    access: UserCompanyAccess
  }> => {
    try {
      const response = await apiClient.post<SwitchCompanyResponse>('/companies/switch', {
        companyId,
      })
      return response.data.data
    } catch (error: any) {
      throw new Error(handleApiError(error))
    }
  },

  /**
   * Get active company context
   * GET /api/companies/active
   */
  getActiveCompany: async (): Promise<{
    companyId: string
    company: Company
    access: UserCompanyAccess
  }> => {
    try {
      const response = await apiClient.get<SwitchCompanyResponse>('/companies/active')
      return response.data.data
    } catch (error: any) {
      throw new Error(handleApiError(error))
    }
  },

  /**
   * Grant user access to company
   * POST /api/companies/:id/access
   */
  grantAccess: async (
    companyId: string,
    userId: string,
    data: {
      role: UserCompanyAccess['role']
      permissions?: string[]
      canAccessChildren?: boolean
      canAccessParent?: boolean
      isDefault?: boolean
    }
  ): Promise<UserCompanyAccess> => {
    try {
      const response = await apiClient.post<{ success: boolean; data: UserCompanyAccess }>(
        `/companies/${companyId}/access`,
        { userId, ...data }
      )
      return response.data.data
    } catch (error: any) {
      throw new Error(handleApiError(error))
    }
  },

  /**
   * Revoke user access to company
   * DELETE /api/companies/:id/access/:userId
   */
  revokeAccess: async (companyId: string, userId: string): Promise<void> => {
    try {
      await apiClient.delete(`/companies/${companyId}/access/${userId}`)
    } catch (error: any) {
      throw new Error(handleApiError(error))
    }
  },

  /**
   * Update user access to company
   * PUT /api/companies/:id/access/:userId
   */
  updateAccess: async (
    companyId: string,
    userId: string,
    data: Partial<UserCompanyAccess>
  ): Promise<UserCompanyAccess> => {
    try {
      const response = await apiClient.put<{ success: boolean; data: UserCompanyAccess }>(
        `/companies/${companyId}/access/${userId}`,
        data
      )
      return response.data.data
    } catch (error: any) {
      throw new Error(handleApiError(error))
    }
  },

  /**
   * Get company access list
   * GET /api/companies/:id/access
   */
  getAccessList: async (companyId: string): Promise<UserCompanyAccess[]> => {
    try {
      const response = await apiClient.get<UserCompanyAccessResponse>(
        `/companies/${companyId}/access`
      )
      return response.data.data
    } catch (error: any) {
      throw new Error(handleApiError(error))
    }
  },
}

export default companyService
