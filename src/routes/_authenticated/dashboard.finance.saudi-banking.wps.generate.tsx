import { createFileRoute } from '@tanstack/react-router'
import { WPSGeneratorView } from '@/features/finance/components/wps-generator-view'

export const Route = createFileRoute('/_authenticated/dashboard/finance/saudi-banking/wps/generate')({
    component: WPSGeneratorView,
})
