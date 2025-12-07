import { createFileRoute } from '@tanstack/react-router'
import { ReportsCreateView } from '@/features/hr/components/reports-create-view'

export const Route = createFileRoute('/_authenticated/dashboard/hr/reports/new')({
  component: ReportsCreateView,
})
