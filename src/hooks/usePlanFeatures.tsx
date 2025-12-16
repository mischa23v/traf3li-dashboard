/**
 * Hook for checking plan-based feature access
 *
 * Usage:
 * ```tsx
 * const { canAccess, isEnterprise, limits, showUpgrade } = usePlanFeatures()
 *
 * if (!canAccess('audit_logs')) {
 *   return <UpgradePrompt feature="audit_logs" />
 * }
 * ```
 */

import { useCallback, useMemo, useState, createContext, useContext, type ReactNode } from 'react'
import { useAuthStore, selectPlan } from '@/stores/auth-store'
import {
  type PlanId,
  type FeatureId,
  type PlanConfig,
  type PlanLimits,
  PLANS,
  PLAN_IDS,
  getPlanConfig,
  hasFeature,
  getPlanLimits,
  getUpgradePath,
  hasReachedLimit,
  getUsagePercentage,
  isUnlimited,
} from '@/config/plans'

/**
 * Usage statistics for the current user/firm
 * TODO: Replace with actual API calls to fetch real usage data
 */
interface UsageStats {
  users: number
  cases: number
  clients: number
  storage: number // in MB
  documents: number
  invoices: number
}

/**
 * Resource types for limit checking
 */
type ResourceType = 'users' | 'cases' | 'clients' | 'storage' | 'documents' | 'invoices'

/**
 * Return type for the usePlanFeatures hook
 */
interface UsePlanFeaturesReturn {
  // Current plan info
  plan: PlanId
  planConfig: PlanConfig
  planLevel: number

  // Plan type checks
  isFree: boolean
  isStarter: boolean
  isProfessional: boolean
  isEnterprise: boolean

  // Feature access
  canAccess: (feature: FeatureId) => boolean
  isAtLeast: (planLevel: PlanId) => boolean
  getRequiredPlan: (feature: FeatureId) => PlanId

  // Limits and usage
  limits: PlanLimits
  usage: UsageStats
  isNearLimit: (resource: ResourceType) => boolean
  isOverLimit: (resource: ResourceType) => boolean
  getUsagePercent: (resource: ResourceType) => number

  // Upgrade functionality
  showUpgradePrompt: (feature?: FeatureId) => void
  getUpgradeInfo: () => {
    nextPlan: PlanId | null
    benefits: string[]
    benefitsAr: string[]
  }
}

/**
 * Near limit threshold (percentage)
 */
const NEAR_LIMIT_THRESHOLD = 80 // 80%

/**
 * Hook for accessing plan-based features and limits
 *
 * @returns Object with plan info, feature checks, limits, usage, and upgrade functions
 *
 * @example
 * ```tsx
 * function MyComponent() {
 *   const { canAccess, isEnterprise, limits, showUpgrade } = usePlanFeatures()
 *
 *   if (!canAccess('api_access')) {
 *     return (
 *       <div>
 *         <p>API access is only available on Professional and Enterprise plans</p>
 *         <button onClick={() => showUpgrade('api_access')}>Upgrade Now</button>
 *       </div>
 *     )
 *   }
 *
 *   return <ApiSettings />
 * }
 * ```
 */
export function usePlanFeatures(): UsePlanFeaturesReturn {
  const user = useAuthStore((state) => state.user)
  const plan = useAuthStore(selectPlan) as PlanId

  // State for upgrade modal (you can implement the actual modal component separately)
  const [upgradeFeature, setUpgradeFeature] = useState<FeatureId | null>(null)

  // Get plan configuration
  const planConfig = useMemo(() => getPlanConfig(plan), [plan])

  // Get plan limits
  const limits = useMemo(() => getPlanLimits(plan), [plan])

  // Plan level (0-3)
  const planLevel = useMemo(() => {
    return PLAN_IDS.indexOf(plan)
  }, [plan])

  // Plan type boolean flags
  const isFree = useMemo(() => plan === 'free', [plan])
  const isStarter = useMemo(() => plan === 'starter', [plan])
  const isProfessional = useMemo(() => plan === 'professional', [plan])
  const isEnterprise = useMemo(() => plan === 'enterprise', [plan])

  /**
   * Mock usage data - Replace with actual API call
   * TODO: Implement API endpoint to fetch real usage statistics
   */
  const usage = useMemo<UsageStats>(() => {
    // For now, return mock data
    // In production, this should fetch from an API endpoint
    return {
      users: 2,
      cases: 5,
      clients: 8,
      storage: 45, // MB
      documents: 23,
      invoices: 4,
    }
  }, [])

  /**
   * Check if user can access a specific feature
   *
   * @param feature - The feature ID to check
   * @returns true if user's plan includes this feature
   */
  const canAccess = useCallback(
    (feature: FeatureId): boolean => {
      if (!plan) return false
      return hasFeature(plan, feature)
    },
    [plan]
  )

  /**
   * Check if user's plan is at least the specified level
   *
   * @param requiredPlan - The minimum plan level required
   * @returns true if user's plan meets or exceeds the required level
   *
   * @example
   * ```tsx
   * if (isAtLeast('professional')) {
   *   // Show professional features
   * }
   * ```
   */
  const isAtLeast = useCallback(
    (requiredPlan: PlanId): boolean => {
      const currentLevel = PLAN_IDS.indexOf(plan)
      const requiredLevel = PLAN_IDS.indexOf(requiredPlan)
      return currentLevel >= requiredLevel
    },
    [plan]
  )

  /**
   * Get the minimum plan required for a feature
   *
   * @param feature - The feature ID to check
   * @returns The minimum plan ID that includes this feature
   */
  const getRequiredPlan = useCallback((feature: FeatureId): PlanId => {
    // Find the lowest plan tier that includes this feature
    for (const planId of PLAN_IDS) {
      if (hasFeature(planId, feature)) {
        return planId
      }
    }
    // If feature not found in any plan, default to enterprise
    return 'enterprise'
  }, [])

  /**
   * Check if user is near a resource limit (>= 80% usage)
   *
   * @param resource - The resource type to check
   * @returns true if usage is >= 80% of limit
   */
  const isNearLimit = useCallback(
    (resource: ResourceType): boolean => {
      const limit = limits[resource === 'storage' ? 'maxStorage' : resource === 'users' ? 'maxUsers' : resource === 'cases' ? 'maxCases' : resource === 'documents' ? 'maxDocumentsPerCase' : 'maxStorage']

      // If unlimited, never near limit
      if (isUnlimited(limit)) return false

      const currentUsage = usage[resource]
      const percentage = getUsagePercentage(currentUsage, limit)

      return percentage >= NEAR_LIMIT_THRESHOLD
    },
    [limits, usage]
  )

  /**
   * Check if user has exceeded a resource limit
   *
   * @param resource - The resource type to check
   * @returns true if usage exceeds the limit
   */
  const isOverLimit = useCallback(
    (resource: ResourceType): boolean => {
      const limit = limits[resource === 'storage' ? 'maxStorage' : resource === 'users' ? 'maxUsers' : resource === 'cases' ? 'maxCases' : resource === 'documents' ? 'maxDocumentsPerCase' : 'maxStorage']

      // If unlimited, never over limit
      if (isUnlimited(limit)) return false

      const currentUsage = usage[resource]
      return hasReachedLimit(currentUsage, limit)
    },
    [limits, usage]
  )

  /**
   * Get usage percentage for a resource
   *
   * @param resource - The resource type to check
   * @returns Usage percentage (0-100), or 0 if unlimited
   */
  const getUsagePercent = useCallback(
    (resource: ResourceType): number => {
      const limit = limits[resource === 'storage' ? 'maxStorage' : resource === 'users' ? 'maxUsers' : resource === 'cases' ? 'maxCases' : resource === 'documents' ? 'maxDocumentsPerCase' : 'maxStorage']

      // If unlimited, return 0
      if (isUnlimited(limit)) return 0

      const currentUsage = usage[resource]
      return getUsagePercentage(currentUsage, limit)
    },
    [limits, usage]
  )

  /**
   * Show upgrade prompt/modal for a specific feature or general upgrade
   *
   * @param feature - Optional feature that requires upgrade
   *
   * TODO: Implement actual modal component and navigation to pricing page
   */
  const showUpgradePrompt = useCallback((feature?: FeatureId) => {
    setUpgradeFeature(feature || null)

    // TODO: Implement modal or navigation to upgrade page
    // For now, just log to console
    console.log('Upgrade prompt requested', { feature })

    // Example implementation:
    // - Show modal with upgrade benefits
    // - Highlight the required plan for the feature
    // - Provide direct link to pricing/checkout page
  }, [])

  /**
   * Get upgrade information for current plan
   *
   * @returns Object with next plan and benefits of upgrading
   */
  const getUpgradeInfo = useCallback(() => {
    const upgradePath = getUpgradePath(plan)
    return {
      nextPlan: upgradePath.to,
      benefits: upgradePath.benefits,
      benefitsAr: upgradePath.benefitsAr,
    }
  }, [plan])

  return {
    // Current plan info
    plan,
    planConfig,
    planLevel,

    // Plan type checks
    isFree,
    isStarter,
    isProfessional,
    isEnterprise,

    // Feature access
    canAccess,
    isAtLeast,
    getRequiredPlan,

    // Limits and usage
    limits,
    usage,
    isNearLimit,
    isOverLimit,
    getUsagePercent,

    // Upgrade functionality
    showUpgradePrompt,
    getUpgradeInfo,
  }
}

/**
 * Context for plan features (optional enhancement)
 *
 * You can wrap your app with PlanProvider to make plan features
 * available throughout the component tree without prop drilling
 */

interface PlanContextValue extends UsePlanFeaturesReturn {
  // Add any additional context-specific values here
}

const PlanContext = createContext<PlanContextValue | null>(null)

/**
 * Provider component for plan features context
 *
 * @example
 * ```tsx
 * function App() {
 *   return (
 *     <PlanProvider>
 *       <YourApp />
 *     </PlanProvider>
 *   )
 * }
 * ```
 */
export function PlanProvider({ children }: { children: ReactNode }) {
  const planFeatures = usePlanFeatures()

  return (
    <PlanContext.Provider value={planFeatures}>
      {children}
    </PlanContext.Provider>
  )
}

/**
 * Hook to access plan context
 *
 * @throws Error if used outside of PlanProvider
 *
 * @example
 * ```tsx
 * function MyComponent() {
 *   const { canAccess } = usePlanContext()
 *   // ...
 * }
 * ```
 */
export function usePlanContext(): PlanContextValue {
  const context = useContext(PlanContext)

  if (!context) {
    throw new Error('usePlanContext must be used within a PlanProvider')
  }

  return context
}

// Re-export types for convenience
export type {
  PlanId,
  FeatureId,
  PlanConfig,
  PlanLimits,
  UsageStats,
  ResourceType,
}
