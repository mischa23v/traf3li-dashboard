import { createFileRoute } from '@tanstack/react-router'
import { WikiDetailsView } from '@/features/wiki'

export const Route = createFileRoute('/_authenticated/dashboard/cases/$caseId/wiki/$pageId/')({
  component: WikiDetailsView,
})
