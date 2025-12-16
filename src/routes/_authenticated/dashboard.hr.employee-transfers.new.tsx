import { createFileRoute } from '@tanstack/react-router'
import { EmployeeTransferCreateView } from '@/features/hr/components/employee-transfer-create-view'

export const Route = createFileRoute('/_authenticated/dashboard/hr/employee-transfers/new')({
  component: EmployeeTransferCreateView,
})
