import { createFileRoute } from '@tanstack/react-router'
import { CreateClientView } from '@/features/clients/components/create-client-view'

export const Route = createFileRoute('/_authenticated/dashboard/clients/new')({
    component: CreateClientView,
})
