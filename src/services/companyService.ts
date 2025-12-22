/**
 * Company Service
 *
 * This service handles multi-company hierarchy and access control within the Traf3li system.
 * It manages the organizational structure, parent-child relationships between companies,
 * and user access permissions across the company hierarchy.
 *
 * ## Dual-Service Architecture
 *
 * The Traf3li platform uses two services that interact with the same backend endpoints
 * but serve different domain concerns:
 *
 * ### companyService.ts (this file)
 * - **Domain**: Multi-company hierarchy and organizational structure
 * - **Concerns**:
 *   - Company tree management (parent-child relationships)
 *   - Multi-company access control
 *   - Company switching and context
 *   - Hierarchical permissions (canAccessChildren, canAccessParent)
 * - **Data Models**: Company, UserCompanyAccess, CompanyTreeNode
 *
 * ### firmService.ts
 * - **Domain**: RBAC (Role-Based Access Control), team management, and firm operations
 * - **Concerns**:
 *   - Role and permission management
 *   - Team creation and user assignments
 *   - Firm-level settings and configuration
 *   - User invitation and onboarding
 * - **Data Models**: Firm, Team, TeamMember, Role, Permission
 *
 * ## Shared Backend
 *
 * Both services call `/api/firms/*` endpoints because:
 * - The backend uses "firm" as the primary entity name
 * - A "Company" in the UI is represented as a "Firm" in the database
 * - The Company interfaces use `firmId` internally to maintain consistency with the backend
 *
 * ## Usage Guidelines
 *
 * - Use **companyService** for organizational hierarchy, multi-company features, and access control
 * - Use **firmService** for RBAC, team management, and firm-specific operations
 * - Both services can be used together when features require both hierarchy and permissions
 *
 * @example
 * // Get company hierarchy
 * const tree = await companyService.getTree();
 *
 * // Switch active company context
 * await companyService.switchCompany(firmId);
 *
 * // Grant user access to a company
 * await companyService.grantAccess(firmId, userId, { role: 'manager' });
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
  parentFirmId?: string | null
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
  firmId: string
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
  parentFirmId?: string | null
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
  parentFirmId?: string | null
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
    firmId: string
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
   * GET /api/firms
   */
  getAll: async (filters?: CompanyFilters): Promise<{ companies: Company[]; total: number }> => {
    try {
      const response = await apiClient.get<CompaniesResponse>('/firms', {
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
   * GET /api/firms/:id
   */
  getById: async (id: string): Promise<Company> => {
    try {
      const response = await apiClient.get<CompanyResponse>(`/firms/${id}`)
      return response.data.data
    } catch (error: any) {
      throw new Error(handleApiError(error))
    }
  },

  /**
   * Get company hierarchy tree
   * GET /api/firms/tree
   */
  getTree: async (rootFirmId?: string): Promise<CompanyTreeNode[]> => {
    try {
      const response = await apiClient.get<CompanyTreeResponse>('/firms/tree', {
        params: rootFirmId ? { rootFirmId } : undefined,
      })
      return response.data.data
    } catch (error: any) {
      throw new Error(handleApiError(error))
    }
  },

  /**
   * Get child companies
   * GET /api/firms/:id/children
   */
  getChildren: async (parentId: string): Promise<Company[]> => {
    try {
      const response = await apiClient.get<CompaniesResponse>(`/firms/${parentId}/children`)
      return response.data.data
    } catch (error: any) {
      throw new Error(handleApiError(error))
    }
  },

  /**
   * Create new company
   * POST /api/firms
   */
  create: async (data: CreateCompanyData): Promise<Company> => {
    try {
      const response = await apiClient.post<CompanyResponse>('/firms', data)
      return response.data.data
    } catch (error: any) {
      throw new Error(handleApiError(error))
    }
  },

  /**
   * Update company
   * PUT /api/firms/:id
   */
  update: async (id: string, data: UpdateCompanyData): Promise<Company> => {
    try {
      const response = await apiClient.put<CompanyResponse>(`/firms/${id}`, data)
      return response.data.data
    } catch (error: any) {
      throw new Error(handleApiError(error))
    }
  },

  /**
   * Delete company
   * DELETE /api/firms/:id
   */
  delete: async (id: string): Promise<void> => {
    try {
      await apiClient.delete(`/firms/${id}`)
    } catch (error: any) {
      throw new Error(handleApiError(error))
    }
  },

  /**
   * Move company to different parent
   * PUT /api/firms/:id/move
   */
  move: async (id: string, newParentId: string | null): Promise<Company> => {
    try {
      const response = await apiClient.put<CompanyResponse>(`/firms/${id}/move`, {
        parentFirmId: newParentId,
      })
      return response.data.data
    } catch (error: any) {
      throw new Error(handleApiError(error))
    }
  },

  /**
   * Get user's accessible companies
   * GET /api/firms/user/accessible
   */
  getUserAccessibleCompanies: async (): Promise<{
    companies: Company[]
    access: UserCompanyAccess[]
  }> => {
    try {
      const response = await apiClient.get<{
        success: boolean
        data: { companies: Company[]; access: UserCompanyAccess[] }
      }>('/firms/user/accessible')
      return response.data.data
    } catch (error: any) {
      throw new Error(handleApiError(error))
    }
  },

  /**
   * Switch active company context
   * POST /api/firms/switch
   */
  switchCompany: async (firmId: string): Promise<{
    firmId: string
    company: Company
    access: UserCompanyAccess
  }> => {
    try {
      const response = await apiClient.post<SwitchCompanyResponse>('/firms/switch', {
        firmId,
      })
      return response.data.data
    } catch (error: any) {
      throw new Error(handleApiError(error))
    }
  },

  /**
   * Get active company context
   * GET /api/firms/active
   */
  getActiveCompany: async (): Promise<{
    firmId: string
    company: Company
    access: UserCompanyAccess
  }> => {
    try {
      const response = await apiClient.get<SwitchCompanyResponse>('/firms/active')
      return response.data.data
    } catch (error: any) {
      throw new Error(handleApiError(error))
    }
  },

  /**
   * Grant user access to company
   * POST /api/firms/:id/access
   */
  grantAccess: async (
    firmId: string,
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
        `/firms/${firmId}/access`,
        { userId, ...data }
      )
      return response.data.data
    } catch (error: any) {
      throw new Error(handleApiError(error))
    }
  },

  /**
   * Revoke user access to company
   * DELETE /api/firms/:id/access/:userId
   */
  revokeAccess: async (firmId: string, userId: string): Promise<void> => {
    try {
      await apiClient.delete(`/firms/${firmId}/access/${userId}`)
    } catch (error: any) {
      throw new Error(handleApiError(error))
    }
  },

  /**
   * Update user access to company
   * PUT /api/firms/:id/access/:userId
   */
  updateAccess: async (
    firmId: string,
    userId: string,
    data: Partial<UserCompanyAccess>
  ): Promise<UserCompanyAccess> => {
    try {
      const response = await apiClient.put<{ success: boolean; data: UserCompanyAccess }>(
        `/firms/${firmId}/access/${userId}`,
        data
      )
      return response.data.data
    } catch (error: any) {
      throw new Error(handleApiError(error))
    }
  },

  /**
   * Get company access list
   * GET /api/firms/:id/access
   */
  getAccessList: async (firmId: string): Promise<UserCompanyAccess[]> => {
    try {
      const response = await apiClient.get<UserCompanyAccessResponse>(
        `/firms/${firmId}/access`
      )
      return response.data.data
    } catch (error: any) {
      throw new Error(handleApiError(error))
    }
  },
}

export default companyService
