import { useState, useMemo } from 'react'
import { Link, useParams, useNavigate } from '@tanstack/react-router'
import { useTranslation } from 'react-i18next'
import {
  FileText,
  ArrowLeft,
  Clock,
  AlertCircle,
  Edit3,
  Trash2,
  Loader2,
  History,
  Pin,
  Lock,
  Shield,
  Eye,
  MessageSquare,
  Link2,
  Search,
  Bell,
  Calendar,
  User,
  MoreVertical,
  Copy,
  Download,
  Share2
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { Textarea } from '@/components/ui/textarea'
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
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator
} from '@/components/ui/dropdown-menu'
import {
  useWikiPage,
  useWikiPageHistory,
  useWikiComments,
  useToggleWikiPagePin,
  useDeleteWikiPage,
  useSealWikiPage,
  useUnsealWikiPage,
  useCreateWikiComment
} from '@/hooks/useWiki'
import type { WikiPageStatus, WikiPageType } from '@/types/wiki'
import {
  pageTypeLabels,
  pageTypeLabelsAr,
  pageStatusLabels,
  pageStatusLabelsAr,
  pageStatusColors,
  confidentialityLabels,
  confidentialityLabelsAr,
  revisionChangeTypeLabels,
  revisionChangeTypeLabelsAr
} from '@/constants/wikiLabels'

export function WikiDetailsView() {
  const { t, i18n } = useTranslation()
  const isArabic = i18n.language === 'ar'
  const navigate = useNavigate()
  const { caseId, pageId } = useParams({ strict: false }) as { caseId: string; pageId: string }

  const [activeTab, setActiveTab] = useState('content')
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)
  const [commentText, setCommentText] = useState('')

  // Fetch data
  const { data: pageData, isLoading, isError, error, refetch } = useWikiPage(pageId)
  const { data: historyData } = useWikiPageHistory(pageId, { limit: 10 })
  const { data: comments } = useWikiComments(pageId)

  // Mutations
  const togglePinMutation = useToggleWikiPagePin()
  const deleteMutation = useDeleteWikiPage()
  const sealMutation = useSealWikiPage()
  const unsealMutation = useUnsealWikiPage()
  const createCommentMutation = useCreateWikiComment()

  const page = pageData?.page
  const backlinks = pageData?.backlinks || []
  const revisionStats = pageData?.revisionStats

  const handleTogglePin = () => {
    if (page) {
      togglePinMutation.mutate(page._id)
    }
  }

  const handleDelete = () => {
    if (page) {
      deleteMutation.mutate({ pageId: page._id }, {
        onSuccess: () => {
          navigate({ to: `/dashboard/cases/${caseId}/wiki` as any })
        }
      })
    }
  }

  const handleSeal = () => {
    if (page) {
      const reason = prompt(t('wiki.seal.reasonPlaceholder'))
      if (reason) {
        sealMutation.mutate({ pageId: page._id, reason })
      }
    }
  }

  const handleUnseal = () => {
    if (page) {
      unsealMutation.mutate(page._id)
    }
  }

  const handleCopyLink = () => {
    const url = window.location.href
    navigator.clipboard.writeText(url)
    // Could add toast notification here
  }

  const handleAddComment = () => {
    if (commentText.trim() && page) {
      createCommentMutation.mutate(
        { pageId: page._id, data: { content: commentText } },
        { onSuccess: () => setCommentText('') }
      )
    }
  }

  const getPageTypeLabel = (type: WikiPageType) =>
    isArabic ? pageTypeLabelsAr[type] : pageTypeLabels[type]

  const getStatusLabel = (status: WikiPageStatus) =>
    isArabic ? pageStatusLabelsAr[status] : pageStatusLabels[status]

  const getChangeTypeLabel = (type: string) =>
    isArabic ? revisionChangeTypeLabelsAr[type as keyof typeof revisionChangeTypeLabelsAr] : revisionChangeTypeLabels[type as keyof typeof revisionChangeTypeLabels]

  const topNav = [
    { title: isArabic ? 'القضايا' : 'Cases', href: '/dashboard/cases', isActive: false },
    { title: isArabic ? 'ويكي القضية' : 'Case Wiki', href: `/dashboard/cases/${caseId}/wiki` as any, isActive: false },
    { title: page?.title || (isArabic ? 'الصفحة' : 'Page'), href: `/dashboard/cases/${caseId}/wiki/${pageId}` as any, isActive: true },
  ]

  // Get author name
  const getAuthorName = () => {
    if (!page?.createdBy) return isArabic ? 'غير معروف' : 'Unknown'
    if (typeof page.createdBy === 'string') return page.createdBy
    return `${page.createdBy.firstName || ''} ${page.createdBy.lastName || ''}`.trim() || (isArabic ? 'غير معروف' : 'Unknown')
  }

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
            <input type="text" placeholder={t('wiki.searchPlaceholder')} className="h-9 w-64 rounded-xl border border-white/10 bg-white/5 pr-9 pl-4 text-sm text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500/50" />
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

        {/* Breadcrumb / Back Link */}
        <div className="max-w-[1600px] mx-auto mb-6">
          <Link to={`/dashboard/cases/${caseId}/wiki` as any} className="inline-flex items-center text-slate-500 hover:text-navy transition-colors">
            <ArrowLeft className="h-4 w-4 me-2" />
            {isArabic ? 'العودة إلى ويكي القضية' : 'Back to Case Wiki'}
          </Link>
        </div>

        {/* Loading State */}
        {isLoading && (
          <div className="max-w-[1600px] mx-auto space-y-6">
            <div className="bg-emerald-950 rounded-3xl p-8 shadow-xl">
              <Skeleton className="h-8 w-3/4 mb-4 bg-white/20" />
              <Skeleton className="h-6 w-1/2 mb-6 bg-white/20" />
              <div className="flex gap-4">
                <Skeleton className="h-10 w-32 bg-white/20" />
                <Skeleton className="h-10 w-32 bg-white/20" />
              </div>
            </div>
            <div className="grid grid-cols-12 gap-6">
              <div className="col-span-12 lg:col-span-3">
                <Skeleton className="h-64 w-full rounded-2xl" />
              </div>
              <div className="col-span-12 lg:col-span-9">
                <Skeleton className="h-96 w-full rounded-2xl" />
              </div>
            </div>
          </div>
        )}

        {/* Error State */}
        {isError && !isLoading && (
          <div className="max-w-[1600px] mx-auto">
            <Alert className="border-red-200 bg-red-50">
              <AlertCircle className="h-4 w-4 text-red-600" />
              <AlertDescription className="text-red-800">
                <div className="flex items-center justify-between">
                  <span>{isArabic ? 'حدث خطأ أثناء تحميل الصفحة' : 'Error loading page'}: {error?.message}</span>
                  <Button onClick={() => refetch()} variant="outline" size="sm" className="border-red-300 text-red-700 hover:bg-red-100">
                    {isArabic ? 'إعادة المحاولة' : 'Retry'}
                  </Button>
                </div>
              </AlertDescription>
            </Alert>
          </div>
        )}

        {/* Empty State */}
        {!isLoading && !isError && !page && (
          <div className="max-w-[1600px] mx-auto">
            <div className="text-center py-12 bg-white rounded-3xl">
              <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-slate-100 mb-4">
                <FileText className="h-8 w-8 text-slate-400" />
              </div>
              <h4 className="text-lg font-bold text-navy mb-2">{isArabic ? 'لم يتم العثور على الصفحة' : 'Page not found'}</h4>
              <p className="text-slate-500 mb-4">{isArabic ? 'الصفحة المطلوبة غير موجودة أو تم حذفها' : 'The requested page does not exist or has been deleted'}</p>
              <Button asChild className="bg-emerald-500 hover:bg-emerald-600 text-white rounded-xl">
                <Link to={`/dashboard/cases/${caseId}/wiki` as any}>
                  <ArrowLeft className="me-2 h-4 w-4" />
                  {isArabic ? 'العودة إلى الويكي' : 'Back to Wiki'}
                </Link>
              </Button>
            </div>
          </div>
        )}

        {/* Success State - Hero Content */}
        {!isLoading && !isError && page && (
          <>
            <div className="max-w-[1600px] mx-auto bg-emerald-950 rounded-3xl p-8 shadow-xl shadow-emerald-900/20 mb-8 relative overflow-hidden">
              {/* Background Decoration */}
              <div className="absolute top-0 left-0 w-full h-full overflow-hidden z-0 pointer-events-none">
                <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-emerald-500/10 rounded-full blur-[100px]"></div>
                <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-blue-500/10 rounded-full blur-[100px]"></div>
                <div className="absolute right-0 top-0 w-64 h-64 bg-gradient-to-br from-emerald-500/10 to-transparent rounded-full blur-3xl"></div>
              </div>

              <div className="relative z-10 flex flex-col lg:flex-row gap-8 items-start justify-between text-white">
                {/* Main Info */}
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-4 flex-wrap">
                    <div className="bg-white/10 p-2 rounded-xl backdrop-blur-md border border-white/10 text-emerald-400">
                      <FileText className="h-6 w-6" />
                    </div>
                    <span className="text-emerald-100 font-medium">{getPageTypeLabel(page.pageType)}</span>
                    <span className="text-white/20">•</span>
                    <Badge variant="outline" className={`border-${pageStatusColors[page.status]}-500/30 text-${pageStatusColors[page.status]}-300 bg-${pageStatusColors[page.status]}-500/10`}>
                      {getStatusLabel(page.status)}
                    </Badge>
                    {page.isPinned && (
                      <Badge variant="outline" className="border-amber-500/30 text-amber-300 bg-amber-500/10">
                        <Pin className="h-3 w-3 me-1" />
                        {isArabic ? 'مثبت' : 'Pinned'}
                      </Badge>
                    )}
                    {page.isSealed && (
                      <Badge variant="outline" className="border-red-500/30 text-red-300 bg-red-500/10">
                        <Lock className="h-3 w-3 me-1" />
                        {isArabic ? 'مختوم' : 'Sealed'}
                      </Badge>
                    )}
                    {page.isConfidential && (
                      <Badge variant="outline" className="border-orange-500/30 text-orange-300 bg-orange-500/10">
                        <Shield className="h-3 w-3 me-1" />
                        {isArabic ? confidentialityLabelsAr[page.confidentialityLevel] : confidentialityLabels[page.confidentialityLevel]}
                      </Badge>
                    )}
                  </div>
                  <h1 className="text-3xl font-bold mb-4 leading-tight text-white">
                    {isArabic ? page.titleAr || page.title : page.title}
                  </h1>
                  <div className="flex flex-wrap gap-6 text-sm text-slate-300">
                    <div className="flex items-center gap-2">
                      <User className="h-4 w-4 text-emerald-400" />
                      <span>{isArabic ? 'الكاتب:' : 'Author:'} <span className="text-white font-medium">{getAuthorName()}</span></span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Calendar className="h-4 w-4 text-emerald-400" />
                      <span>{isArabic ? 'التاريخ:' : 'Created:'} <span className="text-white font-medium">{new Date(page.createdAt).toLocaleDateString(isArabic ? 'ar-SA' : 'en-US')}</span></span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Clock className="h-4 w-4 text-emerald-400" />
                      <span>{isArabic ? 'آخر تحديث:' : 'Updated:'} <span className="text-white font-medium">{new Date(page.updatedAt).toLocaleDateString(isArabic ? 'ar-SA' : 'en-US')}</span></span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Eye className="h-4 w-4 text-emerald-400" />
                      <span>{isArabic ? 'المشاهدات:' : 'Views:'} <span className="text-white font-medium">{page.viewCount}</span></span>
                    </div>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex flex-col gap-4 min-w-[280px]">
                  <div className="flex gap-3">
                    {!page.isSealed && (
                      <Button asChild variant="outline" className="border-white/10 text-white hover:bg-white/10 hover:text-white backdrop-blur-sm">
                        <Link to={`/dashboard/cases/${caseId}/wiki/${pageId}/edit` as any}>
                          <Edit3 className="h-4 w-4 me-2" />
                          {t('wiki.editPage')}
                        </Link>
                      </Button>
                    )}
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="outline" className="border-white/10 text-white hover:bg-white/10 hover:text-white backdrop-blur-sm">
                          <MoreVertical className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={handleTogglePin}>
                          <Pin className="h-4 w-4 me-2" />
                          {page.isPinned ? t('wiki.actions.unpin') : t('wiki.actions.pin')}
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={handleCopyLink}>
                          <Copy className="h-4 w-4 me-2" />
                          {t('wiki.actions.copyLink')}
                        </DropdownMenuItem>
                        <DropdownMenuItem>
                          <Download className="h-4 w-4 me-2" />
                          {t('wiki.actions.exportPdf')}
                        </DropdownMenuItem>
                        <DropdownMenuItem>
                          <Share2 className="h-4 w-4 me-2" />
                          {isArabic ? 'مشاركة' : 'Share'}
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        {page.isSealed ? (
                          <DropdownMenuItem onClick={handleUnseal} disabled={unsealMutation.isPending}>
                            <Lock className="h-4 w-4 me-2" />
                            {t('wiki.actions.unseal')}
                          </DropdownMenuItem>
                        ) : (
                          <DropdownMenuItem onClick={handleSeal} disabled={sealMutation.isPending}>
                            <Lock className="h-4 w-4 me-2" />
                            {t('wiki.actions.seal')}
                          </DropdownMenuItem>
                        )}
                        <DropdownMenuSeparator />
                        <DropdownMenuItem className="text-red-600" onClick={() => setShowDeleteConfirm(true)}>
                          <Trash2 className="h-4 w-4 me-2" />
                          {t('wiki.deletePage')}
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                  {showDeleteConfirm && (
                    <div className="flex gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setShowDeleteConfirm(false)}
                        className="border-white/10 text-white hover:bg-white/10"
                      >
                        {isArabic ? 'إلغاء' : 'Cancel'}
                      </Button>
                      <Button
                        variant="destructive"
                        size="sm"
                        onClick={handleDelete}
                        disabled={deleteMutation.isPending}
                        className="flex-1 bg-red-500 hover:bg-red-600"
                      >
                        {deleteMutation.isPending ? (
                          <Loader2 className="h-4 w-4 animate-spin" />
                        ) : (
                          isArabic ? 'تأكيد الحذف' : 'Confirm Delete'
                        )}
                      </Button>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* MAIN CONTENT GRID */}
            <div className="max-w-[1600px] mx-auto pb-12">
              <div className="grid grid-cols-12 gap-6">

                {/* LEFT SIDEBAR */}
                <div className="col-span-12 lg:col-span-3 space-y-6">
                  {/* History Card */}
                  <Card className="border border-slate-100 shadow-sm rounded-2xl overflow-hidden">
                    <CardHeader className="bg-white border-b border-slate-50 pb-4">
                      <CardTitle className="text-lg font-bold text-navy flex items-center gap-2">
                        <History className="h-5 w-5 text-emerald-500" />
                        {t('wiki.history.title')}
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="p-0">
                      <ScrollArea className="h-[200px]">
                        <div className="relative p-6">
                          <div className="absolute top-6 bottom-6 right-[29px] w-0.5 bg-slate-100"></div>
                          <div className="space-y-6 relative">
                            {historyData?.history?.slice(0, 5).map((revision, i) => (
                              <div key={revision._id} className="flex gap-4 relative">
                                <div className="w-3 h-3 rounded-full mt-1.5 z-10 ring-4 ring-white bg-emerald-500"></div>
                                <div className="flex-1">
                                  <div className="text-sm font-bold text-navy">
                                    {getChangeTypeLabel(revision.changeType)} v{revision.version}
                                  </div>
                                  <div className="text-xs text-slate-500 mb-1">
                                    {new Date(revision.createdAt).toLocaleDateString(isArabic ? 'ar-SA' : 'en-US')}
                                  </div>
                                  {revision.changeSummary && (
                                    <div className="text-xs text-slate-400">{revision.changeSummary}</div>
                                  )}
                                </div>
                              </div>
                            ))}
                            {(!historyData?.history || historyData.history.length === 0) && (
                              <div className="text-center py-4 text-slate-500 text-sm">
                                {t('wiki.history.noHistory')}
                              </div>
                            )}
                          </div>
                        </div>
                      </ScrollArea>
                    </CardContent>
                  </Card>

                  {/* Backlinks Card */}
                  <Card className="border border-slate-100 shadow-sm rounded-2xl">
                    <CardHeader className="pb-3">
                      <CardTitle className="text-base font-bold text-navy flex items-center gap-2">
                        <Link2 className="h-5 w-5 text-emerald-500" />
                        {t('wiki.backlinks.title')}
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-2">
                      {backlinks.length > 0 ? (
                        backlinks.slice(0, 5).map((link) => (
                          <div key={link._id} className="flex items-center gap-3 p-3 bg-slate-50 rounded-xl border border-slate-100">
                            <div className="w-8 h-8 rounded-lg bg-white flex items-center justify-center border border-slate-200 text-emerald-600">
                              <FileText className="h-4 w-4" />
                            </div>
                            <div className="flex-1 min-w-0">
                              <div className="text-sm font-medium text-navy truncate">
                                {typeof link.sourcePageId === 'object' ? link.sourcePageId.title : 'Page'}
                              </div>
                            </div>
                          </div>
                        ))
                      ) : (
                        <div className="text-center py-4 text-slate-500 text-sm">
                          {t('wiki.backlinks.noBacklinks')}
                        </div>
                      )}
                    </CardContent>
                  </Card>

                  {/* Page Info Card */}
                  <Card className="border border-slate-100 shadow-sm rounded-2xl">
                    <CardHeader className="pb-3">
                      <CardTitle className="text-base font-bold text-navy">{isArabic ? 'معلومات الصفحة' : 'Page Info'}</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      <div className="flex justify-between text-sm">
                        <span className="text-slate-500">{isArabic ? 'الإصدار' : 'Version'}</span>
                        <span className="font-medium text-navy">v{page.version}</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-slate-500">{isArabic ? 'عدد الكلمات' : 'Word Count'}</span>
                        <span className="font-medium text-navy">{page.wordCount || 0}</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-slate-500">{isArabic ? 'وقت القراءة' : 'Reading Time'}</span>
                        <span className="font-medium text-navy">{page.readingTime || 1} {isArabic ? 'دقيقة' : 'min'}</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-slate-500">{isArabic ? 'التعليقات' : 'Comments'}</span>
                        <span className="font-medium text-navy">{page.commentCount}</span>
                      </div>
                    </CardContent>
                  </Card>
                </div>

                {/* CENTER CONTENT */}
                <div className="col-span-12 lg:col-span-9">
                  <Card className="border border-slate-100 shadow-sm rounded-2xl overflow-hidden min-h-[400px]">
                    <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
                      <div className="border-b border-slate-100 px-6 pt-4">
                        <TabsList className="bg-transparent h-auto p-0 gap-6">
                          <TabsTrigger value="content" className="data-[state=active]:bg-transparent data-[state=active]:shadow-none data-[state=active]:border-b-2 data-[state=active]:border-emerald-500 data-[state=active]:text-emerald-600 text-slate-500 font-medium text-base pb-4 rounded-none px-2">
                            {isArabic ? 'المحتوى' : 'Content'}
                          </TabsTrigger>
                          <TabsTrigger value="comments" className="data-[state=active]:bg-transparent data-[state=active]:shadow-none data-[state=active]:border-b-2 data-[state=active]:border-emerald-500 data-[state=active]:text-emerald-600 text-slate-500 font-medium text-base pb-4 rounded-none px-2">
                            <MessageSquare className="h-4 w-4 me-2" />
                            {t('wiki.comments.title')} ({page.commentCount})
                          </TabsTrigger>
                          <TabsTrigger value="history" className="data-[state=active]:bg-transparent data-[state=active]:shadow-none data-[state=active]:border-b-2 data-[state=active]:border-emerald-500 data-[state=active]:text-emerald-600 text-slate-500 font-medium text-base pb-4 rounded-none px-2">
                            <History className="h-4 w-4 me-2" />
                            {t('wiki.history.title')}
                          </TabsTrigger>
                        </TabsList>
                      </div>

                      <div className="p-6 bg-slate-50/50 min-h-[400px]">
                        <TabsContent value="content" className="mt-0 space-y-6">
                          <Card className="border-none shadow-sm bg-white rounded-2xl overflow-hidden">
                            <CardContent className="p-6">
                              {page.summary && (
                                <div className="mb-6 p-4 bg-emerald-50 rounded-xl border border-emerald-100">
                                  <h4 className="text-sm font-bold text-emerald-800 mb-2">{isArabic ? 'الملخص' : 'Summary'}</h4>
                                  <p className="text-emerald-700">{isArabic ? page.summaryAr || page.summary : page.summary}</p>
                                </div>
                              )}
                              <div className="prose prose-slate max-w-none">
                                {page.contentText ? (
                                  <p className="text-slate-600 leading-relaxed whitespace-pre-wrap">
                                    {page.contentText}
                                  </p>
                                ) : (
                                  <div className="text-center py-12 text-slate-400">
                                    {isArabic ? 'لا يوجد محتوى' : 'No content'}
                                  </div>
                                )}
                              </div>
                            </CardContent>
                          </Card>
                        </TabsContent>

                        <TabsContent value="comments" className="mt-0">
                          <Card className="border-none shadow-sm bg-white rounded-2xl overflow-hidden">
                            <CardContent className="p-6">
                              {/* Add Comment */}
                              <div className="flex gap-3 mb-6">
                                <Avatar className="w-10 h-10">
                                  <AvatarFallback className="bg-navy text-white">{isArabic ? 'أنا' : 'Me'}</AvatarFallback>
                                </Avatar>
                                <div className="flex-1 relative">
                                  <Textarea
                                    placeholder={t('wiki.comments.placeholder')}
                                    value={commentText}
                                    onChange={(e) => setCommentText(e.target.value)}
                                    className="min-h-[80px] rounded-xl resize-none bg-slate-50 border-slate-200 focus:border-emerald-500"
                                  />
                                  <Button
                                    size="sm"
                                    onClick={handleAddComment}
                                    disabled={!commentText.trim() || createCommentMutation.isPending}
                                    className="absolute bottom-2 left-2 bg-emerald-500 hover:bg-emerald-600 text-white rounded-lg"
                                  >
                                    {createCommentMutation.isPending ? (
                                      <Loader2 className="h-4 w-4 animate-spin" />
                                    ) : (
                                      t('wiki.comments.addComment')
                                    )}
                                  </Button>
                                </div>
                              </div>

                              {/* Comments List */}
                              <div className="space-y-4">
                                {comments && comments.length > 0 ? (
                                  comments.map((comment) => (
                                    <div key={comment._id} className="flex gap-3 p-4 bg-slate-50 rounded-xl">
                                      <Avatar className="w-10 h-10">
                                        <AvatarFallback className="bg-emerald-100 text-emerald-700">
                                          {typeof comment.userId === 'object' ? comment.userId.firstName?.charAt(0) : 'U'}
                                        </AvatarFallback>
                                      </Avatar>
                                      <div className="flex-1">
                                        <div className="flex items-center gap-2 mb-1">
                                          <span className="font-medium text-navy">
                                            {typeof comment.userId === 'object'
                                              ? `${comment.userId.firstName} ${comment.userId.lastName}`
                                              : isArabic ? 'مستخدم' : 'User'}
                                          </span>
                                          <span className="text-xs text-slate-400">
                                            {new Date(comment.createdAt).toLocaleDateString(isArabic ? 'ar-SA' : 'en-US')}
                                          </span>
                                          {comment.status === 'resolved' && (
                                            <Badge variant="outline" className="text-xs bg-emerald-50 text-emerald-700 border-emerald-200">
                                              {t('wiki.comments.resolved')}
                                            </Badge>
                                          )}
                                        </div>
                                        <p className="text-slate-600">{comment.content}</p>
                                      </div>
                                    </div>
                                  ))
                                ) : (
                                  <div className="text-center py-8 text-slate-400">
                                    {t('wiki.comments.noComments')}
                                  </div>
                                )}
                              </div>
                            </CardContent>
                          </Card>
                        </TabsContent>

                        <TabsContent value="history" className="mt-0">
                          <Card className="border-none shadow-sm bg-white rounded-2xl overflow-hidden">
                            <CardContent className="p-6">
                              {historyData?.history && historyData.history.length > 0 ? (
                                <div className="space-y-4">
                                  {historyData.history.map((revision) => (
                                    <div key={revision._id} className="flex items-start gap-4 p-4 bg-slate-50 rounded-xl border border-slate-100">
                                      <div className="w-10 h-10 rounded-xl bg-emerald-100 flex items-center justify-center text-emerald-600">
                                        <History className="h-5 w-5" />
                                      </div>
                                      <div className="flex-1">
                                        <div className="flex items-center gap-2 mb-1">
                                          <span className="font-bold text-navy">
                                            {t('wiki.history.version')} {revision.version}
                                          </span>
                                          <Badge variant="outline">
                                            {getChangeTypeLabel(revision.changeType)}
                                          </Badge>
                                        </div>
                                        <div className="text-sm text-slate-500 mb-2">
                                          {new Date(revision.createdAt).toLocaleString(isArabic ? 'ar-SA' : 'en-US')}
                                        </div>
                                        {revision.changeSummary && (
                                          <p className="text-sm text-slate-600">{revision.changeSummary}</p>
                                        )}
                                        <div className="flex gap-4 mt-2 text-xs text-slate-400">
                                          <span className="text-emerald-600">+{revision.additions} {t('wiki.history.additions')}</span>
                                          <span className="text-red-600">-{revision.deletions} {t('wiki.history.deletions')}</span>
                                        </div>
                                      </div>
                                      <Button variant="outline" size="sm" className="rounded-lg">
                                        {t('wiki.actions.restoreVersion')}
                                      </Button>
                                    </div>
                                  ))}
                                </div>
                              ) : (
                                <div className="text-center py-12 text-slate-400">
                                  {t('wiki.history.noHistory')}
                                </div>
                              )}
                            </CardContent>
                          </Card>
                        </TabsContent>
                      </div>
                    </Tabs>
                  </Card>
                </div>
              </div>
            </div>
          </>
        )}
      </Main>
    </>
  )
}
