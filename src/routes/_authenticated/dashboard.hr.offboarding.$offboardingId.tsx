import { createFileRoute } from '@tanstack/react-router'
import { OffboardingDetailsView } from '@/features/hr/components/offboarding-details-view'

export const Route = createFileRoute('/_authenticated/dashboard/hr/offboarding/$offboardingId')({
  component: OffboardingDetailsView,
})
