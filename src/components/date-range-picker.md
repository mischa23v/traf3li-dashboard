# DateRangePicker Component

A comprehensive date range picker component with bilingual support (Arabic/English), preset options, and custom range selection.

## Location

`/home/user/traf3li-dashboard/src/components/date-range-picker.tsx`

## Features

- **Preset Options**: Quick selection for common date ranges
  - Today
  - Yesterday
  - Last 7 Days
  - Last 30 Days
  - This Month
  - Last Month
  - This Quarter
  - Custom Range

- **Custom Range Selection**: Calendar-based date range picker with dual month view
- **Clear Button**: Easy reset of selected date range
- **Bilingual Labels**: Full support for Arabic and English with RTL layout
- **Arabic Date Formatting**: Proper date formatting using Arabic locale
- **Responsive Design**: Works on mobile and desktop
- **Accessible**: Built on Radix UI primitives

## Props

```typescript
interface DateRangePickerProps {
  // Current selected value
  value?: { from: Date | null; to: Date | null }

  // Callback when value changes
  onChange: (value: { from: Date | null; to: Date | null } | null) => void

  // Placeholder text when no value selected
  placeholder?: string

  // Disable the picker
  disabled?: boolean

  // Additional CSS classes
  className?: string

  // Show/hide preset buttons (default: true)
  showPresets?: boolean

  // Custom list of presets to show (default: all presets)
  presets?: DatePreset[]
}

type DatePreset =
  | 'today'
  | 'yesterday'
  | 'last7days'
  | 'last30days'
  | 'thisMonth'
  | 'lastMonth'
  | 'thisQuarter'
  | 'custom'
```

## Usage Examples

### Basic Usage

```tsx
import { useState } from 'react'
import { DateRangePicker } from '@/components/date-range-picker'

function MyComponent() {
  const [dateRange, setDateRange] = useState<{
    from: Date | null
    to: Date | null
  } | null>(null)

  return (
    <DateRangePicker
      value={dateRange || undefined}
      onChange={setDateRange}
      placeholder="Select date range"
    />
  )
}
```

### Without Presets

```tsx
<DateRangePicker
  value={dateRange || undefined}
  onChange={setDateRange}
  showPresets={false}
/>
```

### Custom Presets

```tsx
<DateRangePicker
  value={dateRange || undefined}
  onChange={setDateRange}
  presets={['last7days', 'last30days', 'thisMonth', 'custom']}
/>
```

### Disabled State

```tsx
<DateRangePicker
  value={dateRange || undefined}
  onChange={setDateRange}
  disabled
/>
```

### With Custom Styling

```tsx
<DateRangePicker
  value={dateRange || undefined}
  onChange={setDateRange}
  className="w-full max-w-md"
  placeholder="اختر الفترة الزمنية"
/>
```

## Testing

A demo component is available at:
`/home/user/traf3li-dashboard/src/components/__demo__/date-range-picker-demo.tsx`

A test route is available at:
`/home/user/traf3li-dashboard/src/routes/_authenticated/dashboard.date-range-picker-test.tsx`

To test the component:

1. Start the dev server: `npm run dev`
2. Navigate to: `http://localhost:5173/dashboard/date-range-picker-test`
3. Test in Arabic: Switch language to Arabic
4. Test in English: Switch language to English
5. Test mobile: Resize browser to mobile viewport
6. Check console for errors

## Bilingual Support

The component automatically detects the current language using `i18n.language` and:

- Displays labels in the appropriate language (Arabic/English)
- Formats dates using the correct locale (Arabic numerals for Arabic, etc.)
- Supports RTL layout for Arabic
- Provides proper translations for all preset options

### Preset Labels

| Preset | English | Arabic |
|--------|---------|--------|
| today | Today | اليوم |
| yesterday | Yesterday | أمس |
| last7days | Last 7 Days | آخر 7 أيام |
| last30days | Last 30 Days | آخر 30 يوم |
| thisMonth | This Month | هذا الشهر |
| lastMonth | Last Month | الشهر الماضي |
| thisQuarter | This Quarter | هذا الربع |
| custom | Custom Range | نطاق مخصص |

## Dependencies

The component uses the following dependencies (all already in package.json):

- `react` - Core React
- `react-i18next` - Internationalization
- `date-fns` - Date manipulation and formatting
- `date-fns/locale` - Arabic locale support
- `react-day-picker` - Calendar component
- `lucide-react` - Icons
- `@radix-ui/react-popover` - Popover primitive
- `@/components/ui/button` - Button component
- `@/components/ui/calendar` - Calendar component
- `@/components/ui/popover` - Popover component
- `@/lib/utils` - Utility functions (cn)

## RTL Support

The component fully supports RTL (Right-to-Left) layout for Arabic:

- Icons are positioned correctly (e.g., clear button on the left in RTL)
- Popover alignment is adjusted
- Calendar navigation is reversed
- Date formatting uses Arabic numerals when appropriate

## Accessibility

- Built on Radix UI primitives for accessibility
- Keyboard navigation support
- Screen reader friendly
- ARIA labels and attributes
- Focus management

## Notes

- Date ranges are inclusive (includes both start and end dates)
- Times are normalized to start/end of day
- Clearing the picker calls `onChange(null)`
- The component is fully controlled (requires value and onChange props)
- Calendar shows 2 months side by side for better UX

## Future Enhancements

Potential improvements that could be added:

- Time selection (hour/minute)
- Max/min date restrictions
- Custom date format patterns
- Year/month quick navigation
- Keyboard shortcuts
- Date range validation
- Custom preset definitions
- Timezone support
