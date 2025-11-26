import { createFileRoute } from '@tanstack/react-router'
import { z } from 'zod'
import Tags from '@/features/tags'

const tagsSearchSchema = z.object({
  page: z.number().optional().catch(1),
  pageSize: z.number().optional().catch(10),
  entityType: z.string().optional().catch(''),
  search: z.string().optional().catch(''),
})

export const Route = createFileRoute('/_authenticated/dashboard/tags/')({
  validateSearch: tagsSearchSchema,
  component: Tags,
})
