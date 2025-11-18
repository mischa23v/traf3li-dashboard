import { createFileRoute } from '@tanstack/react-router'
import { TimeTracking } from '@/features/finance/time-tracking'

export const Route = createFileRoute('/_authenticated/finance/time-tracking')({
  component: TimeTracking,
})
