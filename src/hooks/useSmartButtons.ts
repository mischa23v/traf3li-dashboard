/**
 * @deprecated This hook is deprecated and should not be used.
 *
 * IMPORTANT: This hook uses the deprecated smartButtonsService which relies on
 * endpoints that are NOT implemented in the backend.
 *
 * ACTUAL IMPLEMENTATION:
 * Use the `useSmartButtonCounts` hook instead, which calls entity-specific endpoints.
 *
 * @see src/hooks/useSmartButtonCounts.ts for the current implementation
 *
 * تحذير: هذا الـ Hook مهمل ولا يجب استخدامه
 * يستخدم هذا الـ Hook خدمة smartButtonsService المهملة والتي تعتمد على نقاط نهاية
 * غير مطبقة في الخادم
 *
 * الاستخدام الصحيح: استخدم useSmartButtonCounts بدلاً من ذلك
 */

import { useQuery, useQueries } from '@tanstack/react-query'
import { QueryKeys } from '@/lib/query-keys'
import { smartButtonsService, type SupportedModel, type SmartButtonCounts } from '@/services/smartButtonsService'
import { CACHE_TIMES } from '@/config/cache'

// ════════════════════════════════════════════════════════════
// DEPRECATION WARNING
// ════════════════════════════════════════════════════════════

const DEPRECATION_MESSAGE = {
  en: '[DEPRECATED] useSmartButtons hook is deprecated. This hook uses non-existent backend endpoints. Please use useSmartButtonCounts hook instead.',
  ar: '[مهمل] useSmartButtons مهمل. يستخدم هذا الـ Hook نقاط نهاية غير موجودة في الخادم. الرجاء استخدام useSmartButtonCounts بدلاً من ذلك.'
}

const ERROR_MESSAGE = {
  en: 'Smart buttons service is deprecated. Please use useSmartButtonCounts hook for entity-specific count queries.',
  ar: 'خدمة الأزرار الذكية مهملة. الرجاء استخدام useSmartButtonCounts للاستعلامات الخاصة بالكيانات.'
}

function logDeprecationWarning() {
  console.warn(`${DEPRECATION_MESSAGE.en} | ${DEPRECATION_MESSAGE.ar}`)
  console.warn('See: src/hooks/useSmartButtonCounts.ts')
}

function createDeprecationError(): Error {
  const error = new Error(`${ERROR_MESSAGE.en} | ${ERROR_MESSAGE.ar}`)
  error.name = 'DeprecatedServiceError'
  return error
}

// ════════════════════════════════════════════════════════════
// TYPES
// ════════════════════════════════════════════════════════════

export interface UseSmartButtonsResult {
  counts: SmartButtonCounts | null
  isLoading: boolean
  isError: boolean
  error: Error | null
  refetch: () => void
}

export interface UseSmartButtonsBatchResult {
  countsMap: Record<string, SmartButtonCounts> | null
  isLoading: boolean
  isError: boolean
  error: Error | null
  refetch: () => void
}

// ════════════════════════════════════════════════════════════
// HOOKS
// ════════════════════════════════════════════════════════════

/**
 * Fetch smart button counts for a single record
 *
 * @deprecated Use useSmartButtonCounts from '@/hooks/useSmartButtonCounts' instead
 * @param model - The model type
 * @param recordId - The record ID
 * @param enabled - Whether to enable the query
 *
 * @example
 * // ❌ DON'T USE THIS:
 * const { counts } = useSmartButtons('client', '123')
 *
 * // ✅ USE THIS INSTEAD:
 * import { useSmartButtonCounts } from '@/hooks/useSmartButtonCounts'
 * const { counts } = useSmartButtonCounts('client', '123', buttonConfigs)
 */
export function useSmartButtons(
  model: SupportedModel,
  recordId: string,
  enabled: boolean = true
): UseSmartButtonsResult {
  // Log deprecation warning on first use
  if (enabled) {
    logDeprecationWarning()
  }

  const query = useQuery({
    queryKey: QueryKeys.smartButtons.byModel(model, recordId),
    queryFn: async () => {
      try {
        // This will throw an error with bilingual message
        return await smartButtonsService.getCounts(model, recordId)
      } catch (error) {
        // Re-throw with bilingual error
        throw createDeprecationError()
      }
    },
    enabled: enabled && !!recordId,
    retry: false, // Don't retry deprecated endpoints
    staleTime: CACHE_TIMES.INSTANT, // Don't cache deprecated data
  })

  return {
    counts: query.data ?? null,
    isLoading: query.isLoading,
    isError: query.isError,
    error: query.error as Error | null,
    refetch: query.refetch,
  }
}

/**
 * Fetch smart button counts for multiple records (batch)
 *
 * @deprecated Use useSmartButtonCounts from '@/hooks/useSmartButtonCounts' instead
 * @param model - The model type
 * @param recordIds - Array of record IDs
 * @param enabled - Whether to enable the query
 *
 * @example
 * // ❌ DON'T USE THIS:
 * const { countsMap } = useSmartButtonsBatch('client', ['123', '456'])
 *
 * // ✅ USE THIS INSTEAD:
 * import { useSmartButtonCounts } from '@/hooks/useSmartButtonCounts'
 * // Fetch counts individually for each record
 */
export function useSmartButtonsBatch(
  model: SupportedModel,
  recordIds: string[],
  enabled: boolean = true
): UseSmartButtonsBatchResult {
  // Log deprecation warning on first use
  if (enabled) {
    logDeprecationWarning()
  }

  const query = useQuery({
    queryKey: QueryKeys.smartButtons.batch(model, recordIds),
    queryFn: async () => {
      try {
        // This will throw an error with bilingual message
        return await smartButtonsService.getBatchCounts(model, recordIds)
      } catch (error) {
        // Re-throw with bilingual error
        throw createDeprecationError()
      }
    },
    enabled: enabled && recordIds.length > 0,
    retry: false, // Don't retry deprecated endpoints
    staleTime: CACHE_TIMES.INSTANT, // Don't cache deprecated data
  })

  return {
    countsMap: query.data ?? null,
    isLoading: query.isLoading,
    isError: query.isError,
    error: query.error as Error | null,
    refetch: query.refetch,
  }
}

/**
 * Fetch smart button counts for multiple records in parallel
 *
 * @deprecated Use useSmartButtonCounts from '@/hooks/useSmartButtonCounts' instead
 * @param model - The model type
 * @param recordIds - Array of record IDs
 * @param enabled - Whether to enable the queries
 */
export function useSmartButtonsMulti(
  model: SupportedModel,
  recordIds: string[],
  enabled: boolean = true
) {
  // Log deprecation warning on first use
  if (enabled && recordIds.length > 0) {
    logDeprecationWarning()
  }

  const queries = useQueries({
    queries: recordIds.map((recordId) => ({
      queryKey: QueryKeys.smartButtons.byModel(model, recordId),
      queryFn: async () => {
        try {
          // This will throw an error with bilingual message
          return await smartButtonsService.getCounts(model, recordId)
        } catch (error) {
          // Re-throw with bilingual error
          throw createDeprecationError()
        }
      },
      enabled: enabled && !!recordId,
      retry: false, // Don't retry deprecated endpoints
      staleTime: CACHE_TIMES.INSTANT, // Don't cache deprecated data
    })),
  })

  return queries.map((query, index) => ({
    recordId: recordIds[index],
    counts: query.data ?? null,
    isLoading: query.isLoading,
    isError: query.isError,
    error: query.error as Error | null,
    refetch: query.refetch,
  }))
}

// Export types for backward compatibility
export type { SmartButtonCounts, SupportedModel }
