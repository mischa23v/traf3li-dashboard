import { HRSidebar } from './hr-sidebar'
import { useState } from 'react'
import { Main } from '@/components/layout/main'
import { LanguageSwitcher } from '@/components/language-switcher'
import { ThemeSwitch } from '@/components/theme-switch'
import { ConfigDrawer } from '@/components/config-drawer'
import { ProfileDropdown } from '@/components/profile-dropdown'
import { ProductivityHero } from '@/components/productivity-hero'
import { useNavigate } from '@tanstack/react-router'
import {
  useEmployeeTransfers,
  useEmployeeTransferStats,
  useBulkDeleteEmployeeTransfers,
} from '@/hooks/useEmployeeTransfer'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Checkbox } from '@/components/ui/checkbox'
import { Header } from '@/components/layout/header'
import { TopNav } from '@/components/layout/top-nav'
import { DynamicIsland } from '@/components/dynamic-island'
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
import {
  Search,
  Bell,
  Plus,
  MoreHorizontal,
  Eye,
  Edit,
  Trash2,
  AlertCircle,
  Loader2,
  Users,
  ArrowRight,
  CheckCircle,
  Clock,
  Building2,
  Calendar,
} from 'lucide-react'
import {
  TRANSFER_TYPE_LABELS,
  TRANSFER_STATUS_LABELS,
  type TransferStatus,
  type TransferType,
} from '@/services/employeeTransferService'
import { format } from 'date-fns'
import { ar } from 'date-fns/locale'

export function EmployeeTransfersListView() {
  const getColorClasses = (color: string) => {
    const colorMap: Record<string, string> = {
      blue: 'bg-blue-100 text-blue-700 border-blue-200',
      green: 'bg-green-100 text-green-700 border-green-200',
      emerald: 'bg-emerald-100 text-emerald-700 border-emerald-200',
      red: 'bg-red-100 text-red-700 border-red-200',
      amber: 'bg-amber-100 text-amber-700 border-amber-200',
      purple: 'bg-purple-100 text-purple-700 border-purple-200',
      slate: 'bg-slate-100 text-slate-700 border-slate-200',
    }
    return colorMap[color] || 'bg-gray-100 text-gray-700 border-gray-200'
  }

  const navigate = useNavigate()
  const [searchQuery, setSearchQuery] = useState('')
  const [statusFilter, setStatusFilter] = useState<TransferStatus | 'all'>('all')
  const [typeFilter, setTypeFilter] = useState<TransferType | 'all'>('all')
  const [selectedIds, setSelectedIds] = useState<string[]>([])
  const [selectionMode, setSelectionMode] = useState(false)

  const { data: transfersData, isLoading, error } = useEmployeeTransfers({
    status: statusFilter !== 'all' ? statusFilter : undefined,
    transferType: typeFilter !== 'all' ? typeFilter : undefined,
    search: searchQuery || undefined,
  })

  const { data: stats } = useEmployeeTransferStats()
  const bulkDeleteMutation = useBulkDeleteEmployeeTransfers()

  const transfers = transfersData?.data || []

  const handleSelectAll = () => {
    if (selectedIds.length === transfers.length) {
      setSelectedIds([])
    } else {
      setSelectedIds(transfers.map((t) => t._id))
    }
  }

  const handleSelectOne = (id: string) => {
    if (selectedIds.includes(id)) {
      setSelectedIds(selectedIds.filter((i) => i !== id))
    } else {
      setSelectedIds([...selectedIds, id])
    }
  }

  const handleBulkDelete = () => {
    if (selectedIds.length > 0 && confirm(`هل أنت متأكد من حذف ${selectedIds.length} طلب نقل؟`)) {
      bulkDeleteMutation.mutate(selectedIds, {
        onSuccess: () => {
          setSelectedIds([])
          setSelectionMode(false)
        },
      })
    }
  }

  const getStatusColor = (status: TransferStatus) => {
    const color = TRANSFER_STATUS_LABELS[status]?.color || 'slate'
    return getColorClasses(color)
  }

  const topNav = [
    { title: 'نظرة عامة', href: '/dashboard/overview', isActive: false },
    { title: 'الموظفين', href: '/dashboard/hr/employees', isActive: false },
    { title: 'نقل الموظفين', href: '/dashboard/hr/employee-transfers', isActive: true },
  ]

  const formatDate = (dateString: string) => {
    try {
      return format(new Date(dateString), 'dd MMM yyyy', { locale: ar })
    } catch {
      return dateString
    }
  }

  return (
    <>
      <Header className="bg-navy shadow-none relative">
        <TopNav
          links={topNav}
          className="[&>a]:text-slate-300 [&>a:hover]:text-white [&>a[aria-current='page']]:text-white"
        />
        <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 z-50">
          <DynamicIsland />
        </div>
        <div className="ms-auto flex items-center gap-2 sm:gap-4 overflow-x-auto min-w-0">
          <div className="relative hidden md:block min-w-0">
            <Search
              className="absolute end-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-500"
              aria-hidden="true"
            />
            <input
              type="text"
              placeholder="بحث..."
              aria-label="بحث"
              className="h-9 w-64 rounded-xl border border-white/10 bg-white/5 pe-9 ps-4 text-sm text-white placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/50"
            />
          </div>
          <Button
            variant="ghost"
            size="icon"
            className="relative rounded-full text-slate-300 hover:bg-white/10 hover:text-white flex-shrink-0"
            aria-label="الإشعارات"
          >
            <Bell className="h-5 w-5" aria-hidden="true" />
            <span className="absolute top-2 end-2 h-2 w-2 bg-red-500 rounded-full border border-navy"></span>
          </Button>
          <LanguageSwitcher className="text-slate-300 hover:bg-white/10 hover:text-white flex-shrink-0" />
          <ThemeSwitch className="text-slate-300 hover:bg-white/10 hover:text-white hidden sm:flex flex-shrink-0" />
          <ConfigDrawer className="text-slate-300 hover:bg-white/10 hover:text-white hidden lg:flex flex-shrink-0" />
          <ProfileDropdown className="text-slate-300 hover:bg-white/10 hover:text-white flex-shrink-0" />
        </div>
        <div className="absolute bottom-0 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-emerald-500/50 to-transparent"></div>
      </Header>

      <Main
        fluid={true}
        className="bg-[#f8f9fa] flex-1 w-full p-6 lg:p-8 space-y-8 rounded-tr-3xl shadow-inner border-e border-white/5 overflow-hidden font-['IBM_Plex_Sans_Arabic']"
      >
        <ProductivityHero
          badge="الموارد البشرية"
          title="إدارة نقل الموظفين"
          type="employees"
          listMode={true}
        />

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-6">
            {/* Stats Cards */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <Card className="rounded-2xl border-slate-100">
                <CardContent className="p-4">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-blue-100 rounded-xl">
                      <Users className="w-5 h-5 text-blue-600" />
                    </div>
                    <div>
                      <p className="text-xs text-slate-500">إجمالي النقل</p>
                      <p className="text-xl font-bold text-navy">{stats?.totalTransfers || 0}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
              <Card className="rounded-2xl border-slate-100">
                <CardContent className="p-4">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-amber-100 rounded-xl">
                      <Clock className="w-5 h-5 text-amber-600" aria-hidden="true" />
                    </div>
                    <div>
                      <p className="text-xs text-slate-500">قيد الموافقة</p>
                      <p className="text-xl font-bold text-navy">{stats?.pendingApprovals || 0}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
              <Card className="rounded-2xl border-slate-100">
                <CardContent className="p-4">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-emerald-100 rounded-xl">
                      <CheckCircle className="w-5 h-5 text-emerald-600" />
                    </div>
                    <div>
                      <p className="text-xs text-slate-500">مكتمل هذا الشهر</p>
                      <p className="text-xl font-bold text-navy">{stats?.completedThisMonth || 0}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
              <Card className="rounded-2xl border-slate-100">
                <CardContent className="p-4">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-purple-100 rounded-xl">
                      <Calendar className="w-5 h-5 text-purple-600" aria-hidden="true" />
                    </div>
                    <div>
                      <p className="text-xs text-slate-500">نقل مجدول</p>
                      <p className="text-xl font-bold text-navy">{stats?.scheduledTransfers || 0}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Filter Bar */}
            <Card className="rounded-2xl border-slate-100">
              <CardContent className="p-4">
                <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
                  <div className="flex items-center gap-3 w-full md:w-auto">
                    <div className="relative flex-1 md:w-64">
                      <Search
                        className="absolute end-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-500"
                        aria-hidden="true"
                      />
                      <Input
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        placeholder="بحث عن طلب نقل..."
                        className="pe-9 rounded-xl"
                      />
                    </div>
                    <Select
                      value={statusFilter}
                      onValueChange={(v) => setStatusFilter(v as TransferStatus | 'all')}
                    >
                      <SelectTrigger className="w-[140px] rounded-xl">
                        <SelectValue placeholder="الحالة" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">كل الحالات</SelectItem>
                        {Object.entries(TRANSFER_STATUS_LABELS).map(([key, label]) => (
                          <SelectItem key={key} value={key}>
                            {label.ar}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <Select
                      value={typeFilter}
                      onValueChange={(v) => setTypeFilter(v as TransferType | 'all')}
                    >
                      <SelectTrigger className="w-[140px] rounded-xl">
                        <SelectValue placeholder="النوع" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">كل الأنواع</SelectItem>
                        {Object.entries(TRANSFER_TYPE_LABELS).map(([key, label]) => (
                          <SelectItem key={key} value={key}>
                            {label.ar}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="flex items-center gap-2">
                    {selectionMode && selectedIds.length > 0 && (
                      <Button
                        variant="destructive"
                        size="sm"
                        onClick={handleBulkDelete}
                        className="rounded-xl"
                      >
                        <Trash2 className="w-4 h-4 ms-1" aria-hidden="true" />
                        حذف ({selectedIds.length})
                      </Button>
                    )}
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        setSelectionMode(!selectionMode)
                        setSelectedIds([])
                      }}
                      className="rounded-xl"
                    >
                      {selectionMode ? 'إلغاء' : 'تحديد'}
                    </Button>
                    <Button
                      size="sm"
                      onClick={() => navigate({ to: '/dashboard/hr/employee-transfers/new' })}
                      className="bg-emerald-500 hover:bg-emerald-600 text-white rounded-xl shadow-lg shadow-emerald-500/20"
                    >
                      <Plus className="w-4 h-4 ms-1" aria-hidden="true" />
                      نقل جديد
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Selection Header */}
            {selectionMode && (
              <div className="flex items-center gap-4 px-4 py-2 bg-slate-100 rounded-xl">
                <Checkbox
                  checked={selectedIds.length === transfers.length && transfers.length > 0}
                  onCheckedChange={handleSelectAll}
                />
                <span className="text-sm text-slate-600">تحديد الكل ({transfers.length})</span>
              </div>
            )}

            {/* Transfers List */}
            {isLoading ? (
              <Card className="rounded-2xl border-slate-100">
                <CardContent className="p-8 text-center">
                  <Loader2 className="w-8 h-8 animate-spin mx-auto text-emerald-500" />
                  <p className="mt-4 text-slate-500">جاري تحميل طلبات النقل...</p>
                </CardContent>
              </Card>
            ) : error ? (
              <Card className="rounded-2xl border-slate-100">
                <CardContent className="p-8 text-center">
                  <AlertCircle className="w-8 h-8 mx-auto text-red-500" aria-hidden="true" />
                  <p className="mt-4 text-red-600">حدث خطأ في تحميل البيانات</p>
                </CardContent>
              </Card>
            ) : transfers.length === 0 ? (
              <Card className="rounded-2xl border-slate-100">
                <CardContent className="p-8 text-center">
                  <Users className="w-12 h-12 mx-auto text-slate-300" />
                  <p className="mt-4 text-slate-500">لا توجد طلبات نقل</p>
                  <Button
                    onClick={() => navigate({ to: '/dashboard/hr/employee-transfers/new' })}
                    className="mt-4 bg-emerald-500 hover:bg-emerald-600 text-white rounded-xl"
                  >
                    <Plus className="w-4 h-4 ms-1" aria-hidden="true" />
                    إضافة طلب نقل جديد
                  </Button>
                </CardContent>
              </Card>
            ) : (
              <div className="space-y-4">
                {transfers.map((transfer) => (
                  <Card
                    key={transfer._id}
                    className="rounded-2xl border-slate-100 hover:shadow-md transition-shadow"
                  >
                    <CardContent className="p-4">
                      <div className="flex items-start gap-4">
                        {selectionMode && (
                          <Checkbox
                            checked={selectedIds.includes(transfer._id)}
                            onCheckedChange={() => handleSelectOne(transfer._id)}
                            className="mt-1"
                          />
                        )}
                        <div className="flex-1">
                          <div className="flex items-start justify-between">
                            <div>
                              <div className="flex items-center gap-2 mb-1">
                                <h3 className="font-bold text-navy">
                                  {transfer.employeeNameAr || transfer.employeeName}
                                </h3>
                                {transfer.transferType === 'temporary' && (
                                  <Badge className="bg-amber-100 text-amber-700 text-xs">مؤقت</Badge>
                                )}
                              </div>
                              <p className="text-sm text-slate-500">
                                {transfer.transferId} - {transfer.employeeNumber || 'غير محدد'}
                              </p>
                            </div>
                            <div className="flex items-center gap-2">
                              <Badge className={getStatusColor(transfer.status)}>
                                {TRANSFER_STATUS_LABELS[transfer.status]?.ar}
                              </Badge>
                              <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                  <Button
                                    variant="ghost"
                                    size="icon"
                                    className="rounded-xl"
                                    aria-label="خيارات"
                                  >
                                    <MoreHorizontal className="w-4 h-4" aria-hidden="true" />
                                  </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent align="end">
                                  <DropdownMenuItem
                                    onClick={() =>
                                      navigate({ to: `/dashboard/hr/employee-transfers/${transfer._id}` })
                                    }
                                  >
                                    <Eye className="w-4 h-4 ms-2" aria-hidden="true" />
                                    عرض التفاصيل
                                  </DropdownMenuItem>
                                  <DropdownMenuItem
                                    onClick={() =>
                                      navigate({
                                        to: `/dashboard/hr/employee-transfers/new?editId=${transfer._id}`,
                                      })
                                    }
                                  >
                                    <Edit className="w-4 h-4 ms-2" aria-hidden="true" />
                                    تعديل
                                  </DropdownMenuItem>
                                  <DropdownMenuSeparator />
                                  <DropdownMenuItem className="text-red-600">
                                    <Trash2 className="w-4 h-4 ms-2" aria-hidden="true" />
                                    حذف
                                  </DropdownMenuItem>
                                </DropdownMenuContent>
                              </DropdownMenu>
                            </div>
                          </div>

                          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4">
                            <div>
                              <p className="text-xs text-slate-500 mb-1">من</p>
                              <div className="flex items-center gap-2">
                                <Building2 className="w-4 h-4 text-slate-400" />
                                <div>
                                  <p className="text-sm font-medium">
                                    {transfer.fromDepartmentName || 'غير محدد'}
                                  </p>
                                  {transfer.fromBranch && (
                                    <p className="text-xs text-slate-500">{transfer.fromBranch}</p>
                                  )}
                                </div>
                              </div>
                            </div>

                            <div className="flex items-center justify-center">
                              <ArrowRight className="w-5 h-5 text-emerald-500" />
                            </div>

                            <div>
                              <p className="text-xs text-slate-500 mb-1">إلى</p>
                              <div className="flex items-center gap-2">
                                <Building2 className="w-4 h-4 text-slate-400" />
                                <div>
                                  <p className="text-sm font-medium">
                                    {transfer.toDepartmentName || 'غير محدد'}
                                  </p>
                                  {transfer.toBranch && (
                                    <p className="text-xs text-slate-500">{transfer.toBranch}</p>
                                  )}
                                </div>
                              </div>
                            </div>
                          </div>

                          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-4">
                            <div>
                              <p className="text-xs text-slate-500">نوع النقل</p>
                              <Badge
                                className={getColorClasses(
                                  TRANSFER_TYPE_LABELS[transfer.transferType]?.color
                                )}
                              >
                                {TRANSFER_TYPE_LABELS[transfer.transferType]?.ar}
                              </Badge>
                            </div>
                            <div>
                              <p className="text-xs text-slate-500">تاريخ النقل</p>
                              <p className="font-medium">{formatDate(transfer.transferDate)}</p>
                            </div>
                            <div>
                              <p className="text-xs text-slate-500">تاريخ السريان</p>
                              <p className="font-medium">{formatDate(transfer.effectiveDate)}</p>
                            </div>
                            {transfer.endDate && (
                              <div>
                                <p className="text-xs text-slate-500">تاريخ الانتهاء</p>
                                <p className="font-medium">{formatDate(transfer.endDate)}</p>
                              </div>
                            )}
                          </div>

                          {transfer.handoverRequired && transfer.handoverChecklist && (
                            <div className="mt-4 pt-4 border-t border-slate-100">
                              <div className="flex items-center justify-between text-sm">
                                <span className="text-slate-500">تقدم التسليم</span>
                                <span className="font-medium text-emerald-600">
                                  {transfer.handoverChecklist.filter((item) => item.completed).length} /{' '}
                                  {transfer.handoverChecklist.length}
                                </span>
                              </div>
                            </div>
                          )}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </div>

          {/* Sidebar */}
          <div className="lg:col-span-1">
            <HRSidebar />
          </div>
        </div>
      </Main>
    </>
  )
}
