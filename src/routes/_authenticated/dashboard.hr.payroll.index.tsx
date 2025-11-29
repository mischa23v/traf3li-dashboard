import { createFileRoute } from '@tanstack/react-router'
import { PayrollPage } from '@/features/hr/payroll'

export const Route = createFileRoute('/_authenticated/dashboard/hr/payroll/')({
    component: PayrollPage,
})
