/**
 * Activity Analytics Report Route
 */
import { createFileRoute } from '@tanstack/react-router'
import { ActivityAnalyticsReport } from '@/features/crm/components/reports/activity-analytics-report'

export const Route = createFileRoute('/_authenticated/dashboard/crm/reports/activities')({
  component: ActivityAnalyticsReport,
})
