import { createFileRoute } from '@tanstack/react-router'
import { HrAnalyticsDashboard } from '@/features/hr/components/hr-analytics-dashboard'

export const Route = createFileRoute('/_authenticated/dashboard/hr/analytics/')({
  component: HrAnalyticsDashboard,
})
