import { createFileRoute } from '@tanstack/react-router'
import { CreateRfqView } from '@/features/buying/components'

export const Route = createFileRoute('/_authenticated/dashboard/buying/rfq/create')({
  component: CreateRfqView,
})
