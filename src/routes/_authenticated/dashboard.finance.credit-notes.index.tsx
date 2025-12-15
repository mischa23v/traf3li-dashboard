import { createFileRoute } from '@tanstack/react-router'
import { CreditNotesDashboard } from '@/features/finance/components/credit-notes-dashboard'

export const Route = createFileRoute('/_authenticated/dashboard/finance/credit-notes/')({
    component: CreditNotesDashboard,
})
