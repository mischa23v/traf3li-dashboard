import { createFileRoute } from '@tanstack/react-router'
import { OnboardingDetailsView } from '@/features/hr/components/onboarding-details-view'

export const Route = createFileRoute('/_authenticated/dashboard/hr/onboarding/$onboardingId')({
  component: OnboardingDetailsView,
})
