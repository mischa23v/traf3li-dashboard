import { createFileRoute } from '@tanstack/react-router'
import { SalaryDetail } from '@/features/hr/salaries/salary-detail'

export const Route = createFileRoute('/_authenticated/dashboard/hr/salaries/$salaryId')({
    component: SalaryDetail,
})
