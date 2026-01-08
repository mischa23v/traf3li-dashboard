import { createFileRoute } from '@tanstack/react-router'
import { GOSICalculatorView } from '@/features/finance/components/gosi-calculator-view'

export const Route = createFileRoute('/_authenticated/dashboard/finance/saudi-banking/gosi/calculator')({
    component: GOSICalculatorView,
})
