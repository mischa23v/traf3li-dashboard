import { createFileRoute } from '@tanstack/react-router'
import { AdvancesDetailsView } from '@/features/hr/components/advances-details-view'

export const Route = createFileRoute('/_authenticated/dashboard/hr/advances/$advanceId')({
  component: AdvancesDetailsView,
})
