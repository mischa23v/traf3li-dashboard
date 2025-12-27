import { useState } from 'react'
import { CurrencyInput } from '@/components/currency-input'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Label } from '@/components/ui/label'

/**
 * CurrencyInput Demo Component
 *
 * Demonstrates various usage scenarios for the CurrencyInput component
 */
export function CurrencyInputDemo() {
  const [sarAmount, setSarAmount] = useState<number | undefined>(1500.75)
  const [usdAmount, setUsdAmount] = useState<number | undefined>(250.50)
  const [noDecimalAmount, setNoDecimalAmount] = useState<number | undefined>(1000)
  const [minMaxAmount, setMinMaxAmount] = useState<number | undefined>(50)

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="space-y-2">
        <h1 className="text-3xl font-bold">CurrencyInput Component Demo</h1>
        <p className="text-muted-foreground">
          Interactive examples showcasing locale-aware currency input with RTL support
        </p>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        {/* SAR Currency Example */}
        <Card>
          <CardHeader>
            <CardTitle>SAR Currency (Default)</CardTitle>
            <CardDescription>
              Saudi Riyal with Arabic/English number formatting
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="sar-input">Amount</Label>
              <CurrencyInput
                id="sar-input"
                value={sarAmount}
                onChange={setSarAmount}
                currency="SAR"
                showCurrency={true}
                placeholder="Enter amount"
              />
            </div>
            <div className="text-sm text-muted-foreground">
              Current value: {sarAmount !== undefined ? sarAmount : 'undefined'}
            </div>
          </CardContent>
        </Card>

        {/* USD Currency Example */}
        <Card>
          <CardHeader>
            <CardTitle>USD Currency</CardTitle>
            <CardDescription>
              US Dollar with thousand separators
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="usd-input">Amount</Label>
              <CurrencyInput
                id="usd-input"
                value={usdAmount}
                onChange={setUsdAmount}
                currency="USD"
                locale="en-US"
                showCurrency={true}
                placeholder="Enter amount"
              />
            </div>
            <div className="text-sm text-muted-foreground">
              Current value: {usdAmount !== undefined ? usdAmount : 'undefined'}
            </div>
          </CardContent>
        </Card>

        {/* No Decimals Example */}
        <Card>
          <CardHeader>
            <CardTitle>No Decimals (Whole Numbers)</CardTitle>
            <CardDescription>
              Integer-only input without halala support
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="no-decimal-input">Amount</Label>
              <CurrencyInput
                id="no-decimal-input"
                value={noDecimalAmount}
                onChange={setNoDecimalAmount}
                currency="SAR"
                allowDecimals={false}
                showCurrency={true}
                placeholder="Enter whole number"
              />
            </div>
            <div className="text-sm text-muted-foreground">
              Current value: {noDecimalAmount !== undefined ? noDecimalAmount : 'undefined'}
            </div>
          </CardContent>
        </Card>

        {/* Min/Max Validation Example */}
        <Card>
          <CardHeader>
            <CardTitle>Min/Max Validation</CardTitle>
            <CardDescription>
              Value must be between 10 and 100
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="minmax-input">Amount (10-100)</Label>
              <CurrencyInput
                id="minmax-input"
                value={minMaxAmount}
                onChange={setMinMaxAmount}
                currency="SAR"
                min={10}
                max={100}
                showCurrency={true}
                placeholder="Enter amount (10-100)"
              />
            </div>
            <div className="text-sm text-muted-foreground">
              Current value: {minMaxAmount !== undefined ? minMaxAmount : 'undefined'}
            </div>
          </CardContent>
        </Card>

        {/* No Currency Symbol */}
        <Card>
          <CardHeader>
            <CardTitle>No Currency Symbol</CardTitle>
            <CardDescription>
              Number formatting without currency display
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="no-symbol-input">Amount</Label>
              <CurrencyInput
                id="no-symbol-input"
                value={sarAmount}
                onChange={setSarAmount}
                currency="SAR"
                showCurrency={false}
                placeholder="Enter amount"
              />
            </div>
            <div className="text-sm text-muted-foreground">
              Current value: {sarAmount !== undefined ? sarAmount : 'undefined'}
            </div>
          </CardContent>
        </Card>

        {/* Disabled State */}
        <Card>
          <CardHeader>
            <CardTitle>Disabled State</CardTitle>
            <CardDescription>
              Read-only currency display
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="disabled-input">Amount</Label>
              <CurrencyInput
                id="disabled-input"
                value={1234.56}
                onChange={() => {}}
                currency="SAR"
                disabled={true}
                showCurrency={true}
              />
            </div>
            <div className="text-sm text-muted-foreground">
              This input is disabled
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Feature List */}
      <Card>
        <CardHeader>
          <CardTitle>Features</CardTitle>
        </CardHeader>
        <CardContent>
          <ul className="space-y-2 text-sm">
            <li className="flex items-start gap-2">
              <span className="text-green-500 font-bold">✓</span>
              <span>Locale-aware formatting (Arabic ٠١٢٣٤٥٦٧٨٩ / English 0123456789)</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-green-500 font-bold">✓</span>
              <span>RTL/LTR layout based on locale</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-green-500 font-bold">✓</span>
              <span>Thousand separators (e.g., 1,000.00)</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-green-500 font-bold">✓</span>
              <span>Format on blur, raw number on focus</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-green-500 font-bold">✓</span>
              <span>Currency symbol prefix (SAR, USD, etc.)</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-green-500 font-bold">✓</span>
              <span>Decimal support for halalas (can be disabled)</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-green-500 font-bold">✓</span>
              <span>Min/Max validation</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-green-500 font-bold">✓</span>
              <span>Keyboard input validation (only allows valid characters)</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-green-500 font-bold">✓</span>
              <span>Accessibility support (ARIA attributes)</span>
            </li>
          </ul>
        </CardContent>
      </Card>
    </div>
  )
}
