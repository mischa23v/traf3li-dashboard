/**
 * Example Page: How to Use GL Transactions View
 *
 * This file demonstrates different ways to integrate the GLTransactionsView component
 * into your pages. You can use this as a reference for your implementation.
 */

import { GLTransactionsView } from './gl-transactions-view'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

/**
 * Example 1: Basic Usage
 * Shows all transactions for the current month with default filters
 */
export function BasicTransactionsPage() {
  return (
    <div className="p-6 space-y-6">
      <h1 className="text-2xl font-bold text-slate-900">سجل المعاملات المالية</h1>
      <GLTransactionsView />
    </div>
  )
}

/**
 * Example 2: Filtered by Period
 * Shows all transactions for the current year
 */
export function YearlyTransactionsPage() {
  return (
    <div className="p-6 space-y-6">
      <h1 className="text-2xl font-bold text-slate-900">المعاملات السنوية</h1>
      <GLTransactionsView defaultPeriod="this-year" />
    </div>
  )
}

/**
 * Example 3: Filtered by Type
 * Shows only invoices for the current month
 */
export function InvoicesOnlyPage() {
  return (
    <div className="p-6 space-y-6">
      <h1 className="text-2xl font-bold text-slate-900">الفواتير</h1>
      <GLTransactionsView
        defaultPeriod="this-month"
        defaultType="Invoice"
      />
    </div>
  )
}

/**
 * Example 4: Case-Specific Transactions
 * Shows all transactions related to a specific case
 */
export function CaseTransactionsPage({ caseId }: { caseId: string }) {
  return (
    <div className="p-6 space-y-6">
      <h1 className="text-2xl font-bold text-slate-900">معاملات القضية</h1>
      <GLTransactionsView
        defaultPeriod="all"
        defaultCaseId={caseId}
      />
    </div>
  )
}

/**
 * Example 5: Compact View (No Filters)
 * Shows transactions in a widget or sidebar without filter controls
 */
export function TransactionsWidget() {
  return (
    <GLTransactionsView
      defaultPeriod="this-week"
      showFilters={false}
    />
  )
}

/**
 * Example 6: Dashboard with Multiple Views
 * Shows recent payments and expenses side by side
 */
export function FinanceDashboardPage() {
  return (
    <div className="p-6 space-y-6">
      <h1 className="text-2xl font-bold text-slate-900">لوحة المعلومات المالية</h1>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Payments */}
        <div>
          <h2 className="text-lg font-bold text-slate-900 mb-4">الدفعات الأخيرة</h2>
          <GLTransactionsView
            defaultPeriod="this-month"
            defaultType="Payment"
            showFilters={false}
          />
        </div>

        {/* Recent Expenses */}
        <div>
          <h2 className="text-lg font-bold text-slate-900 mb-4">المصروفات الأخيرة</h2>
          <GLTransactionsView
            defaultPeriod="this-month"
            defaultType="Expense"
            showFilters={false}
          />
        </div>
      </div>

      {/* All Transactions */}
      <div>
        <h2 className="text-lg font-bold text-slate-900 mb-4">جميع المعاملات</h2>
        <GLTransactionsView />
      </div>
    </div>
  )
}

/**
 * Example 7: Integration with TanStack Router
 *
 * Add this to your router configuration:
 *
 * ```tsx
 * import { createFileRoute } from '@tanstack/react-router'
 * import { GLTransactionsView } from '@/features/finance/components/gl-transactions-view'
 *
 * export const Route = createFileRoute('/dashboard/finance/transactions-history')({
 *   component: TransactionsHistoryPage,
 * })
 *
 * function TransactionsHistoryPage() {
 *   return (
 *     <div className="p-6">
 *       <GLTransactionsView />
 *     </div>
 *   )
 * }
 * ```
 */
