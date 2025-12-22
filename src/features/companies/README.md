# Multi-Company Support System

Complete implementation of multi-company support for the Traf3li dashboard, supporting hierarchical company structures, company switching, and consolidated views.

## 🏗️ Architecture

### Core Components

1. **CompanyService** (`/src/services/companyService.ts`)
   - CRUD operations for companies
   - Parent-child relationship management
   - User-company access control
   - Company switching

2. **CompanyContext** (`/src/contexts/CompanyContext.tsx`)
   - Global company state management
   - Active company tracking
   - Multi-select mode for consolidated views
   - Permission helpers

3. **React Query Hooks** (`/src/hooks/useCompanies.ts`)
   - `useCompanies` - Get all companies with filters
   - `useCompany` - Get single company
   - `useCompanyTree` - Get hierarchical tree
   - `useCreateCompany` - Create new company
   - `useUpdateCompany` - Update company
   - `useDeleteCompany` - Delete company
   - `useSwitchCompany` - Switch active company
   - And more...

4. **UI Components**
   - `CompanySwitcher` - Dropdown in header
   - `CompanyTreeView` - Hierarchical tree view
   - `CompanyManagementPage` - Full management page

### API Integration

All API requests automatically include the active company ID in the `X-Company-Id` header:

```typescript
// In /src/lib/api.ts
const activeCompanyId = localStorage.getItem('activeCompanyId')
if (activeCompanyId) {
  config.headers.set('X-Company-Id', activeCompanyId)
}
```

## 🚀 Quick Start

### 1. Wrap Your App with CompanyProvider

```tsx
import { CompanyProvider } from '@/contexts/CompanyContext'

function App() {
  return (
    <CompanyProvider>
      {/* Your app */}
    </CompanyProvider>
  )
}
```

### 2. Add CompanySwitcher to Header

```tsx
import { CompanySwitcher } from '@/features/companies'

function Header() {
  return (
    <header>
      {/* Other header content */}
      <CompanySwitcher
        onManageClick={() => navigate('/companies')}
        onAddClick={() => setShowAddDialog(true)}
      />
    </header>
  )
}
```

### 3. Use Company Context in Components

```tsx
import { useCompanyContext } from '@/contexts/CompanyContext'

function MyComponent() {
  const {
    activeCompany,
    activeCompanyId,
    selectedCompanyIds,
    isMultiSelectMode,
    switchCompany,
    canManageCompany,
  } = useCompanyContext()

  return (
    <div>
      <h1>Active Company: {activeCompany?.name}</h1>
      {isMultiSelectMode && (
        <p>Selected: {selectedCompanyIds.length} companies</p>
      )}
    </div>
  )
}
```

## 📋 Features

### Company Switcher

- **Single Select Mode**: Switch between companies
- **Multi-Select Mode**: Select multiple companies for consolidated views
- **Company Avatars**: Display company logos/initials
- **Status Badges**: Show company status (active/inactive/suspended)
- **Hierarchical Display**: Separate root and child companies
- **Search & Filter**: Quick company lookup
- **Permission-Based Actions**: Show/hide actions based on permissions

### Company Tree View

- **Hierarchical Display**: Parent-child relationships
- **Expand/Collapse**: Navigate complex structures
- **Inline Actions**: Edit, add child, delete
- **Company Stats**: User count, child count
- **Status Indicators**: Visual status badges
- **RTL Support**: Full Arabic/RTL support

### Multi-Select Mode

```tsx
const {
  isMultiSelectMode,
  selectedCompanyIds,
  toggleMultiSelect,
  selectCompany,
  deselectCompany,
  selectAllCompanies,
  clearSelectedCompanies,
} = useCompanyContext()

// Enable multi-select
toggleMultiSelect()

// Select companies
selectCompany('company-id-1')
selectCompany('company-id-2')

// Or select all
selectAllCompanies()

// Use selected companies in queries
const { data } = useQuery({
  queryKey: ['invoices', selectedCompanyIds],
  queryFn: () => getInvoices(selectedCompanyIds),
})
```

## 🎨 UI Components API

### CompanySwitcher

```tsx
<CompanySwitcher
  className="min-w-[250px]"
  onManageClick={() => navigate('/companies')}
  onAddClick={() => setShowAddDialog(true)}
  showManageButton={true}
  showAddButton={true}
/>
```

**Props:**
- `className?`: Additional CSS classes
- `onManageClick?`: Callback when "Manage Companies" is clicked
- `onAddClick?`: Callback when "Add Company" is clicked
- `showManageButton?`: Show/hide manage button (default: true)
- `showAddButton?`: Show/hide add button (default: true)

### CompanyTreeView

```tsx
<CompanyTreeView
  rootCompanyId="optional-root-id"
  onEdit={(id) => handleEdit(id)}
  onDelete={(id) => handleDelete(id)}
  onAddChild={(parentId) => handleAddChild(parentId)}
  canEdit={true}
  canDelete={true}
  canAddChild={true}
/>
```

**Props:**
- `rootCompanyId?`: Start tree from specific company
- `onEdit?`: Callback when edit is clicked
- `onDelete?`: Callback when delete is clicked
- `onAddChild?`: Callback when add child is clicked
- `canEdit?`: Enable/disable edit action (default: true)
- `canDelete?`: Enable/disable delete action (default: true)
- `canAddChild?`: Enable/disable add child action (default: true)
- `className?`: Additional CSS classes

## 🔒 Permissions & Access Control

### Check Company Access

```tsx
const {
  canAccessCompany,
  getCompanyAccess,
  hasRole,
  canManageCompany,
} = useCompanyContext()

// Check if user can access a company
if (canAccessCompany('company-id')) {
  // User has access
}

// Get user's access details
const access = getCompanyAccess('company-id')
// access.role: 'owner' | 'admin' | 'manager' | 'employee' | 'viewer'
// access.permissions: string[]
// access.canAccessChildren: boolean

// Check specific role
if (hasRole('company-id', 'admin')) {
  // User is admin
}

// Check if user can manage (owner or admin)
if (canManageCompany('company-id')) {
  // Show admin actions
}
```

### Grant/Revoke Access

```tsx
import {
  useGrantCompanyAccess,
  useRevokeCompanyAccess,
  useUpdateCompanyAccess,
} from '@/hooks/useCompanies'

const grantAccess = useGrantCompanyAccess()
const revokeAccess = useRevokeCompanyAccess()
const updateAccess = useUpdateCompanyAccess()

// Grant access
await grantAccess.mutateAsync({
  companyId: 'company-id',
  userId: 'user-id',
  data: {
    role: 'manager',
    permissions: ['read', 'write'],
    canAccessChildren: true,
    isDefault: false,
  },
})

// Revoke access
await revokeAccess.mutateAsync({
  companyId: 'company-id',
  userId: 'user-id',
})

// Update access
await updateAccess.mutateAsync({
  companyId: 'company-id',
  userId: 'user-id',
  data: { role: 'admin' },
})
```

## 🌐 RTL/Arabic Support

All components fully support RTL and Arabic:

```tsx
import { useTranslation } from 'react-i18next'

const { i18n } = useTranslation()
const isArabic = i18n.language === 'ar'

// Company names automatically use Arabic if available
const name = isArabic ? company.nameAr || company.name : company.name
```

## 📊 Data Structure

### Company

```typescript
interface Company {
  _id: string
  name: string
  nameAr?: string
  code?: string
  logo?: string
  parentCompanyId?: string | null
  level: number // 0 = root, 1 = child, etc.
  status: 'active' | 'inactive' | 'suspended'

  // Optional fields
  industry?: string
  taxId?: string
  commercialRegistration?: string
  address?: { street, city, country, postalCode }
  contact?: { email, phone, website }
  fiscalYearStart?: string
  currency?: string
  timezone?: string
  settings?: {
    allowConsolidatedView?: boolean
    allowCrossCompanyTransactions?: boolean
  }

  // Computed
  childCompanies?: Company[]
  parentCompany?: Company
  userCount?: number
  employeeCount?: number
}
```

### User Company Access

```typescript
interface UserCompanyAccess {
  _id: string
  userId: string
  companyId: string
  role: 'owner' | 'admin' | 'manager' | 'employee' | 'viewer'
  permissions?: string[]
  canAccessChildren?: boolean
  canAccessParent?: boolean
  isDefault?: boolean
  status: 'active' | 'inactive' | 'pending'
}
```

## 🔄 Company Switching

```tsx
import { useSwitchCompany } from '@/hooks/useCompanies'

const switchCompany = useSwitchCompany()

// Switch to different company
await switchCompany.mutateAsync('new-company-id')

// This will:
// 1. Update active company in context
// 2. Invalidate all queries (refresh data)
// 3. Update localStorage
// 4. Show success toast
// 5. Add X-Company-Id header to all subsequent requests
```

## 📝 Example: Complete Integration

```tsx
import { CompanyProvider, useCompanyContext } from '@/contexts/CompanyContext'
import { CompanySwitcher } from '@/features/companies'
import { useInvoices } from '@/hooks/useInvoices'

// 1. Wrap app with provider
function App() {
  return (
    <CompanyProvider>
      <MainApp />
    </CompanyProvider>
  )
}

// 2. Use company context in components
function InvoicesList() {
  const {
    activeCompanyId,
    selectedCompanyIds,
    isMultiSelectMode,
  } = useCompanyContext()

  // Fetch invoices for selected companies
  const { data: invoices } = useInvoices({
    companyIds: isMultiSelectMode ? selectedCompanyIds : [activeCompanyId],
  })

  return (
    <div>
      <CompanySwitcher />
      {/* Render invoices */}
    </div>
  )
}
```

## 🧪 Testing

```typescript
// Mock company context for testing
const mockCompanyContext = {
  activeCompanyId: 'company-1',
  activeCompany: { _id: 'company-1', name: 'Test Co' },
  selectedCompanyIds: ['company-1'],
  isMultiSelectMode: false,
  // ... other context values
}

// Wrap component with provider
<CompanyProvider>
  <Component />
</CompanyProvider>
```

## 🚀 Backend Requirements

The backend must implement these endpoints:

```
GET    /api/companies                    - List companies
GET    /api/companies/:id                - Get company
GET    /api/companies/tree               - Get tree
GET    /api/companies/:id/children       - Get children
POST   /api/companies                    - Create company
PUT    /api/companies/:id                - Update company
DELETE /api/companies/:id                - Delete company
PUT    /api/companies/:id/move           - Move to new parent

GET    /api/companies/user/accessible    - User's accessible companies
GET    /api/companies/active             - Active company
POST   /api/companies/switch             - Switch company

GET    /api/companies/:id/access         - Get access list
POST   /api/companies/:id/access         - Grant access
PUT    /api/companies/:id/access/:userId - Update access
DELETE /api/companies/:id/access/:userId - Revoke access
```

All endpoints (except auth) should:
1. Accept `X-Company-Id` header
2. Filter data by company context
3. Validate company access permissions

## 📚 Additional Resources

- See `company-management-page.tsx` for complete example
- Check `CompanyContext.tsx` for all available context methods
- Review `useCompanies.ts` for all available hooks
- Refer to `companyService.ts` for service API

## 🎯 Best Practices

1. **Always use CompanyContext**: Don't access localStorage directly
2. **Check permissions**: Use `canManageCompany` before showing admin actions
3. **Handle multi-select**: Components should support both single and multi-select modes
4. **Invalidate queries**: After company switch, invalidate relevant queries
5. **RTL support**: Always test components in both Arabic and English
6. **Error handling**: Handle company access errors gracefully
7. **Loading states**: Show loading indicators during company operations

## 🐛 Troubleshooting

**Company header not sent?**
- Check that `activeCompanyId` is in localStorage
- Ensure CompanyProvider wraps your app
- Verify API interceptor is configured

**Can't switch companies?**
- Check user has access to target company
- Verify backend `/companies/switch` endpoint
- Check console for errors

**Tree not loading?**
- Verify `/companies/tree` endpoint returns correct structure
- Check company relationships (parentCompanyId)
- Ensure companies have proper `level` field
