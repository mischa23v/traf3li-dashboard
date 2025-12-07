import { createFileRoute } from '@tanstack/react-router'
import { ReportsListView } from '@/features/hr/components/reports-list-view'

export const Route = createFileRoute('/_authenticated/dashboard/hr/reports/')({
  component: ReportsListView,
})
