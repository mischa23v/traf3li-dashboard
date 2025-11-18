import { createFileRoute } from '@tanstack/react-router'
import TimeTrackingPage from '@/features/time-tracking'

export const Route = createFileRoute('/_authenticated/reports/time-tracking')({
  component: TimeTrackingPage,
})
