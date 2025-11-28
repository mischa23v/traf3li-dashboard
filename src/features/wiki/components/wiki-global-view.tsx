import { useState } from 'react'
import { Link } from '@tanstack/react-router'
import { useTranslation } from 'react-i18next'
import {
  FileText,
  Search,
  Bell,
  AlertCircle,
  BookOpen,
  Clock,
  Pin,
  Lock,
  Shield,
  Briefcase,
  ArrowLeft
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
import { Skeleton } from '@/components/ui/skeleton'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { useRecentWikiPages, useWikiGlobalSearch } from '@/hooks/useWiki'
import type { WikiPageType, WikiPageStatus } from '@/types/wiki'
import {
  pageTypeLabels,
  pageTypeLabelsAr,
  pageStatusLabels,
  pageStatusLabelsAr,
  pageStatusColors
} from '@/constants/wikiLabels'

export function WikiGlobalView() {
  const { t, i18n } = useTranslation()
  const isArabic = i18n.language === 'ar'

  const [searchQuery, setSearchQuery] = useState('')

  // Fetch recent pages across all cases
  const { data: recentPages, isLoading, isError, error, refetch } = useRecentWikiPages(20)

  // Global search
  const { data: searchResults, isLoading: isSearching } = useWikiGlobalSearch(searchQuery, 20)

  const displayPages = searchQuery.length >= 2 ? searchResults : recentPages

  const getPageTypeLabel = (type: WikiPageType) =>
    isArabic ? pageTypeLabelsAr[type] : pageTypeLabels[type]

  const getStatusLabel = (status: WikiPageStatus) =>
    isArabic ? pageStatusLabelsAr[status] : pageStatusLabels[status]

  const topNav = [
    { title: isArabic ? 'الرئيسية' : 'Home', href: '/', isActive: false },
    { title: isArabic ? 'ويكي' : 'Wiki', href: '/dashboard/wiki' as any, isActive: true },
  ]

  return (
    <>
      <Header className="bg-navy shadow-none relative">
        <TopNav links={topNav} className="[&>a]:text-slate-300 [&>a:hover]:text-white [&>a[aria-current='page']]:text-white" />

        <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 z-50">
          <DynamicIsland />
        </div>

        <div className='ms-auto flex items-center space-x-4'>
          <div className="relative hidden md:block">
            <Search className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
            <input
              type="text"
              placeholder={t('wiki.searchPlaceholder')}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="h-9 w-64 rounded-xl border border-white/10 bg-white/5 pr-9 pl-4 text-sm text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500/50"
            />
          </div>
          <Button variant="ghost" size="icon" className="relative rounded-full text-slate-300 hover:bg-white/10 hover:text-white">
            <Bell className="h-5 w-5" />
            <span className="absolute top-2 right-2 h-2 w-2 bg-red-500 rounded-full border border-navy"></span>
          </Button>
          <LanguageSwitcher className="text-slate-300 hover:bg-white/10 hover:text-white" />
          <ThemeSwitch className="text-slate-300 hover:bg-white/10 hover:text-white" />
          <ConfigDrawer className="text-slate-300 hover:bg-white/10 hover:text-white" />
          <ProfileDropdown className="text-slate-300 hover:bg-white/10 hover:text-white" />
        </div>
        <div className="absolute bottom-0 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-emerald-500/50 to-transparent"></div>
      </Header>

      <Main fluid={true} className="bg-[#f8f9fa] flex-1 w-full p-6 lg:p-8 space-y-8 rounded-tr-3xl shadow-inner border-r border-white/5 overflow-hidden font-['IBM_Plex_Sans_Arabic']">

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

          {/* LEFT COLUMN (Info Card) */}
          <div className="space-y-6">
            <Card className="border border-slate-100 shadow-sm rounded-2xl overflow-hidden">
              <CardHeader className="bg-white border-b border-slate-50 pb-4">
                <CardTitle className="text-lg font-bold text-navy flex items-center gap-2">
                  <BookOpen className="h-5 w-5 text-emerald-500" />
                  {isArabic ? 'نظرة عامة' : 'Overview'}
                </CardTitle>
              </CardHeader>
              <CardContent className="p-4 space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-slate-50 rounded-xl p-4 text-center">
                    <div className="text-2xl font-bold text-navy">{recentPages?.length || 0}</div>
                    <div className="text-xs text-slate-500">{isArabic ? 'آخر الصفحات' : 'Recent Pages'}</div>
                  </div>
                  <div className="bg-emerald-50 rounded-xl p-4 text-center">
                    <div className="text-2xl font-bold text-emerald-600">
                      {recentPages?.filter(p => p.isPinned).length || 0}
                    </div>
                    <div className="text-xs text-emerald-600">{isArabic ? 'مثبتة' : 'Pinned'}</div>
                  </div>
                </div>
                <p className="text-sm text-slate-500 leading-relaxed">
                  {isArabic
                    ? 'هنا يمكنك تصفح جميع صفحات الويكي من مختلف القضايا. للوصول إلى ويكي قضية محددة، انتقل إلى صفحة القضية.'
                    : 'Browse all wiki pages across your cases. To access a specific case wiki, navigate to the case page.'}
                </p>
              </CardContent>
            </Card>

            {/* Quick Access to Cases */}
            <Card className="border border-slate-100 shadow-sm rounded-2xl overflow-hidden">
              <CardHeader className="bg-white border-b border-slate-50 pb-4">
                <CardTitle className="text-lg font-bold text-navy flex items-center gap-2">
                  <Briefcase className="h-5 w-5 text-emerald-500" />
                  {isArabic ? 'القضايا' : 'Cases'}
                </CardTitle>
              </CardHeader>
              <CardContent className="p-4">
                <p className="text-sm text-slate-500 mb-4">
                  {isArabic
                    ? 'لإنشاء صفحة ويكي جديدة، انتقل إلى قضية محددة.'
                    : 'To create a new wiki page, navigate to a specific case.'}
                </p>
                <Button asChild className="w-full bg-emerald-500 hover:bg-emerald-600 text-white rounded-xl">
                  <Link to="/dashboard/cases">
                    <Briefcase className="me-2 h-4 w-4" />
                    {isArabic ? 'عرض القضايا' : 'View Cases'}
                  </Link>
                </Button>
              </CardContent>
            </Card>
          </div>

          {/* RIGHT COLUMN (Main Content) */}
          <div className="lg:col-span-2 space-y-8">

            {/* HERO CARD */}
            <div className="bg-navy rounded-3xl p-8 relative overflow-hidden text-white shadow-xl shadow-navy/20 flex flex-col md:flex-row items-center justify-between gap-8">
              <div className="relative z-10 max-w-lg">
                <h2 className="text-3xl font-bold mb-4 leading-tight">
                  {t('wiki.title')}
                </h2>
                <p className="text-blue-200 text-lg mb-8 leading-relaxed">
                  {isArabic
                    ? 'تصفح جميع صفحات الويكي من مختلف القضايا في مكان واحد. ابحث عن المعلومات واستعرض أحدث التحديثات.'
                    : 'Browse all wiki pages from different cases in one place. Search for information and review the latest updates.'}
                </p>
                <div className="flex gap-3">
                  <Button asChild className="bg-white text-slate-900 hover:bg-slate-100 h-12 px-8 rounded-xl font-bold shadow-lg border-0 transition-all hover:scale-105">
                    <Link to="/dashboard/cases">
                      <Briefcase className="me-2 h-5 w-5" />
                      {isArabic ? 'انتقل للقضايا' : 'Go to Cases'}
                    </Link>
                  </Button>
                </div>
              </div>
              {/* Abstract Visual Decoration */}
              <div className="hidden md:block relative w-64 h-64">
                <div className="absolute inset-0 bg-gradient-to-tr from-emerald-500 to-blue-500 rounded-full opacity-20 blur-3xl animate-pulse"></div>
                <div className="absolute inset-4 bg-navy rounded-2xl border border-white/10 flex items-center justify-center transform rotate-6 shadow-2xl">
                  <BookOpen className="h-24 w-24 text-emerald-400" />
                </div>
                <div className="absolute inset-4 bg-navy/80 rounded-2xl border border-white/10 flex items-center justify-center transform -rotate-6 backdrop-blur-sm">
                  <FileText className="h-24 w-24 text-blue-400" />
                </div>
              </div>
            </div>

            {/* MAIN WIKI LIST */}
            <div className="bg-white rounded-3xl p-1 shadow-sm border border-slate-100">
              <div className="p-6 pb-2 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <h3 className="font-bold text-navy text-xl">
                  {searchQuery.length >= 2
                    ? (isArabic ? `نتائج البحث: "${searchQuery}"` : `Search Results: "${searchQuery}"`)
                    : (isArabic ? 'آخر الصفحات' : 'Recent Pages')}
                </h3>
                {/* Mobile search */}
                <div className="relative md:hidden w-full">
                  <Search className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                  <input
                    type="text"
                    placeholder={t('wiki.searchPlaceholder')}
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="h-10 w-full rounded-xl border border-slate-200 pr-10 pl-4 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/50"
                  />
                </div>
              </div>

              <div className="p-4 space-y-4">
                {/* Loading State */}
                {(isLoading || isSearching) && (
                  <>
                    {[1, 2, 3].map((i) => (
                      <div key={i} className="bg-[#F8F9FA] rounded-2xl p-6 border border-slate-100">
                        <div className="flex justify-between items-start mb-4">
                          <div className="flex gap-4 items-center flex-1">
                            <Skeleton className="w-12 h-12 rounded-xl" />
                            <div className="flex-1 space-y-2">
                              <Skeleton className="h-5 w-3/4" />
                              <Skeleton className="h-4 w-1/2" />
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center justify-between pt-4 border-t border-slate-200/50">
                          <Skeleton className="h-10 w-32" />
                          <Skeleton className="h-10 w-24" />
                        </div>
                      </div>
                    ))}
                  </>
                )}

                {/* Error State */}
                {isError && !isLoading && (
                  <Alert className="border-red-200 bg-red-50">
                    <AlertCircle className="h-4 w-4 text-red-600" />
                    <AlertDescription className="text-red-800">
                      <div className="flex items-center justify-between">
                        <span>{isArabic ? 'حدث خطأ أثناء تحميل الصفحات' : 'Error loading pages'}: {error?.message}</span>
                        <Button onClick={() => refetch()} variant="outline" size="sm" className="border-red-300 text-red-700 hover:bg-red-100">
                          {isArabic ? 'إعادة المحاولة' : 'Retry'}
                        </Button>
                      </div>
                    </AlertDescription>
                  </Alert>
                )}

                {/* Empty State */}
                {!isLoading && !isSearching && !isError && (!displayPages || displayPages.length === 0) && (
                  <div className="text-center py-12">
                    <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-emerald-50 mb-4">
                      <BookOpen className="h-8 w-8 text-emerald-500" />
                    </div>
                    <h4 className="text-lg font-bold text-navy mb-2">
                      {searchQuery.length >= 2
                        ? (isArabic ? 'لا توجد نتائج' : 'No Results')
                        : (isArabic ? 'لا توجد صفحات' : 'No Pages')}
                    </h4>
                    <p className="text-slate-500 mb-4">
                      {searchQuery.length >= 2
                        ? (isArabic ? 'جرب البحث بكلمات مختلفة' : 'Try searching with different keywords')
                        : (isArabic ? 'ابدأ بإنشاء صفحة ويكي في إحدى قضاياك' : 'Start by creating a wiki page in one of your cases')}
                    </p>
                    <Button asChild className="bg-emerald-500 hover:bg-emerald-600 text-white rounded-xl">
                      <Link to="/dashboard/cases">
                        <Briefcase className="me-2 h-4 w-4" />
                        {isArabic ? 'انتقل للقضايا' : 'Go to Cases'}
                      </Link>
                    </Button>
                  </div>
                )}

                {/* Success State - Page List */}
                {!isLoading && !isSearching && !isError && displayPages && displayPages.length > 0 && displayPages.map((page) => (
                  <div key={page._id} className="bg-[#F8F9FA] rounded-2xl p-6 border border-slate-100 hover:border-emerald-200 transition-all group">
                    <div className="flex justify-between items-start mb-4">
                      <div className="flex gap-4 items-center">
                        <div className="w-12 h-12 rounded-xl flex items-center justify-center shadow-sm bg-emerald-50 text-emerald-500">
                          <FileText className="h-6 w-6" />
                        </div>
                        <div>
                          <div className="flex items-center gap-2 mb-1">
                            <Link to={`/dashboard/cases/${page.caseId}/wiki/${page._id}` as any}>
                              <h4 className="font-bold text-navy text-lg hover:text-emerald-600 transition-colors">
                                {isArabic ? page.titleAr || page.title : page.title}
                              </h4>
                            </Link>
                            {page.isPinned && (
                              <Pin className="h-4 w-4 text-amber-500" />
                            )}
                            {page.isSealed && (
                              <Lock className="h-4 w-4 text-red-500" />
                            )}
                            {page.isConfidential && (
                              <Shield className="h-4 w-4 text-orange-500" />
                            )}
                          </div>
                          <div className="flex items-center gap-3 text-sm text-slate-500">
                            <Badge variant="outline" className={`rounded-md px-2 border-${pageStatusColors[page.status]}-200 text-${pageStatusColors[page.status]}-700 bg-${pageStatusColors[page.status]}-50`}>
                              {getStatusLabel(page.status)}
                            </Badge>
                            <span className="flex items-center gap-1">
                              <Clock className="h-3 w-3" />
                              {new Date(page.updatedAt).toLocaleDateString(isArabic ? 'ar-SA' : 'en-US')}
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>

                    {page.summary && (
                      <p className="text-slate-600 text-sm mb-4 line-clamp-2">
                        {isArabic ? page.summaryAr || page.summary : page.summary}
                      </p>
                    )}

                    <div className="flex items-center justify-between pt-4 border-t border-slate-200/50">
                      <div className="flex items-center gap-6">
                        <div className="text-center">
                          <div className="text-xs text-slate-400 mb-1">{isArabic ? 'النوع' : 'Type'}</div>
                          <div className="font-bold text-navy text-sm">
                            {getPageTypeLabel(page.pageType)}
                          </div>
                        </div>
                        <div className="text-center">
                          <div className="text-xs text-slate-400 mb-1">{isArabic ? 'الإصدار' : 'Version'}</div>
                          <div className="font-bold text-navy text-sm">
                            v{page.version}
                          </div>
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <Link to={`/dashboard/cases/${page.caseId}/wiki` as any}>
                          <Button variant="outline" className="border-slate-200 text-slate-600 hover:bg-slate-50 rounded-lg px-4">
                            <ArrowLeft className="me-2 h-4 w-4" />
                            {isArabic ? 'ويكي القضية' : 'Case Wiki'}
                          </Button>
                        </Link>
                        <Link to={`/dashboard/cases/${page.caseId}/wiki/${page._id}` as any}>
                          <Button className="bg-emerald-500 hover:bg-emerald-600 text-white rounded-lg px-6 shadow-lg shadow-emerald-500/20">
                            {t('wiki.viewPage')}
                          </Button>
                        </Link>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

          </div>
        </div>
      </Main>
    </>
  )
}
