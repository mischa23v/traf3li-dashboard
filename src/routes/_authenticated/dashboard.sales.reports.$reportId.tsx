import { createFileRoute } from '@tanstack/react-router'
import { SalesReportsDetailsView } from '@/features/sales/components/sales-reports-details-view'

export const Route = createFileRoute('/_authenticated/dashboard/sales/reports/$reportId')({
  component: SalesReportsDetailsView,
})
