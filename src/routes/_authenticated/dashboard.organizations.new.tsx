import { createFileRoute } from '@tanstack/react-router'
import { CreateOrganizationView } from '@/features/organizations/components/create-organization-view'

export const Route = createFileRoute('/_authenticated/dashboard/organizations/new')({
  component: CreateOrganizationView,
})
