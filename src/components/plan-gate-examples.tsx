/**
 * PlanGate Usage Examples
 *
 * This file demonstrates various ways to use the plan-based feature gating components.
 * Copy these examples into your actual components as needed.
 */

import React from 'react'
import { PlanGate, useFeatureAccess, usePlanAccess } from './plan-gate'
import { UpgradePrompt } from './upgrade-prompt'
import { PlanBadge, PlanIndicator } from './plan-badge'
import { Card, CardContent, CardHeader, CardTitle } from './ui/card'
import { Button } from './ui/button'

/**
 * Example 1: Basic feature gating
 */
export function AuditLogsExample() {
  return (
    <PlanGate feature="audit_logs">
      <div>
        <h2>Audit Logs</h2>
        <p>View all system changes and user actions...</p>
      </div>
    </PlanGate>
  )
}

/**
 * Example 2: Plan-based gating (without specific feature)
 */
export function ProfessionalFeatureExample() {
  return (
    <PlanGate plan="professional">
      <div>
        <h2>Professional Dashboard</h2>
        <p>Advanced analytics and reports...</p>
      </div>
    </PlanGate>
  )
}

/**
 * Example 3: Custom fallback
 */
export function CustomFallbackExample() {
  return (
    <PlanGate
      feature="workflow_automation"
      fallback={
        <Card>
          <CardHeader>
            <CardTitle>Automation Hub</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground mb-4">
              Automate your workflows and save time
            </p>
            <UpgradePrompt
              feature="workflow_automation"
              requiredPlan="professional"
              variant="inline"
            />
          </CardContent>
        </Card>
      }
    >
      <div>
        <h2>Automation Hub</h2>
        <p>Create and manage automated workflows...</p>
      </div>
    </PlanGate>
  )
}

/**
 * Example 4: Show locked content with overlay
 */
export function LockedPreviewExample() {
  return (
    <PlanGate feature="advanced_analytics" showLock>
      <div>
        <h2>Advanced Analytics</h2>
        <p>Deep insights into your business performance...</p>
        {/* Charts and graphs would be shown but blurred */}
      </div>
    </PlanGate>
  )
}

/**
 * Example 5: Conditional rendering in code using hooks
 */
export function ConditionalButtonExample() {
  const hasAuditLogs = useFeatureAccess('audit_logs')
  const hasProPlan = usePlanAccess('professional')

  return (
    <div>
      <h2>Settings</h2>

      {hasAuditLogs && (
        <Button onClick={() => console.log('View audit logs')}>
          View Audit Logs
        </Button>
      )}

      {!hasAuditLogs && (
        <UpgradePrompt
          feature="audit_logs"
          requiredPlan="professional"
          variant="banner"
        />
      )}

      {hasProPlan && (
        <p>You have access to all professional features!</p>
      )}
    </div>
  )
}

/**
 * Example 6: Different upgrade prompt variants
 */
export function UpgradePromptVariantsExample() {
  return (
    <div className="space-y-6">
      {/* Card variant (default) */}
      <UpgradePrompt
        feature="audit_logs"
        requiredPlan="professional"
        variant="card"
      />

      {/* Banner variant */}
      <UpgradePrompt
        feature="api_access"
        requiredPlan="professional"
        variant="banner"
      />

      {/* Inline variant */}
      <div className="flex items-center justify-between p-4 border rounded">
        <span>API Access</span>
        <UpgradePrompt
          feature="api_access"
          requiredPlan="professional"
          variant="inline"
        />
      </div>

      {/* Modal variant */}
      <Button onClick={() => {/* Set modal state to open */}}>
        Try Premium Feature
      </Button>
      <UpgradePrompt
        feature="sso"
        requiredPlan="enterprise"
        variant="modal"
        open={false} // Control with state
        onClose={() => console.log('Modal closed')}
        onUpgrade={() => console.log('Upgrade clicked')}
      />
    </div>
  )
}

/**
 * Example 7: Plan badge usage
 */
export function PlanBadgeExample() {
  return (
    <div className="space-y-4">
      {/* Default - shows current user's plan */}
      <PlanBadge />

      {/* With trial indicator */}
      <PlanBadge showTrial />

      {/* Different sizes */}
      <div className="flex items-center gap-2">
        <PlanBadge size="sm" />
        <PlanBadge size="md" />
        <PlanBadge size="lg" />
      </div>

      {/* Without icon */}
      <PlanBadge showIcon={false} />

      {/* Clickable (navigates to billing) */}
      <PlanBadge clickable />

      {/* Override plan (for display purposes) */}
      <PlanBadge plan="enterprise" />

      {/* Plan indicator (compact version) */}
      <div className="flex items-center gap-2">
        <PlanIndicator plan="free" size="sm" />
        <PlanIndicator plan="starter" size="md" />
        <PlanIndicator plan="professional" size="md" />
        <PlanIndicator plan="enterprise" size="lg" />
      </div>
    </div>
  )
}

/**
 * Example 8: Table with plan indicators
 */
export function UsersTableWithPlansExample() {
  const users = [
    { id: 1, name: 'Ahmed', plan: 'professional' as const },
    { id: 2, name: 'Sara', plan: 'starter' as const },
    { id: 3, name: 'Mohammed', plan: 'enterprise' as const },
  ]

  return (
    <table>
      <thead>
        <tr>
          <th>Name</th>
          <th>Plan</th>
        </tr>
      </thead>
      <tbody>
        {users.map((user) => (
          <tr key={user.id}>
            <td>{user.name}</td>
            <td>
              <PlanBadge plan={user.plan} size="sm" />
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  )
}

/**
 * Example 9: Settings page with feature sections
 */
export function SettingsWithFeatureGatingExample() {
  return (
    <div className="space-y-6">
      {/* Always visible section */}
      <Card>
        <CardHeader>
          <CardTitle>Basic Settings</CardTitle>
        </CardHeader>
        <CardContent>
          <p>Profile, preferences, notifications...</p>
        </CardContent>
      </Card>

      {/* Gated section - card variant */}
      <PlanGate feature="advanced_permissions">
        <Card>
          <CardHeader>
            <CardTitle>Advanced Permissions</CardTitle>
          </CardHeader>
          <CardContent>
            <p>Fine-grained access control...</p>
          </CardContent>
        </Card>
      </PlanGate>

      {/* Gated section - locked preview */}
      <PlanGate feature="api_access" showLock>
        <Card>
          <CardHeader>
            <CardTitle>API Access</CardTitle>
          </CardHeader>
          <CardContent>
            <p>Manage API keys and webhooks...</p>
          </CardContent>
        </Card>
      </PlanGate>
    </div>
  )
}

/**
 * Example 10: Navigation menu with plan badges
 */
export function NavigationWithPlanBadgesExample() {
  const menuItems = [
    { name: 'Dashboard', path: '/dashboard', feature: null },
    { name: 'Reports', path: '/reports', feature: null },
    { name: 'Analytics', path: '/analytics', feature: 'advanced_analytics' },
    { name: 'Audit Logs', path: '/audit', feature: 'audit_logs' },
    { name: 'API', path: '/api', feature: 'api_access' },
  ]

  return (
    <nav>
      {menuItems.map((item) => (
        <NavItem key={item.path} item={item} />
      ))}
    </nav>
  )
}

function NavItem({ item }: { item: { name: string; path: string; feature: string | null } }) {
  const hasAccess = useFeatureAccess(item.feature || '')

  return (
    <a
      href={item.path}
      className={hasAccess ? '' : 'opacity-50 cursor-not-allowed'}
      onClick={(e) => {
        if (!hasAccess && item.feature) {
          e.preventDefault()
          // Show upgrade prompt
        }
      }}
    >
      {item.name}
      {!hasAccess && item.feature && (
        <span className="ml-2">
          <PlanIndicator size="sm" />
        </span>
      )}
    </a>
  )
}
