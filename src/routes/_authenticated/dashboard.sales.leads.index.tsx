import { createFileRoute, redirect } from '@tanstack/react-router'

// Redirect sales leads to CRM leads - they are the same entity
export const Route = createFileRoute('/_authenticated/dashboard/sales/leads/')({
  beforeLoad: () => {
    throw redirect({
      to: '/dashboard/crm/leads',
    })
  },
})
