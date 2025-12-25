import { createFileRoute } from '@tanstack/react-router'
import { BOMListView } from '@/features/manufacturing/components'

export const Route = createFileRoute('/_authenticated/dashboard/manufacturing/bom/')({
  component: BOMListView,
})
