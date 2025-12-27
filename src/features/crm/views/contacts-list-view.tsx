import { useState, useMemo } from 'react'
import { useTranslation } from 'react-i18next'
import { Link } from '@tanstack/react-router'
import {
  MoreHorizontal,
  Plus,
  Eye,
  Pencil,
  Trash2,
  Link2,
  UserPlus,
  Building2,
  User,
  Users,
  Mail,
  Phone,
  Smartphone,
  AlertCircle,
} from 'lucide-react'
import {
  getCoreRowModel,
  getFacetedRowModel,
  getFacetedUniqueValues,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  useReactTable,
  type ColumnDef,
  type ColumnFiltersState,
  type SortingState,
  type VisibilityState,
} from '@tanstack/react-table'
import { Button } from '@/components/ui/button'
import { Checkbox } from '@/components/ui/checkbox'
import { Badge } from '@/components/ui/badge'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { Skeleton } from '@/components/ui/skeleton'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { DataTable, DataTableColumnHeader, DataTableToolbar } from '@/components/data-table'
import { DataTableBulkActions } from '@/components/data-table/bulk-actions'
import { StatusBadge } from '@/components/status-badge'
import { useContacts, useDeleteContact } from '@/hooks/useContacts'
import type { Contact } from '@/services/contactService'
import { ROUTES } from '@/constants/routes'
import { Switch } from '@/components/ui/switch'
import { Label } from '@/components/ui/label'
import { cn } from '@/lib/utils'

// Contact type icons
const contactTypeIcons = {
  individual: User,
  organization: Building2,
  court: Building2,
  attorney: Users,
  expert: Users,
  government: Building2,
  other: Users,
} as const

// Contact role/category options for filter
const contactRoles = [
  { label: 'Client Contact', value: 'client_contact' },
  { label: 'Opposing Party', value: 'opposing_party' },
  { label: 'Opposing Counsel', value: 'opposing_counsel' },
  { label: 'Witness', value: 'witness' },
  { label: 'Expert Witness', value: 'expert_witness' },
  { label: 'Judge', value: 'judge' },
  { label: 'Court Clerk', value: 'court_clerk' },
  { label: 'Mediator', value: 'mediator' },
  { label: 'Arbitrator', value: 'arbitrator' },
  { label: 'Referral Source', value: 'referral_source' },
  { label: 'Vendor', value: 'vendor' },
  { label: 'Other', value: 'other' },
]

// Contact type options for filter
const contactTypes = [
  { label: 'Individual', value: 'individual', icon: User },
  { label: 'Organization', value: 'organization', icon: Building2 },
  { label: 'Court', value: 'court', icon: Building2 },
  { label: 'Attorney', value: 'attorney', icon: Users },
  { label: 'Expert', value: 'expert', icon: Users },
  { label: 'Government', value: 'government', icon: Building2 },
  { label: 'Other', value: 'other', icon: Users },
]

// Contact status options for filter
const contactStatuses = [
  { label: 'Active', value: 'active' },
  { label: 'Inactive', value: 'inactive' },
  { label: 'Archived', value: 'archived' },
  { label: 'Deceased', value: 'deceased' },
]

// Conflict status options for filter
const conflictStatuses = [
  { label: 'Not Checked', value: 'not_checked' },
  { label: 'Clear', value: 'clear' },
  { label: 'Potential Conflict', value: 'potential_conflict' },
  { label: 'Confirmed Conflict', value: 'confirmed_conflict' },
]

export function ContactsListView() {
  const { t, i18n } = useTranslation()
  const isRTL = i18n.language === 'ar'

  // Table state
  const [rowSelection, setRowSelection] = useState({})
  const [columnVisibility, setColumnVisibility] = useState<VisibilityState>({})
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([])
  const [sorting, setSorting] = useState<SortingState>([])
  const [pagination, setPagination] = useState({ pageIndex: 0, pageSize: 10 })

  // Filter state
  const [vipOnly, setVipOnly] = useState(false)

  // Build filters for API
  const filters = useMemo(() => {
    const typeFilter = columnFilters.find((f) => f.id === 'type')
    const roleFilter = columnFilters.find((f) => f.id === 'role')
    const statusFilter = columnFilters.find((f) => f.id === 'status')
    const conflictFilter = columnFilters.find((f) => f.id === 'conflictStatus')
    const searchFilter = columnFilters.find((f) => f.id === 'global')

    return {
      type: typeFilter?.value as string | undefined,
      role: roleFilter?.value as string | undefined,
      status: statusFilter?.value as string | undefined,
      conflictStatus: conflictFilter?.value as string | undefined,
      search: searchFilter?.value as string | undefined,
      isVIP: vipOnly || undefined,
      page: pagination.pageIndex + 1,
      limit: pagination.pageSize,
      sortBy: sorting[0]?.id,
      sortOrder: sorting[0]?.desc ? 'desc' : 'asc',
    }
  }, [columnFilters, vipOnly, pagination, sorting])

  // Fetch contacts
  const { data: contactsData, isLoading, isError, error } = useContacts(filters)
  const { mutate: deleteContact } = useDeleteContact()

  const contacts = contactsData?.data || []
  const totalCount = contactsData?.total || 0

  // Define columns
  const columns = useMemo<ColumnDef<Contact>[]>(() => [
    {
      id: 'select',
      header: ({ table }) => (
        <Checkbox
          checked={
            table.getIsAllPageRowsSelected() ||
            (table.getIsSomePageRowsSelected() && 'indeterminate')
          }
          onCheckedChange={(value) => table.toggleAllPageRowsSelected(!!value)}
          aria-label={t('dataTable.selectAll')}
          className="translate-y-[2px]"
        />
      ),
      cell: ({ row }) => (
        <Checkbox
          checked={row.getIsSelected()}
          onCheckedChange={(value) => row.toggleSelected(!!value)}
          aria-label={t('dataTable.selectRow')}
          className="translate-y-[2px]"
        />
      ),
      enableSorting: false,
      enableHiding: false,
    },
    {
      id: 'fullName',
      accessorFn: (row) => {
        const firstName = row.firstName || ''
        const lastName = row.lastName || ''
        return `${firstName} ${lastName}`.trim() || '-'
      },
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title={isRTL ? 'الاسم' : 'Name'} />
      ),
      cell: ({ row }) => {
        const firstName = row.original.firstName || ''
        const lastName = row.original.lastName || ''
        const fullName = `${firstName} ${lastName}`.trim() || '-'
        const initials = `${firstName[0] || ''}${lastName[0] || ''}`.toUpperCase() || '?'
        const vip = row.original.vipStatus

        return (
          <div className="flex items-center gap-3">
            <Avatar className="h-8 w-8">
              <AvatarFallback className="text-xs">{initials}</AvatarFallback>
            </Avatar>
            <div className="flex flex-col">
              <div className="flex items-center gap-2">
                <span className="font-medium">{fullName}</span>
                {vip && (
                  <Badge variant="outline" className="bg-yellow-50 text-yellow-700 border-yellow-300 text-[10px] px-1">
                    VIP
                  </Badge>
                )}
              </div>
            </div>
          </div>
        )
      },
      enableSorting: true,
    },
    {
      accessorKey: 'company',
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title={isRTL ? 'الشركة' : 'Company'} />
      ),
      cell: ({ row }) => {
        const company = row.getValue('company') as string
        if (!company) return <span className="text-muted-foreground">-</span>
        return (
          <div className="flex items-center gap-2">
            <Building2 className="h-4 w-4 text-muted-foreground" />
            <span>{company}</span>
          </div>
        )
      },
      enableSorting: true,
    },
    {
      accessorKey: 'email',
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title={isRTL ? 'البريد الإلكتروني' : 'Email'} />
      ),
      cell: ({ row }) => {
        const email = row.getValue('email') as string
        if (!email) return <span className="text-muted-foreground">-</span>
        return (
          <div className="flex items-center gap-2">
            <Mail className="h-4 w-4 text-muted-foreground" />
            <span className="text-sm" dir="ltr">{email}</span>
          </div>
        )
      },
      enableSorting: true,
    },
    {
      accessorKey: 'phone',
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title={isRTL ? 'الهاتف' : 'Phone'} />
      ),
      cell: ({ row }) => {
        const phone = row.getValue('phone') as string
        if (!phone) return <span className="text-muted-foreground">-</span>
        return (
          <div className="flex items-center gap-2">
            <Phone className="h-4 w-4 text-muted-foreground" />
            <span className="font-medium" dir="ltr">{phone}</span>
          </div>
        )
      },
    },
    {
      accessorKey: 'alternatePhone',
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title={isRTL ? 'الجوال' : 'Mobile'} />
      ),
      cell: ({ row }) => {
        const mobile = row.getValue('alternatePhone') as string
        if (!mobile) return <span className="text-muted-foreground">-</span>
        return (
          <div className="flex items-center gap-2">
            <Smartphone className="h-4 w-4 text-muted-foreground" />
            <span className="font-medium" dir="ltr">{mobile}</span>
          </div>
        )
      },
    },
    {
      id: 'type',
      accessorFn: (row) => row.type || 'individual',
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title={isRTL ? 'النوع' : 'Type'} />
      ),
      cell: ({ row }) => {
        const typeValue = (row.original.type || 'individual') as keyof typeof contactTypeIcons
        const Icon = contactTypeIcons[typeValue] || User
        const typeLabel = contactTypes.find((t) => t.value === typeValue)?.label || typeValue

        return (
          <div className="flex items-center gap-2">
            <Icon className="h-4 w-4 text-muted-foreground" />
            <span className="capitalize">{typeLabel}</span>
          </div>
        )
      },
      enableSorting: true,
      filterFn: (row, id, value: string[]) => {
        const typeValue = row.original.type || 'individual'
        return value.includes(typeValue)
      },
    },
    {
      id: 'role',
      accessorFn: (row) => row.primaryRole || row.category,
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title={isRTL ? 'الدور' : 'Role'} />
      ),
      cell: ({ row }) => {
        const roleValue = row.original.primaryRole || row.original.category
        if (!roleValue) return <span className="text-muted-foreground">-</span>
        const roleLabel = contactRoles.find((r) => r.value === roleValue)?.label || roleValue
        return <span>{roleLabel}</span>
      },
      enableSorting: true,
      filterFn: (row, id, value: string[]) => {
        const roleValue = row.original.primaryRole || row.original.category
        return roleValue ? value.includes(roleValue) : false
      },
    },
    {
      id: 'conflictStatus',
      accessorFn: (row) => row.conflictCheckStatus || 'not_checked',
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title={isRTL ? 'حالة التعارض' : 'Conflict Status'} />
      ),
      cell: ({ row }) => {
        const status = (row.original.conflictCheckStatus || 'not_checked') as string
        return <StatusBadge status={status} type="conflict" />
      },
      enableSorting: true,
      filterFn: (row, id, value: string[]) => {
        const status = row.original.conflictCheckStatus || 'not_checked'
        return value.includes(status)
      },
    },
    {
      accessorKey: 'tags',
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title={isRTL ? 'الوسوم' : 'Tags'} />
      ),
      cell: ({ row }) => {
        const tags = row.getValue('tags') as string[] | undefined
        if (!tags || tags.length === 0) return <span className="text-muted-foreground">-</span>
        return (
          <div className="flex flex-wrap gap-1">
            {tags.slice(0, 2).map((tag, i) => (
              <Badge key={i} variant="outline" className="text-xs">
                {tag}
              </Badge>
            ))}
            {tags.length > 2 && (
              <Badge variant="outline" className="text-xs">
                +{tags.length - 2}
              </Badge>
            )}
          </div>
        )
      },
    },
    {
      accessorKey: 'updatedAt',
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title={isRTL ? 'آخر نشاط' : 'Last Activity'} />
      ),
      cell: ({ row }) => {
        const date = row.getValue('updatedAt') as string
        if (!date) return <span className="text-muted-foreground">-</span>
        return (
          <span className="text-sm text-muted-foreground">
            {new Date(date).toLocaleDateString(isRTL ? 'ar-SA' : 'en-US')}
          </span>
        )
      },
      enableSorting: true,
    },
    {
      id: 'actions',
      cell: ({ row }) => {
        const contact = row.original

        return (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="ghost"
                className="flex h-8 w-8 p-0 data-[state=open]:bg-muted"
              >
                <MoreHorizontal className="h-4 w-4" />
                <span className="sr-only">{isRTL ? 'الإجراءات' : 'Actions'}</span>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-[160px]">
              <DropdownMenuItem asChild>
                <Link to={ROUTES.dashboard.contacts.detail(contact._id)}>
                  <Eye className="me-2 h-4 w-4" />
                  {isRTL ? 'عرض' : 'View'}
                </Link>
              </DropdownMenuItem>
              <DropdownMenuItem asChild>
                <Link to={`${ROUTES.dashboard.contacts.detail(contact._id)}/edit`}>
                  <Pencil className="me-2 h-4 w-4" />
                  {isRTL ? 'تعديل' : 'Edit'}
                </Link>
              </DropdownMenuItem>
              <DropdownMenuItem>
                <Link2 className="me-2 h-4 w-4" />
                {isRTL ? 'ربط بقضية' : 'Link to Case'}
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                onClick={() => {
                  if (confirm(isRTL ? 'هل أنت متأكد من حذف هذا جهة الاتصال؟' : 'Are you sure you want to delete this contact?')) {
                    deleteContact(contact._id)
                  }
                }}
                className="text-destructive focus:text-destructive"
              >
                <Trash2 className="me-2 h-4 w-4" />
                {isRTL ? 'حذف' : 'Delete'}
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        )
      },
    },
  ], [t, isRTL, deleteContact])

  // Create table instance
  const table = useReactTable({
    data: contacts,
    columns,
    state: {
      sorting,
      columnVisibility,
      rowSelection,
      columnFilters,
      pagination,
    },
    enableRowSelection: true,
    onRowSelectionChange: setRowSelection,
    onSortingChange: setSorting,
    onColumnFiltersChange: setColumnFilters,
    onColumnVisibilityChange: setColumnVisibility,
    onPaginationChange: setPagination,
    getCoreRowModel: getCoreRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFacetedRowModel: getFacetedRowModel(),
    getFacetedUniqueValues: getFacetedUniqueValues(),
    manualPagination: true,
    pageCount: Math.ceil(totalCount / pagination.pageSize),
  })

  // Filter options for toolbar
  const filterOptions = useMemo(() => [
    {
      columnId: 'type',
      title: isRTL ? 'النوع' : 'Type',
      options: contactTypes.map((type) => ({
        label: type.label,
        value: type.value,
        icon: type.icon,
      })),
    },
    {
      columnId: 'role',
      title: isRTL ? 'الدور' : 'Role',
      options: contactRoles.map((role) => ({
        label: role.label,
        value: role.value,
      })),
    },
    {
      columnId: 'status',
      title: isRTL ? 'الحالة' : 'Status',
      options: contactStatuses.map((status) => ({
        label: status.label,
        value: status.value,
      })),
    },
    {
      columnId: 'conflictStatus',
      title: isRTL ? 'حالة التعارض' : 'Conflict Status',
      options: conflictStatuses.map((status) => ({
        label: status.label,
        value: status.value,
      })),
    },
  ], [isRTL])

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-navy">
            {isRTL ? 'جهات الاتصال' : 'Contacts'}
          </h1>
          <p className="text-slate-500 mt-1">
            {isRTL ? 'إدارة جهات الاتصال والعلاقات' : 'Manage contacts and relationships'}
          </p>
        </div>
        <Button asChild className="bg-emerald-500 hover:bg-emerald-600 rounded-xl">
          <Link to={ROUTES.dashboard.contacts.new}>
            <Plus className="h-4 w-4 ms-2" />
            {isRTL ? 'جهة اتصال جديدة' : 'New Contact'}
          </Link>
        </Button>
      </div>

      {/* VIP Filter Toggle */}
      <div className="bg-white rounded-2xl p-4 border border-slate-100 shadow-sm">
        <div className="flex items-center gap-4">
          <div className="flex items-center space-x-2 space-x-reverse">
            <Switch
              id="vip-filter"
              checked={vipOnly}
              onCheckedChange={setVipOnly}
            />
            <Label htmlFor="vip-filter" className="cursor-pointer">
              {isRTL ? 'VIP فقط' : 'VIP Only'}
            </Label>
          </div>
        </div>
      </div>

      {/* Data Table */}
      <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
        {isLoading ? (
          <div className="p-6 space-y-4">
            {[1, 2, 3, 4, 5].map((i) => (
              <div key={i} className="flex items-center gap-4">
                <Skeleton className="h-10 w-10 rounded-full" />
                <div className="flex-1 space-y-2">
                  <Skeleton className="h-4 w-1/3" />
                  <Skeleton className="h-3 w-1/2" />
                </div>
                <Skeleton className="h-6 w-20" />
              </div>
            ))}
          </div>
        ) : isError ? (
          <div className="p-12 text-center">
            <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-slate-900 mb-1">
              {isRTL ? 'فشل تحميل جهات الاتصال' : 'Failed to load contacts'}
            </h3>
            <p className="text-slate-500 mb-4">
              {error?.message || (isRTL ? 'حدث خطأ في الخادم' : 'A server error occurred')}
            </p>
          </div>
        ) : contacts.length === 0 ? (
          <div className="p-12 text-center">
            <UserPlus className="h-12 w-12 text-slate-300 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-slate-900 mb-1">
              {isRTL ? 'لا توجد جهات اتصال' : 'No contacts found'}
            </h3>
            <p className="text-slate-500 mb-4">
              {isRTL ? 'ابدأ بإضافة جهة اتصال جديدة' : 'Get started by adding a new contact'}
            </p>
            <Button asChild className="bg-emerald-500 hover:bg-emerald-600 rounded-xl">
              <Link to={ROUTES.dashboard.contacts.new}>
                <Plus className="h-4 w-4 ms-2" />
                {isRTL ? 'إضافة جهة اتصال' : 'Add Contact'}
              </Link>
            </Button>
          </div>
        ) : (
          <div className="p-6 space-y-4">
            <DataTableToolbar
              table={table}
              searchKey="fullName"
              searchPlaceholder={isRTL ? 'البحث عن جهات الاتصال...' : 'Search contacts...'}
              filters={filterOptions}
            />

            <DataTableBulkActions table={table} entityName={isRTL ? 'جهة اتصال' : 'contact'}>
              <Button
                variant="destructive"
                size="sm"
                onClick={() => {
                  const selectedIds = table.getFilteredSelectedRowModel().rows.map((row) => row.original._id)
                  if (confirm(isRTL ? `هل أنت متأكد من حذف ${selectedIds.length} جهة اتصال؟` : `Delete ${selectedIds.length} contact(s)?`)) {
                    // TODO: Implement bulk delete
                    console.log('Bulk delete:', selectedIds)
                  }
                }}
              >
                <Trash2 className="me-2 h-4 w-4" />
                {isRTL ? 'حذف' : 'Delete'}
              </Button>
            </DataTableBulkActions>

            <DataTable table={table} />
          </div>
        )}
      </div>
    </div>
  )
}
