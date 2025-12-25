import { createFileRoute } from '@tanstack/react-router'
import { SubcontractingOrderDetailsView } from '@/features/subcontracting/components'

export const Route = createFileRoute('/_authenticated/dashboard/subcontracting/$orderId')({
  component: SubcontractingOrderDetailsView,
})
