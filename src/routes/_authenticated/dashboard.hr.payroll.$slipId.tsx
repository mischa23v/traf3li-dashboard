import { createFileRoute } from '@tanstack/react-router'
import { PayrollDetailsView } from '@/features/hr/components/payroll-details-view'

export const Route = createFileRoute('/_authenticated/dashboard/hr/payroll/$slipId')({
  component: PayrollDetailsView,
})
