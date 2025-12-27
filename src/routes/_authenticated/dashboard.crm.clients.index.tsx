import { createFileRoute } from '@tanstack/react-router'
import { Clients } from '@/features/clients'

export const Route = createFileRoute('/_authenticated/dashboard/crm/clients/')({
  component: Clients,
})
