# CRM Reports

This directory contains report components for the CRM module.

## Lost Opportunity Report

The Lost Opportunity Analysis Report provides comprehensive insights into lost leads and opportunities.

### Features

1. **Summary Cards**
   - Total Lost Opportunities
   - Total Value Lost
   - Top Lost Reason
   - Top Competitor

2. **Data Fields**
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

3. **Filters**
   - Date Range (Start Date, End Date)
   - Lost Reason
   - Competitor
   - Sales Person
   - Case Type

4. **Visualizations**
   - Lost Reasons Pie Chart
   - Top Categories
   - Most Common Lost Stages
   - Sales Performance

5. **Export**
   - CSV Export
   - PDF Export

### Usage

```tsx
import { LostOpportunityReport } from '@/features/crm/components/reports'

function MyPage() {
  return <LostOpportunityReport />
}
```

### Bilingual Support

The component uses `react-i18next` for bilingual support (Arabic/English). All labels and text automatically switch based on the current language setting.

### Data Integration

Currently using mock data. To integrate with real API:

1. Create a hook in `@/hooks/useCrmReports.ts`:
```tsx
export const useLostOpportunityReport = (filters?: LostOpportunityFilters) => {
  return useQuery({
    queryKey: ['crm-reports', 'lost-opportunities', filters],
    queryFn: () => crmReportsService.getLostOpportunities(filters),
    staleTime: 2 * 60 * 1000,
  })
}
```

2. Create the service in `@/services/crmReportsService.ts`:
```tsx
export const getLostOpportunities = async (filters?: LostOpportunityFilters) => {
  const response = await api.get('/api/crm/reports/lost-opportunities', { params: filters })
  return response.data
}
```

3. Replace mock data in component with actual hook call.

### Styling

The component follows the existing design patterns:
- Uses Tailwind CSS for styling
- Follows the navy/emerald color scheme
- Responsive design (mobile, tablet, desktop)
- RTL support for Arabic
