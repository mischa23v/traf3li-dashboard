import { createFileRoute } from '@tanstack/react-router'
import { CreateActionView } from '@/features/quality/components'

export const Route = createFileRoute('/_authenticated/dashboard/quality/actions/create')({
  component: CreateActionView,
})
