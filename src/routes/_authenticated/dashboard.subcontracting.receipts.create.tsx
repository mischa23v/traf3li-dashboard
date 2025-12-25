import { createFileRoute } from '@tanstack/react-router'
import { CreateReceiptView } from '@/features/subcontracting/components'

export const Route = createFileRoute('/_authenticated/dashboard/subcontracting/receipts/create')({
  component: CreateReceiptView,
})
