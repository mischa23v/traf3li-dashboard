import { useState, useMemo } from 'react'
import { useTranslation } from 'react-i18next'
import { Link } from '@tanstack/react-router'
import {
  MoreHorizontal,
  Plus,
  Eye,
  Pencil,
  Trash2,
  Copy,
  BarChart3,
  Pause,
  Play,
  Search as SearchIcon,
  AlertCircle,
  TrendingUp,
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
import { Skeleton } from '@/components/ui/skeleton'
import { Input } from '@/components/ui/input'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { DataTable, DataTableColumnHeader, DataTableToolbar } from '@/components/data-table'
import { DataTableBulkActions } from '@/components/data-table/bulk-actions'
import { DataTableFacetedFilter } from '@/components/data-table/faceted-filter'
import { StatusBadge } from '@/components/status-badge'
import { UserPicker } from '@/components/user-picker'
import { DateRangePicker } from '@/components/date-range-picker'
import {
  useCampaigns,
  useDeleteCampaign,
  useDuplicateCampaign,
  usePauseCampaign,
  useResumeCampaign,
} from '@/hooks/useCampaigns'
import type { Campaign, CampaignType, CampaignStatus } from '@/types/crm-extended'
import { ROUTES } from '@/constants/routes'
import { cn } from '@/lib/utils'

// Campaign type options
const campaignTypes: { label: string; labelAr: string; value: CampaignType }[] = [
  { label: 'Email', labelAr: 'بريد إلكتروني', value: 'email' },
  { label: 'Social Media', labelAr: 'وسائل التواصل', value: 'social' },
  { label: 'Event', labelAr: 'حدث', value: 'event' },
  { label: 'Referral', labelAr: 'إحالة', value: 'referral' },
  { label: 'Ads', labelAr: 'إعلانات', value: 'ads' },
  { label: 'Other', labelAr: 'أخرى', value: 'other' },
]

// Campaign status options
const campaignStatuses: { label: string; labelAr: string; value: CampaignStatus }[] = [
  { label: 'Draft', labelAr: 'مسودة', value: 'draft' },
  { label: 'Scheduled', labelAr: 'مجدولة', value: 'scheduled' },
  { label: 'Active', labelAr: 'نشطة', value: 'active' },
  { label: 'Paused', labelAr: 'متوقفة مؤقتاً', value: 'paused' },
  { label: 'Completed', labelAr: 'مكتملة', value: 'completed' },
  { label: 'Cancelled', labelAr: 'ملغاة', value: 'cancelled' },
]

// Common channel options (can be customized based on type)
const channelOptions = [
  { label: 'Email', value: 'email' },
  { label: 'SMS', value: 'sms' },
  { label: 'WhatsApp', value: 'whatsapp' },
  { label: 'Facebook', value: 'facebook' },
  { label: 'Twitter', value: 'twitter' },
  { label: 'LinkedIn', value: 'linkedin' },
  { label: 'Instagram', value: 'instagram' },
  { label: 'Google Ads', value: 'google_ads' },
  { label: 'Website', value: 'website' },
  { label: 'Other', value: 'other' },
]

export function CampaignsListView() {
  const { t, i18n } = useTranslation()
  const isRTL = i18n.language === 'ar'

  // Table state
  const [rowSelection, setRowSelection] = useState({})
  const [columnVisibility, setColumnVisibility] = useState<VisibilityState>({})
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([])
  const [sorting, setSorting] = useState<SortingState>([
    { id: 'createdAt', desc: true }
  ])
  const [pagination, setPagination] = useState({ pageIndex: 0, pageSize: 10 })

  // Filter state
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedType, setSelectedType] = useState<CampaignType | ''>('')
  const [selectedChannel, setSelectedChannel] = useState<string>('')
  const [selectedOwner, setSelectedOwner] = useState<string>('')
  const [dateRange, setDateRange] = useState<{ from: Date | null; to: Date | null } | null>(null)

  // Build filters for API
  const filters = useMemo(() => {
    const statusFilter = columnFilters.find((f) => f.id === 'status')

    return {
      search: searchQuery || undefined,
      type: selectedType || undefined,
      channel: selectedChannel || undefined,
      status: statusFilter?.value as CampaignStatus[] | undefined,
      ownerId: selectedOwner || undefined,
      startAfter: dateRange?.from?.toISOString() || undefined,
      endBefore: dateRange?.to?.toISOString() || undefined,
      page: pagination.pageIndex + 1,
      limit: pagination.pageSize,
      sortBy: sorting[0]?.id,
      sortOrder: sorting[0]?.desc ? 'desc' : 'asc',
    }
  }, [searchQuery, selectedType, selectedChannel, columnFilters, selectedOwner, dateRange, pagination, sorting])

  // Fetch campaigns
  const { data: campaignsData, isLoading, isError, error } = useCampaigns(filters)
  const { mutate: deleteCampaign } = useDeleteCampaign()
  const { mutate: duplicateCampaign } = useDuplicateCampaign()
  const { mutate: pauseCampaign } = usePauseCampaign()
  const { mutate: resumeCampaign } = useResumeCampaign()

  const campaigns = campaignsData?.data || []
  const totalCount = campaignsData?.total || 0

  // Format currency
  const formatCurrency = (amount: number, currency: string = 'SAR') => {
    return `${amount.toLocaleString(isRTL ? 'ar-SA' : 'en-US', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    })} ${currency}`
  }

  // Format date
  const formatDate = (dateString?: string) => {
    if (!dateString) return '-'
    const date = new Date(dateString)
    return date.toLocaleDateString(isRTL ? 'ar-SA' : 'en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    })
  }

  // Calculate ROI
  const calculateROI = (campaign: Campaign) => {
    const spent = campaign.budget?.spent || 0
    const revenue = campaign.statistics?.revenueGenerated || 0

    if (spent === 0) return 0
    return ((revenue - spent) / spent) * 100
  }

  // Check if campaign is editable
  const isEditable = (status: CampaignStatus) => status === 'draft' || status === 'paused'

  // Check if campaign is deletable
  const isDeletable = (status: CampaignStatus) => status === 'draft'

  // Check if campaign can be paused
  const canPause = (status: CampaignStatus) => status === 'active'

  // Check if campaign can be resumed
  const canResume = (status: CampaignStatus) => status === 'paused'

  // Define columns
  const columns = useMemo<ColumnDef<Campaign>[]>(() => [
    {
      id: 'select',
      header: ({ table }) => (
        <Checkbox
          checked={
            table.getIsAllPageRowsSelected() ||
            (table.getIsSomePageRowsSelected() && 'indeterminate')
          }
          onCheckedChange={(value) => table.toggleAllPageRowsSelected(!!value)}
          aria-label={isRTL ? 'تحديد الكل' : 'Select all'}
          className="translate-y-[2px]"
        />
      ),
      cell: ({ row }) => (
        <Checkbox
          checked={row.getIsSelected()}
          onCheckedChange={(value) => row.toggleSelected(!!value)}
          aria-label={isRTL ? 'تحديد الصف' : 'Select row'}
          className="translate-y-[2px]"
        />
      ),
      enableSorting: false,
      enableHiding: false,
    },
    {
      accessorKey: 'name',
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title={isRTL ? 'اسم الحملة' : 'Campaign Name'} />
      ),
      cell: ({ row }) => {
        const name = row.getValue('name') as string
        return (
          <div className="flex flex-col">
            <span className="font-medium text-slate-900">{name}</span>
          </div>
        )
      },
      enableSorting: true,
    },
    {
      accessorKey: 'type',
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title={isRTL ? 'النوع' : 'Type'} />
      ),
      cell: ({ row }) => {
        const type = row.getValue('type') as CampaignType
        const typeLabel = campaignTypes.find((t) => t.value === type)
        return (
          <span className="capitalize">
            {isRTL ? typeLabel?.labelAr : typeLabel?.label || type}
          </span>
        )
      },
      enableSorting: true,
    },
    {
      accessorKey: 'channel',
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title={isRTL ? 'القناة' : 'Channel'} />
      ),
      cell: ({ row }) => {
        const channel = row.getValue('channel') as string
        const channelLabel = channelOptions.find((c) => c.value === channel)?.label
        return <span className="capitalize">{channelLabel || channel}</span>
      },
      enableSorting: true,
    },
    {
      accessorKey: 'status',
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title={isRTL ? 'الحالة' : 'Status'} />
      ),
      cell: ({ row }) => {
        const status = row.getValue('status') as CampaignStatus
        return <StatusBadge status={status} type="campaign" size="sm" />
      },
      enableSorting: true,
      filterFn: (row, id, value: string[]) => {
        const status = row.getValue(id) as CampaignStatus
        return value.includes(status)
      },
    },
    {
      id: 'startDate',
      accessorFn: (row) => row.schedule?.startDate,
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title={isRTL ? 'تاريخ البدء' : 'Start Date'} />
      ),
      cell: ({ row }) => {
        const startDate = row.original.schedule?.startDate
        return <span className="text-sm text-slate-600">{formatDate(startDate)}</span>
      },
      enableSorting: true,
    },
    {
      id: 'endDate',
      accessorFn: (row) => row.schedule?.endDate,
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title={isRTL ? 'تاريخ الانتهاء' : 'End Date'} />
      ),
      cell: ({ row }) => {
        const endDate = row.original.schedule?.endDate
        return <span className="text-sm text-slate-600">{formatDate(endDate)}</span>
      },
      enableSorting: true,
    },
    {
      id: 'budget',
      accessorFn: (row) => row.budget?.planned || 0,
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title={isRTL ? 'الميزانية' : 'Budget'} />
      ),
      cell: ({ row }) => {
        const budget = row.original.budget?.planned || 0
        const currency = row.original.budget?.currency || 'SAR'
        return (
          <span className="font-medium text-slate-900">
            {formatCurrency(budget, currency)}
          </span>
        )
      },
      enableSorting: true,
    },
    {
      id: 'leadsGenerated',
      accessorFn: (row) => row.statistics?.leadsGenerated || 0,
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title={isRTL ? 'العملاء المحتملون' : 'Leads'} />
      ),
      cell: ({ row }) => {
        const leads = row.original.statistics?.leadsGenerated || 0
        return <span className="font-medium text-emerald-600">{leads}</span>
      },
      enableSorting: true,
    },
    {
      id: 'conversions',
      accessorFn: (row) => row.statistics?.leadsConverted || 0,
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title={isRTL ? 'التحويلات' : 'Conversions'} />
      ),
      cell: ({ row }) => {
        const conversions = row.original.statistics?.leadsConverted || 0
        return <span className="font-medium text-blue-600">{conversions}</span>
      },
      enableSorting: true,
    },
    {
      id: 'roi',
      accessorFn: (row) => {
        const spent = row.budget?.spent || 0
        const revenue = row.statistics?.revenueGenerated || 0
        if (spent === 0) return 0
        return ((revenue - spent) / spent) * 100
      },
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title={isRTL ? 'العائد على الاستثمار' : 'ROI'} />
      ),
      cell: ({ row }) => {
        const roi = calculateROI(row.original)
        const isPositive = roi > 0
        return (
          <div className="flex items-center gap-1">
            <TrendingUp
              className={cn(
                'h-4 w-4',
                isPositive ? 'text-green-600' : 'text-red-600'
              )}
            />
            <span
              className={cn(
                'font-medium',
                isPositive ? 'text-green-600' : 'text-red-600'
              )}
            >
              {roi.toFixed(1)}%
            </span>
          </div>
        )
      },
      enableSorting: true,
    },
    {
      id: 'actions',
      cell: ({ row }) => {
        const campaign = row.original

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
            <DropdownMenuContent align="end" className="w-[180px]">
              <DropdownMenuItem asChild>
                <Link to={`/dashboard/crm/campaigns/${campaign.id}`}>
                  <Eye className="me-2 h-4 w-4" />
                  {isRTL ? 'عرض التفاصيل' : 'View Details'}
                </Link>
              </DropdownMenuItem>

              {isEditable(campaign.status) && (
                <DropdownMenuItem asChild>
                  <Link to={`/dashboard/crm/campaigns/${campaign.id}/edit`}>
                    <Pencil className="me-2 h-4 w-4" />
                    {isRTL ? 'تعديل' : 'Edit'}
                  </Link>
                </DropdownMenuItem>
              )}

              {canPause(campaign.status) && (
                <DropdownMenuItem
                  onClick={() => {
                    if (confirm(isRTL ? 'هل أنت متأكد من إيقاف هذه الحملة مؤقتاً؟' : 'Are you sure you want to pause this campaign?')) {
                      pauseCampaign(campaign.id)
                    }
                  }}
                >
                  <Pause className="me-2 h-4 w-4" />
                  {isRTL ? 'إيقاف مؤقت' : 'Pause'}
                </DropdownMenuItem>
              )}

              {canResume(campaign.status) && (
                <DropdownMenuItem
                  onClick={() => {
                    if (confirm(isRTL ? 'هل أنت متأكد من استئناف هذه الحملة؟' : 'Are you sure you want to resume this campaign?')) {
                      resumeCampaign(campaign.id)
                    }
                  }}
                >
                  <Play className="me-2 h-4 w-4" />
                  {isRTL ? 'استئناف' : 'Resume'}
                </DropdownMenuItem>
              )}

              <DropdownMenuItem
                onClick={() => duplicateCampaign(campaign.id)}
              >
                <Copy className="me-2 h-4 w-4" />
                {isRTL ? 'نسخ' : 'Duplicate'}
              </DropdownMenuItem>

              <DropdownMenuItem asChild>
                <Link to={`/dashboard/crm/campaigns/${campaign.id}/analytics`}>
                  <BarChart3 className="me-2 h-4 w-4" />
                  {isRTL ? 'عرض التحليلات' : 'View Analytics'}
                </Link>
              </DropdownMenuItem>

              {isDeletable(campaign.status) && (
                <>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem
                    onClick={() => {
                      if (confirm(isRTL ? 'هل أنت متأكد من حذف هذه الحملة؟' : 'Are you sure you want to delete this campaign?')) {
                        deleteCampaign(campaign.id)
                      }
                    }}
                    className="text-destructive focus:text-destructive"
                  >
                    <Trash2 className="me-2 h-4 w-4" />
                    {isRTL ? 'حذف' : 'Delete'}
                  </DropdownMenuItem>
                </>
              )}
            </DropdownMenuContent>
          </DropdownMenu>
        )
      },
    },
  ], [isRTL, deleteCampaign, duplicateCampaign, pauseCampaign, resumeCampaign])

  // Create table instance
  const table = useReactTable({
    data: campaigns,
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

  // Status filter options for faceted filter
  const statusFilterOptions = useMemo(() =>
    campaignStatuses.map((status) => ({
      label: isRTL ? status.labelAr : status.label,
      value: status.value,
    })),
    [isRTL]
  )

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-navy">
            {isRTL ? 'الحملات التسويقية' : 'Marketing Campaigns'}
          </h1>
          <p className="text-slate-500 mt-1">
            {isRTL ? 'إدارة ومتابعة الحملات التسويقية' : 'Manage and track marketing campaigns'}
          </p>
        </div>
        <Button asChild className="bg-emerald-500 hover:bg-emerald-600 rounded-xl">
          <Link to="/dashboard/crm/campaigns/new">
            <Plus className="h-4 w-4 ms-2" />
            {isRTL ? 'حملة جديدة' : 'New Campaign'}
          </Link>
        </Button>
      </div>

      {/* Filter Bar */}
      <div className="bg-white rounded-2xl p-5 border border-slate-100 shadow-sm">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4">
          {/* Search */}
          <div className="lg:col-span-1">
            <div className="relative">
              <SearchIcon className="absolute start-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
              <Input
                type="text"
                placeholder={isRTL ? 'البحث عن حملة...' : 'Search campaigns...'}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="ps-10 h-10 rounded-xl border-slate-200 bg-slate-50/50 focus:bg-white focus:border-emerald-500"
              />
            </div>
          </div>

          {/* Type Filter */}
          <Select value={selectedType} onValueChange={(value) => setSelectedType(value as CampaignType | '')}>
            <SelectTrigger className="h-10 rounded-xl border-slate-200 bg-slate-50/50">
              <SelectValue placeholder={isRTL ? 'النوع' : 'Type'} />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="">{isRTL ? 'الكل' : 'All'}</SelectItem>
              {campaignTypes.map((type) => (
                <SelectItem key={type.value} value={type.value}>
                  {isRTL ? type.labelAr : type.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          {/* Channel Filter */}
          <Select value={selectedChannel} onValueChange={setSelectedChannel}>
            <SelectTrigger className="h-10 rounded-xl border-slate-200 bg-slate-50/50">
              <SelectValue placeholder={isRTL ? 'القناة' : 'Channel'} />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="">{isRTL ? 'الكل' : 'All'}</SelectItem>
              {channelOptions.map((channel) => (
                <SelectItem key={channel.value} value={channel.value}>
                  {channel.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          {/* Owner Filter */}
          <UserPicker
            value={selectedOwner}
            onChange={(value) => setSelectedOwner(value as string)}
            mode="single"
            placeholder={isRTL ? 'المالك' : 'Owner'}
            fetchUsers={true}
            className="h-10 rounded-xl border-slate-200 bg-slate-50/50"
          />

          {/* Date Range Picker */}
          <DateRangePicker
            value={dateRange || undefined}
            onChange={(value) => setDateRange(value)}
            placeholder={isRTL ? 'نطاق التاريخ' : 'Date Range'}
            className="h-10 rounded-xl border-slate-200 bg-slate-50/50"
          />
        </div>

        {/* Status Multi-Select Filter */}
        <div className="mt-4 flex items-center gap-2">
          <span className="text-sm font-medium text-slate-700">
            {isRTL ? 'الحالة:' : 'Status:'}
          </span>
          <DataTableFacetedFilter
            column={table.getColumn('status')}
            title={isRTL ? 'الحالة' : 'Status'}
            options={statusFilterOptions}
          />
        </div>
      </div>

      {/* Data Table */}
      <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
        {isLoading ? (
          <div className="p-6 space-y-4">
            {[1, 2, 3, 4, 5].map((i) => (
              <div key={i} className="flex items-center gap-4">
                <Skeleton className="h-10 w-10 rounded" />
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
              {isRTL ? 'فشل تحميل الحملات' : 'Failed to load campaigns'}
            </h3>
            <p className="text-slate-500 mb-4">
              {error?.message || (isRTL ? 'حدث خطأ في الخادم' : 'A server error occurred')}
            </p>
          </div>
        ) : campaigns.length === 0 ? (
          <div className="p-12 text-center">
            <BarChart3 className="h-12 w-12 text-slate-300 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-slate-900 mb-1">
              {isRTL ? 'لا توجد حملات' : 'No campaigns found'}
            </h3>
            <p className="text-slate-500 mb-4">
              {isRTL ? 'ابدأ بإنشاء حملة تسويقية جديدة' : 'Get started by creating a new marketing campaign'}
            </p>
            <Button asChild className="bg-emerald-500 hover:bg-emerald-600 rounded-xl">
              <Link to="/dashboard/crm/campaigns/new">
                <Plus className="h-4 w-4 ms-2" />
                {isRTL ? 'إنشاء حملة' : 'Create Campaign'}
              </Link>
            </Button>
          </div>
        ) : (
          <div className="p-6 space-y-4">
            <DataTableBulkActions table={table} entityName={isRTL ? 'حملة' : 'campaign'}>
              <Button
                variant="destructive"
                size="sm"
                onClick={() => {
                  const selectedIds = table.getFilteredSelectedRowModel().rows.map((row) => row.original.id)
                  if (confirm(isRTL ? `هل أنت متأكد من حذف ${selectedIds.length} حملة؟` : `Delete ${selectedIds.length} campaign(s)?`)) {
                    selectedIds.forEach((id) => deleteCampaign(id))
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
