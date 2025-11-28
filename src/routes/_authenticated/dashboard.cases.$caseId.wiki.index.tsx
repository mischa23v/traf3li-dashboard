import { createFileRoute } from '@tanstack/react-router'
import { WikiListView } from '@/features/wiki'

export const Route = createFileRoute('/_authenticated/dashboard/cases/$caseId/wiki/')({
  component: WikiListView,
})
