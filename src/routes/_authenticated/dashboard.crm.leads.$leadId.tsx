import { createFileRoute } from '@tanstack/react-router'
import { LeadDetails } from '@/features/leads/lead-details'

export const Route = createFileRoute('/_authenticated/dashboard/crm/leads/$leadId')({
  component: LeadDetails,
})
