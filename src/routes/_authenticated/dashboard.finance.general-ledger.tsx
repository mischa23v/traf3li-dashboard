import { createFileRoute } from '@tanstack/react-router'
import GeneralLedgerView from '@/features/finance/components/general-ledger-view'

export const Route = createFileRoute('/_authenticated/dashboard/finance/general-ledger')({
  component: GeneralLedgerView,
})
