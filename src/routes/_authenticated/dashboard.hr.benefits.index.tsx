import { createFileRoute } from '@tanstack/react-router'
import { BenefitsListView } from '@/features/hr/components/benefits-list-view'

export const Route = createFileRoute('/_authenticated/dashboard/hr/benefits/')({
  component: BenefitsListView,
})
