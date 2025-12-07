import { createFileRoute } from '@tanstack/react-router'
import { OnboardingCreateView } from '@/features/hr/components/onboarding-create-view'

export const Route = createFileRoute('/_authenticated/dashboard/hr/onboarding/new')({
  component: OnboardingCreateView,
})
