# Plan Upgrade System Documentation

## Overview

This document describes the plan upgrade modal system for the Traf3li dashboard. The system allows users to view available plans, compare features, and upgrade their subscription.

## Created Files

### 1. Zustand Store (`/src/stores/upgrade-store.ts`)

State management for the upgrade modal using Zustand.

**Features:**
- Opens/closes the upgrade modal
- Tracks which feature triggered the modal
- Stores recommended plan for the feature
- Simple API for managing modal state

**Usage:**
```typescript
import { useUpgradeStore } from '@/stores/upgrade-store'

function MyComponent() {
  const { openUpgradeModal, closeUpgradeModal } = useUpgradeStore()

  // Open modal without context
  openUpgradeModal()

  // Open modal with feature name and recommended plan
  openUpgradeModal('Advanced Reports', 'professional')

  // Close modal
  closeUpgradeModal()
}
```

### 2. Pricing Table Component (`/src/features/settings/components/pricing-table.tsx`)

Reusable pricing comparison component that displays all 4 plans side-by-side.

**Features:**
- Shows 4 plans: Free, Starter, Professional, Enterprise
- Feature comparison grid with checkmarks and values
- Responsive design (stacks on mobile, grid on desktop)
- Highlights current plan and recommended plan
- Monthly/Annual pricing toggle
- RTL support for Arabic
- Bilingual (English/Arabic)

**Props:**
```typescript
interface PricingTableProps {
  currentPlan?: PlanType          // User's current plan
  recommendedPlan?: PlanType      // Highlighted recommended plan
  billingCycle: 'monthly' | 'annual'
  onSelectPlan: (plan: PlanType) => void
  onContactSales?: () => void
  className?: string
}
```

**Usage:**
```typescript
<PricingTable
  currentPlan="free"
  recommendedPlan="professional"
  billingCycle="monthly"
  onSelectPlan={(plan) => handleUpgrade(plan)}
  onContactSales={() => openContactForm()}
/>
```

### 3. Plan Upgrade Modal (`/src/features/settings/components/plan-upgrade-modal.tsx`)

Complete modal component that shows when users try to access premium features.

**Features:**
- Full-screen pricing comparison
- Monthly/Annual toggle with savings indicator
- Free trial banner for free plan users
- Trust indicators (money-back guarantee, 24/7 support, secure payment)
- Contextual messaging based on trigger feature
- Recommended plan highlighting
- Responsive design
- RTL support
- Bilingual

**Props:**
```typescript
interface PlanUpgradeModalProps {
  onUpgrade?: (plan: PlanType) => void
  onContactSales?: () => void
  onStartFreeTrial?: (plan: PlanType) => void
}
```

**Usage:**
```typescript
<PlanUpgradeModal
  onUpgrade={(plan) => {
    // Handle payment and plan upgrade
    navigateToCheckout(plan)
  }}
  onContactSales={() => {
    // Open contact form or redirect to sales
    window.open('/contact-sales', '_blank')
  }}
  onStartFreeTrial={(plan) => {
    // Start free trial
    startTrial(plan)
  }}
/>
```

### 4. Example Component (`/src/features/settings/components/plan-upgrade-example.tsx`)

Example implementation showing how to use the system.

**Includes:**
- General upgrade modal trigger
- Feature-specific upgrade trigger
- Premium feature protection example
- Callback implementations

## Plan Types

The system supports 4 plan types:

1. **Free** - 0 SAR/month
   - 5 cases, 10 clients
   - 1 GB storage
   - 1 user
   - Basic features

2. **Starter** - 299 SAR/month (2,990 SAR/year)
   - 50 cases, 100 clients
   - 10 GB storage
   - 3 users
   - Invoicing, time tracking, basic reports

3. **Professional** - 699 SAR/month (6,990 SAR/year)
   - Unlimited cases and clients
   - 100 GB storage
   - 10 users
   - Advanced reports, automation, API access

4. **Enterprise** - Custom pricing
   - Unlimited everything
   - White label
   - Dedicated account manager

## Translation Keys

All translation keys have been added to both `en` and `ar` translation files under the `pricing` namespace:

```json
{
  "pricing": {
    "upgradeYourPlan": "...",
    "plans": {
      "free": { "name": "...", "description": "..." },
      "starter": { "name": "...", "description": "..." },
      "professional": { "name": "...", "description": "..." },
      "enterprise": { "name": "...", "description": "..." }
    },
    "features": {
      "cases": "...",
      "clients": "...",
      // ... etc
    }
  }
}
```

## Implementation Guide

### Step 1: Add Modal to App Root

Place the `PlanUpgradeModal` component at the root of your application so it's always available:

```typescript
// In App.tsx or your main layout
import { PlanUpgradeModal } from '@/features/settings/components/plan-upgrade-modal'

function App() {
  return (
    <div>
      {/* Your app content */}

      {/* Add this at the root level */}
      <PlanUpgradeModal
        onUpgrade={handleUpgrade}
        onContactSales={handleContactSales}
        onStartFreeTrial={handleStartFreeTrial}
      />
    </div>
  )
}
```

### Step 2: Protect Premium Features

Add upgrade triggers to features that require higher plans:

```typescript
import { useUpgradeStore } from '@/stores/upgrade-store'
import { useAuthStore } from '@/stores/auth-store'

function PremiumFeature() {
  const { openUpgradeModal } = useUpgradeStore()
  const user = useAuthStore((state) => state.user)

  const handlePremiumAction = () => {
    // Check user's plan
    if (user?.plan === 'free' || user?.plan === 'starter') {
      // Show upgrade modal
      openUpgradeModal('Advanced Analytics', 'professional')
      return
    }

    // User has access, proceed
    doAdvancedAnalytics()
  }

  return (
    <button onClick={handlePremiumAction}>
      View Advanced Analytics
    </button>
  )
}
```

### Step 3: Implement Upgrade Handlers

```typescript
const handleUpgrade = async (plan: PlanType) => {
  try {
    // 1. Navigate to checkout page
    router.push(`/checkout?plan=${plan}`)

    // OR

    // 2. Open payment modal
    openPaymentModal(plan)

    // 3. After successful payment, update user plan
    await updateUserPlan(plan)

    // 4. Show success message
    toast.success('Plan upgraded successfully!')

    // 5. Refresh user data
    await refreshUser()
  } catch (error) {
    toast.error('Failed to upgrade plan')
  }
}

const handleContactSales = () => {
  // Open contact form, send to sales page, or open chat
  window.open('/contact-sales', '_blank')
  // OR
  openContactForm()
  // OR
  openIntercom()
}

const handleStartFreeTrial = async (plan: PlanType) => {
  try {
    // Start trial without payment
    await startTrial(plan)
    toast.success('Trial started! Enjoy 14 days free.')
  } catch (error) {
    toast.error('Failed to start trial')
  }
}
```

## Customization

### Adjusting Prices

Edit the prices in `pricing-table.tsx`:

```typescript
const plans: PlanDetails[] = [
  {
    id: 'starter',
    monthlyPrice: 299,  // Change here
    annualPrice: 2990,  // Change here
    // ...
  },
  // ...
]
```

### Adding/Removing Features

Edit the `features` array in `pricing-table.tsx`:

```typescript
const features: PlanFeature[] = [
  {
    id: 'newFeature',
    labelKey: 'pricing.features.newFeature',
    free: false,
    starter: true,
    professional: true,
    enterprise: true,
  },
  // ...
]
```

Then add the translation keys:

```json
{
  "pricing": {
    "features": {
      "newFeature": "New Feature Name"
    }
  }
}
```

### Changing Plan Colors/Badges

Edit the badge logic in both components:

```typescript
// To change which plan shows "Popular"
{
  id: 'professional',
  popular: true,  // Move this to different plan
  // ...
}
```

## RTL Support

All components fully support RTL (Arabic):

- Text direction automatically switches
- Layout mirrors properly (flex-row-reverse)
- Numbers format correctly for Arabic locale
- Switch component thumb animates in correct direction

## Responsive Design

- **Mobile (<768px)**: Cards stack vertically
- **Tablet (768px-1024px)**: 2-column grid
- **Desktop (>1024px)**: Full comparison table

## Accessibility

- ARIA labels on all interactive elements
- Keyboard navigation support
- Screen reader friendly
- Proper focus management
- Semantic HTML

## Testing Checklist

- [ ] Modal opens when calling `openUpgradeModal()`
- [ ] Modal closes when clicking X or backdrop
- [ ] Monthly/Annual toggle works
- [ ] All 4 plans display correctly
- [ ] Feature comparison shows correct values
- [ ] Current plan is highlighted
- [ ] Recommended plan has badge
- [ ] CTA buttons work correctly
- [ ] "Contact Sales" for Enterprise works
- [ ] Free trial banner shows for free users
- [ ] Translation works for Arabic
- [ ] RTL layout works correctly
- [ ] Mobile responsive design works
- [ ] Desktop comparison table works

## Future Enhancements

Potential improvements:

1. Add checkout flow integration
2. Add payment provider (Stripe/Paddle/Moyasar)
3. Add promo code support
4. Add plan comparison tool
5. Add usage metrics display
6. Add billing history
7. Add invoice download
8. Add seat management for team plans
9. Add add-ons (extra storage, users, etc.)
10. Add downgrade confirmation with data warnings

## Support

For questions or issues with the plan upgrade system, refer to this documentation or check the example component for usage patterns.
