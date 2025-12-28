/**
 * Expense Budget Integration Example
 * Demonstrates how to integrate budget checking into expense creation
 *
 * TO INTEGRATE INTO create-expense-view.tsx:
 * 1. Import the BudgetCheckDialog component
 * 2. Import useCheckBudgetMutation hook
 * 3. Add state for budget check dialog
 * 4. Call budget check before saving expense
 * 5. Show dialog if budget check returns warnings/errors
 *
 * Example integration code below:
 */

import { useState } from 'react'
import { useCheckBudgetMutation } from '@/hooks/useBudgets'
import { BudgetCheckDialog } from './budget-check-dialog'
import type { BudgetCheckResult } from '@/types/budget'

/**
 * INTEGRATION STEPS FOR create-expense-view.tsx:
 *
 * Step 1: Add imports at the top of the file
 * ```typescript
 * import { useCheckBudgetMutation } from '@/hooks/useBudgets'
 * import { BudgetCheckDialog } from './budget-check-dialog'
 * import type { BudgetCheckResult } from '@/types/budget'
 * ```
 *
 * Step 2: Add state for budget check dialog
 * ```typescript
 * const [budgetCheckResult, setBudgetCheckResult] = useState<BudgetCheckResult | null>(null)
 * const [showBudgetDialog, setShowBudgetDialog] = useState(false)
 * const checkBudgetMutation = useCheckBudgetMutation()
 * ```
 *
 * Step 3: Modify the handleSubmit function to check budget first
 * ```typescript
 * const handleSubmit = async (e: FormEvent) => {
 *   e.preventDefault()
 *
 *   // Validate form
 *   if (!validateForm()) {
 *     toast.error('Please fill in all required fields')
 *     return
 *   }
 *
 *   // Check budget BEFORE creating expense
 *   if (formData.accountId && formData.amount) {
 *     try {
 *       const checkResult = await checkBudgetMutation.mutateAsync({
 *         accountId: formData.accountId,
 *         costCenterId: formData.costCenterId,
 *         projectId: formData.projectId,
 *         departmentId: formData.departmentId,
 *         amount: formData.amount,
 *         date: formData.date,
 *       })
 *
 *       // If budget check returns not allowed, or has warnings, show dialog
 *       if (!checkResult.allowed || checkResult.warnings?.length > 0) {
 *         setBudgetCheckResult(checkResult)
 *         setShowBudgetDialog(true)
 *         return // Stop here, wait for user decision
 *       }
 *
 *       // Budget check passed, proceed with expense creation
 *       await proceedWithExpenseCreation()
 *     } catch (error) {
 *       // Budget check failed, but we can still proceed if not critical
 *       console.error('Budget check error:', error)
 *       await proceedWithExpenseCreation()
 *     }
 *   } else {
 *     // No account or amount, proceed without budget check
 *     await proceedWithExpenseCreation()
 *   }
 * }
 *
 * // Separate function for actual expense creation
 * const proceedWithExpenseCreation = async () => {
 *   try {
 *     setIsSubmitting(true)
 *
 *     const expenseData = {
 *       description: formData.description,
 *       descriptionAr: formData.descriptionAr,
 *       amount: formData.amount,
 *       category: formData.category,
 *       date: formData.date,
 *       // ... other fields
 *     }
 *
 *     await createExpenseMutation.mutateAsync(expenseData)
 *
 *     toast.success('Expense created successfully')
 *     navigate({ to: ROUTES.dashboard.finance.expenses.list })
 *   } catch (error) {
 *     toast.error('Failed to create expense')
 *   } finally {
 *     setIsSubmitting(false)
 *   }
 * }
 * ```
 *
 * Step 4: Add the BudgetCheckDialog component before the closing tag
 * ```typescript
 * return (
 *   <>
 *     {/* Existing form JSX *\/}
 *     <form onSubmit={handleSubmit}>
 *       {/* ... existing form fields ... *\/}
 *     </form>
 *
 *     {/* Budget Check Dialog *\/}
 *     <BudgetCheckDialog
 *       open={showBudgetDialog}
 *       onOpenChange={setShowBudgetDialog}
 *       checkResult={budgetCheckResult}
 *       onProceed={async () => {
 *         setShowBudgetDialog(false)
 *         await proceedWithExpenseCreation()
 *       }}
 *       onCancel={() => {
 *         setShowBudgetDialog(false)
 *         setBudgetCheckResult(null)
 *       }}
 *     />
 *   </>
 * )
 * ```
 */

/**
 * COMPLETE EXAMPLE COMPONENT
 * This shows the complete flow with budget checking
 */
export function ExpenseFormWithBudgetCheck() {
  // Budget check state
  const [budgetCheckResult, setBudgetCheckResult] = useState<BudgetCheckResult | null>(null)
  const [showBudgetDialog, setShowBudgetDialog] = useState(false)
  const checkBudgetMutation = useCheckBudgetMutation()

  // Example form data
  const [formData, setFormData] = useState({
    accountId: '',
    costCenterId: '',
    projectId: '',
    departmentId: '',
    amount: 0,
    date: new Date().toISOString().split('T')[0],
    description: '',
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    // Check budget first
    if (formData.accountId && formData.amount > 0) {
      try {
        const checkResult = await checkBudgetMutation.mutateAsync({
          accountId: formData.accountId,
          costCenterId: formData.costCenterId,
          projectId: formData.projectId,
          departmentId: formData.departmentId,
          amount: formData.amount,
          date: formData.date,
        })

        // Show dialog if not allowed or has warnings
        if (!checkResult.allowed || checkResult.warnings?.length > 0) {
          setBudgetCheckResult(checkResult)
          setShowBudgetDialog(true)
          return
        }

        // Proceed with expense creation
        await createExpense()
      } catch (error) {
        console.error('Budget check error:', error)
        // Still proceed with expense creation if budget check fails
        await createExpense()
      }
    } else {
      await createExpense()
    }
  }

  const createExpense = async () => {
    // Your existing expense creation logic
    console.log('Creating expense:', formData)
    // await createExpenseMutation.mutateAsync(formData)
  }

  return (
    <>
      <form onSubmit={handleSubmit}>
        {/* Your existing form fields */}
        <button type="submit">Create Expense</button>
      </form>

      {/* Budget Check Dialog */}
      <BudgetCheckDialog
        open={showBudgetDialog}
        onOpenChange={setShowBudgetDialog}
        checkResult={budgetCheckResult}
        onProceed={async () => {
          setShowBudgetDialog(false)
          await createExpense()
        }}
        onCancel={() => {
          setShowBudgetDialog(false)
          setBudgetCheckResult(null)
        }}
      />
    </>
  )
}

/**
 * KEY POINTS:
 *
 * 1. Always check budget BEFORE creating the expense
 * 2. Show the dialog if budget is exceeded or warnings exist
 * 3. User can choose to proceed anyway (if allowed) or cancel
 * 4. Handle budget check errors gracefully (allow expense creation to proceed)
 * 5. The budget check uses the account, cost center, project, and department dimensions
 * 6. The check considers current date to find the appropriate budget period
 *
 * BACKEND INTEGRATION:
 * When the backend is ready, the budgetService.checkBudget() function will call:
 * POST /api/budgets/check
 * with the BudgetCheckRequest payload
 *
 * The backend should:
 * 1. Find active budgets for the fiscal year
 * 2. Match budget lines by account/cost center/project/department
 * 3. Calculate if the new expense would exceed the budget
 * 4. Return BudgetCheckResult with allowed flag and messages
 * 5. Apply the budget's control action (stop/warn/ignore)
 */
