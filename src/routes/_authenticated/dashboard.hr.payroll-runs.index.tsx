import { createFileRoute } from '@tanstack/react-router'
import { PayrollRunsListView } from '@/features/hr/components/payroll-runs-list-view'

export const Route = createFileRoute('/_authenticated/dashboard/hr/payroll-runs/')({
  component: PayrollRunsListView,
})
