import api from '@/lib/axios'

export interface InvoiceTemplate {
  _id: string
  name: string
  nameAr: string
  description?: string
  descriptionAr?: string
  type: 'standard' | 'detailed' | 'summary' | 'retainer' | 'pro_bono' | 'custom'
  isDefault: boolean
  isActive: boolean
  // Header settings
  header: {
    showLogo: boolean
    logoPosition: 'left' | 'center' | 'right'
    showCompanyInfo: boolean
    showInvoiceNumber: boolean
    showDate: boolean
    showDueDate: boolean
    customHeader?: string
    customHeaderAr?: string
  }
  // Client section settings
  clientSection: {
    showClientName: boolean
    showClientAddress: boolean
    showClientPhone: boolean
    showClientEmail: boolean
    showClientVat: boolean
  }
  // Items section settings
  itemsSection: {
    showDescription: boolean
    showQuantity: boolean
    showUnitPrice: boolean
    showDiscount: boolean
    showTax: boolean
    showLineTotal: boolean
    groupByCategory: boolean
    showTimeEntries: boolean
    showExpenses: boolean
  }
  // Footer settings
  footer: {
    showSubtotal: boolean
    showDiscount: boolean
    showTax: boolean
    showTotal: boolean
    showPaymentTerms: boolean
    showBankDetails: boolean
    showNotes: boolean
    showSignature: boolean
    customFooter?: string
    customFooterAr?: string
    paymentTerms?: string
    paymentTermsAr?: string
    bankDetails?: string
    bankDetailsAr?: string
  }
  // Styling
  styling: {
    primaryColor: string
    accentColor: string
    fontFamily: 'cairo' | 'tajawal' | 'arial' | 'times'
    fontSize: 'small' | 'medium' | 'large'
    tableStyle: 'striped' | 'bordered' | 'minimal'
    pageSize: 'a4' | 'letter'
    orientation: 'portrait' | 'landscape'
  }
  // Numbering
  numberingFormat: {
    prefix: string
    suffix: string
    digits: number
    startFrom: number
    includeYear: boolean
    includeMonth: boolean
    separator: string
  }
  // Tax settings
  taxSettings: {
    vatRate: number
    includeVatNumber: boolean
    vatDisplayMode: 'inclusive' | 'exclusive' | 'none'
  }
  createdAt: string
  updatedAt: string
  createdBy?: string
}

export interface CreateTemplateData {
  name: string
  nameAr: string
  description?: string
  descriptionAr?: string
  type: InvoiceTemplate['type']
  isDefault?: boolean
  isActive?: boolean
  header?: Partial<InvoiceTemplate['header']>
  clientSection?: Partial<InvoiceTemplate['clientSection']>
  itemsSection?: Partial<InvoiceTemplate['itemsSection']>
  footer?: Partial<InvoiceTemplate['footer']>
  styling?: Partial<InvoiceTemplate['styling']>
  numberingFormat?: Partial<InvoiceTemplate['numberingFormat']>
  taxSettings?: Partial<InvoiceTemplate['taxSettings']>
}

export interface UpdateTemplateData extends Partial<CreateTemplateData> {}

export interface TemplateFilters {
  type?: string
  isActive?: boolean
  search?: string
  page?: number
  limit?: number
}

export interface TemplateListResponse {
  data: InvoiceTemplate[]
  total: number
  page: number
  limit: number
  pages: number
}

// Invoice Template API Service
const invoiceTemplatesService = {
  // Get all templates with filters
  getAll: async (filters?: TemplateFilters): Promise<TemplateListResponse> => {
    const response = await api.get('/invoice-templates', { params: filters })
    return response.data
  },

  // Get template by ID
  getById: async (id: string): Promise<InvoiceTemplate> => {
    const response = await api.get(`/invoice-templates/${id}`)
    return response.data
  },

  // Get default template
  getDefault: async (): Promise<InvoiceTemplate | null> => {
    const response = await api.get('/invoice-templates/default')
    return response.data
  },

  // Create new template
  create: async (data: CreateTemplateData): Promise<InvoiceTemplate> => {
    const response = await api.post('/invoice-templates', data)
    return response.data
  },

  // Update template
  update: async (id: string, data: UpdateTemplateData): Promise<InvoiceTemplate> => {
    const response = await api.patch(`/invoice-templates/${id}`, data)
    return response.data
  },

  // Delete template
  delete: async (id: string): Promise<void> => {
    await api.delete(`/invoice-templates/${id}`)
  },

  // Duplicate template
  duplicate: async (id: string, name: string, nameAr: string): Promise<InvoiceTemplate> => {
    const response = await api.post(`/invoice-templates/${id}/duplicate`, { name, nameAr })
    return response.data
  },

  // Set template as default
  setDefault: async (id: string): Promise<InvoiceTemplate> => {
    const response = await api.post(`/invoice-templates/${id}/set-default`)
    return response.data
  },

  // Preview template with sample data
  preview: async (id: string): Promise<{ html: string; pdf?: string }> => {
    const response = await api.get(`/invoice-templates/${id}/preview`)
    return response.data
  },

  // Export template as JSON
  export: async (id: string): Promise<Blob> => {
    const response = await api.get(`/invoice-templates/${id}/export`, {
      responseType: 'blob'
    })
    return response.data
  },

  // Import template from JSON
  import: async (file: File): Promise<InvoiceTemplate> => {
    const formData = new FormData()
    formData.append('template', file)
    const response = await api.post('/invoice-templates/import', formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    })
    return response.data
  },
}

export default invoiceTemplatesService

// Default template settings
export const defaultTemplateSettings: Omit<InvoiceTemplate, '_id' | 'name' | 'nameAr' | 'createdAt' | 'updatedAt'> = {
  type: 'standard',
  isDefault: false,
  isActive: true,
  header: {
    showLogo: true,
    logoPosition: 'left',
    showCompanyInfo: true,
    showInvoiceNumber: true,
    showDate: true,
    showDueDate: true,
  },
  clientSection: {
    showClientName: true,
    showClientAddress: true,
    showClientPhone: true,
    showClientEmail: true,
    showClientVat: true,
  },
  itemsSection: {
    showDescription: true,
    showQuantity: true,
    showUnitPrice: true,
    showDiscount: true,
    showTax: true,
    showLineTotal: true,
    groupByCategory: false,
    showTimeEntries: true,
    showExpenses: true,
  },
  footer: {
    showSubtotal: true,
    showDiscount: true,
    showTax: true,
    showTotal: true,
    showPaymentTerms: true,
    showBankDetails: true,
    showNotes: true,
    showSignature: false,
  },
  styling: {
    primaryColor: '#1E40AF',
    accentColor: '#3B82F6',
    fontFamily: 'cairo',
    fontSize: 'medium',
    tableStyle: 'striped',
    pageSize: 'a4',
    orientation: 'portrait',
  },
  numberingFormat: {
    prefix: 'INV-',
    suffix: '',
    digits: 5,
    startFrom: 1,
    includeYear: true,
    includeMonth: false,
    separator: '-',
  },
  taxSettings: {
    vatRate: 15,
    includeVatNumber: true,
    vatDisplayMode: 'exclusive',
  },
}
