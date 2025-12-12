import { useState, useMemo, useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import {
  Star,
  MoreHorizontal,
  Share2,
  Download,
  History,
  MessageSquare,
  Copy,
  Archive,
  Trash2,
  ChevronRight,
  Loader2,
  FileText,
  Clock,
  Users,
  Edit3,
  Eye,
  Link2,
  BookOpen,
  Lightbulb,
  Target,
  Scale,
  FileSearch,
  Handshake,
  Calendar,
  ScrollText,
  FolderOpen,
  RefreshCw,
  AlertCircle,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Skeleton } from '@/components/ui/skeleton'
import { ScrollArea } from '@/components/ui/scroll-area'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { cn } from '@/lib/utils'
import {
  useCaseNotionPage,
  useCaseNotionBlocks,
  useUpdateCaseNotionPage,
  useToggleFavoritePage,
  useDuplicateCaseNotionPage,
  useArchiveCaseNotionPage,
  useDeleteCaseNotionPage,
  usePageActivity,
  useExportPagePdf,
  useExportPageMarkdown,
} from '@/hooks/useCaseNotion'
import { BlockEditor } from './block-editor'
import type { CaseNotionPage, Block } from '../data/schema'
import { pageTypeLabels } from '../data/schema'

// Page type icons
const pageTypeIcons = {
  general: FileText,
  strategy: Target,
  timeline: History,
  evidence: FileSearch,
  arguments: Scale,
  research: BookOpen,
  meeting_notes: Calendar,
  correspondence: MessageSquare,
  witnesses: Users,
  discovery: FolderOpen,
  pleadings: ScrollText,
  settlement: Handshake,
  brainstorm: Lightbulb,
}

// Demo page data for fallback when API fails
const DEMO_PAGE: CaseNotionPage = {
  _id: 'demo-page-001',
  caseId: 'demo-case-001',
  title: 'خطة القضية - نموذج تجريبي',
  titleAr: 'خطة القضية - نموذج تجريبي',
  pageType: 'strategy',
  icon: { type: 'emoji', emoji: '⚖️' },
  cover: { type: 'gradient', gradient: 'bg-gradient-to-r from-emerald-500 to-teal-600' },
  isFavorite: true,
  isPinned: false,
  createdAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
  updatedAt: new Date().toISOString(),
  lastEditedBy: 'مستخدم تجريبي',
  blocks: [],
  backlinks: [],
}

// Demo blocks for fallback
const DEMO_BLOCKS: Block[] = [
  {
    _id: 'demo-block-001',
    pageId: 'demo-page-001',
    type: 'heading_1',
    content: { text: 'استراتيجية القضية', level: 1 },
    order: 0,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    _id: 'demo-block-002',
    pageId: 'demo-page-001',
    type: 'paragraph',
    content: { text: 'هذه صفحة تجريبية لعرض إمكانيات نظام العصف الذهني للقضايا. يمكنك إنشاء صفحات متعددة لتنظيم أفكارك واستراتيجياتك القانونية.' },
    order: 1,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    _id: 'demo-block-003',
    pageId: 'demo-page-001',
    type: 'heading_2',
    content: { text: 'النقاط الرئيسية', level: 2 },
    order: 2,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    _id: 'demo-block-004',
    pageId: 'demo-page-001',
    type: 'bulleted_list',
    content: { text: 'تحليل الأدلة المتاحة' },
    order: 3,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    _id: 'demo-block-005',
    pageId: 'demo-page-001',
    type: 'bulleted_list',
    content: { text: 'مراجعة السوابق القضائية' },
    order: 4,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    _id: 'demo-block-006',
    pageId: 'demo-page-001',
    type: 'bulleted_list',
    content: { text: 'تحضير الحجج القانونية' },
    order: 5,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    _id: 'demo-block-007',
    pageId: 'demo-page-001',
    type: 'callout',
    content: { text: 'ملاحظة: هذه بيانات تجريبية. الوظائف الكاملة متاحة عند الاتصال بالخادم.', emoji: '💡' },
    order: 6,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
]

interface NotionPageViewProps {
  caseId: string
  pageId: string
  onBack?: () => void
}

export function NotionPageView({ caseId, pageId, onBack }: NotionPageViewProps) {
  const { t, i18n } = useTranslation()
  const isArabic = i18n.language === 'ar'

  const [isEditingTitle, setIsEditingTitle] = useState(false)
  const [titleValue, setTitleValue] = useState('')
  const [showActivityDialog, setShowActivityDialog] = useState(false)
  const [showExportDialog, setShowExportDialog] = useState(false)
  const [useDemoData, setUseDemoData] = useState(false)

  // Fetch page data
  const { data: fetchedPage, isLoading: pageLoading, isError: pageError, refetch: refetchPage, isFetching } = useCaseNotionPage(caseId, pageId)

  // Fetch blocks separately (in case they're not included in page response)
  const { data: blocksData, isLoading: blocksLoading } = useCaseNotionBlocks(caseId, pageId)
  const { data: activityData } = usePageActivity(caseId, pageId, 20)

  // Use demo data if API fails or demo mode is enabled
  const page = useMemo(() => {
    if (useDemoData || (pageError && !fetchedPage)) {
      return DEMO_PAGE
    }
    return fetchedPage
  }, [fetchedPage, pageError, useDemoData])

  // Combine page blocks with separately fetched blocks
  const blocks = useMemo(() => {
    if (useDemoData) {
      return DEMO_BLOCKS
    }
    // Prefer blocks from page if they exist, otherwise use separately fetched blocks
    if (page?.blocks && page.blocks.length > 0) {
      return page.blocks
    }
    return blocksData || []
  }, [page?.blocks, blocksData, useDemoData])

  const isLoading = (pageLoading || blocksLoading) && !useDemoData
  const isError = pageError && !useDemoData

  // Mutations
  const updatePage = useUpdateCaseNotionPage()
  const toggleFavorite = useToggleFavoritePage()
  const duplicatePage = useDuplicateCaseNotionPage()
  const archivePage = useArchiveCaseNotionPage()
  const deletePage = useDeleteCaseNotionPage()
  const exportPdf = useExportPagePdf()
  const exportMarkdown = useExportPageMarkdown()

  // Set initial title value when page loads
  useEffect(() => {
    if (page) {
      setTitleValue(isArabic ? page.titleAr || page.title : page.title)
    }
  }, [page, isArabic])

  const handleTitleSave = async () => {
    if (!titleValue.trim() || !page || useDemoData) return

    try {
      await updatePage.mutateAsync({
        caseId,
        pageId,
        data: { title: titleValue },
      })
      setIsEditingTitle(false)
    } catch (error) {
      console.error('Failed to update title:', error)
    }
  }

  const handleToggleFavorite = async () => {
    if (useDemoData) return
    try {
      await toggleFavorite.mutateAsync({ caseId, pageId })
    } catch (error) {
      console.error('Failed to toggle favorite:', error)
    }
  }

  const handleDuplicate = async () => {
    if (useDemoData) return
    try {
      await duplicatePage.mutateAsync({ caseId, pageId })
    } catch (error) {
      console.error('Failed to duplicate:', error)
    }
  }

  const handleArchive = async () => {
    if (useDemoData) return
    try {
      await archivePage.mutateAsync({ caseId, pageId })
      onBack?.()
    } catch (error) {
      console.error('Failed to archive:', error)
    }
  }

  const handleDelete = async () => {
    if (useDemoData) return
    try {
      await deletePage.mutateAsync({ caseId, pageId })
      onBack?.()
    } catch (error) {
      console.error('Failed to delete:', error)
    }
  }

  const handleExportPdf = async () => {
    if (useDemoData) return
    try {
      const blob = await exportPdf.mutateAsync({ caseId, pageId })
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `${page?.title || 'page'}.pdf`
      a.click()
      URL.revokeObjectURL(url)
    } catch (error) {
      console.error('Failed to export PDF:', error)
    }
  }

  const handleExportMarkdown = async () => {
    if (useDemoData) return
    try {
      const markdown = await exportMarkdown.mutateAsync({ caseId, pageId })
      const blob = new Blob([markdown], { type: 'text/markdown' })
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `${page?.title || 'page'}.md`
      a.click()
      URL.revokeObjectURL(url)
    } catch (error) {
      console.error('Failed to export Markdown:', error)
    }
  }

  const handleBlocksChange = (blocks: Block[]) => {
    // Blocks are saved individually in BlockEditor
  }

  if (isLoading) {
    return (
      <div className="flex-1 p-8">
        <Skeleton className="h-8 w-48 mb-4" />
        <Skeleton className="h-12 w-96 mb-8" />
        <div className="space-y-4">
          <Skeleton className="h-6 w-full" />
          <Skeleton className="h-6 w-3/4" />
          <Skeleton className="h-6 w-1/2" />
        </div>
      </div>
    )
  }

  if (isError && !useDemoData) {
    return (
      <div className="flex-1 flex items-center justify-center p-8">
        <div className="text-center max-w-md">
          <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-red-50 flex items-center justify-center">
            <AlertCircle className="w-8 h-8 text-red-500" />
          </div>
          <h3 className="font-bold text-lg text-slate-700 mb-2">
            {t('caseNotion.pageLoadError', 'تعذر تحميل الصفحة')}
          </h3>
          <p className="text-sm text-slate-500 mb-6">
            {t('caseNotion.pageLoadErrorDescription', 'حدث خطأ أثناء تحميل الصفحة. يرجى المحاولة مرة أخرى.')}
          </p>
          <div className="flex gap-3 justify-center flex-wrap">
            <Button
              onClick={() => refetchPage()}
              className="bg-emerald-600 hover:bg-emerald-700"
              disabled={isFetching}
            >
              {isFetching ? (
                <Loader2 size={14} className="me-2 animate-spin" />
              ) : (
                <RefreshCw size={14} className="me-2" />
              )}
              {t('common.retry', 'إعادة المحاولة')}
            </Button>
            <Button
              variant="outline"
              onClick={() => setUseDemoData(true)}
            >
              {t('caseNotion.viewDemo', 'عرض صفحة تجريبية')}
            </Button>
            {onBack && (
              <Button variant="outline" onClick={onBack}>
                {t('common.goBack', 'العودة')}
              </Button>
            )}
          </div>
        </div>
      </div>
    )
  }

  if (!page) {
    return (
      <div className="flex-1 flex items-center justify-center p-8">
        <div className="text-center">
          <FileText className="w-12 h-12 mx-auto mb-4 text-slate-300" />
          <h3 className="font-medium text-slate-700 mb-2">
            {t('caseNotion.pageNotFound')}
          </h3>
          <p className="text-sm text-slate-500 mb-4">
            {t('caseNotion.pageNotFoundDescription')}
          </p>
          {onBack && (
            <Button variant="outline" onClick={onBack}>
              {t('common.goBack')}
            </Button>
          )}
        </div>
      </div>
    )
  }

  const PageIcon = pageTypeIcons[page.pageType] || FileText
  const pageTypeLabel = isArabic
    ? pageTypeLabels[page.pageType]?.ar || page.pageType
    : pageTypeLabels[page.pageType]?.en || page.pageType

  return (
    <div className="flex-1 flex flex-col h-full bg-white dark:bg-slate-900">
      {/* Demo mode banner */}
      {useDemoData && (
        <div className="bg-amber-50 border-b border-amber-200 px-4 py-2 flex items-center justify-between">
          <span className="text-sm text-amber-700">
            {t('caseNotion.demoModeActive', 'أنت في وضع العرض التجريبي - البيانات غير حقيقية')}
          </span>
          <Button
            variant="ghost"
            size="sm"
            className="text-amber-700 hover:text-amber-900"
            onClick={() => {
              setUseDemoData(false)
              refetchPage()
            }}
          >
            <RefreshCw size={14} className="me-1" />
            {t('caseNotion.exitDemo', 'الخروج من الوضع التجريبي')}
          </Button>
        </div>
      )}

      {/* Cover image (if any) */}
      {page.cover && (
        <div
          className={cn(
            'h-48 w-full relative',
            page.cover.type === 'gradient' && page.cover.gradient,
            page.cover.type !== 'gradient' && 'bg-slate-100'
          )}
          style={
            page.cover.type === 'external' || page.cover.type === 'file'
              ? { backgroundImage: `url(${page.cover.url})`, backgroundSize: 'cover', backgroundPosition: 'center' }
              : undefined
          }
        >
          <div className="absolute inset-0 bg-gradient-to-b from-transparent to-white/50 dark:to-slate-900/50" />
        </div>
      )}

      {/* Header toolbar */}
      <div className="flex items-center justify-between px-8 py-4 border-b border-slate-200 dark:border-slate-700">
        <div className="flex items-center gap-3">
          {/* Back button */}
          {onBack && (
            <Button variant="ghost" size="sm" onClick={onBack} className="text-slate-500">
              <ChevronRight size={16} className="rotate-180 rtl:rotate-0" />
              {t('common.back')}
            </Button>
          )}

          {/* Breadcrumb */}
          <div className="flex items-center gap-1 text-sm text-slate-500">
            <span>{t('caseNotion.title')}</span>
            <ChevronRight size={14} className="rtl:rotate-180" />
            <Badge variant="outline" className="font-normal">
              {pageTypeLabel}
            </Badge>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {/* Favorite button */}
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  className={cn(
                    'h-8 w-8',
                    page.isFavorite && 'text-amber-500'
                  )}
                  onClick={handleToggleFavorite}
                  disabled={useDemoData}
                >
                  <Star
                    size={16}
                    className={cn(page.isFavorite && 'fill-amber-500')}
                  />
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                {page.isFavorite
                  ? t('caseNotion.removeFromFavorites')
                  : t('caseNotion.addToFavorites')}
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>

          {/* Share button */}
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button variant="ghost" size="icon" className="h-8 w-8" disabled={useDemoData}>
                  <Share2 size={16} />
                </Button>
              </TooltipTrigger>
              <TooltipContent>{t('common.share')}</TooltipContent>
            </Tooltip>
          </TooltipProvider>

          {/* Activity/History */}
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8"
                  onClick={() => setShowActivityDialog(true)}
                  disabled={useDemoData}
                >
                  <History size={16} />
                </Button>
              </TooltipTrigger>
              <TooltipContent>{t('caseNotion.activity')}</TooltipContent>
            </Tooltip>
          </TooltipProvider>

          {/* Comments */}
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button variant="ghost" size="icon" className="h-8 w-8" disabled={useDemoData}>
                  <MessageSquare size={16} />
                </Button>
              </TooltipTrigger>
              <TooltipContent>{t('caseNotion.comments')}</TooltipContent>
            </Tooltip>
          </TooltipProvider>

          {/* More actions */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="h-8 w-8">
                <MoreHorizontal size={16} />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56">
              <DropdownMenuItem onClick={handleDuplicate} disabled={useDemoData}>
                <Copy size={14} className="me-2" />
                {t('caseNotion.duplicate')}
              </DropdownMenuItem>
              <DropdownMenuItem disabled={useDemoData}>
                <Link2 size={14} className="me-2" />
                {t('caseNotion.copyLink')}
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={() => setShowExportDialog(true)} disabled={useDemoData}>
                <Download size={14} className="me-2" />
                {t('caseNotion.export')}
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={handleArchive} disabled={useDemoData}>
                <Archive size={14} className="me-2" />
                {t('caseNotion.archive')}
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={handleDelete}
                className="text-red-600 focus:text-red-600"
                disabled={useDemoData}
              >
                <Trash2 size={14} className="me-2" />
                {t('common.delete')}
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      {/* Page content */}
      <ScrollArea className="flex-1">
        <div className="max-w-4xl mx-auto px-8 py-12">
          {/* Page icon and title */}
          <div className="flex items-start gap-4 mb-8">
            {/* Icon */}
            <div
              className={cn(
                'shrink-0 w-16 h-16 rounded-xl flex items-center justify-center text-3xl',
                !page.icon && 'bg-slate-100 dark:bg-slate-800'
              )}
            >
              {page.icon?.emoji ? (
                page.icon.emoji
              ) : (
                <PageIcon className="w-8 h-8 text-slate-400" />
              )}
            </div>

            {/* Title */}
            <div className="flex-1 min-w-0">
              {isEditingTitle && !useDemoData ? (
                <div className="flex items-center gap-2">
                  <Input
                    value={titleValue}
                    onChange={(e) => setTitleValue(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') handleTitleSave()
                      if (e.key === 'Escape') setIsEditingTitle(false)
                    }}
                    className="text-3xl font-bold h-auto py-1 border-0 border-b-2 border-emerald-500 rounded-none focus:ring-0"
                    autoFocus
                  />
                  <Button
                    size="sm"
                    onClick={handleTitleSave}
                    disabled={updatePage.isPending}
                  >
                    {updatePage.isPending ? (
                      <Loader2 size={14} className="animate-spin" />
                    ) : (
                      t('common.save')
                    )}
                  </Button>
                </div>
              ) : (
                <h1
                  className={cn(
                    "text-3xl font-bold text-slate-900 dark:text-white rounded-lg px-2 py-1 -mx-2 transition-colors",
                    !useDemoData && "cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-800"
                  )}
                  onClick={() => !useDemoData && setIsEditingTitle(true)}
                >
                  {isArabic ? page.titleAr || page.title : page.title}
                </h1>
              )}

              {/* Page metadata */}
              <div className="flex items-center gap-4 mt-2 text-sm text-slate-500">
                <div className="flex items-center gap-1">
                  <Clock size={14} />
                  <span>
                    {new Date(page.updatedAt).toLocaleDateString(
                      isArabic ? 'ar-SA' : 'en-US',
                      { year: 'numeric', month: 'short', day: 'numeric' }
                    )}
                  </span>
                </div>
                {page.lastEditedBy && (
                  <div className="flex items-center gap-1">
                    <Edit3 size={14} />
                    <span>{t('caseNotion.lastEditedBy', { name: page.lastEditedBy })}</span>
                  </div>
                )}
                {page.backlinks && page.backlinks.length > 0 && (
                  <div className="flex items-center gap-1">
                    <Link2 size={14} />
                    <span>
                      {t('caseNotion.backlinks', { count: page.backlinks.length })}
                    </span>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Block editor */}
          <BlockEditor
            caseId={caseId}
            pageId={pageId}
            blocks={blocks}
            onBlocksChange={handleBlocksChange}
            readOnly={useDemoData}
          />
        </div>
      </ScrollArea>

      {/* Activity Dialog */}
      <Dialog open={showActivityDialog} onOpenChange={setShowActivityDialog}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>{t('caseNotion.activityHistory')}</DialogTitle>
            <DialogDescription>
              {t('caseNotion.activityHistoryDescription')}
            </DialogDescription>
          </DialogHeader>
          <ScrollArea className="max-h-[400px]">
            {activityData && activityData.length > 0 ? (
              <div className="space-y-4">
                {activityData.map((activity) => (
                  <div
                    key={activity._id}
                    className="flex items-start gap-3 p-3 rounded-lg bg-slate-50 dark:bg-slate-800"
                  >
                    <div className="w-8 h-8 rounded-full bg-slate-200 dark:bg-slate-700 flex items-center justify-center">
                      <Users size={14} className="text-slate-500" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm">
                        <span className="font-medium">{activity.userName}</span>{' '}
                        <span className="text-slate-500">
                          {t(`caseNotion.activity.${activity.action}`)}
                        </span>
                      </p>
                      <p className="text-xs text-slate-400 mt-0.5">
                        {new Date(activity.createdAt).toLocaleString(
                          isArabic ? 'ar-SA' : 'en-US'
                        )}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-center text-slate-500 py-8">
                {t('caseNotion.noActivity')}
              </p>
            )}
          </ScrollArea>
        </DialogContent>
      </Dialog>

      {/* Export Dialog */}
      <Dialog open={showExportDialog} onOpenChange={setShowExportDialog}>
        <DialogContent className="sm:max-w-sm">
          <DialogHeader>
            <DialogTitle>{t('caseNotion.exportPage')}</DialogTitle>
            <DialogDescription>
              {t('caseNotion.exportPageDescription')}
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-3 py-4">
            <Button
              variant="outline"
              className="justify-start h-12"
              onClick={handleExportPdf}
              disabled={exportPdf.isPending || useDemoData}
            >
              {exportPdf.isPending ? (
                <Loader2 size={16} className="me-3 animate-spin" />
              ) : (
                <FileText size={16} className="me-3 text-red-500" />
              )}
              <div className="text-start">
                <div className="font-medium">PDF</div>
                <div className="text-xs text-slate-500">
                  {t('caseNotion.exportPdfDescription')}
                </div>
              </div>
            </Button>
            <Button
              variant="outline"
              className="justify-start h-12"
              onClick={handleExportMarkdown}
              disabled={exportMarkdown.isPending || useDemoData}
            >
              {exportMarkdown.isPending ? (
                <Loader2 size={16} className="me-3 animate-spin" />
              ) : (
                <FileText size={16} className="me-3 text-slate-500" />
              )}
              <div className="text-start">
                <div className="font-medium">Markdown</div>
                <div className="text-xs text-slate-500">
                  {t('caseNotion.exportMarkdownDescription')}
                </div>
              </div>
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}

export default NotionPageView
