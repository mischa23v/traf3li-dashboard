import { createFileRoute } from '@tanstack/react-router'
import { CreateTemplateView } from '@/features/quality/components'

export const Route = createFileRoute('/_authenticated/dashboard/quality/templates/create')({
  component: CreateTemplateView,
})
