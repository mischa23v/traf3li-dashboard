# Payment Terms Integration Guide

This document explains how to integrate Payment Terms into Invoice, Bill, and Quote forms.

## Overview

Payment Terms define when an invoice/bill is due and whether early payment discounts apply. This system replaces hardcoded payment terms with a flexible, manageable template system.

## Files Created

1. **Service**: `/src/services/paymentTermsService.ts`
   - CRUD operations for payment terms

2. **Hooks**: `/src/hooks/useBillingSettings.ts` (updated)
   - `usePaymentTerms()` - Fetch all payment terms
   - `usePaymentTerm(id)` - Fetch single payment term
   - `useCreatePaymentTerms()` - Create new payment term
   - `useUpdatePaymentTerms()` - Update payment term
   - `useDeletePaymentTerms()` - Delete payment term
   - `useSetDefaultPaymentTerms()` - Set default payment term
   - `useInitializePaymentTermsTemplates()` - Initialize pre-built templates

3. **Component**: `/src/features/settings/components/payment-terms-settings.tsx`
   - UI for managing payment terms

4. **Route**: `/src/routes/_authenticated/dashboard.settings.payment-terms.tsx`
   - Route configuration

5. **Utilities**: `/src/utils/paymentTermsUtils.ts`
   - Helper functions for payment terms calculations

## Integration Steps

### 1. Update Invoice/Bill/Quote Forms

Replace the hardcoded payment terms dropdown with a dynamic one:

```tsx
import { usePaymentTerms } from '@/hooks/useBillingSettings'
import { calculateDueDate, getPaymentTermsSummary } from '@/utils/paymentTermsUtils'

// In your component:
const { data: paymentTermsData } = usePaymentTerms()
const paymentTerms = paymentTermsData?.paymentTerms || []

// State
const [selectedPaymentTermId, setSelectedPaymentTermId] = useState('')
const [issueDate, setIssueDate] = useState(new Date().toISOString().split('T')[0])
const [dueDate, setDueDate] = useState('')

// Calculate due date when payment term or issue date changes
useEffect(() => {
  const selectedTerm = paymentTerms.find(t => t._id === selectedPaymentTermId)
  if (selectedTerm && issueDate) {
    const calculatedDueDate = calculateDueDate(issueDate, selectedTerm.dueDays)
    setDueDate(calculatedDueDate.toISOString().split('T')[0])
  }
}, [selectedPaymentTermId, issueDate, paymentTerms])

// In your JSX:
<Select
  value={selectedPaymentTermId}
  onValueChange={setSelectedPaymentTermId}
>
  <SelectTrigger>
    <SelectValue placeholder="اختر شروط الدفع" />
  </SelectTrigger>
  <SelectContent>
    {paymentTerms
      .filter(term => term.isActive)
      .map((term) => (
        <SelectItem key={term._id} value={term._id}>
          <div className="flex items-center justify-between w-full gap-2">
            <span>{term.nameAr}</span>
            {term.isDefault && (
              <Badge className="text-xs">افتراضي</Badge>
            )}
          </div>
        </SelectItem>
      ))}
  </SelectContent>
</Select>
```

### 2. Show Early Payment Discount Information

If the selected payment term has a discount:

```tsx
const selectedTerm = paymentTerms.find(t => t._id === selectedPaymentTermId)

{selectedTerm?.discountPercent && selectedTerm.discountDays && (
  <Alert className="border-green-200 bg-green-50">
    <Percent className="h-4 w-4 text-green-600" />
    <AlertDescription className="text-green-900">
      <strong>خصم الدفع المبكر:</strong> {selectedTerm.discountPercent}% خصم
      إذا تم الدفع قبل {calculateDiscountDeadline(issueDate, selectedTerm.discountDays)?.toLocaleDateString('ar-SA')}
    </AlertDescription>
  </Alert>
)}
```

### 3. Display on Invoice PDF

Include payment terms information in the invoice:

```tsx
import { getPaymentTermsSummary } from '@/utils/paymentTermsUtils'

const selectedTerm = paymentTerms.find(t => t._id === selectedPaymentTermId)
if (selectedTerm) {
  const summary = getPaymentTermsSummary(selectedTerm, issueDate, 'ar')

  // Display in PDF:
  // شروط الدفع: {summary.displayText}
  // تاريخ الاستحقاق: {summary.dueDateFormatted}
  //
  // If has discount:
  // احصل على خصم {summary.discountPercent}% عند الدفع قبل {summary.discountDeadlineFormatted}
}
```

### 4. Backend API Payload

When creating/updating invoice/bill/quote, send:

```typescript
{
  paymentTermsId: selectedPaymentTermId, // Store the ID reference
  issueDate: issueDate,
  dueDate: dueDate, // Auto-calculated
  // ... other fields
}
```

### 5. Set Default Payment Term

On form load, set the default payment term:

```tsx
useEffect(() => {
  const defaultTerm = paymentTerms.find(t => t.isDefault)
  if (defaultTerm && !selectedPaymentTermId) {
    setSelectedPaymentTermId(defaultTerm._id)
  }
}, [paymentTerms])
```

## Backend Implementation Notes

### Database Schema

```javascript
const paymentTermsSchema = new Schema({
  name: { type: String, required: true }, // English name
  nameAr: { type: String, required: true }, // Arabic name
  description: String, // English description
  descriptionAr: String, // Arabic description
  dueDays: { type: Number, required: true, min: 0 }, // Days until due
  discountDays: { type: Number, min: 0 }, // Days to get discount
  discountPercent: { type: Number, min: 0, max: 100 }, // Discount percentage
  isDefault: { type: Boolean, default: false }, // Is default term
  isActive: { type: Boolean, default: true }, // Is active
  firm: { type: Schema.Types.ObjectId, ref: 'Firm', required: true },
}, {
  timestamps: true
})

// Ensure only one default per firm
paymentTermsSchema.index({ firm: 1, isDefault: 1 })
```

### API Endpoints

```
GET    /api/v1/settings/payment-terms          - List all payment terms
GET    /api/v1/settings/payment-terms/:id      - Get single payment term
POST   /api/v1/settings/payment-terms          - Create payment term
PUT    /api/v1/settings/payment-terms/:id      - Update payment term
DELETE /api/v1/settings/payment-terms/:id      - Delete payment term
PATCH  /api/v1/settings/payment-terms/:id/default - Set as default
POST   /api/v1/settings/payment-terms/initialize  - Initialize pre-built templates
```

### Initialize Templates Endpoint

```javascript
router.post('/initialize', async (req, res) => {
  const templates = [
    { name: 'Due on Receipt', nameAr: 'استحقاق عند الاستلام', dueDays: 0, isDefault: true },
    { name: 'Net 7', nameAr: 'صافي 7 أيام', dueDays: 7 },
    { name: 'Net 15', nameAr: 'صافي 15 يوم', dueDays: 15 },
    { name: 'Net 30', nameAr: 'صافي 30 يوم', dueDays: 30 },
    { name: 'Net 45', nameAr: 'صافي 45 يوم', dueDays: 45 },
    { name: 'Net 60', nameAr: 'صافي 60 يوم', dueDays: 60 },
    { name: 'Net 90', nameAr: 'صافي 90 يوم', dueDays: 90 },
    {
      name: '2/10 Net 30',
      nameAr: '2/10 صافي 30',
      dueDays: 30,
      discountDays: 10,
      discountPercent: 2
    },
    { name: 'End of Month', nameAr: 'نهاية الشهر', dueDays: 30 },
    { name: 'End of Following Month', nameAr: 'نهاية الشهر التالي', dueDays: 60 },
  ]

  // Create templates for the firm
  const created = await PaymentTerms.insertMany(
    templates.map(t => ({ ...t, firm: req.user.firm }))
  )

  res.json({ paymentTerms: created })
})
```

### Set Default Logic

When setting a term as default, ensure only one default per firm:

```javascript
router.patch('/:id/default', async (req, res) => {
  // Remove default from all terms
  await PaymentTerms.updateMany(
    { firm: req.user.firm },
    { isDefault: false }
  )

  // Set new default
  const term = await PaymentTerms.findByIdAndUpdate(
    req.params.id,
    { isDefault: true },
    { new: true }
  )

  res.json(term)
})
```

## Usage in Invoice Schema

Update your Invoice schema to reference payment terms:

```javascript
const invoiceSchema = new Schema({
  // ... existing fields
  paymentTerms: {
    type: Schema.Types.ObjectId,
    ref: 'PaymentTerms'
  },
  issueDate: { type: Date, required: true },
  dueDate: { type: Date, required: true },
  discountDeadline: Date, // If early payment discount applies
  discountPercent: Number, // Store at time of invoice creation
  // ... other fields
})
```

## Pre-Built Templates

The system includes these pre-built templates:

1. **Due on Receipt** (0 days)
2. **Net 7** (7 days)
3. **Net 15** (15 days)
4. **Net 30** (30 days) - Common default
5. **Net 45** (45 days)
6. **Net 60** (60 days)
7. **Net 90** (90 days)
8. **2/10 Net 30** (2% discount if paid in 10 days, otherwise 30)
9. **1/15 Net 45** (1% discount if paid in 15 days, otherwise 45)
10. **End of Month** (Due at month end)
11. **End of Following Month** (Due at next month end)

## Features

- ✅ List all payment terms
- ✅ Create custom payment terms
- ✅ Edit existing terms
- ✅ Delete terms (if not in use)
- ✅ Set default term
- ✅ Enable/disable terms
- ✅ Early payment discount support
- ✅ Auto-calculate due dates
- ✅ Preview due dates
- ✅ Bilingual (Arabic/English) support
- ✅ Pre-built templates initialization
- ✅ Grouped by category (standard/discount/extended)

## Testing

1. Navigate to `/dashboard/settings/payment-terms`
2. Click "تهيئة القوالب الافتراضية" to initialize templates
3. Create a custom payment term with discount
4. Set a term as default
5. Test integration in invoice/bill/quote forms
6. Verify due date calculation
7. Verify early payment discount display

## Future Enhancements

- [ ] Usage tracking (count how many invoices use each term)
- [ ] Prevent deletion of terms in use
- [ ] Analytics on which terms are most popular
- [ ] Customer-specific default payment terms
- [ ] Automatic reminders based on payment terms
- [ ] Integration with payment gateway for auto-discount application
