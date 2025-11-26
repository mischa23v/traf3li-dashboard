import { createFileRoute } from '@tanstack/react-router'
import { z } from 'zod'
import DataExport from '@/features/data-export'

const dataExportSearchSchema = z.object({
  tab: z.enum(['exports', 'imports']).optional().catch('exports'),
})

export const Route = createFileRoute('/_authenticated/dashboard/data-export/')({
  validateSearch: dataExportSearchSchema,
  component: DataExport,
})
