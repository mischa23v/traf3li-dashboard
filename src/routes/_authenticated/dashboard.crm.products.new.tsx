import { createFileRoute } from '@tanstack/react-router'
import { ProductsListView } from '@/features/crm/views'

export const Route = createFileRoute('/_authenticated/dashboard/crm/products/new')({
  component: ProductsListView,
})
