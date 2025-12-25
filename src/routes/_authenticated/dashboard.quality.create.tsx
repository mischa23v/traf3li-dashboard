import { createFileRoute } from '@tanstack/react-router'
import { CreateInspectionView } from '@/features/quality/components'

export const Route = createFileRoute('/_authenticated/dashboard/quality/create')({
  component: CreateInspectionView,
})
