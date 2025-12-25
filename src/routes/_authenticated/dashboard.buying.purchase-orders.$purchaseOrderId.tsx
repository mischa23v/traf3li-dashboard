import { createFileRoute } from '@tanstack/react-router'
import { PurchaseOrderDetailsView } from '@/features/buying/components'

export const Route = createFileRoute('/_authenticated/dashboard/buying/purchase-orders/$purchaseOrderId')({
  component: PurchaseOrderDetailsView,
})
