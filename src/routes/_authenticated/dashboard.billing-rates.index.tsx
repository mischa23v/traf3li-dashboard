import { createFileRoute } from '@tanstack/react-router'
import { z } from 'zod'
import BillingRates from '@/features/billing-rates'

const billingRatesSearchSchema = z.object({
  page: z.number().optional().catch(1),
  pageSize: z.number().optional().catch(10),
  type: z.string().optional().catch(''),
  category: z.string().optional().catch(''),
  search: z.string().optional().catch(''),
  tab: z.enum(['rates', 'groups']).optional().catch('rates'),
})

export const Route = createFileRoute('/_authenticated/dashboard/billing-rates/')({
  validateSearch: billingRatesSearchSchema,
  component: BillingRates,
})
