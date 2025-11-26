import api from '@/lib/axios'

export type ExportFormat = 'xlsx' | 'csv' | 'pdf' | 'json'
export type EntityType = 'clients' | 'cases' | 'contacts' | 'organizations' | 'staff' | 'invoices' | 'time_entries' | 'documents' | 'followups' | 'tags'

export interface ExportOptions {
  format: ExportFormat
  entityType: EntityType
  filters?: Record<string, unknown>
  columns?: string[]
  includeRelated?: boolean
  dateRange?: {
    from: string
    to: string
  }
  language?: 'en' | 'ar'
}

export interface ExportJob {
  _id: string
  entityType: EntityType
  format: ExportFormat
  status: 'pending' | 'processing' | 'completed' | 'failed'
  progress: number
  fileUrl?: string
  fileName?: string
  fileSize?: number
  totalRecords?: number
  error?: string
  createdAt: string
  completedAt?: string
  expiresAt?: string
}

export interface ImportOptions {
  entityType: EntityType
  file: File
  mapping?: Record<string, string>
  skipDuplicates?: boolean
  updateExisting?: boolean
  dryRun?: boolean
}

export interface ImportJob {
  _id: string
  entityType: EntityType
  status: 'pending' | 'processing' | 'completed' | 'failed' | 'partial'
  progress: number
  totalRecords: number
  successCount: number
  errorCount: number
  skippedCount: number
  errors?: {
    row: number
    field: string
    message: string
  }[]
  createdAt: string
  completedAt?: string
}

export interface ImportPreview {
  columns: string[]
  sampleData: Record<string, unknown>[]
  suggestedMapping: Record<string, string>
  totalRows: number
}

export interface ExportTemplate {
  _id: string
  name: string
  nameAr: string
  entityType: EntityType
  format: ExportFormat
  columns: string[]
  filters?: Record<string, unknown>
  isDefault?: boolean
  createdAt: string
}

// Data Export/Import API Service
const dataExportService = {
  // ===== EXPORT OPERATIONS =====

  // Start export job
  startExport: async (options: ExportOptions): Promise<ExportJob> => {
    const response = await api.post('/exports', options)
    return response.data
  },

  // Get export job status
  getExportStatus: async (jobId: string): Promise<ExportJob> => {
    const response = await api.get(`/exports/${jobId}`)
    return response.data
  },

  // Get all export jobs
  getExportHistory: async (entityType?: EntityType): Promise<ExportJob[]> => {
    const response = await api.get('/exports', { params: { entityType } })
    return response.data
  },

  // Download exported file
  downloadExport: async (jobId: string): Promise<Blob> => {
    const response = await api.get(`/exports/${jobId}/download`, {
      responseType: 'blob'
    })
    return response.data
  },

  // Cancel export job
  cancelExport: async (jobId: string): Promise<void> => {
    await api.delete(`/exports/${jobId}`)
  },

  // ===== IMPORT OPERATIONS =====

  // Preview import file
  previewImport: async (file: File, entityType: EntityType): Promise<ImportPreview> => {
    const formData = new FormData()
    formData.append('file', file)
    formData.append('entityType', entityType)
    const response = await api.post('/imports/preview', formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    })
    return response.data
  },

  // Start import job
  startImport: async (options: ImportOptions): Promise<ImportJob> => {
    const formData = new FormData()
    formData.append('file', options.file)
    formData.append('entityType', options.entityType)
    if (options.mapping) {
      formData.append('mapping', JSON.stringify(options.mapping))
    }
    if (options.skipDuplicates !== undefined) {
      formData.append('skipDuplicates', String(options.skipDuplicates))
    }
    if (options.updateExisting !== undefined) {
      formData.append('updateExisting', String(options.updateExisting))
    }
    if (options.dryRun !== undefined) {
      formData.append('dryRun', String(options.dryRun))
    }
    const response = await api.post('/imports', formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    })
    return response.data
  },

  // Get import job status
  getImportStatus: async (jobId: string): Promise<ImportJob> => {
    const response = await api.get(`/imports/${jobId}`)
    return response.data
  },

  // Get all import jobs
  getImportHistory: async (entityType?: EntityType): Promise<ImportJob[]> => {
    const response = await api.get('/imports', { params: { entityType } })
    return response.data
  },

  // Cancel import job
  cancelImport: async (jobId: string): Promise<void> => {
    await api.delete(`/imports/${jobId}`)
  },

  // Download import error report
  downloadErrorReport: async (jobId: string): Promise<Blob> => {
    const response = await api.get(`/imports/${jobId}/errors`, {
      responseType: 'blob'
    })
    return response.data
  },

  // ===== EXPORT TEMPLATES =====

  // Get export templates
  getTemplates: async (entityType?: EntityType): Promise<ExportTemplate[]> => {
    const response = await api.get('/export-templates', { params: { entityType } })
    return response.data
  },

  // Create export template
  createTemplate: async (template: Omit<ExportTemplate, '_id' | 'createdAt'>): Promise<ExportTemplate> => {
    const response = await api.post('/export-templates', template)
    return response.data
  },

  // Update export template
  updateTemplate: async (id: string, data: Partial<ExportTemplate>): Promise<ExportTemplate> => {
    const response = await api.patch(`/export-templates/${id}`, data)
    return response.data
  },

  // Delete export template
  deleteTemplate: async (id: string): Promise<void> => {
    await api.delete(`/export-templates/${id}`)
  },

  // ===== UTILITY =====

  // Get available columns for entity type
  getEntityColumns: async (entityType: EntityType): Promise<{
    field: string
    label: string
    labelAr: string
    type: string
    required?: boolean
  }[]> => {
    const response = await api.get(`/exports/columns/${entityType}`)
    return response.data
  },

  // Generate sample import template
  downloadSampleTemplate: async (entityType: EntityType, format: 'xlsx' | 'csv'): Promise<Blob> => {
    const response = await api.get(`/imports/template/${entityType}`, {
      params: { format },
      responseType: 'blob'
    })
    return response.data
  },
}

export default dataExportService

// Entity column definitions for client-side use
export const entityColumns: Record<EntityType, { field: string; label: string; labelAr: string }[]> = {
  clients: [
    { field: 'firstName', label: 'First Name', labelAr: 'الاسم الأول' },
    { field: 'lastName', label: 'Last Name', labelAr: 'الاسم الأخير' },
    { field: 'email', label: 'Email', labelAr: 'البريد الإلكتروني' },
    { field: 'phone', label: 'Phone', labelAr: 'الهاتف' },
    { field: 'company', label: 'Company', labelAr: 'الشركة' },
    { field: 'type', label: 'Type', labelAr: 'النوع' },
    { field: 'status', label: 'Status', labelAr: 'الحالة' },
    { field: 'createdAt', label: 'Created At', labelAr: 'تاريخ الإنشاء' },
  ],
  cases: [
    { field: 'caseNumber', label: 'Case Number', labelAr: 'رقم القضية' },
    { field: 'title', label: 'Title', labelAr: 'العنوان' },
    { field: 'type', label: 'Type', labelAr: 'النوع' },
    { field: 'status', label: 'Status', labelAr: 'الحالة' },
    { field: 'priority', label: 'Priority', labelAr: 'الأولوية' },
    { field: 'clientName', label: 'Client', labelAr: 'العميل' },
    { field: 'court', label: 'Court', labelAr: 'المحكمة' },
    { field: 'filingDate', label: 'Filing Date', labelAr: 'تاريخ التقديم' },
  ],
  contacts: [
    { field: 'firstName', label: 'First Name', labelAr: 'الاسم الأول' },
    { field: 'lastName', label: 'Last Name', labelAr: 'الاسم الأخير' },
    { field: 'email', label: 'Email', labelAr: 'البريد الإلكتروني' },
    { field: 'phone', label: 'Phone', labelAr: 'الهاتف' },
    { field: 'type', label: 'Type', labelAr: 'النوع' },
    { field: 'category', label: 'Category', labelAr: 'الفئة' },
    { field: 'company', label: 'Company', labelAr: 'الشركة' },
    { field: 'city', label: 'City', labelAr: 'المدينة' },
  ],
  organizations: [
    { field: 'name', label: 'Name', labelAr: 'الاسم' },
    { field: 'nameAr', label: 'Arabic Name', labelAr: 'الاسم بالعربية' },
    { field: 'type', label: 'Type', labelAr: 'النوع' },
    { field: 'email', label: 'Email', labelAr: 'البريد الإلكتروني' },
    { field: 'phone', label: 'Phone', labelAr: 'الهاتف' },
    { field: 'registrationNumber', label: 'Registration Number', labelAr: 'رقم التسجيل' },
    { field: 'vatNumber', label: 'VAT Number', labelAr: 'الرقم الضريبي' },
  ],
  staff: [
    { field: 'firstName', label: 'First Name', labelAr: 'الاسم الأول' },
    { field: 'lastName', label: 'Last Name', labelAr: 'الاسم الأخير' },
    { field: 'email', label: 'Email', labelAr: 'البريد الإلكتروني' },
    { field: 'phone', label: 'Phone', labelAr: 'الهاتف' },
    { field: 'role', label: 'Role', labelAr: 'الدور' },
    { field: 'specialization', label: 'Specialization', labelAr: 'التخصص' },
    { field: 'status', label: 'Status', labelAr: 'الحالة' },
  ],
  invoices: [
    { field: 'invoiceNumber', label: 'Invoice Number', labelAr: 'رقم الفاتورة' },
    { field: 'clientName', label: 'Client', labelAr: 'العميل' },
    { field: 'amount', label: 'Amount', labelAr: 'المبلغ' },
    { field: 'status', label: 'Status', labelAr: 'الحالة' },
    { field: 'issueDate', label: 'Issue Date', labelAr: 'تاريخ الإصدار' },
    { field: 'dueDate', label: 'Due Date', labelAr: 'تاريخ الاستحقاق' },
    { field: 'paidDate', label: 'Paid Date', labelAr: 'تاريخ الدفع' },
  ],
  time_entries: [
    { field: 'date', label: 'Date', labelAr: 'التاريخ' },
    { field: 'duration', label: 'Duration', labelAr: 'المدة' },
    { field: 'description', label: 'Description', labelAr: 'الوصف' },
    { field: 'caseName', label: 'Case', labelAr: 'القضية' },
    { field: 'staffName', label: 'Staff', labelAr: 'الموظف' },
    { field: 'billable', label: 'Billable', labelAr: 'قابل للفوترة' },
    { field: 'rate', label: 'Rate', labelAr: 'السعر' },
  ],
  documents: [
    { field: 'name', label: 'Name', labelAr: 'الاسم' },
    { field: 'category', label: 'Category', labelAr: 'الفئة' },
    { field: 'fileType', label: 'File Type', labelAr: 'نوع الملف' },
    { field: 'fileSize', label: 'File Size', labelAr: 'حجم الملف' },
    { field: 'uploadedBy', label: 'Uploaded By', labelAr: 'رفع بواسطة' },
    { field: 'createdAt', label: 'Created At', labelAr: 'تاريخ الإنشاء' },
  ],
  followups: [
    { field: 'title', label: 'Title', labelAr: 'العنوان' },
    { field: 'type', label: 'Type', labelAr: 'النوع' },
    { field: 'priority', label: 'Priority', labelAr: 'الأولوية' },
    { field: 'status', label: 'Status', labelAr: 'الحالة' },
    { field: 'dueDate', label: 'Due Date', labelAr: 'تاريخ الاستحقاق' },
    { field: 'assignedTo', label: 'Assigned To', labelAr: 'مُسند إلى' },
  ],
  tags: [
    { field: 'name', label: 'Name', labelAr: 'الاسم' },
    { field: 'nameAr', label: 'Arabic Name', labelAr: 'الاسم بالعربية' },
    { field: 'color', label: 'Color', labelAr: 'اللون' },
    { field: 'entityType', label: 'Entity Type', labelAr: 'نوع الكيان' },
    { field: 'usageCount', label: 'Usage Count', labelAr: 'عدد الاستخدام' },
  ],
}
