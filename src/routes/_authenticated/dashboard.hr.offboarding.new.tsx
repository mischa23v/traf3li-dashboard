import { createFileRoute } from '@tanstack/react-router'
import { OffboardingCreateView } from '@/features/hr/components/offboarding-create-view'

export const Route = createFileRoute('/_authenticated/dashboard/hr/offboarding/new')({
  component: OffboardingCreateView,
})
