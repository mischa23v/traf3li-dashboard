/**
 * PDPL Consent API Service
 * Integrates with backend consent management endpoints
 */

import { apiClient } from '@/lib/api'
import type { ConsentCategory } from '@/lib/consent-manager'

/**
 * Backend consent record format
 */
export interface BackendConsentRecord {
  category: string
  granted: boolean
  grantedAt: string | null
  withdrawnAt: string | null
  version: string
}

/**
 * Backend consent response
 */
export interface ConsentResponse {
  success: boolean
  data: {
    userId: string
    consents: Record<string, BackendConsentRecord>
    policyVersion: string
    lastUpdated: string
  }
}

/**
 * Consent history entry from backend
 */
export interface ConsentHistoryEntry {
  id: string
  category: string
  action: 'granted' | 'withdrawn' | 'updated'
  timestamp: string
  ipAddress?: string
  userAgent?: string
  reason?: string
}

/**
 * Data export request response
 */
export interface DataExportResponse {
  success: boolean
  data: {
    requestId: string
    status: 'pending' | 'processing' | 'ready' | 'expired'
    estimatedCompletionTime?: string
    downloadUrl?: string
    expiresAt?: string
  }
}

/**
 * Get user's current consent status from backend
 */
export async function getConsents(): Promise<ConsentResponse> {
  const response = await apiClient.get('/consent')
  return response.data
}

/**
 * Save all consents to backend
 */
export async function saveConsents(
  consents: Record<string, boolean>
): Promise<ConsentResponse> {
  const response = await apiClient.post('/consent', { consents })
  return response.data
}

/**
 * Update a single consent category
 */
export async function updateConsent(
  category: ConsentCategory | string,
  granted: boolean
): Promise<ConsentResponse> {
  const response = await apiClient.put(`/consent/${category}`, { granted })
  return response.data
}

/**
 * Withdraw all consents and request data deletion (PDPL Article 14)
 */
export async function withdrawAllConsents(reason?: string): Promise<{
  success: boolean
  message: string
  deletionRequestId?: string
}> {
  const response = await apiClient.delete('/consent', {
    data: { reason }
  })
  return response.data
}

/**
 * Request data export (PDPL Article 15 - Right to Access)
 */
export async function requestDataExport(): Promise<DataExportResponse> {
  const response = await apiClient.post('/consent/export')
  return response.data
}

/**
 * Check data export request status
 */
export async function getDataExportStatus(
  requestId: string
): Promise<DataExportResponse> {
  const response = await apiClient.get(`/consent/export/${requestId}`)
  return response.data
}

/**
 * Get consent history for audit/transparency
 */
export async function getConsentHistory(params?: {
  limit?: number
  offset?: number
  category?: string
}): Promise<{
  success: boolean
  data: ConsentHistoryEntry[]
  total: number
}> {
  const response = await apiClient.get('/consent/history', { params })
  return response.data
}

/**
 * Accept all optional consents
 */
export async function acceptAllConsents(): Promise<ConsentResponse> {
  const allConsents = {
    essential: true,
    functional: true,
    analytics: true,
    marketing: true,
    third_party: true,
    aiProcessing: true,
    communications: true,
  }
  return saveConsents(allConsents)
}

/**
 * Reject all optional consents (keep only essential)
 */
export async function rejectAllConsents(): Promise<ConsentResponse> {
  const minimalConsents = {
    essential: true,
    functional: false,
    analytics: false,
    marketing: false,
    third_party: false,
    aiProcessing: false,
    communications: false,
  }
  return saveConsents(minimalConsents)
}

/**
 * Sync local consent state with backend
 * Call this on login to ensure consistency
 */
export async function syncConsentsWithBackend(): Promise<void> {
  try {
    const response = await getConsents()

    if (response.success && response.data.consents) {
      // Import local consent manager
      const { updateConsents } = await import('@/lib/consent-manager')

      // Sync each consent category
      const localConsents: Record<string, boolean> = {}
      for (const [category, record] of Object.entries(response.data.consents)) {
        localConsents[category as ConsentCategory] = record.granted
      }

      updateConsents(localConsents as Record<ConsentCategory, boolean>)
    }
  } catch (error) {
    if (import.meta.env.DEV) {
      console.warn('[Consent Service] Failed to sync consents with backend:', error)
    }
  }
}

/**
 * Check if user needs to provide consent (new user or policy updated)
 */
export async function checkConsentRequired(): Promise<{
  required: boolean
  reason?: 'new_user' | 'policy_updated' | 'expired'
  policyVersion?: string
}> {
  try {
    const response = await getConsents()

    if (!response.success || !response.data.consents) {
      return { required: true, reason: 'new_user' }
    }

    // Check if any non-essential consent is missing
    const hasExplicitConsent = Object.values(response.data.consents).some(
      c => c.grantedAt || c.withdrawnAt
    )

    if (!hasExplicitConsent) {
      return { required: true, reason: 'new_user' }
    }

    return { required: false, policyVersion: response.data.policyVersion }
  } catch (error: any) {
    // If 404, user has no consent records
    if (error.status === 404) {
      return { required: true, reason: 'new_user' }
    }
    throw error
  }
}

export default {
  getConsents,
  saveConsents,
  updateConsent,
  withdrawAllConsents,
  requestDataExport,
  getDataExportStatus,
  getConsentHistory,
  acceptAllConsents,
  rejectAllConsents,
  syncConsentsWithBackend,
  checkConsentRequired,
}
