import { createFileRoute } from '@tanstack/react-router'
import { CreditNoteDetailsView } from '@/features/finance/components/credit-note-details-view'

export const Route = createFileRoute('/_authenticated/dashboard/finance/credit-notes/$creditNoteId')({
    component: CreditNoteDetailsView,
})
