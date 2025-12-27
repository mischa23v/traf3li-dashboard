/**
 * Cases Kanban View
 * Odoo-style Kanban workflow view for cases
 * Integrates KanbanBoard component with case data
 */

import { useState } from 'react'
import { Link, useNavigate } from '@tanstack/react-router'
import { useTranslation } from 'react-i18next'
import { Header } from '@/components/layout/header'
import { TopNav } from '@/components/layout/top-nav'
import { DynamicIsland } from '@/components/dynamic-island'
import { Main } from '@/components/layout/main'
import { LanguageSwitcher } from '@/components/language-switcher'
import { ThemeSwitch } from '@/components/theme-switch'
import { ConfigDrawer } from '@/components/config-drawer'
import { ProfileDropdown } from '@/components/profile-dropdown'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import { Alert, AlertDescription } from '@/components/ui/alert'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { ProductivityHero } from '@/components/productivity-hero'
import { KanbanBoard } from '@/components/kanban/kanban-board'
import { useKanban } from '@/hooks/useKanban'
import {
  Search,
  Bell,
  Plus,
  AlertCircle,
  List,
  Kanban,
  Scale,
  DollarSign,
  AlertTriangle,
} from 'lucide-react'
import { ROUTES } from '@/constants/routes'

// Case categories
const CASE_CATEGORIES = [
  { value: 'all', label: 'الكل', labelEn: 'All' },
  { value: 'labor', label: 'عمالية', labelEn: 'Labor' },
  { value: 'commercial', label: 'تجارية', labelEn: 'Commercial' },
  { value: 'civil', label: 'مدنية', labelEn: 'Civil' },
  { value: 'criminal', label: 'جنائية', labelEn: 'Criminal' },
  { value: 'family', label: 'أحوال شخصية', labelEn: 'Family' },
  { value: 'administrative', label: 'إدارية', labelEn: 'Administrative' },
  { value: 'other', label: 'أخرى', labelEn: 'Other' },
]

export function CasesKanbanView() {
  const { t, i18n } = useTranslation()
  const navigate = useNavigate()
  const isRTL = i18n.language === 'ar'

  const [categoryFilter, setCategoryFilter] = useState<string>('all')

  // Use kanban hook
  const {
    stages,
    cards,
    isLoading,
    isError,
    error,
    refetch,
    handleCardMove,
    handleQuickCreate,
  } = useKanban({
    category: categoryFilter,
  })

  // Calculate analytics
  const analytics = {
    totalCases: cards.length,
    totalValue: cards.reduce((sum, card) => sum + (card.claimAmount || 0), 0),
    urgentCases: cards.filter(
      card => card.priority === 'high' || card.priority === 'critical'
    ).length,
  }

  // Handle card click
  const handleCardClick = (card: any) => {
    navigate({ to: ROUTES.dashboard.cases.detail(card._id) as any })
  }

  const topNav = [
    { title: t('nav.overview', 'نظرة عامة'), href: '/dashboard/overview', isActive: false },
    { title: t('nav.cases', 'القضايا'), href: ROUTES.dashboard.cases.list, isActive: true },
  ]

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

        <div className="ms-auto flex items-center gap-2 sm:gap-4">
          <div className="relative hidden md:block">
            <Search className="absolute end-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-500" />
            <input
              type="text"
              placeholder={t('common.search', 'بحث...')}
              className="h-9 w-64 rounded-xl border border-white/10 bg-white/5 pe-9 ps-4 text-sm text-white placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/50"
            />
          </div>
          <Button
            variant="ghost"
            size="icon"
            className="relative rounded-full text-slate-300 hover:bg-white/10 hover:text-white"
          >
            <Bell className="h-5 w-5" />
            <span className="absolute top-2 end-2 h-2 w-2 bg-red-500 rounded-full border border-navy"></span>
          </Button>
          <LanguageSwitcher className="text-slate-300 hover:bg-white/10 hover:text-white" />
          <ThemeSwitch className="text-slate-300 hover:bg-white/10 hover:text-white hidden sm:flex" />
          <ConfigDrawer className="text-slate-300 hover:bg-white/10 hover:text-white hidden lg:flex" />
          <ProfileDropdown className="text-slate-300 hover:bg-white/10 hover:text-white" />
        </div>
        {/* Bottom Gradient Line */}
        <div className="absolute bottom-0 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-emerald-500/50 to-transparent"></div>
      </Header>

      <Main
        fluid={true}
        className="bg-[#f8f9fa] flex-1 w-full p-6 lg:p-8 space-y-6 rounded-tr-3xl shadow-inner border-e border-white/5 overflow-hidden font-['IBM_Plex_Sans_Arabic']"
      >
        {/* Hero */}
        <ProductivityHero
          badge={t('cases.kanban.badge', 'لوحة القضايا')}
          title={t('cases.kanban.title', 'لوحة كانبان للقضايا')}
          type="cases"
          hideButtons={true}
        >
          <Link to={ROUTES.dashboard.cases.new}>
            <Button className="bg-emerald-500 hover:bg-emerald-600 text-white rounded-xl h-10 px-5 font-bold shadow-lg shadow-emerald-500/20 border-0 text-sm">
              <Plus className="ms-2 h-4 w-4" />
              {t('cases.newCase', 'قضية جديدة')}
            </Button>
          </Link>
        </ProductivityHero>

        {/* Controls & Stats */}
        <div className="flex flex-wrap items-center justify-between gap-4 bg-white rounded-2xl p-4 shadow-sm">
          <div className="flex items-center gap-3">
            {/* Category Filter */}
            <Select value={categoryFilter} onValueChange={setCategoryFilter}>
              <SelectTrigger className="w-[180px] h-10 rounded-xl">
                <SelectValue placeholder={t('cases.selectCategory', 'نوع القضية')} />
              </SelectTrigger>
              <SelectContent>
                {CASE_CATEGORIES.map((cat) => (
                  <SelectItem key={cat.value} value={cat.value}>
                    {isRTL ? cat.label : cat.labelEn}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            {/* View Mode Toggle */}
            <div className="flex bg-slate-100 rounded-xl p-1">
              <Button
                variant="ghost"
                size="sm"
                className="rounded-lg px-3 bg-white shadow-sm"
              >
                <Kanban className="h-4 w-4 ms-2" />
                {t('cases.kanban.view', 'كانبان')}
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => navigate({ to: ROUTES.dashboard.cases.list as any })}
                className="rounded-lg px-3"
              >
                <List className="h-4 w-4 ms-2" />
                {t('cases.list.view', 'قائمة')}
              </Button>
            </div>
          </div>

          {/* Quick Stats */}
          <div className="flex flex-wrap items-center gap-3">
            <Badge variant="outline" className="px-3 py-1.5 gap-2">
              <Scale className="w-3 h-3 text-emerald-500" />
              {analytics.totalCases} {t('cases.kanban.cases', 'قضية')}
            </Badge>
            <Badge variant="outline" className="px-3 py-1.5 gap-2">
              <DollarSign className="w-3 h-3 text-emerald-500" />
              {(analytics.totalValue / 1000).toFixed(0)}K {t('common.sar', 'ر.س')}
            </Badge>
            {analytics.urgentCases > 0 && (
              <Badge variant="outline" className="px-3 py-1.5 gap-2 border-red-200 text-red-600">
                <AlertTriangle className="w-3 h-3" />
                {analytics.urgentCases} {t('cases.kanban.urgent', 'عاجل')}
              </Badge>
            )}
          </div>
        </div>

        {/* Board Content */}
        {isLoading ? (
          <div className="flex gap-4 overflow-x-auto pb-4">
            {[1, 2, 3, 4, 5].map((i) => (
              <div key={i} className="flex-shrink-0 w-80">
                <Skeleton className="h-12 w-full rounded-t-xl" />
                <div className="bg-slate-100 p-3 rounded-b-xl space-y-3 min-h-[400px]">
                  {[1, 2, 3].map((j) => (
                    <Skeleton key={j} className="h-32 w-full rounded-xl" />
                  ))}
                </div>
              </div>
            ))}
          </div>
        ) : isError ? (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              {error?.message || t('cases.kanban.error', 'خطأ في تحميل البيانات')}
              <Button
                variant="outline"
                size="sm"
                onClick={() => refetch()}
                className="ms-4"
              >
                {t('common.retry', 'إعادة المحاولة')}
              </Button>
            </AlertDescription>
          </Alert>
        ) : (
          <KanbanBoard
            stages={stages}
            cards={cards}
            onCardMove={handleCardMove}
            onCardClick={handleCardClick}
            onQuickCreate={handleQuickCreate}
            isLoading={isLoading}
          />
        )}
      </Main>
    </>
  )
}
