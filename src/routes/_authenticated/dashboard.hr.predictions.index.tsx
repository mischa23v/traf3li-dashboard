import { createFileRoute } from '@tanstack/react-router'
import { HrPredictionsDashboard } from '@/features/hr/components/hr-predictions-dashboard'

export const Route = createFileRoute('/_authenticated/dashboard/hr/predictions/')({
  component: HrPredictionsDashboard,
})
