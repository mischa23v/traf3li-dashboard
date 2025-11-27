import { createFileRoute } from '@tanstack/react-router'
import { EditExpenseView } from '@/features/finance/components/edit-expense-view'

export const Route = createFileRoute('/_authenticated/dashboard/finance/expenses/$expenseId/edit')({
    component: EditExpenseView,
})
