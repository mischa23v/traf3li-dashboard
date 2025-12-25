import { createFileRoute } from '@tanstack/react-router'
import { SubcontractingListView } from '@/features/subcontracting/components'

export const Route = createFileRoute('/_authenticated/dashboard/subcontracting/')({
  component: SubcontractingListView,
})
