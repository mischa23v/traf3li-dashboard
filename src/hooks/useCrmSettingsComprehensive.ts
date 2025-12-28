/**
 * Comprehensive CRM Settings Hooks
 *
 * React hooks for managing comprehensive CRM settings state and mutations
 * Uses React Query for caching and state management
 *
 * [BACKEND-PENDING] All hooks use placeholder data until API is implemented
 *
 * @module hooks/useCrmSettingsComprehensive
 */

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useToast } from '@/hooks/use-toast'
import crmSettingsComprehensiveService, {
  CrmSettingsSection,
  SettingsHistoryEntry,
  SettingsValidationResult,
} from '@/services/crmSettingsComprehensiveService'
import { ComprehensiveCrmSettings } from '@/types/crmSettingsComprehensive'

// ═══════════════════════════════════════════════════════════════════════════
// QUERY KEYS
// ═══════════════════════════════════════════════════════════════════════════

export const crmSettingsComprehensiveKeys = {
  all: ['crmSettingsComprehensive'] as const,
  settings: () => [...crmSettingsComprehensiveKeys.all, 'data'] as const,
  history: () => [...crmSettingsComprehensiveKeys.all, 'history'] as const,
}

// ═══════════════════════════════════════════════════════════════════════════
// GET CRM SETTINGS HOOK
// ═══════════════════════════════════════════════════════════════════════════

/**
 * Fetch current comprehensive CRM settings
 *
 * [BACKEND-PENDING] Currently returns default settings
 *
 * @returns Query result with settings data
 */
export function useCrmSettingsComprehensive() {
  return useQuery({
    queryKey: crmSettingsComprehensiveKeys.settings(),
    queryFn: () => crmSettingsComprehensiveService.getCrmSettings(),
    staleTime: 5 * 60 * 1000, // Consider fresh for 5 minutes
    gcTime: 10 * 60 * 1000, // Cache for 10 minutes
  })
}

// ═══════════════════════════════════════════════════════════════════════════
// UPDATE CRM SETTINGS HOOK
// ═══════════════════════════════════════════════════════════════════════════

/**
 * Update comprehensive CRM settings (full or partial)
 *
 * [BACKEND-PENDING] Currently uses placeholder service
 *
 * @returns Mutation object for updating settings
 */
export function useUpdateCrmSettingsComprehensive() {
  const queryClient = useQueryClient()
  const { toast } = useToast()

  return useMutation({
    mutationFn: ({
      section,
      data,
    }: {
      section: CrmSettingsSection | 'all'
      data: Partial<ComprehensiveCrmSettings> | any
    }) => crmSettingsComprehensiveService.updateCrmSettings(section, data),

    onSuccess: (data, variables) => {
      // Invalidate and refetch settings
      queryClient.invalidateQueries({ queryKey: crmSettingsComprehensiveKeys.settings() })
      queryClient.invalidateQueries({ queryKey: crmSettingsComprehensiveKeys.history() })

      // Show success toast
      toast({
        title: 'Settings updated | تم تحديث الإعدادات',
        description:
          'CRM settings have been saved successfully | تم حفظ إعدادات CRM بنجاح',
        variant: 'default',
      })
    },

    onError: (error: Error) => {
      // Show error toast
      toast({
        title: 'Update failed | فشل التحديث',
        description:
          error.message || 'Failed to update CRM settings | فشل تحديث إعدادات CRM',
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
export function useResetCrmSettingsSection() {
  const queryClient = useQueryClient()
  const { toast } = useToast()

  return useMutation({
    mutationFn: (section: CrmSettingsSection) =>
      crmSettingsComprehensiveService.resetSectionToDefaults(section),

    onSuccess: (data, section) => {
      // Invalidate and refetch settings
      queryClient.invalidateQueries({ queryKey: crmSettingsComprehensiveKeys.settings() })
      queryClient.invalidateQueries({ queryKey: crmSettingsComprehensiveKeys.history() })

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
export function useCrmSettingsHistory(limit: number = 50) {
  return useQuery({
    queryKey: [...crmSettingsComprehensiveKeys.history(), limit],
    queryFn: () => crmSettingsComprehensiveService.getSettingsHistory(limit),
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
export function useExportCrmSettings() {
  const { toast } = useToast()

  return useMutation({
    mutationFn: () => crmSettingsComprehensiveService.exportSettings(),

    onSuccess: (jsonData) => {
      // Parse and download the settings
      try {
        const settings = JSON.parse(jsonData) as ComprehensiveCrmSettings
        crmSettingsComprehensiveService.downloadSettingsAsJson(settings)

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
export function useImportCrmSettings() {
  const queryClient = useQueryClient()
  const { toast } = useToast()

  return useMutation({
    mutationFn: (jsonData: string) => crmSettingsComprehensiveService.importSettings(jsonData),

    onSuccess: (data) => {
      // Invalidate and refetch settings
      queryClient.invalidateQueries({ queryKey: crmSettingsComprehensiveKeys.settings() })
      queryClient.invalidateQueries({ queryKey: crmSettingsComprehensiveKeys.history() })

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
export function useValidateCrmSettings() {
  const { toast } = useToast()

  return useMutation({
    mutationFn: (settings: Partial<ComprehensiveCrmSettings>) =>
      crmSettingsComprehensiveService.validateSettings(settings),

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
