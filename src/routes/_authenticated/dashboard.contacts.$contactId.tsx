import { createFileRoute } from '@tanstack/react-router'
import { ContactDetailsView } from '@/features/contacts/components/contact-details-view'

export const Route = createFileRoute('/_authenticated/dashboard/contacts/$contactId')({
  component: ContactDetailsView,
})
