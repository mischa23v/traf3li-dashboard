import { createFileRoute } from '@tanstack/react-router'
import { CompensationCreateView } from '@/features/hr/components/compensation-create-view'

export const Route = createFileRoute('/_authenticated/dashboard/hr/compensation/new')({
  component: CompensationCreateView,
})
