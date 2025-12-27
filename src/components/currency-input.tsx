import * as React from 'react'
import { useTranslation } from 'react-i18next'
import { Input } from '@/components/ui/input'
import { cn } from '@/lib/utils'

export interface CurrencyInputProps {
  value?: number
  onChange: (value: number | undefined) => void
  currency?: string  // 'SAR', 'USD', etc.
  locale?: string    // 'ar-SA', 'en-US'
  placeholder?: string
  disabled?: boolean
  className?: string
  min?: number
  max?: number
  showCurrency?: boolean  // show currency symbol
  allowDecimals?: boolean // allow decimal input (halalas)
  name?: string
  id?: string
}

/**
 * CurrencyInput Component
 *
 * A locale-aware currency input component that supports:
 * - Arabic and English number formatting
 * - RTL/LTR layout based on locale
 * - Multiple currencies (SAR, USD, etc.)
 * - Thousand separators
 * - Decimal support for currencies with sub-units (halalas)
 * - Format on blur, raw number on focus
 *
 * @example
 * ```tsx
 * <CurrencyInput
 *   value={1000}
 *   onChange={(val) => console.log(val)}
 *   currency="SAR"
 *   showCurrency={true}
 * />
 * ```
 */
export function CurrencyInput({
  value,
  onChange,
  currency = 'SAR',
  locale: propLocale,
  placeholder,
  disabled = false,
  className,
  min,
  max,
  showCurrency = true,
  allowDecimals = true,
  name,
  id,
}: CurrencyInputProps) {
  const { i18n } = useTranslation()
  const [isFocused, setIsFocused] = React.useState(false)
  const [inputValue, setInputValue] = React.useState('')
  const inputRef = React.useRef<HTMLInputElement>(null)

  // Determine locale from prop or i18n
  const locale = propLocale || (i18n.language === 'ar' ? 'ar-SA' : 'en-US')
  const isRTL = locale.startsWith('ar')

  // Get currency symbol
  const getCurrencySymbol = React.useCallback((curr: string, loc: string) => {
    try {
      const formatter = new Intl.NumberFormat(loc, {
        style: 'currency',
        currency: curr,
        minimumFractionDigits: 0,
      })
      // Extract symbol by formatting 0 and removing digits/spaces
      const parts = formatter.formatToParts(0)
      const symbolPart = parts.find(part => part.type === 'currency')
      return symbolPart?.value || curr
    } catch {
      return curr
    }
  }, [])

  const currencySymbol = getCurrencySymbol(currency, locale)

  // Convert Arabic-Indic numerals to Western numerals
  const arabicToWestern = React.useCallback((str: string): string => {
    const arabicNumerals = '٠١٢٣٤٥٦٧٨٩'
    const westernNumerals = '0123456789'

    return str.split('').map(char => {
      const index = arabicNumerals.indexOf(char)
      return index !== -1 ? westernNumerals[index] : char
    }).join('')
  }, [])

  // Convert Western numerals to Arabic-Indic numerals
  const westernToArabic = React.useCallback((str: string): string => {
    const arabicNumerals = '٠١٢٣٤٥٦٧٨٩'
    const westernNumerals = '0123456789'

    return str.split('').map(char => {
      const index = westernNumerals.indexOf(char)
      return index !== -1 ? arabicNumerals[index] : char
    }).join('')
  }, [])

  // Format number for display
  const formatNumber = React.useCallback((num: number | undefined): string => {
    if (num === undefined || num === null || isNaN(num)) return ''

    try {
      const formatter = new Intl.NumberFormat(locale, {
        style: showCurrency ? 'currency' : 'decimal',
        currency: showCurrency ? currency : undefined,
        minimumFractionDigits: allowDecimals ? 2 : 0,
        maximumFractionDigits: allowDecimals ? 2 : 0,
      })

      return formatter.format(num)
    } catch (error) {
      console.error('Currency formatting error:', error)
      return String(num)
    }
  }, [locale, currency, showCurrency, allowDecimals])

  // Parse input string to number
  const parseInput = React.useCallback((str: string): number | undefined => {
    if (!str) return undefined

    // Convert Arabic numerals to Western
    let normalized = arabicToWestern(str)

    // Remove currency symbols, spaces, and thousand separators
    normalized = normalized
      .replace(/[^\d.,-]/g, '') // Keep only digits, dots, commas, and minus
      .replace(/,/g, '')        // Remove thousand separators

    // Handle empty or invalid input
    if (!normalized || normalized === '-' || normalized === '.') {
      return undefined
    }

    const parsed = parseFloat(normalized)
    return isNaN(parsed) ? undefined : parsed
  }, [arabicToWestern])

  // Update input value when external value changes (only when not focused)
  React.useEffect(() => {
    if (!isFocused) {
      setInputValue(formatNumber(value))
    }
  }, [value, isFocused, formatNumber])

  // Handle focus - show raw number
  const handleFocus = (e: React.FocusEvent<HTMLInputElement>) => {
    setIsFocused(true)

    // Show raw number without formatting
    if (value !== undefined && value !== null && !isNaN(value)) {
      const rawValue = allowDecimals ? value.toFixed(2) : value.toString()
      setInputValue(isRTL ? westernToArabic(rawValue) : rawValue)

      // Select all text for easy replacement
      setTimeout(() => {
        e.target.select()
      }, 0)
    }
  }

  // Handle blur - format and validate
  const handleBlur = () => {
    setIsFocused(false)

    const numericValue = parseInput(inputValue)

    // Validate min/max
    let finalValue = numericValue
    if (finalValue !== undefined) {
      if (min !== undefined && finalValue < min) {
        finalValue = min
      }
      if (max !== undefined && finalValue > max) {
        finalValue = max
      }
    }

    // Update parent with validated value
    if (finalValue !== value) {
      onChange(finalValue)
    }

    // Format display
    setInputValue(formatNumber(finalValue))
  }

  // Handle input change
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value
    setInputValue(newValue)

    // Parse and validate on the fly
    const numericValue = parseInput(newValue)

    // Only update parent if value actually changed
    if (numericValue !== value) {
      onChange(numericValue)
    }
  }

  // Handle keyboard input for validation
  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    const key = e.key

    // Allow control keys
    const controlKeys = [
      'Backspace', 'Delete', 'Tab', 'Escape', 'Enter',
      'ArrowLeft', 'ArrowRight', 'ArrowUp', 'ArrowDown',
      'Home', 'End'
    ]

    if (controlKeys.includes(key)) {
      if (key === 'Enter') {
        inputRef.current?.blur()
      }
      return
    }

    // Allow Ctrl/Cmd shortcuts
    if (e.ctrlKey || e.metaKey) {
      return
    }

    // Allow minus only at the beginning
    if (key === '-') {
      if (min !== undefined && min >= 0) {
        e.preventDefault()
        return
      }
      if (inputValue.includes('-')) {
        e.preventDefault()
        return
      }
      return
    }

    // Allow decimal point
    if (key === '.' || key === '٫') {
      if (!allowDecimals) {
        e.preventDefault()
        return
      }
      if (inputValue.includes('.') || inputValue.includes('٫')) {
        e.preventDefault()
        return
      }
      return
    }

    // Allow Arabic and Western numerals
    const arabicNumerals = '٠١٢٣٤٥٦٧٨٩'
    const westernNumerals = '0123456789'

    if (!arabicNumerals.includes(key) && !westernNumerals.includes(key)) {
      e.preventDefault()
    }
  }

  return (
    <div className={cn('relative', className)}>
      <Input
        ref={inputRef}
        type="text"
        inputMode="decimal"
        value={inputValue}
        onChange={handleChange}
        onFocus={handleFocus}
        onBlur={handleBlur}
        onKeyDown={handleKeyDown}
        placeholder={placeholder}
        disabled={disabled}
        name={name}
        id={id}
        dir={isRTL ? 'rtl' : 'ltr'}
        className={cn(
          'text-right tabular-nums',
          isRTL && 'text-right',
          !isRTL && 'text-left'
        )}
        aria-label={`${showCurrency ? currencySymbol : ''} amount input`}
        aria-valuemin={min}
        aria-valuemax={max}
        aria-valuenow={value}
      />

      {/* Currency symbol indicator (when not showing in formatted value) */}
      {showCurrency && isFocused && (
        <div
          className={cn(
            'pointer-events-none absolute top-1/2 -translate-y-1/2 text-muted-foreground text-sm',
            isRTL ? 'left-3' : 'right-3'
          )}
        >
          {currencySymbol}
        </div>
      )}
    </div>
  )
}
