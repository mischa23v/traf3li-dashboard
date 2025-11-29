import { createFileRoute } from '@tanstack/react-router'
import { EmployeesPage } from '@/features/hr/employees'

export const Route = createFileRoute('/_authenticated/dashboard/hr/employees/')({
    component: EmployeesPage,
})
