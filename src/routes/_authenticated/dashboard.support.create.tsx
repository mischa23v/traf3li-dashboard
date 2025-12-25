import { createFileRoute } from '@tanstack/react-router'
import { CreateTicketView } from '@/features/support/components'

export const Route = createFileRoute('/_authenticated/dashboard/support/create')({
  component: CreateTicketView,
})
