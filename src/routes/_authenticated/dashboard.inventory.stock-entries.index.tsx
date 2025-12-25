import { createFileRoute } from '@tanstack/react-router'
import { StockEntryListView } from '@/features/inventory/components'

export const Route = createFileRoute('/_authenticated/dashboard/inventory/stock-entries/')({
  component: StockEntryListView,
})
