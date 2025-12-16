# Quick Start: Plan-Based Feature Gating

## 🚀 5-Minute Setup

### 1. Import the Components

```tsx
import { PlanGate } from '@/components/plan-gate'
import { UpgradePrompt } from '@/components/upgrade-prompt'
import { PlanBadge } from '@/components/plan-badge'
```

### 2. Basic Feature Gating

```tsx
// Hide entire feature if user doesn't have access
<PlanGate feature="audit_logs">
  <AuditLogDashboard />
</PlanGate>
```

That's it! The component will:
- ✅ Check user's plan automatically
- ✅ Show upgrade prompt if access denied
- ✅ Support both Arabic and English
- ✅ Handle dark mode

### 3. Common Use Cases

**Navigation Menu**
```tsx
<PlanGate feature="advanced_analytics" fallback={null}>
  <a href="/analytics">Advanced Analytics</a>
</PlanGate>
```

**Settings Section**
```tsx
<PlanGate feature="api_access" showLock>
  <ApiSettingsPanel />
</PlanGate>
```

**Button with Upgrade Prompt**
```tsx
import { useFeatureAccess } from '@/components/plan-gate'

function MyComponent() {
  const hasExport = useFeatureAccess('data_export')

  return hasExport ? (
    <Button onClick={handleExport}>Export</Button>
  ) : (
    <UpgradePrompt feature="data_export" variant="inline" />
  )
}
```

**User Profile with Plan Badge**
```tsx
<div className="flex items-center gap-2">
  <Avatar />
  <div>
    <p>{user.name}</p>
    <PlanBadge showTrial />
  </div>
</div>
```

## 📋 Available Features

Copy-paste these feature names:

```tsx
// Analytics & Reporting
"audit_logs"           // Professional
"advanced_analytics"   // Professional
"custom_reports"       // Professional
"data_export"          // Starter

// Automation
"workflow_automation"  // Professional
"api_access"           // Professional
"webhooks"             // Enterprise

// Security
"sso"                  // Enterprise
"two_factor_auth"      // Professional
"advanced_permissions" // Professional

// HR
"performance_reviews"        // Professional
"succession_planning"        // Professional
"compensation_management"    // Professional

// Finance
"advanced_billing"           // Professional
"multi_currency"             // Professional
"recurring_billing"          // Professional
```

## 🎨 Variants Cheat Sheet

**PlanGate**
```tsx
// Default: Shows UpgradePrompt card
<PlanGate feature="audit_logs">
  <Content />
</PlanGate>

// Locked preview: Shows blurred content
<PlanGate feature="audit_logs" showLock>
  <Content />
</PlanGate>

// Custom fallback
<PlanGate feature="audit_logs" fallback={<CustomMessage />}>
  <Content />
</PlanGate>

// Hidden: No fallback
<PlanGate feature="audit_logs" fallback={null}>
  <Content />
</PlanGate>
```

**UpgradePrompt**
```tsx
// Card (default) - Standalone
<UpgradePrompt feature="api_access" />

// Banner - Top of page
<UpgradePrompt feature="api_access" variant="banner" />

// Inline - In button/menu
<UpgradePrompt feature="api_access" variant="inline" />

// Modal - Popup
<UpgradePrompt
  feature="api_access"
  variant="modal"
  open={isOpen}
  onClose={() => setIsOpen(false)}
/>
```

**PlanBadge**
```tsx
// Basic
<PlanBadge />

// With trial countdown
<PlanBadge showTrial />

// Sizes
<PlanBadge size="sm" />  // Small
<PlanBadge size="md" />  // Medium (default)
<PlanBadge size="lg" />  // Large

// Clickable (goes to billing)
<PlanBadge clickable />

// Icon only (compact)
<PlanIndicator size="md" />
```

## 🔧 Hooks

```tsx
import { useFeatureAccess, usePlanAccess } from '@/components/plan-gate'

// Check specific feature
const hasAuditLogs = useFeatureAccess('audit_logs')

// Check plan tier
const hasProPlan = usePlanAccess('professional')

// Use in rendering
if (hasAuditLogs) {
  // Render feature
}
```

## 💡 Pro Tips

1. **Use `fallback={null}`** to completely hide features without showing upgrade prompt
2. **Use `showLock`** to tease premium features with a preview
3. **Use `variant="inline"`** for compact spaces like menus and toolbars
4. **Use hooks** for conditional logic outside JSX
5. **Always specify `feature`** instead of `plan` when possible - it's more maintainable

## 🐛 Common Issues

**Issue:** Component not showing content even with correct plan
```tsx
// ❌ Wrong: Using plan instead of feature
<PlanGate plan="professional">

// ✅ Right: Using feature key
<PlanGate feature="audit_logs">
```

**Issue:** Upgrade prompt not showing in Arabic
```tsx
// The components automatically detect language from i18n
// Make sure i18n is properly initialized in your app
```

**Issue:** TypeScript errors on Plan type
```tsx
// ✅ Import the type
import type { Plan } from '@/components/plan-gate'

const myPlan: Plan = 'professional'
```

## 📚 Learn More

- Full documentation: `/src/components/PLAN_GATING_README.md`
- Live examples: `/src/components/plan-gate-examples.tsx`
- Source code: `/src/components/plan-gate.tsx`

## 🎯 Next Steps

1. ✅ Import components
2. ✅ Use `<PlanGate>` to protect features
3. ✅ Add `<PlanBadge>` to user profile
4. ✅ Test with different plans (change user.plan in dev tools)
5. ✅ Ship to production!
