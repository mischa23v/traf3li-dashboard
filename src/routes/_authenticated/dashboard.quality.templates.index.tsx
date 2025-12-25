import { createFileRoute } from '@tanstack/react-router'
import { TemplateListView } from '@/features/quality/components'

export const Route = createFileRoute('/_authenticated/dashboard/quality/templates/')({
  component: TemplateListView,
})
