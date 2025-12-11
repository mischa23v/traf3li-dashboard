import { createFileRoute } from '@tanstack/react-router'
import { Organizations } from '@/features/organizations'

export const Route = createFileRoute('/_authenticated/dashboard/organizations/new')({
  component: Organizations,
})
