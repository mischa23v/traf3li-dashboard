import { createFileRoute } from '@tanstack/react-router'
import { CaseDetailsView } from '@/features/cases/components/case-details-view'

export const Route = createFileRoute('/_authenticated/dashboard/cases/$caseId')({
    component: CaseDetailsView,
})
