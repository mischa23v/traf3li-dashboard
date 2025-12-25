import { createFileRoute } from '@tanstack/react-router'
import { ReceiptListView } from '@/features/subcontracting/components'

export const Route = createFileRoute('/_authenticated/dashboard/subcontracting/receipts/')({
  component: ReceiptListView,
})
