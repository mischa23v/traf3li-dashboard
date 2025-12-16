import { createFileRoute } from '@tanstack/react-router'
import { EmployeeTransfersListView } from '@/features/hr/components/employee-transfers-list-view'

export const Route = createFileRoute('/_authenticated/dashboard/hr/employee-transfers/')({
  component: EmployeeTransfersListView,
})
