import { createFileRoute } from '@tanstack/react-router'
import { ApplicantCreateView } from '@/features/hr/components/applicant-create-view'

export const Route = createFileRoute('/_authenticated/dashboard/hr/recruitment/applicants/new')({
  component: ApplicantCreateView,
})
