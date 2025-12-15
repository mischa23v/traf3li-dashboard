import { useState, useMemo } from 'react'
import { useTranslation } from 'react-i18next'
import {
  Search, Plus, MoreHorizontal, Bell,
  Calendar, Lock, Unlock, XCircle, CheckCircle, Clock,
  AlertCircle, TrendingUp, DollarSign, FileText, Loader2,
  ChevronRight, ChevronLeft, Info, AlertTriangle
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
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
import {
  Alert,
  AlertDescription,
  AlertTitle,
} from "@/components/ui/alert"
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
import { cn } from '@/lib/utils'
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

export default function FiscalPeriodsView() {
  const { t, i18n } = useTranslation()
  const isRTL = i18n.language === 'ar'

  const [searchQuery, setSearchQuery] = useState('')
  const [selectedYear, setSelectedYear] = useState<number | 'all'>('all')
  const [viewMode, setViewMode] = useState<'grid' | 'timeline'>('grid')
  const [createYearOpen, setCreateYearOpen] = useState(false)
  const [yearEndWizardOpen, setYearEndWizardOpen] = useState(false)
  const [selectedYearForClosing, setSelectedYearForClosing] = useState<number | null>(null)
  const [balancesDialogOpen, setBalancesDialogOpen] = useState(false)
  const [selectedPeriodForBalances, setSelectedPeriodForBalances] = useState<string | null>(null)
  const [confirmDialogOpen, setConfirmDialogOpen] = useState(false)
  const [pendingAction, setPendingAction] = useState<{ type: string; periodId: string; periodName: string } | null>(null)

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

  // Handle period actions with confirmation
  const handlePeriodAction = (type: string, periodId: string, periodName: string) => {
    setPendingAction({ type, periodId, periodName })
    setConfirmDialogOpen(true)
  }

  const executeAction = () => {
    if (!pendingAction) return

    const { type, periodId } = pendingAction

    switch (type) {
      case 'open':
        openPeriod.mutate(periodId)
        break
      case 'close':
        closePeriod.mutate(periodId)
        break
      case 'reopen':
        reopenPeriod.mutate(periodId)
        break
      case 'lock':
        lockPeriod.mutate(periodId)
        break
    }

    setConfirmDialogOpen(false)
    setPendingAction(null)
  }

  // Get status badge
  const getStatusBadge = (status: FiscalPeriodStatus) => {
    const statusConfig = {
      future: {
        label: 'مستقبلي',
        labelEn: 'Future',
        color: 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300',
        icon: Clock
      },
      open: {
        label: 'مفتوح',
        labelEn: 'Open',
        color: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400',
        icon: Unlock
      },
      closed: {
        label: 'مغلق',
        labelEn: 'Closed',
        color: 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400',
        icon: Lock
      },
      locked: {
        label: 'مقفل نهائياً',
        labelEn: 'Locked',
        color: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400',
        icon: Lock
      },
    }

    const config = statusConfig[status]
    const Icon = config.icon

    return (
      <Badge className={`${config.color} border-0 px-2 py-1 gap-1.5`}>
        <Icon className="w-3 h-3" aria-hidden="true" />
        {isRTL ? config.label : config.labelEn}
      </Badge>
    )
  }

  // Get available actions for a period
  const getAvailableActions = (period: FiscalPeriod) => {
    const actions = []

    if (period.status === 'future') {
      actions.push({
        label: isRTL ? 'فتح الفترة' : 'Open Period',
        icon: Unlock,
        onClick: () => handlePeriodAction('open', period._id, period.nameAr),
        variant: 'default' as const,
      })
    }

    if (period.status === 'open') {
      actions.push({
        label: isRTL ? 'إغلاق الفترة' : 'Close Period',
        icon: Lock,
        onClick: () => handlePeriodAction('close', period._id, period.nameAr),
        variant: 'default' as const,
      })
    }

    if (period.status === 'closed') {
      actions.push({
        label: isRTL ? 'إعادة فتح' : 'Reopen',
        icon: Unlock,
        onClick: () => handlePeriodAction('reopen', period._id, period.nameAr),
        variant: 'outline' as const,
      })
      actions.push({
        label: isRTL ? 'قفل نهائي' : 'Lock Permanently',
        icon: Lock,
        onClick: () => handlePeriodAction('lock', period._id, period.nameAr),
        variant: 'destructive' as const,
      })
    }

    return actions
  }

  // Get action description
  const getActionDescription = (type: string) => {
    const descriptions = {
      open: isRTL
        ? 'سيتم فتح هذه الفترة للسماح بإدخال القيود المحاسبية'
        : 'This period will be opened to allow posting journal entries',
      close: isRTL
        ? 'سيتم إغلاق هذه الفترة ومنع إدخال قيود جديدة'
        : 'This period will be closed to prevent new journal entries',
      reopen: isRTL
        ? 'سيتم إعادة فتح هذه الفترة للسماح بالتعديلات'
        : 'This period will be reopened to allow modifications',
      lock: isRTL
        ? 'سيتم قفل هذه الفترة نهائياً ولن يمكن تعديلها (للمراجعة)'
        : 'This period will be permanently locked and cannot be modified (for audit purposes)',
    }
    return descriptions[type as keyof typeof descriptions] || ''
  }

  // Format currency
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat(isRTL ? 'ar-SA' : 'en-US', {
      style: 'currency',
      currency: 'SAR',
      minimumFractionDigits: 0
    }).format(amount)
  }

  // Format date
  const formatDate = (date: string) => {
    return new Date(date).toLocaleDateString(isRTL ? 'ar-SA' : 'en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    })
  }

  // Get month name
  const getMonthName = (monthNumber: number) => {
    const months = isRTL
      ? ['يناير', 'فبراير', 'مارس', 'أبريل', 'مايو', 'يونيو', 'يوليو', 'أغسطس', 'سبتمبر', 'أكتوبر', 'نوفمبر', 'ديسمبر']
      : ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']
    return months[monthNumber - 1] || ''
  }

  const topNav = [
    { title: isRTL ? 'نظرة عامة' : 'Overview', href: '/dashboard/finance/overview', isActive: false },
    { title: isRTL ? 'الفواتير' : 'Invoices', href: '/dashboard/finance/invoices', isActive: false },
    { title: isRTL ? 'المصروفات' : 'Expenses', href: '/dashboard/finance/expenses', isActive: false },
    { title: isRTL ? 'المعاملات' : 'Transactions', href: '/dashboard/finance/transactions', isActive: false },
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
              <Search className="absolute end-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-600" aria-hidden="true" />
              <input type="text" placeholder={isRTL ? 'بحث...' : 'Search...'} className="h-9 w-64 rounded-xl border border-white/10 bg-white/5 pe-9 ps-4 text-sm text-white placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/50" />
            </div>
            <Button variant="ghost" size="icon" className="relative rounded-full text-slate-300 hover:bg-white/10 hover:text-white" aria-label={isRTL ? 'الإشعارات' : 'Notifications'}>
              <Bell className="h-5 w-5" aria-hidden="true" />
              <span className="absolute top-2 end-2 h-2 w-2 bg-red-500 rounded-full border border-navy"></span>
            </Button>
            <LanguageSwitcher className="text-slate-300 hover:bg-white/10 hover:text-white" />
            <ThemeSwitch className="text-slate-300 hover:bg-white/10 hover:text-white" />
            <ConfigDrawer className="text-slate-300 hover:bg-white/10 hover:text-white" />
            <ProfileDropdown className="text-slate-300 hover:bg-white/10 hover:text-white" />
          </div>
          <div className="absolute bottom-0 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-emerald-500/50 to-transparent"></div>
        </Header>
        <Main fluid={true} className="bg-[#f8f9fa] dark:bg-slate-950 flex-1 w-full p-6 lg:p-8 space-y-8">
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
            <Search className="absolute end-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-600" aria-hidden="true" />
            <input
              type="text"
              placeholder={isRTL ? 'بحث في الفترات...' : 'Search periods...'}
              className="h-9 w-64 rounded-xl border border-white/10 bg-white/5 pe-9 ps-4 text-sm text-white placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/50"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          <Button variant="ghost" size="icon" className="relative rounded-full text-slate-300 hover:bg-white/10 hover:text-white" aria-label={isRTL ? 'الإشعارات' : 'Notifications'}>
            <Bell className="h-5 w-5" aria-hidden="true" />
            <span className="absolute top-2 end-2 h-2 w-2 bg-red-500 rounded-full border border-navy"></span>
          </Button>
          <LanguageSwitcher className="text-slate-300 hover:bg-white/10 hover:text-white" />
          <ThemeSwitch className="text-slate-300 hover:bg-white/10 hover:text-white" />
          <ConfigDrawer className="text-slate-300 hover:bg-white/10 hover:text-white" />
          <ProfileDropdown className="text-slate-300 hover:bg-white/10 hover:text-white" />
        </div>

        {/* Bottom Gradient Line */}
        <div className="absolute bottom-0 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-emerald-500/50 to-transparent"></div>
      </Header>

      <Main fluid={true} className="bg-[#f8f9fa] dark:bg-slate-950 flex-1 w-full p-6 lg:p-8 space-y-8 rounded-tr-3xl shadow-inner border-e border-white/5 overflow-hidden font-['IBM_Plex_Sans_Arabic']">

        {/* HERO SECTION */}
        <ProductivityHero
          badge={isRTL ? 'المحاسبة' : 'Accounting'}
          title={isRTL ? 'الفترات المالية' : 'Fiscal Periods'}
          type="finance"
        >
          <div className="flex gap-3">
            <Dialog open={yearEndWizardOpen} onOpenChange={setYearEndWizardOpen}>
              <DialogTrigger asChild>
                <Button variant="outline" className="bg-white/5 border-white/10 text-white hover:bg-white/10 rounded-xl h-10 px-5 backdrop-blur-sm">
                  <Calendar className="w-4 h-4 ms-2" aria-hidden="true" />
                  {isRTL ? 'إغلاق نهاية السنة' : 'Year-End Closing'}
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-[500px]">
                <DialogHeader>
                  <DialogTitle className="text-xl font-bold text-navy dark:text-white">
                    {isRTL ? 'إغلاق نهاية السنة المالية' : 'Year-End Closing'}
                  </DialogTitle>
                  <DialogDescription>
                    {isRTL
                      ? 'سيتم إغلاق جميع فترات السنة المالية المحددة وترحيل الأرصدة إلى السنة التالية'
                      : 'All periods of the selected fiscal year will be closed and balances will be carried forward to the next year'}
                  </DialogDescription>
                </DialogHeader>
                <div className="space-y-4 py-4">
                  <div className="space-y-2">
                    <Label htmlFor="year-closing">{isRTL ? 'السنة المالية' : 'Fiscal Year'}</Label>
                    <Select
                      value={selectedYearForClosing?.toString() || ''}
                      onValueChange={(v) => setSelectedYearForClosing(parseInt(v))}
                    >
                      <SelectTrigger id="year-closing" className="rounded-xl">
                        <SelectValue placeholder={isRTL ? 'اختر السنة المالية' : 'Select fiscal year'} />
                      </SelectTrigger>
                      <SelectContent>
                        {availableYears.map((year) => (
                          <SelectItem key={year} value={year.toString()}>
                            {isRTL ? `السنة المالية ${year}` : `Fiscal Year ${year}`}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  {selectedYearForClosing && periodsByYear[selectedYearForClosing] && (
                    <Alert className="border-amber-200 bg-amber-50 dark:bg-amber-900/20 dark:border-amber-800">
                      <AlertTriangle className="w-5 h-5 text-amber-600 dark:text-amber-400" aria-hidden="true" />
                      <AlertTitle className="text-amber-900 dark:text-amber-200">
                        {isRTL ? 'تحذير: هذا الإجراء لا يمكن التراجع عنه' : 'Warning: This action cannot be undone'}
                      </AlertTitle>
                      <AlertDescription className="text-amber-800 dark:text-amber-300">
                        <ul className="space-y-1 text-xs mt-2">
                          <li>• {isRTL ? `سيتم إغلاق جميع الفترات المفتوحة في السنة ${selectedYearForClosing}` : `All open periods in year ${selectedYearForClosing} will be closed`}</li>
                          <li>• {isRTL ? 'سيتم ترحيل الأرصدة الختامية إلى السنة التالية' : 'Closing balances will be carried forward to the next year'}</li>
                          <li>• {isRTL ? 'سيتم إنشاء قيود الإقفال تلقائياً' : 'Closing entries will be created automatically'}</li>
                          <li>• {isRTL ? 'لن تتمكن من تعديل القيود بعد الإغلاق' : 'You will not be able to modify entries after closing'}</li>
                        </ul>
                      </AlertDescription>
                    </Alert>
                  )}
                </div>
                <DialogFooter>
                  <Button
                    variant="outline"
                    onClick={() => setYearEndWizardOpen(false)}
                    className="rounded-xl"
                  >
                    {isRTL ? 'إلغاء' : 'Cancel'}
                  </Button>
                  <Button
                    onClick={handleYearEndClosing}
                    disabled={!selectedYearForClosing || yearEndClosing.isPending}
                    className="bg-amber-500 hover:bg-amber-600 text-white rounded-xl"
                  >
                    {yearEndClosing.isPending ? (
                      <>
                        <Loader2 className="w-4 h-4 ms-2 animate-spin" aria-hidden="true" />
                        {isRTL ? 'جاري الإغلاق...' : 'Closing...'}
                      </>
                    ) : (
                      <>
                        <Lock className="w-4 h-4 ms-2" aria-hidden="true" />
                        {isRTL ? 'إغلاق نهاية السنة' : 'Close Year-End'}
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
                  {isRTL ? 'سنة مالية جديدة' : 'New Fiscal Year'}
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-[500px]">
                <DialogHeader>
                  <DialogTitle className="text-xl font-bold text-navy dark:text-white">
                    {isRTL ? 'إنشاء سنة مالية جديدة' : 'Create New Fiscal Year'}
                  </DialogTitle>
                  <DialogDescription>
                    {isRTL
                      ? 'سيتم إنشاء 12 فترة مالية (شهرية) للسنة المحددة'
                      : '12 fiscal periods (monthly) will be created for the specified year'}
                  </DialogDescription>
                </DialogHeader>
                <div className="space-y-4 py-4">
                  <div className="space-y-2">
                    <Label htmlFor="fiscal-year">{isRTL ? 'السنة المالية' : 'Fiscal Year'}</Label>
                    <Input
                      id="fiscal-year"
                      type="number"
                      placeholder={isRTL ? 'مثال: 2025' : 'Example: 2025'}
                      className="rounded-xl"
                      value={newFiscalYear}
                      onChange={(e) => setNewFiscalYear(e.target.value)}
                    />
                    <p className="text-xs text-slate-500">
                      {isRTL ? 'أدخل السنة بالأرقام (مثال: 2025)' : 'Enter the year in numbers (e.g., 2025)'}
                    </p>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="start-month">{isRTL ? 'شهر البداية' : 'Start Month'}</Label>
                    <Select value={startMonth} onValueChange={setStartMonth}>
                      <SelectTrigger id="start-month" className="rounded-xl">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="1">{isRTL ? 'يناير (محرم)' : 'January'}</SelectItem>
                        <SelectItem value="2">{isRTL ? 'فبراير (صفر)' : 'February'}</SelectItem>
                        <SelectItem value="3">{isRTL ? 'مارس (ربيع الأول)' : 'March'}</SelectItem>
                        <SelectItem value="4">{isRTL ? 'أبريل (ربيع الثاني)' : 'April'}</SelectItem>
                        <SelectItem value="5">{isRTL ? 'مايو (جمادى الأولى)' : 'May'}</SelectItem>
                        <SelectItem value="6">{isRTL ? 'يونيو (جمادى الآخرة)' : 'June'}</SelectItem>
                        <SelectItem value="7">{isRTL ? 'يوليو (رجب)' : 'July'}</SelectItem>
                        <SelectItem value="8">{isRTL ? 'أغسطس (شعبان)' : 'August'}</SelectItem>
                        <SelectItem value="9">{isRTL ? 'سبتمبر (رمضان)' : 'September'}</SelectItem>
                        <SelectItem value="10">{isRTL ? 'أكتوبر (شوال)' : 'October'}</SelectItem>
                        <SelectItem value="11">{isRTL ? 'نوفمبر (ذو القعدة)' : 'November'}</SelectItem>
                        <SelectItem value="12">{isRTL ? 'ديسمبر (ذو الحجة)' : 'December'}</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <Alert className="border-blue-200 bg-blue-50 dark:bg-blue-900/20 dark:border-blue-800">
                    <Info className="w-5 h-5 text-blue-600 dark:text-blue-400" aria-hidden="true" />
                    <AlertTitle className="text-blue-900 dark:text-blue-200">
                      {isRTL ? 'معلومة' : 'Information'}
                    </AlertTitle>
                    <AlertDescription className="text-blue-800 dark:text-blue-300 text-xs">
                      {isRTL
                        ? 'سيتم إنشاء 12 فترة مالية تلقائياً بداية من الشهر المحدد. جميع الفترات ستكون بحالة "مستقبلي" ويمكنك فتحها لاحقاً.'
                        : '12 fiscal periods will be created automatically starting from the specified month. All periods will be in "Future" status and can be opened later.'}
                    </AlertDescription>
                  </Alert>
                </div>
                <DialogFooter>
                  <Button
                    variant="outline"
                    onClick={() => setCreateYearOpen(false)}
                    className="rounded-xl"
                  >
                    {isRTL ? 'إلغاء' : 'Cancel'}
                  </Button>
                  <Button
                    onClick={handleCreateYear}
                    disabled={!newFiscalYear || !startMonth || createFiscalYear.isPending}
                    className="bg-emerald-500 hover:bg-emerald-600 text-white rounded-xl"
                  >
                    {createFiscalYear.isPending ? (
                      <>
                        <Loader2 className="w-4 h-4 ms-2 animate-spin" aria-hidden="true" />
                        {isRTL ? 'جاري الإنشاء...' : 'Creating...'}
                      </>
                    ) : (
                      <>
                        <Plus className="w-4 h-4 ms-2" aria-hidden="true" />
                        {isRTL ? 'إنشاء السنة المالية' : 'Create Fiscal Year'}
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

            {/* Controls Bar */}
            <div className="bg-white dark:bg-slate-900 p-4 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-800">
              <div className="flex items-center justify-between gap-4 flex-wrap">
                <div className="flex items-center gap-3">
                  <Label className="text-slate-700 dark:text-slate-300 font-medium">
                    {isRTL ? 'السنة المالية:' : 'Fiscal Year:'}
                  </Label>
                  <Select
                    value={selectedYear.toString()}
                    onValueChange={(v) => setSelectedYear(v === 'all' ? 'all' : parseInt(v))}
                  >
                    <SelectTrigger className="w-[200px] rounded-xl">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">{isRTL ? 'جميع السنوات' : 'All Years'}</SelectItem>
                      {availableYears.map((year) => (
                        <SelectItem key={year} value={year.toString()}>
                          {isRTL ? `السنة المالية ${year}` : `Fiscal Year ${year}`}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="flex items-center gap-3">
                  {currentPeriod && (
                    <div className="flex items-center gap-2 text-sm">
                      <span className="text-slate-500 dark:text-slate-400">
                        {isRTL ? 'الفترة الحالية:' : 'Current Period:'}
                      </span>
                      <Badge className="bg-emerald-500 text-white border-0">
                        {isRTL ? currentPeriod.nameAr : currentPeriod.name}
                      </Badge>
                    </div>
                  )}

                  <Tabs value={viewMode} onValueChange={(v) => setViewMode(v as 'grid' | 'timeline')}>
                    <TabsList className="rounded-xl">
                      <TabsTrigger value="grid" className="rounded-lg">
                        {isRTL ? 'شبكة' : 'Grid'}
                      </TabsTrigger>
                      <TabsTrigger value="timeline" className="rounded-lg">
                        {isRTL ? 'جدول زمني' : 'Timeline'}
                      </TabsTrigger>
                    </TabsList>
                  </Tabs>
                </div>
              </div>
            </div>

            {/* Periods by Year */}
            {filteredYears.length === 0 ? (
              <div className="bg-white dark:bg-slate-900 rounded-3xl p-12 text-center border border-slate-100 dark:border-slate-800 shadow-sm">
                <div className="w-16 h-16 bg-blue-50 dark:bg-blue-900/30 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Calendar className="h-8 w-8 text-brand-blue" aria-hidden="true" />
                </div>
                <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-2">
                  {isRTL ? 'لا توجد فترات مالية' : 'No Fiscal Periods'}
                </h3>
                <p className="text-slate-500 dark:text-slate-400 mb-6">
                  {isRTL ? 'ابدأ بإنشاء سنة مالية جديدة' : 'Start by creating a new fiscal year'}
                </p>
                <Button
                  onClick={() => setCreateYearOpen(true)}
                  className="bg-brand-blue hover:bg-blue-600 text-white px-8"
                >
                  <Plus className="ms-2 h-4 w-4" aria-hidden="true" />
                  {isRTL ? 'إنشاء سنة مالية' : 'Create Fiscal Year'}
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
                    <Card key={year} className="border-0 shadow-sm rounded-[32px] overflow-hidden dark:bg-slate-900">
                      <CardHeader className="border-b border-slate-100 dark:border-slate-800 pb-4 pt-6 px-8 bg-gradient-to-r from-navy/5 to-transparent dark:from-navy/20">
                        <div className="flex justify-between items-center">
                          <div>
                            <CardTitle className="text-2xl font-bold text-navy dark:text-white">
                              {isRTL ? `السنة المالية ${year}` : `Fiscal Year ${year}`}
                            </CardTitle>
                            <div className="flex items-center gap-4 mt-2 text-sm text-slate-600 dark:text-slate-400">
                              <span className="flex items-center gap-1">
                                <Unlock className="w-4 h-4 text-emerald-600 dark:text-emerald-400" aria-hidden="true" />
                                {openCount} {isRTL ? 'مفتوحة' : 'Open'}
                              </span>
                              <span className="flex items-center gap-1">
                                <Lock className="w-4 h-4 text-amber-600 dark:text-amber-400" aria-hidden="true" />
                                {closedCount} {isRTL ? 'مغلقة' : 'Closed'}
                              </span>
                              <span className="flex items-center gap-1">
                                <Lock className="w-4 h-4 text-red-600 dark:text-red-400" aria-hidden="true" />
                                {lockedCount} {isRTL ? 'مقفلة' : 'Locked'}
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
                            {isRTL ? 'إغلاق السنة' : 'Close Year'}
                          </Button>
                        </div>
                      </CardHeader>
                      <CardContent className="p-6">
                        {viewMode === 'grid' ? (
                          // Grid View
                          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                            {periods.map((period) => (
                              <div
                                key={period._id}
                                className="bg-white dark:bg-slate-800 border-2 border-slate-100 dark:border-slate-700 rounded-2xl p-4 hover:border-brand-blue hover:shadow-md transition-all"
                              >
                                <div className="flex justify-between items-start mb-3">
                                  <div className="flex-1">
                                    <h4 className="font-bold text-navy dark:text-white text-base mb-1">
                                      {isRTL ? period.nameAr : period.name}
                                    </h4>
                                    <p className="text-xs text-slate-500 dark:text-slate-400">
                                      {formatDate(period.startDate)} - {formatDate(period.endDate)}
                                    </p>
                                  </div>
                                  <DropdownMenu>
                                    <DropdownMenuTrigger asChild>
                                      <Button variant="ghost" size="icon" className="h-8 w-8 rounded-full" aria-label={isRTL ? 'خيارات' : 'Options'}>
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
                                        <DollarSign className="w-4 h-4 ms-2" aria-hidden="true" />
                                        {isRTL ? 'عرض الأرصدة' : 'View Balances'}
                                      </DropdownMenuItem>
                                      <DropdownMenuSeparator />
                                      {getAvailableActions(period).map((action, idx) => (
                                        <DropdownMenuItem
                                          key={idx}
                                          onClick={action.onClick}
                                        >
                                          <action.icon className="w-4 h-4 ms-2" aria-hidden="true" />
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
                                  <div className="space-y-1.5 text-xs text-slate-600 dark:text-slate-400 pt-3 border-t border-slate-100 dark:border-slate-700">
                                    {period.openedAt && (
                                      <div className="flex justify-between">
                                        <span>{isRTL ? 'تاريخ الفتح:' : 'Opened:'}</span>
                                        <span className="font-medium">{formatDate(period.openedAt)}</span>
                                      </div>
                                    )}
                                    {period.closedAt && (
                                      <div className="flex justify-between">
                                        <span>{isRTL ? 'تاريخ الإغلاق:' : 'Closed:'}</span>
                                        <span className="font-medium">{formatDate(period.closedAt)}</span>
                                      </div>
                                    )}
                                    {period.lockedAt && (
                                      <div className="flex justify-between">
                                        <span>{isRTL ? 'تاريخ القفل:' : 'Locked:'}</span>
                                        <span className="font-medium text-red-600 dark:text-red-400">{formatDate(period.lockedAt)}</span>
                                      </div>
                                    )}
                                  </div>
                                )}
                              </div>
                            ))}
                          </div>
                        ) : (
                          // Timeline View
                          <div className="relative">
                            {/* Timeline Line */}
                            <div className="absolute top-0 bottom-0 left-8 w-[3px] bg-gradient-to-b from-emerald-500 via-amber-500 to-red-500 rounded-full"></div>

                            <div className="space-y-4">
                              {periods.map((period, idx) => (
                                <div key={period._id} className="relative ps-20">
                                  {/* Timeline Dot */}
                                  <div className={cn(
                                    "absolute left-[22px] top-6 w-6 h-6 rounded-full border-4 border-white dark:border-slate-900 shadow-lg z-10",
                                    period.status === 'open' && "bg-emerald-500",
                                    period.status === 'closed' && "bg-amber-500",
                                    period.status === 'locked' && "bg-red-500",
                                    period.status === 'future' && "bg-slate-400"
                                  )}></div>

                                  {/* Period Number Badge */}
                                  <div className="absolute left-0 top-4 w-16 text-center">
                                    <div className="text-2xl font-bold text-navy dark:text-white">
                                      {getMonthName(period.periodNumber)}
                                    </div>
                                  </div>

                                  {/* Period Card */}
                                  <Card className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 hover:shadow-lg transition-all">
                                    <CardContent className="p-4">
                                      <div className="flex justify-between items-start mb-2">
                                        <div className="flex-1">
                                          <h4 className="font-bold text-navy dark:text-white text-base">
                                            {isRTL ? period.nameAr : period.name}
                                          </h4>
                                          <p className="text-xs text-slate-500 dark:text-slate-400">
                                            {formatDate(period.startDate)} - {formatDate(period.endDate)}
                                          </p>
                                        </div>
                                        <div className="flex items-center gap-2">
                                          {getStatusBadge(period.status)}
                                          <DropdownMenu>
                                            <DropdownMenuTrigger asChild>
                                              <Button variant="ghost" size="icon" className="h-8 w-8 rounded-full">
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
                                                <DollarSign className="w-4 h-4 ms-2" aria-hidden="true" />
                                                {isRTL ? 'عرض الأرصدة' : 'View Balances'}
                                              </DropdownMenuItem>
                                              <DropdownMenuSeparator />
                                              {getAvailableActions(period).map((action, idx) => (
                                                <DropdownMenuItem
                                                  key={idx}
                                                  onClick={action.onClick}
                                                >
                                                  <action.icon className="w-4 h-4 ms-2" aria-hidden="true" />
                                                  {action.label}
                                                </DropdownMenuItem>
                                              ))}
                                            </DropdownMenuContent>
                                          </DropdownMenu>
                                        </div>
                                      </div>

                                      {period.status !== 'future' && (
                                        <div className="flex items-center gap-4 text-xs text-slate-600 dark:text-slate-400 pt-3 border-t border-slate-100 dark:border-slate-700">
                                          {period.openedAt && (
                                            <div className="flex items-center gap-1">
                                              <Unlock className="w-3 h-3" aria-hidden="true" />
                                              <span>{formatDate(period.openedAt)}</span>
                                            </div>
                                          )}
                                          {period.closedAt && (
                                            <div className="flex items-center gap-1">
                                              <Lock className="w-3 h-3" aria-hidden="true" />
                                              <span>{formatDate(period.closedAt)}</span>
                                            </div>
                                          )}
                                        </div>
                                      )}
                                    </CardContent>
                                  </Card>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}
                      </CardContent>
                    </Card>
                  )
                })}
              </div>
            )}
          </div>

          {/* Sidebar */}
          <FinanceSidebar context="fiscal-periods" />
        </div>
      </Main>

      {/* Action Confirmation Dialog */}
      <Dialog open={confirmDialogOpen} onOpenChange={setConfirmDialogOpen}>
        <DialogContent className="sm:max-w-[400px]">
          <DialogHeader>
            <DialogTitle className="text-xl font-bold text-navy dark:text-white">
              {isRTL ? 'تأكيد العملية' : 'Confirm Action'}
            </DialogTitle>
            <DialogDescription>
              {pendingAction && getActionDescription(pendingAction.type)}
            </DialogDescription>
          </DialogHeader>
          <div className="py-4">
            <Alert>
              <Info className="w-5 h-5" aria-hidden="true" />
              <AlertTitle>{isRTL ? 'الفترة المحددة' : 'Selected Period'}</AlertTitle>
              <AlertDescription className="font-medium">
                {pendingAction?.periodName}
              </AlertDescription>
            </Alert>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setConfirmDialogOpen(false)
                setPendingAction(null)
              }}
              className="rounded-xl"
            >
              {isRTL ? 'إلغاء' : 'Cancel'}
            </Button>
            <Button
              onClick={executeAction}
              className="bg-emerald-500 hover:bg-emerald-600 text-white rounded-xl"
            >
              {isRTL ? 'تأكيد' : 'Confirm'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Period Balances Dialog */}
      <Dialog open={balancesDialogOpen} onOpenChange={setBalancesDialogOpen}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle className="text-xl font-bold text-navy dark:text-white">
              {isRTL ? 'أرصدة الفترة المالية' : 'Period Balances'}
            </DialogTitle>
            <DialogDescription>
              {isRTL
                ? 'عرض الأرصدة والملخص المالي للفترة المحددة'
                : 'View balances and financial summary for the selected period'}
            </DialogDescription>
          </DialogHeader>
          {balancesData ? (
            <div className="space-y-4 py-4">
              <div className="grid grid-cols-2 gap-4">
                <Card className="border border-slate-200 dark:border-slate-700 dark:bg-slate-800">
                  <CardContent className="p-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-emerald-50 dark:bg-emerald-900/30 flex items-center justify-center">
                        <TrendingUp className="w-5 h-5 text-emerald-600 dark:text-emerald-400" aria-hidden="true" />
                      </div>
                      <div>
                        <p className="text-xs text-slate-500 dark:text-slate-400">
                          {isRTL ? 'الأصول' : 'Assets'}
                        </p>
                        <p className="text-lg font-bold text-navy dark:text-white">
                          {formatCurrency(balancesData.totalAssets)}
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card className="border border-slate-200 dark:border-slate-700 dark:bg-slate-800">
                  <CardContent className="p-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-red-50 dark:bg-red-900/30 flex items-center justify-center">
                        <TrendingUp className="w-5 h-5 text-red-600 dark:text-red-400" aria-hidden="true" />
                      </div>
                      <div>
                        <p className="text-xs text-slate-500 dark:text-slate-400">
                          {isRTL ? 'الخصوم' : 'Liabilities'}
                        </p>
                        <p className="text-lg font-bold text-navy dark:text-white">
                          {formatCurrency(balancesData.totalLiabilities)}
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card className="border border-slate-200 dark:border-slate-700 dark:bg-slate-800">
                  <CardContent className="p-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-blue-50 dark:bg-blue-900/30 flex items-center justify-center">
                        <DollarSign className="w-5 h-5 text-blue-600 dark:text-blue-400" aria-hidden="true" />
                      </div>
                      <div>
                        <p className="text-xs text-slate-500 dark:text-slate-400">
                          {isRTL ? 'حقوق الملكية' : 'Equity'}
                        </p>
                        <p className="text-lg font-bold text-navy dark:text-white">
                          {formatCurrency(balancesData.totalEquity)}
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card className="border border-slate-200 dark:border-slate-700 dark:bg-slate-800">
                  <CardContent className="p-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-purple-50 dark:bg-purple-900/30 flex items-center justify-center">
                        <FileText className="w-5 h-5 text-purple-600 dark:text-purple-400" aria-hidden="true" />
                      </div>
                      <div>
                        <p className="text-xs text-slate-500 dark:text-slate-400">
                          {isRTL ? 'الإيرادات' : 'Income'}
                        </p>
                        <p className="text-lg font-bold text-navy dark:text-white">
                          {formatCurrency(balancesData.totalIncome)}
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card className="border border-slate-200 dark:border-slate-700 dark:bg-slate-800">
                  <CardContent className="p-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-amber-50 dark:bg-amber-900/30 flex items-center justify-center">
                        <FileText className="w-5 h-5 text-amber-600 dark:text-amber-400" aria-hidden="true" />
                      </div>
                      <div>
                        <p className="text-xs text-slate-500 dark:text-slate-400">
                          {isRTL ? 'المصروفات' : 'Expenses'}
                        </p>
                        <p className="text-lg font-bold text-navy dark:text-white">
                          {formatCurrency(balancesData.totalExpenses)}
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card className={cn(
                  "border-2",
                  balancesData.netIncome >= 0
                    ? 'border-emerald-200 bg-emerald-50 dark:border-emerald-800 dark:bg-emerald-900/20'
                    : 'border-red-200 bg-red-50 dark:border-red-800 dark:bg-red-900/20'
                )}>
                  <CardContent className="p-4">
                    <div className="flex items-center gap-3">
                      <div className={cn(
                        "w-10 h-10 rounded-xl flex items-center justify-center",
                        balancesData.netIncome >= 0
                          ? 'bg-emerald-100 dark:bg-emerald-900/50'
                          : 'bg-red-100 dark:bg-red-900/50'
                      )}>
                        <TrendingUp className={cn(
                          "w-5 h-5",
                          balancesData.netIncome >= 0
                            ? 'text-emerald-700 dark:text-emerald-400'
                            : 'text-red-700 dark:text-red-400'
                        )} aria-hidden="true" />
                      </div>
                      <div>
                        <p className="text-xs text-slate-600 dark:text-slate-400">
                          {isRTL ? 'صافي الدخل' : 'Net Income'}
                        </p>
                        <p className={cn(
                          "text-lg font-bold",
                          balancesData.netIncome >= 0
                            ? 'text-emerald-700 dark:text-emerald-400'
                            : 'text-red-700 dark:text-red-400'
                        )}>
                          {formatCurrency(balancesData.netIncome)}
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>

              <Alert className={cn(
                balancesData.isBalanced
                  ? 'bg-emerald-50 border-emerald-200 dark:bg-emerald-900/20 dark:border-emerald-800'
                  : 'bg-red-50 border-red-200 dark:bg-red-900/20 dark:border-red-800'
              )}>
                {balancesData.isBalanced ? (
                  <CheckCircle className="w-5 h-5 text-emerald-600 dark:text-emerald-400" aria-hidden="true" />
                ) : (
                  <XCircle className="w-5 h-5 text-red-600 dark:text-red-400" aria-hidden="true" />
                )}
                <AlertTitle className={cn(
                  balancesData.isBalanced
                    ? 'text-emerald-900 dark:text-emerald-200'
                    : 'text-red-900 dark:text-red-200'
                )}>
                  {balancesData.isBalanced
                    ? (isRTL ? 'الميزانية متوازنة' : 'Balance Sheet is Balanced')
                    : (isRTL ? 'الميزانية غير متوازنة' : 'Balance Sheet is Unbalanced')}
                </AlertTitle>
                <AlertDescription className={cn(
                  "text-xs",
                  balancesData.isBalanced
                    ? 'text-emerald-800 dark:text-emerald-300'
                    : 'text-red-800 dark:text-red-300'
                )}>
                  {balancesData.isBalanced
                    ? (isRTL ? 'الأصول = الخصوم + حقوق الملكية' : 'Assets = Liabilities + Equity')
                    : (isRTL ? 'يرجى مراجعة القيود المحاسبية' : 'Please review journal entries')}
                </AlertDescription>
              </Alert>
            </div>
          ) : (
            <div className="py-12 text-center">
              <Loader2 className="w-8 h-8 animate-spin text-slate-600 dark:text-slate-400 mx-auto mb-3" aria-hidden="true" />
              <p className="text-slate-500 dark:text-slate-400">
                {isRTL ? 'جاري تحميل الأرصدة...' : 'Loading balances...'}
              </p>
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
              {isRTL ? 'إغلاق' : 'Close'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  )
}
