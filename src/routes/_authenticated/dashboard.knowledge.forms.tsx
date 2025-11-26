import { createFileRoute } from '@tanstack/react-router'
import { FormsView } from '@/features/knowledge/components/forms-view'

export const Route = createFileRoute('/_authenticated/dashboard/knowledge/forms')({
  component: FormsView,
})
