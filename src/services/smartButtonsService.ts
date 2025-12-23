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

// ════════════════════════════════════════════════════════════
// BILINGUAL ERROR MESSAGES
// ════════════════════════════════════════════════════════════

const MESSAGES = {
  getCounts: {
    warning: {
      en: '[DEPRECATED] smartButtonsService.getCounts() is not implemented.',
      ar: '[مهمل] smartButtonsService.getCounts() غير مطبق.',
    },
    endpoint: {
      en: (model: string, recordId: string) => `Endpoint /smart-buttons/${model}/${recordId}/counts does not exist in the backend.`,
      ar: (model: string, recordId: string) => `نقطة النهاية /smart-buttons/${model}/${recordId}/counts غير موجودة في الخادم.`,
    },
    solution: {
      en: 'Use useSmartButtonCounts hook instead.',
      ar: 'استخدم useSmartButtonCounts بدلاً من ذلك.',
    },
    error: {
      en: 'Smart buttons service is deprecated. Please use entity-specific endpoints via useSmartButtonCounts hook.',
      ar: 'خدمة الأزرار الذكية مهملة. الرجاء استخدام نقاط النهاية الخاصة بالكيانات عبر useSmartButtonCounts.',
    }
  },
  getBatchCounts: {
    warning: {
      en: '[DEPRECATED] smartButtonsService.getBatchCounts() is not implemented.',
      ar: '[مهمل] smartButtonsService.getBatchCounts() غير مطبق.',
    },
    endpoint: {
      en: (model: string) => `Endpoint /smart-buttons/${model}/batch-counts does not exist in the backend.`,
      ar: (model: string) => `نقطة النهاية /smart-buttons/${model}/batch-counts غير موجودة في الخادم.`,
    },
    solution: {
      en: 'Use useSmartButtonCounts hook instead.',
      ar: 'استخدم useSmartButtonCounts بدلاً من ذلك.',
    },
    error: {
      en: 'Smart buttons batch service is deprecated. Please use entity-specific endpoints via useSmartButtonCounts hook.',
      ar: 'خدمة الأزرار الذكية الجماعية مهملة. الرجاء استخدام نقاط النهاية الخاصة بالكيانات عبر useSmartButtonCounts.',
    }
  }
}

// API Service
export const smartButtonsService = {
  /**
   * Get related record counts for a specific record
   * GET /api/smart-buttons/:model/:recordId/counts
   * @deprecated This endpoint is not implemented in the backend
   *
   * تحذير: نقطة النهاية هذه غير مطبقة في الخادم
   */
  async getCounts(model: SupportedModel, recordId: string): Promise<SmartButtonCounts> {
    const msg = MESSAGES.getCounts

    // Bilingual warning
    console.warn(
      `${msg.warning.en} ${msg.endpoint.en(model, recordId)} ${msg.solution.en}\n` +
      `${msg.warning.ar} ${msg.endpoint.ar(model, recordId)} ${msg.solution.ar}`
    )

    // Bilingual error
    const error = new Error(
      `${msg.error.en} | ${msg.error.ar}`
    )
    error.name = 'DeprecatedEndpointError'
    throw error
  },

  /**
   * Get counts for multiple records at once (batch)
   * POST /api/smart-buttons/:model/batch-counts
   * @deprecated This endpoint is not implemented in the backend
   *
   * تحذير: نقطة النهاية هذه غير مطبقة في الخادم
   */
  async getBatchCounts(
    model: SupportedModel,
    recordIds: string[]
  ): Promise<Record<string, SmartButtonCounts>> {
    const msg = MESSAGES.getBatchCounts

    // Bilingual warning
    console.warn(
      `${msg.warning.en} ${msg.endpoint.en(model)} ${msg.solution.en}\n` +
      `${msg.warning.ar} ${msg.endpoint.ar(model)} ${msg.solution.ar}`
    )

    // Bilingual error
    const error = new Error(
      `${msg.error.en} | ${msg.error.ar}`
    )
    error.name = 'DeprecatedEndpointError'
    throw error
  },
}

export default smartButtonsService
