/**
 * PlanGate - Conditionally render content based on user's plan
 *
 * Usage:
 * <PlanGate feature="audit_logs" fallback={<UpgradePrompt />}>
 *   <AuditLogViewer />
 * </PlanGate>
 *
 * <PlanGate plan="professional">
 *   <AdvancedReports />
 * </PlanGate>
 */

import React from 'react'
import { useAuthStore } from '@/stores/auth-store'
import { isPlanAtLeast } from '@/services/authService'
import { UpgradePrompt } from './upgrade-prompt'

// Plan type matching User interface
export type Plan = 'free' | 'starter' | 'professional' | 'enterprise'

// Feature definitions with their required plans
export const PLAN_FEATURES: Record<string, Plan> = {
  // Analytics & Reporting
  audit_logs: 'professional',
  advanced_analytics: 'professional',
  custom_reports: 'professional',
  data_export: 'starter',

  // Collaboration
  team_collaboration: 'starter',
  shared_workspaces: 'professional',

  // Automation
  workflow_automation: 'professional',
  custom_integrations: 'enterprise',
  api_access: 'professional',
  webhooks: 'enterprise',

  // Security
  sso: 'enterprise',
  two_factor_auth: 'professional',
  ip_whitelisting: 'enterprise',
  advanced_permissions: 'professional',

  // Support
  priority_support: 'professional',
  dedicated_manager: 'enterprise',

  // HR Features
  performance_reviews: 'professional',
  succession_planning: 'professional',
  compensation_management: 'professional',
  advanced_hr_analytics: 'enterprise',

  // Finance Features
  advanced_billing: 'professional',
  multi_currency: 'professional',
  custom_invoice_templates: 'starter',
  recurring_billing: 'professional',

  // Limits
  unlimited_users: 'enterprise',
  unlimited_storage: 'professional',
  unlimited_cases: 'starter',
}

interface PlanGateProps {
  /** Feature key to check (from PLAN_FEATURES) */
  feature?: string
  /** Minimum plan required (used if feature is not specified) */
  plan?: Plan
  /** Content to show if user has access */
  children: React.ReactNode
  /** Content to show if user doesn't have access (defaults to UpgradePrompt) */
  fallback?: React.ReactNode
  /** Show a lock icon overlay instead of completely hiding content */
  showLock?: boolean
  /** Custom className for the wrapper */
  className?: string
}

export function PlanGate({
  feature,
  plan,
  children,
  fallback,
  showLock = false,
  className,
}: PlanGateProps) {
  const user = useAuthStore((state) => state.user)

  // Determine the required plan
  const requiredPlan = feature ? PLAN_FEATURES[feature] : plan

  if (!requiredPlan) {
    // No plan requirement specified, show content
    return <>{children}</>
  }

  // Check if user meets the plan requirement
  const userPlan = user?.plan || 'free'
  const hasAccess = isPlanAtLeast(userPlan, requiredPlan)

  // If user has access, render children normally
  if (hasAccess) {
    return <>{children}</>
  }

  // If showLock is enabled, show content with overlay
  if (showLock) {
    return (
      <div className={className} style={{ position: 'relative' }}>
        <div style={{
          filter: 'blur(4px)',
          pointerEvents: 'none',
          userSelect: 'none'
        }}>
          {children}
        </div>
        <div
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            backgroundColor: 'rgba(0, 0, 0, 0.1)',
            backdropFilter: 'blur(2px)',
          }}
        >
          {fallback || <UpgradePrompt feature={feature} requiredPlan={requiredPlan} variant="inline" />}
        </div>
      </div>
    )
  }

  // Otherwise, show fallback or default UpgradePrompt
  return (
    <div className={className}>
      {fallback || <UpgradePrompt feature={feature} requiredPlan={requiredPlan} />}
    </div>
  )
}

/**
 * Hook to check if user has access to a feature
 * Useful for conditional logic outside of JSX
 */
export function useFeatureAccess(feature: string): boolean {
  const user = useAuthStore((state) => state.user)
  const requiredPlan = PLAN_FEATURES[feature]

  if (!requiredPlan) return true // Feature not in registry, allow access

  const userPlan = user?.plan || 'free'
  return isPlanAtLeast(userPlan, requiredPlan)
}

/**
 * Hook to check if user's plan meets minimum requirement
 */
export function usePlanAccess(plan: Plan): boolean {
  const user = useAuthStore((state) => state.user)
  const userPlan = user?.plan || 'free'
  return isPlanAtLeast(userPlan, plan)
}

/**
 * Check if user has a specific feature in their features array
 * This is for custom/add-on features not tied to plan tiers
 */
export function useHasFeature(featureName: string): boolean {
  const user = useAuthStore((state) => state.user)
  return user?.features?.includes(featureName) ?? false
}
