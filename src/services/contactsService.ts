import api from './api'

export interface Contact {
  _id: string
  lawyerId: string
  firstName: string
  lastName: string
  email?: string
  phone?: string
  alternatePhone?: string
  title?: string // Job title
  company?: string
  type: 'individual' | 'organization' | 'court' | 'attorney' | 'expert' | 'government' | 'other'
  category?: 'client_contact' | 'opposing_party' | 'witness' | 'expert_witness' | 'judge' | 'court_clerk' | 'other'
  address?: string
  city?: string
  postalCode?: string
  country?: string
  notes?: string
  tags?: string[]
  linkedCases?: string[] // Case IDs
  linkedClients?: string[] // Client IDs
  status: 'active' | 'inactive' | 'archived'
  createdAt: string
  updatedAt: string
}

export interface ContactFilters {
  type?: string
  category?: string
  status?: string
  search?: string
  page?: number
  limit?: number
}

export interface CreateContactData {
  firstName: string
  lastName: string
  email?: string
  phone?: string
  alternatePhone?: string
  title?: string
  company?: string
  type: string
  category?: string
  address?: string
  city?: string
  postalCode?: string
  country?: string
  notes?: string
  tags?: string[]
  status?: string
}

export interface UpdateContactData extends Partial<CreateContactData> {}

export interface ContactsResponse {
  data: Contact[]
  total: number
  page: number
  limit: number
}

const contactsService = {
  // Get all contacts with optional filters
  getContacts: async (filters?: ContactFilters): Promise<ContactsResponse> => {
    const params = new URLSearchParams()
    if (filters?.type) params.append('type', filters.type)
    if (filters?.category) params.append('category', filters.category)
    if (filters?.status) params.append('status', filters.status)
    if (filters?.search) params.append('search', filters.search)
    if (filters?.page) params.append('page', filters.page.toString())
    if (filters?.limit) params.append('limit', filters.limit.toString())

    const response = await api.get(`/contacts?${params.toString()}`)
    return response.data
  },

  // Get single contact by ID
  getContact: async (id: string): Promise<Contact> => {
    const response = await api.get(`/contacts/${id}`)
    return response.data
  },

  // Create new contact
  createContact: async (data: CreateContactData): Promise<Contact> => {
    const response = await api.post('/contacts', data)
    return response.data
  },

  // Update contact
  updateContact: async (id: string, data: UpdateContactData): Promise<Contact> => {
    const response = await api.patch(`/contacts/${id}`, data)
    return response.data
  },

  // Delete contact
  deleteContact: async (id: string): Promise<void> => {
    await api.delete(`/contacts/${id}`)
  },

  // Bulk delete contacts
  bulkDeleteContacts: async (ids: string[]): Promise<void> => {
    await api.delete('/contacts/bulk', { data: { ids } })
  },

  // Search contacts
  searchContacts: async (query: string): Promise<Contact[]> => {
    const response = await api.get(`/contacts/search?q=${encodeURIComponent(query)}`)
    return response.data
  },

  // Get contacts by case
  getContactsByCase: async (caseId: string): Promise<Contact[]> => {
    const response = await api.get(`/contacts/case/${caseId}`)
    return response.data
  },

  // Get contacts by client
  getContactsByClient: async (clientId: string): Promise<Contact[]> => {
    const response = await api.get(`/contacts/client/${clientId}`)
    return response.data
  },

  // Link contact to case
  linkToCase: async (contactId: string, caseId: string): Promise<Contact> => {
    const response = await api.post(`/contacts/${contactId}/link-case`, { caseId })
    return response.data
  },

  // Unlink contact from case
  unlinkFromCase: async (contactId: string, caseId: string): Promise<Contact> => {
    const response = await api.delete(`/contacts/${contactId}/unlink-case/${caseId}`)
    return response.data
  },

  // Link contact to client
  linkToClient: async (contactId: string, clientId: string): Promise<Contact> => {
    const response = await api.post(`/contacts/${contactId}/link-client`, { clientId })
    return response.data
  },

  // Unlink contact from client
  unlinkFromClient: async (contactId: string, clientId: string): Promise<Contact> => {
    const response = await api.delete(`/contacts/${contactId}/unlink-client/${clientId}`)
    return response.data
  },
}

export default contactsService
