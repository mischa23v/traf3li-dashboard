import { createFileRoute } from '@tanstack/react-router'
import { CrmReportsDetailsView } from '@/features/crm/components/crm-reports-details-view'

export const Route = createFileRoute('/_authenticated/dashboard/crm/reports/$reportId')({
  component: CrmReportsDetailsView,
})
