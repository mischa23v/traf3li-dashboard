import { createFileRoute } from '@tanstack/react-router'
import { z } from 'zod'
import CaseWorkflows from '@/features/case-workflows'

const caseWorkflowsSearchSchema = z.object({
  page: z.number().optional().catch(1),
  pageSize: z.number().optional().catch(10),
  caseCategory: z.string().optional().catch(''),
  isActive: z.string().optional().catch(''),
})

export const Route = createFileRoute('/_authenticated/dashboard/case-workflows/')({
  validateSearch: caseWorkflowsSearchSchema,
  component: CaseWorkflows,
})
