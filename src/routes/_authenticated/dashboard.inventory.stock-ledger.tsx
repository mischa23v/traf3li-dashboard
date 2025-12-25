import { createFileRoute } from '@tanstack/react-router'
import { StockLedgerView } from '@/features/inventory/components'

export const Route = createFileRoute('/_authenticated/dashboard/inventory/stock-ledger')({
  component: StockLedgerView,
})
