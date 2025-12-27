# UserPicker Component

A reusable user picker component with search, single/multi-select modes, and RTL support for Arabic.

## Features

- ✅ Single and multi-select modes
- ✅ Search users by name, username, or email
- ✅ Avatar display with fallback initials
- ✅ Dropdown interface using Popover and Command components
- ✅ Support for pre-loaded users or API fetching
- ✅ RTL layout support for Arabic
- ✅ Fully translated (Arabic/English)
- ✅ Loading states
- ✅ Disabled state support

## Usage

### Basic Single Select

```tsx
import { UserPicker } from '@/components/user-picker'
import { useState } from 'react'

function MyComponent() {
  const [selectedUser, setSelectedUser] = useState<string>('')

  return (
    <UserPicker
      value={selectedUser}
      onChange={setSelectedUser}
      mode="single"
      fetchUsers={true}
    />
  )
}
```

### Multi-Select Mode

```tsx
import { UserPicker } from '@/components/user-picker'
import { useState } from 'react'

function MyComponent() {
  const [selectedUsers, setSelectedUsers] = useState<string[]>([])

  return (
    <UserPicker
      value={selectedUsers}
      onChange={setSelectedUsers}
      mode="multi"
      fetchUsers={true}
      placeholder="Select team members"
    />
  )
}
```

### With Pre-loaded Users

```tsx
import { UserPicker } from '@/components/user-picker'
import { useState } from 'react'
import type { User } from '@/services/usersService'

function MyComponent() {
  const [selectedUser, setSelectedUser] = useState<string>('')

  // Your pre-loaded users
  const users: User[] = [
    {
      _id: '1',
      username: 'john_doe',
      firstName: 'John',
      lastName: 'Doe',
      email: 'john@example.com',
      phone: '+1234567890',
      image: 'https://example.com/avatar.jpg',
      role: 'admin',
      status: 'active',
      createdAt: '2024-01-01',
      updatedAt: '2024-01-01',
    },
    // ... more users
  ]

  return (
    <UserPicker
      value={selectedUser}
      onChange={setSelectedUser}
      mode="single"
      users={users}
    />
  )
}
```

### With Form (React Hook Form)

```tsx
import { UserPicker } from '@/components/user-picker'
import { useForm, Controller } from 'react-hook-form'

interface FormData {
  assignedTo: string
  teamMembers: string[]
}

function MyForm() {
  const { control, handleSubmit } = useForm<FormData>()

  const onSubmit = (data: FormData) => {
    console.log('Assigned to:', data.assignedTo)
    console.log('Team members:', data.teamMembers)
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      {/* Single user picker */}
      <Controller
        name="assignedTo"
        control={control}
        render={({ field }) => (
          <UserPicker
            value={field.value}
            onChange={field.value}
            mode="single"
            fetchUsers={true}
            placeholder="Assign to user"
          />
        )}
      />

      {/* Multi user picker */}
      <Controller
        name="teamMembers"
        control={control}
        render={({ field }) => (
          <UserPicker
            value={field.value}
            onChange={field.onChange}
            mode="multi"
            fetchUsers={true}
            placeholder="Select team members"
          />
        )}
      />

      <button type="submit">Submit</button>
    </form>
  )
}
```

## Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `value` | `string \| string[]` | - | Selected user ID(s) |
| `onChange` | `(value: string \| string[]) => void` | - | Callback when selection changes |
| `mode` | `'single' \| 'multi'` | `'single'` | Selection mode |
| `placeholder` | `string` | Auto-translated | Placeholder text |
| `disabled` | `boolean` | `false` | Disable the picker |
| `className` | `string` | - | Additional CSS classes |
| `users` | `User[]` | - | Pre-loaded users array |
| `fetchUsers` | `boolean` | `false` | Whether to fetch users from API |

## User Interface

The `User` type from `@/services/usersService`:

```typescript
interface User {
  _id: string
  username: string
  firstName?: string
  lastName?: string
  email: string
  phone: string
  image?: string
  role?: string
  status?: string
  firmRole?: string
  firmStatus?: string
  createdAt: string
  updatedAt: string
}
```

## Styling

The component uses Tailwind CSS and follows the existing UI patterns. It supports:

- RTL layout (automatically handled via `ms-*` and `me-*` utilities)
- Dark mode (through existing theme system)
- Responsive design

## Accessibility

- Proper ARIA attributes (`role="combobox"`, `aria-expanded`)
- Keyboard navigation support (via Command component)
- Focus management
- Screen reader friendly

## Translations

The component uses the following translation keys:

```json
{
  "userPicker": {
    "selectUser": "Select user",
    "selectUsers": "Select users",
    "search": "Search users...",
    "loading": "Loading...",
    "noResults": "No users found"
  }
}
```

These are already added to:
- `/src/locales/en/translation.json`
- `/src/locales/ar/translation.json`

## Dependencies

- `@/components/ui/button`
- `@/components/ui/command`
- `@/components/ui/popover`
- `@/components/ui/avatar`
- `@/components/ui/badge`
- `@/hooks/useUsers`
- `react-i18next`
- `lucide-react`
