import { createFileRoute } from '@tanstack/react-router'
import { EmployeeDetail } from '@/features/hr/employees/employee-detail'

export const Route = createFileRoute('/_authenticated/dashboard/hr/employees/$employeeId')({
    component: EmployeeDetail,
})
