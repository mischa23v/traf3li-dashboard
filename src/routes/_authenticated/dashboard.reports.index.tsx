import { createFileRoute } from '@tanstack/react-router'
import { z } from 'zod'
import Reports from '@/features/reports'

const reportsSearchSchema = z.object({
  type: z.string().optional().catch(''),
  period: z.string().optional().catch(''),
})

export const Route = createFileRoute('/_authenticated/dashboard/reports/')({
  validateSearch: reportsSearchSchema,
  component: Reports,
})
