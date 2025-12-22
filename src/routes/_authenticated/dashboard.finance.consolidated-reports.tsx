import { createFileRoute } from '@tanstack/react-router'
import { ConsolidatedReport } from '@/features/reports/components'

export const Route = createFileRoute('/_authenticated/dashboard/finance/consolidated-reports')({
  component: ConsolidatedReport,
})
