import { createFileRoute } from '@tanstack/react-router'
import { PipelineView } from '@/features/crm'

export const Route = createFileRoute('/_authenticated/dashboard/crm/pipeline')({
  component: PipelineView,
})
