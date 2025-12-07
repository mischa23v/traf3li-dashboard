import { createFileRoute } from '@tanstack/react-router'
import { BenefitsDetailsView } from '@/features/hr/components/benefits-details-view'

export const Route = createFileRoute('/_authenticated/dashboard/hr/benefits/$benefitId')({
  component: BenefitsDetailsView,
})
