import { Link } from '@tanstack/react-router'
import { useState, useMemo } from 'react'
import { useTranslation } from 'react-i18next'
import {
  Briefcase,
  Filter,
  Plus,
  Search,
  Scale,
  MoreHorizontal,
  CheckCircle2,
  AlertCircle,
  Bell,
  Users,
  MapPin,
  User,
  Eye,
  ChevronLeft,
  TrendingUp,
  Clock,
  Gavel,
  XCircle,
  PauseCircle,
  Trophy,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Progress } from '@/components/ui/progress'
import { Input } from '@/components/ui/input'
import { Header } from '@/components/layout/header'
import { TopNav } from '@/components/layout/top-nav'
import { DynamicIsland } from '@/components/dynamic-island'
import { Main } from '@/components/layout/main'
import { LanguageSwitcher } from '@/components/language-switcher'
import { ThemeSwitch } from '@/components/theme-switch'
import { ConfigDrawer } from '@/components/config-drawer'
import { ProfileDropdown } from '@/components/profile-dropdown'
import { useCases, useCaseStatistics } from '@/hooks/useCasesAndClients'
import { Skeleton } from '@/components/ui/skeleton'
import { SkeletonTable } from '@/components/skeleton-loader'
import { Alert, AlertDescription } from '@/components/ui/alert'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import { CreateCaseForm } from './create-case-form'
import type { Case, CaseStatus, CaseCategory, CasePriority, ClientRef, LawyerRef } from '@/services/casesService'
import { PracticeSidebar } from './practice-sidebar'
import { ProductivityHero } from '@/components/productivity-hero'
import { EmptyState } from '@/components/empty-state'

// Helper functions
const getClientName = (c: Case): string => {
  if (c.clientName) return c.clientName
  if (c.clientId && typeof c.clientId === 'object') {
    const client = c.clientId as ClientRef
    return client.name || client.firstName || client.username || 'غير محدد'
  }
  return 'غير محدد'
}

const getLawyerName = (c: Case): string => {
  if (c.lawyerId && typeof c.lawyerId === 'object') {
    const lawyer = c.lawyerId as LawyerRef
    if (lawyer.firstName && lawyer.lastName) {
      return `${lawyer.firstName} ${lawyer.lastName}`
    }
    return lawyer.username || 'غير محدد'
  }
  return 'غير محدد'
}

const getDefendantName = (c: Case): string => {
  if (c.laborCaseDetails?.company?.name) return c.laborCaseDetails.company.name
  return 'غير محدد'
}

export function CasesListView() {
  const { t } = useTranslation()
  const [statusFilter, setStatusFilter] = useState<string>('all')
  const [categoryFilter, setCategoryFilter] = useState<string>('all')
  const [searchQuery, setSearchQuery] = useState('')
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false)

  const filters = useMemo(() => {
    const f: any = {}
    if (statusFilter !== 'all') f.status = statusFilter
    if (categoryFilter !== 'all') f.category = categoryFilter
    return f
  }, [statusFilter, categoryFilter])

  const { data: casesData, isLoading, isError, error, refetch } = useCases(filters)
  const statistics = useCaseStatistics(casesData?.cases)

  // Filter cases by search query
  const filteredCases = useMemo(() => {
    if (!casesData?.cases) return []
    if (!searchQuery.trim()) return casesData.cases

    const query = searchQuery.toLowerCase()
    return casesData.cases.filter((c) => {
      return (
        c.title.toLowerCase().includes(query) ||
        c.caseNumber?.toLowerCase().includes(query) ||
        c.court?.toLowerCase().includes(query) ||
        getClientName(c).toLowerCase().includes(query)
      )
    })
  }, [casesData, searchQuery])

  const topNav = [
    { title: t('nav.overview', 'نظرة عامة'), href: '/dashboard/overview', isActive: false },
    { title: t('nav.cases', 'القضايا'), href: '/dashboard/cases', isActive: true },
  ]

  const getPriorityColor = (priority: CasePriority) => {
    switch (priority) {
      case 'critical':
        return 'bg-red-50 text-red-500 border-red-100'
      case 'high':
        return 'bg-orange-50 text-orange-500 border-orange-100'
      case 'medium':
        return 'bg-blue-50 text-blue-500 border-blue-100'
      default:
        return 'bg-slate-50 text-slate-500 border-slate-100'
    }
  }

  const getStatusColor = (status: CaseStatus) => {
    switch (status) {
      case 'active':
        return 'bg-blue-500'
      case 'settlement':
      case 'settled':
        return 'bg-amber-500'
      case 'appeal':
        return 'bg-purple-500'
      case 'closed':
      case 'completed':
        return 'bg-green-500'
      case 'won':
        return 'bg-emerald-500'
      case 'lost':
        return 'bg-red-500'
      case 'on-hold':
        return 'bg-slate-500'
      default:
        return 'bg-slate-500'
    }
  }

  const getStatusLabel = (status: CaseStatus): string => {
    const labels: Record<CaseStatus, string> = {
      active: t('cases.status.active', 'نشطة'),
      closed: t('cases.status.closed', 'مغلقة'),
      appeal: t('cases.status.appeal', 'استئناف'),
      settlement: t('cases.status.settlement', 'تسوية'),
      'on-hold': t('cases.status.onHold', 'معلقة'),
      completed: t('cases.status.completed', 'مكتملة'),
      won: t('cases.status.won', 'فائزة'),
      lost: t('cases.status.lost', 'خاسرة'),
      settled: t('cases.status.settled', 'تمت التسوية'),
    }
    return labels[status] || status
  }

  const getCategoryLabel = (category: CaseCategory): string => {
    const labels: Record<CaseCategory, string> = {
      labor: t('cases.category.labor', 'عمالية'),
      commercial: t('cases.category.commercial', 'تجارية'),
      civil: t('cases.category.civil', 'مدنية'),
      criminal: t('cases.category.criminal', 'جنائية'),
      family: t('cases.category.family', 'أحوال شخصية'),
      administrative: t('cases.category.administrative', 'إدارية'),
      other: t('cases.category.other', 'أخرى'),
    }
    return labels[category] || category
  }

  const formatDate = (dateString?: string) => {
    if (!dateString) return t('cases.notSpecified', 'غير محدد')
    return new Date(dateString).toLocaleDateString('ar-SA', {
      day: 'numeric',
      month: 'long',
    })
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('ar-SA').format(amount)
  }

  // Calculate success rate
  const successRate = statistics.total > 0
    ? Math.round(((statistics.won + statistics.settled) / statistics.total) * 100)
    : 0

  return (
    <>
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
            <Search className="absolute end-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-500" aria-hidden="true" />
            <input
              type="text"
              placeholder={t('common.search', 'بحث...')}
              className="h-9 w-64 rounded-xl border border-white/10 bg-white/5 pe-9 ps-4 text-sm text-white placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/50"
            />
          </div>
          <Button
            variant="ghost"
            size="icon"
            className="relative rounded-full text-slate-300 hover:bg-white/10 hover:text-white flex-shrink-0"
          >
            <Bell className="h-5 w-5" />
            <span className="absolute top-2 right-2 h-2 w-2 bg-red-500 rounded-full border border-navy"></span>
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
        className="bg-[#f8f9fa] flex-1 w-full p-6 lg:p-8 space-y-8 rounded-tr-3xl shadow-inner border-r border-white/5 overflow-hidden font-['IBM_Plex_Sans_Arabic']"
      >
        {/* HERO BANNER */}
        <ProductivityHero badge="القضايا" title="القضايا" type="cases" hideButtons={true}>
          <div className="flex gap-3">
            <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
              <DialogTrigger asChild>
                <Button className="bg-emerald-500 hover:bg-emerald-600 text-white rounded-xl h-10 px-5 font-bold shadow-lg shadow-emerald-500/20 border-0 text-sm">
                  <Plus className="ms-2 h-4 w-4" aria-hidden="true" />
                  {t('cases.newCase', 'قضية جديدة')}
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                  <DialogTitle>{t('cases.createNewCase', 'إنشاء قضية جديدة')}</DialogTitle>
                  <DialogDescription>
                    {t('cases.createDescription', 'أدخل بيانات القضية الجديدة')}
                  </DialogDescription>
                </DialogHeader>
                <CreateCaseForm onSuccess={() => setIsCreateDialogOpen(false)} />
              </DialogContent>
            </Dialog>
          </div>
        </ProductivityHero>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* --- Main Content (Cases List) --- */}
          <div className="lg:col-span-2 flex flex-col gap-6">
            {/* Filters Toolbar */}
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4 bg-white p-2 pe-4 rounded-[20px] border border-slate-100 shadow-sm">
              <div className="flex items-center gap-2 w-full sm:w-auto">
                <Search className="w-5 h-5 text-slate-500" aria-hidden="true" />
                <Input
                  placeholder={t('cases.searchPlaceholder', 'بحث في القضايا...')}
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="border-0 focus-visible:ring-0 text-navy placeholder:text-slate-500 h-9 w-full sm:w-64"
                />
              </div>
              <div className="flex items-center gap-3">
                <Select value={statusFilter} onValueChange={setStatusFilter}>
                  <SelectTrigger className="w-[140px] border-slate-200">
                    <SelectValue placeholder={t('cases.filterByStatus', 'الحالة')} />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">{t('cases.allStatuses', 'جميع الحالات')}</SelectItem>
                    <SelectItem value="active">{t('cases.status.active', 'نشطة')}</SelectItem>
                    <SelectItem value="closed">{t('cases.status.closed', 'مغلقة')}</SelectItem>
                    <SelectItem value="appeal">{t('cases.status.appeal', 'استئناف')}</SelectItem>
                    <SelectItem value="settlement">{t('cases.status.settlement', 'تسوية')}</SelectItem>
                    <SelectItem value="on-hold">{t('cases.status.onHold', 'معلقة')}</SelectItem>
                    <SelectItem value="won">{t('cases.status.won', 'فائزة')}</SelectItem>
                    <SelectItem value="lost">{t('cases.status.lost', 'خاسرة')}</SelectItem>
                  </SelectContent>
                </Select>
                <Select value={categoryFilter} onValueChange={setCategoryFilter}>
                  <SelectTrigger className="w-[140px] border-slate-200">
                    <SelectValue placeholder={t('cases.filterByCategory', 'النوع')} />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">{t('cases.allCategories', 'جميع الأنواع')}</SelectItem>
                    <SelectItem value="labor">{t('cases.category.labor', 'عمالية')}</SelectItem>
                    <SelectItem value="commercial">{t('cases.category.commercial', 'تجارية')}</SelectItem>
                    <SelectItem value="civil">{t('cases.category.civil', 'مدنية')}</SelectItem>
                    <SelectItem value="criminal">{t('cases.category.criminal', 'جنائية')}</SelectItem>
                    <SelectItem value="family">{t('cases.category.family', 'أحوال شخصية')}</SelectItem>
                    <SelectItem value="administrative">{t('cases.category.administrative', 'إدارية')}</SelectItem>
                  </SelectContent>
                </Select>
                <span className="text-sm text-slate-500 font-medium">
                  {filteredCases.length} {t('cases.case', 'قضية')}
                </span>
              </div>
            </div>

            {/* Custom Cases List Design */}
            <div className="space-y-4">
              {/* Loading State */}
              {isLoading && (
                <div className="bg-white rounded-2xl p-6 border border-slate-100">
                  <SkeletonTable rows={10} columns={5} showHeader={true} />
                </div>
              )}

              {/* Error State */}
              {isError && !isLoading && (
                <Alert className="border-red-200 bg-red-50">
                  <AlertCircle className="h-4 w-4 text-red-600" aria-hidden="true" />
                  <AlertDescription className="text-red-800">
                    <div className="flex items-center justify-between">
                      <span>
                        {t('cases.loadError', 'حدث خطأ أثناء تحميل القضايا')}: {error?.message || t('common.unknownError', 'خطأ غير معروف')}
                      </span>
                      <Button
                        onClick={() => refetch()}
                        variant="outline"
                        size="sm"
                        className="border-red-300 text-red-700 hover:bg-red-100"
                      >
                        {t('common.retry', 'إعادة المحاولة')}
                      </Button>
                    </div>
                  </AlertDescription>
                </Alert>
              )}

              {/* Empty State */}
              {!isLoading && !isError && filteredCases.length === 0 && (
                <div className="bg-white rounded-2xl">
                  <EmptyState
                    icon="cases"
                    title={t('cases.empty.title')}
                    description={t('cases.empty.description')}
                    actionLabel={t('cases.empty.action')}
                    onAction={() => setIsCreateDialogOpen(true)}
                  />
                </div>
              )}

              {/* Success State - Case Cards */}
              {!isLoading &&
                !isError &&
                filteredCases.length > 0 &&
                filteredCases.map((caseItem) => (
                  <div
                    key={caseItem._id}
                    className="bg-white rounded-2xl p-6 border border-slate-100 hover:border-blue-200 transition-all group shadow-sm"
                  >
                    <div className="flex justify-between items-start mb-4">
                      <div className="flex gap-4 items-start flex-1">
                        <div
                          className={`w-12 h-12 rounded-xl flex items-center justify-center shadow-sm border ${getPriorityColor(caseItem.priority)}`}
                        >
                          {caseItem.priority === 'critical' ? (
                            <AlertCircle className="h-6 w-6" aria-hidden="true" />
                          ) : (
                            <Scale className="h-6 w-6" />
                          )}
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-2 flex-wrap">
                            <Link
                              to="/dashboard/cases/$caseId"
                              params={{ caseId: caseItem._id }}
                              className="hover:underline decoration-brand-blue underline-offset-4"
                            >
                              <h4 className="font-bold text-slate-900 text-lg group-hover:text-brand-blue transition-colors">
                                {caseItem.title}
                              </h4>
                            </Link>
                            <span
                              className={`px-3 py-1 ${getStatusColor(caseItem.status)} text-white rounded-full text-xs font-medium`}
                            >
                              {getStatusLabel(caseItem.status)}
                            </span>
                            {(caseItem.priority === 'critical' || caseItem.priority === 'high') && (
                              <span className="bg-red-100 text-red-700 hover:bg-red-200 border-0 rounded-md px-2 py-1 text-xs font-medium">
                                {caseItem.priority === 'critical' ? t('cases.urgent', 'عاجل جداً') : t('cases.highPriority', 'عاجل')}
                              </span>
                            )}
                          </div>
                          <div className="space-y-2 text-sm">
                            <div className="flex items-center gap-2 text-slate-600">
                              <Users className="h-4 w-4 text-slate-500" aria-hidden="true" />
                              <span className="text-green-600 font-medium">{t('cases.plaintiff', 'المدعي')}:</span>
                              <span>{getClientName(caseItem)}</span>
                            </div>
                            {getDefendantName(caseItem) !== 'غير محدد' && (
                              <div className="flex items-center gap-2 text-slate-600">
                                <Users className="h-4 w-4 text-slate-500" aria-hidden="true" />
                                <span className="text-amber-600 font-medium">{t('cases.defendant', 'المدعى عليه')}:</span>
                                <span>{getDefendantName(caseItem)}</span>
                              </div>
                            )}
                            <div className="flex items-center gap-4 flex-wrap">
                              {caseItem.court && (
                                <div className="flex items-center gap-2 text-slate-600">
                                  <MapPin className="h-4 w-4 text-slate-500" aria-hidden="true" />
                                  <span>{caseItem.court}</span>
                                </div>
                              )}
                              <div className="flex items-center gap-2 text-slate-600">
                                <User className="h-4 w-4 text-slate-500" aria-hidden="true" />
                                <span>{getLawyerName(caseItem)}</span>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="text-slate-500 hover:text-slate-900 hover:bg-slate-50 rounded-lg"
                      >
                        <MoreHorizontal className="h-5 w-5" />
                      </Button>
                    </div>

                    {/* Progress Bar */}
                    <div className="mb-4">
                      <div className="flex justify-between text-xs text-slate-500 mb-2">
                        <span>{t('cases.progress', 'التقدم')}</span>
                        <span className="font-bold text-blue-600">{caseItem.progress}%</span>
                      </div>
                      <div className="w-full bg-slate-200 rounded-full h-2">
                        <div
                          className="bg-blue-600 h-2 rounded-full transition-all duration-500"
                          style={{ width: `${caseItem.progress}%` }}
                        ></div>
                      </div>
                    </div>

                    <div className="flex items-center justify-between pt-4 border-t border-slate-100">
                      <div className="flex items-center gap-6 flex-wrap">
                        <div className="text-center">
                          <div className="text-xs text-slate-500 mb-1">{t('cases.type', 'النوع')}</div>
                          <div className="font-bold text-slate-900">{getCategoryLabel(caseItem.category)}</div>
                        </div>
                        <div className="text-center">
                          <div className="text-xs text-slate-500 mb-1">{t('cases.nextHearing', 'الجلسة القادمة')}</div>
                          <div
                            className={`font-bold ${caseItem.priority === 'critical' ? 'text-red-600' : 'text-slate-900'}`}
                          >
                            {formatDate(caseItem.nextHearing)}
                          </div>
                        </div>
                        <div className="text-center">
                          <div className="text-xs text-slate-500 mb-1">{t('cases.claimAmount', 'قيمة المطالبة')}</div>
                          <div className="font-bold text-green-600">
                            {formatCurrency(caseItem.claimAmount)} {t('common.sar', 'ر.س')}
                          </div>
                        </div>
                        {caseItem.caseNumber && (
                          <div className="text-center">
                            <div className="text-xs text-slate-500 mb-1">{t('cases.caseNumber', 'رقم القضية')}</div>
                            <div className="text-xs text-slate-600">{caseItem.caseNumber}</div>
                          </div>
                        )}
                      </div>
                      <div className="flex gap-2">
                        <Button
                          variant="outline"
                          size="icon"
                          className="border-slate-200 text-slate-600 hover:bg-slate-50 rounded-lg"
                        >
                          <Eye className="h-4 w-4" />
                        </Button>
                        <Link to="/dashboard/cases/$caseId" params={{ caseId: caseItem._id }}>
                          <Button className="bg-blue-600 hover:bg-blue-700 text-white rounded-lg px-6 shadow-lg shadow-blue-600/20 font-medium text-sm transition-colors">
                            {t('cases.details', 'التفاصيل')}
                          </Button>
                        </Link>
                      </div>
                    </div>
                  </div>
                ))}
            </div>

            {/* Load More */}
            {filteredCases.length > 0 && (
              <div className="p-4 pt-0 text-center">
                <Button
                  variant="ghost"
                  className="text-blue-600 hover:text-blue-700 hover:bg-blue-50 w-full rounded-xl py-6 font-medium transition-colors flex items-center justify-center gap-2"
                >
                  {t('cases.viewAll', 'عرض جميع القضايا')}
                  <ChevronLeft className="h-4 w-4" aria-hidden="true" />
                </Button>
              </div>
            )}
          </div>

          {/* Sidebar */}
          <PracticeSidebar context="cases" />
        </div>
      </Main>
    </>
  )
}
