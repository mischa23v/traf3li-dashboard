import { createFileRoute } from '@tanstack/react-router'
import { OnboardingListView } from '@/features/hr/components/onboarding-list-view'

export const Route = createFileRoute('/_authenticated/dashboard/hr/onboarding/')({
  component: OnboardingListView,
})
