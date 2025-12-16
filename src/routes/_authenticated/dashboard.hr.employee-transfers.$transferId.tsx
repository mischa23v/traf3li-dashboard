import { createFileRoute } from '@tanstack/react-router'
import { EmployeeTransferDetailsView } from '@/features/hr/components/employee-transfer-details-view'

export const Route = createFileRoute('/_authenticated/dashboard/hr/employee-transfers/$transferId')({
  component: EmployeeTransferDetailsView,
})
