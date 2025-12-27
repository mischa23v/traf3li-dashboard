# StatusBadge Component

A versatile, color-coded badge component for displaying status information across different entity types in the Traf3li Dashboard.

## Features

- ✅ Color-coded badges by status type
- ✅ Support for multiple entity types (lead, quote, campaign, client, contact, credit, conflict)
- ✅ Customizable labels
- ✅ Three size variants (sm, md, lg)
- ✅ Full RTL (Arabic) support
- ✅ Dark mode support
- ✅ TypeScript type safety
- ✅ Extends existing Badge component
- ✅ Helper functions for programmatic use

## Installation

The component is already integrated into the project. Import it from the components directory:

```tsx
import { StatusBadge } from '@/components/status-badge'
// or
import { StatusBadge } from '@/components'
```

## Basic Usage

```tsx
import { StatusBadge } from '@/components/status-badge'

function MyComponent() {
  return <StatusBadge status="new" type="lead" />
}
```

## Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `status` | `string` | - | **Required.** The status value (e.g., 'new', 'contacted') |
| `type` | `'lead' \| 'quote' \| 'campaign' \| 'client' \| 'contact' \| 'credit' \| 'conflict'` | `'lead'` | The entity type |
| `label` | `string` | - | Custom label override (bypasses automatic translation) |
| `size` | `'sm' \| 'md' \| 'lg'` | `'md'` | Badge size variant |
| `className` | `string` | - | Additional CSS classes |

## Status Types & Color Mappings

### Lead Statuses

| Status | English Label | Arabic Label | Color |
|--------|--------------|--------------|-------|
| `new` | New | جديد | Blue |
| `contacted` | Contacted | تم التواصل | Yellow |
| `qualified` | Qualified | مؤهل | Purple |
| `proposal` | Proposal | عرض مقدم | Orange |
| `negotiation` | Negotiation | مفاوضة | Cyan |
| `won` | Won | مكتسب | Green |
| `lost` | Lost | مفقود | Red |
| `dormant` | Dormant | خامل | Gray |

**Example:**
```tsx
<StatusBadge status="new" type="lead" />
<StatusBadge status="won" type="lead" />
```

### Quote Statuses

| Status | English Label | Arabic Label | Color |
|--------|--------------|--------------|-------|
| `draft` | Draft | مسودة | Gray |
| `sent` | Sent | مُرسل | Blue |
| `viewed` | Viewed | تمت المشاهدة | Purple |
| `accepted` | Accepted | مقبول | Green |
| `rejected` | Rejected | مرفوض | Red |
| `expired` | Expired | منتهي الصلاحية | Orange |
| `revised` | Revised | تم المراجعة | Cyan |

**Example:**
```tsx
<StatusBadge status="draft" type="quote" />
<StatusBadge status="accepted" type="quote" />
```

### Campaign Statuses

| Status | English Label | Arabic Label | Color |
|--------|--------------|--------------|-------|
| `draft` | Draft | مسودة | Gray |
| `scheduled` | Scheduled | مجدولة | Blue |
| `active` | Active | نشطة | Green |
| `paused` | Paused | متوقفة مؤقتاً | Yellow |
| `completed` | Completed | مكتملة | Purple |
| `cancelled` | Cancelled | ملغاة | Red |

**Example:**
```tsx
<StatusBadge status="active" type="campaign" />
<StatusBadge status="completed" type="campaign" />
```

### Client Credit Statuses

| Status | English Label | Arabic Label | Color |
|--------|--------------|--------------|-------|
| `good` | Good Standing | وضع جيد | Green |
| `warning` | Warning | تحذير | Yellow |
| `hold` | On Hold | معلق | Orange |
| `blacklisted` | Blacklisted | في القائمة السوداء | Red |

**Example:**
```tsx
<StatusBadge status="good" type="credit" />
<StatusBadge status="warning" type="credit" />
```

### Contact Conflict Statuses

| Status | English Label | Arabic Label | Color |
|--------|--------------|--------------|-------|
| `not_checked` | Not Checked | لم يتم الفحص | Gray |
| `clear` | Clear | واضح | Green |
| `potential_conflict` | Potential Conflict | تعارض محتمل | Yellow |
| `confirmed_conflict` | Confirmed Conflict | تعارض مؤكد | Red |

**Example:**
```tsx
<StatusBadge status="clear" type="conflict" />
<StatusBadge status="confirmed_conflict" type="conflict" />
```

### Client Statuses

| Status | English Label | Arabic Label | Color |
|--------|--------------|--------------|-------|
| `active` | Active | نشط | Green |
| `inactive` | Inactive | غير نشط | Gray |
| `pending` | Pending | قيد الانتظار | Yellow |
| `suspended` | Suspended | معلق | Red |

**Example:**
```tsx
<StatusBadge status="active" type="client" />
<StatusBadge status="suspended" type="client" />
```

### Contact Statuses

| Status | English Label | Arabic Label | Color |
|--------|--------------|--------------|-------|
| `active` | Active | نشط | Green |
| `inactive` | Inactive | غير نشط | Gray |
| `pending` | Pending | قيد الانتظار | Yellow |

**Example:**
```tsx
<StatusBadge status="active" type="contact" />
<StatusBadge status="pending" type="contact" />
```

## Size Variants

The component supports three size variants:

```tsx
<StatusBadge status="new" type="lead" size="sm" />  // Small
<StatusBadge status="new" type="lead" size="md" />  // Medium (default)
<StatusBadge status="new" type="lead" size="lg" />  // Large
```

## Custom Labels

Override the default label with a custom one:

```tsx
<StatusBadge
  status="new"
  type="lead"
  label="Brand New Lead!"
/>

<StatusBadge
  status="won"
  type="lead"
  label="Successfully Converted ✓"
/>
```

## Custom Styling

Add custom CSS classes:

```tsx
<StatusBadge
  status="won"
  type="lead"
  className="font-bold shadow-lg"
/>

<StatusBadge
  status="active"
  type="campaign"
  className="rounded-full px-4"
/>
```

## RTL Support

The component automatically detects the current language and displays appropriate labels:

- When language is Arabic (`ar`): Shows Arabic labels
- When language is English (`en`): Shows English labels

This works automatically through the `react-i18next` integration.

## Dark Mode Support

All color schemes include dark mode variants that automatically apply when dark mode is enabled.

## Helper Functions

### `getStatusesForType(type)`

Get all available statuses for a specific type:

```tsx
import { getStatusesForType } from '@/components/status-badge'

const leadStatuses = getStatusesForType('lead')
// Returns: ['new', 'contacted', 'qualified', 'proposal', 'negotiation', 'won', 'lost', 'dormant']

const quoteStatuses = getStatusesForType('quote')
// Returns: ['draft', 'sent', 'viewed', 'accepted', 'rejected', 'expired', 'revised']
```

### `getStatusLabel(status, type, language)`

Get the label for a specific status in a specific language:

```tsx
import { getStatusLabel } from '@/components/status-badge'

const englishLabel = getStatusLabel('new', 'lead', 'en')
// Returns: "New"

const arabicLabel = getStatusLabel('new', 'lead', 'ar')
// Returns: "جديد"
```

### `STATUS_CONFIGS`

Access the complete configuration object:

```tsx
import { STATUS_CONFIGS } from '@/components/status-badge'

const leadNewConfig = STATUS_CONFIGS.lead.new
// Returns: { label: 'New', labelAr: 'جديد', color: 'bg-blue-100...' }
```

## Usage Examples

### In a Table

```tsx
function LeadsTable({ leads }) {
  return (
    <table>
      <thead>
        <tr>
          <th>Name</th>
          <th>Status</th>
        </tr>
      </thead>
      <tbody>
        {leads.map(lead => (
          <tr key={lead.id}>
            <td>{lead.name}</td>
            <td>
              <StatusBadge status={lead.status} type="lead" size="sm" />
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  )
}
```

### In a Card

```tsx
function LeadCard({ lead }) {
  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <h3>{lead.name}</h3>
          <StatusBadge status={lead.status} type="lead" />
        </div>
      </CardHeader>
      <CardContent>
        {/* Lead details */}
      </CardContent>
    </Card>
  )
}
```

### In a List

```tsx
function QuotesList({ quotes }) {
  return (
    <div className="space-y-2">
      {quotes.map(quote => (
        <div key={quote.id} className="flex items-center justify-between p-4 border rounded">
          <span>{quote.title}</span>
          <StatusBadge status={quote.status} type="quote" />
        </div>
      ))}
    </div>
  )
}
```

### Dynamic Status Selection

```tsx
function StatusSelector({ value, onChange, type }) {
  const statuses = getStatusesForType(type)

  return (
    <div className="flex flex-wrap gap-2">
      {statuses.map(status => (
        <button
          key={status}
          onClick={() => onChange(status)}
          className={value === status ? 'ring-2 ring-primary' : ''}
        >
          <StatusBadge status={status} type={type} size="sm" />
        </button>
      ))}
    </div>
  )
}
```

### With Filter/Search

```tsx
function FilterByStatus({ onFilter, type }) {
  const [selectedStatus, setSelectedStatus] = useState<string | null>(null)
  const statuses = getStatusesForType(type)

  const handleStatusClick = (status: string) => {
    const newStatus = selectedStatus === status ? null : status
    setSelectedStatus(newStatus)
    onFilter(newStatus)
  }

  return (
    <div className="flex flex-wrap gap-2">
      <span className="text-sm font-medium">Filter by status:</span>
      {statuses.map(status => (
        <button
          key={status}
          onClick={() => handleStatusClick(status)}
          className={cn(
            'transition-opacity',
            selectedStatus && selectedStatus !== status && 'opacity-50'
          )}
        >
          <StatusBadge status={status} type={type} size="sm" />
        </button>
      ))}
    </div>
  )
}
```

## TypeScript Support

The component is fully typed with TypeScript:

```tsx
import type { StatusBadgeProps } from '@/components/status-badge'

const props: StatusBadgeProps = {
  status: 'new',
  type: 'lead',
  size: 'md',
  label: 'Custom Label',
  className: 'custom-class'
}
```

## Best Practices

1. **Always specify the type**: While 'lead' is the default, it's better to be explicit:
   ```tsx
   // Good
   <StatusBadge status="new" type="lead" />

   // Avoid
   <StatusBadge status="new" />
   ```

2. **Use appropriate sizes**:
   - `sm` for table cells and compact layouts
   - `md` for cards and lists (default)
   - `lg` for prominent displays

3. **Let automatic translation work**: Avoid overriding labels unless necessary:
   ```tsx
   // Good - uses automatic RTL translation
   <StatusBadge status="new" type="lead" />

   // Only when necessary
   <StatusBadge status="new" type="lead" label="Custom Label" />
   ```

4. **Use helper functions for dynamic content**:
   ```tsx
   // Good
   const statuses = getStatusesForType('lead')

   // Avoid hardcoding
   const statuses = ['new', 'contacted', 'qualified', ...]
   ```

## Accessibility

The component inherits accessibility features from the base Badge component:
- Proper semantic HTML
- Focus states for interactive use cases
- Sufficient color contrast (WCAG AA compliant)
- RTL support for Arabic users

## Browser Support

Works in all modern browsers with proper Tailwind CSS configuration and dark mode support.

## Related Components

- `Badge` - Base badge component
- Used by: Lead dashboards, Quote lists, Campaign management, Client profiles

## Change Log

### Version 1.0.0 (Initial Release)
- Color-coded status badges
- Support for 7 entity types
- RTL/Arabic support
- Dark mode support
- Three size variants
- Helper functions
- Full TypeScript support
