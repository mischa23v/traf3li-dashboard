import { createFileRoute } from '@tanstack/react-router'
import { ClientDetailView } from '@/features/crm/views'

export const Route = createFileRoute('/_authenticated/dashboard/crm/clients/$clientId')({
  component: ClientDetailView,
})
