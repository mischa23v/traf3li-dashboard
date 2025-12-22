# Setup Orchestration - Installation Instructions

## Quick Start

### 1. Install Required Dependencies

```bash
npm install react-confetti
```

Or if using yarn:
```bash
yarn add react-confetti
```

Or if using pnpm:
```bash
pnpm add react-confetti
```

### 2. Backend API Implementation Required

The following API endpoints need to be implemented in your backend:

#### Setup Status Endpoint
```
GET /api/setup-orchestration/status

Response:
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
      "currentStep": 7,
      "totalSteps": 7,
      "isCritical": true,
      "order": 1
    }
  ]
}
```

#### Mark Module Complete
```
POST /api/setup-orchestration/modules/:module/complete
```

#### Mark Module Skipped
```
POST /api/setup-orchestration/modules/:module/skip
```

#### Save Module Progress
```
POST /api/setup-orchestration/modules/:module/progress

Body:
{
  "currentStep": 3,
  "totalSteps": 10,
  "data": { /* wizard data */ }
}
```

#### Get Module Progress
```
GET /api/setup-orchestration/modules/:module/progress

Response:
{
  "module": "finance",
  "currentStep": 3,
  "totalSteps": 10,
  "data": { /* wizard data */ }
}
```

### 3. Database Schema (Example)

You'll need tables to store setup orchestration data:

```sql
-- Setup orchestration status
CREATE TABLE setup_orchestration_status (
  id SERIAL PRIMARY KEY,
  organization_id INTEGER NOT NULL,
  overall_progress DECIMAL(5,2) DEFAULT 0,
  last_updated_at TIMESTAMP DEFAULT NOW(),
  UNIQUE(organization_id)
);

-- Module setup status
CREATE TABLE module_setup_status (
  id SERIAL PRIMARY KEY,
  organization_id INTEGER NOT NULL,
  module VARCHAR(50) NOT NULL,
  is_complete BOOLEAN DEFAULT false,
  is_skipped BOOLEAN DEFAULT false,
  started_at TIMESTAMP,
  completed_at TIMESTAMP,
  current_step INTEGER,
  total_steps INTEGER,
  is_critical BOOLEAN DEFAULT true,
  "order" INTEGER,
  UNIQUE(organization_id, module)
);

-- Module progress data
CREATE TABLE module_progress_data (
  id SERIAL PRIMARY KEY,
  organization_id INTEGER NOT NULL,
  module VARCHAR(50) NOT NULL,
  progress_data JSONB,
  updated_at TIMESTAMP DEFAULT NOW(),
  UNIQUE(organization_id, module)
);
```

### 4. Test the Implementation

After installing dependencies and implementing backend:

1. Navigate to `/dashboard/setup-orchestrator`
2. Complete a module setup
3. Verify progress is saved
4. Test skip functionality
5. Check celebration screen appears when all done

### 5. Verify Setup Reminder Banner

1. Complete initial onboarding wizard
2. Leave some critical module setups incomplete
3. Navigate to dashboard
4. Banner should appear at top

## File Locations

All created files:

- Services: `/src/services/setupOrchestrationService.ts`
- Hooks: `/src/hooks/useSetupOrchestration.ts`
- Components: `/src/features/onboarding/components/setup-*.tsx`
- Route: `/src/routes/_authenticated/dashboard.setup-orchestrator.tsx`
- Documentation: `/docs/setup-orchestration-guide.md`

## Troubleshooting

### Confetti not showing
- Ensure `react-confetti` is installed
- Check console for errors
- Verify import in celebration component

### API calls failing
- Check backend endpoints are implemented
- Verify API base URL in `apiClient`
- Check authentication headers
- Review network tab in DevTools

### Progress not saving
- Verify backend save endpoint works
- Check request payload format
- Review database permissions
- Check for errors in server logs

### Banner not appearing
- Ensure onboarding wizard is completed
- Verify critical modules are incomplete
- Check `useSetupOrchestrationStatus` hook
- Review console for errors

## Support

For detailed documentation, see:
- `/docs/setup-orchestration-guide.md` - Comprehensive guide
- `SETUP_ORCHESTRATION_SUMMARY.md` - Implementation summary

---

**Next Steps:**
1. ✅ Install `react-confetti`
2. ⏳ Implement backend API endpoints
3. ⏳ Create database tables
4. ⏳ Test complete flow
5. ⏳ Deploy to production
