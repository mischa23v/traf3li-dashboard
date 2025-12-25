import { createFileRoute } from '@tanstack/react-router'
import { CreateCategoryView } from '@/features/assets/components'

export const Route = createFileRoute('/_authenticated/dashboard/assets/categories/create')({
  component: CreateCategoryView,
})
