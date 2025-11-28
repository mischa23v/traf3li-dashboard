import { useState, useMemo } from 'react'
import { Link, useParams } from '@tanstack/react-router'
import { useTranslation } from 'react-i18next'
import {
  FileText,
  Plus,
  Search,
  Bell,
  AlertCircle,
  ChevronLeft,
  MoreHorizontal,
  BookOpen,
  Clock,
  Pin,
  Lock,
  Shield,
  FolderOpen,
  Filter
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
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator
} from '@/components/ui/dropdown-menu'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '@/components/ui/select'
import { useWikiPages, useWikiCollections, useToggleWikiPagePin, useDeleteWikiPage } from '@/hooks/useWiki'
import { useCase } from '@/hooks/useCasesAndClients'
import type { WikiPageType, WikiPageStatus } from '@/types/wiki'
import {
  pageTypeLabels,
  pageTypeLabelsAr,
  pageTypeIcons,
  pageStatusLabels,
  pageStatusLabelsAr,
  pageStatusColors
} from '@/constants/wikiLabels'

export function WikiListView() {
  const { t, i18n } = useTranslation()
  const isArabic = i18n.language === 'ar'
  const { caseId } = useParams({ strict: false }) as { caseId: string }

  const [statusFilter, setStatusFilter] = useState<string>('all')
  const [typeFilter, setTypeFilter] = useState<string>('all')
  const [searchQuery, setSearchQuery] = useState('')

  // Fetch data
  const { data: caseData, isLoading: caseLoading } = useCase(caseId)
  const { data: pages, isLoading: pagesLoading, isError, error, refetch } = useWikiPages(caseId, {
    status: statusFilter !== 'all' ? statusFilter : undefined,
    pageType: typeFilter !== 'all' ? typeFilter : undefined,
    search: searchQuery || undefined
  })
  const { data: collections } = useWikiCollections(caseId)

  // Mutations
  const togglePinMutation = useToggleWikiPagePin()
  const deleteMutation = useDeleteWikiPage()

  const isLoading = caseLoading || pagesLoading

  // Filter and transform pages
  const filteredPages = useMemo(() => {
    if (!pages) return []
    return pages.filter(page => {
      if (searchQuery) {
        const search = searchQuery.toLowerCase()
        return page.title.toLowerCase().includes(search) ||
          page.titleAr?.toLowerCase().includes(search) ||
          page.contentText?.toLowerCase().includes(search)
      }
      return true
    })
  }, [pages, searchQuery])

  // Stats
  const stats = useMemo(() => {
    if (!pages) return { total: 0, collections: 0, pinned: 0, recent: 0 }
    return {
      total: pages.length,
      collections: collections?.length || 0,
      pinned: pages.filter(p => p.isPinned).length,
      recent: pages.filter(p => {
        const updated = new Date(p.updatedAt)
        const weekAgo = new Date()
        weekAgo.setDate(weekAgo.getDate() - 7)
        return updated > weekAgo
      }).length
    }
  }, [pages, collections])

  const handleTogglePin = (pageId: string) => {
    togglePinMutation.mutate(pageId)
  }

  const handleDelete = (pageId: string) => {
    if (confirm(t('wiki.deletePageConfirmation', { title: '' }))) {
      deleteMutation.mutate({ pageId })
    }
  }

  const getPageTypeLabel = (type: WikiPageType) =>
    isArabic ? pageTypeLabelsAr[type] : pageTypeLabels[type]

  const getStatusLabel = (status: WikiPageStatus) =>
    isArabic ? pageStatusLabelsAr[status] : pageStatusLabels[status]

  const topNav = [
    { title: isArabic ? 'القضايا' : 'Cases', href: '/dashboard/cases', isActive: false },
    { title: isArabic ? 'تفاصيل القضية' : 'Case Details', href: `/dashboard/cases/${caseId}` as any, isActive: false },
    { title: isArabic ? 'ويكي القضية' : 'Case Wiki', href: `/dashboard/cases/${caseId}/wiki` as any, isActive: true },
  ]

  const caseName = caseData?.title || caseData?.caseNumber || (isArabic ? 'القضية' : 'Case')

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

          {/* LEFT COLUMN (Widgets) */}
          <div className="space-y-6">
            {/* Stats Card */}
            <Card className="border border-slate-100 shadow-sm rounded-2xl overflow-hidden">
              <CardHeader className="bg-white border-b border-slate-50 pb-4">
                <CardTitle className="text-lg font-bold text-navy flex items-center gap-2">
                  <BookOpen className="h-5 w-5 text-emerald-500" />
                  {t('wiki.stats.totalPages')}
                </CardTitle>
              </CardHeader>
              <CardContent className="p-4 space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-slate-50 rounded-xl p-4 text-center">
                    <div className="text-2xl font-bold text-navy">{stats.total}</div>
                    <div className="text-xs text-slate-500">{t('wiki.stats.totalPages')}</div>
                  </div>
                  <div className="bg-slate-50 rounded-xl p-4 text-center">
                    <div className="text-2xl font-bold text-navy">{stats.collections}</div>
                    <div className="text-xs text-slate-500">{t('wiki.stats.collections')}</div>
                  </div>
                  <div className="bg-emerald-50 rounded-xl p-4 text-center">
                    <div className="text-2xl font-bold text-emerald-600">{stats.pinned}</div>
                    <div className="text-xs text-emerald-600">{t('wiki.stats.pinnedPages')}</div>
                  </div>
                  <div className="bg-blue-50 rounded-xl p-4 text-center">
                    <div className="text-2xl font-bold text-blue-600">{stats.recent}</div>
                    <div className="text-xs text-blue-600">{t('wiki.stats.recentUpdates')}</div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Collections Card */}
            <Card className="border border-slate-100 shadow-sm rounded-2xl overflow-hidden">
              <CardHeader className="bg-white border-b border-slate-50 pb-4">
                <CardTitle className="text-lg font-bold text-navy flex items-center gap-2">
                  <FolderOpen className="h-5 w-5 text-emerald-500" />
                  {t('wiki.stats.collections')}
                </CardTitle>
              </CardHeader>
              <CardContent className="p-4">
                {collections && collections.length > 0 ? (
                  <div className="space-y-2">
                    {collections.slice(0, 5).map((collection) => (
                      <div
                        key={collection._id}
                        className="flex items-center gap-3 p-3 rounded-xl bg-slate-50 hover:bg-slate-100 transition-colors cursor-pointer"
                      >
                        <div
                          className="w-8 h-8 rounded-lg flex items-center justify-center"
                          style={{ backgroundColor: collection.color + '20' }}
                        >
                          <FolderOpen className="h-4 w-4" style={{ color: collection.color }} />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="text-sm font-medium text-navy truncate">
                            {isArabic ? collection.nameAr || collection.name : collection.name}
                          </div>
                          <div className="text-xs text-slate-500">
                            {collection.pageCount} {isArabic ? 'صفحات' : 'pages'}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-6 text-slate-500 text-sm">
                    {t('wiki.noCollections')}
                  </div>
                )}
                <Button
                  asChild
                  variant="ghost"
                  className="w-full mt-4 text-emerald-600 hover:text-emerald-700 hover:bg-emerald-50"
                >
                  <Link to={`/dashboard/cases/${caseId}/wiki/collections` as any}>
                    {t('wiki.newCollection')}
                    <Plus className="h-4 w-4 ms-2" />
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
                  {t('wiki.title')} - {caseName}
                </h2>
                <p className="text-blue-200 text-lg mb-8 leading-relaxed">
                  {t('wiki.description')}
                </p>
                <div className="flex gap-3">
                  <Button asChild className="bg-emerald-500 hover:bg-emerald-600 text-white h-12 px-8 rounded-xl font-bold shadow-lg shadow-emerald-500/20 border-0">
                    <Link to={`/dashboard/cases/${caseId}/wiki/new` as any}>
                      <Plus className="me-2 h-5 w-5" />
                      {t('wiki.newPage')}
                    </Link>
                  </Button>
                  <Button className="bg-white text-slate-900 hover:bg-slate-100 h-12 px-8 rounded-xl font-bold shadow-lg border-0 transition-all hover:scale-105">
                    <FolderOpen className="me-2 h-5 w-5" />
                    {t('wiki.newCollection')}
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
                  {isArabic ? 'صفحات الويكي' : 'Wiki Pages'}
                </h3>
                <div className="flex flex-wrap gap-2">
                  <Select value={statusFilter} onValueChange={setStatusFilter}>
                    <SelectTrigger className="w-[140px] rounded-full border-slate-200">
                      <Filter className="h-4 w-4 me-2 text-slate-400" />
                      <SelectValue placeholder={isArabic ? 'الحالة' : 'Status'} />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">{isArabic ? 'الكل' : 'All'}</SelectItem>
                      <SelectItem value="draft">{getStatusLabel('draft')}</SelectItem>
                      <SelectItem value="published">{getStatusLabel('published')}</SelectItem>
                      <SelectItem value="archived">{getStatusLabel('archived')}</SelectItem>
                    </SelectContent>
                  </Select>
                  <Select value={typeFilter} onValueChange={setTypeFilter}>
                    <SelectTrigger className="w-[160px] rounded-full border-slate-200">
                      <SelectValue placeholder={isArabic ? 'النوع' : 'Type'} />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">{isArabic ? 'كل الأنواع' : 'All Types'}</SelectItem>
                      <SelectItem value="note">{getPageTypeLabel('note')}</SelectItem>
                      <SelectItem value="legal_research">{getPageTypeLabel('legal_research')}</SelectItem>
                      <SelectItem value="case_analysis">{getPageTypeLabel('case_analysis')}</SelectItem>
                      <SelectItem value="meeting_notes">{getPageTypeLabel('meeting_notes')}</SelectItem>
                      <SelectItem value="court_documents">{getPageTypeLabel('court_documents')}</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="p-4 space-y-4">
                {/* Loading State */}
                {isLoading && (
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
                {!isLoading && !isError && filteredPages.length === 0 && (
                  <div className="text-center py-12">
                    <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-emerald-50 mb-4">
                      <BookOpen className="h-8 w-8 text-emerald-500" />
                    </div>
                    <h4 className="text-lg font-bold text-navy mb-2">{t('wiki.noPages')}</h4>
                    <p className="text-slate-500 mb-4">{t('wiki.noPagesDescription')}</p>
                    <Button asChild className="bg-emerald-500 hover:bg-emerald-600 text-white rounded-xl">
                      <Link to={`/dashboard/cases/${caseId}/wiki/new` as any}>
                        <Plus className="me-2 h-4 w-4" />
                        {t('wiki.createPage')}
                      </Link>
                    </Button>
                  </div>
                )}

                {/* Success State - Page List */}
                {!isLoading && !isError && filteredPages.length > 0 && filteredPages.map((page) => (
                  <div key={page._id} className="bg-[#F8F9FA] rounded-2xl p-6 border border-slate-100 hover:border-emerald-200 transition-all group">
                    <div className="flex justify-between items-start mb-4">
                      <div className="flex gap-4 items-center">
                        <div className="w-12 h-12 rounded-xl flex items-center justify-center shadow-sm bg-emerald-50 text-emerald-500">
                          <FileText className="h-6 w-6" />
                        </div>
                        <div>
                          <div className="flex items-center gap-2 mb-1">
                            <Link to={`/dashboard/cases/${caseId}/wiki/${page._id}` as any}>
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
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon" className="text-slate-400 hover:text-navy">
                            <MoreHorizontal className="h-5 w-5" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem asChild>
                            <Link to={`/dashboard/cases/${caseId}/wiki/${page._id}` as any}>
                              {t('wiki.viewPage')}
                            </Link>
                          </DropdownMenuItem>
                          <DropdownMenuItem asChild>
                            <Link to={`/dashboard/cases/${caseId}/wiki/${page._id}/edit` as any}>
                              {t('wiki.editPage')}
                            </Link>
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => handleTogglePin(page._id)}>
                            {page.isPinned ? t('wiki.actions.unpin') : t('wiki.actions.pin')}
                          </DropdownMenuItem>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem
                            className="text-red-600"
                            onClick={() => handleDelete(page._id)}
                          >
                            {t('wiki.deletePage')}
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
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
                        {page.wordCount && (
                          <div className="text-center">
                            <div className="text-xs text-slate-400 mb-1">{isArabic ? 'الكلمات' : 'Words'}</div>
                            <div className="font-bold text-navy text-sm">
                              {page.wordCount}
                            </div>
                          </div>
                        )}
                      </div>
                      <div className="flex gap-2">
                        <Link to={`/dashboard/cases/${caseId}/wiki/${page._id}` as any}>
                          <Button variant="outline" className="border-slate-200 text-slate-600 hover:bg-slate-50 rounded-lg px-4">
                            {t('wiki.viewPage')}
                          </Button>
                        </Link>
                        <Link to={`/dashboard/cases/${caseId}/wiki/${page._id}/edit` as any}>
                          <Button className="bg-emerald-500 hover:bg-emerald-600 text-white rounded-lg px-6 shadow-lg shadow-emerald-500/20">
                            {t('wiki.editPage')}
                          </Button>
                        </Link>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {!isLoading && !isError && filteredPages.length > 0 && (
                <div className="p-4 pt-0 text-center">
                  <Button variant="ghost" className="text-emerald-600 hover:text-emerald-700 hover:bg-emerald-50 w-full rounded-xl py-6">
                    {isArabic ? 'عرض جميع الصفحات' : 'View All Pages'}
                    <ChevronLeft className="h-4 w-4 ms-2" />
                  </Button>
                </div>
              )}
            </div>

          </div>
        </div>
      </Main>
    </>
  )
}
