import { createFileRoute } from '@tanstack/react-router'
import { SalaryCreate } from '@/features/hr/salaries/salary-create'

export const Route = createFileRoute('/_authenticated/dashboard/hr/salaries/new')({
    component: SalaryCreate,
})
