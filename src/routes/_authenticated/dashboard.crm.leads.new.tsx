import { createFileRoute } from '@tanstack/react-router'
import { CreateLeadView } from '@/features/crm'

export const Route = createFileRoute('/_authenticated/dashboard/crm/leads/new')({
  component: CreateLeadView,
})
