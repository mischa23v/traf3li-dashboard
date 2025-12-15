import api from '@/lib/axios'

export interface RecurringInvoice {
  _id: string
  name: string
  nameAr?: string
  clientId: string | { firstName: string; lastName: string; name?: string; _id: string }
  caseId?: string | { caseNumber: string; title: string; _id: string }
  frequency: 'weekly' | 'biweekly' | 'monthly' | 'quarterly' | 'annually'
  dayOfMonth?: number
  dayOfWeek?: number
  startDate: string
  endDate?: string
  nextGenerationDate: string
  lastGeneratedDate?: string
  timesGenerated: number
  maxGenerations?: number
  status: 'active' | 'paused' | 'completed' | 'cancelled'
  items: RecurringInvoiceItem[]
  subtotal: number
  vatRate: number
  vatAmount: number
  total: number
  paymentTerms: string
  notes?: string
  notesAr?: string
  autoSend: boolean
  generatedInvoiceIds: string[]
  createdAt: string
  updatedAt: string
  createdBy?: string
}

export interface RecurringInvoiceItem {
  description: string
  descriptionAr?: string
  quantity: number
  unitPrice: number
  total: number
}

export interface CreateRecurringInvoiceData {
  name: string
  nameAr?: string
  clientId: string
  caseId?: string
  frequency: RecurringInvoice['frequency']
  dayOfMonth?: number
  dayOfWeek?: number
  startDate: string
  endDate?: string
  maxGenerations?: number
  items: RecurringInvoiceItem[]
  subtotal: number
  vatRate: number
  vatAmount: number
  total: number
  paymentTerms: string
  notes?: string
  notesAr?: string
  autoSend?: boolean
}

export interface UpdateRecurringInvoiceData extends Partial<CreateRecurringInvoiceData> {
  status?: RecurringInvoice['status']
}

export interface RecurringInvoiceFilters {
  status?: string
  clientId?: string
  caseId?: string
  frequency?: string
  search?: string
  page?: number
  limit?: number
}

export interface RecurringInvoiceListResponse {
  data: RecurringInvoice[]
  total: number
  page: number
  limit: number
  pages: number
}

export interface GenerateNextInvoiceResponse {
  invoice: any // Standard invoice object
  recurringInvoice: RecurringInvoice
}

// Recurring Invoice API Service
const recurringInvoiceService = {
  // Get all recurring invoices with filters
  getAll: async (filters?: RecurringInvoiceFilters): Promise<RecurringInvoiceListResponse> => {
    const response = await api.get('/recurring-invoices', { params: filters })
    return response.data
  },

  // Get recurring invoice by ID
  getById: async (id: string): Promise<RecurringInvoice> => {
    const response = await api.get(`/recurring-invoices/${id}`)
    return response.data
  },

  // Create new recurring invoice
  create: async (data: CreateRecurringInvoiceData): Promise<RecurringInvoice> => {
    const response = await api.post('/recurring-invoices', data)
    return response.data
  },

  // Update recurring invoice
  update: async (id: string, data: UpdateRecurringInvoiceData): Promise<RecurringInvoice> => {
    const response = await api.patch(`/recurring-invoices/${id}`, data)
    return response.data
  },

  // Delete recurring invoice
  delete: async (id: string): Promise<void> => {
    await api.delete(`/recurring-invoices/${id}`)
  },

  // Pause recurring invoice
  pause: async (id: string): Promise<RecurringInvoice> => {
    const response = await api.post(`/recurring-invoices/${id}/pause`)
    return response.data
  },

  // Resume recurring invoice
  resume: async (id: string): Promise<RecurringInvoice> => {
    const response = await api.post(`/recurring-invoices/${id}/resume`)
    return response.data
  },

  // Cancel recurring invoice
  cancel: async (id: string): Promise<RecurringInvoice> => {
    const response = await api.post(`/recurring-invoices/${id}/cancel`)
    return response.data
  },

  // Generate next invoice manually
  generateNext: async (id: string): Promise<GenerateNextInvoiceResponse> => {
    const response = await api.post(`/recurring-invoices/${id}/generate`)
    return response.data
  },

  // Preview next invoice
  previewNext: async (id: string): Promise<any> => {
    const response = await api.get(`/recurring-invoices/${id}/preview`)
    return response.data
  },

  // Get generation history
  getHistory: async (id: string): Promise<any[]> => {
    const response = await api.get(`/recurring-invoices/${id}/history`)
    return response.data
  },

  // Get statistics
  getStats: async (): Promise<{
    total: number
    active: number
    paused: number
    completed: number
    totalMonthlyRecurring: number
  }> => {
    const response = await api.get('/recurring-invoices/stats')
    return response.data
  },

  // Duplicate recurring invoice
  duplicate: async (id: string, name: string, nameAr?: string): Promise<RecurringInvoice> => {
    const response = await api.post(`/recurring-invoices/${id}/duplicate`, { name, nameAr })
    return response.data
  },
}

export default recurringInvoiceService

// Helper functions for frequency display
export const getFrequencyLabel = (frequency: RecurringInvoice['frequency'], lang: 'ar' | 'en' = 'ar') => {
  const labels = {
    ar: {
      weekly: 'أسبوعياً',
      biweekly: 'كل أسبوعين',
      monthly: 'شهرياً',
      quarterly: 'ربع سنوي',
      annually: 'سنوياً',
    },
    en: {
      weekly: 'Weekly',
      biweekly: 'Biweekly',
      monthly: 'Monthly',
      quarterly: 'Quarterly',
      annually: 'Annually',
    },
  }
  return labels[lang][frequency]
}

export const getStatusLabel = (status: RecurringInvoice['status'], lang: 'ar' | 'en' = 'ar') => {
  const labels = {
    ar: {
      active: 'نشط',
      paused: 'متوقف مؤقتاً',
      completed: 'مكتمل',
      cancelled: 'ملغي',
    },
    en: {
      active: 'Active',
      paused: 'Paused',
      completed: 'Completed',
      cancelled: 'Cancelled',
    },
  }
  return labels[lang][status]
}

export const getStatusColor = (status: RecurringInvoice['status']) => {
  const colors = {
    active: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200',
    paused: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200',
    completed: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200',
    cancelled: 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200',
  }
  return colors[status]
}
