#!/bin/bash

# Script to update remaining components to use centralized formatting utilities
# This script helps maintain consistency across the codebase

echo "Updating components to use centralized formatting utilities..."

# List of files that still need updating (61 total)
# These files currently have local formatCurrency definitions

FILES_TO_UPDATE=(
  "src/features/cases/components/case-details-view.tsx"
  "src/features/cases/components/cases-list-view.tsx"
  "src/features/clients/components/create-client-view.tsx"
  "src/features/crm/components/reports/campaign-efficiency-report.tsx"
  "src/features/crm/components/reports/lead-conversion-time-report.tsx"
  "src/features/crm/components/reports/lead-owner-efficiency-report.tsx"
  "src/features/crm/components/reports/lost-opportunity-report.tsx"
  "src/features/crm/components/reports/sales-pipeline-analytics-report.tsx"
  "src/features/finance/components/account-activity-dashboard.tsx"
  "src/features/finance/components/account-statement-dashboard.tsx"
  "src/features/finance/components/accounts-dashboard.tsx"
  "src/features/finance/components/card-reconciliation-view.tsx"
  "src/features/finance/components/corporate-cards-dashboard.tsx"
  "src/features/finance/components/create-expense-view.tsx"
  "src/features/finance/components/create-invoice-view.tsx"
  "src/features/finance/components/create-payment-view.tsx"
  "src/features/finance/components/create-time-entry-view.tsx"
  "src/features/finance/components/edit-invoice-view.tsx"
  # Add more files as needed
)

echo "Files identified for update: ${#FILES_TO_UPDATE[@]}"

# Instructions for manual updates
cat << 'EOF'

MANUAL UPDATE INSTRUCTIONS
=========================

For each file that has a local formatCurrency/formatDate function:

1. Add import at the top:
   import { formatCurrency, formatDate, formatNumber } from '@/lib/utils'

2. Remove the local function definition:
   Delete lines like:
   const formatCurrency = (amount: number) => {
     return new Intl.NumberFormat('ar-SA', { ... }).format(amount)
   }

3. In useMemo hooks with .map(), replace inline date formatting:
   Before: date: new Date(item.date).toLocaleDateString('ar-SA')
   After:  date: formatDate(item.date)

4. Keep formatCurrency() calls as-is (they now use the imported function)

EXAMPLE CHANGES
===============

Before:
-------
const formatCurrency = (amount: number) => {
  return new Intl.NumberFormat('ar-SA', {
    style: 'currency',
    currency: 'SAR',
    minimumFractionDigits: 0
  }).format(amount)
}

const items = useMemo(() => {
  return data.map(item => ({
    ...item,
    date: new Date(item.date).toLocaleDateString('ar-SA'),
    amount: item.amount
  }))
}, [data])

// Later in JSX
{formatCurrency(item.amount)}

After:
------
import { formatCurrency, formatDate } from '@/lib/utils'

const items = useMemo(() => {
  return data.map(item => ({
    ...item,
    date: formatDate(item.date),
    amount: item.amount
  }))
}, [data])

// Later in JSX
{formatCurrency(item.amount)}

BENEFITS
========
✓ No more function recreation on every render
✓ Consistent formatting across the app
✓ Better performance in loops (formatDate pre-memoized)
✓ Easier to maintain and test
✓ Single source of truth for formatting logic

EOF

echo "Update script complete. Please review the instructions above."
