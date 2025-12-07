import { createFileRoute } from '@tanstack/react-router'
import { OffboardingListView } from '@/features/hr/components/offboarding-list-view'

export const Route = createFileRoute('/_authenticated/dashboard/hr/offboarding/')({
  component: OffboardingListView,
})
