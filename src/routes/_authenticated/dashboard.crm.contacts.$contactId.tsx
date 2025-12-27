import { createFileRoute } from '@tanstack/react-router'
import { ContactDetailView } from '@/features/crm/views'

export const Route = createFileRoute('/_authenticated/dashboard/crm/contacts/$contactId')({
  component: ContactDetailView,
})
