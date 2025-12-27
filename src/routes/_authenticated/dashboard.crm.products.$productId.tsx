import { createFileRoute } from '@tanstack/react-router'
import { ProductDetailView } from '@/features/crm/views'

export const Route = createFileRoute('/_authenticated/dashboard/crm/products/$productId')({
  component: ProductDetailView,
})
