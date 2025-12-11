import { createFileRoute } from '@tanstack/react-router'
import { OrganizationDetailsView } from '@/features/organizations/components/organization-details-view'

export const Route = createFileRoute('/_authenticated/dashboard/organizations/$organizationId')({
  component: OrganizationDetailsView,
})
