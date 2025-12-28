/**
 * Sales Settings Hooks
 *
 * React hooks for managing sales settings state and mutations.
 * Uses React Query for caching and state management.
 *
 * [BACKEND-PENDING] All hooks use placeholder data until API is implemented
 *
 * @module hooks/useSalesSettings
 */

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useToast } from '@/hooks/use-toast'
import salesSettingsService, {
  SalesSettingsSection,
  SettingsHistoryEntry,
  SettingsValidationResult,
} from '@/services/salesSettingsService'
import { SalesSettings } from '@/types/salesSettings'

// ═══════════════════════════════════════════════════════════════════════════
// QUERY KEYS
// ═══════════════════════════════════════════════════════════════════════════

export const salesSettingsKeys = {
  all: ['salesSettings'] as const,
  settings: () => [...salesSettingsKeys.all, 'data'] as const,
  history: () => [...salesSettingsKeys.all, 'history'] as const,
}

// ═══════════════════════════════════════════════════════════════════════════
// GET SALES SETTINGS HOOK
// ═══════════════════════════════════════════════════════════════════════════

/**
 * Fetch current sales settings
 *
 * [BACKEND-PENDING] Currently returns default settings
 *
 * @returns Query result with settings data
 */
export function useSalesSettings() {
  return useQuery({
    queryKey: salesSettingsKeys.settings(),
    queryFn: () => salesSettingsService.getSalesSettings(),
    staleTime: 5 * 60 * 1000, // Consider fresh for 5 minutes
    gcTime: 10 * 60 * 1000, // Cache for 10 minutes
  })
}

// ═══════════════════════════════════════════════════════════════════════════
// UPDATE SALES SETTINGS HOOK
// ═══════════════════════════════════════════════════════════════════════════

/**
 * Update sales settings (full or partial)
 *
 * [BACKEND-PENDING] Currently uses placeholder service
 *
 * @returns Mutation object for updating settings
 */
export function useUpdateSalesSettings() {
  const queryClient = useQueryClient()
  const { toast } = useToast()

  return useMutation({
    mutationFn: ({
      section,
      data,
    }: {
      section: SalesSettingsSection | 'all'
      data: Partial<SalesSettings> | any
    }) => salesSettingsService.updateSalesSettings(section, data),

    onSuccess: (data, variables) => {
      // Invalidate and refetch settings
      queryClient.invalidateQueries({ queryKey: salesSettingsKeys.settings() })
      queryClient.invalidateQueries({ queryKey: salesSettingsKeys.history() })

      // Show success toast
      toast({
        title: 'Settings updated | تم تحديث الإعدادات',
        description:
          'Sales settings have been saved successfully | تم حفظ إعدادات المبيعات بنجاح',
        variant: 'default',
      })
    },

    onError: (error: Error) => {
      // Show error toast
      toast({
        title: 'Update failed | فشل التحديث',
        description:
          error.message || 'Failed to update sales settings | فشل تحديث إعدادات المبيعات',
        variant: 'destructive',
      })
    },
  })
}

// ═══════════════════════════════════════════════════════════════════════════
// RESET SECTION HOOK
// ═══════════════════════════════════════════════════════════════════════════

/**
 * Reset a specific settings section to default values
 *
 * [BACKEND-PENDING] Currently uses placeholder service
 *
 * @returns Mutation object for resetting section
 */
export function useResetSettingsSection() {
  const queryClient = useQueryClient()
  const { toast } = useToast()

  return useMutation({
    mutationFn: (section: SalesSettingsSection) =>
      salesSettingsService.resetSectionToDefaults(section),

    onSuccess: (data, section) => {
      // Invalidate and refetch settings
      queryClient.invalidateQueries({ queryKey: salesSettingsKeys.settings() })
      queryClient.invalidateQueries({ queryKey: salesSettingsKeys.history() })

      // Show success toast
      toast({
        title: 'Section reset | تمت إعادة التعيين',
        description: `${section} settings have been reset to defaults | تمت إعادة تعيين إعدادات ${section} إلى القيم الافتراضية`,
        variant: 'default',
      })
    },

    onError: (error: Error) => {
      // Show error toast
      toast({
        title: 'Reset failed | فشلت إعادة التعيين',
        description: error.message || 'Failed to reset section | فشلت إعادة تعيين القسم',
        variant: 'destructive',
      })
    },
  })
}

// ═══════════════════════════════════════════════════════════════════════════
// SETTINGS HISTORY HOOK
// ═══════════════════════════════════════════════════════════════════════════

/**
 * Fetch settings change history
 *
 * [BACKEND-PENDING] Currently returns empty array
 *
 * @param limit - Maximum number of history entries to fetch
 * @returns Query result with history data
 */
export function useSalesSettingsHistory(limit: number = 50) {
  return useQuery({
    queryKey: [...salesSettingsKeys.history(), limit],
    queryFn: () => salesSettingsService.getSettingsHistory(limit),
    staleTime: 2 * 60 * 1000, // Consider fresh for 2 minutes
    gcTime: 5 * 60 * 1000, // Cache for 5 minutes
  })
}

// ═══════════════════════════════════════════════════════════════════════════
// EXPORT SETTINGS HOOK
// ═══════════════════════════════════════════════════════════════════════════

/**
 * Export settings as JSON file
 *
 * [BACKEND-PENDING] Currently exports default settings
 *
 * @returns Mutation object for exporting settings
 */
export function useExportSalesSettings() {
  const { toast } = useToast()

  return useMutation({
    mutationFn: () => salesSettingsService.exportSettings(),

    onSuccess: (jsonData) => {
      // Parse and download the settings
      try {
        const settings = JSON.parse(jsonData) as SalesSettings
        salesSettingsService.downloadSettingsAsJson(settings)

        // Show success toast
        toast({
          title: 'Export successful | تم التصدير بنجاح',
          description:
            'Settings have been exported as JSON | تم تصدير الإعدادات بصيغة JSON',
          variant: 'default',
        })
      } catch (error) {
        throw new Error('Invalid export data | بيانات تصدير غير صالحة')
      }
    },

    onError: (error: Error) => {
      // Show error toast
      toast({
        title: 'Export failed | فشل التصدير',
        description: error.message || 'Failed to export settings | فشل تصدير الإعدادات',
        variant: 'destructive',
      })
    },
  })
}

// ═══════════════════════════════════════════════════════════════════════════
// IMPORT SETTINGS HOOK
// ═══════════════════════════════════════════════════════════════════════════

/**
 * Import settings from JSON file
 *
 * [BACKEND-PENDING] Currently uses placeholder service
 *
 * @returns Mutation object for importing settings
 */
export function useImportSalesSettings() {
  const queryClient = useQueryClient()
  const { toast } = useToast()

  return useMutation({
    mutationFn: (jsonData: string) => salesSettingsService.importSettings(jsonData),

    onSuccess: (data) => {
      // Invalidate and refetch settings
      queryClient.invalidateQueries({ queryKey: salesSettingsKeys.settings() })
      queryClient.invalidateQueries({ queryKey: salesSettingsKeys.history() })

      // Show success toast
      toast({
        title: 'Import successful | تم الاستيراد بنجاح',
        description:
          'Settings have been imported successfully | تم استيراد الإعدادات بنجاح',
        variant: 'default',
      })
    },

    onError: (error: Error) => {
      // Show error toast
      toast({
        title: 'Import failed | فشل الاستيراد',
        description: error.message || 'Failed to import settings | فشل استيراد الإعدادات',
        variant: 'destructive',
      })
    },
  })
}

// ═══════════════════════════════════════════════════════════════════════════
// VALIDATE SETTINGS HOOK
// ═══════════════════════════════════════════════════════════════════════════

/**
 * Validate settings before saving
 *
 * [BACKEND-PENDING] Currently uses client-side validation only
 *
 * @returns Mutation object for validating settings
 */
export function useValidateSalesSettings() {
  const { toast } = useToast()

  return useMutation({
    mutationFn: (settings: Partial<SalesSettings>) =>
      salesSettingsService.validateSettings(settings),

    onSuccess: (result: SettingsValidationResult) => {
      if (!result.valid) {
        // Show validation errors
        toast({
          title: 'Validation errors | أخطاء التحقق',
          description: `Found ${result.errors.length} error(s) | تم العثور على ${result.errors.length} خطأ`,
          variant: 'destructive',
        })
      } else if (result.warnings.length > 0) {
        // Show validation warnings
        toast({
          title: 'Validation warnings | تحذيرات التحقق',
          description: `Found ${result.warnings.length} warning(s) | تم العثور على ${result.warnings.length} تحذير`,
          variant: 'default',
        })
      }
    },

    onError: (error: Error) => {
      // Show error toast
      toast({
        title: 'Validation failed | فشل التحقق',
        description:
          error.message || 'Failed to validate settings | فشل التحقق من الإعدادات',
        variant: 'destructive',
      })
    },
  })
}
