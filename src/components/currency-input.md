# CurrencyInput Component

A comprehensive, locale-aware currency input component with full RTL support for Arabic and English languages.

## Features

- ✅ **Locale-aware formatting**: Automatically formats numbers in Arabic (٠١٢٣٤٥٦٧٨٩) or English (0123456789)
- ✅ **RTL/LTR support**: Layout direction changes based on locale
- ✅ **Multiple currencies**: Supports any ISO currency code (SAR, USD, EUR, etc.)
- ✅ **Thousand separators**: Automatic grouping (e.g., 1,000.00)
- ✅ **Decimal support**: Handle halalas and other sub-units (can be disabled)
- ✅ **Smart formatting**: Formatted view on blur, raw number on focus
- ✅ **Validation**: Min/max value constraints
- ✅ **Keyboard input filtering**: Only allows valid numeric characters
- ✅ **Accessibility**: Full ARIA attribute support

## Usage

### Basic Example

```tsx
import { CurrencyInput } from '@/components/currency-input'

function MyComponent() {
  const [amount, setAmount] = useState<number | undefined>(1500.75)

  return (
    <CurrencyInput
      value={amount}
      onChange={setAmount}
      currency="SAR"
      showCurrency={true}
    />
  )
}
```

### With Validation

```tsx
<CurrencyInput
  value={amount}
  onChange={setAmount}
  currency="SAR"
  min={0}
  max={10000}
  placeholder="Enter amount (0-10,000)"
/>
```

### Integer Only (No Decimals)

```tsx
<CurrencyInput
  value={amount}
  onChange={setAmount}
  currency="SAR"
  allowDecimals={false}
  showCurrency={true}
/>
```

### Different Currency

```tsx
<CurrencyInput
  value={amount}
  onChange={setAmount}
  currency="USD"
  locale="en-US"
  showCurrency={true}
/>
```

### Without Currency Symbol

```tsx
<CurrencyInput
  value={amount}
  onChange={setAmount}
  currency="SAR"
  showCurrency={false}
/>
```

## Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `value` | `number \| undefined` | `undefined` | Current numeric value |
| `onChange` | `(value: number \| undefined) => void` | **required** | Callback when value changes |
| `currency` | `string` | `'SAR'` | ISO currency code (SAR, USD, EUR, etc.) |
| `locale` | `string` | Auto-detected | Locale for formatting (ar-SA, en-US, etc.) |
| `placeholder` | `string` | `undefined` | Placeholder text |
| `disabled` | `boolean` | `false` | Disable input |
| `className` | `string` | `undefined` | Additional CSS classes |
| `min` | `number` | `undefined` | Minimum allowed value |
| `max` | `number` | `undefined` | Maximum allowed value |
| `showCurrency` | `boolean` | `true` | Show currency symbol |
| `allowDecimals` | `boolean` | `true` | Allow decimal input |
| `name` | `string` | `undefined` | Input name attribute |
| `id` | `string` | `undefined` | Input id attribute |

## Behavior

### Focus/Blur Formatting

- **On Focus**: Shows raw number for editing (e.g., `1500.75`)
- **On Blur**: Shows formatted value with currency (e.g., `ر.س 1,500.75`)

### Numeric Input

- Automatically converts between Arabic-Indic (٠-٩) and Western (0-9) numerals
- Validates input in real-time
- Prevents invalid characters
- Supports negative numbers (if `min` is not set or is negative)
- Handles decimal points (if `allowDecimals` is true)

### Validation

- Enforces `min` and `max` constraints on blur
- Automatically clamps values to valid range
- Shows validation state via ARIA attributes

## Arabic Support

The component fully supports Arabic localization:

1. **Arabic-Indic Numerals**: Automatically converts ٠١٢٣٤٥٦٧٨٩ ↔ 0123456789
2. **RTL Layout**: Text direction changes based on locale
3. **Currency Symbols**: Uses locale-specific currency formatting (e.g., ر.س for SAR)
4. **Thousands Separators**: Respects locale formatting rules

## Examples

See `/src/components/__demo__/currency-input-demo.tsx` for interactive examples.

## Accessibility

The component includes proper ARIA attributes:

- `aria-label`: Describes the input purpose
- `aria-valuemin`: Minimum value constraint
- `aria-valuemax`: Maximum value constraint
- `aria-valuenow`: Current value

## Integration with Forms

Works seamlessly with form libraries like React Hook Form:

```tsx
import { Controller } from 'react-hook-form'

<Controller
  name="amount"
  control={control}
  render={({ field }) => (
    <CurrencyInput
      value={field.value}
      onChange={field.onChange}
      currency="SAR"
    />
  )}
/>
```

## Notes

- The component stores values as `number` type internally (not strings)
- Decimal precision is fixed at 2 digits when `allowDecimals` is true
- Currency symbols are automatically determined using `Intl.NumberFormat`
- Locale is auto-detected from `i18n.language` if not explicitly provided
