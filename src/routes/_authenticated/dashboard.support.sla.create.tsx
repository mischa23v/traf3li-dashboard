import { createFileRoute } from '@tanstack/react-router'
import { CreateSLAView } from '@/features/support/components'

export const Route = createFileRoute('/_authenticated/dashboard/support/sla/create')({
  component: CreateSLAView,
})
