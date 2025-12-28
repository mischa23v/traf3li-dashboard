/**
 * Comprehensive CRM Settings Service
 *
 * Service layer for managing comprehensive CRM settings with 10 sections
 * [BACKEND-PENDING] Currently uses mock data
 *
 * @module services/crmSettingsComprehensiveService
 */

import type { ComprehensiveCrmSettings } from '@/types/crmSettingsComprehensive'
import { DEFAULT_COMPREHENSIVE_CRM_SETTINGS } from '@/types/crmSettingsComprehensive'

// ═══════════════════════════════════════════════════════════════════════════
// TYPE DEFINITIONS
// ═══════════════════════════════════════════════════════════════════════════

export type CrmSettingsSection =
  | 'general'
  | 'leads'
  | 'pipeline'
  | 'quotes'
  | 'activities'
  | 'campaigns'
  | 'referrals'
  | 'email'
  | 'notifications'
  | 'integrations'

export interface SettingsHistoryEntry {
  id: string
  section: CrmSettingsSection | 'all'
  changedBy: string
  changedAt: Date
  changes: Record<string, any>
}

export interface SettingsValidationResult {
  valid: boolean
  errors: string[]
  warnings: string[]
}

// ═══════════════════════════════════════════════════════════════════════════
// MOCK DATA STORAGE
// ═══════════════════════════════════════════════════════════════════════════

let mockSettings: ComprehensiveCrmSettings = { ...DEFAULT_COMPREHENSIVE_CRM_SETTINGS }
let mockHistory: SettingsHistoryEntry[] = []

// ═══════════════════════════════════════════════════════════════════════════
// SERVICE IMPLEMENTATION
// ═══════════════════════════════════════════════════════════════════════════

class CrmSettingsComprehensiveService {
  /**
   * Get comprehensive CRM settings
   *
   * [BACKEND-PENDING] Replace with: GET /api/crm/settings/comprehensive
   */
  async getCrmSettings(): Promise<ComprehensiveCrmSettings> {
    // Simulate API delay
    await new Promise((resolve) => setTimeout(resolve, 300))

    // Return mock data
    return { ...mockSettings }
  }

  /**
   * Update comprehensive CRM settings (full or section)
   *
   * [BACKEND-PENDING] Replace with: PUT /api/crm/settings/comprehensive
   */
  async updateCrmSettings(
    section: CrmSettingsSection | 'all',
    data: Partial<ComprehensiveCrmSettings> | any
  ): Promise<ComprehensiveCrmSettings> {
    // Simulate API delay
    await new Promise((resolve) => setTimeout(resolve, 500))

    // Update mock data
    if (section === 'all') {
      mockSettings = { ...mockSettings, ...data }
    } else {
      mockSettings = {
        ...mockSettings,
        [section]: { ...mockSettings[section], ...data },
      }
    }

    // Log to history
    mockHistory.unshift({
      id: Date.now().toString(),
      section,
      changedBy: 'current-user',
      changedAt: new Date(),
      changes: data,
    })

    return { ...mockSettings }
  }

  /**
   * Reset section to default values
   *
   * [BACKEND-PENDING] Replace with: POST /api/crm/settings/comprehensive/reset
   */
  async resetSectionToDefaults(section: CrmSettingsSection): Promise<ComprehensiveCrmSettings> {
    // Simulate API delay
    await new Promise((resolve) => setTimeout(resolve, 500))

    // Reset section to default
    mockSettings = {
      ...mockSettings,
      [section]: { ...DEFAULT_COMPREHENSIVE_CRM_SETTINGS[section] },
    }

    // Log to history
    mockHistory.unshift({
      id: Date.now().toString(),
      section,
      changedBy: 'current-user',
      changedAt: new Date(),
      changes: { action: 'reset_to_defaults' },
    })

    return { ...mockSettings }
  }

  /**
   * Get settings change history
   *
   * [BACKEND-PENDING] Replace with: GET /api/crm/settings/comprehensive/history
   */
  async getSettingsHistory(limit: number = 50): Promise<SettingsHistoryEntry[]> {
    // Simulate API delay
    await new Promise((resolve) => setTimeout(resolve, 200))

    return mockHistory.slice(0, limit)
  }

  /**
   * Export settings as JSON
   *
   * [BACKEND-PENDING] Replace with: GET /api/crm/settings/comprehensive/export
   */
  async exportSettings(): Promise<string> {
    // Simulate API delay
    await new Promise((resolve) => setTimeout(resolve, 300))

    return JSON.stringify(mockSettings, null, 2)
  }

  /**
   * Download settings as JSON file
   */
  downloadSettingsAsJson(settings: ComprehensiveCrmSettings): void {
    const dataStr = JSON.stringify(settings, null, 2)
    const dataBlob = new Blob([dataStr], { type: 'application/json' })
    const url = URL.createObjectURL(dataBlob)
    const link = document.createElement('a')
    link.href = url
    link.download = `crm-settings-${new Date().toISOString().split('T')[0]}.json`
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    URL.revokeObjectURL(url)
  }

  /**
   * Import settings from JSON
   *
   * [BACKEND-PENDING] Replace with: POST /api/crm/settings/comprehensive/import
   */
  async importSettings(jsonData: string): Promise<ComprehensiveCrmSettings> {
    // Simulate API delay
    await new Promise((resolve) => setTimeout(resolve, 500))

    try {
      const importedSettings = JSON.parse(jsonData) as ComprehensiveCrmSettings

      // Validate structure
      const validation = await this.validateSettings(importedSettings)
      if (!validation.valid) {
        throw new Error(`Invalid settings: ${validation.errors.join(', ')}`)
      }

      // Update mock data
      mockSettings = { ...importedSettings }

      // Log to history
      mockHistory.unshift({
        id: Date.now().toString(),
        section: 'all',
        changedBy: 'current-user',
        changedAt: new Date(),
        changes: { action: 'import_from_json' },
      })

      return { ...mockSettings }
    } catch (error) {
      throw new Error(
        error instanceof Error ? error.message : 'Failed to parse JSON | فشل تحليل JSON'
      )
    }
  }

  /**
   * Validate settings before saving
   *
   * [BACKEND-PENDING] Replace with: POST /api/crm/settings/comprehensive/validate
   */
  async validateSettings(
    settings: Partial<ComprehensiveCrmSettings>
  ): Promise<SettingsValidationResult> {
    // Simulate API delay
    await new Promise((resolve) => setTimeout(resolve, 200))

    const errors: string[] = []
    const warnings: string[] = []

    // Validate general settings
    if (settings.general) {
      if (!settings.general.defaultCurrency) {
        errors.push('Default currency is required')
      }
      if (settings.general.fiscalYearStart < 1 || settings.general.fiscalYearStart > 12) {
        errors.push('Fiscal year start must be between 1 and 12')
      }
    }

    // Validate lead settings
    if (settings.leads) {
      if (settings.leads.staleLeadThresholdDays < 1) {
        errors.push('Stale lead threshold must be at least 1 day')
      }
    }

    // Validate quote settings
    if (settings.quotes) {
      if (settings.quotes.defaultValidityDays < 1) {
        errors.push('Quote validity must be at least 1 day')
      }
      if (settings.quotes.requireApproval && settings.quotes.approvalThreshold <= 0) {
        warnings.push('Approval threshold should be greater than 0 when approval is required')
      }
    }

    // Validate campaign settings
    if (settings.campaigns) {
      if (settings.campaigns.defaultBudget < 0) {
        errors.push('Default budget cannot be negative')
      }
      if (settings.campaigns.minRoiThreshold < 0) {
        errors.push('Minimum ROI threshold cannot be negative')
      }
    }

    // Validate referral settings
    if (settings.referrals) {
      if (settings.referrals.defaultCommissionRate < 0 || settings.referrals.defaultCommissionRate > 100) {
        errors.push('Commission rate must be between 0 and 100')
      }
    }

    return {
      valid: errors.length === 0,
      errors,
      warnings,
    }
  }
}

// Export singleton instance
export default new CrmSettingsComprehensiveService()
