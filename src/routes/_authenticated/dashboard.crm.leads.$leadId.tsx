import { createFileRoute } from '@tanstack/react-router'
import { LeadDetailsView } from '@/features/crm/components/lead-details-view'

export const Route = createFileRoute('/_authenticated/dashboard/crm/leads/$leadId')({
  component: LeadDetailsView,
})
