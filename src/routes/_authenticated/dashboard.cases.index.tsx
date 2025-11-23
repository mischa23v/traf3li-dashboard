import { createFileRoute } from '@tanstack/react-router'
import { CasesListView } from '@/features/cases/components/cases-list-view'

export const Route = createFileRoute('/_authenticated/dashboard/cases/')({
    component: CasesListView,
})
