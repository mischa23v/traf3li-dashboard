import { createFileRoute } from '@tanstack/react-router'
import { SalesReportsListView } from '@/features/sales/components/sales-reports-list-view'

export const Route = createFileRoute('/_authenticated/dashboard/sales/reports/')({
  component: SalesReportsListView,
})
