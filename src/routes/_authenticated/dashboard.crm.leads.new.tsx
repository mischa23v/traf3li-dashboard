import { createFileRoute } from '@tanstack/react-router'
import { CreateLead } from '@/features/leads/components/create-lead-view'

export const Route = createFileRoute('/_authenticated/dashboard/crm/leads/new')({
  component: CreateLead,
})
