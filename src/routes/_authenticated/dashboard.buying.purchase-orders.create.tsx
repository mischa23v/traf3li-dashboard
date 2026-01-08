import { createFileRoute } from '@tanstack/react-router'

// Placeholder component for Create Purchase Order
function CreatePurchaseOrderView() {
  return (
    <div className="container mx-auto py-6">
      <h1 className="text-2xl font-bold">Create Purchase Order</h1>
      <p className="text-muted-foreground mt-2">
        Purchase order creation form will be implemented here.
      </p>
    </div>
  )
}

export const Route = createFileRoute('/_authenticated/dashboard/buying/purchase-orders/create')({
  component: CreatePurchaseOrderView,
})
