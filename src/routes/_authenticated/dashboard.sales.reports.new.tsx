import { createFileRoute } from '@tanstack/react-router'
import { SalesReportsCreateView } from '@/features/sales/components/sales-reports-create-view'

export const Route = createFileRoute('/_authenticated/dashboard/sales/reports/new')({
  component: SalesReportsCreateView,
})
