import { createFileRoute } from '@tanstack/react-router'
import TimeTrackingPage from '@/features/finance/time-tracking'

export const Route = createFileRoute('/_authenticated/finance/time-tracking' as any)({
  component: TimeTrackingPage,
})
