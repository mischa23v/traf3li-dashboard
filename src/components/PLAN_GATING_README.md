# Plan-Based Feature Gating Components

Complete system for implementing plan-based feature restrictions in the Traf3li dashboard.

## Components

### 1. PlanGate

Conditionally render content based on user's subscription plan.

**Location:** `/src/components/plan-gate.tsx`

#### Basic Usage

```tsx
import { PlanGate } from '@/components/plan-gate'

// Gate by feature name
<PlanGate feature="audit_logs">
  <AuditLogViewer />
</PlanGate>

// Gate by plan tier
<PlanGate plan="professional">
  <AdvancedDashboard />
</PlanGate>
```

#### Props

| Prop | Type | Description |
|------|------|-------------|
| `feature` | `string` | Feature key from `PLAN_FEATURES` registry |
| `plan` | `Plan` | Minimum plan required ('free', 'starter', 'professional', 'enterprise') |
| `children` | `ReactNode` | Content to show if user has access |
| `fallback` | `ReactNode` | Content to show if access denied (default: `UpgradePrompt`) |
| `showLock` | `boolean` | Show blurred content with lock overlay instead of hiding |
| `className` | `string` | Custom CSS class |

#### Available Features

The following features are pre-configured in `PLAN_FEATURES`:

**Analytics & Reporting**
- `audit_logs` (Professional) - View system audit logs
- `advanced_analytics` (Professional) - Advanced analytics dashboards
- `custom_reports` (Professional) - Create custom reports
- `data_export` (Starter) - Export data to CSV/Excel

**Collaboration**
- `team_collaboration` (Starter) - Team features
- `shared_workspaces` (Professional) - Shared workspaces

**Automation**
- `workflow_automation` (Professional) - Automate workflows
- `custom_integrations` (Enterprise) - Custom integrations
- `api_access` (Professional) - REST API access
- `webhooks` (Enterprise) - Webhook support

**Security**
- `sso` (Enterprise) - Single Sign-On
- `two_factor_auth` (Professional) - 2FA
- `ip_whitelisting` (Enterprise) - IP restrictions
- `advanced_permissions` (Professional) - Fine-grained permissions

**Support**
- `priority_support` (Professional) - Priority support
- `dedicated_manager` (Enterprise) - Dedicated account manager

**HR Features**
- `performance_reviews` (Professional)
- `succession_planning` (Professional)
- `compensation_management` (Professional)
- `advanced_hr_analytics` (Enterprise)

**Finance Features**
- `advanced_billing` (Professional)
- `multi_currency` (Professional)
- `custom_invoice_templates` (Starter)
- `recurring_billing` (Professional)

#### Advanced Examples

**Custom Fallback**
```tsx
<PlanGate
  feature="workflow_automation"
  fallback={<CustomUpgradeCard />}
>
  <AutomationHub />
</PlanGate>
```

**Locked Preview** (show blurred content)
```tsx
<PlanGate feature="advanced_analytics" showLock>
  <AnalyticsDashboard />
</PlanGate>
```

### 2. UpgradePrompt

Beautiful upgrade prompt component with multiple display variants.

**Location:** `/src/components/upgrade-prompt.tsx`

#### Usage

```tsx
import { UpgradePrompt } from '@/components/upgrade-prompt'

// Card variant (default)
<UpgradePrompt
  feature="audit_logs"
  requiredPlan="professional"
/>

// Banner variant
<UpgradePrompt
  feature="api_access"
  requiredPlan="professional"
  variant="banner"
/>

// Inline variant (compact)
<UpgradePrompt
  feature="sso"
  requiredPlan="enterprise"
  variant="inline"
/>

// Modal variant
<UpgradePrompt
  feature="advanced_analytics"
  requiredPlan="professional"
  variant="modal"
  open={isModalOpen}
  onClose={() => setIsModalOpen(false)}
  onUpgrade={() => navigate('/billing')}
/>
```

#### Props

| Prop | Type | Description |
|------|------|-------------|
| `feature` | `string` | Feature being accessed |
| `requiredPlan` | `Plan` | Plan required for this feature |
| `variant` | `'modal' \| 'card' \| 'banner' \| 'inline'` | Display variant |
| `onUpgrade` | `() => void` | Callback when upgrade button clicked |
| `onClose` | `() => void` | Callback when modal/banner closed |
| `open` | `boolean` | Whether modal is open (modal variant only) |
| `className` | `string` | Custom CSS class |

#### Variants

**Card** (default)
- Standalone card component
- Shows feature benefits and plan comparison
- Best for: Dedicated upgrade pages, empty states

**Banner**
- Horizontal alert banner
- Dismissible
- Best for: Top of page notifications

**Inline**
- Compact one-line message
- Shows plan name and upgrade button
- Best for: Tight spaces, tables, lists

**Modal**
- Full modal dialog
- Controlled open/close state
- Best for: Interrupting actions, feature discovery

#### Bilingual Support

All text automatically adapts to Arabic/English based on `i18n.language`:
- Arabic: Right-to-left layout
- English: Left-to-right layout

### 3. PlanBadge

Badge component showing user's current subscription plan.

**Location:** `/src/components/plan-badge.tsx`

#### Usage

```tsx
import { PlanBadge, PlanIndicator } from '@/components/plan-badge'

// Basic badge (shows current user's plan)
<PlanBadge />

// With trial indicator
<PlanBadge showTrial />

// Different sizes
<PlanBadge size="sm" />
<PlanBadge size="md" />
<PlanBadge size="lg" />

// Clickable (navigates to billing)
<PlanBadge clickable />

// Override plan (for display)
<PlanBadge plan="enterprise" />

// Compact indicator (icon only)
<PlanIndicator plan="professional" size="md" />
```

#### PlanBadge Props

| Prop | Type | Description |
|------|------|-------------|
| `plan` | `Plan` | Override plan (uses user's plan if not specified) |
| `showTrial` | `boolean` | Show trial indicator and days remaining |
| `showIcon` | `boolean` | Show plan icon |
| `size` | `'sm' \| 'md' \| 'lg'` | Size variant |
| `className` | `string` | Custom CSS class |
| `clickable` | `boolean` | Make badge clickable (navigates to billing) |

#### PlanIndicator Props

| Prop | Type | Description |
|------|------|-------------|
| `plan` | `Plan` | Plan to display |
| `size` | `'sm' \| 'md' \| 'lg'` | Size variant |
| `className` | `string` | Custom CSS class |

#### Plan Colors

- **Free**: Gray
- **Starter**: Blue
- **Professional**: Purple
- **Enterprise**: Amber/Gold

## Hooks

### useFeatureAccess

Check if user has access to a specific feature.

```tsx
import { useFeatureAccess } from '@/components/plan-gate'

function MyComponent() {
  const hasAuditLogs = useFeatureAccess('audit_logs')

  return (
    <div>
      {hasAuditLogs ? (
        <ViewAuditLogsButton />
      ) : (
        <UpgradePrompt feature="audit_logs" variant="inline" />
      )}
    </div>
  )
}
```

### usePlanAccess

Check if user's plan meets minimum requirement.

```tsx
import { usePlanAccess } from '@/components/plan-gate'

function MyComponent() {
  const hasProPlan = usePlanAccess('professional')

  return hasProPlan ? <ProFeatures /> : <BasicFeatures />
}
```

### useHasFeature

Check if user has a custom/add-on feature (from `user.features` array).

```tsx
import { useHasFeature } from '@/components/plan-gate'

function MyComponent() {
  const hasBetaAccess = useHasFeature('beta_features')

  return hasBetaAccess && <BetaFeatureToggle />
}
```

## Common Patterns

### Navigation Menu with Plan Gating

```tsx
import { useFeatureAccess } from '@/components/plan-gate'
import { PlanIndicator } from '@/components/plan-badge'

function NavMenu() {
  const hasAnalytics = useFeatureAccess('advanced_analytics')

  return (
    <nav>
      <a href="/dashboard">Dashboard</a>
      <a
        href="/analytics"
        className={!hasAnalytics ? 'opacity-50 cursor-not-allowed' : ''}
      >
        Analytics
        {!hasAnalytics && <PlanIndicator size="sm" />}
      </a>
    </nav>
  )
}
```

### Settings Page with Feature Sections

```tsx
import { PlanGate } from '@/components/plan-gate'

function SettingsPage() {
  return (
    <div className="space-y-6">
      {/* Always visible */}
      <BasicSettingsCard />

      {/* Gated with default upgrade prompt */}
      <PlanGate feature="advanced_permissions">
        <AdvancedPermissionsCard />
      </PlanGate>

      {/* Gated with locked preview */}
      <PlanGate feature="api_access" showLock>
        <APISettingsCard />
      </PlanGate>
    </div>
  )
}
```

### Table with Plan Indicators

```tsx
import { PlanBadge } from '@/components/plan-badge'

function UsersTable({ users }) {
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
```

### Conditional Button Rendering

```tsx
import { useFeatureAccess } from '@/components/plan-gate'
import { UpgradePrompt } from '@/components/upgrade-prompt'
import { Button } from '@/components/ui/button'

function ActionBar() {
  const hasExport = useFeatureAccess('data_export')

  return (
    <div className="flex gap-2">
      <Button>Save</Button>
      {hasExport ? (
        <Button onClick={handleExport}>Export</Button>
      ) : (
        <UpgradePrompt
          feature="data_export"
          requiredPlan="starter"
          variant="inline"
        />
      )}
    </div>
  )
}
```

## Adding New Features

To add a new gated feature:

1. **Add to PLAN_FEATURES** in `plan-gate.tsx`:
```tsx
export const PLAN_FEATURES: Record<string, Plan> = {
  // ... existing features
  my_new_feature: 'professional',
}
```

2. **Add display name** in `upgrade-prompt.tsx`:
```tsx
const featureNames: Record<string, { ar: string; en: string }> = {
  // ... existing names
  my_new_feature: { ar: 'ميزتي الجديدة', en: 'My New Feature' },
}
```

3. **Optionally add benefits** in `upgrade-prompt.tsx`:
```tsx
const FEATURE_BENEFITS: Record<string, { ar: string; en: string }[]> = {
  // ... existing benefits
  my_new_feature: [
    { ar: 'فائدة 1', en: 'Benefit 1' },
    { ar: 'فائدة 2', en: 'Benefit 2' },
  ],
}
```

4. **Use in your component**:
```tsx
<PlanGate feature="my_new_feature">
  <MyNewFeature />
</PlanGate>
```

## TypeScript Support

All components are fully typed with TypeScript:

```tsx
import type { Plan } from '@/components/plan-gate'

// Type-safe plan values
const plan: Plan = 'professional' // ✅
const invalid: Plan = 'basic' // ❌ Type error

// Type-safe feature keys (IntelliSense support)
<PlanGate feature="audit_logs" /> // ✅
<PlanGate feature="invalid_feature" /> // ⚠️ Still compiles but feature won't be recognized
```

## Styling & Theming

All components use Tailwind CSS and support dark mode:
- Colors adapt to dark/light theme automatically
- RTL/LTR layout adapts to selected language
- All sizes and spacing use consistent design tokens

## Testing

Example test cases:

```tsx
import { render, screen } from '@testing-library/react'
import { PlanGate } from '@/components/plan-gate'

describe('PlanGate', () => {
  it('shows content when user has required plan', () => {
    // Mock user with professional plan
    render(
      <PlanGate feature="audit_logs">
        <div>Audit Logs</div>
      </PlanGate>
    )
    expect(screen.getByText('Audit Logs')).toBeInTheDocument()
  })

  it('shows upgrade prompt when user lacks required plan', () => {
    // Mock user with free plan
    render(
      <PlanGate feature="audit_logs">
        <div>Audit Logs</div>
      </PlanGate>
    )
    expect(screen.getByText(/upgrade/i)).toBeInTheDocument()
  })
})
```

## Examples

See `/src/components/plan-gate-examples.tsx` for comprehensive usage examples.

## Support

For questions or issues:
1. Check this documentation
2. Review examples in `plan-gate-examples.tsx`
3. Contact the development team
