import { createFileRoute } from '@tanstack/react-router'
import { IqamaAlertsView } from '@/features/finance/components/iqama-alerts-view'

export const Route = createFileRoute('/_authenticated/dashboard/finance/saudi-banking/compliance/iqama-alerts')({
    component: IqamaAlertsView,
})
