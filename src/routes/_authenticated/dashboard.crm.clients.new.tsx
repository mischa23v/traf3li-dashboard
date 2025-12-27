import { createFileRoute } from '@tanstack/react-router'
import { ClientFormView } from '@/features/crm/views'

export const Route = createFileRoute('/_authenticated/dashboard/crm/clients/new')({
  component: ClientFormView,
})
