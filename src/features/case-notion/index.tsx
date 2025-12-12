import { useState } from 'react'
import { useParams, useNavigate, useSearch } from '@tanstack/react-router'
import { useTranslation } from 'react-i18next'
import {
  Lightbulb,
  Search,
  Bell,
  Scale,
  ArrowLeft,
  PanelLeftClose,
  PanelLeft,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Header } from '@/components/layout/header'
import { TopNav } from '@/components/layout/top-nav'
import { DynamicIsland } from '@/components/dynamic-island'
import { Main } from '@/components/layout/main'
import { LanguageSwitcher } from '@/components/language-switcher'
import { ThemeSwitch } from '@/components/theme-switch'
import { ConfigDrawer } from '@/components/config-drawer'
import { ProfileDropdown } from '@/components/profile-dropdown'
import { cn } from '@/lib/utils'
import { useCase } from '@/hooks/useCasesAndClients'
import { NotionSidebar } from './components/notion-sidebar'
import { NotionPageView } from './components/notion-page-view'

interface CaseNotionProps {
  caseId?: string
  pageId?: string
}

export default function CaseNotion({ caseId: propsCaseId, pageId: propsPageId }: CaseNotionProps) {
  const { t, i18n } = useTranslation()
  const isArabic = i18n.language === 'ar'
  const params = useParams({ strict: false })
  const navigate = useNavigate()

  // Get caseId from props or params
  const caseId = propsCaseId || (params as { caseId?: string }).caseId || ''
  const [selectedPageId, setSelectedPageId] = useState<string | undefined>(propsPageId)
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false)

  // Fetch case data
  const { data: caseData, isLoading: caseLoading } = useCase(caseId)

  const topNav = [
    { title: t('nav.overview', 'نظرة عامة'), href: '/dashboard/overview', isActive: false },
    { title: t('nav.cases', 'القضايا'), href: '/dashboard/cases', isActive: true },
  ]

  const handlePageSelect = (pageId: string) => {
    setSelectedPageId(pageId)
  }

  const handleBack = () => {
    setSelectedPageId(undefined)
  }

  const handleBackToCase = () => {
    navigate({ to: '/dashboard/cases/$caseId', params: { caseId } })
  }

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

        <div className="ms-auto flex items-center gap-4">
          <div className="relative hidden md:block">
            <Search
              className="absolute end-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-500"
              aria-hidden="true"
            />
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
          <ThemeSwitch className="text-slate-300 hover:bg-white/10 hover:text-white" />
          <ConfigDrawer className="text-slate-300 hover:bg-white/10 hover:text-white" />
          <ProfileDropdown className="text-slate-300 hover:bg-white/10 hover:text-white" />
        </div>
        {/* Bottom Gradient Line */}
        <div className="absolute bottom-0 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-emerald-500/50 to-transparent"></div>
      </Header>

      <Main
        fluid={true}
        className="bg-[#f8f9fa] flex-1 w-full p-0 rounded-tr-3xl shadow-inner border-e border-white/5 overflow-hidden font-['IBM_Plex_Sans_Arabic']"
      >
        {/* Sub-header with case info */}
        <div className="bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-700 px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Button
                variant="ghost"
                size="sm"
                onClick={handleBackToCase}
                className="text-slate-500 hover:text-slate-700"
              >
                <ArrowLeft
                  size={16}
                  className={cn('me-1', isArabic && 'rotate-180')}
                />
                {t('caseNotion.backToCase')}
              </Button>

              <div className="flex items-center gap-2">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center">
                    <Lightbulb className="w-4 h-4 text-white" />
                  </div>
                  <div>
                    <h1 className="font-bold text-slate-900 dark:text-white text-lg">
                      {t('caseNotion.title')}
                    </h1>
                    {caseData && (
                      <p className="text-xs text-slate-500">
                        {isArabic
                          ? caseData.titleAr || caseData.title
                          : caseData.title}
                        {caseData.caseNumber && (
                          <span className="ms-2 font-mono">
                            #{caseData.caseNumber}
                          </span>
                        )}
                      </p>
                    )}
                  </div>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8"
                onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
              >
                {sidebarCollapsed ? (
                  <PanelLeft size={16} />
                ) : (
                  <PanelLeftClose size={16} />
                )}
              </Button>
            </div>
          </div>
        </div>

        {/* Main content area */}
        <div className="flex h-[calc(100vh-theme(spacing.16)-73px)]">
          {/* Sidebar */}
          <div
            className={cn(
              'shrink-0 transition-all duration-300 ease-in-out overflow-hidden',
              sidebarCollapsed ? 'w-0' : 'w-72'
            )}
          >
            <NotionSidebar
              caseId={caseId}
              activePageId={selectedPageId}
              onPageSelect={handlePageSelect}
            />
          </div>

          {/* Content area */}
          <div className="flex-1 overflow-hidden">
            {selectedPageId ? (
              <NotionPageView
                caseId={caseId}
                pageId={selectedPageId}
                onBack={handleBack}
              />
            ) : (
              <div className="flex items-center justify-center h-full bg-white dark:bg-slate-900">
                <div className="text-center max-w-md">
                  <div className="w-20 h-20 mx-auto mb-6 rounded-2xl bg-gradient-to-br from-emerald-500/20 to-teal-600/20 flex items-center justify-center">
                    <Lightbulb className="w-10 h-10 text-emerald-600" />
                  </div>
                  <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-3">
                    {t('caseNotion.welcomeTitle')}
                  </h2>
                  <p className="text-slate-500 mb-6">
                    {t('caseNotion.welcomeDescription')}
                  </p>
                  <div className="grid grid-cols-2 gap-4 text-start">
                    <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700">
                      <Scale className="w-6 h-6 text-emerald-600 mb-2" />
                      <h3 className="font-medium text-slate-900 dark:text-white text-sm mb-1">
                        {t('caseNotion.feature.strategy')}
                      </h3>
                      <p className="text-xs text-slate-500">
                        {t('caseNotion.feature.strategyDesc')}
                      </p>
                    </div>
                    <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700">
                      <Lightbulb className="w-6 h-6 text-amber-500 mb-2" />
                      <h3 className="font-medium text-slate-900 dark:text-white text-sm mb-1">
                        {t('caseNotion.feature.brainstorm')}
                      </h3>
                      <p className="text-xs text-slate-500">
                        {t('caseNotion.feature.brainstormDesc')}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </Main>
    </>
  )
}
