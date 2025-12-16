# Quick Start: usePlanFeatures Hook

## 🚀 Installation

The hook is ready to use! Just import it:

```tsx
import { usePlanFeatures } from '@/hooks/usePlanFeatures'
```

## 📝 Common Use Cases

### 1. Feature Gating (Most Common)

```tsx
function ApiSettings() {
  const { canAccess, showUpgrade } = usePlanFeatures()

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

  return <div>{/* Your API settings content */}</div>
}
```

### 2. Check Plan Level

```tsx
function DashboardHeader() {
  const { plan, isEnterprise } = usePlanFeatures()

  return (
    <div>
      <h1>Dashboard</h1>
      <span>Current Plan: {plan}</span>
      {isEnterprise && <span>🌟 Enterprise</span>}
    </div>
  )
}
```

### 3. Monitor Usage Limits

```tsx
function CreateCaseButton() {
  const { isOverLimit, isNearLimit, limits, usage } = usePlanFeatures()

  if (isOverLimit('cases')) {
    return <button disabled>Limit Reached</button>
  }

  if (isNearLimit('cases')) {
    return (
      <button>
        Add Case ({usage.cases}/{limits.maxCases})
      </button>
    )
  }

  return <button>Add Case</button>
}
```

### 4. Conditional Menu Items

```tsx
function SettingsMenu() {
  const { canAccess } = usePlanFeatures()

  return (
    <nav>
      <MenuItem to="/settings/general">General</MenuItem>
      {canAccess('team_collaboration') && (
        <MenuItem to="/settings/team">Team</MenuItem>
      )}
      {canAccess('api_access') && (
        <MenuItem to="/settings/api">API</MenuItem>
      )}
      {canAccess('audit_logs') && (
        <MenuItem to="/settings/audit">Audit Logs</MenuItem>
      )}
    </nav>
  )
}
```

## 🎯 Key Functions

| Function | Purpose | Example |
|----------|---------|---------|
| `canAccess(feature)` | Check if feature is available | `canAccess('api_access')` |
| `isAtLeast(plan)` | Check minimum plan level | `isAtLeast('professional')` |
| `isOverLimit(resource)` | Check if limit exceeded | `isOverLimit('cases')` |
| `isNearLimit(resource)` | Check if near limit (>80%) | `isNearLimit('storage')` |
| `showUpgrade(feature?)` | Trigger upgrade modal | `showUpgrade('audit_logs')` |

## 📊 Available Features

### Free Plan
- `basic_cases`, `basic_clients`, `basic_invoices`
- `email_notifications`, `data_export`

### Starter Plan (+ Free)
- `reports`, `calendar_sync`, `sms_notifications`
- `document_templates`, `team_collaboration`, `backup_restore`

### Professional Plan (+ Starter)
- `advanced_reports`, `api_access`, `custom_fields`
- `bulk_operations`, `client_portal`, `payment_processing`
- `multi_currency`, `webhooks`

### Enterprise Plan (+ Professional)
- `audit_logs`, `sso`, `custom_branding`
- `dedicated_support`, `sla_guarantee`, `advanced_permissions`

## 🔧 Resources to Check

| Resource | Description |
|----------|-------------|
| `users` | Number of team members |
| `cases` | Number of cases |
| `clients` | Number of clients |
| `storage` | Storage usage in MB |
| `documents` | Number of documents |
| `invoices` | Number of invoices |

## 📦 Plan Types

- `free` - 2 users, 10 cases, 100 MB
- `starter` - 5 users, 50 cases, 1 GB
- `professional` - 20 users, 500 cases, 10 GB
- `enterprise` - Unlimited everything

## 💡 Pro Tips

1. Use `canAccess()` for feature-level checks
2. Use `isAtLeast()` for plan-level checks
3. Always show upgrade prompts with clear benefits
4. Monitor limits proactively (warn at 80%)
5. Use TypeScript for auto-complete on feature IDs

## 🎨 Optional: Global Context

For apps needing plan features everywhere:

```tsx
// In App.tsx
import { PlanProvider } from '@/hooks/usePlanFeatures'

function App() {
  return (
    <PlanProvider>
      <YourApp />
    </PlanProvider>
  )
}

// In any component
import { usePlanContext } from '@/hooks/usePlanFeatures'

function MyComponent() {
  const { canAccess } = usePlanContext()
  // ...
}
```

## 📚 More Examples

See `/src/hooks/usePlanFeatures.example.tsx` for 8 detailed examples including:
- Feature gates with upgrade prompts
- Usage monitoring widgets
- Progressive feature disclosure
- Plan comparison UI
- Settings menu with feature flags

## 🐛 Common Issues

**Q: Usage stats showing mock data?**
A: Replace the mock `usage` object in `usePlanFeatures.tsx` with an API call.

**Q: Upgrade modal not showing?**
A: Implement the modal component and update `showUpgradePrompt()` function.

**Q: TypeScript errors on feature IDs?**
A: Make sure to import `FeatureId` type and use it for type safety.

## 🔗 Related Files

- `/src/config/plans.ts` - Plan configuration
- `/src/stores/auth-store.ts` - Auth state with plan info
- `/src/hooks/usePlanFeatures.tsx` - Main hook implementation
- `/src/hooks/usePlanFeatures.example.tsx` - Full examples
- `/src/hooks/usePlanFeatures.README.md` - Complete documentation
