import { createFileRoute } from '@tanstack/react-router'
import { DateRangePickerDemo } from '@/components/__demo__/date-range-picker-demo'

export const Route = createFileRoute('/_authenticated/dashboard/date-range-picker-test')({
  component: DateRangePickerDemo,
})
