import { createFileRoute } from '@tanstack/react-router'
import { BOMDetailsView } from '@/features/manufacturing/components'

export const Route = createFileRoute('/_authenticated/dashboard/manufacturing/bom/$bomId')({
  component: BOMDetailsView,
})
