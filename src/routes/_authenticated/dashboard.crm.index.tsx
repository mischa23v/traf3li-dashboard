import { createFileRoute } from '@tanstack/react-router'
import { CrmDashboardView } from '@/features/crm/views'

export const Route = createFileRoute('/_authenticated/dashboard/crm/')({
  component: CrmDashboardView,
})
