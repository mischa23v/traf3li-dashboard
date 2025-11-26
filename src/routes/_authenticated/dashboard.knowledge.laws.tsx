import { createFileRoute } from '@tanstack/react-router'
import { LawsView } from '@/features/knowledge/components/laws-view'

export const Route = createFileRoute('/_authenticated/dashboard/knowledge/laws')({
  component: LawsView,
})
