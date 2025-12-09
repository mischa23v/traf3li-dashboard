/**
 * Journal Entry Service
 * Handles manual journal entries for accounting adjustments and corrections
 */

import apiClient from '@/lib/api'

// ==================== TYPES ====================

export type JournalEntryStatus = 'draft' | 'pending' | 'posted' | 'voided'

export interface JournalEntry {
  _id: string
  entryNumber: string
  transactionDate: string
  description: string
  memo?: string
  lines: JournalEntryLine[]
  status: JournalEntryStatus
  totalDebit: number
  totalCredit: number
  isBalanced: boolean
  glEntryId?: string
  firmId: string
  createdBy: string | {
    _id: string
    firstName: string
    lastName: string
    email: string
  }
  postedBy?: string | {
    _id: string
    firstName: string
    lastName: string
    email: string
  }
  postedAt?: string
  voidedBy?: string
  voidedAt?: string
  voidReason?: string
  attachments?: Array<{
    fileName: string
    fileUrl: string
    uploadedAt: string
  }>
  createdAt: string
  updatedAt: string
}

export interface JournalEntryLine {
  _id?: string
  accountId: string | {
    _id: string
    code: string
    name: string
    nameAr?: string
    type: string
  }
  debit: number
  credit: number
  description?: string
  caseId?: string | {
    _id: string
    caseNumber: string
    title: string
  }
  clientId?: string | {
    _id: string
    firstName: string
    lastName: string
  }
}

export interface CreateJournalEntryData {
  transactionDate: string
  description: string
  memo?: string
  lines: Array<{
    accountId: string
    debit: number
    credit: number
    description?: string
    caseId?: string
    clientId?: string
  }>
  attachments?: File[]
}

export interface UpdateJournalEntryData {
  transactionDate?: string
  description?: string
  memo?: string
  lines?: Array<{
    accountId: string
    debit: number
    credit: number
    description?: string
    caseId?: string
    clientId?: string
  }>
}

export interface SimpleJournalEntryData {
  transactionDate: string
  description: string
  debitAccountId: string
  creditAccountId: string
  amount: number
  caseId?: string
  clientId?: string
  memo?: string
}

export interface JournalEntryFilters {
  status?: JournalEntryStatus
  startDate?: string
  endDate?: string
  createdBy?: string
  accountId?: string
  caseId?: string
  clientId?: string
  page?: number
  limit?: number
  sort?: string
}

// ==================== SERVICE ====================

const journalEntryService = {
  /**
   * Create simple two-line journal entry (debit/credit)
   * POST /api/journal-entries/simple
   */
  createSimpleEntry: async (data: SimpleJournalEntryData): Promise<JournalEntry> => {
    const response = await apiClient.post('/journal-entries/simple', data)
    return response.data.data
  },

  /**
   * Get all journal entries
   * GET /api/journal-entries
   */
  getEntries: async (filters?: JournalEntryFilters): Promise<{
    entries: JournalEntry[]
    total: number
    page: number
    totalPages: number
  }> => {
    const response = await apiClient.get('/journal-entries', { params: filters })
    return {
      entries: response.data.data || response.data.entries || [],
      total: response.data.total || 0,
      page: response.data.page || 1,
      totalPages: response.data.totalPages || 1,
    }
  },

  /**
   * Get single journal entry
   * GET /api/journal-entries/:id
   */
  getEntry: async (id: string): Promise<JournalEntry> => {
    const response = await apiClient.get(`/journal-entries/${id}`)
    return response.data.data
  },

  /**
   * Create draft journal entry
   * POST /api/journal-entries
   */
  createEntry: async (data: CreateJournalEntryData): Promise<JournalEntry> => {
    // If attachments are included, use FormData
    if (data.attachments && data.attachments.length > 0) {
      const formData = new FormData()
      formData.append('transactionDate', data.transactionDate)
      formData.append('description', data.description)
      if (data.memo) formData.append('memo', data.memo)
      formData.append('lines', JSON.stringify(data.lines))

      data.attachments.forEach((file) => {
        formData.append('attachments', file)
      })

      const response = await apiClient.post('/journal-entries', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      })
      return response.data.data
    }

    // Standard JSON request
    const response = await apiClient.post('/journal-entries', data)
    return response.data.data
  },

  /**
   * Update draft journal entry
   * PATCH /api/journal-entries/:id
   */
  updateEntry: async (id: string, data: UpdateJournalEntryData): Promise<JournalEntry> => {
    const response = await apiClient.patch(`/journal-entries/${id}`, data)
    return response.data.data
  },

  /**
   * Post journal entry to GL
   * This makes the entry permanent and creates GL entries
   * POST /api/journal-entries/:id/post
   */
  postEntry: async (id: string): Promise<{
    journalEntry: JournalEntry
    glEntry: any
  }> => {
    const response = await apiClient.post(`/journal-entries/${id}/post`)
    return response.data.data
  },

  /**
   * Void posted journal entry
   * Creates reversing entry in GL
   * POST /api/journal-entries/:id/void
   */
  voidEntry: async (id: string, reason?: string): Promise<{
    journalEntry: JournalEntry
    reversingGLEntry?: any
  }> => {
    const response = await apiClient.post(`/journal-entries/${id}/void`, { reason })
    return response.data.data
  },

  /**
   * Delete draft journal entry
   * Only works for draft entries
   * DELETE /api/journal-entries/:id
   */
  deleteEntry: async (id: string): Promise<void> => {
    await apiClient.delete(`/journal-entries/${id}`)
  },

  /**
   * Upload attachment to journal entry
   * POST /api/journal-entries/:id/attachments
   */
  uploadAttachment: async (id: string, file: File): Promise<JournalEntry> => {
    const formData = new FormData()
    formData.append('file', file)

    const response = await apiClient.post(`/journal-entries/${id}/attachments`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    })
    return response.data.data
  },

  /**
   * Delete attachment from journal entry
   * DELETE /api/journal-entries/:id/attachments/:attachmentId
   */
  deleteAttachment: async (id: string, attachmentId: string): Promise<JournalEntry> => {
    const response = await apiClient.delete(`/journal-entries/${id}/attachments/${attachmentId}`)
    return response.data.data
  },

  /**
   * Get journal entry statistics
   * GET /api/journal-entries/stats
   */
  getStats: async (filters?: { startDate?: string; endDate?: string }): Promise<{
    total: number
    byStatus: {
      draft: number
      pending: number
      posted: number
      voided: number
    }
    totalAmount: number
    averageAmount: number
  }> => {
    const response = await apiClient.get('/journal-entries/stats', { params: filters })
    return response.data.data
  },

  /**
   * Validate journal entry balance
   * POST /api/journal-entries/validate
   */
  validateEntry: async (data: {
    lines: Array<{
      accountId: string
      debit: number
      credit: number
    }>
  }): Promise<{
    isBalanced: boolean
    totalDebit: number
    totalCredit: number
    difference: number
  }> => {
    const response = await apiClient.post('/journal-entries/validate', data)
    return response.data.data
  },

  /**
   * Get recent journal entries (last 10)
   * GET /api/journal-entries/recent
   */
  getRecentEntries: async (): Promise<JournalEntry[]> => {
    const response = await apiClient.get('/journal-entries/recent')
    return response.data.data || []
  },

  /**
   * Duplicate journal entry (creates new draft)
   * POST /api/journal-entries/:id/duplicate
   */
  duplicateEntry: async (id: string): Promise<JournalEntry> => {
    const response = await apiClient.post(`/journal-entries/${id}/duplicate`)
    return response.data.data
  },

  /**
   * Get journal entry templates
   * GET /api/journal-entries/templates
   */
  getTemplates: async (): Promise<Array<{
    _id: string
    name: string
    nameAr?: string
    description: string
    lines: JournalEntryLine[]
  }>> => {
    const response = await apiClient.get('/journal-entries/templates')
    return response.data.data || []
  },

  /**
   * Create journal entry from template
   * POST /api/journal-entries/from-template/:templateId
   */
  createFromTemplate: async (templateId: string, data: {
    transactionDate: string
    amount: number
    description?: string
  }): Promise<JournalEntry> => {
    const response = await apiClient.post(`/journal-entries/from-template/${templateId}`, data)
    return response.data.data
  },
}

export default journalEntryService
