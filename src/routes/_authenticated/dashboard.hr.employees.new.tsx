import { createFileRoute } from '@tanstack/react-router'
import { EmployeeCreateView } from '@/features/hr/components/employee-create-view'

export const Route = createFileRoute('/_authenticated/dashboard/hr/employees/new')({
  component: EmployeeCreateView,
})
