# Lead Management Dashboard

A comprehensive Lead Management component with conversion flow for managing potential clients and converting them to actual clients.

## Features

### 1. Pipeline/Kanban View
- **Visual Pipeline**: Drag-and-drop cards between stages
- **7 Stages**: new, contacted, qualified, proposal, negotiation, won, lost
- **Stage Statistics**: Shows count and total value per stage
- **Stage Colors**: Color-coded stages for quick visual identification

### 2. List View
- **Filterable List**: View leads as a list with stage filters
- **Search**: Search by name, email, phone, or company
- **Quick Actions**: Update stage, convert, or delete from dropdown

### 3. Lead Cards
Display key information:
- Name and company
- Phone and email
- Estimated value (formatted in SAR)
- Expected close date (relative time)
- Source badge
- Drag handle for pipeline view

### 4. Stats Bar
Real-time statistics:
- Total leads count
- Conversion rate percentage
- Total estimated value
- Average lead value

### 5. Lead Form
Comprehensive form with:
- **Basic Info**: First name*, last name*, email, phone*, company
- **Source**: Track where the lead came from (website, referral, social media, etc.)
- **Financial**: Estimated value, expected close date
- **Case Details**: Case type (labor, commercial, civil, criminal, family, administrative)
- **Description & Notes**: Free-form text areas
- **Assignment**: Assign to staff member

### 6. Convert to Client Dialog
- Shows lead information for confirmation
- Option to create a case automatically
- Case type selection (with suggestion from lead data)
- Creates client record from lead data

### 7. Activities Tab (Quick Add)
Track interactions with:
- **Activity Types**: call, email, meeting, note, task
- **Date**: When the activity occurred
- **Description**: Details of the interaction
- **Outcome**: Result of the activity

## Usage

### Basic Integration

```tsx
import { LeadsDashboard } from '@/features/sales'

function SalesPage() {
  return <LeadsDashboard />
}
```

### In a Route

```tsx
// src/routes/_authenticated/dashboard.sales.leads.tsx
import { createFileRoute } from '@tanstack/react-router'
import { LeadsDashboard } from '@/features/sales'

export const Route = createFileRoute('/_authenticated/dashboard/sales/leads')({
  component: LeadsDashboard,
})
```

## API Hooks Used

The component uses the following hooks from `@/hooks/useAccounting`:
- `useLeads(filters)` - Fetch leads with optional filters
- `useLead(id)` - Fetch single lead details
- `useLeadStats()` - Get lead statistics
- `useCreateLead()` - Create new lead
- `useUpdateLead()` - Update lead information
- `useDeleteLead()` - Delete a lead
- `useConvertLead()` - Convert lead to client (with optional case creation)
- `useUpdateLeadStage()` - Move lead to different stage
- `useAddLeadActivity()` - Add activity to lead timeline

Also uses:
- `useStaff()` from `@/hooks/useStaff` - Get staff members for assignment

## Data Types

### Lead
```typescript
interface Lead {
  _id: string
  firstName: string
  lastName: string
  email?: string
  phone?: string
  company?: string
  source: LeadSource
  stage: LeadStage
  estimatedValue?: number
  probability?: number
  expectedCloseDate?: string
  caseType?: string
  description?: string
  notes?: string
  assignedTo?: string | { _id: string; firstName: string; lastName: string }
  activities: LeadActivity[]
  convertedToClientId?: string
  convertedToCaseId?: string
  convertedAt?: string
  lostReason?: string
  createdAt: string
  updatedAt: string
}
```

### LeadStage
```typescript
type LeadStage =
  | 'new'          // جديد
  | 'contacted'    // تم التواصل
  | 'qualified'    // مؤهل
  | 'proposal'     // عرض مقدم
  | 'negotiation'  // مفاوضة
  | 'won'          // مكتسب
  | 'lost'         // مفقود
```

### LeadSource
```typescript
type LeadSource =
  | 'website'        // الموقع الإلكتروني
  | 'referral'       // إحالة
  | 'social_media'   // وسائل التواصل
  | 'advertisement'  // إعلان
  | 'cold_call'      // اتصال مباشر
  | 'walk_in'        // زيارة شخصية
  | 'other'          // أخرى
```

### LeadActivity
```typescript
interface LeadActivity {
  _id: string
  type: 'call' | 'email' | 'meeting' | 'note' | 'task'
  description: string
  date: string
  outcome?: string
  createdBy: string
}
```

## Arabic Labels

All UI text is in Arabic:
- العملاء المحتملين (Leads)
- جديد (new), تم التواصل (contacted), مؤهل (qualified)
- عرض مقدم (proposal), مفاوضة (negotiation), مكتسب (won), مفقود (lost)
- تحويل إلى عميل (Convert to Client)
- مسار التحويل (Pipeline), قائمة (List)

## Styling

The component uses:
- Tailwind CSS for styling
- Emerald color scheme for primary actions
- Navy for text headings
- Slate for secondary elements
- Rounded-xl corners for modern look
- Smooth transitions and hover effects

## Features in Detail

### Drag and Drop
- Works in pipeline view only
- Visual feedback when dragging (opacity change)
- Drop zones highlight on drag over
- Automatically updates lead stage on drop
- Optimistic UI updates

### Search and Filter
- Real-time search across multiple fields
- Stage-based filtering in list view
- View mode toggle (pipeline/list)
- Results update immediately

### Conversion Flow
1. Click "Convert" on qualified+ leads
2. Dialog shows lead information
3. Option to create case with selected type
4. Confirms and creates client + optional case
5. Lead marked as converted with references

### Activities Timeline
- Chronological activity log
- Different icons per activity type
- Relative timestamps
- Quick add dialog for new activities

## Performance

- Optimistic updates for better UX
- Efficient re-renders with useMemo
- Query caching via TanStack Query
- Lazy loading of lead details

## Accessibility

- Keyboard navigation support
- ARIA labels on interactive elements
- Focus management in dialogs
- Screen reader friendly

## Future Enhancements

Potential additions:
- Bulk actions (assign, delete, update stage)
- Advanced filters (date range, value range, assigned to)
- Lead scoring/qualification metrics
- Email/SMS integration from activity dialog
- Export leads to CSV/Excel
- Lead import functionality
- Custom fields support
- Lead temperature (hot/warm/cold)
- Automated follow-up reminders
- Lead source analytics
