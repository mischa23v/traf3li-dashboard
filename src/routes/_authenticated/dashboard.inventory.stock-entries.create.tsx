import { createFileRoute } from '@tanstack/react-router'
import { CreateStockEntryView } from '@/features/inventory/components'

export const Route = createFileRoute('/_authenticated/dashboard/inventory/stock-entries/create')({
  component: CreateStockEntryView,
})
