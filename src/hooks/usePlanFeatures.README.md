# usePlanFeatures Hook

A comprehensive React hook for managing plan-based feature access and subscription limits in the Traf3li dashboard.

## Overview

The `usePlanFeatures` hook provides a complete solution for:
- ✅ Checking feature access based on subscription plans
- 📊 Monitoring usage against plan limits
- 🚀 Triggering upgrade prompts
- 🔍 Plan comparison and recommendations

## Installation

The hook is already integrated with your existing auth system and plan configuration:

```tsx
import { usePlanFeatures } from '@/hooks/usePlanFeatures'
```

## Basic Usage

```tsx
function MyComponent() {
  const { canAccess, limits, showUpgrade } = usePlanFeatures()

  if (!canAccess('api_access')) {
    return (
      <div>
        <p>API access requires Professional plan or higher</p>
        <button onClick={() => showUpgrade('api_access')}>
          Upgrade Now
        </button>
      </div>
    )
  }

  return <ApiSettings />
}
```

## API Reference

### Properties

#### Plan Information
- `plan: PlanId` - Current user's plan ('free' | 'starter' | 'professional' | 'enterprise')
- `planConfig: PlanConfig` - Full plan configuration object
- `planLevel: number` - Numeric plan level (0-3)

#### Plan Type Checks
- `isFree: boolean` - Is user on free plan?
- `isStarter: boolean` - Is user on starter plan?
- `isProfessional: boolean` - Is user on professional plan?
- `isEnterprise: boolean` - Is user on enterprise plan?

#### Feature Access
- `canAccess(feature: FeatureId): boolean` - Check if feature is available
- `isAtLeast(planLevel: PlanId): boolean` - Check if plan meets minimum level
- `getRequiredPlan(feature: FeatureId): PlanId` - Get minimum plan for feature

#### Limits & Usage
- `limits: PlanLimits` - Current plan's limits
- `usage: UsageStats` - Current usage statistics
- `isNearLimit(resource: ResourceType): boolean` - Check if near limit (>80%)
- `isOverLimit(resource: ResourceType): boolean` - Check if over limit
- `getUsagePercent(resource: ResourceType): number` - Get usage percentage

#### Upgrade Functions
- `showUpgradePrompt(feature?: FeatureId): void` - Show upgrade modal
- `getUpgradeInfo(): object` - Get next plan and upgrade benefits

### Types

```typescript
type PlanId = 'free' | 'starter' | 'professional' | 'enterprise'

type FeatureId =
  | 'basic_cases'
  | 'api_access'
  | 'audit_logs'
  | 'custom_branding'
  // ... see plans.ts for full list

type ResourceType = 'users' | 'cases' | 'clients' | 'storage' | 'documents' | 'invoices'

interface PlanLimits {
  maxUsers: number // -1 for unlimited
  maxCases: number
  maxStorage: number // in MB
  maxDocumentsPerCase: number
  maxClientsPerCase: number
}

interface UsageStats {
  users: number
  cases: number
  clients: number
  storage: number // in MB
  documents: number
  invoices: number
}
```

## Usage Examples

### Example 1: Feature Gating

```tsx
function AdvancedReports() {
  const { canAccess, getRequiredPlan } = usePlanFeatures()

  if (!canAccess('advanced_reports')) {
    const requiredPlan = getRequiredPlan('advanced_reports')
    return (
      <UpgradePrompt
        feature="Advanced Reports"
        requiredPlan={requiredPlan}
      />
    )
  }

  return <ReportsContent />
}
```

### Example 2: Limit Warnings

```tsx
function CreateCaseButton() {
  const { isOverLimit, isNearLimit, showUpgrade } = usePlanFeatures()

  if (isOverLimit('cases')) {
    return (
      <Button disabled onClick={() => showUpgrade()}>
        Limit Reached - Upgrade to Add More
      </Button>
    )
  }

  if (isNearLimit('cases')) {
    return (
      <Button variant="warning">
        Add Case (Near Limit)
      </Button>
    )
  }

  return <Button>Add Case</Button>
}
```

### Example 3: Progressive Disclosure

```tsx
function SettingsPage() {
  const { isAtLeast, canAccess } = usePlanFeatures()

  return (
    <div>
      <GeneralSettings />

      {isAtLeast('starter') && <TeamSettings />}

      {canAccess('api_access') && <ApiSettings />}

      {canAccess('audit_logs') && <AuditLogsSettings />}
    </div>
  )
}
```

### Example 4: Usage Dashboard

```tsx
function UsageDashboard() {
  const { limits, usage, getUsagePercent } = usePlanFeatures()

  return (
    <div>
      <h2>Plan Usage</h2>
      <UsageBar
        label="Cases"
        current={usage.cases}
        limit={limits.maxCases}
        percent={getUsagePercent('cases')}
      />
      <UsageBar
        label="Storage"
        current={usage.storage}
        limit={limits.maxStorage}
        percent={getUsagePercent('storage')}
      />
    </div>
  )
}
```

### Example 5: Using Context (Optional)

For apps that need plan features throughout the component tree:

```tsx
// In your app root
import { PlanProvider } from '@/hooks/usePlanFeatures'

function App() {
  return (
    <PlanProvider>
      <YourApp />
    </PlanProvider>
  )
}

// In any child component
import { usePlanContext } from '@/hooks/usePlanFeatures'

function ChildComponent() {
  const { canAccess } = usePlanContext()
  // ... use plan features
}
```

## Plan Configuration

Plans are defined in `/src/config/plans.ts`:

- **Free**: 2 users, 10 cases, 100 MB storage
- **Starter**: 5 users, 50 cases, 1 GB storage, basic features
- **Professional**: 20 users, 500 cases, 10 GB storage, advanced features
- **Enterprise**: Unlimited everything, all features

## Features by Plan

### Free Plan
- Basic case management
- Basic client management
- Basic invoicing
- Email notifications
- Data export

### Starter Plan (+ Free features)
- Reports & analytics
- Calendar sync
- SMS notifications
- Document templates
- Team collaboration
- Backup & restore

### Professional Plan (+ Starter features)
- Advanced analytics
- API access
- Custom fields
- Bulk operations
- Client portal
- Payment processing
- Multi-currency
- Webhooks

### Enterprise Plan (+ Professional features)
- Audit logs
- Single Sign-On (SSO)
- Custom branding
- Dedicated support
- 99.9% SLA guarantee
- Advanced permissions

## Integration with Backend

### Current Implementation
The hook uses the existing auth store to get the user's plan:

```tsx
const user = useAuthStore((state) => state.user)
const plan = useAuthStore(selectPlan) as PlanId
```

### Usage Statistics (TODO)
Currently uses mock data. To integrate with your API:

```tsx
// Replace the mock usage in usePlanFeatures.tsx
const usage = useMemo<UsageStats>(() => {
  // Fetch from API
  const data = await fetch('/api/v1/usage/stats')
  return data.json()
}, [])
```

## Upgrade Modal (TODO)

The `showUpgradePrompt` function is a placeholder. Implement by:

1. Creating an upgrade modal component
2. Using the feature parameter to show relevant messaging
3. Linking to pricing/checkout page

Example:

```tsx
const showUpgradePrompt = useCallback((feature?: FeatureId) => {
  // Open modal
  openUpgradeModal({
    feature,
    currentPlan: plan,
    requiredPlan: feature ? getRequiredPlan(feature) : getUpgradeInfo().nextPlan
  })
}, [plan])
```

## Testing

```tsx
import { renderHook } from '@testing-library/react'
import { usePlanFeatures } from './usePlanFeatures'

describe('usePlanFeatures', () => {
  it('should return correct plan info', () => {
    const { result } = renderHook(() => usePlanFeatures())
    expect(result.current.plan).toBeDefined()
    expect(result.current.limits).toBeDefined()
  })

  it('should check feature access correctly', () => {
    const { result } = renderHook(() => usePlanFeatures())
    expect(result.current.canAccess('basic_cases')).toBe(true)
  })
})
```

## Best Practices

1. **Use early returns** for feature gates to keep components clean
2. **Show upgrade prompts** with clear value propositions
3. **Monitor limits proactively** - warn users before they hit limits
4. **Test with different plans** - ensure UI works for all plan types
5. **Cache usage data** - avoid excessive API calls

## Related Files

- `/src/config/plans.ts` - Plan configurations
- `/src/stores/auth-store.ts` - Auth state management
- `/src/hooks/usePlanFeatures.example.tsx` - More usage examples
- `/src/services/authService.ts` - Auth service with plan helpers

## Support

For questions or issues, refer to:
- Example file: `src/hooks/usePlanFeatures.example.tsx`
- Config file: `src/config/plans.ts`
- Auth store: `src/stores/auth-store.ts`
