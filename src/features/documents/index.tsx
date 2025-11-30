import { useSearch } from '@tanstack/react-router'
import { useDocuments, useDocumentStats } from '@/hooks/useDocuments'
import { Header } from '@/components/layout/header'
import { TopNav } from '@/components/layout/top-nav'
import { DynamicIsland } from '@/components/dynamic-island'
import { Main } from '@/components/layout/main'
import { ProfileDropdown } from '@/components/profile-dropdown'
import { ThemeSwitch } from '@/components/theme-switch'
import { LanguageSwitcher } from '@/components/language-switcher'
import { ConfigDrawer } from '@/components/config-drawer'
import { DocumentsProvider } from './components/documents-provider'
import { DocumentsTable } from './components/documents-table'
import { DocumentsPrimaryButtons } from './components/documents-primary-buttons'
import { DocumentsDialogs } from './components/documents-dialogs'
import { useTranslation } from 'react-i18next'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { FileText, Lock, HardDrive, Calendar, Search, Bell, Scale } from 'lucide-react'
import { formatFileSize } from './data/data'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import { PracticeSidebar } from '../cases/components/practice-sidebar'
import { ProductivityHero } from '@/components/productivity-hero'

export default function Documents() {
  const { t } = useTranslation()
  const search = useSearch({ from: '/_authenticated/dashboard/documents/' })
  const page = search.page || 1
  const pageSize = search.pageSize || 10

  const { data, isLoading } = useDocuments({
    page,
    limit: pageSize,
    category: search.category,
    search: search.search,
  })

  const { data: stats } = useDocumentStats()

  const topNav = [
    { title: t('nav.overview', 'نظرة عامة'), href: '/dashboard/overview', isActive: false },
    { title: t('nav.cases', 'القضايا'), href: '/dashboard/cases', isActive: true },
  ]

  return (
    <DocumentsProvider>
      <Header className="bg-navy shadow-none relative">
        <TopNav
          links={topNav}
          className="[&>a]:text-slate-300 [&>a:hover]:text-white [&>a[aria-current='page']]:text-white"
        />

        {/* Dynamic Island - Centered */}
        <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 z-50">
          <DynamicIsland />
        </div>

        <div className="ms-auto flex items-center space-x-4">
          <div className="relative hidden md:block">
            <Search className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
            <input
              type="text"
              placeholder={t('common.search', 'بحث...')}
              className="h-9 w-64 rounded-xl border border-white/10 bg-white/5 pr-9 pl-4 text-sm text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500/50"
            />
          </div>
          <Button
            variant="ghost"
            size="icon"
            className="relative rounded-full text-slate-300 hover:bg-white/10 hover:text-white"
          >
            <Bell className="h-5 w-5" />
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

      <Main
        fluid={true}
        className="bg-[#f8f9fa] flex-1 w-full p-6 lg:p-8 space-y-8 rounded-tr-3xl shadow-inner border-r border-white/5 overflow-hidden font-['IBM_Plex_Sans_Arabic']"
      >
        {/* HERO BANNER */}
        <ProductivityHero badge={t('cases.management', 'إدارة القضايا')} title={t('documents.title', 'المستندات والوثائق')} type="documents" hideButtons={true}>
          <DocumentsPrimaryButtons />
        </ProductivityHero>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* --- Main Content --- */}
          <div className="lg:col-span-2 flex flex-col gap-6">

            {/* Stats Cards */}
            {stats && (
              <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
                <Card className="border-slate-100 shadow-sm">
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium text-slate-500">
                      {t('documents.totalDocuments')}
                    </CardTitle>
                    <FileText className="h-4 w-4 text-primary" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold text-navy">{stats.totalDocuments}</div>
                  </CardContent>
                </Card>

                <Card className="border-slate-100 shadow-sm">
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium text-slate-500">
                      {t('documents.confidentialDocs')}
                    </CardTitle>
                    <Lock className="h-4 w-4 text-destructive" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold text-navy">{stats.confidentialDocuments}</div>
                  </CardContent>
                </Card>

                <Card className="border-slate-100 shadow-sm">
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium text-slate-500">
                      {t('documents.storageUsed')}
                    </CardTitle>
                    <HardDrive className="h-4 w-4 text-blue-500" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold text-navy">{formatFileSize(stats.totalStorageUsed)}</div>
                  </CardContent>
                </Card>

                <Card className="border-slate-100 shadow-sm">
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium text-slate-500">
                      {t('documents.thisMonth')}
                    </CardTitle>
                    <Calendar className="h-4 w-4 text-green-500" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold text-navy">{stats.documentsThisMonth}</div>
                  </CardContent>
                </Card>
              </div>
            )}

            <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
              <DocumentsTable
                data={data?.data || []}
                totalCount={data?.total || 0}
                page={page}
                pageSize={pageSize}
                isLoading={isLoading}
              />
            </div>
          </div>

          {/* Sidebar */}
          <PracticeSidebar context="documents" />
        </div>
      </Main>

      <DocumentsDialogs />
    </DocumentsProvider>
  )
}
