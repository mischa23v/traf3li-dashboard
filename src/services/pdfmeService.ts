import api from './api'

// PDFMe Template Categories
export const pdfmeTemplateCategories = [
  'invoice',
  'contract',
  'receipt',
  'report',
  'statement',
  'letter',
  'certificate',
  'custom',
] as const

export type PdfmeTemplateCategory = (typeof pdfmeTemplateCategories)[number]

// PDFMe Template Types
export const pdfmeTemplateTypes = [
  'standard',
  'detailed',
  'summary',
  'minimal',
  'custom',
] as const

export type PdfmeTemplateType = (typeof pdfmeTemplateTypes)[number]

// PDFMe Template interface
export interface PdfmeTemplate {
  _id: string
  name: string
  nameAr: string
  description?: string
  descriptionAr?: string
  category: PdfmeTemplateCategory
  type: PdfmeTemplateType
  basePdf: string
  schemas: any[] // PDFMe schemas - can be typed more specifically if needed
  isDefault: boolean
  isActive: boolean
  createdAt: string
  updatedAt: string
  createdBy: string | { _id: string; fullName: string }
}

// PDFMe Template filters
export interface PdfmeTemplateFilters {
  category?: PdfmeTemplateCategory
  type?: PdfmeTemplateType
  isDefault?: boolean
  isActive?: boolean
  search?: string
  page?: number
  limit?: number
}

// Response types
export interface PdfmeTemplatesResponse {
  data: PdfmeTemplate[]
  total: number
  page: number
  limit: number
}

// Create template data
export interface CreatePdfmeTemplateData {
  name: string
  nameAr: string
  description?: string
  descriptionAr?: string
  category: PdfmeTemplateCategory
  type: PdfmeTemplateType
  basePdf: string
  schemas: any[]
  isDefault?: boolean
  isActive?: boolean
}

// Update template data
export interface UpdatePdfmeTemplateData {
  name?: string
  nameAr?: string
  description?: string
  descriptionAr?: string
  category?: PdfmeTemplateCategory
  type?: PdfmeTemplateType
  basePdf?: string
  schemas?: any[]
  isDefault?: boolean
  isActive?: boolean
}

// Generate PDF data
export interface GeneratePdfData {
  templateId: string
  inputs: Record<string, any>
  type?: 'pdf' | 'base64' | 'arraybuffer'
}

// Invoice generation data
export interface GenerateInvoiceData {
  invoiceNumber: string
  date: string
  clientName: string
  clientAddress?: string
  items: Array<{
    description: string
    quantity: number
    price: number
    total: number
  }>
  subtotal: number
  tax?: number
  total: number
  notes?: string
  [key: string]: any // Additional fields
}

// Contract generation data
export interface GenerateContractData {
  contractNumber: string
  date: string
  partyA: {
    name: string
    address?: string
    nationalId?: string
  }
  partyB: {
    name: string
    address?: string
    nationalId?: string
  }
  subject: string
  terms: string[]
  amount?: number
  startDate?: string
  endDate?: string
  [key: string]: any // Additional fields
}

// Receipt generation data
export interface GenerateReceiptData {
  receiptNumber: string
  date: string
  receivedFrom: string
  amount: number
  amountInWords: string
  purpose: string
  paymentMethod?: string
  notes?: string
  [key: string]: any // Additional fields
}

const pdfmeService = {
  // Get all templates with filters
  getTemplates: async (filters?: PdfmeTemplateFilters): Promise<PdfmeTemplatesResponse> => {
    const params = new URLSearchParams()
    if (filters?.category) params.append('category', filters.category)
    if (filters?.type) params.append('type', filters.type)
    if (filters?.isDefault !== undefined) {
      params.append('isDefault', String(filters.isDefault))
    }
    if (filters?.isActive !== undefined) {
      params.append('isActive', String(filters.isActive))
    }
    if (filters?.search) params.append('search', filters.search)
    if (filters?.page) params.append('page', filters.page.toString())
    if (filters?.limit) params.append('limit', filters.limit.toString())

    const response = await api.get(`/pdfme/templates?${params.toString()}`)
    return response.data
  },

  // Get single template
  getTemplate: async (id: string): Promise<PdfmeTemplate> => {
    const response = await api.get(`/pdfme/templates/${id}`)
    return response.data
  },

  // Create new template
  createTemplate: async (data: CreatePdfmeTemplateData): Promise<PdfmeTemplate> => {
    const response = await api.post('/pdfme/templates', data)
    return response.data
  },

  // Update template
  updateTemplate: async (
    id: string,
    data: UpdatePdfmeTemplateData
  ): Promise<PdfmeTemplate> => {
    const response = await api.put(`/pdfme/templates/${id}`, data)
    return response.data
  },

  // Delete template
  deleteTemplate: async (id: string): Promise<void> => {
    await api.delete(`/pdfme/templates/${id}`)
  },

  // Clone template
  cloneTemplate: async (id: string, name?: string): Promise<PdfmeTemplate> => {
    const response = await api.post(`/pdfme/templates/${id}/clone`, { name })
    return response.data
  },

  // Set template as default for its category
  setDefaultTemplate: async (id: string): Promise<PdfmeTemplate> => {
    const response = await api.post(`/pdfme/templates/${id}/set-default`)
    return response.data
  },

  // Get default template for a category
  getDefaultTemplate: async (category: PdfmeTemplateCategory): Promise<PdfmeTemplate> => {
    const response = await api.get(`/pdfme/templates/default/${category}`)
    return response.data
  },

  // Preview template with sample inputs
  previewTemplate: async (
    id: string,
    inputs?: Record<string, any>
  ): Promise<Blob> => {
    const response = await api.post(
      `/pdfme/templates/${id}/preview`,
      { inputs },
      { responseType: 'blob' }
    )
    return response.data
  },

  // Generate PDF from template
  generatePdf: async (
    templateId: string,
    inputs: Record<string, any>,
    type: 'pdf' | 'base64' | 'arraybuffer' = 'pdf'
  ): Promise<Blob | string> => {
    const responseType = type === 'pdf' ? 'blob' : type === 'arraybuffer' ? 'arraybuffer' : 'json'
    const response = await api.post(
      '/pdfme/generate',
      { templateId, inputs, type },
      { responseType }
    )
    return response.data
  },

  // Generate invoice PDF
  generateInvoicePdf: async (data: GenerateInvoiceData): Promise<Blob> => {
    const response = await api.post('/pdfme/generate/invoice', data, {
      responseType: 'blob',
    })
    return response.data
  },

  // Generate contract PDF
  generateContractPdf: async (data: GenerateContractData): Promise<Blob> => {
    const response = await api.post('/pdfme/generate/contract', data, {
      responseType: 'blob',
    })
    return response.data
  },

  // Generate receipt PDF
  generateReceiptPdf: async (data: GenerateReceiptData): Promise<Blob> => {
    const response = await api.post('/pdfme/generate/receipt', data, {
      responseType: 'blob',
    })
    return response.data
  },
}

export default pdfmeService
