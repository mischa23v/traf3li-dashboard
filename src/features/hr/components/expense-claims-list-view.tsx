import { HRSidebar } from './hr-sidebar'
import { useState } from 'react'
import { Main } from '@/components/layout/main'
import { LanguageSwitcher } from '@/components/language-switcher'
import { ThemeSwitch } from '@/components/theme-switch'
import { ConfigDrawer } from '@/components/config-drawer'
import { ProfileDropdown } from '@/components/profile-dropdown'
import { ProductivityHero } from '@/components/productivity-hero'
import { useNavigate } from '@tanstack/react-router'
import { useExpenseClaims, useExpenseClaimStats, useBulkDeleteExpenseClaims } from '@/hooks/useExpenseClaims'
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
  Search, Bell, Plus, MoreHorizontal, Eye, Edit, Trash2,
  AlertCircle, Loader2, Receipt, Clock, CheckCircle, CreditCard,
  FileText, Plane, Utensils, Hotel, Car, DollarSign, Paperclip
} from 'lucide-react'
import {
  EXPENSE_CATEGORY_LABELS,
  CLAIM_STATUS_LABELS,
  EXPENSE_TYPE_LABELS,
  type ClaimStatus,
  type ExpenseCategory,
  type ExpenseType,
} from '@/services/expenseClaimsService'

export function ExpenseClaimsListView() {
  const navigate = useNavigate()
  const [searchQuery, setSearchQuery] = useState('')
  const [statusFilter, setStatusFilter] = useState<ClaimStatus | 'all'>('all')
  const [typeFilter, setTypeFilter] = useState<ExpenseType | 'all'>('all')
  const [selectedIds, setSelectedIds] = useState<string[]>([])
  const [selectionMode, setSelectionMode] = useState(false)

  const { data: claimsData, isLoading, error } = useExpenseClaims({
    status: statusFilter !== 'all' ? statusFilter : undefined,
    expenseType: typeFilter !== 'all' ? typeFilter : undefined,
    search: searchQuery || undefined,
  })

  const { data: stats } = useExpenseClaimStats()
  const bulkDeleteMutation = useBulkDeleteExpenseClaims()

  const claims = claimsData?.data || []

  const handleSelectAll = () => {
    if (selectedIds.length === claims.length) {
      setSelectedIds([])
    } else {
      setSelectedIds(claims.map(c => c._id))
    }
  }

  const handleSelectOne = (id: string) => {
    if (selectedIds.includes(id)) {
      setSelectedIds(selectedIds.filter(i => i !== id))
    } else {
      setSelectedIds([...selectedIds, id])
    }
  }

  const handleBulkDelete = () => {
    if (selectedIds.length > 0 && confirm(`هل أنت متأكد من حذف ${selectedIds.length} مطالبة؟`)) {
      bulkDeleteMutation.mutate(selectedIds, {
        onSuccess: () => {
          setSelectedIds([])
          setSelectionMode(false)
        },
      })
    }
  }

  const getStatusColor = (status: ClaimStatus) => {
    const colors: Record<ClaimStatus, string> = {
      draft: 'bg-gray-100 text-gray-700 border-gray-200',
      submitted: 'bg-blue-100 text-blue-700 border-blue-200',
      under_review: 'bg-amber-100 text-amber-700 border-amber-200',
      pending_approval: 'bg-orange-100 text-orange-700 border-orange-200',
      approved: 'bg-emerald-100 text-emerald-700 border-emerald-200',
      rejected: 'bg-red-100 text-red-700 border-red-200',
      processing: 'bg-purple-100 text-purple-700 border-purple-200',
      paid: 'bg-green-100 text-green-700 border-green-200',
      cancelled: 'bg-slate-100 text-slate-700 border-slate-200',
    }
    return colors[status]
  }

  const getCategoryIcon = (category: ExpenseCategory) => {
    const icons: Record<ExpenseCategory, React.ReactNode> = {
      travel: <Plane className="w-4 h-4" />,
      meals: <Utensils className="w-4 h-4" />,
      accommodation: <Hotel className="w-4 h-4" />,
      transportation: <Car className="w-4 h-4" />,
      office_supplies: <Paperclip className="w-4 h-4" />,
      communication: <FileText className="w-4 h-4" />,
      professional_services: <FileText className="w-4 h-4" />,
      training: <FileText className="w-4 h-4" />,
      entertainment: <FileText className="w-4 h-4" />,
      court_fees: <FileText className="w-4 h-4" />,
      legal_research: <FileText className="w-4 h-4" />,
      client_expenses: <FileText className="w-4 h-4" />,
      mileage: <Car className="w-4 h-4" />,
      parking: <Car className="w-4 h-4" />,
      tolls: <Car className="w-4 h-4" />,
      other: <FileText className="w-4 h-4" />,
    }
    return icons[category]
  }

  const topNav = [
    { title: 'نظرة عامة', href: '/dashboard/overview', isActive: false },
    { title: 'الموظفين', href: '/dashboard/hr/employees', isActive: false },
    { title: 'مطالبات النفقات', href: '/dashboard/hr/expense-claims', isActive: true },
  ]

  return (
    <>
      <Header className="bg-navy shadow-none relative">
        <TopNav links={topNav} className="[&>a]:text-slate-300 [&>a:hover]:text-white [&>a[aria-current='page']]:text-white" />
        <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 z-50">
          <DynamicIsland />
        </div>
        <div className='ms-auto flex items-center gap-4'>
          <div className="relative hidden md:block">
            <Search className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
            <input type="text" placeholder="بحث..." className="h-9 w-64 rounded-xl border border-white/10 bg-white/5 pe-9 ps-4 text-sm text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500/50" />
          </div>
          <Button variant="ghost" size="icon" className="relative rounded-full text-slate-300 hover:bg-white/10 hover:text-white">
            <Bell className="h-5 w-5" />
            <span className="absolute top-2 right-2 h-2 w-2 bg-red-500 rounded-full border border-navy"></span>
          </Button>
          <LanguageSwitcher className="text-slate-300 hover:bg-white/10 hover:text-white" />
          <ThemeSwitch className="text-slate-300 hover:bg-white/10 hover:text-white" />
          <ConfigDrawer className="text-slate-300 hover:bg-white/10 hover:text-white" />
          <ProfileDropdown className="text-slate-300 hover:bg-white/10 hover:text-white" />
        </div>
        <div className="absolute bottom-0 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-emerald-500/50 to-transparent"></div>
      </Header>

      <Main fluid={true} className="bg-[#f8f9fa] flex-1 w-full p-6 lg:p-8 space-y-8 rounded-tr-3xl shadow-inner border-r border-white/5 overflow-hidden font-['IBM_Plex_Sans_Arabic']">
        <ProductivityHero
          badge="الموارد البشرية"
          title="مطالبات النفقات"
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
                      <Receipt className="w-5 h-5 text-blue-600" />
                    </div>
                    <div>
                      <p className="text-xs text-slate-500">إجمالي المطالبات</p>
                      <p className="text-xl font-bold text-navy">{stats?.totalClaims || 0}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
              <Card className="rounded-2xl border-slate-100">
                <CardContent className="p-4">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-amber-100 rounded-xl">
                      <Clock className="w-5 h-5 text-amber-600" />
                    </div>
                    <div>
                      <p className="text-xs text-slate-500">قيد الاعتماد</p>
                      <p className="text-xl font-bold text-navy">{stats?.pendingApproval || 0}</p>
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
                      <p className="text-xs text-slate-500">المدفوع</p>
                      <p className="text-xl font-bold text-navy">
                        {((stats?.totalPaid || 0) / 1000).toFixed(0)}K
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
              <Card className="rounded-2xl border-slate-100">
                <CardContent className="p-4">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-purple-100 rounded-xl">
                      <CreditCard className="w-5 h-5 text-purple-600" />
                    </div>
                    <div>
                      <p className="text-xs text-slate-500">قيد الدفع</p>
                      <p className="text-xl font-bold text-navy">{stats?.pendingPayment || 0}</p>
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
                      <Search className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                      <Input
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        placeholder="بحث عن مطالبة..."
                        className="pr-9 rounded-xl"
                      />
                    </div>
                    <Select value={statusFilter} onValueChange={(v) => setStatusFilter(v as ClaimStatus | 'all')}>
                      <SelectTrigger className="w-[140px] rounded-xl">
                        <SelectValue placeholder="الحالة" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">كل الحالات</SelectItem>
                        {Object.entries(CLAIM_STATUS_LABELS).map(([key, label]) => (
                          <SelectItem key={key} value={key}>{label.ar}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <Select value={typeFilter} onValueChange={(v) => setTypeFilter(v as ExpenseType | 'all')}>
                      <SelectTrigger className="w-[140px] rounded-xl">
                        <SelectValue placeholder="النوع" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">كل الأنواع</SelectItem>
                        {Object.entries(EXPENSE_TYPE_LABELS).map(([key, label]) => (
                          <SelectItem key={key} value={key}>{label.ar}</SelectItem>
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
                        <Trash2 className="w-4 h-4 ms-1" />
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
                      onClick={() => navigate({ to: '/dashboard/hr/expense-claims/new' })}
                      className="bg-emerald-500 hover:bg-emerald-600 text-white rounded-xl shadow-lg shadow-emerald-500/20"
                    >
                      <Plus className="w-4 h-4 ms-1" />
                      مطالبة جديدة
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Selection Header */}
            {selectionMode && (
              <div className="flex items-center gap-4 px-4 py-2 bg-slate-100 rounded-xl">
                <Checkbox
                  checked={selectedIds.length === claims.length && claims.length > 0}
                  onCheckedChange={handleSelectAll}
                />
                <span className="text-sm text-slate-600">
                  تحديد الكل ({claims.length})
                </span>
              </div>
            )}

            {/* Claims List */}
            {isLoading ? (
              <Card className="rounded-2xl border-slate-100">
                <CardContent className="p-8 text-center">
                  <Loader2 className="w-8 h-8 animate-spin mx-auto text-emerald-500" />
                  <p className="mt-4 text-slate-500">جاري تحميل المطالبات...</p>
                </CardContent>
              </Card>
            ) : error ? (
              <Card className="rounded-2xl border-slate-100">
                <CardContent className="p-8 text-center">
                  <AlertCircle className="w-8 h-8 mx-auto text-red-500" />
                  <p className="mt-4 text-red-600">حدث خطأ في تحميل البيانات</p>
                </CardContent>
              </Card>
            ) : claims.length === 0 ? (
              <Card className="rounded-2xl border-slate-100">
                <CardContent className="p-8 text-center">
                  <Receipt className="w-12 h-12 mx-auto text-slate-300" />
                  <p className="mt-4 text-slate-500">لا توجد مطالبات</p>
                  <Button
                    onClick={() => navigate({ to: '/dashboard/hr/expense-claims/new' })}
                    className="mt-4 bg-emerald-500 hover:bg-emerald-600 text-white rounded-xl"
                  >
                    <Plus className="w-4 h-4 ms-1" />
                    إضافة مطالبة جديدة
                  </Button>
                </CardContent>
              </Card>
            ) : (
              <div className="space-y-4">
                {claims.map((claim) => (
                  <Card key={claim._id} className="rounded-2xl border-slate-100 hover:shadow-md transition-shadow">
                    <CardContent className="p-4">
                      <div className="flex items-start gap-4">
                        {selectionMode && (
                          <Checkbox
                            checked={selectedIds.includes(claim._id)}
                            onCheckedChange={() => handleSelectOne(claim._id)}
                            className="mt-1"
                          />
                        )}
                        <div className="flex-1">
                          <div className="flex items-start justify-between">
                            <div>
                              <div className="flex items-center gap-2 mb-1">
                                <h3 className="font-bold text-navy">
                                  {claim.claimTitleAr || claim.claimTitle}
                                </h3>
                                {claim.billable?.isBillable && (
                                  <Badge className="bg-teal-100 text-teal-700 text-xs">
                                    <DollarSign className="w-3 h-3 ms-1" />
                                    قابل للفوترة
                                  </Badge>
                                )}
                              </div>
                              <p className="text-sm text-slate-500">
                                {claim.claimNumber} - {claim.employeeNameAr || claim.employeeName}
                              </p>
                            </div>
                            <div className="flex items-center gap-2">
                              <Badge className={getStatusColor(claim.status)}>
                                {CLAIM_STATUS_LABELS[claim.status]?.ar}
                              </Badge>
                              <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                  <Button variant="ghost" size="icon" className="rounded-xl">
                                    <MoreHorizontal className="w-4 h-4" />
                                  </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent align="end">
                                  <DropdownMenuItem onClick={() => navigate({ to: `/dashboard/hr/expense-claims/${claim._id}` })}>
                                    <Eye className="w-4 h-4 ms-2" />
                                    عرض التفاصيل
                                  </DropdownMenuItem>
                                  <DropdownMenuItem onClick={() => navigate({ to: `/dashboard/hr/expense-claims/new?editId=${claim._id}` })}>
                                    <Edit className="w-4 h-4 ms-2" />
                                    تعديل
                                  </DropdownMenuItem>
                                  <DropdownMenuSeparator />
                                  <DropdownMenuItem className="text-red-600">
                                    <Trash2 className="w-4 h-4 ms-2" />
                                    حذف
                                  </DropdownMenuItem>
                                </DropdownMenuContent>
                              </DropdownMenu>
                            </div>
                          </div>

                          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-4">
                            <div>
                              <p className="text-xs text-slate-500">نوع المطالبة</p>
                              <Badge className={`bg-${EXPENSE_TYPE_LABELS[claim.expenseType]?.color}-100 text-${EXPENSE_TYPE_LABELS[claim.expenseType]?.color}-700`}>
                                {EXPENSE_TYPE_LABELS[claim.expenseType]?.ar}
                              </Badge>
                            </div>
                            <div>
                              <p className="text-xs text-slate-500">المبلغ الإجمالي</p>
                              <p className="font-bold text-navy">{claim.totals.grandTotal.toLocaleString('ar-SA')} ر.س</p>
                            </div>
                            <div>
                              <p className="text-xs text-slate-500">عدد البنود</p>
                              <p className="font-medium">{claim.lineItemsCount} بند</p>
                            </div>
                            <div>
                              <p className="text-xs text-slate-500">الإيصالات</p>
                              <div className="flex items-center gap-1">
                                <Paperclip className="w-3 h-3 text-slate-400" />
                                <span className={claim.allReceiptsAttached ? 'text-emerald-600' : 'text-amber-600'}>
                                  {claim.allReceiptsAttached ? 'مكتملة' : `ناقص ${claim.missingReceiptsCount}`}
                                </span>
                              </div>
                            </div>
                          </div>

                          {/* Category Pills */}
                          {claim.lineItems && claim.lineItems.length > 0 && (
                            <div className="flex flex-wrap gap-2 mt-4">
                              {[...new Set(claim.lineItems.map(li => li.category))].slice(0, 4).map((cat) => (
                                <div key={cat} className="flex items-center gap-1 px-2 py-1 bg-slate-100 rounded-lg text-xs text-slate-600">
                                  {getCategoryIcon(cat)}
                                  <span>{EXPENSE_CATEGORY_LABELS[cat]?.ar}</span>
                                </div>
                              ))}
                              {[...new Set(claim.lineItems.map(li => li.category))].length > 4 && (
                                <span className="text-xs text-slate-400">
                                  +{[...new Set(claim.lineItems.map(li => li.category))].length - 4} أخرى
                                </span>
                              )}
                            </div>
                          )}

                          <div className="flex items-center justify-between mt-4 pt-3 border-t border-slate-100">
                            <div className="flex items-center gap-4 text-xs text-slate-500">
                              <span>
                                الفترة: {new Date(claim.claimPeriod.startDate).toLocaleDateString('ar-SA')} - {new Date(claim.claimPeriod.endDate).toLocaleDateString('ar-SA')}
                              </span>
                              {claim.submissionDate && (
                                <span>تقديم: {new Date(claim.submissionDate).toLocaleDateString('ar-SA')}</span>
                              )}
                            </div>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => navigate({ to: `/dashboard/hr/expense-claims/${claim._id}` })}
                              className="text-emerald-600 hover:text-emerald-700 hover:bg-emerald-50 rounded-xl"
                            >
                              عرض التفاصيل
                            </Button>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </div>

          {/* Sidebar */}
          <HRSidebar context="employees" />
        </div>
      </Main>
    </>
  )
}
