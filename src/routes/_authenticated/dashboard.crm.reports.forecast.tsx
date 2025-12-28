/**
 * Revenue Forecast Report Route
 */
import { createFileRoute } from '@tanstack/react-router'
import { RevenueForecastReport } from '@/features/crm/components/reports/revenue-forecast-report'

export const Route = createFileRoute('/_authenticated/dashboard/crm/reports/forecast')({
  component: RevenueForecastReport,
})
