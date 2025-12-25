import { createFileRoute } from '@tanstack/react-router'
import { StockEntryDetailsView } from '@/features/inventory/components'

export const Route = createFileRoute('/_authenticated/dashboard/inventory/stock-entries/$stockEntryId')({
  component: StockEntryDetailsView,
})
