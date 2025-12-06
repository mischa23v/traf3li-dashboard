import { createFileRoute } from '@tanstack/react-router'
import { ApplicantDetailsView } from '@/features/hr/components/applicant-details-view'

export const Route = createFileRoute('/_authenticated/dashboard/hr/recruitment/applicants/$applicantId')({
  component: ApplicantDetailsView,
})
