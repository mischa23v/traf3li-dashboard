/**
 * Journal Entry Service
 * Handles manual journal entries for accounting adjustments and corrections
 */

import apiClient from '@/lib/api'

// ==================== TYPES ====================
// Matches contract: contract2/types/accounting.ts

/**
 * Journal Entry Status
 * Matches contract: contract2/types/accounting.ts - JournalEntryStatus
 */
export type JournalEntryStatus = 'draft' | 'posted' | 'voided'

/**
 * Journal Entry Type
 * Matches contract: contract2/types/accounting.ts - JournalEntryType
 */
export type JournalEntryType = 'general' | 'adjusting' | 'closing' | 'reversing' | 'opening' | 'other'

/**
 * Journal Entry
 * Matches contract: contract2/types/accounting.ts - JournalEntry
 */
export interface JournalEntry {
  _id: string
  entryNumber?: string
  date: string
  description: string
  descriptionAr?: string
  entryType: JournalEntryType
  status: JournalEntryStatus
  lines: JournalEntryLine[]
  notes?: string
  attachments?: string[]
  glEntries?: string[]
  firmId?: string
  lawyerId?: string
  createdBy?: string
  updatedBy?: string
  postedBy?: string
  postedAt?: string
  voidedBy?: string
  voidedAt?: string
  voidReason?: string
  totalDebit?: number
  totalCredit?: number
  isBalanced?: boolean
  difference?: number
  createdAt: string
  updatedAt: string
}

/**
 * Journal Entry Line
 * Matches contract: contract2/types/accounting.ts - JournalEntryLine
 */
export interface JournalEntryLine {
  accountId: string | {
    _id: string
    code: string
    name: string
    nameAr?: string
    type: string
  }
  debit?: number
  credit?: number
  description?: string
  caseId?: string
}

/**
 * Create Journal Entry Data
 * Matches contract: contract2/types/accounting.ts - CreateJournalEntryRequest
 */
export interface CreateJournalEntryData {
  date: string
  description: string
  descriptionAr?: string
  entryType?: JournalEntryType
  lines: JournalEntryLine[]
  notes?: string
  attachments?: string[]
}

/**
 * Update Journal Entry Data
 * Matches contract: contract2/types/accounting.ts - UpdateJournalEntryRequest
 */
export interface UpdateJournalEntryData {
  date?: string
  description?: string
  descriptionAr?: string
  entryType?: JournalEntryType
  lines?: JournalEntryLine[]
  notes?: string
  attachments?: string[]
}

/**
 * Simple Journal Entry Data
 * Matches contract: contract2/types/accounting.ts - CreateSimpleEntryRequest
 */
export interface SimpleJournalEntryData {
  date: string
  description: string
  descriptionAr?: string
  debitAccountId: string
  creditAccountId: string
  amount: number
  caseId?: string
  notes?: string
  entryType?: JournalEntryType
}

/**
 * Journal Entry Filters
 * Matches contract: contract2/types/accounting.ts - GetJournalEntriesQuery
 */
export interface JournalEntryFilters {
  status?: JournalEntryStatus
  startDate?: string
  endDate?: string
  entryType?: JournalEntryType
  page?: number
  limit?: number
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
   * Matches contract: contract2/types/accounting.ts - CreateJournalEntryRequest
   */
  createEntry: async (data: CreateJournalEntryData): Promise<JournalEntry> => {
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
   * Matches contract: contract2/types/accounting.ts - VoidJournalEntryRequest
   */
  voidEntry: async (id: string, reason: string): Promise<JournalEntry> => {
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
    date: string
    amount: number
    description?: string
  }): Promise<JournalEntry> => {
    const response = await apiClient.post(`/journal-entries/from-template/${templateId}`, data)
    return response.data.data
  },
}

export default journalEntryService
