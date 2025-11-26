import { createFileRoute } from '@tanstack/react-router'
import { ClientDetails } from '@/features/clients/client-details'

export const Route = createFileRoute('/_authenticated/dashboard/clients/$clientId')({
  component: ClientDetails,
})
