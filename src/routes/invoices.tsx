import { createFileRoute } from '@tanstack/react-router'
import InvoiceDashboard from '../../newdesigns/InvoiceDashboard'

export const Route = createFileRoute('/invoices')({
    component: InvoiceDashboard,
})
