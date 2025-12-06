import { createFileRoute } from '@tanstack/react-router'
import { PayrollCreateView } from '@/features/hr/components/payroll-create-view'

export const Route = createFileRoute('/_authenticated/dashboard/hr/payroll/new')({
  component: PayrollCreateView,
})
