import { useWorkflows, useWorkflowStatistics } from '@/hooks/useCaseWorkflows'
import { Header } from '@/components/layout/header'
import { TopNav } from '@/components/layout/top-nav'
import { DynamicIsland } from '@/components/dynamic-island'
import { Main } from '@/components/layout/main'
import { ProfileDropdown } from '@/components/profile-dropdown'
import { ThemeSwitch } from '@/components/theme-switch'
import { LanguageSwitcher } from '@/components/language-switcher'
import { ConfigDrawer } from '@/components/config-drawer'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { WorkflowsProvider } from './components/workflows-provider'
import { WorkflowsTable } from './components/workflows-table'
import { WorkflowsDialogs } from './components/workflows-dialogs'
import { WorkflowsPrimaryButtons } from './components/workflows-primary-buttons'
import { useTranslation } from 'react-i18next'
import { GitBranch, CheckCircle2, Layers, Activity, Search, Bell, Scale } from 'lucide-react'
import { PracticeSidebar } from '../cases/components/practice-sidebar'

export default function CaseWorkflows() {
  const { t } = useTranslation()
  const { data, isLoading, isError } = useWorkflows()
  const { data: stats, isLoading: statsLoading } = useWorkflowStatistics()

  const workflows = data?.workflows || []

  const topNav = [
    { title: t('nav.overview', 'نظرة عامة'), href: '/dashboard/overview', isActive: false },
    { title: t('nav.cases', 'القضايا'), href: '/dashboard/cases', isActive: true },
  ]

  return (
    <WorkflowsProvider>
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
        className="bg-[#f8f9fa] flex-1 w-full p-6 lg:p-8 space-y-8 rounded-tr-3xl shadow-inner border-e border-white/5 overflow-hidden font-['IBM_Plex_Sans_Arabic']"
      >
        {/* HERO BANNER */}
        <div className="bg-navy rounded-3xl p-8 relative overflow-hidden text-white shadow-xl shadow-navy/20 group">
          <div className="absolute -bottom-32 -left-32 w-96 h-96 bg-brand-blue rounded-full blur-[120px] opacity-40 group-hover:opacity-50 transition-opacity duration-700"></div>
          <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-6">
            <div>
              <div className="flex items-center gap-2 mb-2">
                <Badge className="bg-blue-500/20 text-blue-100 hover:bg-blue-500/30 border-0 px-3 py-1">
                  <Scale className="w-3 h-3 ms-2" />
                  {t('cases.management', 'إدارة القضايا')}
                </Badge>
                <span className="text-slate-500 text-sm">
                  {new Date().toLocaleDateString('ar-SA', { month: 'long', year: 'numeric' })}
                </span>
              </div>
              <h1 className="text-4xl font-bold leading-tight mb-2">
                {t('caseWorkflows.title', 'سير العمل والإجراءات')}
              </h1>
              <p className="text-slate-300 text-lg max-w-xl">
                {t('caseWorkflows.subtitle', 'إدارة وتخصيص مراحل سير العمل للقضايا المختلفة')}
              </p>
            </div>
            <div className="flex gap-3">
              <WorkflowsPrimaryButtons />
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* --- Main Content --- */}
          <div className="lg:col-span-2 flex flex-col gap-6">

            {/* Statistics Cards */}
            <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
              <Card className="border-slate-100 shadow-sm">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium text-slate-500">
                    {t('caseWorkflows.totalWorkflows')}
                  </CardTitle>
                  <GitBranch className="h-4 w-4 text-blue-500" />
                </CardHeader>
                <CardContent>
                  {statsLoading ? (
                    <Skeleton className="h-8 w-16" />
                  ) : (
                    <div className="text-2xl font-bold text-navy">{stats?.total || workflows.length}</div>
                  )}
                </CardContent>
              </Card>

              <Card className="border-slate-100 shadow-sm">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium text-slate-500">
                    {t('caseWorkflows.activeWorkflows')}
                  </CardTitle>
                  <Activity className="h-4 w-4 text-emerald-500" />
                </CardHeader>
                <CardContent>
                  {statsLoading ? (
                    <Skeleton className="h-8 w-16" />
                  ) : (
                    <div className="text-2xl font-bold text-navy">
                      {stats?.active || workflows.filter((w) => w.isActive).length}
                    </div>
                  )}
                </CardContent>
              </Card>

              <Card className="border-slate-100 shadow-sm">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium text-slate-500">
                    {t('caseWorkflows.avgStages')}
                  </CardTitle>
                  <Layers className="h-4 w-4 text-purple-500" />
                </CardHeader>
                <CardContent>
                  {statsLoading ? (
                    <Skeleton className="h-8 w-16" />
                  ) : (
                    <div className="text-2xl font-bold text-navy">
                      {stats?.avgStagesPerWorkflow?.toFixed(1) ||
                        (workflows.length > 0
                          ? (
                            workflows.reduce((acc, w) => acc + (w.stages?.length || 0), 0) /
                            workflows.length
                          ).toFixed(1)
                          : '0')}
                    </div>
                  )}
                </CardContent>
              </Card>

              <Card className="border-slate-100 shadow-sm">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium text-slate-500">
                    {t('caseWorkflows.defaultWorkflows')}
                  </CardTitle>
                  <CheckCircle2 className="h-4 w-4 text-amber-500" />
                </CardHeader>
                <CardContent>
                  {statsLoading ? (
                    <Skeleton className="h-8 w-16" />
                  ) : (
                    <div className="text-2xl font-bold text-navy">
                      {workflows.filter((w) => w.isDefault).length}
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>

            {/* Workflows Table */}
            {isLoading ? (
              <div className="space-y-4">
                <Skeleton className="h-10 w-full" />
                <Skeleton className="h-[400px] w-full" />
              </div>
            ) : isError ? (
              <Card className="border-red-100 bg-red-50">
                <CardContent className="py-10 text-center">
                  <p className="text-red-600">{t('common.errorLoading')}</p>
                </CardContent>
              </Card>
            ) : (
              <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
                <WorkflowsTable data={workflows} />
              </div>
            )}
          </div>

          {/* Sidebar */}
          <PracticeSidebar context="workflows" />
        </div>
      </Main>

      <WorkflowsDialogs />
    </WorkflowsProvider>
  )
}
