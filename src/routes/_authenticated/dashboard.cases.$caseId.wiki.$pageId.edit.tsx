import { createFileRoute } from '@tanstack/react-router'
import { WikiCreateView } from '@/features/wiki'

export const Route = createFileRoute('/_authenticated/dashboard/cases/$caseId/wiki/$pageId/edit')({
  component: WikiCreateView,
})
