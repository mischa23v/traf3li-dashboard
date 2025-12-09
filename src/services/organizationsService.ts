import api from './api'

export interface Organization {
  _id: string
  lawyerId: string
  name: string
  nameAr?: string
  type: 'company' | 'government' | 'court' | 'law_firm' | 'nonprofit' | 'other'
  registrationNumber?: string // Commercial Registration
  vatNumber?: string
  phone?: string
  fax?: string
  email?: string
  website?: string
  address?: string
  city?: string
  postalCode?: string
  country?: string
  industry?: string
  size?: 'small' | 'medium' | 'large' | 'enterprise'
  notes?: string
  linkedClients?: string[]
  linkedContacts?: string[]
  linkedCases?: string[]
  status: 'active' | 'inactive' | 'archived'
  createdAt: string
  updatedAt: string
}

export interface OrganizationFilters {
  type?: string
  status?: string
  search?: string
  page?: number
  limit?: number
}

export interface CreateOrganizationData {
  name: string
  nameAr?: string
  type: string
  registrationNumber?: string
  vatNumber?: string
  phone?: string
  fax?: string
  email?: string
  website?: string
  address?: string
  city?: string
  postalCode?: string
  country?: string
  industry?: string
  size?: string
  notes?: string
  status?: string
}

export interface UpdateOrganizationData extends Partial<CreateOrganizationData> {}

export interface OrganizationsResponse {
  data: Organization[]
  total: number
  page: number
  limit: number
}

const organizationsService = {
  // Get all organizations with optional filters
  getOrganizations: async (filters?: OrganizationFilters): Promise<OrganizationsResponse> => {
    const params = new URLSearchParams()
    if (filters?.type) params.append('type', filters.type)
    if (filters?.status) params.append('status', filters.status)
    if (filters?.search) params.append('search', filters.search)
    if (filters?.page) params.append('page', filters.page.toString())
    if (filters?.limit) params.append('limit', filters.limit.toString())

    const response = await api.get(`/organizations?${params.toString()}`)
    return response.data
  },

  // Get single organization by ID
  getOrganization: async (id: string): Promise<Organization> => {
    const response = await api.get(`/organizations/${id}`)
    return response.data
  },

  // Create new organization
  createOrganization: async (data: CreateOrganizationData): Promise<Organization> => {
    const response = await api.post('/organizations', data)
    return response.data
  },

  // Update organization
  updateOrganization: async (id: string, data: UpdateOrganizationData): Promise<Organization> => {
    const response = await api.patch(`/organizations/${id}`, data)
    return response.data
  },

  // Delete organization
  deleteOrganization: async (id: string): Promise<void> => {
    await api.delete(`/organizations/${id}`)
  },

  // Bulk delete organizations
  bulkDeleteOrganizations: async (ids: string[]): Promise<void> => {
    await api.delete('/organizations/bulk', { data: { ids } })
  },

  // Search organizations
  searchOrganizations: async (query: string): Promise<Organization[]> => {
    const response = await api.get(`/organizations/search?q=${encodeURIComponent(query)}`)
    return response.data
  },

  // Get organizations by client
  getOrganizationsByClient: async (clientId: string): Promise<Organization[]> => {
    const response = await api.get(`/organizations/client/${clientId}`)
    return response.data
  },

  // Link organization to case
  linkToCase: async (organizationId: string, caseId: string): Promise<Organization> => {
    const response = await api.post(`/organizations/${organizationId}/link-case`, { caseId })
    return response.data
  },

  // Link organization to client
  linkToClient: async (organizationId: string, clientId: string): Promise<Organization> => {
    const response = await api.post(`/organizations/${organizationId}/link-client`, { clientId })
    return response.data
  },

  // Link organization to contact
  linkToContact: async (organizationId: string, contactId: string): Promise<Organization> => {
    const response = await api.post(`/organizations/${organizationId}/link-contact`, { contactId })
    return response.data
  },
}

export default organizationsService
