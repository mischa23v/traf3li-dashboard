import { apiClient } from '@/lib/api'

// Types
export interface SmartButtonCounts {
  cases: number
  invoices: number
  documents: number
  contacts: number
  tasks: number
  payments: number
  timeEntries: number
  expenses: number
  activities: number
  events: number
}

export type SupportedModel =
  | 'client'
  | 'case'
  | 'contact'
  | 'invoice'
  | 'lead'
  | 'task'
  | 'expense'
  | 'payment'
  | 'document'
  | 'timeEntry'
  | 'event'

// API Service
export const smartButtonsService = {
  /**
   * Get related record counts for a specific record
   * GET /api/smart-buttons/:model/:recordId/counts
   */
  async getCounts(model: SupportedModel, recordId: string): Promise<SmartButtonCounts> {
    const response = await apiClient.get(`/smart-buttons/${model}/${recordId}/counts`)
    return response.data.data
  },

  /**
   * Get counts for multiple records at once (batch)
   * POST /api/smart-buttons/:model/batch-counts
   */
  async getBatchCounts(
    model: SupportedModel,
    recordIds: string[]
  ): Promise<Record<string, SmartButtonCounts>> {
    const response = await apiClient.post(`/smart-buttons/${model}/batch-counts`, { recordIds })
    return response.data.data
  },
}

export default smartButtonsService
