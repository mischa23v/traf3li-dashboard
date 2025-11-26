import { createFileRoute } from '@tanstack/react-router'
import { z } from 'zod'
import Documents from '@/features/documents'

const documentsSearchSchema = z.object({
  page: z.number().optional().catch(1),
  pageSize: z.number().optional().catch(10),
  category: z.string().optional().catch(''),
  search: z.string().optional().catch(''),
})

export const Route = createFileRoute('/_authenticated/dashboard/documents/')({
  validateSearch: documentsSearchSchema,
  component: Documents,
})
