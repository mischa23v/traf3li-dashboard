import { createFileRoute } from '@tanstack/react-router'
import { ReportsDetailsView } from '@/features/hr/components/reports-details-view'

export const Route = createFileRoute('/_authenticated/dashboard/hr/reports/$reportId')({
  component: ReportsDetailsView,
})
