import { createFileRoute } from '@tanstack/react-router'
import { EmployeeDetailsView } from '@/features/hr/components/employee-details-view'

export const Route = createFileRoute('/_authenticated/dashboard/hr/employees/$employeeId')({
  component: EmployeeDetailsView,
})
