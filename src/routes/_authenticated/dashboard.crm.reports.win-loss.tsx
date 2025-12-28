/**
 * Win/Loss Analysis Report Route
 */
import { createFileRoute } from '@tanstack/react-router'
import { WinLossAnalysisReport } from '@/features/crm/components/reports/win-loss-analysis-report'

export const Route = createFileRoute('/_authenticated/dashboard/crm/reports/win-loss')({
  component: WinLossAnalysisReport,
})
