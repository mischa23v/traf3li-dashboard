import { createFileRoute } from '@tanstack/react-router'
import { ApplicantsListView } from '@/features/hr/components/applicants-list-view'

export const Route = createFileRoute('/_authenticated/dashboard/hr/recruitment/applicants/')({
  component: ApplicantsListView,
})
