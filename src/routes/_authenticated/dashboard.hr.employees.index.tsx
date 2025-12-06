import { createFileRoute } from '@tanstack/react-router'
import { EmployeesListView } from '@/features/hr/components/employees-list-view'

export const Route = createFileRoute('/_authenticated/dashboard/hr/employees/')({
  component: EmployeesListView,
})
