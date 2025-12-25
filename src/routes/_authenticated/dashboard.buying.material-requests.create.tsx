import { createFileRoute } from '@tanstack/react-router'
import { CreateMaterialRequestView } from '@/features/buying/components'

export const Route = createFileRoute('/_authenticated/dashboard/buying/material-requests/create')({
  component: CreateMaterialRequestView,
})
