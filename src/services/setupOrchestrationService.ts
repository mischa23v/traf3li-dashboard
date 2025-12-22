import { apiClient } from '@/lib/api-client'

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
   * Get overall setup orchestration status
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
   * Mark a module as complete
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
   * Mark a module as skipped
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
   * Save progress for a specific module
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
   * Get progress for a specific module
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
   * Get next incomplete module
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
