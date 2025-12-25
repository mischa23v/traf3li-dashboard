import { createFileRoute } from '@tanstack/react-router'
import { ManufacturingListView } from '@/features/manufacturing/components'

export const Route = createFileRoute('/_authenticated/dashboard/manufacturing/')({
  component: ManufacturingListView,
})
