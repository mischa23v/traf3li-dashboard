import { createFileRoute } from '@tanstack/react-router'
import CaseNotion from '@/features/case-notion'

export const Route = createFileRoute('/_authenticated/dashboard/cases/$caseId/notion')({
  component: CaseNotion,
})
