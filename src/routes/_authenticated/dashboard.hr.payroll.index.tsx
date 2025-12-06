import { createFileRoute } from '@tanstack/react-router'
import { PayrollListView } from '@/features/hr/components/payroll-list-view'

export const Route = createFileRoute('/_authenticated/dashboard/hr/payroll/')({
  component: PayrollListView,
})
