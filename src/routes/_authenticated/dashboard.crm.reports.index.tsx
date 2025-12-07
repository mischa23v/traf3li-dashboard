import { createFileRoute } from '@tanstack/react-router'
import { CrmReportsListView } from '@/features/crm/components/crm-reports-list-view'

export const Route = createFileRoute('/_authenticated/dashboard/crm/reports/')({
  component: CrmReportsListView,
})
