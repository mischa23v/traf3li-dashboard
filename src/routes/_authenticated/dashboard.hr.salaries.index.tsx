import { createFileRoute } from '@tanstack/react-router'
import { SalariesPage } from '@/features/hr/salaries'

export const Route = createFileRoute('/_authenticated/dashboard/hr/salaries/')({
    component: SalariesPage,
})
