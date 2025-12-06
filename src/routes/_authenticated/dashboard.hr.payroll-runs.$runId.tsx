import { createFileRoute } from '@tanstack/react-router'
import { PayrollRunDetailsView } from '@/features/hr/components/payroll-run-details-view'

export const Route = createFileRoute('/_authenticated/dashboard/hr/payroll-runs/$runId')({
  component: PayrollRunDetailsView,
})
