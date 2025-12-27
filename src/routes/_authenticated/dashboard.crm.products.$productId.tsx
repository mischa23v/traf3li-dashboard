import { createFileRoute } from '@tanstack/react-router'
import { ProductFormView } from '@/features/crm/views'

export const Route = createFileRoute('/_authenticated/dashboard/crm/products/$productId')({
  component: () => <ProductFormView editMode={true} />,
})
