/**
 * Setup Orchestration Service - ACTIVE SETUP SYSTEM
 *
 * ⚠️ IMPORTANT: This is the CURRENTLY ACTIVE setup system used throughout the application.
 * Do NOT confuse with setupWizardService.ts which is deprecated/unused.
 *
 * API Endpoints Pattern: /setup-orchestration/*
 * All endpoints use the firmId from the authentication context.
 *
 * Module Completion Flow:
 * 1. User navigates to module setup wizard (e.g., /dashboard/hr/setup-wizard)
 * 2. Progress is saved at each step via saveModuleProgress()
 * 3. When wizard completes, markModuleComplete() is called
 * 4. Alternatively, user can skip non-critical modules via markModuleSkipped()
 * 5. Overall progress is tracked via getSetupStatus()
 *
 * Backend Integration:
 * - All requests include firmId automatically via apiClient
 * - Progress data is persisted per firm in the backend
 * - Critical modules (hr, crm, finance) block certain features until complete
 * - Non-critical modules (inventory, projects) can be skipped
 */
import { apiClient } from '@/lib/api'

// Types
export interface ModuleSetupStatus {
  module: 'hr' | 'crm' | 'finance' | 'inventory' | 'projects'
  isComplete: boolean
  isSkipped: boolean
  startedAt?: string
  completedAt?: string
  currentStep?: number
  totalSteps?: number
  isCritical: boolean
  order: number
}

export interface SetupOrchestrationStatus {
  overallProgress: number
  completedModules: number
  totalModules: number
  hasAnySetupPending: boolean
  hasCriticalSetupPending: boolean
  modules: ModuleSetupStatus[]
  lastUpdatedAt: string
}

export interface SetupProgress {
  module: 'hr' | 'crm' | 'finance' | 'inventory' | 'projects'
  currentStep: number
  totalSteps: number
  data?: Record<string, any>
}

// Module configuration
export const MODULE_CONFIGS = {
  hr: {
    name: 'الموارد البشرية',
    nameEn: 'Human Resources',
    description: 'إعداد الموظفين والرواتب والحضور',
    descriptionEn: 'Set up employees, payroll, and attendance',
    icon: 'Users',
    color: 'blue',
    route: '/dashboard/hr/setup-wizard',
    totalSteps: 7,
    isCritical: true,
    order: 1,
  },
  crm: {
    name: 'إدارة العملاء',
    nameEn: 'CRM',
    description: 'إعداد العملاء المحتملين والفرص البيعية',
    descriptionEn: 'Set up leads and sales opportunities',
    icon: 'TrendingUp',
    color: 'purple',
    route: '/dashboard/crm/setup-wizard',
    totalSteps: 13,
    isCritical: true,
    order: 2,
  },
  finance: {
    name: 'المالية والمحاسبة',
    nameEn: 'Finance & Accounting',
    description: 'إعداد الحسابات والفواتير والضرائب',
    descriptionEn: 'Set up accounts, invoices, and taxes',
    icon: 'Calculator',
    color: 'green',
    route: '/dashboard/finance/setup-wizard',
    totalSteps: 10,
    isCritical: true,
    order: 3,
  },
  inventory: {
    name: 'المخزون',
    nameEn: 'Inventory',
    description: 'إعداد المنتجات والمخازن',
    descriptionEn: 'Set up products and warehouses',
    icon: 'Package',
    color: 'amber',
    route: '/dashboard/inventory/setup-wizard',
    totalSteps: 5,
    isCritical: false,
    order: 4,
  },
  projects: {
    name: 'المشاريع',
    nameEn: 'Projects',
    description: 'إعداد المشاريع والمهام',
    descriptionEn: 'Set up projects and tasks',
    icon: 'Briefcase',
    color: 'indigo',
    route: '/dashboard/projects/setup-wizard',
    totalSteps: 6,
    isCritical: false,
    order: 5,
  },
} as const

class SetupOrchestrationService {
  /**
   * Get overall setup orchestration status for all modules
   *
   * Endpoint: GET /setup-orchestration/status
   * Auth: Requires firmId from authenticated user context
   *
   * Returns:
   * - Overall progress percentage (0-100)
   * - Count of completed vs total modules
   * - Flags for pending setup (any and critical)
   * - Individual module statuses with completion data
   *
   * Used by:
   * - Dashboard to show setup progress card
   * - Navigation guards to enforce setup requirements
   * - Setup reminder system to determine if reminder should be shown
   *
   * @returns {Promise<SetupOrchestrationStatus>} Complete setup status for the firm
   * @throws {Error} Returns default status if API fails (allows graceful degradation)
   */
  async getSetupStatus(): Promise<SetupOrchestrationStatus> {
    try {
      const response = await apiClient.get<SetupOrchestrationStatus>('/setup-orchestration/status')
      return response.data
    } catch (error) {
      console.error('Failed to fetch setup status:', error)
      // Return default status if API fails
      return {
        overallProgress: 0,
        completedModules: 0,
        totalModules: Object.keys(MODULE_CONFIGS).length,
        hasAnySetupPending: true,
        hasCriticalSetupPending: true,
        modules: Object.entries(MODULE_CONFIGS).map(([key, config]) => ({
          module: key as any,
          isComplete: false,
          isSkipped: false,
          isCritical: config.isCritical,
          order: config.order,
          totalSteps: config.totalSteps,
        })),
        lastUpdatedAt: new Date().toISOString(),
      }
    }
  }

  /**
   * Mark a module as complete after wizard finalization
   *
   * Endpoint: POST /setup-orchestration/modules/{module}/complete
   * Auth: Requires firmId from authenticated user context
   *
   * Module Completion Logic:
   * 1. Called automatically when user clicks "Complete" in module setup wizard
   * 2. Sets isComplete=true and completedAt timestamp in backend
   * 3. Updates overall progress calculations
   * 4. If critical module, may unlock previously blocked features
   * 5. Triggers re-calculation of hasCriticalSetupPending flag
   *
   * Critical Modules: hr, crm, finance (must be completed or skipped)
   * Non-Critical: inventory, projects (can be skipped without impact)
   *
   * @param {string} module - Module identifier (hr, crm, finance, inventory, projects)
   * @throws {Error} If API request fails or module doesn't exist
   */
  async markModuleComplete(module: ModuleSetupStatus['module']): Promise<void> {
    try {
      await apiClient.post(`/setup-orchestration/modules/${module}/complete`)
    } catch (error) {
      console.error(`Failed to mark ${module} as complete:`, error)
      throw error
    }
  }

  /**
   * Mark a module as skipped (user chose not to set it up)
   *
   * Endpoint: POST /setup-orchestration/modules/{module}/skip
   * Auth: Requires firmId from authenticated user context
   *
   * Skip Behavior:
   * - Sets isSkipped=true in backend
   * - Counts toward overall progress (treated as "handled")
   * - Can be un-skipped later (user can return and complete setup)
   * - Non-critical modules can be skipped without blocking features
   * - Critical modules should generally be completed, not skipped
   *
   * Note: Even if skipped, users can still access the module later and
   * run the setup wizard to properly configure it.
   *
   * @param {string} module - Module identifier (hr, crm, finance, inventory, projects)
   * @throws {Error} If API request fails or module doesn't exist
   */
  async markModuleSkipped(module: ModuleSetupStatus['module']): Promise<void> {
    try {
      await apiClient.post(`/setup-orchestration/modules/${module}/skip`)
    } catch (error) {
      console.error(`Failed to mark ${module} as skipped:`, error)
      throw error
    }
  }

  /**
   * Save progress for a specific module during wizard flow
   *
   * Endpoint: POST /setup-orchestration/modules/{module}/progress
   * Auth: Requires firmId from authenticated user context
   *
   * Progress Tracking:
   * - Called after each step in the module setup wizard
   * - Saves current step number and any form data
   * - Allows users to resume setup where they left off
   * - Data is stored per-firm and persists across sessions
   *
   * Progress Object Contains:
   * - module: Which module (hr, crm, finance, inventory, projects)
   * - currentStep: Current step number (0-based index)
   * - totalSteps: Total number of steps in this module's wizard
   * - data: Form data from completed steps (optional)
   *
   * Example Usage:
   * ```
   * await saveModuleProgress({
   *   module: 'hr',
   *   currentStep: 3,
   *   totalSteps: 7,
   *   data: { employeesData: [...], departmentsData: [...] }
   * })
   * ```
   *
   * @param {SetupProgress} progress - Progress data including module, step, and form data
   * @throws {Error} If API request fails
   */
  async saveModuleProgress(progress: SetupProgress): Promise<void> {
    try {
      await apiClient.post(`/setup-orchestration/modules/${progress.module}/progress`, progress)
    } catch (error) {
      console.error(`Failed to save ${progress.module} progress:`, error)
      throw error
    }
  }

  /**
   * Get saved progress for a specific module
   *
   * Endpoint: GET /setup-orchestration/modules/{module}/progress
   * Auth: Requires firmId from authenticated user context
   *
   * Use Cases:
   * - When user returns to a module setup wizard
   * - To resume setup from where they left off
   * - To pre-populate form data from previous steps
   *
   * Returns null if:
   * - Module has never been started
   * - Module was completed/skipped (progress cleared)
   * - API request fails
   *
   * @param {string} module - Module identifier (hr, crm, finance, inventory, projects)
   * @returns {Promise<SetupProgress | null>} Saved progress or null if none exists
   */
  async getModuleProgress(module: ModuleSetupStatus['module']): Promise<SetupProgress | null> {
    try {
      const response = await apiClient.get<SetupProgress>(`/setup-orchestration/modules/${module}/progress`)
      return response.data
    } catch (error) {
      console.error(`Failed to fetch ${module} progress:`, error)
      return null
    }
  }

  /**
   * Get next incomplete module based on priority order
   *
   * No Direct Endpoint: Processes data from getSetupStatus()
   *
   * Module Priority Order:
   * 1. HR (order: 1, critical: true)
   * 2. CRM (order: 2, critical: true)
   * 3. Finance (order: 3, critical: true)
   * 4. Inventory (order: 4, critical: false)
   * 5. Projects (order: 5, critical: false)
   *
   * Logic:
   * - Filters out completed and skipped modules
   * - Sorts by order property (ascending)
   * - Returns first incomplete module
   * - Returns null if all modules are complete/skipped
   *
   * Used by:
   * - Dashboard "Continue Setup" button to navigate to next module
   * - Setup reminder to suggest which module to configure next
   *
   * @returns {Promise<ModuleSetupStatus | null>} Next module to set up, or null if all done
   */
  async getNextIncompleteModule(): Promise<ModuleSetupStatus | null> {
    try {
      const status = await this.getSetupStatus()
      const incompleteModules = status.modules
        .filter(m => !m.isComplete && !m.isSkipped)
        .sort((a, b) => a.order - b.order)

      return incompleteModules[0] || null
    } catch (error) {
      console.error('Failed to get next incomplete module:', error)
      return null
    }
  }

  /**
   * Reset all setup progress (admin only)
   *
   * Endpoint: POST /setup-orchestration/reset
   * Auth: Requires firmId + admin permissions
   *
   * Danger Zone Operation:
   * - Clears all module completion flags (isComplete, isSkipped)
   * - Deletes all saved progress data
   * - Resets overall progress to 0%
   * - Cannot be undone - all setup data is lost
   *
   * Use Cases:
   * - Testing/development purposes
   * - Allowing firm to reconfigure from scratch
   * - Fixing corrupted setup state
   *
   * Security:
   * - Should only be exposed to admin users
   * - Should require confirmation in UI before calling
   *
   * @throws {Error} If API request fails or user lacks permissions
   */
  async resetAllProgress(): Promise<void> {
    try {
      await apiClient.post('/setup-orchestration/reset')
    } catch (error) {
      console.error('Failed to reset setup progress:', error)
      throw error
    }
  }

  /**
   * Check if user should see setup reminder
   *
   * No Direct Endpoint: Processes data from getSetupStatus()
   *
   * Reminder Logic:
   * - Shows reminder if ANY critical module is incomplete/unskipped
   * - Critical modules: HR, CRM, Finance
   * - Non-critical modules don't trigger reminders
   *
   * Used by:
   * - App layout to show persistent setup reminder banner
   * - Navigation guards to redirect to setup pages
   * - Dashboard to highlight incomplete critical setup
   *
   * Returns false if:
   * - All critical modules are complete or skipped
   * - API request fails (fail open, don't annoy user)
   *
   * @returns {Promise<boolean>} True if setup reminder should be shown
   */
  async shouldShowSetupReminder(): Promise<boolean> {
    try {
      const status = await this.getSetupStatus()
      return status.hasCriticalSetupPending
    } catch (error) {
      console.error('Failed to check setup reminder:', error)
      return false
    }
  }
}

export const setupOrchestrationService = new SetupOrchestrationService()
export default setupOrchestrationService
