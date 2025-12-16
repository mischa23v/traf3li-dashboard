/**
 * Usage Examples for usePlanFeatures Hook
 *
 * This file demonstrates various ways to use the usePlanFeatures hook
 * for implementing plan-based feature access control.
 */

import { usePlanFeatures } from './usePlanFeatures'
import { Button } from '@/components/ui/button'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Badge } from '@/components/ui/badge'

// ============================================================================
// Example 1: Basic Feature Access Check
// ============================================================================

export function ApiSettingsPage() {
  const { canAccess, showUpgradePrompt } = usePlanFeatures()

  if (!canAccess('api_access')) {
    return (
      <Alert>
        <AlertDescription>
          API access is only available on Professional and Enterprise plans.
          <Button onClick={() => showUpgradePrompt('api_access')} className="ml-2">
            Upgrade Now
          </Button>
        </AlertDescription>
      </Alert>
    )
  }

  return (
    <div>
      <h1>API Settings</h1>
      {/* API settings content */}
    </div>
  )
}

// ============================================================================
// Example 2: Plan Type Checks
// ============================================================================

export function DashboardHeader() {
  const { plan, isEnterprise, isProfessional } = usePlanFeatures()

  return (
    <div className="flex items-center justify-between">
      <h1>Dashboard</h1>
      <Badge variant={isEnterprise ? 'default' : 'secondary'}>
        {plan.toUpperCase()}
      </Badge>
      {(isEnterprise || isProfessional) && (
        <span className="text-sm text-muted-foreground">
          Advanced features enabled
        </span>
      )}
    </div>
  )
}

// ============================================================================
// Example 3: Limit Checking
// ============================================================================

export function CasesList() {
  const {
    limits,
    usage,
    isNearLimit,
    isOverLimit,
    getUsagePercent,
    showUpgradePrompt
  } = usePlanFeatures()

  const casesPercent = getUsagePercent('cases')
  const nearLimit = isNearLimit('cases')
  const overLimit = isOverLimit('cases')

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <h2>Cases</h2>
        <div className="text-sm">
          {usage.cases} / {limits.maxCases === -1 ? '∞' : limits.maxCases} cases
          {nearLimit && (
            <Badge variant="warning" className="ml-2">
              Near Limit ({casesPercent}%)
            </Badge>
          )}
          {overLimit && (
            <Badge variant="destructive" className="ml-2">
              Limit Reached
            </Badge>
          )}
        </div>
      </div>

      {overLimit && (
        <Alert variant="destructive">
          <AlertDescription>
            You've reached your case limit. Upgrade to add more cases.
            <Button
              onClick={() => showUpgradePrompt()}
              variant="outline"
              size="sm"
              className="ml-2"
            >
              Upgrade Plan
            </Button>
          </AlertDescription>
        </Alert>
      )}

      {/* Cases list content */}
    </div>
  )
}

// ============================================================================
// Example 4: Conditional UI Elements
// ============================================================================

export function FeaturesList() {
  const { canAccess, getRequiredPlan } = usePlanFeatures()

  const features = [
    { id: 'basic_cases' as const, name: 'Case Management' },
    { id: 'api_access' as const, name: 'API Access' },
    { id: 'audit_logs' as const, name: 'Audit Logs' },
    { id: 'custom_branding' as const, name: 'Custom Branding' },
  ]

  return (
    <div className="space-y-2">
      {features.map((feature) => {
        const hasAccess = canAccess(feature.id)
        const requiredPlan = getRequiredPlan(feature.id)

        return (
          <div
            key={feature.id}
            className="flex items-center justify-between p-3 border rounded"
          >
            <span className={hasAccess ? '' : 'text-muted-foreground'}>
              {feature.name}
            </span>
            {hasAccess ? (
              <Badge variant="success">Available</Badge>
            ) : (
              <Badge variant="outline">
                Requires {requiredPlan}
              </Badge>
            )}
          </div>
        )
      })}
    </div>
  )
}

// ============================================================================
// Example 5: Plan Comparison
// ============================================================================

export function UpgradePrompt() {
  const {
    plan,
    planConfig,
    getUpgradeInfo,
    isAtLeast
  } = usePlanFeatures()

  const upgradeInfo = getUpgradeInfo()

  if (!upgradeInfo.nextPlan) {
    return (
      <div>
        <p>You're on the highest plan! 🎉</p>
      </div>
    )
  }

  return (
    <div className="p-6 border rounded-lg">
      <h3 className="text-lg font-semibold mb-2">
        Upgrade to {upgradeInfo.nextPlan}
      </h3>
      <p className="text-sm text-muted-foreground mb-4">
        Current: {plan}
      </p>

      <div className="space-y-2">
        <p className="font-medium">Benefits:</p>
        <ul className="list-disc list-inside space-y-1">
          {upgradeInfo.benefits.map((benefit, index) => (
            <li key={index} className="text-sm">
              {benefit}
            </li>
          ))}
        </ul>
      </div>

      <Button className="mt-4 w-full">
        Upgrade Now
      </Button>
    </div>
  )
}

// ============================================================================
// Example 6: Using Plan Context (Alternative)
// ============================================================================

import { PlanProvider, usePlanContext } from './usePlanFeatures'

// Wrap your app with PlanProvider
export function App() {
  return (
    <PlanProvider>
      <AppContent />
    </PlanProvider>
  )
}

// Then use usePlanContext in any child component
function AppContent() {
  const { canAccess } = usePlanContext()

  return (
    <div>
      {canAccess('advanced_reports') && <AdvancedReportsSection />}
    </div>
  )
}

function AdvancedReportsSection() {
  return <div>Advanced Reports</div>
}

// ============================================================================
// Example 7: Progressive Feature Disclosure
// ============================================================================

export function SettingsMenu() {
  const { canAccess, isAtLeast, showUpgradePrompt } = usePlanFeatures()

  const menuItems = [
    {
      label: 'General',
      feature: 'basic_cases' as const,
      path: '/settings/general',
    },
    {
      label: 'Team',
      feature: 'team_collaboration' as const,
      path: '/settings/team',
    },
    {
      label: 'API',
      feature: 'api_access' as const,
      path: '/settings/api',
    },
    {
      label: 'Audit Logs',
      feature: 'audit_logs' as const,
      path: '/settings/audit',
    },
  ]

  return (
    <nav className="space-y-1">
      {menuItems.map((item) => {
        const hasAccess = canAccess(item.feature)

        return (
          <button
            key={item.path}
            onClick={() => {
              if (!hasAccess) {
                showUpgradePrompt(item.feature)
              } else {
                // Navigate to item.path
              }
            }}
            className={`
              w-full text-left px-3 py-2 rounded
              ${hasAccess ? 'hover:bg-accent' : 'opacity-50 cursor-not-allowed'}
            `}
            disabled={!hasAccess}
          >
            <div className="flex items-center justify-between">
              <span>{item.label}</span>
              {!hasAccess && (
                <Badge variant="outline" size="sm">
                  Premium
                </Badge>
              )}
            </div>
          </button>
        )
      })}
    </nav>
  )
}

// ============================================================================
// Example 8: Usage Monitoring Widget
// ============================================================================

export function UsageWidget() {
  const {
    limits,
    usage,
    getUsagePercent,
    isNearLimit,
    showUpgradePrompt
  } = usePlanFeatures()

  const resources = [
    { key: 'users' as const, label: 'Users' },
    { key: 'cases' as const, label: 'Cases' },
    { key: 'storage' as const, label: 'Storage' },
  ]

  return (
    <div className="p-4 border rounded-lg space-y-3">
      <h3 className="font-semibold">Plan Usage</h3>

      {resources.map((resource) => {
        const percent = getUsagePercent(resource.key)
        const limit = limits[
          resource.key === 'users' ? 'maxUsers' :
          resource.key === 'cases' ? 'maxCases' :
          'maxStorage'
        ]
        const current = usage[resource.key]
        const near = isNearLimit(resource.key)

        return (
          <div key={resource.key} className="space-y-1">
            <div className="flex justify-between text-sm">
              <span>{resource.label}</span>
              <span className={near ? 'text-warning' : ''}>
                {current} / {limit === -1 ? '∞' : limit}
              </span>
            </div>
            {limit !== -1 && (
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div
                  className={`h-2 rounded-full ${
                    near ? 'bg-warning' : 'bg-primary'
                  }`}
                  style={{ width: `${Math.min(percent, 100)}%` }}
                />
              </div>
            )}
          </div>
        )
      })}

      <Button
        onClick={() => showUpgradePrompt()}
        variant="outline"
        size="sm"
        className="w-full mt-2"
      >
        Upgrade Plan
      </Button>
    </div>
  )
}
