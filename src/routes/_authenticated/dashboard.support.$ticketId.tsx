import { createFileRoute } from '@tanstack/react-router'
import { TicketDetailsView } from '@/features/support/components'

export const Route = createFileRoute('/_authenticated/dashboard/support/$ticketId')({
  component: TicketDetailsView,
})
