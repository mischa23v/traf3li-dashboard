import { createFileRoute } from '@tanstack/react-router'
import { PayrollRunCreateView } from '@/features/hr/components/payroll-run-create-view'

export const Route = createFileRoute('/_authenticated/dashboard/hr/payroll-runs/new')({
  component: PayrollRunCreateView,
})
