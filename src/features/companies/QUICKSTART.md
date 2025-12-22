# Quick Start Guide - Multi-Company Support

Get up and running with multi-company support in 5 minutes!

## Step 1: Wrap Your App (1 minute)

Find your main app file (usually `src/main.tsx` or `src/App.tsx`) and add the CompanyProvider:

```tsx
import { CompanyProvider } from '@/contexts/CompanyContext'

// Wrap your app
<QueryClientProvider client={queryClient}>
  <CompanyProvider>
    <RouterProvider router={router} />
  </CompanyProvider>
</QueryClientProvider>
```

## Step 2: Add to Header (2 minutes)

Add the CompanySwitcher to your header component:

```tsx
import { CompanySwitcher } from '@/features/companies'

export function Header() {
  return (
    <header>
      {/* Your existing header content */}

      {/* Add company switcher */}
      <CompanySwitcher
        onManageClick={() => console.log('Manage companies')}
        onAddClick={() => console.log('Add company')}
      />

      {/* Your other header items */}
    </header>
  )
}
```

## Step 3: Use in Components (2 minutes)

Access company context in any component:

```tsx
import { useCompanyContext } from '@/contexts/CompanyContext'

function MyComponent() {
  const { activeCompany, activeCompanyId } = useCompanyContext()

  return (
    <div>
      <h1>Active Company: {activeCompany?.name}</h1>
      {/* Your component content */}
    </div>
  )
}
```

## That's It! 🎉

You now have:
- ✅ Company switching in header
- ✅ Active company context available everywhere
- ✅ Automatic `X-Company-Id` header on all API requests

## Next Steps

### View Company Tree
```tsx
import { CompanyTreeView } from '@/features/companies'

<CompanyTreeView
  onEdit={(id) => console.log('Edit', id)}
  onAddChild={(parentId) => console.log('Add child to', parentId)}
/>
```

### Enable Multi-Select Mode
```tsx
const { toggleMultiSelect, selectedCompanyIds, isMultiSelectMode } = useCompanyContext()

<Button onClick={toggleMultiSelect}>
  {isMultiSelectMode ? 'Disable' : 'Enable'} Multi-Select
</Button>

{isMultiSelectMode && (
  <p>Selected: {selectedCompanyIds.length} companies</p>
)}
```

### Check Permissions
```tsx
const { canManageCompany, hasRole } = useCompanyContext()

if (canManageCompany(companyId)) {
  // Show admin actions
}

if (hasRole(companyId, 'admin')) {
  // Admin-only features
}
```

### Create Complete Management Page
```tsx
import { CompanyManagementPage } from '@/features/companies'

// In your route
export const Route = createFileRoute('/companies')({
  component: CompanyManagementPage
})
```

## Common Patterns

### Pattern 1: Filter Data by Company
```tsx
const { selectedCompanyIds } = useCompanyContext()

const { data } = useQuery({
  queryKey: ['invoices', selectedCompanyIds],
  queryFn: () => getInvoices({ companyIds: selectedCompanyIds })
})
```

### Pattern 2: Show Company Name
```tsx
const { activeCompany } = useCompanyContext()
const { i18n } = useTranslation()
const isArabic = i18n.language === 'ar'

const name = isArabic
  ? activeCompany?.nameAr || activeCompany?.name
  : activeCompany?.name
```

### Pattern 3: Handle Loading State
```tsx
const { isLoading, activeCompany } = useCompanyContext()

if (isLoading) return <Skeleton />
if (!activeCompany) return <Alert>Please select a company</Alert>

return <YourComponent />
```

## Need Help?

- **Full Documentation:** [README.md](./README.md)
- **Integration Guide:** [INTEGRATION.md](./INTEGRATION.md)
- **Examples:** [examples/advanced-usage.tsx](./examples/advanced-usage.tsx)
- **Implementation Summary:** [/MULTI_COMPANY_IMPLEMENTATION.md](../../../MULTI_COMPANY_IMPLEMENTATION.md)

## Troubleshooting

**Q: CompanySwitcher shows "No Active Company"?**
A: Ensure CompanyProvider wraps your app and the backend returns accessible companies.

**Q: Company header not sent to API?**
A: Check that activeCompanyId is in localStorage. The API client automatically adds it.

**Q: Can't see manage/add buttons?**
A: Check permissions with `canManageCompany(companyId)`.

**Q: Multi-select not working?**
A: Call `toggleMultiSelect()` to enable multi-select mode first.

Happy coding! 🚀
