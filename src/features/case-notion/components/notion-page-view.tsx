import { useState, useMemo, useEffect, lazy, Suspense } from 'react'
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
  LayoutGrid,
  FileTextIcon,
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
import type { CaseNotionPage, Block } from '../data/schema'

// Lazy load heavy editor components - only loaded when viewing document/whiteboard
const BlockEditor = lazy(() => import('./block-editor').then(mod => ({ default: mod.BlockEditor })))
const WhiteboardView = lazy(() => import('./whiteboard').then(mod => ({ default: mod.WhiteboardView })))
import { pageTypeLabels } from '../data/schema'

type ViewMode = 'document' | 'whiteboard'

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
  const [viewMode, setViewMode] = useState<ViewMode>('document')

  // Fetch page data
  const { data: page, isLoading: pageLoading, isError: pageError, refetch: refetchPage, isFetching } = useCaseNotionPage(caseId, pageId)

  // Fetch blocks separately (in case they're not included in page response)
  const { data: blocksData, isLoading: blocksLoading } = useCaseNotionBlocks(caseId, pageId)
  const { data: activityData } = usePageActivity(caseId, pageId, 20)

  // Combine page blocks with separately fetched blocks
  const blocks = useMemo(() => {
    // Prefer blocks from page if they exist, otherwise use separately fetched blocks
    if (page?.blocks && page.blocks.length > 0) {
      return page.blocks
    }
    return blocksData || []
  }, [page?.blocks, blocksData])

  const isLoading = pageLoading || blocksLoading
  const isError = pageError

  // Mutations
  const updatePage = useUpdateCaseNotionPage()
  const toggleFavorite = useToggleFavoritePage()
  const duplicatePage = useDuplicateCaseNotionPage()
  const archivePage = useArchiveCaseNotionPage()
  const deletePage = useDeleteCaseNotionPage()
  const exportPdf = useExportPagePdf()
  const exportMarkdown = useExportPageMarkdown()

  // Set initial values when page loads
  useEffect(() => {
    if (page) {
      setTitleValue(isArabic ? page.titleAr || page.title : page.title)
      // Set view mode from page data or default to document
      if (page.viewMode) {
        setViewMode(page.viewMode)
      }
    }
  }, [page, isArabic])

  const handleTitleSave = async () => {
    if (!titleValue.trim() || !page) return

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
    try {
      await toggleFavorite.mutateAsync({ caseId, pageId })
    } catch (error) {
      console.error('Failed to toggle favorite:', error)
    }
  }

  const handleDuplicate = async () => {
    try {
      await duplicatePage.mutateAsync({ caseId, pageId })
    } catch (error) {
      console.error('Failed to duplicate:', error)
    }
  }

  const handleArchive = async () => {
    try {
      await archivePage.mutateAsync({ caseId, pageId })
      onBack?.()
    } catch (error) {
      console.error('Failed to archive:', error)
    }
  }

  const handleDelete = async () => {
    try {
      await deletePage.mutateAsync({ caseId, pageId })
      onBack?.()
    } catch (error) {
      console.error('Failed to delete:', error)
    }
  }

  const handleExportPdf = async () => {
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

  const handleViewModeToggle = async () => {
    const newMode = viewMode === 'document' ? 'whiteboard' : 'document'
    setViewMode(newMode)

    // Save the view mode preference to the server
    try {
      await updatePage.mutateAsync({
        caseId,
        pageId,
        data: {
          // @ts-ignore - viewMode field exists in schema
          viewMode: newMode,
        },
      })
    } catch (error) {
      console.error('Failed to save view mode:', error)
    }
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

  if (isError) {
    // Get error details from the query
    const queryError = (page as any)?.error || pageError
    const errorStatus = (queryError as any)?.status
    const is403 = errorStatus === 403

    return (
      <div className="flex-1 flex items-center justify-center p-8">
        <div className="text-center max-w-md">
          <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-red-50 flex items-center justify-center">
            <AlertCircle className="w-8 h-8 text-red-500" />
          </div>
          <h3 className="font-bold text-lg text-slate-700 mb-2">
            {is403
              ? t('caseNotion.accessDenied', 'غير مصرح بالوصول')
              : t('caseNotion.pageLoadError', 'تعذر تحميل الصفحة')}
          </h3>
          <p className="text-sm text-slate-500 mb-6">
            {is403
              ? t('caseNotion.accessDeniedDescription', 'ليس لديك صلاحية الوصول لهذه الصفحة. قد تكون محذوفة أو ليس لديك الإذن اللازم.')
              : t('caseNotion.pageLoadErrorDescription', 'حدث خطأ أثناء تحميل الصفحة. يرجى المحاولة مرة أخرى.')}
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
  const pageTypeLabel = t(`caseNotion.pageTypes.${page.pageType}`, page.pageType)

  return (
    <div className="flex-1 flex flex-col h-full bg-white dark:bg-slate-900">
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
                <Button variant="ghost" size="icon" className="h-8 w-8">
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
                <Button variant="ghost" size="icon" className="h-8 w-8">
                  <MessageSquare size={16} />
                </Button>
              </TooltipTrigger>
              <TooltipContent>{t('caseNotion.comments')}</TooltipContent>
            </Tooltip>
          </TooltipProvider>

          {/* View Mode Toggle */}
          <div className="flex items-center border border-slate-200 dark:border-slate-700 rounded-lg overflow-hidden">
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant={viewMode === 'document' ? 'secondary' : 'ghost'}
                    size="icon"
                    className="h-8 w-8 rounded-none"
                    onClick={() => viewMode !== 'document' && handleViewModeToggle()}
                  >
                    <FileTextIcon size={16} />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>{t('caseNotion.documentView', 'Document View')}</TooltipContent>
              </Tooltip>
            </TooltipProvider>
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant={viewMode === 'whiteboard' ? 'secondary' : 'ghost'}
                    size="icon"
                    className="h-8 w-8 rounded-none"
                    onClick={() => viewMode !== 'whiteboard' && handleViewModeToggle()}
                  >
                    <LayoutGrid size={16} />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>{t('caseNotion.whiteboardView', 'Whiteboard View')}</TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </div>

          {/* More actions */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="h-8 w-8">
                <MoreHorizontal size={16} />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56">
              <DropdownMenuItem onClick={handleDuplicate}>
                <Copy size={14} className="me-2" />
                {t('caseNotion.duplicate')}
              </DropdownMenuItem>
              <DropdownMenuItem>
                <Link2 size={14} className="me-2" />
                {t('caseNotion.copyLink')}
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={() => setShowExportDialog(true)}>
                <Download size={14} className="me-2" />
                {t('caseNotion.export')}
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={handleArchive}>
                <Archive size={14} className="me-2" />
                {t('caseNotion.archive')}
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={handleDelete}
                className="text-red-600 focus:text-red-600"
              >
                <Trash2 size={14} className="me-2" />
                {t('common.delete')}
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      {/* Page content - Lazy loaded editors */}
      <Suspense fallback={
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <Loader2 className="w-8 h-8 animate-spin mx-auto text-emerald-500" />
            <p className="mt-2 text-sm text-slate-500">{t('common.loading')}</p>
          </div>
        </div>
      }>
        {viewMode === 'whiteboard' ? (
          /* Whiteboard View */
          <WhiteboardView
            caseId={caseId}
            pageId={pageId}
          />
        ) : (
        /* Document View */
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
                {isEditingTitle ? (
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
                    className="text-3xl font-bold text-slate-900 dark:text-white rounded-lg px-2 py-1 -mx-2 transition-colors cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-800"
                    onClick={() => setIsEditingTitle(true)}
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
            />
          </div>
        </ScrollArea>
        )}
      </Suspense>

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
              disabled={exportPdf.isPending}
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
              disabled={exportMarkdown.isPending}
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
