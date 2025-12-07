import { createFileRoute } from '@tanstack/react-router'
import { CrmReportsCreateView } from '@/features/crm/components/crm-reports-create-view'

export const Route = createFileRoute('/_authenticated/dashboard/crm/reports/new')({
  component: CrmReportsCreateView,
})
