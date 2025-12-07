import { useState, useMemo } from 'react'
import {
  Search, Plus, MoreHorizontal, Bell,
  Calendar, Lock, Unlock, XCircle, CheckCircle, Clock,
  AlertCircle, TrendingUp, DollarSign, FileText, Loader2
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Header } from '@/components/layout/header'
import { TopNav } from '@/components/layout/top-nav'
import { DynamicIsland } from '@/components/dynamic-island'
import { Main } from '@/components/layout/main'
import { LanguageSwitcher } from '@/components/language-switcher'
import { ThemeSwitch } from '@/components/theme-switch'
import { ConfigDrawer } from '@/components/config-drawer'
import { ProfileDropdown } from '@/components/profile-dropdown'
import { Skeleton } from '@/components/ui/skeleton'
import { ProductivityHero } from '@/components/productivity-hero'
import { FinanceSidebar } from './finance-sidebar'
import {
  useFiscalPeriods,
  useCurrentFiscalPeriod,
  useFiscalYearsSummary,
  useFiscalPeriodBalances,
  useCreateFiscalYear,
  useOpenFiscalPeriod,
  useCloseFiscalPeriod,
  useReopenFiscalPeriod,
  useLockFiscalPeriod,
  useYearEndClosing,
} from '@/hooks/useAccounting'
import type { FiscalPeriod, FiscalPeriodStatus } from '@/services/accountingService'

export default function FiscalPeriodsDashboard() {
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedYear, setSelectedYear] = useState<number | 'all'>('all')
  const [createYearOpen, setCreateYearOpen] = useState(false)
  const [yearEndWizardOpen, setYearEndWizardOpen] = useState(false)
  const [selectedYearForClosing, setSelectedYearForClosing] = useState<number | null>(null)
  const [balancesDialogOpen, setBalancesDialogOpen] = useState(false)
  const [selectedPeriodForBalances, setSelectedPeriodForBalances] = useState<string | null>(null)

  // Create year form state
  const [newFiscalYear, setNewFiscalYear] = useState('')
  const [startMonth, setStartMonth] = useState('1')

  // Fetch data
  const { data: periodsData, isLoading: isLoadingPeriods } = useFiscalPeriods()
  const { data: currentPeriod, isLoading: isLoadingCurrent } = useCurrentFiscalPeriod()
  const { data: yearsSummary, isLoading: isLoadingSummary } = useFiscalYearsSummary()
  const { data: balancesData } = useFiscalPeriodBalances(selectedPeriodForBalances || '')

  // Mutations
  const createFiscalYear = useCreateFiscalYear()
  const openPeriod = useOpenFiscalPeriod()
  const closePeriod = useCloseFiscalPeriod()
  const reopenPeriod = useReopenFiscalPeriod()
  const lockPeriod = useLockFiscalPeriod()
  const yearEndClosing = useYearEndClosing()

  const isLoading = isLoadingPeriods || isLoadingCurrent || isLoadingSummary

  // Group periods by fiscal year
  const periodsByYear = useMemo(() => {
    if (!periodsData) return {}
    const grouped: Record<number, FiscalPeriod[]> = {}
    periodsData.forEach((period: FiscalPeriod) => {
      if (!grouped[period.fiscalYear]) {
        grouped[period.fiscalYear] = []
      }
      grouped[period.fiscalYear].push(period)
    })
    // Sort periods within each year
    Object.keys(grouped).forEach(year => {
      grouped[Number(year)].sort((a, b) => a.periodNumber - b.periodNumber)
    })
    return grouped
  }, [periodsData])

  // Get available years
  const availableYears = useMemo(() => {
    return Object.keys(periodsByYear).map(Number).sort((a, b) => b - a)
  }, [periodsByYear])

  // Filter periods based on search and selected year
  const filteredYears = useMemo(() => {
    if (selectedYear === 'all') {
      return availableYears
    }
    return availableYears.filter(year => year === selectedYear)
  }, [availableYears, selectedYear])

  // Handle create fiscal year
  const handleCreateYear = () => {
    if (!newFiscalYear || !startMonth) return

    createFiscalYear.mutate(
      { fiscalYear: parseInt(newFiscalYear), startMonth: parseInt(startMonth) },
      {
        onSuccess: () => {
          setCreateYearOpen(false)
          setNewFiscalYear('')
          setStartMonth('1')
        },
      }
    )
  }

  // Handle year-end closing
  const handleYearEndClosing = () => {
    if (!selectedYearForClosing) return

    // Find the last period of the year
    const yearPeriods = periodsByYear[selectedYearForClosing]
    if (!yearPeriods || yearPeriods.length === 0) return

    const lastPeriod = yearPeriods[yearPeriods.length - 1]

    yearEndClosing.mutate(lastPeriod._id, {
      onSuccess: () => {
        setYearEndWizardOpen(false)
        setSelectedYearForClosing(null)
      },
    })
  }

  // Get status badge
  const getStatusBadge = (status: FiscalPeriodStatus) => {
    const statusConfig = {
      future: { label: 'مستقبلي', labelEn: 'Future', color: 'bg-slate-100 text-slate-700', icon: Clock },
      open: { label: 'مفتوح', labelEn: 'Open', color: 'bg-emerald-100 text-emerald-700', icon: Unlock },
      closed: { label: 'مغلق', labelEn: 'Closed', color: 'bg-amber-100 text-amber-700', icon: Lock },
      locked: { label: 'مقفل', labelEn: 'Locked', color: 'bg-red-100 text-red-700', icon: Lock },
    }

    const config = statusConfig[status]
    const Icon = config.icon

    return (
      <Badge className={`${config.color} border-0 px-2 py-1 gap-1.5`}>
        <Icon className="w-3 h-3" />
        {config.label}
      </Badge>
    )
  }

  // Get available actions for a period
  const getAvailableActions = (period: FiscalPeriod) => {
    const actions = []

    if (period.status === 'future') {
      actions.push({
        label: 'فتح',
        icon: Unlock,
        onClick: () => openPeriod.mutate(period._id),
        variant: 'default' as const,
      })
    }

    if (period.status === 'open') {
      actions.push({
        label: 'إغلاق',
        icon: Lock,
        onClick: () => closePeriod.mutate(period._id),
        variant: 'default' as const,
      })
    }

    if (period.status === 'closed') {
      actions.push({
        label: 'إعادة فتح',
        icon: Unlock,
        onClick: () => reopenPeriod.mutate(period._id),
        variant: 'outline' as const,
      })
      actions.push({
        label: 'قفل نهائي',
        icon: Lock,
        onClick: () => lockPeriod.mutate(period._id),
        variant: 'destructive' as const,
      })
    }

    return actions
  }

  // Format currency
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('ar-SA', {
      style: 'currency',
      currency: 'SAR',
      minimumFractionDigits: 0
    }).format(amount)
  }

  // Format date
  const formatDate = (date: string) => {
    return new Date(date).toLocaleDateString('ar-SA', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    })
  }

  const topNav = [
    { title: 'نظرة عامة', href: '/dashboard/finance/overview', isActive: false },
    { title: 'الفواتير', href: '/dashboard/finance/invoices', isActive: false },
    { title: 'المصروفات', href: '/dashboard/finance/expenses', isActive: false },
    { title: 'كشف الحساب', href: '/dashboard/finance/statements', isActive: false },
    { title: 'المعاملات', href: '/dashboard/finance/transactions', isActive: false },
    { title: 'تتبع الوقت', href: '/dashboard/finance/time-tracking', isActive: false },
    { title: 'نشاط الحساب', href: '/dashboard/finance/activity', isActive: false },
  ]

  // LOADING STATE
  if (isLoading) {
    return (
      <>
        <Header className="bg-navy shadow-none relative">
          <TopNav links={topNav} className="[&>a]:text-slate-300 [&>a:hover]:text-white [&>a[aria-current='page']]:text-white" />
          <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 z-50">
            <DynamicIsland />
          </div>
          <div className='ms-auto flex items-center gap-4'>
            <div className="relative hidden md:block">
              <Search className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" aria-hidden="true" />
              <input type="text" placeholder="بحث..." className="h-9 w-64 rounded-xl border border-white/10 bg-white/5 pe-9 ps-4 text-sm text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500/50" />
            </div>
            <Button variant="ghost" size="icon" className="relative rounded-full text-slate-300 hover:bg-white/10 hover:text-white" aria-label="الإشعارات">
                        <Bell className="h-5 w-5" aria-hidden="true" />
              <span className="absolute top-2 right-2 h-2 w-2 bg-red-500 rounded-full border border-navy"></span>
            </Button>
            <LanguageSwitcher className="text-slate-300 hover:bg-white/10 hover:text-white" />
            <ThemeSwitch className="text-slate-300 hover:bg-white/10 hover:text-white" />
            <ConfigDrawer className="text-slate-300 hover:bg-white/10 hover:text-white" />
            <ProfileDropdown className="text-slate-300 hover:bg-white/10 hover:text-white" />
          </div>
          <div className="absolute bottom-0 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-emerald-500/50 to-transparent"></div>
        </Header>
        <Main fluid={true} className="bg-[#f8f9fa] flex-1 w-full p-6 lg:p-8 space-y-8">
          <Skeleton className="h-32 w-full rounded-3xl" />
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
            <div className="lg:col-span-8 space-y-6">
              <Skeleton className="h-96 w-full rounded-3xl" />
            </div>
            <div className="lg:col-span-4 space-y-6">
              <Skeleton className="h-32 w-full rounded-2xl" />
              <Skeleton className="h-32 w-full rounded-2xl" />
            </div>
          </div>
        </Main>
      </>
    )
  }

  return (
    <>
      <Header className="bg-navy shadow-none relative">
        <TopNav links={topNav} className="[&>a]:text-slate-300 [&>a:hover]:text-white [&>a[aria-current='page']]:text-white" />

        {/* Dynamic Island - Centered */}
        <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 z-50">
          <DynamicIsland />
        </div>

        <div className='ms-auto flex items-center gap-4'>
          <div className="relative hidden md:block">
            <Search className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" aria-hidden="true" />
            <input
              type="text"
              placeholder="بحث في الفترات..."
              className="h-9 w-64 rounded-xl border border-white/10 bg-white/5 pe-9 ps-4 text-sm text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500/50"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          <Button variant="ghost" size="icon" className="relative rounded-full text-slate-300 hover:bg-white/10 hover:text-white" aria-label="الإشعارات">
                        <Bell className="h-5 w-5" aria-hidden="true" />
            <span className="absolute top-2 right-2 h-2 w-2 bg-red-500 rounded-full border border-navy"></span>
          </Button>
          <LanguageSwitcher className="text-slate-300 hover:bg-white/10 hover:text-white" />
          <ThemeSwitch className="text-slate-300 hover:bg-white/10 hover:text-white" />
          <ConfigDrawer className="text-slate-300 hover:bg-white/10 hover:text-white" />
          <ProfileDropdown className="text-slate-300 hover:bg-white/10 hover:text-white" />
        </div>

        {/* Bottom Gradient Line */}
        <div className="absolute bottom-0 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-emerald-500/50 to-transparent"></div>
      </Header>

      <Main fluid={true} className="bg-[#f8f9fa] flex-1 w-full p-6 lg:p-8 space-y-8 rounded-tr-3xl shadow-inner border-r border-white/5 overflow-hidden font-['IBM_Plex_Sans_Arabic']">

        {/* HERO SECTION */}
        <ProductivityHero
          badge="المحاسبة"
          title="الفترات المالية"
          type="finance"
        >
          <div className="flex gap-3">
            <Dialog open={yearEndWizardOpen} onOpenChange={setYearEndWizardOpen}>
              <DialogTrigger asChild>
                <Button variant="outline" className="bg-white/5 border-white/10 text-white hover:bg-white/10 rounded-xl h-10 px-5 backdrop-blur-sm">
                  <Calendar className="w-4 h-4 ms-2" aria-hidden="true" />
                  إغلاق نهاية السنة
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-[500px]">
                <DialogHeader>
                  <DialogTitle className="text-xl font-bold text-navy">إغلاق نهاية السنة المالية</DialogTitle>
                  <DialogDescription>
                    سيتم إغلاق جميع فترات السنة المالية المحددة وترحيل الأرصدة إلى السنة التالية
                  </DialogDescription>
                </DialogHeader>
                <div className="space-y-4 py-4">
                  <div className="space-y-2">
                    <Label htmlFor="year-closing">السنة المالية</Label>
                    <Select
                      value={selectedYearForClosing?.toString() || ''}
                      onValueChange={(v) => setSelectedYearForClosing(parseInt(v))}
                    >
                      <SelectTrigger id="year-closing" className="rounded-xl">
                        <SelectValue placeholder="اختر السنة المالية" />
                      </SelectTrigger>
                      <SelectContent>
                        {availableYears.map((year) => (
                          <SelectItem key={year} value={year.toString()}>
                            السنة المالية {year}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  {selectedYearForClosing && periodsByYear[selectedYearForClosing] && (
                    <div className="bg-amber-50 border border-amber-200 rounded-xl p-4">
                      <div className="flex items-start gap-3">
                        <AlertCircle className="w-5 h-5 text-amber-600 mt-0.5" aria-hidden="true" />
                        <div className="text-sm text-amber-900">
                          <p className="font-bold mb-2">تحذير: هذا الإجراء لا يمكن التراجع عنه</p>
                          <ul className="space-y-1 text-xs">
                            <li>• سيتم إغلاق جميع الفترات المفتوحة في السنة {selectedYearForClosing}</li>
                            <li>• سيتم ترحيل الأرصدة الختامية إلى السنة التالية</li>
                            <li>• سيتم إنشاء قيود الإقفال تلقائياً</li>
                            <li>• لن تتمكن من تعديل القيود بعد الإغلاق</li>
                          </ul>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
                <DialogFooter>
                  <Button
                    variant="outline"
                    onClick={() => setYearEndWizardOpen(false)}
                    className="rounded-xl"
                  >
                    إلغاء
                  </Button>
                  <Button
                    onClick={handleYearEndClosing}
                    disabled={!selectedYearForClosing || yearEndClosing.isPending}
                    className="bg-amber-500 hover:bg-amber-600 text-white rounded-xl"
                  >
                    {yearEndClosing.isPending ? (
                      <>
                        <Loader2 className="w-4 h-4 ms-2 animate-spin" aria-hidden="true" />
                        جاري الإغلاق...
                      </>
                    ) : (
                      <>
                        <Lock className="w-4 h-4 ms-2" />
                        إغلاق نهاية السنة
                      </>
                    )}
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>

            <Dialog open={createYearOpen} onOpenChange={setCreateYearOpen}>
              <DialogTrigger asChild>
                <Button className="bg-emerald-500 hover:bg-emerald-600 text-white border-0 shadow-lg shadow-emerald-500/20 rounded-xl h-10 px-5 font-bold">
                  <Plus className="w-4 h-4 ms-2" aria-hidden="true" />
                  سنة مالية جديدة
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-[500px]">
                <DialogHeader>
                  <DialogTitle className="text-xl font-bold text-navy">إنشاء سنة مالية جديدة</DialogTitle>
                  <DialogDescription>
                    سيتم إنشاء 12 فترة مالية (شهرية) للسنة المحددة
                  </DialogDescription>
                </DialogHeader>
                <div className="space-y-4 py-4">
                  <div className="space-y-2">
                    <Label htmlFor="fiscal-year">السنة المالية</Label>
                    <Input
                      id="fiscal-year"
                      type="number"
                      placeholder="مثال: 2025"
                      className="rounded-xl"
                      value={newFiscalYear}
                      onChange={(e) => setNewFiscalYear(e.target.value)}
                    />
                    <p className="text-xs text-slate-500">أدخل السنة بالأرقام (مثال: 2025)</p>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="start-month">شهر البداية</Label>
                    <Select value={startMonth} onValueChange={setStartMonth}>
                      <SelectTrigger id="start-month" className="rounded-xl">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="1">يناير (محرم)</SelectItem>
                        <SelectItem value="2">فبراير (صفر)</SelectItem>
                        <SelectItem value="3">مارس (ربيع الأول)</SelectItem>
                        <SelectItem value="4">أبريل (ربيع الثاني)</SelectItem>
                        <SelectItem value="5">مايو (جمادى الأولى)</SelectItem>
                        <SelectItem value="6">يونيو (جمادى الآخرة)</SelectItem>
                        <SelectItem value="7">يوليو (رجب)</SelectItem>
                        <SelectItem value="8">أغسطس (شعبان)</SelectItem>
                        <SelectItem value="9">سبتمبر (رمضان)</SelectItem>
                        <SelectItem value="10">أكتوبر (شوال)</SelectItem>
                        <SelectItem value="11">نوفمبر (ذو القعدة)</SelectItem>
                        <SelectItem value="12">ديسمبر (ذو الحجة)</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
                    <div className="flex items-start gap-3">
                      <FileText className="w-5 h-5 text-blue-600 mt-0.5" aria-hidden="true" />
                      <div className="text-sm text-blue-900">
                        <p className="font-medium">معلومة:</p>
                        <p className="text-xs mt-1">
                          سيتم إنشاء 12 فترة مالية تلقائياً بداية من الشهر المحدد.
                          جميع الفترات ستكون بحالة "مستقبلي" ويمكنك فتحها لاحقاً.
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
                <DialogFooter>
                  <Button
                    variant="outline"
                    onClick={() => setCreateYearOpen(false)}
                    className="rounded-xl"
                  >
                    إلغاء
                  </Button>
                  <Button
                    onClick={handleCreateYear}
                    disabled={!newFiscalYear || !startMonth || createFiscalYear.isPending}
                    className="bg-emerald-500 hover:bg-emerald-600 text-white rounded-xl"
                  >
                    {createFiscalYear.isPending ? (
                      <>
                        <Loader2 className="w-4 h-4 ms-2 animate-spin" aria-hidden="true" />
                        جاري الإنشاء...
                      </>
                    ) : (
                      <>
                        <Plus className="w-4 h-4 ms-2" aria-hidden="true" />
                        إنشاء السنة المالية
                      </>
                    )}
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </div>
        </ProductivityHero>

        {/* MAIN GRID LAYOUT */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

          {/* Fiscal Periods List */}
          <div className="lg:col-span-2 space-y-6">

            {/* Year Filter */}
            <div className="bg-white p-4 rounded-2xl shadow-sm border border-slate-100">
              <div className="flex items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                  <Label className="text-slate-700 font-medium">السنة المالية:</Label>
                  <Select
                    value={selectedYear.toString()}
                    onValueChange={(v) => setSelectedYear(v === 'all' ? 'all' : parseInt(v))}
                  >
                    <SelectTrigger className="w-[200px] rounded-xl">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">جميع السنوات</SelectItem>
                      {availableYears.map((year) => (
                        <SelectItem key={year} value={year.toString()}>
                          السنة المالية {year}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {currentPeriod && (
                  <div className="flex items-center gap-2 text-sm">
                    <span className="text-slate-500">الفترة الحالية:</span>
                    <Badge className="bg-emerald-500 text-white border-0">
                      {currentPeriod.nameAr}
                    </Badge>
                  </div>
                )}
              </div>
            </div>

            {/* Periods by Year */}
            {filteredYears.length === 0 ? (
              <div className="bg-white rounded-3xl p-12 text-center border border-slate-100 shadow-sm">
                <div className="w-16 h-16 bg-blue-50 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Calendar className="h-8 w-8 text-brand-blue" aria-hidden="true" />
                </div>
                <h3 className="text-xl font-bold text-slate-900 mb-2">لا توجد فترات مالية</h3>
                <p className="text-slate-500 mb-6">ابدأ بإنشاء سنة مالية جديدة</p>
                <Button
                  onClick={() => setCreateYearOpen(true)}
                  className="bg-brand-blue hover:bg-blue-600 text-white px-8"
                >
                  <Plus className="ms-2 h-4 w-4" aria-hidden="true" />
                  إنشاء سنة مالية
                </Button>
              </div>
            ) : (
              <div className="space-y-8">
                {filteredYears.map((year) => {
                  const periods = periodsByYear[year]
                  if (!periods) return null

                  const openCount = periods.filter(p => p.status === 'open').length
                  const closedCount = periods.filter(p => p.status === 'closed').length
                  const lockedCount = periods.filter(p => p.status === 'locked').length

                  return (
                    <Card key={year} className="border-0 shadow-sm rounded-[32px] overflow-hidden">
                      <CardHeader className="border-b border-slate-100 pb-4 pt-6 px-8 bg-gradient-to-r from-navy/5 to-transparent">
                        <div className="flex justify-between items-center">
                          <div>
                            <CardTitle className="text-2xl font-bold text-navy">السنة المالية {year}</CardTitle>
                            <div className="flex items-center gap-4 mt-2 text-sm text-slate-600">
                              <span className="flex items-center gap-1">
                                <Unlock className="w-4 h-4 text-emerald-600" />
                                {openCount} مفتوحة
                              </span>
                              <span className="flex items-center gap-1">
                                <Lock className="w-4 h-4 text-amber-600" />
                                {closedCount} مغلقة
                              </span>
                              <span className="flex items-center gap-1">
                                <Lock className="w-4 h-4 text-red-600" />
                                {lockedCount} مقفلة
                              </span>
                            </div>
                          </div>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => {
                              setSelectedYearForClosing(year)
                              setYearEndWizardOpen(true)
                            }}
                            className="rounded-xl"
                          >
                            <Calendar className="w-4 h-4 ms-2" aria-hidden="true" />
                            إغلاق السنة
                          </Button>
                        </div>
                      </CardHeader>
                      <CardContent className="p-6">
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                          {periods.map((period) => (
                            <div
                              key={period._id}
                              className="bg-white border-2 border-slate-100 rounded-2xl p-4 hover:border-brand-blue hover:shadow-md transition-all"
                            >
                              <div className="flex justify-between items-start mb-3">
                                <div className="flex-1">
                                  <h4 className="font-bold text-navy text-base mb-1">
                                    {period.nameAr}
                                  </h4>
                                  <p className="text-xs text-slate-500">
                                    {formatDate(period.startDate)} - {formatDate(period.endDate)}
                                  </p>
                                </div>
                                <DropdownMenu>
                                  <DropdownMenuTrigger asChild>
                                    <Button variant="ghost" size="icon" className="h-8 w-8 rounded-full" aria-label="خيارات">
                                    <MoreHorizontal className="w-4 h-4" aria-hidden="true" />
                                    </Button>
                                  </DropdownMenuTrigger>
                                  <DropdownMenuContent align="end">
                                    <DropdownMenuItem
                                      onClick={() => {
                                        setSelectedPeriodForBalances(period._id)
                                        setBalancesDialogOpen(true)
                                      }}
                                    >
                                      <DollarSign className="w-4 h-4 ms-2" />
                                      عرض الأرصدة
                                    </DropdownMenuItem>
                                    <DropdownMenuSeparator />
                                    {getAvailableActions(period).map((action, idx) => (
                                      <DropdownMenuItem
                                        key={idx}
                                        onClick={action.onClick}
                                      >
                                        <action.icon className="w-4 h-4 ms-2" />
                                        {action.label}
                                      </DropdownMenuItem>
                                    ))}
                                  </DropdownMenuContent>
                                </DropdownMenu>
                              </div>

                              <div className="mb-3">
                                {getStatusBadge(period.status)}
                              </div>

                              {period.status !== 'future' && (
                                <div className="space-y-1.5 text-xs text-slate-600 pt-3 border-t border-slate-100">
                                  {period.openedAt && (
                                    <div className="flex justify-between">
                                      <span>تاريخ الفتح:</span>
                                      <span className="font-medium">{formatDate(period.openedAt)}</span>
                                    </div>
                                  )}
                                  {period.closedAt && (
                                    <div className="flex justify-between">
                                      <span>تاريخ الإغلاق:</span>
                                      <span className="font-medium">{formatDate(period.closedAt)}</span>
                                    </div>
                                  )}
                                  {period.lockedAt && (
                                    <div className="flex justify-between">
                                      <span>تاريخ القفل:</span>
                                      <span className="font-medium text-red-600">{formatDate(period.lockedAt)}</span>
                                    </div>
                                  )}
                                </div>
                              )}
                            </div>
                          ))}
                        </div>
                      </CardContent>
                    </Card>
                  )
                })}
              </div>
            )}
          </div>

          {/* Sidebar */}
          <FinanceSidebar context="overview" />
        </div>
      </Main>

      {/* Period Balances Dialog */}
      <Dialog open={balancesDialogOpen} onOpenChange={setBalancesDialogOpen}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle className="text-xl font-bold text-navy">أرصدة الفترة المالية</DialogTitle>
            <DialogDescription>
              عرض الأرصدة والملخص المالي للفترة المحددة
            </DialogDescription>
          </DialogHeader>
          {balancesData ? (
            <div className="space-y-4 py-4">
              <div className="grid grid-cols-2 gap-4">
                <Card className="border border-slate-200">
                  <CardContent className="p-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-emerald-50 flex items-center justify-center">
                        <TrendingUp className="w-5 h-5 text-emerald-600" />
                      </div>
                      <div>
                        <p className="text-xs text-slate-500">الأصول</p>
                        <p className="text-lg font-bold text-navy">
                          {formatCurrency(balancesData.totalAssets)}
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card className="border border-slate-200">
                  <CardContent className="p-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-red-50 flex items-center justify-center">
                        <TrendingUp className="w-5 h-5 text-red-600" />
                      </div>
                      <div>
                        <p className="text-xs text-slate-500">الخصوم</p>
                        <p className="text-lg font-bold text-navy">
                          {formatCurrency(balancesData.totalLiabilities)}
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card className="border border-slate-200">
                  <CardContent className="p-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-blue-50 flex items-center justify-center">
                        <DollarSign className="w-5 h-5 text-blue-600" />
                      </div>
                      <div>
                        <p className="text-xs text-slate-500">حقوق الملكية</p>
                        <p className="text-lg font-bold text-navy">
                          {formatCurrency(balancesData.totalEquity)}
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card className="border border-slate-200">
                  <CardContent className="p-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-purple-50 flex items-center justify-center">
                        <FileText className="w-5 h-5 text-purple-600" aria-hidden="true" />
                      </div>
                      <div>
                        <p className="text-xs text-slate-500">الإيرادات</p>
                        <p className="text-lg font-bold text-navy">
                          {formatCurrency(balancesData.totalIncome)}
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card className="border border-slate-200">
                  <CardContent className="p-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-amber-50 flex items-center justify-center">
                        <FileText className="w-5 h-5 text-amber-600" aria-hidden="true" />
                      </div>
                      <div>
                        <p className="text-xs text-slate-500">المصروفات</p>
                        <p className="text-lg font-bold text-navy">
                          {formatCurrency(balancesData.totalExpenses)}
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card className={`border-2 ${balancesData.netIncome >= 0 ? 'border-emerald-200 bg-emerald-50' : 'border-red-200 bg-red-50'}`}>
                  <CardContent className="p-4">
                    <div className="flex items-center gap-3">
                      <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${balancesData.netIncome >= 0 ? 'bg-emerald-100' : 'bg-red-100'}`}>
                        <TrendingUp className={`w-5 h-5 ${balancesData.netIncome >= 0 ? 'text-emerald-700' : 'text-red-700'}`} />
                      </div>
                      <div>
                        <p className="text-xs text-slate-600">صافي الدخل</p>
                        <p className={`text-lg font-bold ${balancesData.netIncome >= 0 ? 'text-emerald-700' : 'text-red-700'}`}>
                          {formatCurrency(balancesData.netIncome)}
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>

              <div className={`rounded-xl p-4 flex items-center gap-3 ${balancesData.isBalanced ? 'bg-emerald-50 border border-emerald-200' : 'bg-red-50 border border-red-200'}`}>
                {balancesData.isBalanced ? (
                  <>
                    <CheckCircle className="w-5 h-5 text-emerald-600" aria-hidden="true" />
                    <div className="text-sm text-emerald-900">
                      <p className="font-bold">الميزانية متوازنة</p>
                      <p className="text-xs">الأصول = الخصوم + حقوق الملكية</p>
                    </div>
                  </>
                ) : (
                  <>
                    <XCircle className="w-5 h-5 text-red-600" />
                    <div className="text-sm text-red-900">
                      <p className="font-bold">الميزانية غير متوازنة</p>
                      <p className="text-xs">يرجى مراجعة القيود المحاسبية</p>
                    </div>
                  </>
                )}
              </div>
            </div>
          ) : (
            <div className="py-12 text-center">
              <Loader2 className="w-8 h-8 animate-spin text-slate-400 mx-auto mb-3" aria-hidden="true" />
              <p className="text-slate-500">جاري تحميل الأرصدة...</p>
            </div>
          )}
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setBalancesDialogOpen(false)
                setSelectedPeriodForBalances(null)
              }}
              className="rounded-xl"
            >
              إغلاق
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  )
}
