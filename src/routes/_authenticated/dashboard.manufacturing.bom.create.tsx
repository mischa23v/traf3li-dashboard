import { createFileRoute } from '@tanstack/react-router'
import { CreateBOMView } from '@/features/manufacturing/components'

export const Route = createFileRoute('/_authenticated/dashboard/manufacturing/bom/create')({
  component: CreateBOMView,
})
