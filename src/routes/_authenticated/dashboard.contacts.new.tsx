import { createFileRoute } from '@tanstack/react-router'
import { CreateContactView } from '@/features/contacts/components/create-contact-view'

export const Route = createFileRoute('/_authenticated/dashboard/contacts/new')({
    component: CreateContactView,
})
