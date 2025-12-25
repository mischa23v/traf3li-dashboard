import { createFileRoute } from '@tanstack/react-router'
import { WorkOrderDetailsView } from '@/features/manufacturing/components'

export const Route = createFileRoute('/_authenticated/dashboard/manufacturing/$workOrderId')({
  component: WorkOrderDetailsView,
})
