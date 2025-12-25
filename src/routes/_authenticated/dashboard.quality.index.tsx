import { createFileRoute } from '@tanstack/react-router'
import { QualityListView } from '@/features/quality/components'

export const Route = createFileRoute('/_authenticated/dashboard/quality/')({
  component: QualityListView,
})
