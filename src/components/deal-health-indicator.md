# DealHealthIndicator Component

A flexible, accessible component for displaying deal health grades (A-F) with color coding, tooltips, and detailed factor breakdowns.

## Features

- **Letter Grade Display**: Shows grades from A to F with appropriate color coding
- **Color Coding**: Automatic color assignment based on grade
  - A: Green (#22c55e)
  - B: Blue (#3b82f6)
  - C: Yellow (#eab308)
  - D: Orange (#f97316)
  - F: Red (#ef4444)
- **Two Display Modes**: Compact and Full modes
- **Tooltip Support**: Hover to see detailed breakdown (compact mode)
- **Progress Bars**: Visual representation of scores (full mode)
- **Factor Breakdown**: Display weighted factors contributing to the grade
- **RTL Support**: Fully compatible with Arabic/RTL layouts
- **Responsive**: Works on all screen sizes
- **Dark Mode**: Supports light and dark themes
- **Accessible**: Semantic HTML and ARIA support

## Installation

The component is already installed at:
```
/home/user/traf3li-dashboard/src/components/deal-health-indicator.tsx
```

## Props

```typescript
interface DealHealthIndicatorProps {
  grade: 'A' | 'B' | 'C' | 'D' | 'F'    // Required: The letter grade
  score?: number                         // Optional: Score from 0-100
  factors?: DealHealthFactor[]          // Optional: Array of contributing factors
  mode?: 'compact' | 'full'             // Optional: Display mode (default: 'compact')
  showTooltip?: boolean                  // Optional: Show tooltip in compact mode (default: true)
  className?: string                     // Optional: Additional CSS classes
}

interface DealHealthFactor {
  name: string        // Factor name (e.g., "Client Engagement")
  score: number       // Factor score from 0-100
  weight: number      // Factor weight (e.g., 0.3 for 30%)
}
```

## Usage Examples

### Basic Usage (Compact Mode)

```tsx
import { DealHealthIndicator } from '@/components/deal-health-indicator'

function MyComponent() {
  return <DealHealthIndicator grade="A" score={95} />
}
```

### Compact Mode with Factors

```tsx
import { DealHealthIndicator, DealHealthFactor } from '@/components/deal-health-indicator'

function MyComponent() {
  const factors: DealHealthFactor[] = [
    { name: 'Client Engagement', score: 90, weight: 0.3 },
    { name: 'Payment History', score: 95, weight: 0.25 },
    { name: 'Response Time', score: 88, weight: 0.2 },
    { name: 'Documentation Quality', score: 92, weight: 0.15 },
    { name: 'Communication', score: 85, weight: 0.1 },
  ]

  return (
    <DealHealthIndicator
      grade="A"
      score={91}
      factors={factors}
      showTooltip={true}
    />
  )
}
```

### Full Mode

```tsx
function MyComponent() {
  const factors: DealHealthFactor[] = [
    { name: 'Client Engagement', score: 90, weight: 0.3 },
    { name: 'Payment History', score: 95, weight: 0.25 },
    { name: 'Response Time', score: 88, weight: 0.2 },
  ]

  return (
    <DealHealthIndicator
      grade="A"
      score={91}
      factors={factors}
      mode="full"
    />
  )
}
```

### In a Table/List

```tsx
function DealsList() {
  const deals = [
    { id: 1, name: 'Deal A', grade: 'A' as const, score: 92 },
    { id: 2, name: 'Deal B', grade: 'B' as const, score: 84 },
    { id: 3, name: 'Deal C', grade: 'C' as const, score: 76 },
  ]

  return (
    <div className="space-y-2">
      {deals.map((deal) => (
        <div key={deal.id} className="flex items-center justify-between p-4 rounded-lg border">
          <span>{deal.name}</span>
          <DealHealthIndicator grade={deal.grade} score={deal.score} />
        </div>
      ))}
    </div>
  )
}
```

### RTL/Arabic Support

```tsx
function ArabicExample() {
  const factors: DealHealthFactor[] = [
    { name: 'تفاعل العميل', score: 90, weight: 0.3 },
    { name: 'تاريخ الدفع', score: 95, weight: 0.25 },
    { name: 'وقت الاستجابة', score: 88, weight: 0.2 },
  ]

  return (
    <div dir="rtl">
      <DealHealthIndicator
        grade="A"
        score={91}
        factors={factors}
        mode="full"
      />
    </div>
  )
}
```

## Display Modes

### Compact Mode
- Small, inline badge display
- Shows grade letter and optional percentage
- Tooltip on hover (if enabled) shows factors
- Perfect for tables, lists, and tight spaces

### Full Mode
- Large, detailed card display
- Shows grade letter in a circular badge
- Overall progress bar
- Individual progress bars for each factor
- Factor weights displayed as percentages
- Ideal for dashboards and detail views

## Translations

The component uses i18n for labels. Translation keys:

**Arabic** (`src/locales/ar/translation.json`):
```json
{
  "dealHealth": {
    "label": "صحة الصفقة",
    "grade": "الدرجة",
    "overallScore": "النتيجة الإجمالية",
    "factors": "العوامل"
  }
}
```

**English** (`src/locales/en/translation.json`):
```json
{
  "dealHealth": {
    "label": "Deal Health",
    "grade": "Grade",
    "overallScore": "Overall Score",
    "factors": "Factors"
  }
}
```

## Styling

The component uses Tailwind CSS and supports:
- Light/Dark mode through Tailwind's `dark:` prefix
- Custom classes via `className` prop
- Responsive design
- RTL layouts

### Color Scheme

Each grade has predefined colors:
- **Grade A**: Green (#22c55e) - Excellent health
- **Grade B**: Blue (#3b82f6) - Good health
- **Grade C**: Yellow (#eab308) - Fair health
- **Grade D**: Orange (#f97316) - Poor health
- **Grade F**: Red (#ef4444) - Critical health

## Accessibility

- Semantic HTML structure
- ARIA attributes where needed
- Keyboard navigation support
- Screen reader friendly
- High contrast colors
- Focus indicators

## Dependencies

- React 18+
- react-i18next (for translations)
- @/components/ui/progress (Progress bar component)
- @/components/ui/tooltip (Radix UI Tooltip)
- @/lib/utils (cn utility for className merging)
- Tailwind CSS

## Examples File

See complete examples in:
```
/home/user/traf3li-dashboard/src/components/deal-health-indicator-example.tsx
```

## Best Practices

1. **Always provide a grade**: The grade prop is required
2. **Include score when available**: Provides more context
3. **Use factors in full mode**: They provide valuable insights
4. **Keep factor weights normalized**: Weights should sum to 1.0
5. **Use compact mode in lists**: Saves space and maintains readability
6. **Use full mode for details**: Provides comprehensive view
7. **Provide factor names in user's language**: Supports i18n

## Performance

- Component is memoized using `React.memo`
- Progress transformations are memoized
- Minimal re-renders
- Lightweight and fast

## Testing

The component can be tested using the examples in the example file:

```tsx
import { CompactExample, FullModeExample } from '@/components/deal-health-indicator-example'

// In your test or demo page
<CompactExample />
<FullModeExample />
```
