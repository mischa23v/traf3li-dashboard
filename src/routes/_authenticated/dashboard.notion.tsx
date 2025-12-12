import { createFileRoute } from '@tanstack/react-router'
import { CaseNotionListView } from '@/features/case-notion/components/case-notion-list-view'

export const Route = createFileRoute('/_authenticated/dashboard/notion')({
  component: CaseNotionListView,
})
