import { createFileRoute } from '@tanstack/react-router'
import { AdvancesListView } from '@/features/hr/components/advances-list-view'

export const Route = createFileRoute('/_authenticated/dashboard/hr/advances/')({
  component: AdvancesListView,
})
