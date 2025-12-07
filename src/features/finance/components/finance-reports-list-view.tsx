import { FinanceSidebar } from './finance-sidebar'
import { useState } from 'react'
import { Main } from '@/components/layout/main'
import { LanguageSwitcher } from '@/components/language-switcher'
import { ThemeSwitch } from '@/components/theme-switch'
import { ConfigDrawer } from '@/components/config-drawer'
import { ProfileDropdown } from '@/components/profile-dropdown'
import { ProductivityHero } from '@/components/productivity-hero'
import { useNavigate } from '@tanstack/react-router'
import { useReports, useReportStats, useBulkDeleteReports, useAddToFavorites, useRemoveFromFavorites } from '@/hooks/useReports'
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
  AlertCircle, Loader2, ChevronLeft, FileText, Calendar,
  BarChart3, PieChart, TrendingUp, Clock, Star, StarOff,
  Play, Download, Share2, Copy, Activity, DollarSign,
  Receipt, CreditCard, Wallet
} from 'lucide-react'
import {
  reportStatusLabels,
  reportCategoryLabels,
  reportTypeLabels,
  reportFormatLabels,
  accessLevelLabels,
  usageFrequencyLabels,
  ReportStatus,
  ReportCategory,
  ReportType,
  ReportSection,
  categoriesBySection,
} from '@/services/reportsService'

export function FinanceReportsListView() {
  const navigate = useNavigate()
  const [searchQuery, setSearchQuery] = useState('')
  const [statusFilter, setStatusFilter] = useState<ReportStatus | 'all'>('all')
  const [categoryFilter, setCategoryFilter] = useState<ReportCategory | 'all'>('all')
  const [typeFilter, setTypeFilter] = useState<ReportType | 'all'>('all')
  const [selectedIds, setSelectedIds] = useState<string[]>([])
  const [selectionMode, setSelectionMode] = useState(false)

  // Filter for finance section reports
  const financeCategories = categoriesBySection[ReportSection.FINANCE]

  const { data: reportsData, isLoading, error } = useReports({
    status: statusFilter !== 'all' ? statusFilter : undefined,
    reportSection: ReportSection.FINANCE,
    reportCategory: categoryFilter !== 'all' ? categoryFilter : undefined,
    reportType: typeFilter !== 'all' ? typeFilter : undefined,
    search: searchQuery || undefined,
  })

  const { data: stats } = useReportStats()
  const bulkDeleteMutation = useBulkDeleteReports()
  const addToFavoritesMutation = useAddToFavorites()
  const removeFromFavoritesMutation = useRemoveFromFavorites()

  const reports = Array.isArray(reportsData) ? reportsData : []

  const handleSelectAll = () => {
    if (selectedIds.length === reports.length) {
      setSelectedIds([])
    } else {
      setSelectedIds(reports.map(r => r.reportId))
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
    if (selectedIds.length > 0 && confirm(`هل أنت متأكد من حذف ${selectedIds.length} تقرير؟`)) {
      bulkDeleteMutation.mutate(selectedIds, {
        onSuccess: () => {
          setSelectedIds([])
          setSelectionMode(false)
        },
      })
    }
  }

  const handleToggleFavorite = (id: string, isFavorite?: boolean) => {
    if (isFavorite) {
      removeFromFavoritesMutation.mutate(id)
    } else {
      addToFavoritesMutation.mutate(id)
    }
  }

  const getStatusColor = (status: ReportStatus) => {
    const colors: Record<ReportStatus, string> = {
      active: 'bg-emerald-100 text-emerald-700 border-emerald-200',
      inactive: 'bg-slate-100 text-slate-700 border-slate-200',
      draft: 'bg-amber-100 text-amber-700 border-amber-200',
      archived: 'bg-blue-100 text-blue-700 border-blue-200',
      deprecated: 'bg-red-100 text-red-700 border-red-200',
    }
    return colors[status]
  }

  const getCategoryColor = (category: ReportCategory) => {
    const colors: Record<string, string> = {
      invoices: 'bg-blue-100 text-blue-700',
      expenses: 'bg-red-100 text-red-700',
      payments: 'bg-emerald-100 text-emerald-700',
      revenue: 'bg-green-100 text-green-700',
      cash_flow: 'bg-cyan-100 text-cyan-700',
      budgets: 'bg-purple-100 text-purple-700',
      financial_statements: 'bg-indigo-100 text-indigo-700',
      tax: 'bg-orange-100 text-orange-700',
      accounts_receivable: 'bg-teal-100 text-teal-700',
      accounts_payable: 'bg-pink-100 text-pink-700',
      profitability: 'bg-amber-100 text-amber-700',
    }
    return colors[category] || 'bg-slate-100 text-slate-700'
  }

  const getCategoryIcon = (category: ReportCategory) => {
    const icons: Record<string, any> = {
      invoices: Receipt,
      expenses: CreditCard,
      payments: Wallet,
      revenue: TrendingUp,
      cash_flow: Activity,
      budgets: PieChart,
      financial_statements: FileText,
      tax: DollarSign,
    }
    return icons[category] || FileText
  }

  const topNav = [
    { title: 'نظرة عامة', href: '/dashboard/overview', isActive: false },
    { title: 'الفواتير', href: '/dashboard/finance/invoices', isActive: false },
    { title: 'التقارير المالية', href: '/dashboard/finance/reports', isActive: true },
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
            <Search className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" aria-hidden="true" />
            <input type="text" placeholder="بحث..." className="h-9 w-64 rounded-xl border border-white/10 bg-white/5 pe-9 ps-4 text-sm text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500/50" />
          </div>
          <Button variant="ghost" size="icon" className="relative rounded-full text-slate-300 hover:bg-white/10 hover:text-white flex-shrink-0">
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
          badge="المالية"
          title="التقارير والتحليلات المالية"
          type="finance-reports"
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
                      <FileText className="w-5 h-5 text-blue-600" aria-hidden="true" />
                    </div>
                    <div>
                      <p className="text-xs text-slate-500">إجمالي التقارير</p>
                      <p className="text-xl font-bold text-navy">{reports.length}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
              <Card className="rounded-2xl border-slate-100">
                <CardContent className="p-4">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-emerald-100 rounded-xl">
                      <Activity className="w-5 h-5 text-emerald-600" />
                    </div>
                    <div>
                      <p className="text-xs text-slate-500">تقارير نشطة</p>
                      <p className="text-xl font-bold text-navy">{reports.filter(r => r.status === 'active').length}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
              <Card className="rounded-2xl border-slate-100">
                <CardContent className="p-4">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-purple-100 rounded-xl">
                      <Clock className="w-5 h-5 text-purple-600" aria-hidden="true" />
                    </div>
                    <div>
                      <p className="text-xs text-slate-500">تقارير مجدولة</p>
                      <p className="text-xl font-bold text-navy">{reports.filter(r => r.scheduling?.scheduled).length}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
              <Card className="rounded-2xl border-slate-100">
                <CardContent className="p-4">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-amber-100 rounded-xl">
                      <Star className="w-5 h-5 text-amber-600" />
                    </div>
                    <div>
                      <p className="text-xs text-slate-500">المفضلة</p>
                      <p className="text-xl font-bold text-navy">{reports.filter(r => r.isFavorite).length}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Filter Bar */}
            <Card className="rounded-2xl border-slate-100">
              <CardContent className="p-4">
                <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
                  <div className="flex flex-wrap items-center gap-3 w-full md:w-auto">
                    <div className="relative flex-1 md:w-48">
                      <Search className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" aria-hidden="true" />
                      <Input
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        placeholder="بحث عن تقرير..."
                        className="pe-9 rounded-xl"
                      />
                    </div>
                    <Select value={statusFilter} onValueChange={(v) => setStatusFilter(v as ReportStatus | 'all')}>
                      <SelectTrigger className="w-[120px] rounded-xl">
                        <SelectValue placeholder="الحالة" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">كل الحالات</SelectItem>
                        {Object.entries(reportStatusLabels).map(([key, label]) => (
                          <SelectItem key={key} value={key}>{label.ar}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <Select value={categoryFilter} onValueChange={(v) => setCategoryFilter(v as ReportCategory | 'all')}>
                      <SelectTrigger className="w-[140px] rounded-xl">
                        <SelectValue placeholder="الفئة" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">كل الفئات</SelectItem>
                        {financeCategories.map((cat) => (
                          <SelectItem key={cat} value={cat}>{reportCategoryLabels[cat]?.ar}</SelectItem>
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
                      onClick={() => navigate({ to: '/dashboard/finance/reports/new' })}
                      className="bg-emerald-500 hover:bg-emerald-600 text-white rounded-xl shadow-lg shadow-emerald-500/20"
                    >
                      <Plus className="w-4 h-4 ms-1" aria-hidden="true" />
                      تقرير جديد
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Selection Header */}
            {selectionMode && (
              <div className="flex items-center gap-4 px-4 py-2 bg-slate-100 rounded-xl">
                <Checkbox
                  checked={selectedIds.length === reports.length && reports.length > 0}
                  onCheckedChange={handleSelectAll}
                />
                <span className="text-sm text-slate-600">
                  تحديد الكل ({reports.length})
                </span>
              </div>
            )}

            {/* Reports List */}
            {isLoading ? (
              <Card className="rounded-2xl border-slate-100">
                <CardContent className="p-8 text-center">
                  <Loader2 className="w-8 h-8 animate-spin mx-auto text-emerald-500" aria-hidden="true" />
                  <p className="mt-4 text-slate-500">جاري تحميل التقارير...</p>
                </CardContent>
              </Card>
            ) : error ? (
              <Card className="rounded-2xl border-slate-100">
                <CardContent className="p-8 text-center">
                  <AlertCircle className="w-8 h-8 mx-auto text-red-500" aria-hidden="true" />
                  <p className="mt-4 text-red-600">حدث خطأ في تحميل البيانات</p>
                </CardContent>
              </Card>
            ) : reports.length === 0 ? (
              <Card className="rounded-2xl border-slate-100">
                <CardContent className="p-8 text-center">
                  <FileText className="w-12 h-12 mx-auto text-slate-300" aria-hidden="true" />
                  <p className="mt-4 text-slate-500">لا توجد تقارير مالية</p>
                  <Button
                    onClick={() => navigate({ to: '/dashboard/finance/reports/new' })}
                    className="mt-4 bg-emerald-500 hover:bg-emerald-600 text-white rounded-xl"
                  >
                    <Plus className="w-4 h-4 ms-1" aria-hidden="true" />
                    إنشاء تقرير جديد
                  </Button>
                </CardContent>
              </Card>
            ) : (
              <div className="space-y-4">
                {reports.map((report) => {
                  const CategoryIcon = getCategoryIcon(report.reportCategory)

                  return (
                    <Card key={report.reportId} className="rounded-2xl border-slate-100 hover:shadow-md transition-shadow">
                      <CardContent className="p-4">
                        <div className="flex items-start gap-4">
                          {selectionMode && (
                            <Checkbox
                              checked={selectedIds.includes(report.reportId)}
                              onCheckedChange={() => handleSelectOne(report.reportId)}
                              className="mt-1"
                            />
                          )}
                          <div className="flex-1">
                            <div className="flex items-start justify-between">
                              <div className="flex items-center gap-3">
                                <div className="p-2 bg-emerald-100 rounded-xl">
                                  <CategoryIcon className="w-5 h-5 text-emerald-600" />
                                </div>
                                <div>
                                  <div className="flex items-center gap-2 mb-1">
                                    <h3 className="font-bold text-navy">
                                      {report.reportNameAr || report.reportName}
                                    </h3>
                                    <Badge className={getStatusColor(report.status)}>
                                      {reportStatusLabels[report.status]?.ar}
                                    </Badge>
                                    {report.isFavorite && (
                                      <Star className="w-4 h-4 text-amber-500 fill-amber-500" />
                                    )}
                                  </div>
                                  <p className="text-sm text-slate-500">
                                    {report.reportCode} - {report.reportDescription?.slice(0, 50) || reportCategoryLabels[report.reportCategory]?.ar}
                                  </p>
                                </div>
                              </div>
                              <div className="flex items-center gap-2">
                                <Badge className={getCategoryColor(report.reportCategory)}>
                                  {reportCategoryLabels[report.reportCategory]?.ar}
                                </Badge>
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  className="rounded-xl"
                                  onClick={() => handleToggleFavorite(report.reportId, report.isFavorite)}
                                >
                                  {report.isFavorite ? (
                                    <Star className="w-4 h-4 text-amber-500 fill-amber-500" />
                                  ) : (
                                    <StarOff className="w-4 h-4 text-slate-400" />
                                  )}
                                </Button>
                                <DropdownMenu>
                                  <DropdownMenuTrigger asChild>
                                    <Button variant="ghost" size="icon" className="rounded-xl" aria-label="خيارات">
                                    <MoreHorizontal className="w-4 h-4" aria-hidden="true" />
                                    </Button>
                                  </DropdownMenuTrigger>
                                  <DropdownMenuContent align="end">
                                    <DropdownMenuItem onClick={() => navigate({ to: `/dashboard/finance/reports/${report.reportId}` })}>
                                      <Eye className="w-4 h-4 ms-2" aria-hidden="true" />
                                      عرض التفاصيل
                                    </DropdownMenuItem>
                                    <DropdownMenuItem>
                                      <Play className="w-4 h-4 ms-2" />
                                      تشغيل التقرير
                                    </DropdownMenuItem>
                                    <DropdownMenuItem>
                                      <Download className="w-4 h-4 ms-2" aria-hidden="true" />
                                      تصدير
                                    </DropdownMenuItem>
                                    <DropdownMenuSeparator />
                                    <DropdownMenuItem onClick={() => navigate({ to: `/dashboard/finance/reports/new?editId=${report.reportId}` })}>
                                      <Edit className="w-4 h-4 ms-2" aria-hidden="true" />
                                      تعديل
                                    </DropdownMenuItem>
                                    <DropdownMenuItem className="text-red-600">
                                      <Trash2 className="w-4 h-4 ms-2" aria-hidden="true" />
                                      حذف
                                    </DropdownMenuItem>
                                  </DropdownMenuContent>
                                </DropdownMenu>
                              </div>
                            </div>

                            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-4">
                              <div>
                                <p className="text-xs text-slate-500">النوع</p>
                                <p className="font-medium text-sm">
                                  {reportTypeLabels[report.reportType]?.ar}
                                </p>
                              </div>
                              <div>
                                <p className="text-xs text-slate-500">التنسيق</p>
                                <p className="font-medium text-sm">
                                  {reportFormatLabels[report.reportFormat]?.ar}
                                </p>
                              </div>
                              <div>
                                <p className="text-xs text-slate-500">التكرار</p>
                                <p className="font-medium text-sm">
                                  {usageFrequencyLabels[report.usageFrequency]?.ar}
                                </p>
                              </div>
                              <div>
                                <p className="text-xs text-slate-500">مرات التشغيل</p>
                                <p className="font-medium text-sm text-emerald-600">
                                  {report.runCount || 0}
                                </p>
                              </div>
                            </div>

                            <div className="flex items-center justify-between mt-4 pt-3 border-t border-slate-100">
                              <div className="flex items-center gap-4 text-xs text-slate-500">
                                <span>{report.reportOwner.ownerName}</span>
                                {report.lastRunDate && (
                                  <span className="flex items-center gap-1">
                                    <Calendar className="w-3 h-3" aria-hidden="true" />
                                    آخر تشغيل: {new Date(report.lastRunDate).toLocaleDateString('ar-SA')}
                                  </span>
                                )}
                              </div>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => navigate({ to: `/dashboard/finance/reports/${report.reportId}` })}
                                className="text-emerald-600 hover:text-emerald-700 hover:bg-emerald-50 rounded-xl"
                              >
                                عرض التفاصيل
                                <ChevronLeft className="w-4 h-4 me-1" aria-hidden="true" />
                              </Button>
                            </div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  )
                })}
              </div>
            )}
          </div>

          {/* Sidebar */}
          <FinanceSidebar context="reports" />
        </div>
      </Main>
    </>
  )
}
