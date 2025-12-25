import { createFileRoute } from '@tanstack/react-router'
import { CategoryListView } from '@/features/assets/components'

export const Route = createFileRoute('/_authenticated/dashboard/assets/categories/')({
  component: CategoryListView,
})
