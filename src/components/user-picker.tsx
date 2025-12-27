import * as React from 'react'
import { Check, ChevronsUpDown, X } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from '@/components/ui/command'
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import { useUsers } from '@/hooks/useUsers'
import type { User } from '@/services/usersService'

export interface UserPickerProps {
  value?: string | string[]
  onChange: (value: string | string[]) => void
  mode?: 'single' | 'multi'
  placeholder?: string
  disabled?: boolean
  className?: string
  users?: User[]
  fetchUsers?: boolean
}

export function UserPicker({
  value,
  onChange,
  mode = 'single',
  placeholder,
  disabled = false,
  className,
  users: providedUsers,
  fetchUsers = false,
}: UserPickerProps) {
  const { t } = useTranslation()
  const [open, setOpen] = React.useState(false)
  const [search, setSearch] = React.useState('')

  // Fetch users from API if needed
  // Only fetch if fetchUsers is true and no users are provided
  const fetchParams = fetchUsers && !providedUsers
    ? {
        search: search || undefined,
        pageSize: 50,
      }
    : undefined

  const { data: fetchedUsersData, isLoading } = useUsers(fetchParams)

  // Use provided users or fetched users
  const users = React.useMemo(() => {
    if (providedUsers) return providedUsers
    if (fetchedUsersData?.users) return fetchedUsersData.users
    return []
  }, [providedUsers, fetchedUsersData])

  // Get selected user(s)
  const selectedUsers = React.useMemo(() => {
    if (!value) return []
    const ids = Array.isArray(value) ? value : [value]
    return users.filter((user) => ids.includes(user._id))
  }, [value, users])

  // Handle selection
  const handleSelect = (userId: string) => {
    if (mode === 'single') {
      onChange(userId === value ? '' : userId)
      setOpen(false)
    } else {
      const currentValue = Array.isArray(value) ? value : value ? [value] : []
      const newValue = currentValue.includes(userId)
        ? currentValue.filter((id) => id !== userId)
        : [...currentValue, userId]
      onChange(newValue)
    }
  }

  // Handle removing a user (multi-select only)
  const handleRemove = (userId: string, e: React.MouseEvent) => {
    e.stopPropagation()
    if (mode === 'multi' && Array.isArray(value)) {
      onChange(value.filter((id) => id !== userId))
    }
  }

  // Get user display name
  const getUserDisplayName = (user: User) => {
    const fullName = [user.firstName, user.lastName].filter(Boolean).join(' ')
    return fullName || user.username || user.email
  }

  // Get user initials for avatar fallback
  const getUserInitials = (user: User) => {
    if (user.firstName && user.lastName) {
      return `${user.firstName[0]}${user.lastName[0]}`.toUpperCase()
    }
    if (user.username) {
      return user.username.slice(0, 2).toUpperCase()
    }
    return user.email.slice(0, 2).toUpperCase()
  }

  // Check if a user is selected
  const isSelected = (userId: string) => {
    if (Array.isArray(value)) {
      return value.includes(userId)
    }
    return value === userId
  }

  // Default placeholders
  const defaultPlaceholder =
    mode === 'single'
      ? t('userPicker.selectUser')
      : t('userPicker.selectUsers')

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={open}
          disabled={disabled}
          className={cn(
            'h-auto min-h-9 w-full justify-between',
            !selectedUsers.length && 'text-muted-foreground',
            className
          )}
        >
          <div className="flex flex-1 flex-wrap items-center gap-1">
            {selectedUsers.length === 0 ? (
              <span>{placeholder || defaultPlaceholder}</span>
            ) : mode === 'single' ? (
              <div className="flex items-center gap-2">
                <Avatar className="size-5">
                  <AvatarImage src={selectedUsers[0].image} />
                  <AvatarFallback className="text-[10px]">
                    {getUserInitials(selectedUsers[0])}
                  </AvatarFallback>
                </Avatar>
                <span>{getUserDisplayName(selectedUsers[0])}</span>
              </div>
            ) : (
              selectedUsers.map((user) => (
                <Badge
                  key={user._id}
                  variant="secondary"
                  className="gap-1 pe-1.5 ps-1"
                >
                  <Avatar className="size-4">
                    <AvatarImage src={user.image} />
                    <AvatarFallback className="text-[8px]">
                      {getUserInitials(user)}
                    </AvatarFallback>
                  </Avatar>
                  <span>{getUserDisplayName(user)}</span>
                  <button
                    type="button"
                    onClick={(e) => handleRemove(user._id, e)}
                    className="hover:bg-secondary-foreground/20 rounded-full p-0.5"
                  >
                    <X className="size-3" />
                  </button>
                </Badge>
              ))
            )}
          </div>
          <ChevronsUpDown className="ms-2 size-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-[--radix-popover-trigger-width] p-0" align="start">
        <Command shouldFilter={!fetchUsers}>
          <CommandInput
            placeholder={t('userPicker.search')}
            value={search}
            onValueChange={setSearch}
          />
          <CommandList>
            <CommandEmpty>
              {isLoading
                ? t('userPicker.loading')
                : t('userPicker.noResults')}
            </CommandEmpty>
            <CommandGroup>
              {users.map((user) => (
                <CommandItem
                  key={user._id}
                  value={`${user._id}-${getUserDisplayName(user)}`}
                  onSelect={() => handleSelect(user._id)}
                  className="gap-2"
                >
                  <div
                    className={cn(
                      'border-primary flex size-4 items-center justify-center rounded-sm border',
                      isSelected(user._id)
                        ? 'bg-primary text-primary-foreground'
                        : 'opacity-50 [&_svg]:invisible'
                    )}
                  >
                    <Check className="size-3" />
                  </div>
                  <Avatar className="size-6">
                    <AvatarImage src={user.image} />
                    <AvatarFallback className="text-[10px]">
                      {getUserInitials(user)}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex flex-1 flex-col">
                    <span className="text-sm">{getUserDisplayName(user)}</span>
                    {user.email && (
                      <span className="text-muted-foreground text-xs">
                        {user.email}
                      </span>
                    )}
                  </div>
                  {user.role && (
                    <Badge variant="outline" className="text-xs">
                      {user.role}
                    </Badge>
                  )}
                </CommandItem>
              ))}
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  )
}
