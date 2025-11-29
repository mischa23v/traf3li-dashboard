import { createFileRoute } from '@tanstack/react-router'
import { EmployeeCreate } from '@/features/hr/employees/employee-create'

export const Route = createFileRoute('/_authenticated/dashboard/hr/employees/new')({
    component: EmployeeCreate,
})
