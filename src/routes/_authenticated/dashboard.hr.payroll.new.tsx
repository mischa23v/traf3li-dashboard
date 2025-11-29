import { createFileRoute } from '@tanstack/react-router'
import { PayrollCreate } from '@/features/hr/payroll/payroll-create'

export const Route = createFileRoute('/_authenticated/dashboard/hr/payroll/new')({
    component: PayrollCreate,
})
