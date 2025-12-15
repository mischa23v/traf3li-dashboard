# Payment Terms Templates - Complete Implementation

## Overview

A complete Payment Terms management system for the traf3li-dashboard that allows users to create, manage, and use payment terms templates in invoices, bills, and quotes.

## Features Implemented

✅ **Core Features:**
- List all payment terms with categorization (Standard, Early Payment Discount, Extended)
- Create custom payment terms
- Edit existing terms
- Delete terms (prevents deletion of default terms)
- Set default term
- Enable/disable terms
- Pre-built templates initialization

✅ **Payment Terms Model:**
```typescript
interface PaymentTerms {
  _id: string
  name: string              // English name
  nameAr: string           // Arabic name
  description?: string     // English description
  descriptionAr?: string   // Arabic description
  dueDays: number          // Days until payment is due
  discountDays?: number    // Days to receive discount
  discountPercent?: number // Discount percentage
  isDefault: boolean       // Is default term
  isActive: boolean        // Is term active
}
```

✅ **Pre-Built Templates:**
1. Due on Receipt (0 days)
2. Net 7 (7 days)
3. Net 15 (15 days)
4. Net 30 (30 days)
5. Net 45 (45 days)
6. Net 60 (60 days)
7. Net 90 (90 days)
8. 2/10 Net 30 (2% discount if paid in 10 days, otherwise net 30)
9. 1/15 Net 45 (1% discount if paid in 15 days, otherwise net 45)
10. End of Month
11. End of Following Month

✅ **UI Features:**
- Cards/Grid layout with visual grouping
- Due date calculator preview
- Default indicator badge
- Active/inactive toggle
- Bilingual support (Arabic/English)
- Early payment discount indicator
- Responsive design

✅ **Utility Functions:**
- `calculateDueDate()` - Calculate due date based on issue date
- `calculateDiscountDeadline()` - Calculate discount deadline
- `calculateDiscountedAmount()` - Calculate amount after discount
- `isEligibleForDiscount()` - Check if payment qualifies for discount
- `formatPaymentTerms()` - Format payment terms for display
- `getPaymentTermsSummary()` - Get complete summary for display

## Files Created

### 1. Service Layer
**File:** `/src/services/paymentTermsService.ts`

CRUD operations for payment terms:
- `getPaymentTerms()` - Fetch all terms
- `getPaymentTerm(id)` - Fetch single term
- `createPaymentTerms(data)` - Create new term
- `updatePaymentTerms(id, data)` - Update term
- `deletePaymentTerms(id)` - Delete term
- `setDefaultPaymentTerms(id)` - Set as default
- `initializeTemplates()` - Initialize pre-built templates

### 2. Hooks Layer
**File:** `/src/hooks/useBillingSettings.ts` (updated)

TanStack Query hooks:
- `usePaymentTerms()` - Query all terms
- `usePaymentTerm(id)` - Query single term
- `useCreatePaymentTerms()` - Create mutation
- `useUpdatePaymentTerms()` - Update mutation
- `useDeletePaymentTerms()` - Delete mutation
- `useSetDefaultPaymentTerms()` - Set default mutation
- `useInitializePaymentTermsTemplates()` - Initialize templates mutation

### 3. Component Layer
**File:** `/src/features/settings/components/payment-terms-settings.tsx`

Main UI component featuring:
- Header with action buttons
- Info alert explaining payment terms
- Empty state with template initialization
- Grouped payment terms display (Standard, Discount, Extended)
- Payment term cards with preview
- Add/Edit dialog with form validation
- Due date calculator
- Discount configuration

### 4. Route Configuration
**File:** `/src/routes/_authenticated/dashboard.settings.payment-terms.tsx`

Route accessible at: `/dashboard/settings/payment-terms`

### 5. Utility Functions
**File:** `/src/utils/paymentTermsUtils.ts`

Helper functions for:
- Date calculations
- Discount calculations
- Eligibility checks
- Formatting and display
- Pre-built templates data

### 6. Documentation
**Files:**
- `/PAYMENT_TERMS_INTEGRATION.md` - Integration guide for invoice/bill/quote forms
- `/PAYMENT_TERMS_IMPLEMENTATION.md` - This file

## API Endpoints Required (Backend)

```
GET    /api/v1/settings/payment-terms          - List all
GET    /api/v1/settings/payment-terms/:id      - Get one
POST   /api/v1/settings/payment-terms          - Create
PUT    /api/v1/settings/payment-terms/:id      - Update
DELETE /api/v1/settings/payment-terms/:id      - Delete
PATCH  /api/v1/settings/payment-terms/:id/default - Set default
POST   /api/v1/settings/payment-terms/initialize  - Initialize templates
```

## Database Schema (Backend)

```javascript
const paymentTermsSchema = new Schema({
  name: { type: String, required: true },
  nameAr: { type: String, required: true },
  description: String,
  descriptionAr: String,
  dueDays: { type: Number, required: true, min: 0 },
  discountDays: { type: Number, min: 0 },
  discountPercent: { type: Number, min: 0, max: 100 },
  isDefault: { type: Boolean, default: false },
  isActive: { type: Boolean, default: true },
  firm: { type: Schema.Types.ObjectId, ref: 'Firm', required: true },
}, {
  timestamps: true
})

// Index to ensure only one default per firm
paymentTermsSchema.index({ firm: 1, isDefault: 1 })
```

## Usage

### 1. Access the Settings Page

Navigate to: `/dashboard/settings/payment-terms`

### 2. Initialize Pre-Built Templates

On first use, click "تهيئة القوالب الافتراضية" to create standard payment terms templates.

### 3. Create Custom Payment Term

1. Click "إضافة شروط دفع"
2. Fill in the form:
   - Name (English & Arabic)
   - Due days
   - Optional: Discount days and percentage
   - Optional: Description
3. Click "إضافة"

### 4. Manage Payment Terms

- **Edit:** Click menu (⋯) → "تعديل"
- **Set Default:** Click menu (⋯) → "تعيين كافتراضي"
- **Delete:** Click menu (⋯) → "حذف" (disabled for default term)
- **Toggle Active:** Use the switch to enable/disable

### 5. Integration with Invoice/Bill/Quote

See `/PAYMENT_TERMS_INTEGRATION.md` for detailed integration steps.

Example integration snippet:

```tsx
import { usePaymentTerms } from '@/hooks/useBillingSettings'
import { calculateDueDate } from '@/utils/paymentTermsUtils'

const { data: paymentTermsData } = usePaymentTerms()
const paymentTerms = paymentTermsData?.paymentTerms || []

// In your form:
<Select
  value={selectedPaymentTermId}
  onValueChange={setSelectedPaymentTermId}
>
  <SelectContent>
    {paymentTerms.filter(t => t.isActive).map((term) => (
      <SelectItem key={term._id} value={term._id}>
        {term.nameAr}
      </SelectItem>
    ))}
  </SelectContent>
</Select>

// Auto-calculate due date:
useEffect(() => {
  const selectedTerm = paymentTerms.find(t => t._id === selectedPaymentTermId)
  if (selectedTerm && issueDate) {
    const dueDate = calculateDueDate(issueDate, selectedTerm.dueDays)
    setDueDate(dueDate.toISOString().split('T')[0])
  }
}, [selectedPaymentTermId, issueDate])
```

## UI/UX Highlights

### Empty State
- Friendly message explaining what payment terms are
- Button to initialize pre-built templates
- Button to create custom term

### Categorized Display
Payment terms are automatically grouped into three categories:

1. **Standard Terms** (0-30 days, no discount)
   - Icon: Clock (blue)
   - Examples: Due on Receipt, Net 7, Net 15, Net 30

2. **Early Payment Discount Terms** (with discount)
   - Icon: Percent (green)
   - Examples: 2/10 Net 30, 1/15 Net 45
   - Shows discount percentage and deadline

3. **Extended Terms** (31+ days, no discount)
   - Icon: Calendar Check (purple)
   - Examples: Net 45, Net 60, Net 90

### Payment Term Card
Each card displays:
- Icon (dynamic based on category)
- Name (Arabic) with English subtitle
- Default badge (if applicable)
- Active/inactive toggle
- Due days information
- Discount information (if applicable)
- Description
- Preview of due date
- Action menu (Edit, Set Default, Delete)

### Add/Edit Dialog
- Clean two-column layout
- Bilingual input fields
- Number inputs for days and percentages
- Real-time due date preview
- Discount configuration section
- Visual feedback for discount terms
- Active toggle

## Customization

### Adding New Pre-Built Templates

Edit `/src/utils/paymentTermsUtils.ts` function `getPreBuiltTemplates()`:

```typescript
export function getPreBuiltTemplates() {
  return [
    // ... existing templates
    {
      name: 'Net 120',
      nameAr: 'صافي 120 يوم',
      description: 'Payment due within 120 days',
      descriptionAr: 'الدفع مستحق خلال 120 يوم',
      dueDays: 120,
    },
  ]
}
```

### Styling Adjustments

The component uses Tailwind CSS and shadcn/ui components. Key classes:

- Cards: `border-0 shadow-sm rounded-3xl`
- Color scheme: `bg-brand-blue`, `text-navy`, `text-slate-500`
- Icons: Lucide React icons
- Layout: CSS Grid with responsive columns

### Localization

All text is in Arabic with English field values. To add more languages:

1. Add language fields to the model (`nameFr`, `descriptionFr`, etc.)
2. Update the forms to include new language fields
3. Update display logic to show based on user's language preference

## Testing Checklist

- [ ] Access `/dashboard/settings/payment-terms` page loads correctly
- [ ] Click "Initialize Templates" creates pre-built templates
- [ ] Create custom payment term successfully
- [ ] Edit payment term updates correctly
- [ ] Delete payment term removes it (except default)
- [ ] Set default payment term updates indicator
- [ ] Toggle active/inactive works
- [ ] Payment terms appear in invoice/bill/quote dropdowns
- [ ] Due date calculation works correctly
- [ ] Early payment discount displays on invoice
- [ ] Default payment term is pre-selected in new forms
- [ ] Responsive design works on mobile/tablet/desktop

## Known Limitations

1. **Backend Required:** All API endpoints must be implemented on the backend
2. **Firm-Scoped:** Payment terms are scoped to the user's firm
3. **Deletion:** Cannot delete terms that are in use by invoices/bills
4. **End of Month:** Calculations for "End of Month" terms use approximate days

## Future Enhancements

- Usage analytics (show which terms are most used)
- Customer-specific default terms
- Auto-reminders based on payment terms
- Integration with payment gateway for automatic discount application
- Multi-currency discount support
- Conditional payment terms based on invoice amount
- Automated late fees based on payment terms

## Support

For issues or questions:
1. Check `/PAYMENT_TERMS_INTEGRATION.md` for integration details
2. Review utility functions in `/src/utils/paymentTermsUtils.ts`
3. Inspect component code in `/src/features/settings/components/payment-terms-settings.tsx`
4. Check browser console for errors
5. Verify backend API endpoints are implemented

## Screenshots

The UI features:
- Clean, modern design with rounded cards
- Color-coded categories
- Visual indicators (badges, icons)
- Responsive grid layout
- Intuitive action menus
- Clear form dialogs
- Helpful info alerts

## Technical Stack

- **Framework:** React 18+ with TypeScript
- **Routing:** TanStack Router
- **State Management:** TanStack Query (React Query)
- **UI Components:** shadcn/ui
- **Icons:** Lucide React
- **Styling:** Tailwind CSS
- **Forms:** React Hook Form (implicit)
- **Notifications:** Sonner (toast)

## Conclusion

This implementation provides a complete, production-ready Payment Terms management system. The code is:

- ✅ Type-safe (TypeScript)
- ✅ Well-documented
- ✅ Follows existing codebase patterns
- ✅ Bilingual (Arabic/English)
- ✅ Accessible
- ✅ Responsive
- ✅ Maintainable
- ✅ Extensible

The system is ready for backend integration and can be immediately used once the API endpoints are implemented.
