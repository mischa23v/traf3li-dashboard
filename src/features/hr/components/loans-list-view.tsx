import { HRSidebar } from './hr-sidebar'
import { useState } from 'react'
import { Main } from '@/components/layout/main'
import { LanguageSwitcher } from '@/components/language-switcher'
import { ThemeSwitch } from '@/components/theme-switch'
import { ConfigDrawer } from '@/components/config-drawer'
import { ProfileDropdown } from '@/components/profile-dropdown'
import { ProductivityHero } from '@/components/productivity-hero'
import { useNavigate } from '@tanstack/react-router'
import { useLoans, useLoanStats, useDeleteLoan, useBulkDeleteLoans } from '@/hooks/useLoans'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent } from '@/components/ui/card'
import { Header } from '@/components/layout/header'
import { TopNav } from '@/components/layout/top-nav'
import { DynamicIsland } from '@/components/dynamic-island'
import { Checkbox } from '@/components/ui/checkbox'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
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
  Wallet, Calendar, Building2, DollarSign, TrendingUp,
  Clock, CheckCircle, AlertCircle, XCircle, Loader2, Banknote
} from 'lucide-react'
import {
  LOAN_TYPE_LABELS,
  LOAN_STATUS_LABELS,
  type LoanStatus,
  type LoanType,
} from '@/services/loansService'

export function LoansListView() {
  const navigate = useNavigate()
  const [searchQuery, setSearchQuery] = useState('')
  const [statusFilter, setStatusFilter] = useState<LoanStatus | 'all'>('all')
  const [loanTypeFilter, setLoanTypeFilter] = useState<LoanType | 'all'>('all')
  const [selectedIds, setSelectedIds] = useState<string[]>([])
  const [selectionMode, setSelectionMode] = useState(false)

  const { data: loansData, isLoading, error } = useLoans({
    search: searchQuery || undefined,
    status: statusFilter !== 'all' ? statusFilter : undefined,
    loanType: loanTypeFilter !== 'all' ? loanTypeFilter : undefined,
  })
  const { data: stats } = useLoanStats()
  const deleteMutation = useDeleteLoan()
  const bulkDeleteMutation = useBulkDeleteLoans()

  const loans = loansData?.data || []

  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      setSelectedIds(loans.map(l => l._id))
    } else {
      setSelectedIds([])
    }
  }

  const handleSelectOne = (id: string, checked: boolean) => {
    if (checked) {
      setSelectedIds([...selectedIds, id])
    } else {
      setSelectedIds(selectedIds.filter(i => i !== id))
    }
  }

  const handleBulkDelete = () => {
    if (selectedIds.length > 0) {
      bulkDeleteMutation.mutate(selectedIds, {
        onSuccess: () => {
          setSelectedIds([])
          setSelectionMode(false)
        },
      })
    }
  }

  const getStatusIcon = (status: LoanStatus) => {
    switch (status) {
      case 'pending': return <Clock className="w-4 h-4" aria-hidden="true" />
      case 'approved': return <CheckCircle className="w-4 h-4" />
      case 'rejected': return <XCircle className="w-4 h-4" />
      case 'active': return <TrendingUp className="w-4 h-4" aria-hidden="true" />
      case 'completed': return <CheckCircle className="w-4 h-4" />
      case 'defaulted': return <AlertCircle className="w-4 h-4" aria-hidden="true" />
      case 'cancelled': return <XCircle className="w-4 h-4" />
      default: return null
    }
  }

  const getStatusColor = (status: LoanStatus) => {
    const colors: Record<LoanStatus, string> = {
      pending: 'bg-slate-100 text-slate-700 border-slate-200',
      approved: 'bg-blue-100 text-blue-700 border-blue-200',
      rejected: 'bg-red-100 text-red-700 border-red-200',
      active: 'bg-emerald-100 text-emerald-700 border-emerald-200',
      completed: 'bg-green-100 text-green-700 border-green-200',
      defaulted: 'bg-orange-100 text-orange-700 border-orange-200',
      cancelled: 'bg-gray-100 text-gray-700 border-gray-200',
    }
    return colors[status]
  }

  const getLoanTypeColor = (loanType: LoanType) => {
    const label = LOAN_TYPE_LABELS[loanType]
    const colorMap: Record<string, string> = {
      blue: 'bg-blue-50 text-blue-700',
      emerald: 'bg-emerald-50 text-emerald-700',
      purple: 'bg-purple-50 text-purple-700',
      amber: 'bg-amber-50 text-amber-700',
      red: 'bg-red-50 text-red-700',
      pink: 'bg-pink-50 text-pink-700',
      orange: 'bg-orange-50 text-orange-700',
      teal: 'bg-teal-50 text-teal-700',
      indigo: 'bg-indigo-50 text-indigo-700',
      cyan: 'bg-cyan-50 text-cyan-700',
      lime: 'bg-lime-50 text-lime-700',
      gray: 'bg-gray-50 text-gray-700',
    }
    return colorMap[label?.color] || 'bg-gray-50 text-gray-700'
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('ar-SA', {
      style: 'currency',
      currency: 'SAR',
      minimumFractionDigits: 0,
    }).format(amount)
  }

  const topNav = [
    { title: 'نظرة عامة', href: '/dashboard/overview', isActive: false },
    { title: 'الموظفين', href: '/dashboard/hr/employees', isActive: false },
    { title: 'القروض', href: '/dashboard/hr/loans', isActive: true },
  ]

  return (
    <>
      <Header className="bg-navy shadow-none relative">
        <TopNav links={topNav} className="[&>a]:text-slate-300 [&>a:hover]:text-white [&>a[aria-current='page']]:text-white" />
        <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 z-50">
          <DynamicIsland />
        </div>
        <div className='ms-auto flex items-center gap-2 sm:gap-4 overflow-x-auto min-w-0'>
          <div className="relative hidden md:block min-w-0">
            <Search className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-500" aria-hidden="true" />
            <input type="text" placeholder="بحث..." aria-label="بحث" className="h-9 w-64 rounded-xl border border-white/10 bg-white/5 pe-9 ps-4 text-sm text-white placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/50" />
          </div>
          <Button variant="ghost" size="icon" className="relative rounded-full text-slate-300 hover:bg-white/10 hover:text-white flex-shrink-0" aria-label="الإشعارات">
            <Bell className="h-5 w-5" aria-hidden="true" />
            <span className="absolute top-2 right-2 h-2 w-2 bg-red-500 rounded-full border border-navy"></span>
          </Button>
          <LanguageSwitcher className="text-slate-300 hover:bg-white/10 hover:text-white flex-shrink-0" />
          <ThemeSwitch className="text-slate-300 hover:bg-white/10 hover:text-white hidden sm:flex flex-shrink-0" />
          <ConfigDrawer className="text-slate-300 hover:bg-white/10 hover:text-white hidden lg:flex flex-shrink-0" />
          <ProfileDropdown className="text-slate-300 hover:bg-white/10 hover:text-white flex-shrink-0" />
        </div>
        <div className="absolute bottom-0 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-emerald-500/50 to-transparent"></div>
      </Header>

      <Main fluid={true} className="bg-[#f8f9fa] flex-1 w-full p-6 lg:p-8 space-y-8 rounded-tr-3xl shadow-inner border-r border-white/5 overflow-hidden font-['IBM_Plex_Sans_Arabic']">
        <ProductivityHero
          badge="الموارد البشرية"
          title="قروض الموظفين"
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
                      <Wallet className="w-5 h-5 text-blue-600" />
                    </div>
                    <div>
                      <p className="text-2xl font-bold text-navy">{stats?.totalLoans || 0}</p>
                      <p className="text-xs text-slate-500">إجمالي القروض</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
              <Card className="rounded-2xl border-slate-100">
                <CardContent className="p-4">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-emerald-100 rounded-xl">
                      <TrendingUp className="w-5 h-5 text-emerald-600" aria-hidden="true" />
                    </div>
                    <div>
                      <p className="text-2xl font-bold text-navy">{stats?.activeLoans || 0}</p>
                      <p className="text-xs text-slate-500">قروض نشطة</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
              <Card className="rounded-2xl border-slate-100">
                <CardContent className="p-4">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-amber-100 rounded-xl">
                      <DollarSign className="w-5 h-5 text-amber-600" />
                    </div>
                    <div>
                      <p className="text-lg font-bold text-navy">{formatCurrency(stats?.totalOutstanding || 0)}</p>
                      <p className="text-xs text-slate-500">الرصيد المتبقي</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
              <Card className="rounded-2xl border-slate-100">
                <CardContent className="p-4">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-red-100 rounded-xl">
                      <AlertCircle className="w-5 h-5 text-red-600" aria-hidden="true" />
                    </div>
                    <div>
                      <p className="text-2xl font-bold text-navy">{stats?.defaultedLoans || 0}</p>
                      <p className="text-xs text-slate-500">متعثرة</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Filter Bar */}
            <Card className="rounded-2xl shadow-sm border-slate-100">
              <CardContent className="p-4">
                <div className="flex flex-col md:flex-row gap-4">
                  <div className="relative flex-1">
                    <Search className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-500" aria-hidden="true" />
                    <Input
                      placeholder="البحث باسم الموظف أو الرقم..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="pe-10 rounded-xl h-11"
                    />
                  </div>
                  <Select value={statusFilter} onValueChange={(v) => setStatusFilter(v as LoanStatus | 'all')}>
                    <SelectTrigger className="w-[180px] rounded-xl h-11">
                      <SelectValue placeholder="الحالة" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">جميع الحالات</SelectItem>
                      {Object.entries(LOAN_STATUS_LABELS).map(([key, label]) => (
                        <SelectItem key={key} value={key}>{label.ar}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <Select value={loanTypeFilter} onValueChange={(v) => setLoanTypeFilter(v as LoanType | 'all')}>
                    <SelectTrigger className="w-[180px] rounded-xl h-11">
                      <SelectValue placeholder="نوع القرض" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">جميع الأنواع</SelectItem>
                      {Object.entries(LOAN_TYPE_LABELS).map(([key, label]) => (
                        <SelectItem key={key} value={key}>{label.ar}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <Button
                    onClick={() => navigate({ to: '/dashboard/hr/loans/new' })}
                    className="bg-emerald-500 hover:bg-emerald-600 text-white rounded-xl shadow-lg shadow-emerald-500/20"
                  >
                    <Plus className="w-4 h-4 ms-2" aria-hidden="true" />
                    قرض جديد
                  </Button>
                </div>

                {/* Selection Mode Controls */}
                {selectionMode && selectedIds.length > 0 && (
                  <div className="flex items-center gap-4 mt-4 pt-4 border-t border-slate-100">
                    <Checkbox
                      checked={selectedIds.length === loans.length}
                      onCheckedChange={handleSelectAll}
                    />
                    <span className="text-sm text-slate-600">
                      {selectedIds.length} محدد
                    </span>
                    <Button
                      variant="destructive"
                      size="sm"
                      onClick={handleBulkDelete}
                      disabled={bulkDeleteMutation.isPending}
                      className="rounded-xl"
                    >
                      <Trash2 className="w-4 h-4 ms-2" aria-hidden="true" />
                      حذف المحدد
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => {
                        setSelectionMode(false)
                        setSelectedIds([])
                      }}
                      className="rounded-xl"
                    >
                      إلغاء
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Loans List */}
            {isLoading ? (
              <Card className="rounded-2xl border-slate-100">
                <CardContent className="p-8 text-center">
                  <Loader2 className="w-8 h-8 animate-spin mx-auto text-emerald-500" />
                  <p className="mt-4 text-slate-500">جاري التحميل...</p>
                </CardContent>
              </Card>
            ) : error ? (
              <Card className="rounded-2xl border-slate-100">
                <CardContent className="p-8 text-center">
                  <AlertCircle className="w-8 h-8 mx-auto text-red-500" aria-hidden="true" />
                  <p className="mt-4 text-red-600">حدث خطأ في تحميل البيانات</p>
                </CardContent>
              </Card>
            ) : loans.length === 0 ? (
              <Card className="rounded-2xl border-slate-100">
                <CardContent className="p-8 text-center">
                  <Wallet className="w-12 h-12 mx-auto text-slate-300" />
                  <p className="mt-4 text-slate-500">لا توجد قروض</p>
                  <Button
                    onClick={() => navigate({ to: '/dashboard/hr/loans/new' })}
                    className="mt-4 bg-emerald-500 hover:bg-emerald-600 text-white rounded-xl"
                  >
                    <Plus className="w-4 h-4 ms-2" aria-hidden="true" />
                    إضافة قرض جديد
                  </Button>
                </CardContent>
              </Card>
            ) : (
              <div className="space-y-4">
                {loans.map((loan) => (
                  <Card
                    key={loan._id}
                    className="rounded-2xl shadow-sm border-slate-100 hover:shadow-md transition-shadow"
                  >
                    <CardContent className="p-5">
                      <div className="flex items-start gap-4">
                        {selectionMode && (
                          <Checkbox
                            checked={selectedIds.includes(loan._id)}
                            onCheckedChange={(checked) => handleSelectOne(loan._id, checked as boolean)}
                            className="mt-1"
                          />
                        )}

                        <div
                          className="flex-1 cursor-pointer"
                          onClick={() => navigate({ to: `/dashboard/hr/loans/${loan._id}` })}
                        >
                          <div className="flex items-start justify-between">
                            <div>
                              <div className="flex items-center gap-3 mb-2">
                                <h3 className="font-bold text-navy">
                                  {loan.employeeNameAr || loan.employeeName}
                                </h3>
                                <Badge className={getLoanTypeColor(loan.loanType)}>
                                  {LOAN_TYPE_LABELS[loan.loanType]?.ar}
                                </Badge>
                              </div>
                              <div className="flex items-center gap-4 text-sm text-slate-500">
                                <span className="flex items-center gap-1">
                                  <Building2 className="w-4 h-4" aria-hidden="true" />
                                  {loan.department || 'غير محدد'}
                                </span>
                                <span className="flex items-center gap-1">
                                  <Banknote className="w-4 h-4" />
                                  {formatCurrency(loan.loanAmount)}
                                </span>
                              </div>
                            </div>
                            <div className="flex items-center gap-2">
                              <Badge className={`flex items-center gap-1 ${getStatusColor(loan.status)}`}>
                                {getStatusIcon(loan.status)}
                                {LOAN_STATUS_LABELS[loan.status]?.ar}
                              </Badge>
                            </div>
                          </div>

                          {/* Balance Progress */}
                          {loan.status === 'active' && loan.balance && (
                            <div className="mt-4">
                              <div className="flex items-center justify-between text-sm mb-2">
                                <span className="text-slate-500">نسبة السداد</span>
                                <span className="font-medium text-navy">
                                  {loan.balance.completionPercentage || 0}%
                                </span>
                              </div>
                              <Progress value={loan.balance.completionPercentage || 0} className="h-2" />
                              <div className="flex items-center justify-between text-xs text-slate-600 mt-1">
                                <span>المسدد: {formatCurrency(loan.balance.paidAmount || 0)}</span>
                                <span>المتبقي: {formatCurrency(loan.balance.remainingBalance || 0)}</span>
                              </div>
                            </div>
                          )}

                          <div className="flex items-center gap-6 mt-4 text-sm">
                            <div className="flex items-center gap-2 text-slate-500">
                              <Calendar className="w-4 h-4" aria-hidden="true" />
                              <span>تاريخ الطلب: {new Date(loan.applicationDate).toLocaleDateString('ar-SA')}</span>
                            </div>
                            {loan.repayment && (
                              <div className="flex items-center gap-2 text-slate-500">
                                <Clock className="w-4 h-4" aria-hidden="true" />
                                <span>الأقساط: {loan.repayment.installments} قسط</span>
                              </div>
                            )}
                          </div>
                        </div>

                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon" className="rounded-xl" aria-label="خيارات">
                              <MoreHorizontal className="w-4 h-4" aria-hidden="true" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end" className="w-48">
                            <DropdownMenuItem
                              onClick={() => navigate({ to: `/dashboard/hr/loans/${loan._id}` })}
                            >
                              <Eye className="w-4 h-4 ms-2" aria-hidden="true" />
                              عرض التفاصيل
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              onClick={() => navigate({ to: `/dashboard/hr/loans/new?editId=${loan._id}` })}
                            >
                              <Edit className="w-4 h-4 ms-2" aria-hidden="true" />
                              تعديل
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem
                              onClick={() => {
                                setSelectionMode(true)
                                setSelectedIds([loan._id])
                              }}
                            >
                              <Checkbox className="w-4 h-4 ms-2" />
                              تحديد
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem
                              className="text-red-600"
                              onClick={() => deleteMutation.mutate(loan._id)}
                            >
                              <Trash2 className="w-4 h-4 ms-2" aria-hidden="true" />
                              حذف
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </div>

          {/* RIGHT COLUMN (Widgets) */}
          <HRSidebar context="employees" />
        </div>
      </Main>
    </>
  )
}
