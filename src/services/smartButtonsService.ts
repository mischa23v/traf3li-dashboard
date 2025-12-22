/**
 * @deprecated This service is not currently used in the application.
 *
 * IMPORTANT: The endpoints defined in this service (e.g., `/smart-buttons/:model/:recordId/counts`)
 * are NOT implemented or called anywhere in the codebase.
 *
 * ACTUAL IMPLEMENTATION:
 * The smart button counts functionality is implemented using entity-specific endpoints
 * in the `useSmartButtonCounts.ts` hook, which calls individual endpoints like:
 * - `/clients/:id/cases/count`
 * - `/clients/:id/invoices/count`
 * - `/clients/:id/documents/count`
 * etc.
 *
 * This file is preserved for reference and potential future use if a unified
 * smart buttons API endpoint is implemented on the backend.
 *
 * @see src/hooks/useSmartButtonCounts.ts for the actual implementation
 */
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
