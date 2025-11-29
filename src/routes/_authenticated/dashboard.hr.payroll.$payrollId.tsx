import { createFileRoute } from '@tanstack/react-router'
import { PayrollDetail } from '@/features/hr/payroll/payroll-detail'

export const Route = createFileRoute('/_authenticated/dashboard/hr/payroll/$payrollId')({
    component: PayrollDetail,
})
