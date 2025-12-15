import { createFileRoute } from '@tanstack/react-router'
import { CreateCreditNoteView } from '@/features/finance/components/create-credit-note-view'

export const Route = createFileRoute('/_authenticated/dashboard/finance/credit-notes/new')({
    component: CreateCreditNoteView,
})
