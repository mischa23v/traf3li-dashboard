# Lost Opportunity Report - Usage Guide

## Component Location
`/home/user/traf3li-dashboard/src/features/crm/components/reports/lost-opportunity-report.tsx`

## Import

```tsx
import { LostOpportunityReport } from '@/features/crm/components/reports'
```

## Example Integration in a Route

```tsx
// src/routes/_authenticated/dashboard.crm.reports.lost-opportunities.tsx
import { createFileRoute } from '@tanstack/react-router'
import { LostOpportunityReport } from '@/features/crm/components/reports'
import { Header } from '@/components/layout/header'
import { TopNav } from '@/components/layout/top-nav'
import { Main } from '@/components/layout/main'
import { CrmSidebar } from '@/features/crm/components/crm-sidebar'

export const Route = createFileRoute('/_authenticated/dashboard/crm/reports/lost-opportunities')({
  component: LostOpportunitiesPage,
})

function LostOpportunitiesPage() {
  const topNav = [
    { title: 'نظرة عامة', href: '/dashboard/crm/overview', isActive: false },
    { title: 'العملاء المحتملين', href: '/dashboard/crm/leads', isActive: false },
    { title: 'التقارير', href: '/dashboard/crm/reports', isActive: true },
  ]

  return (
    <>
      <CrmSidebar />
      <Header className="bg-navy shadow-none">
        <TopNav links={topNav} />
      </Header>
      <Main className="p-6 lg:p-8">
        <LostOpportunityReport />
      </Main>
    </>
  )
}
```

## Features Implemented

### ✅ Data Fields
- Case Number
- Lead/Client Name
- Case Type
- Lost Reason, Category, Detail
- Competitor Name
- Stage When Lost
- Estimated Value
- Days in Pipeline
- Lost Date
- Sales Person

### ✅ Summary Cards (4 KPIs)
1. **Total Lost Opportunities** - Count of all lost cases
2. **Total Value Lost** - Sum of estimated values in SAR
3. **Top Lost Reason** - Most common reason with count
4. **Top Competitor** - Competitor who won the most deals

### ✅ Filters
- Date Range (Start Date / End Date)
- Lost Reason dropdown
- Competitor dropdown
- Sales Person dropdown
- Case Type dropdown
- Clear All Filters button

### ✅ Visualizations
- **Lost Reasons Pie Chart** - Interactive chart using Recharts
- **Top Categories** - Lost opportunity categories breakdown
- **Most Common Lost Stages** - Pipeline stages analysis
- **Sales Performance** - Lost opportunities by sales person

### ✅ Export Functionality
- CSV Export button
- PDF Export button
- (Handlers ready for API integration)

### ✅ Bilingual Support
- Full Arabic/English support using `react-i18next`
- RTL/LTR layout switching
- All labels and text translated
- Date formatting adapts to language
- Currency formatting in SAR

### ✅ Design Patterns
- Follows existing report patterns from Finance module
- Uses DataTable/Table components
- Consistent card-based layout
- Responsive grid system (mobile/tablet/desktop)
- Color-coded badges and indicators
- Loading states with Suspense
- Navy/Emerald color scheme

## Mock Data

The component currently uses mock data for 5 sample lost opportunities. To integrate with real API:

1. Create the API endpoint in your backend
2. Add the service method in `src/services/crmService.ts`
3. Create the React Query hook in `src/hooks/useCrm.ts`
4. Replace mock data with the hook call

## Styling

- Uses Tailwind CSS
- Rounded corners (rounded-2xl, rounded-3xl)
- Shadow effects (shadow-sm)
- Color palette:
  - Red (#ef4444) for lost/negative metrics
  - Orange (#f97316) for value lost
  - Amber (#f59e0b) for warnings
  - Navy for primary text
  - Slate for secondary text

## Accessibility

- ARIA labels on icons
- Semantic HTML structure
- Keyboard navigation support
- Screen reader friendly
