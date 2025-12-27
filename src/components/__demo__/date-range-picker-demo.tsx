import { useState } from 'react'
import { DateRangePicker } from '@/components/date-range-picker'
import type { DatePreset } from '@/components/date-range-picker'

export function DateRangePickerDemo() {
  const [dateRange, setDateRange] = useState<{ from: Date | null; to: Date | null } | null>(null)

  return (
    <div className='space-y-8 p-8'>
      <div>
        <h2 className='text-2xl font-bold mb-4'>Date Range Picker Demo</h2>
        <p className='text-muted-foreground mb-6'>
          A comprehensive date range picker with preset options and custom range selection.
        </p>
      </div>

      <div className='space-y-6 max-w-md'>
        {/* Default with all presets */}
        <div>
          <label className='text-sm font-medium mb-2 block'>
            Default (All Presets)
          </label>
          <DateRangePicker
            value={dateRange || undefined}
            onChange={setDateRange}
            placeholder='Select date range'
          />
          {dateRange && (
            <p className='text-sm text-muted-foreground mt-2'>
              Selected: {dateRange.from?.toLocaleDateString()} -{' '}
              {dateRange.to?.toLocaleDateString()}
            </p>
          )}
        </div>

        {/* Without presets */}
        <div>
          <label className='text-sm font-medium mb-2 block'>
            Without Presets
          </label>
          <DateRangePicker
            value={dateRange || undefined}
            onChange={setDateRange}
            showPresets={false}
          />
        </div>

        {/* Custom presets */}
        <div>
          <label className='text-sm font-medium mb-2 block'>
            Custom Presets (Last 7 days, Last 30 days, This Month)
          </label>
          <DateRangePicker
            value={dateRange || undefined}
            onChange={setDateRange}
            presets={['last7days' as DatePreset, 'last30days' as DatePreset, 'thisMonth' as DatePreset, 'custom' as DatePreset]}
          />
        </div>

        {/* Disabled */}
        <div>
          <label className='text-sm font-medium mb-2 block'>
            Disabled
          </label>
          <DateRangePicker
            value={dateRange || undefined}
            onChange={setDateRange}
            disabled
          />
        </div>
      </div>
    </div>
  )
}
