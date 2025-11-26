import { createFileRoute } from '@tanstack/react-router'
import { z } from 'zod'
import InvoiceTemplates from '@/features/invoice-templates'

const invoiceTemplatesSearchSchema = z.object({
  page: z.number().optional().catch(1),
  pageSize: z.number().optional().catch(10),
  type: z.string().optional().catch(''),
  search: z.string().optional().catch(''),
})

export const Route = createFileRoute('/_authenticated/dashboard/invoice-templates/')({
  validateSearch: invoiceTemplatesSearchSchema,
  component: InvoiceTemplates,
})
