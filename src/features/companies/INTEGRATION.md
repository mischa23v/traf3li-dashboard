# Integration Guide: Adding Multi-Company Support

## Step 1: Wrap Your App with CompanyProvider

Update your main app file (e.g., `App.tsx` or `main.tsx`):

```tsx
// Before
import { QueryClientProvider } from '@tanstack/react-query'
import { RouterProvider } from '@tanstack/react-router'

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <RouterProvider router={router} />
    </QueryClientProvider>
  )
}
```

```tsx
// After
import { QueryClientProvider } from '@tanstack/react-query'
import { RouterProvider } from '@tanstack/react-router'
import { CompanyProvider } from '@/contexts/CompanyContext'

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <CompanyProvider>
        <RouterProvider router={router} />
      </CompanyProvider>
    </QueryClientProvider>
  )
}
```

## Step 2: Add CompanySwitcher to Header

Update your header component:

```tsx
// src/components/layout/header.tsx

import { Header } from '@/components/layout/header'
import { CompanySwitcher } from '@/features/companies'
import { useNavigate } from '@tanstack/react-router'

export function AppHeader() {
  const navigate = useNavigate()

  return (
    <Header fixed>
      {/* Your existing header content */}
      <div className="flex items-center gap-4 ml-auto">
        {/* Company Switcher */}
        <CompanySwitcher
          onManageClick={() => navigate({ to: '/companies' })}
          onAddClick={() => navigate({ to: '/companies/new' })}
        />

        {/* Your other header items (notifications, user menu, etc.) */}
      </div>
    </Header>
  )
}
```

## Step 3: Create Company Management Route

Add a route for managing companies:

```tsx
// src/routes/_authenticated/companies.tsx

import { createFileRoute } from '@tanstack/react-router'
import { CompanyManagementPage } from '@/features/companies'

export const Route = createFileRoute('/_authenticated/companies')({
  component: CompanyManagementPage,
})
```

## Step 4: Update Data Fetching to Use Company Context

Update your existing hooks to use company context:

```tsx
// Before - Single company only
import { useQuery } from '@tanstack/react-query'
import { getInvoices } from '@/services/invoiceService'

export function InvoicesList() {
  const { data: invoices } = useQuery({
    queryKey: ['invoices'],
    queryFn: () => getInvoices(),
  })

  return <div>{/* Render invoices */}</div>
}
```

```tsx
// After - Multi-company support
import { useQuery } from '@tanstack/react-query'
import { getInvoices } from '@/services/invoiceService'
import { useCompanyContext } from '@/contexts/CompanyContext'

export function InvoicesList() {
  const { activeCompanyId, selectedCompanyIds, isMultiSelectMode } = useCompanyContext()

  // Use selected companies in multi-select mode, otherwise active company
  const companyIds = isMultiSelectMode ? selectedCompanyIds : [activeCompanyId]

  const { data: invoices } = useQuery({
    queryKey: ['invoices', companyIds],
    queryFn: () => getInvoices({ companyIds }),
    enabled: !!activeCompanyId, // Only fetch if company is selected
  })

  return (
    <div>
      {isMultiSelectMode && (
        <div className="mb-4">
          <Badge>Viewing {selectedCompanyIds.length} companies</Badge>
        </div>
      )}
      {/* Render invoices */}
    </div>
  )
}
```

## Step 5: Add Permission Checks

Use company context for permission checks:

```tsx
import { useCompanyContext } from '@/contexts/CompanyContext'
import { Button } from '@/components/ui/button'

export function InvoiceActions() {
  const { activeCompanyId, canManageCompany } = useCompanyContext()

  // Check if user can manage current company
  const canEdit = canManageCompany(activeCompanyId)

  return (
    <div>
      {canEdit && (
        <Button onClick={handleEdit}>Edit Invoice</Button>
      )}
    </div>
  )
}
```

## Step 6: Handle Company Switching

Listen for company changes and refetch data:

```tsx
import { useEffect } from 'react'
import { useCompanyContext } from '@/contexts/CompanyContext'
import { useQueryClient } from '@tanstack/react-query'

export function Dashboard() {
  const { activeCompanyId } = useCompanyContext()
  const queryClient = useQueryClient()

  useEffect(() => {
    // Optionally refetch specific data when company changes
    // Note: All queries are automatically invalidated on company switch
    // This is only needed for additional custom logic
    console.log('Active company changed:', activeCompanyId)
  }, [activeCompanyId])

  return <div>{/* Dashboard content */}</div>
}
```

## Step 7: Backend Integration

Ensure your backend:

1. **Reads the `X-Company-Id` header** from all requests
2. **Filters data by company ID** automatically
3. **Validates company access** before returning data

Example Express.js middleware:

```javascript
// middleware/companyContext.js
async function companyContext(req, res, next) {
  const companyId = req.headers['x-company-id']

  if (!companyId) {
    return res.status(400).json({ error: 'Company ID required' })
  }

  // Verify user has access to this company
  const hasAccess = await checkUserCompanyAccess(req.user.id, companyId)

  if (!hasAccess) {
    return res.status(403).json({ error: 'No access to this company' })
  }

  // Attach company to request
  req.companyId = companyId
  next()
}

// Apply to all routes (except auth)
app.use('/api', authenticateUser, companyContext)
```

## Step 8: Testing

Test the integration:

```tsx
// Test switching companies
import { renderHook, waitFor } from '@testing-library/react'
import { CompanyProvider, useCompanyContext } from '@/contexts/CompanyContext'

test('switches company', async () => {
  const { result } = renderHook(() => useCompanyContext(), {
    wrapper: CompanyProvider,
  })

  await waitFor(() => {
    expect(result.current.activeCompanyId).toBeDefined()
  })

  // Switch company
  await result.current.switchCompany('new-company-id')

  await waitFor(() => {
    expect(result.current.activeCompanyId).toBe('new-company-id')
  })
})
```

## Common Patterns

### Pattern 1: Consolidated Reports

```tsx
export function ConsolidatedReport() {
  const { isMultiSelectMode, selectedCompanyIds } = useCompanyContext()

  return (
    <div>
      <Alert>
        {isMultiSelectMode
          ? `Viewing data from ${selectedCompanyIds.length} companies`
          : 'Single company view'}
      </Alert>
      {/* Report content */}
    </div>
  )
}
```

### Pattern 2: Company-Specific Settings

```tsx
export function CompanySettings() {
  const { activeCompany, canManageCompany } = useCompanyContext()

  if (!canManageCompany(activeCompany._id)) {
    return <Alert>You don't have permission to manage this company</Alert>
  }

  return <div>{/* Settings form */}</div>
}
```

### Pattern 3: Child Company Access

```tsx
export function ParentCompanyDashboard() {
  const { activeCompany } = useCompanyContext()
  const { data: children } = useChildCompanies(activeCompany._id)

  return (
    <div>
      <h2>{activeCompany.name}</h2>
      <div>
        <h3>Child Companies</h3>
        {children?.map((child) => (
          <CompanyCard key={child._id} company={child} />
        ))}
      </div>
    </div>
  )
}
```

## Troubleshooting

### Issue: "Company ID required" error

**Solution:** Ensure CompanyProvider wraps your app and a company is selected.

```tsx
// Check if company is loaded
const { activeCompanyId, isLoading } = useCompanyContext()

if (isLoading) {
  return <LoadingSpinner />
}

if (!activeCompanyId) {
  return <Alert>Please select a company</Alert>
}
```

### Issue: Data not refreshing after company switch

**Solution:** All queries are automatically invalidated. If you need custom logic:

```tsx
const queryClient = useQueryClient()

// Manually invalidate specific queries
queryClient.invalidateQueries({ queryKey: ['invoices'] })
```

### Issue: Permission denied errors

**Solution:** Check user has proper access to the company:

```tsx
const { canAccessCompany, getCompanyAccess } = useCompanyContext()

if (!canAccessCompany(companyId)) {
  return <Alert>No access to this company</Alert>
}

const access = getCompanyAccess(companyId)
console.log('User role:', access.role)
```

## Migration Checklist

- [ ] Add CompanyProvider to app root
- [ ] Add CompanySwitcher to header
- [ ] Create company management route
- [ ] Update all data fetching to include company context
- [ ] Add permission checks using `canManageCompany`
- [ ] Handle multi-select mode in reports/dashboards
- [ ] Update backend to read `X-Company-Id` header
- [ ] Add company access validation in backend
- [ ] Test company switching flow
- [ ] Test multi-select mode
- [ ] Test permissions
- [ ] Test RTL/Arabic support
