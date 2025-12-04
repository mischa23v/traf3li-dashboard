# Lead Management Dashboard - Quick Start

## 📁 Files Created

```
/src/features/sales/
├── index.tsx                          # Export file
├── README.md                          # Full documentation
├── QUICKSTART.md                      # This file
└── components/
    ├── leads-dashboard.tsx            # Main component (1126 lines)
    └── leads-page-example.tsx         # Integration examples
```

## 🚀 Quick Start

### 1. Import and Use

```tsx
import { LeadsDashboard } from '@/features/sales'

function MyPage() {
  return <LeadsDashboard />
}
```

That's it! The component is fully self-contained.

## ✨ Key Features

### Pipeline View (Default)
- ✅ Drag-and-drop leads between 7 stages
- ✅ Visual kanban board with color-coded stages
- ✅ Stage totals and estimated values
- ✅ Real-time statistics dashboard

### List View
- ✅ Filterable list by stage
- ✅ Search by name, email, phone, company
- ✅ Quick actions menu on each card

### Lead Management
- ✅ Create new leads with comprehensive form
- ✅ Update lead stage (drag-drop or dropdown)
- ✅ Convert leads to clients
- ✅ Optional case creation on conversion
- ✅ Add activities (calls, emails, meetings, notes)
- ✅ Delete leads with confirmation

### Stats Dashboard
- ✅ Total leads count
- ✅ Conversion rate
- ✅ Total estimated value
- ✅ Average lead value

## 📋 Required API Endpoints

The component expects these endpoints (already implemented in accountingService):

```
GET    /leads                    - List leads with filters
GET    /leads/:id                - Get single lead
GET    /leads/stats              - Get statistics
POST   /leads                    - Create lead
PUT    /leads/:id                - Update lead
DELETE /leads/:id                - Delete lead
POST   /leads/:id/convert        - Convert to client
PATCH  /leads/:id/stage          - Update stage
POST   /leads/:id/activity       - Add activity
```

## 🎨 Stages

The 7-stage pipeline:

1. **جديد** (new) - New leads, not yet contacted
2. **تم التواصل** (contacted) - Initial contact made
3. **مؤهل** (qualified) - Qualified as potential client
4. **عرض مقدم** (proposal) - Proposal/quote sent
5. **مفاوضة** (negotiation) - In negotiation phase
6. **مكتسب** (won) - Successfully converted
7. **مفقود** (lost) - Lost opportunity

## 📝 Lead Form Fields

### Required
- First Name (الاسم الأول)
- Last Name (اسم العائلة)
- Phone (رقم الهاتف)

### Optional
- Email (البريد الإلكتروني)
- Company (الشركة)
- Source (المصدر): website, referral, social_media, advertisement, cold_call, walk_in, other
- Estimated Value (القيمة المتوقعة)
- Expected Close Date (تاريخ الإغلاق المتوقع)
- Case Type (نوع القضية): labor, commercial, civil, criminal, family, administrative, other
- Description (الوصف)
- Notes (ملاحظات)
- Assigned To (مسؤول المتابعة)

## 🔄 Conversion Flow

1. Lead must be in `qualified`, `proposal`, or `negotiation` stage
2. Click "تحويل إلى عميل" from lead card menu
3. Dialog appears with lead information
4. Optional: Check "إنشاء قضية جديدة" and select case type
5. Click "تحويل الآن"
6. System creates:
   - Client record (always)
   - Case record (if selected)
   - Updates lead with conversion references

## 💡 Activities

Track interactions with leads:

- **مكالمة** (call) - Phone calls
- **بريد إلكتروني** (email) - Email correspondence
- **اجتماع** (meeting) - Face-to-face meetings
- **ملاحظة** (note) - General notes
- **مهمة** (task) - Follow-up tasks

Each activity includes:
- Type
- Date
- Description (required)
- Outcome (optional)

## 🎯 Usage Scenarios

### Scenario 1: Basic Page
```tsx
import { LeadsDashboard } from '@/features/sales'

export function LeadsPage() {
  return (
    <div className="p-6">
      <h1>Lead Management</h1>
      <LeadsDashboard />
    </div>
  )
}
```

### Scenario 2: With Route
```tsx
// src/routes/_authenticated/dashboard.sales.leads.tsx
import { createFileRoute } from '@tanstack/react-router'
import { LeadsDashboard } from '@/features/sales'

export const Route = createFileRoute('/_authenticated/dashboard/sales/leads')({
  component: LeadsDashboard,
})
```

### Scenario 3: Full Layout
See `leads-page-example.tsx` for complete example with Header, Nav, etc.

## 🌐 Internationalization

All labels are in Arabic:
- UI text
- Stage names
- Source types
- Activity types
- Form labels
- Button text

Values like estimated amounts use `formatSAR()` for proper SAR formatting.

## 🔍 Search & Filter

**Search**: Real-time search across:
- First name
- Last name
- Email
- Phone
- Company

**Filter**: By stage in list view:
- All (الكل)
- New (جديد)
- Contacted (تم التواصل)
- Qualified (مؤهل)
- etc.

## 📱 Responsive Design

- ✅ Mobile-friendly card layout
- ✅ Horizontal scroll for pipeline on small screens
- ✅ Touch-friendly drag-and-drop
- ✅ Responsive grid for stats
- ✅ Adaptive form layout

## 🎨 Styling

Uses Tailwind CSS with:
- **Primary**: Emerald-500 (emerald green)
- **Secondary**: Navy (dark blue)
- **Background**: Slate-50/100
- **Border radius**: rounded-xl (12px)
- **Shadows**: Subtle elevation

## ⚡ Performance

- Optimistic UI updates
- Efficient memoization with `useMemo`
- TanStack Query caching
- Minimal re-renders
- Lazy loading of lead details

## 🐛 Troubleshooting

### "Cannot find module '@/hooks/useAccounting'"
- Ensure the path alias `@` is configured in `tsconfig.json`
- Verify `useAccounting.ts` exists in `/src/hooks/`

### Leads not showing
- Check API endpoint is running
- Verify network requests in DevTools
- Check console for errors
- Ensure proper authentication

### Drag-and-drop not working
- Works only in pipeline view (not list view)
- Requires modern browser with drag events support
- Check for JavaScript errors

### Stats not updating
- TanStack Query caching may show stale data briefly
- Stats update automatically on lead changes
- Force refresh by navigating away and back

## 📚 Next Steps

1. Test the component in development
2. Verify API integration
3. Customize styling if needed
4. Add route to navigation
5. Test conversion flow
6. Configure permissions/roles
7. Deploy to production

## 🤝 Support

For issues or questions:
1. Check README.md for detailed documentation
2. Review leads-page-example.tsx for integration patterns
3. Verify API endpoints are working
4. Check browser console for errors

## 📈 Enhancement Ideas

- Bulk operations (assign, update stage, delete)
- Advanced filters (date range, value range)
- Lead scoring system
- Email/SMS templates
- Import/export functionality
- Custom fields
- Automated reminders
- Analytics dashboard
- Lead source performance metrics
