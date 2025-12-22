# Setup Orchestration System

## Overview

The Setup Orchestration System is a comprehensive solution for guiding users through the initial setup of all modules in the traf3li-dashboard application. It provides a unified experience for completing HR, CRM, Finance, and other module setups.

## Features

- **Master Orchestrator**: Single interface to coordinate all module setups
- **Progress Tracking**: Visual progress indicators showing completion status
- **Resume Capability**: Users can start, pause, and resume setup at any time
- **Skip Functionality**: Option to skip non-critical modules
- **Celebration Screen**: Engaging completion screen after finishing all setups
- **Setup Reminder**: Banner notification for incomplete critical setups
- **Database Storage**: Progress stored in database, not localStorage
- **Arabic Support**: Full bilingual support (Arabic/English)

## Architecture

### Components

#### 1. SetupOrchestrator (`/src/features/onboarding/components/setup-orchestrator.tsx`)
The master wizard component that:
- Embeds individual module wizards
- Manages navigation between modules
- Tracks overall progress
- Shows celebration screen on completion

```tsx
import SetupOrchestrator from '@/features/onboarding/components/setup-orchestrator'

<SetupOrchestrator initialModule="hr" />
```

#### 2. SetupProgressSidebar (`/src/features/onboarding/components/setup-progress-sidebar.tsx`)
Vertical progress bar showing:
- All available modules
- Completion status (complete, in-progress, skipped)
- Current active module
- Click-to-navigate functionality

#### 3. SetupCelebration (`/src/features/onboarding/components/setup-celebration.tsx`)
Celebration screen with:
- Confetti animation
- Completed modules summary
- Next steps guide
- Call-to-action to dashboard

#### 4. SetupReminderBanner (`/src/features/onboarding/components/setup-reminder-banner.tsx`)
Top banner that:
- Shows when critical setups are incomplete
- Displays progress percentage
- Provides quick access to orchestrator
- Can be dismissed

### Services

#### setupOrchestrationService (`/src/services/setupOrchestrationService.ts`)
Handles all API calls for:
- Getting overall setup status
- Marking modules as complete/skipped
- Saving module progress
- Getting next incomplete module

```typescript
import setupOrchestrationService from '@/services/setupOrchestrationService'

// Get overall status
const status = await setupOrchestrationService.getSetupStatus()

// Mark module complete
await setupOrchestrationService.markModuleComplete('hr')

// Save progress
await setupOrchestrationService.saveModuleProgress({
  module: 'hr',
  currentStep: 3,
  totalSteps: 7,
  data: { /* wizard data */ }
})
```

### Hooks

#### useSetupOrchestration (`/src/hooks/useSetupOrchestration.ts`)
React Query hooks for:
- `useSetupOrchestrationStatus()` - Get overall setup status
- `useModuleProgress(module)` - Get progress for specific module
- `useNextIncompleteModule()` - Get next module to complete
- `useMarkModuleComplete()` - Mark module as complete
- `useMarkModuleSkipped()` - Skip a module
- `useHasSetupPending()` - Check if any setups are pending
- `useNavigateToModuleSetup()` - Navigate to module wizards

```tsx
import { useSetupOrchestrationStatus, useMarkModuleComplete } from '@/hooks/useSetupOrchestration'

function MyComponent() {
  const { data: status } = useSetupOrchestrationStatus()
  const markComplete = useMarkModuleComplete()

  const handleComplete = async () => {
    await markComplete.mutateAsync('hr')
  }

  return (
    <div>
      Progress: {status?.overallProgress}%
    </div>
  )
}
```

## Module Configuration

Modules are configured in `MODULE_CONFIGS` in `/src/services/setupOrchestrationService.ts`:

```typescript
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
    isCritical: true,  // Must be completed
    order: 1,          // Display order
  },
  // ... more modules
}
```

### Adding a New Module

1. Add module configuration to `MODULE_CONFIGS`
2. Create the wizard component
3. Add route for the wizard
4. Import and render in `SetupOrchestrator`

```typescript
// 1. Add to MODULE_CONFIGS
export const MODULE_CONFIGS = {
  // ... existing modules
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
}

// 2. Create wizard component
// /src/features/inventory/components/inventory-setup-wizard.tsx

// 3. Add route
// /src/routes/_authenticated/dashboard.inventory.setup-wizard.tsx

// 4. Import and render in SetupOrchestrator
import InventorySetupWizard from '@/features/inventory/components/inventory-setup-wizard'

// In renderModuleWizard() method:
case 'inventory':
  return (
    <div className="flex-1 overflow-y-auto">
      <InventorySetupWizard />
    </div>
  )
```

## Integration with Authenticated Layout

The `SetupReminderBanner` is automatically shown in the authenticated layout when:
- User has completed initial onboarding
- Critical module setups are incomplete
- User is not on a setup page

```tsx
// /src/components/layout/authenticated-layout.tsx
{onboardingStatus?.completed && <SetupReminderBanner />}
```

## API Endpoints

The following API endpoints need to be implemented on the backend:

### GET `/setup-orchestration/status`
Returns overall setup status

**Response:**
```json
{
  "overallProgress": 45.5,
  "completedModules": 1,
  "totalModules": 3,
  "hasAnySetupPending": true,
  "hasCriticalSetupPending": true,
  "modules": [
    {
      "module": "hr",
      "isComplete": true,
      "isSkipped": false,
      "startedAt": "2025-01-01T10:00:00Z",
      "completedAt": "2025-01-01T11:00:00Z",
      "currentStep": 7,
      "totalSteps": 7,
      "isCritical": true,
      "order": 1
    },
    {
      "module": "crm",
      "isComplete": false,
      "isSkipped": false,
      "startedAt": "2025-01-01T11:30:00Z",
      "currentStep": 5,
      "totalSteps": 13,
      "isCritical": true,
      "order": 2
    }
  ],
  "lastUpdatedAt": "2025-01-01T11:30:00Z"
}
```

### POST `/setup-orchestration/modules/:module/complete`
Mark a module as complete

**Request:**
```
POST /setup-orchestration/modules/hr/complete
```

### POST `/setup-orchestration/modules/:module/skip`
Skip a module

**Request:**
```
POST /setup-orchestration/modules/crm/skip
```

### POST `/setup-orchestration/modules/:module/progress`
Save module progress

**Request Body:**
```json
{
  "module": "finance",
  "currentStep": 3,
  "totalSteps": 10,
  "data": {
    // Wizard-specific data
    "companyName": "ACME Corp",
    "fiscalYearStart": "2025-01-01"
  }
}
```

### GET `/setup-orchestration/modules/:module/progress`
Get module progress

**Response:**
```json
{
  "module": "finance",
  "currentStep": 3,
  "totalSteps": 10,
  "data": {
    "companyName": "ACME Corp",
    "fiscalYearStart": "2025-01-01"
  }
}
```

## Usage Examples

### Starting Setup from Dashboard

```tsx
import { useNavigateToModuleSetup } from '@/hooks/useSetupOrchestration'

function Dashboard() {
  const { goToOrchestrator } = useNavigateToModuleSetup()

  return (
    <button onClick={goToOrchestrator}>
      Complete Setup
    </button>
  )
}
```

### Checking Setup Status

```tsx
import { useHasSetupPending } from '@/hooks/useSetupOrchestration'

function Header() {
  const { hasCriticalPending } = useHasSetupPending()

  return (
    <div>
      {hasCriticalPending && (
        <span>⚠️ Setup incomplete</span>
      )}
    </div>
  )
}
```

### Navigating to Specific Module

```tsx
import { useNavigateToModuleSetup } from '@/hooks/useSetupOrchestration'

function QuickLinks() {
  const { goToModule } = useNavigateToModuleSetup()

  return (
    <div>
      <button onClick={() => goToModule('hr')}>
        Setup HR
      </button>
      <button onClick={() => goToModule('finance')}>
        Setup Finance
      </button>
    </div>
  )
}
```

## Localization

All components support both Arabic and English:

```tsx
// Arabic (primary)
<h2>تقدم الإعداد</h2>

// English (secondary)
<span>Setup Progress</span>
```

Module names and descriptions are bilingual in `MODULE_CONFIGS`.

## Best Practices

1. **Always save progress**: Call `saveModuleProgress()` after each step
2. **Mark complete only when done**: Only mark modules complete when wizard finishes
3. **Validate before completing**: Ensure all required fields are filled
4. **Provide skip option**: Allow users to skip non-critical modules
5. **Show clear progress**: Update progress indicators after each step
6. **Handle errors gracefully**: Show user-friendly error messages
7. **Support resume**: Load saved progress on wizard mount

## Testing

### Testing Setup Status
```tsx
import { renderHook, waitFor } from '@testing-library/react'
import { useSetupOrchestrationStatus } from '@/hooks/useSetupOrchestration'

test('fetches setup status', async () => {
  const { result } = renderHook(() => useSetupOrchestrationStatus())

  await waitFor(() => {
    expect(result.current.data).toBeDefined()
    expect(result.current.data?.overallProgress).toBeGreaterThanOrEqual(0)
  })
})
```

### Testing Module Completion
```tsx
import { renderHook, act } from '@testing-library/react'
import { useMarkModuleComplete } from '@/hooks/useSetupOrchestration'

test('marks module as complete', async () => {
  const { result } = renderHook(() => useMarkModuleComplete())

  await act(async () => {
    await result.current.mutateAsync('hr')
  })

  expect(result.current.isSuccess).toBe(true)
})
```

## Troubleshooting

### Setup Status Not Loading
- Check API endpoint is responding
- Verify authentication headers
- Check browser console for errors

### Progress Not Saving
- Ensure `saveModuleProgress()` is called
- Check network tab for failed requests
- Verify request payload is correct

### Banner Not Showing
- Confirm `onboardingStatus.completed` is true
- Check `hasCriticalSetupPending` is true
- Verify user is not on setup page

### Module Not Appearing in Orchestrator
- Check module is in `MODULE_CONFIGS`
- Ensure wizard component is imported
- Verify route is created
- Check switch case in `renderModuleWizard()`

## Future Enhancements

1. **Conditional Modules**: Show/hide modules based on subscription plan
2. **Module Dependencies**: Require certain modules before others
3. **Progress Sync**: Real-time progress updates across tabs
4. **Setup Analytics**: Track where users drop off
5. **Guided Tours**: In-wizard hints and tooltips
6. **Video Tutorials**: Embed help videos in wizards
7. **Import Data**: Bulk import from other systems
8. **Setup Templates**: Pre-configured setups for common scenarios

## Support

For questions or issues with the setup orchestration system:
1. Check this documentation
2. Review module-specific wizard documentation
3. Check the troubleshooting section
4. Contact the development team

---

Last updated: December 2025
