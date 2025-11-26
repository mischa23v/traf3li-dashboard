import { createFileRoute } from '@tanstack/react-router'
import { z } from 'zod'
import Followups from '@/features/followups'

const followupsSearchSchema = z.object({
  page: z.number().optional().catch(1),
  pageSize: z.number().optional().catch(10),
  status: z.string().optional().catch(''),
  priority: z.string().optional().catch(''),
  type: z.string().optional().catch(''),
})

export const Route = createFileRoute('/_authenticated/dashboard/followups/')({
  validateSearch: followupsSearchSchema,
  component: Followups,
})
