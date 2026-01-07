/**
 * Subscription Plans List View Component
 *
 * API Endpoints Status:
 * ✅ GET /subscription-plans - Fetch plans with filters
 * ✅ DELETE /subscription-plans/:id - Delete plan
 * ✅ POST /subscription-plans/:id/duplicate - Duplicate plan
 * ✅ POST /subscription-plans/:id/toggle-active - Toggle active status
 *
 * All error messages are bilingual (English | Arabic)
 */

import { useState, useMemo, useCallback } from 'react'
import { useTranslation } from 'react-i18next'
import { Main } from '@/components/layout/main'
import { ROUTES } from '@/constants/routes'
import { LanguageSwitcher } from '@/components/language-switcher'
import { ThemeSwitch } from '@/components/theme-switch'
import { ConfigDrawer } from '@/components/config-drawer'
import { ProfileDropdown } from '@/components/profile-dropdown'
import { Link } from '@tanstack/react-router'
import { toast } from 'sonner'
import { ProductivityHero } from '@/components/productivity-hero'
import {
  useSubscriptionPlans,
  useDeleteSubscriptionPlan,
  useDuplicateSubscriptionPlan,
  useTogglePlanActive,
} from '@/hooks/useSubscriptions'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import { Header } from '@/components/layout/header'
import { TopNav } from '@/components/layout/top-nav'
import { DynamicIsland } from '@/components/dynamic-island'
import {
  Search,
  Bell,
  AlertCircle,
  Plus,
  MoreHorizontal,
  ChevronLeft,
  Eye,
  Trash2,
  Edit3,
  Filter,
  X,
  ArrowRight,
  ArrowUpDown,
  Clock,
  Copy,
  Package,
  DollarSign,
  Users,
  ToggleLeft,
  ToggleRight,
} from 'lucide-react'
import { useNavigate } from '@tanstack/react-router'
import { format } from 'date-fns'
import { arSA, enUS } from 'date-fns/locale'
import {
  GosiCard,
  GosiInput,
  GosiSelect,
  GosiSelectContent,
  GosiSelectItem,
  GosiSelectTrigger,
  GosiSelectValue,
  GosiButton,
} from '@/components/ui/gosi-ui'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  getPlanTypeLabel,
  getPlanTypeColor,
  getBillingPeriodLabel,
  formatSubscriptionAmount,
} from '@/services/subscriptionService'
import type {
  SubscriptionPlan,
  SubscriptionPlanType,
  BillingPeriod,
} from '../types/subscription-types'

export function SubscriptionPlansListView() {
  const { t, i18n } = useTranslation()
  const navigate = useNavigate()
  const [showFilters, setShowFilters] = useState(false)
  const [visibleCount, setVisibleCount] = useState(10)

  // Duplicate dialog state
  const [duplicateDialogOpen, setDuplicateDialogOpen] = useState(false)
  const [planToDuplicate, setPlanToDuplicate] = useState<SubscriptionPlan | null>(null)
  const [duplicateName, setDuplicateName] = useState('')
  const [duplicateNameAr, setDuplicateNameAr] = useState('')

  // Filter states
  const [searchQuery, setSearchQuery] = useState('')
  const [planTypeFilter, setPlanTypeFilter] = useState<string>('all')
  const [billingPeriodFilter, setBillingPeriodFilter] = useState<string>('all')
  const [statusFilter, setStatusFilter] = useState<string>('all')
  const [sortBy, setSortBy] = useState<string>('createdAt')

  // Build filters for API
  const filters = useMemo(() => {
    const f: any = {}

    if (searchQuery.trim()) {
      f.search = searchQuery.trim()
    }

    if (planTypeFilter !== 'all') {
      f.planType = planTypeFilter
    }

    if (billingPeriodFilter !== 'all') {
      f.billingPeriod = billingPeriodFilter
    }

    if (statusFilter === 'active') {
      f.isActive = true
    } else if (statusFilter === 'inactive') {
      f.isActive = false
    }

    if (sortBy === 'createdAt') {
      f.sortBy = 'createdAt'
      f.sortOrder = 'desc'
    } else if (sortBy === 'amount') {
      f.sortBy = 'amount'
      f.sortOrder = 'desc'
    } else if (sortBy === 'name') {
      f.sortBy = 'name'
      f.sortOrder = 'asc'
    }

    return f
  }, [searchQuery, planTypeFilter, billingPeriodFilter, statusFilter, sortBy])

  // Check if any filter is active
  const hasActiveFilters = useMemo(
    () =>
      searchQuery ||
      planTypeFilter !== 'all' ||
      billingPeriodFilter !== 'all' ||
      statusFilter !== 'all',
    [searchQuery, planTypeFilter, billingPeriodFilter, statusFilter]
  )

  // Clear all filters
  const clearFilters = useCallback(() => {
    setSearchQuery('')
    setPlanTypeFilter('all')
    setBillingPeriodFilter('all')
    setStatusFilter('all')
    setVisibleCount(10)
  }, [])

  // Fetch plans
  const { data: plansData, isLoading, isError, error, refetch } = useSubscriptionPlans(filters)

  // Mutations
  const deletePlanMutation = useDeleteSubscriptionPlan()
  const duplicatePlanMutation = useDuplicateSubscriptionPlan()
  const toggleActiveMutation = useTogglePlanActive()

  // Transform API data
  const plans = useMemo(() => {
    if (!plansData?.data) return []
    return plansData.data
  }, [plansData])

  // Visible plans (paginated)
  const visiblePlans = useMemo(() => {
    return plans.slice(0, visibleCount)
  }, [plans, visibleCount])

  // Check if there are more plans to load
  const hasMorePlans = plans.length > visibleCount

  // Load more handler
  const handleLoadMore = useCallback(() => {
    setVisibleCount((prev) => prev + 10)
  }, [])

  // Action handlers
  const handleViewPlan = useCallback(
    (planId: string) => {
      navigate({ to: ROUTES.dashboard.finance.subscriptionPlans.detail(planId) })
    },
    [navigate]
  )

  const handleEditPlan = useCallback(
    (planId: string) => {
      navigate({ to: ROUTES.dashboard.finance.subscriptionPlans.edit(planId) })
    },
    [navigate]
  )

  const handleDeletePlan = useCallback(
    (planId: string) => {
      const confirmMessage =
        i18n.language === 'ar'
          ? 'هل أنت متأكد من حذف هذه الخطة؟ | Are you sure you want to delete this plan?'
          : 'Are you sure you want to delete this plan? | هل أنت متأكد من حذف هذه الخطة؟'

      if (confirm(confirmMessage)) {
        deletePlanMutation.mutate(planId)
      }
    },
    [i18n.language, deletePlanMutation]
  )

  const handleOpenDuplicateDialog = useCallback((plan: SubscriptionPlan) => {
    setPlanToDuplicate(plan)
    setDuplicateName(
      `${plan.name} (${i18n.language === 'ar' ? 'نسخة' : 'Copy'})`
    )
    setDuplicateNameAr(plan.nameAr ? `${plan.nameAr} (نسخة)` : '')
    setDuplicateDialogOpen(true)
  }, [i18n.language])

  const handleDuplicatePlan = useCallback(() => {
    if (!planToDuplicate || !duplicateName.trim()) return

    duplicatePlanMutation.mutate(
      {
        id: planToDuplicate._id,
        name: duplicateName.trim(),
        nameAr: duplicateNameAr.trim() || undefined,
      },
      {
        onSuccess: () => {
          setDuplicateDialogOpen(false)
          setPlanToDuplicate(null)
          setDuplicateName('')
          setDuplicateNameAr('')
        },
      }
    )
  }, [planToDuplicate, duplicateName, duplicateNameAr, duplicatePlanMutation])

  const handleToggleActive = useCallback(
    (planId: string) => {
      toggleActiveMutation.mutate(planId)
    },
    [toggleActiveMutation]
  )

  // Format date helper
  const formatDate = useCallback(
    (dateString: string) => {
      const date = new Date(dateString)
      const locale = i18n.language === 'ar' ? arSA : enUS
      return format(date, 'd MMM yyyy', { locale })
    },
    [i18n.language]
  )

  const topNav = [
    { title: t('nav.overview', 'نظرة عامة'), href: ROUTES.dashboard.home, isActive: false },
    {
      title: t('subscriptions.title', 'الاشتراكات'),
      href: ROUTES.dashboard.finance.subscriptions.list,
      isActive: false,
    },
    {
      title: t('subscriptionPlans.title', 'خطط الاشتراك'),
      href: ROUTES.dashboard.finance.subscriptionPlans.list,
      isActive: true,
    },
  ]

  // Plan type options
  const planTypeOptions: { value: SubscriptionPlanType; label: string }[] = [
    { value: 'retainer', label: getPlanTypeLabel('retainer', i18n.language as 'ar' | 'en') },
    { value: 'hourly_package', label: getPlanTypeLabel('hourly_package', i18n.language as 'ar' | 'en') },
    { value: 'flat_fee', label: getPlanTypeLabel('flat_fee', i18n.language as 'ar' | 'en') },
    { value: 'hybrid', label: getPlanTypeLabel('hybrid', i18n.language as 'ar' | 'en') },
    { value: 'compliance', label: getPlanTypeLabel('compliance', i18n.language as 'ar' | 'en') },
    { value: 'document_review', label: getPlanTypeLabel('document_review', i18n.language as 'ar' | 'en') },
    { value: 'advisory', label: getPlanTypeLabel('advisory', i18n.language as 'ar' | 'en') },
  ]

  // Billing period options
  const billingPeriodOptions: { value: BillingPeriod; label: string }[] = [
    { value: 'weekly', label: getBillingPeriodLabel('weekly', i18n.language as 'ar' | 'en') },
    { value: 'biweekly', label: getBillingPeriodLabel('biweekly', i18n.language as 'ar' | 'en') },
    { value: 'monthly', label: getBillingPeriodLabel('monthly', i18n.language as 'ar' | 'en') },
    { value: 'quarterly', label: getBillingPeriodLabel('quarterly', i18n.language as 'ar' | 'en') },
    { value: 'semi_annually', label: getBillingPeriodLabel('semi_annually', i18n.language as 'ar' | 'en') },
    { value: 'annually', label: getBillingPeriodLabel('annually', i18n.language as 'ar' | 'en') },
  ]

  return (
    <>
      {/* Header */}
      <Header className="bg-navy shadow-none relative">
        <TopNav
          links={topNav}
          className="[&>a]:text-slate-300 [&>a:hover]:text-white [&>a[aria-current='page']]:text-white"
        />

        {/* Dynamic Island - Centered */}
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
              placeholder={t('subscriptionPlans.list.search', 'بحث في الخطط...')}
              className="h-9 w-64 rounded-xl border border-white/10 bg-white/5 pe-9 ps-4 text-sm text-white placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/50"
            />
          </div>
          <Button
            variant="ghost"
            size="icon"
            className="relative rounded-full text-slate-300 hover:bg-white/10 hover:text-white flex-shrink-0"
          >
            <Bell className="h-5 w-5" />
            <span className="absolute top-2 end-2 h-2 w-2 bg-red-500 rounded-full border border-navy"></span>
          </Button>
          <LanguageSwitcher className="text-slate-300 hover:bg-white/10 hover:text-white flex-shrink-0" />
          <ThemeSwitch className="text-slate-300 hover:bg-white/10 hover:text-white hidden sm:flex flex-shrink-0" />
          <ConfigDrawer className="text-slate-300 hover:bg-white/10 hover:text-white hidden lg:flex flex-shrink-0" />
          <ProfileDropdown className="text-slate-300 hover:bg-white/10 hover:text-white flex-shrink-0" />
        </div>
        {/* Bottom Gradient Line */}
        <div className="absolute bottom-0 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-emerald-500/50 to-transparent"></div>
      </Header>

      <Main
        fluid={true}
        className="bg-[#f8f9fa] flex-1 w-full p-6 lg:p-8 space-y-8 rounded-tr-3xl shadow-inner border-e border-white/5 overflow-hidden font-['IBM_Plex_Sans_Arabic']"
      >
        {/* HERO CARD & STATS */}
        <ProductivityHero
          badge={t('subscriptionPlans.management', 'إدارة الخطط')}
          title={t('subscriptionPlans.title', 'خطط الاشتراك')}
          type="subscriptions"
        />

        {/* MAIN GRID LAYOUT */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* RIGHT COLUMN (Main Content) */}
          <div className="lg:col-span-2 space-y-6">
            {/* FILTERS BAR */}
            <GosiCard className="p-4 md:p-6 rounded-[2rem]">
              <div className="space-y-4">
                {/* Top Row: Search + Filter Toggle */}
                <div className="flex flex-col lg:flex-row gap-3">
                  <div className="relative w-full">
                    <Search
                      className="absolute end-4 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400"
                      aria-hidden="true"
                    />
                    <GosiInput
                      type="text"
                      placeholder={t('subscriptionPlans.list.searchPlaceholder', 'بحث بالاسم أو الكود...')}
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="pe-12 h-14 w-full text-base"
                      aria-label={t('subscriptionPlans.list.searchPlaceholder', 'بحث بالاسم أو الكود...')}
                    />
                  </div>

                  {/* Filter Toggle Button */}
                  <GosiButton
                    variant={showFilters || hasActiveFilters ? 'default' : 'outline'}
                    onClick={() => setShowFilters(!showFilters)}
                    className={`h-14 w-full sm:w-auto px-6 whitespace-nowrap transition-all ${showFilters || hasActiveFilters ? 'bg-navy text-white border-navy' : ''}`}
                  >
                    <Filter className="h-5 w-5 ms-2" />
                    {t('common.filters', 'تصفية')}
                    {hasActiveFilters && (
                      <span className="ms-2 bg-emerald-500 text-white text-[10px] px-2 py-0.5 rounded-full">
                        !
                      </span>
                    )}
                  </GosiButton>
                </div>

                {/* Filters Container */}
                <div
                  className={`flex-wrap gap-4 transition-all duration-300 ease-in-out overflow-hidden ${showFilters ? 'flex opacity-100 max-h-[500px] mt-4' : 'hidden opacity-0 max-h-0'}`}
                >
                  {/* Plan Type */}
                  <div className="flex-1 min-w-[220px]">
                    <GosiSelect value={planTypeFilter} onValueChange={setPlanTypeFilter}>
                      <GosiSelectTrigger className="w-full h-14 bg-white border-slate-100 hover:bg-slate-50 shadow-sm focus:ring-2 focus:ring-emerald-500/20 transition-all text-xs font-bold text-slate-950">
                        <div className="flex items-center gap-2 truncate">
                          <span className="text-slate-600 font-bold text-xs uppercase tracking-wider">
                            {t('subscriptionPlans.list.planType', 'نوع الخطة')}:
                          </span>
                          <GosiSelectValue />
                        </div>
                      </GosiSelectTrigger>
                      <GosiSelectContent>
                        <GosiSelectItem value="all" className="font-bold">
                          {t('common.all', 'الكل')}
                        </GosiSelectItem>
                        {planTypeOptions.map((option) => (
                          <GosiSelectItem key={option.value} value={option.value} className="font-bold">
                            {option.label}
                          </GosiSelectItem>
                        ))}
                      </GosiSelectContent>
                    </GosiSelect>
                  </div>

                  {/* Billing Period */}
                  <div className="flex-1 min-w-[220px]">
                    <GosiSelect value={billingPeriodFilter} onValueChange={setBillingPeriodFilter}>
                      <GosiSelectTrigger className="w-full h-14 bg-white border-slate-100 hover:bg-slate-50 shadow-sm focus:ring-2 focus:ring-emerald-500/20 transition-all text-xs font-bold text-slate-950">
                        <div className="flex items-center gap-2 truncate">
                          <Clock className="h-4 w-4 text-emerald-600" aria-hidden="true" />
                          <span className="text-slate-600 font-bold text-xs uppercase tracking-wider">
                            {t('subscriptionPlans.list.billingPeriod', 'فترة الفوترة')}:
                          </span>
                          <GosiSelectValue />
                        </div>
                      </GosiSelectTrigger>
                      <GosiSelectContent>
                        <GosiSelectItem value="all" className="font-bold">
                          {t('common.all', 'الكل')}
                        </GosiSelectItem>
                        {billingPeriodOptions.map((option) => (
                          <GosiSelectItem key={option.value} value={option.value} className="font-bold">
                            {option.label}
                          </GosiSelectItem>
                        ))}
                      </GosiSelectContent>
                    </GosiSelect>
                  </div>

                  {/* Status */}
                  <div className="flex-1 min-w-[220px]">
                    <GosiSelect value={statusFilter} onValueChange={setStatusFilter}>
                      <GosiSelectTrigger className="w-full h-14 bg-white border-slate-100 hover:bg-slate-50 shadow-sm focus:ring-2 focus:ring-emerald-500/20 transition-all text-xs font-bold text-slate-950">
                        <div className="flex items-center gap-2 truncate">
                          <span className="text-slate-600 font-bold text-xs uppercase tracking-wider">
                            {t('common.status', 'الحالة')}:
                          </span>
                          <GosiSelectValue />
                        </div>
                      </GosiSelectTrigger>
                      <GosiSelectContent>
                        <GosiSelectItem value="all" className="font-bold">
                          {t('common.all', 'الكل')}
                        </GosiSelectItem>
                        <GosiSelectItem value="active" className="font-bold">
                          {t('subscriptionPlans.status.active', 'نشط')}
                        </GosiSelectItem>
                        <GosiSelectItem value="inactive" className="font-bold">
                          {t('subscriptionPlans.status.inactive', 'غير نشط')}
                        </GosiSelectItem>
                      </GosiSelectContent>
                    </GosiSelect>
                  </div>

                  {/* Sort By */}
                  <div className="flex-1 min-w-[220px]">
                    <GosiSelect value={sortBy} onValueChange={setSortBy}>
                      <GosiSelectTrigger className="w-full h-14 bg-white border-slate-100 hover:bg-slate-50 shadow-sm focus:ring-2 focus:ring-emerald-500/20 transition-all text-xs font-bold text-slate-950">
                        <div className="flex items-center gap-2 truncate">
                          <ArrowUpDown className="h-4 w-4 text-emerald-600" aria-hidden="true" />
                          <span className="text-slate-600 font-bold text-xs uppercase tracking-wider">
                            {t('common.sortBy', 'ترتيب حسب')}:
                          </span>
                          <GosiSelectValue />
                        </div>
                      </GosiSelectTrigger>
                      <GosiSelectContent>
                        <GosiSelectItem value="createdAt" className="font-bold">
                          {t('common.createdAt', 'تاريخ الإنشاء')}
                        </GosiSelectItem>
                        <GosiSelectItem value="amount" className="font-bold">
                          {t('subscriptionPlans.list.amount', 'المبلغ')}
                        </GosiSelectItem>
                        <GosiSelectItem value="name" className="font-bold">
                          {t('common.name', 'الاسم')}
                        </GosiSelectItem>
                      </GosiSelectContent>
                    </GosiSelect>
                  </div>

                  {/* Clear Filters */}
                  {hasActiveFilters && (
                    <div className="flex items-center">
                      <GosiButton
                        variant="ghost"
                        onClick={clearFilters}
                        className="h-14 w-full md:w-auto text-red-500 hover:text-red-600 hover:bg-red-50 rounded-2xl border border-dashed border-red-200 px-6 hover:shadow-lg hover:shadow-red-500/10 transition-all"
                      >
                        <X className="h-5 w-5 ms-2" aria-hidden="true" />
                        {t('common.clearFilters', 'مسح التصفية')}
                      </GosiButton>
                    </div>
                  )}
                </div>
              </div>
            </GosiCard>

            {/* LIST OF PLANS */}
            <div className="flex flex-col gap-4">
              {isLoading && (
                <div className="space-y-3">
                  {[1, 2, 3, 4].map((i) => (
                    <div
                      key={i}
                      className="bg-white rounded-2xl p-4 border border-slate-100 animate-pulse"
                      style={{ animationDelay: `${i * 100}ms` }}
                    >
                      <div className="flex items-center gap-3">
                        <Skeleton className="h-12 w-12 rounded-xl" />
                        <div className="flex-1 space-y-2">
                          <div className="flex items-center gap-2">
                            <Skeleton className="h-5 w-48" />
                            <Skeleton className="h-5 w-20 rounded-full" />
                          </div>
                          <Skeleton className="h-4 w-32" />
                        </div>
                        <Skeleton className="h-8 w-8 rounded-lg" />
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {isError && (
                <div className="bg-red-50 rounded-[2rem] p-12 text-center border border-red-100">
                  <div className="flex justify-center mb-4">
                    <div className="w-16 h-16 rounded-full bg-red-100 flex items-center justify-center">
                      <AlertCircle className="w-8 h-8 text-red-500" aria-hidden="true" />
                    </div>
                  </div>
                  <h3 className="text-lg font-bold text-slate-900 mb-2">
                    {i18n.language === 'ar' ? 'خطأ في تحميل الخطط' : 'Error Loading Plans'} |{' '}
                    {i18n.language === 'ar' ? 'Error Loading Plans' : 'خطأ في تحميل الخطط'}
                  </h3>
                  <p className="text-slate-500 mb-4 text-sm">
                    {error?.message || (
                      <>
                        {i18n.language === 'ar'
                          ? 'فشل الاتصال بالخادم. يرجى المحاولة مرة أخرى.'
                          : 'Connection to server failed. Please try again.'}{' '}
                        |{' '}
                        {i18n.language === 'ar'
                          ? 'Connection to server failed. Please try again.'
                          : 'فشل الاتصال بالخادم. يرجى المحاولة مرة أخرى.'}
                      </>
                    )}
                  </p>
                  <Button onClick={() => refetch()} className="bg-emerald-500 hover:bg-emerald-600">
                    {i18n.language === 'ar' ? 'إعادة المحاولة' : 'Retry'} |{' '}
                    {i18n.language === 'ar' ? 'Retry' : 'إعادة المحاولة'}
                  </Button>
                </div>
              )}

              {/* Empty State */}
              {!isLoading && !isError && plans.length === 0 && (
                <div className="bg-white rounded-[2rem] p-12 border border-slate-100 text-center">
                  <div className="flex justify-center mb-4">
                    <div className="w-16 h-16 rounded-full bg-emerald-50 flex items-center justify-center">
                      <Package className="w-8 h-8 text-emerald-500" />
                    </div>
                  </div>
                  <h3 className="text-lg font-bold text-slate-900 mb-2">
                    {t('subscriptionPlans.list.noPlans', 'لا توجد خطط')}
                  </h3>
                  <p className="text-slate-500 mb-4">
                    {t('subscriptionPlans.list.noPlansDescription', 'أنشئ خطة اشتراك جديدة للبدء')}
                  </p>
                  <GosiButton asChild className="bg-emerald-500 hover:bg-emerald-600">
                    <Link to={ROUTES.dashboard.finance.subscriptionPlans.new}>
                      <Plus className="w-4 h-4 ms-2" aria-hidden="true" />
                      {t('subscriptionPlans.list.newPlan', 'خطة جديدة')}
                    </Link>
                  </GosiButton>
                </div>
              )}

              {/* Success State - Plans List */}
              {!isLoading && !isError && plans.length > 0 && (
                <>
                  {visiblePlans.map((plan, index) => (
                    <div key={plan._id} className="mb-2">
                      <div
                        onClick={() => handleViewPlan(plan._id)}
                        style={{ animationDelay: `${index * 50}ms` }}
                        className={`
                          animate-in fade-in slide-in-from-bottom-4 duration-500 fill-mode-backwards
                          rounded-2xl p-3 md:p-4
                          border-0 ring-1 shadow-[0_2px_8px_-2px_rgba(0,0,0,0.05)]
                          transition-all duration-300 group
                          hover:shadow-[0_12px_24px_-8px_rgba(0,0,0,0.1)] hover:-translate-y-1
                          cursor-pointer relative overflow-hidden
                          ${plan.isActive ? 'bg-white ring-black/[0.03]' : 'bg-slate-50 ring-slate-200/50'}
                        `}
                      >
                        {/* Type Strip Indicator */}
                        <div
                          className={`absolute start-0 top-0 bottom-0 w-1.5 rounded-s-2xl transition-all duration-300 ${getPlanTypeColor(plan.planType).split(' ')[0]}`}
                        />

                        <div className="flex items-center gap-3 ps-4">
                          {/* Plan Icon */}
                          <div
                            className={`w-12 h-12 rounded-xl flex items-center justify-center transition-all duration-300 flex-shrink-0 border ${
                              plan.isActive
                                ? 'bg-emerald-50 text-emerald-600 border-emerald-200'
                                : 'bg-slate-100 text-slate-500 border-slate-200'
                            }`}
                          >
                            <Package className="h-6 w-6" strokeWidth={1.5} />
                          </div>

                          {/* Plan Info */}
                          <div className="min-w-0 flex-1">
                            <div className="flex items-center gap-2 flex-wrap">
                              <h4
                                className={`font-bold text-sm md:text-base group-hover:text-emerald-900 transition-colors truncate leading-tight ${!plan.isActive ? 'text-slate-400' : 'text-slate-900'}`}
                              >
                                {i18n.language === 'ar' && plan.nameAr ? plan.nameAr : plan.name}
                              </h4>

                              {/* Plan Type Badge */}
                              <Badge className={`text-[10px] ${getPlanTypeColor(plan.planType)}`}>
                                {getPlanTypeLabel(plan.planType, i18n.language as 'ar' | 'en')}
                              </Badge>

                              {/* Active/Inactive Badge */}
                              <Badge
                                className={`text-[10px] ${plan.isActive ? 'bg-emerald-100 text-emerald-700' : 'bg-slate-100 text-slate-600'}`}
                              >
                                {plan.isActive
                                  ? t('subscriptionPlans.status.active', 'نشط')
                                  : t('subscriptionPlans.status.inactive', 'غير نشط')}
                              </Badge>

                              {/* Public Badge */}
                              {plan.isPublic && (
                                <Badge className="text-[10px] bg-blue-100 text-blue-700">
                                  {t('subscriptionPlans.status.public', 'عام')}
                                </Badge>
                              )}
                            </div>
                            <div className="flex items-center gap-2 mt-0.5">
                              {plan.code && (
                                <span className="text-slate-400 text-xs font-mono">{plan.code}</span>
                              )}
                              <span className="text-slate-300">•</span>
                              <span className="text-slate-500 text-xs">
                                {getBillingPeriodLabel(plan.billingPeriod, i18n.language as 'ar' | 'en')}
                              </span>
                            </div>
                          </div>

                          {/* Amount */}
                          <div className="hidden md:flex flex-col items-end">
                            <span className="font-bold text-lg text-slate-900">
                              {formatSubscriptionAmount(plan.amount, plan.currency, i18n.language as 'ar' | 'en')}
                            </span>
                            <span className="text-xs text-slate-400">
                              / {getBillingPeriodLabel(plan.billingPeriod, i18n.language as 'ar' | 'en')}
                            </span>
                          </div>

                          {/* Mobile Chevron */}
                          <div className="md:hidden text-slate-400 group-hover:text-emerald-600 transition-all duration-300 rtl:rotate-180">
                            <ChevronLeft className="h-5 w-5 rtl:rotate-0 ltr:rotate-180" />
                          </div>

                          {/* Action Menu */}
                          <div className="hidden md:flex" onClick={(e) => e.stopPropagation()}>
                            <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  className="text-slate-400 hover:text-navy hover:bg-slate-100 rounded-xl"
                                >
                                  <MoreHorizontal className="h-6 w-6" />
                                </Button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent align="end" className="w-48 rounded-xl shadow-xl border-0 ring-1 ring-black/5">
                                <DropdownMenuItem
                                  onClick={() => handleViewPlan(plan._id)}
                                  className="rounded-lg py-2.5 cursor-pointer"
                                >
                                  <Eye className="h-4 w-4 ms-2" />
                                  {t('common.viewDetails', 'عرض التفاصيل')}
                                </DropdownMenuItem>
                                <DropdownMenuItem
                                  onClick={() => handleEditPlan(plan._id)}
                                  className="rounded-lg py-2.5 cursor-pointer"
                                >
                                  <Edit3 className="h-4 w-4 ms-2 text-blue-500" aria-hidden="true" />
                                  {t('common.edit', 'تعديل')}
                                </DropdownMenuItem>
                                <DropdownMenuItem
                                  onClick={() => handleOpenDuplicateDialog(plan)}
                                  className="rounded-lg py-2.5 cursor-pointer"
                                >
                                  <Copy className="h-4 w-4 ms-2 text-purple-500" />
                                  {t('common.duplicate', 'نسخ')}
                                </DropdownMenuItem>
                                <DropdownMenuSeparator />
                                <DropdownMenuItem
                                  onClick={() => handleToggleActive(plan._id)}
                                  className="rounded-lg py-2.5 cursor-pointer"
                                >
                                  {plan.isActive ? (
                                    <>
                                      <ToggleLeft className="h-4 w-4 ms-2 text-amber-500" />
                                      {t('subscriptionPlans.actions.deactivate', 'إلغاء التفعيل')}
                                    </>
                                  ) : (
                                    <>
                                      <ToggleRight className="h-4 w-4 ms-2 text-emerald-500" />
                                      {t('subscriptionPlans.actions.activate', 'تفعيل')}
                                    </>
                                  )}
                                </DropdownMenuItem>
                                <DropdownMenuSeparator />
                                <DropdownMenuItem
                                  onClick={() => handleDeletePlan(plan._id)}
                                  className="text-red-600 focus:text-red-600 rounded-lg py-2.5 cursor-pointer bg-red-50/50 hover:bg-red-50"
                                >
                                  <Trash2 className="h-4 w-4 ms-2" />
                                  {t('common.delete', 'حذف')}
                                </DropdownMenuItem>
                              </DropdownMenuContent>
                            </DropdownMenu>
                          </div>
                        </div>

                        {/* Footer */}
                        <div className="flex items-center justify-between pt-2 mt-2 border-t border-slate-100 ps-4">
                          <div className="flex items-center gap-2">
                            {/* Included Hours */}
                            {plan.includedHours && (
                              <div className="flex items-center gap-1 text-[10px] text-slate-600 bg-slate-100 px-2 py-1 rounded-md">
                                <Clock className="w-3 h-3" />
                                <span className="font-medium">
                                  {plan.includedHours} {t('subscriptionPlans.list.hoursIncluded', 'ساعة')}
                                </span>
                              </div>
                            )}

                            {/* Trial Days */}
                            {plan.trialDays && plan.trialDays > 0 && (
                              <div className="flex items-center gap-1 text-[10px] text-purple-600 bg-purple-50 px-2 py-1 rounded-md">
                                <span className="font-medium">
                                  {plan.trialDays} {t('subscriptionPlans.list.trialDays', 'يوم تجريبي')}
                                </span>
                              </div>
                            )}

                            {/* Mobile Amount */}
                            <div className="md:hidden flex items-center gap-1 text-[10px] text-emerald-700 bg-emerald-50 px-2 py-1 rounded-md font-bold">
                              <DollarSign className="w-3 h-3" />
                              {formatSubscriptionAmount(plan.amount, plan.currency, i18n.language as 'ar' | 'en')}
                            </div>
                          </div>

                          <Link
                            to={ROUTES.dashboard.finance.subscriptionPlans.detail(plan._id)}
                            className="hidden sm:inline-flex"
                            onClick={(e) => e.stopPropagation()}
                          >
                            <GosiButton
                              size="sm"
                              className="bg-emerald-50 text-emerald-600 hover:bg-emerald-500 hover:text-white border-0 rounded-md px-3 h-6 text-[10px] transition-all group/btn"
                            >
                              {t('common.viewDetails', 'عرض التفاصيل')}
                              <ArrowRight className="w-3 h-3 ms-1 rtl:rotate-180 transition-transform group-hover/btn:translate-x-0.5 rtl:group-hover/btn:-translate-x-0.5" />
                            </GosiButton>
                          </Link>
                        </div>
                      </div>
                    </div>
                  ))}

                  {/* Load More Section */}
                  <div className="flex flex-col items-center gap-3 pt-4">
                    {hasMorePlans && (
                      <GosiButton
                        onClick={handleLoadMore}
                        variant="outline"
                        className="w-full max-w-sm h-12 rounded-2xl border-2 border-dashed border-slate-200 hover:border-emerald-300 hover:bg-emerald-50/50 text-slate-600 hover:text-emerald-600 font-bold transition-all"
                      >
                        <Plus className="w-5 h-5 ms-2" />
                        {t('common.showMore', 'عرض المزيد')}
                        <span className="text-xs text-slate-400 ms-2">
                          ({visibleCount} / {plans.length})
                        </span>
                      </GosiButton>
                    )}
                  </div>
                </>
              )}
            </div>
          </div>

          {/* LEFT COLUMN (Sidebar) */}
          <div className="space-y-6">
            {/* Quick Actions Card */}
            <GosiCard className="p-6 rounded-[2rem]">
              <h3 className="font-bold text-slate-900 mb-4">
                {t('subscriptionPlans.sidebar.quickActions', 'إجراءات سريعة')}
              </h3>
              <div className="space-y-3">
                <GosiButton asChild className="w-full bg-emerald-500 hover:bg-emerald-600 h-12 rounded-xl">
                  <Link to={ROUTES.dashboard.finance.subscriptionPlans.new}>
                    <Plus className="w-5 h-5 ms-2" />
                    {t('subscriptionPlans.list.newPlan', 'خطة جديدة')}
                  </Link>
                </GosiButton>
                <GosiButton asChild variant="outline" className="w-full h-12 rounded-xl">
                  <Link to={ROUTES.dashboard.finance.subscriptions.list}>
                    <Users className="w-5 h-5 ms-2" />
                    {t('subscriptions.title', 'الاشتراكات')}
                  </Link>
                </GosiButton>
              </div>
            </GosiCard>

            {/* Stats Card */}
            <GosiCard className="p-6 rounded-[2rem]">
              <h3 className="font-bold text-slate-900 mb-4">
                {t('subscriptionPlans.sidebar.stats', 'إحصائيات الخطط')}
              </h3>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-slate-600 text-sm">
                    {t('subscriptionPlans.sidebar.totalPlans', 'إجمالي الخطط')}
                  </span>
                  <span className="font-bold text-slate-900">{plansData?.total || 0}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-slate-600 text-sm">
                    {t('subscriptionPlans.sidebar.activePlans', 'خطط نشطة')}
                  </span>
                  <span className="font-bold text-emerald-600">
                    {plans.filter((p) => p.isActive).length}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-slate-600 text-sm">
                    {t('subscriptionPlans.sidebar.publicPlans', 'خطط عامة')}
                  </span>
                  <span className="font-bold text-blue-600">
                    {plans.filter((p) => p.isPublic).length}
                  </span>
                </div>
              </div>
            </GosiCard>
          </div>
        </div>
      </Main>

      {/* Duplicate Dialog */}
      <Dialog open={duplicateDialogOpen} onOpenChange={setDuplicateDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>
              {t('subscriptionPlans.dialogs.duplicate.title', 'نسخ الخطة')}
            </DialogTitle>
            <DialogDescription>
              {t(
                'subscriptionPlans.dialogs.duplicate.description',
                'أدخل اسماً جديداً للنسخة'
              )}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="duplicate-name">
                {t('subscriptionPlans.form.name', 'الاسم')} ({t('common.english', 'English')})
              </Label>
              <Input
                id="duplicate-name"
                value={duplicateName}
                onChange={(e) => setDuplicateName(e.target.value)}
                placeholder={t('subscriptionPlans.form.namePlaceholder', 'أدخل اسم الخطة')}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="duplicate-name-ar">
                {t('subscriptionPlans.form.nameAr', 'الاسم بالعربية')} ({t('common.arabic', 'العربية')})
              </Label>
              <Input
                id="duplicate-name-ar"
                value={duplicateNameAr}
                onChange={(e) => setDuplicateNameAr(e.target.value)}
                placeholder={t('subscriptionPlans.form.nameArPlaceholder', 'أدخل اسم الخطة بالعربية')}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDuplicateDialogOpen(false)}>
              {t('common.cancel', 'إلغاء')}
            </Button>
            <Button
              onClick={handleDuplicatePlan}
              disabled={!duplicateName.trim() || duplicatePlanMutation.isPending}
              className="bg-emerald-500 hover:bg-emerald-600"
            >
              {duplicatePlanMutation.isPending
                ? t('common.saving', 'جاري الحفظ...')
                : t('common.duplicate', 'نسخ')}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  )
}
