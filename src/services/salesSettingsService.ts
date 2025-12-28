/**
 * Sales Settings Service
 *
 * Service layer for sales settings management including:
 * - Get/update settings
 * - Reset sections to defaults
 * - Settings history
 * - Import/export configuration
 * - Validation
 *
 * [BACKEND-PENDING] All endpoints are placeholders until API is implemented
 * Required endpoints:
 * - GET /api/settings/sales - Fetch sales settings
 * - PUT /api/settings/sales - Update sales settings
 * - PUT /api/settings/sales/reset/:section - Reset section to defaults
 * - GET /api/settings/sales/history - Get settings change history
 * - POST /api/settings/sales/export - Export settings as JSON
 * - POST /api/settings/sales/import - Import settings from JSON
 * - POST /api/settings/sales/validate - Validate settings before save
 *
 * @module services/salesSettingsService
 */

import { SalesSettings, DEFAULT_SALES_SETTINGS } from '@/types/salesSettings'

// ═══════════════════════════════════════════════════════════════════════════
// TYPES
// ═══════════════════════════════════════════════════════════════════════════

export interface SettingsHistoryEntry {
  id: string
  timestamp: string
  userId: string
  userName: string
  userNameAr: string
  section: string
  changes: {
    field: string
    oldValue: any
    newValue: any
  }[]
  action: 'update' | 'reset' | 'import'
}

export interface SettingsValidationResult {
  valid: boolean
  errors: {
    section: string
    field: string
    message: string
    messageAr: string
  }[]
  warnings: {
    section: string
    field: string
    message: string
    messageAr: string
  }[]
}

export type SalesSettingsSection =
  | 'general'
  | 'quotes'
  | 'orders'
  | 'pricing'
  | 'discounts'
  | 'commissions'
  | 'delivery'
  | 'returns'
  | 'tax'
  | 'documents'
  | 'sequences'

// ═══════════════════════════════════════════════════════════════════════════
// SERVICE CLASS
// ═══════════════════════════════════════════════════════════════════════════

class SalesSettingsService {
  /**
   * Get current sales settings
   *
   * [BACKEND-PENDING] Replace with: GET /api/settings/sales
   *
   * @returns Promise<SalesSettings>
   */
  async getSalesSettings(): Promise<SalesSettings> {
    console.log('[BACKEND-PENDING] getSalesSettings - Placeholder (No backend connected)')

    // Return default settings for now
    // TODO: Replace with actual API call:
    // const response = await fetch('/api/settings/sales')
    // return response.json()

    return Promise.resolve(DEFAULT_SALES_SETTINGS)
  }

  /**
   * Update sales settings (entire object or specific section)
   *
   * [BACKEND-PENDING] Replace with: PUT /api/settings/sales
   *
   * @param section - Section to update (or 'all' for full update)
   * @param data - Settings data to update
   * @returns Promise<SalesSettings>
   */
  async updateSalesSettings(
    section: SalesSettingsSection | 'all',
    data: Partial<SalesSettings> | any
  ): Promise<SalesSettings> {
    console.log('[BACKEND-PENDING] updateSalesSettings - Placeholder (No backend connected)', {
      section,
      data,
    })

    // TODO: Replace with actual API call:
    // const response = await fetch('/api/settings/sales', {
    //   method: 'PUT',
    //   headers: { 'Content-Type': 'application/json' },
    //   body: JSON.stringify({ section, data })
    // })
    // return response.json()

    // For now, merge with defaults
    return Promise.resolve({
      ...DEFAULT_SALES_SETTINGS,
      ...(section === 'all' ? data : { [section]: data }),
    })
  }

  /**
   * Reset a specific section to default values
   *
   * [BACKEND-PENDING] Replace with: PUT /api/settings/sales/reset/:section
   *
   * @param section - Section to reset
   * @returns Promise<SalesSettings>
   */
  async resetSectionToDefaults(section: SalesSettingsSection): Promise<SalesSettings> {
    console.log('[BACKEND-PENDING] resetSectionToDefaults - Placeholder (No backend connected)', {
      section,
    })

    // TODO: Replace with actual API call:
    // const response = await fetch(`/api/settings/sales/reset/${section}`, {
    //   method: 'PUT'
    // })
    // return response.json()

    return Promise.resolve(DEFAULT_SALES_SETTINGS)
  }

  /**
   * Get settings change history
   *
   * [BACKEND-PENDING] Replace with: GET /api/settings/sales/history
   *
   * @param limit - Maximum number of history entries to return
   * @returns Promise<SettingsHistoryEntry[]>
   */
  async getSettingsHistory(limit: number = 50): Promise<SettingsHistoryEntry[]> {
    console.log('[BACKEND-PENDING] getSettingsHistory - Placeholder (No backend connected)', {
      limit,
    })

    // TODO: Replace with actual API call:
    // const response = await fetch(`/api/settings/sales/history?limit=${limit}`)
    // return response.json()

    // Return empty history for now
    return Promise.resolve([])
  }

  /**
   * Export settings as JSON
   *
   * [BACKEND-PENDING] Replace with: POST /api/settings/sales/export
   *
   * @returns Promise<string> JSON string of settings
   */
  async exportSettings(): Promise<string> {
    console.log('[BACKEND-PENDING] exportSettings - Placeholder (No backend connected)')

    // TODO: Replace with actual API call:
    // const response = await fetch('/api/settings/sales/export', {
    //   method: 'POST'
    // })
    // const blob = await response.blob()
    // return blob.text()

    // For now, export defaults
    return Promise.resolve(JSON.stringify(DEFAULT_SALES_SETTINGS, null, 2))
  }

  /**
   * Import settings from JSON
   *
   * [BACKEND-PENDING] Replace with: POST /api/settings/sales/import
   *
   * @param jsonData - JSON string of settings to import
   * @returns Promise<SalesSettings>
   */
  async importSettings(jsonData: string): Promise<SalesSettings> {
    console.log('[BACKEND-PENDING] importSettings - Placeholder (No backend connected)', {
      dataLength: jsonData.length,
    })

    try {
      const settings = JSON.parse(jsonData) as SalesSettings

      // TODO: Replace with actual API call:
      // const response = await fetch('/api/settings/sales/import', {
      //   method: 'POST',
      //   headers: { 'Content-Type': 'application/json' },
      //   body: jsonData
      // })
      // return response.json()

      return Promise.resolve(settings)
    } catch (error) {
      throw new Error('Invalid JSON format | تنسيق JSON غير صالح')
    }
  }

  /**
   * Validate settings before saving
   *
   * [BACKEND-PENDING] Replace with: POST /api/settings/sales/validate
   *
   * @param settings - Settings to validate
   * @returns Promise<SettingsValidationResult>
   */
  async validateSettings(settings: Partial<SalesSettings>): Promise<SettingsValidationResult> {
    console.log('[BACKEND-PENDING] validateSettings - Placeholder (No backend connected)', {
      settings,
    })

    const errors: SettingsValidationResult['errors'] = []
    const warnings: SettingsValidationResult['warnings'] = []

    // Basic client-side validation examples
    if (settings.general) {
      if (settings.general.defaultPaymentTermsDays < 0) {
        errors.push({
          section: 'general',
          field: 'defaultPaymentTermsDays',
          message: 'Payment terms days must be positive',
          messageAr: 'يجب أن تكون أيام شروط الدفع موجبة',
        })
      }

      if (settings.general.roundingPrecision < 0 || settings.general.roundingPrecision > 4) {
        errors.push({
          section: 'general',
          field: 'roundingPrecision',
          message: 'Rounding precision must be between 0 and 4',
          messageAr: 'يجب أن تكون دقة التقريب بين 0 و 4',
        })
      }
    }

    if (settings.quotes) {
      if (settings.quotes.defaultValidityDays < 1) {
        errors.push({
          section: 'quotes',
          field: 'defaultValidityDays',
          message: 'Quote validity must be at least 1 day',
          messageAr: 'يجب أن تكون صلاحية العرض يوم واحد على الأقل',
        })
      }

      if (settings.quotes.approvalThreshold < 0) {
        errors.push({
          section: 'quotes',
          field: 'approvalThreshold',
          message: 'Approval threshold must be positive',
          messageAr: 'يجب أن يكون حد الموافقة موجبًا',
        })
      }
    }

    if (settings.pricing) {
      if (
        settings.pricing.minimumMarginPercent < 0 ||
        settings.pricing.minimumMarginPercent > 100
      ) {
        errors.push({
          section: 'pricing',
          field: 'minimumMarginPercent',
          message: 'Minimum margin must be between 0 and 100',
          messageAr: 'يجب أن يكون الحد الأدنى للهامش بين 0 و 100',
        })
      }

      if (settings.pricing.minimumMarginPercent < 5) {
        warnings.push({
          section: 'pricing',
          field: 'minimumMarginPercent',
          message: 'Very low margin may not be sustainable',
          messageAr: 'الهامش المنخفض جدًا قد لا يكون مستدامًا',
        })
      }
    }

    if (settings.discounts) {
      if (
        settings.discounts.maxLineDiscountPercent < 0 ||
        settings.discounts.maxLineDiscountPercent > 100
      ) {
        errors.push({
          section: 'discounts',
          field: 'maxLineDiscountPercent',
          message: 'Line discount must be between 0 and 100',
          messageAr: 'يجب أن يكون خصم السطر بين 0 و 100',
        })
      }

      if (
        settings.discounts.maxOrderDiscountPercent < 0 ||
        settings.discounts.maxOrderDiscountPercent > 100
      ) {
        errors.push({
          section: 'discounts',
          field: 'maxOrderDiscountPercent',
          message: 'Order discount must be between 0 and 100',
          messageAr: 'يجب أن يكون خصم الطلب بين 0 و 100',
        })
      }
    }

    if (settings.returns) {
      if (settings.returns.defaultReturnWindowDays < 0) {
        errors.push({
          section: 'returns',
          field: 'defaultReturnWindowDays',
          message: 'Return window must be positive',
          messageAr: 'يجب أن تكون نافذة الإرجاع موجبة',
        })
      }

      if (
        settings.returns.defaultRestockingFeePercent < 0 ||
        settings.returns.defaultRestockingFeePercent > 100
      ) {
        errors.push({
          section: 'returns',
          field: 'defaultRestockingFeePercent',
          message: 'Restocking fee must be between 0 and 100',
          messageAr: 'يجب أن تكون رسوم إعادة التخزين بين 0 و 100',
        })
      }
    }

    if (settings.tax) {
      if (settings.tax.defaultTaxRate < 0 || settings.tax.defaultTaxRate > 100) {
        errors.push({
          section: 'tax',
          field: 'defaultTaxRate',
          message: 'Tax rate must be between 0 and 100',
          messageAr: 'يجب أن يكون معدل الضريبة بين 0 و 100',
        })
      }
    }

    // TODO: Replace with actual API call for server-side validation:
    // const response = await fetch('/api/settings/sales/validate', {
    //   method: 'POST',
    //   headers: { 'Content-Type': 'application/json' },
    //   body: JSON.stringify(settings)
    // })
    // return response.json()

    return Promise.resolve({
      valid: errors.length === 0,
      errors,
      warnings,
    })
  }

  /**
   * Download settings as JSON file
   *
   * @param settings - Settings to download
   * @param filename - Filename for the download
   */
  downloadSettingsAsJson(settings: SalesSettings, filename: string = 'sales-settings.json'): void {
    const jsonStr = JSON.stringify(settings, null, 2)
    const blob = new Blob([jsonStr], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = filename
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    URL.revokeObjectURL(url)
  }
}

// ═══════════════════════════════════════════════════════════════════════════
// EXPORT SINGLETON INSTANCE
// ═══════════════════════════════════════════════════════════════════════════

export const salesSettingsService = new SalesSettingsService()
export default salesSettingsService
