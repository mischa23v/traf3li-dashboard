import { useState, useMemo } from 'react'
import { useTranslation } from 'react-i18next'
import { Link, useParams, useNavigate } from '@tanstack/react-router'
import {
  FileText,
  Plus,
  Search,
  Star,
  ChevronRight,
  ChevronDown,
  MoreHorizontal,
  Trash2,
  Copy,
  Archive,
  Pin,
  FolderOpen,
  Lightbulb,
  Scale,
  FileCheck,
  Clock,
  Users,
  MessageSquare,
  Loader2,
  BookOpen,
  Target,
  Gavel,
  ScrollText,
  FileSearch,
  Handshake,
  Calendar,
  History,
  FilePlus,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Badge } from '@/components/ui/badge'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Label } from '@/components/ui/label'
import { cn } from '@/lib/utils'
import {
  useCaseNotionPages,
  useCreateCaseNotionPage,
  useDeleteCaseNotionPage,
  useDuplicateCaseNotionPage,
  useArchiveCaseNotionPage,
  useToggleFavoritePage,
} from '@/hooks/useCaseNotion'
import type { CaseNotionPage } from '../data/schema'
import { pageTypeLabels } from '../data/schema'

interface NotionSidebarProps {
  caseId: string
  activePageId?: string
  onPageSelect?: (pageId: string) => void
}

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

export function NotionSidebar({ caseId, activePageId, onPageSelect }: NotionSidebarProps) {
  const { t, i18n } = useTranslation()
  const isArabic = i18n.language === 'ar'
  const navigate = useNavigate()

  const [searchQuery, setSearchQuery] = useState('')
  const [showCreateDialog, setShowCreateDialog] = useState(false)
  const [newPageTitle, setNewPageTitle] = useState('')
  const [newPageType, setNewPageType] = useState<keyof typeof pageTypeLabels>('general')
  const [expandedSections, setExpandedSections] = useState<Record<string, boolean>>({
    favorites: true,
    pinned: true,
    pages: true,
    archived: false,
  })

  // Fetch pages
  const { data: pagesData, isLoading } = useCaseNotionPages(caseId)
  const pages = pagesData?.pages || []

  // Mutations
  const createPage = useCreateCaseNotionPage()
  const deletePage = useDeleteCaseNotionPage()
  const duplicatePage = useDuplicateCaseNotionPage()
  const archivePage = useArchiveCaseNotionPage()
  const toggleFavorite = useToggleFavoritePage()

  // Filter and organize pages
  const { favoritePages, pinnedPages, regularPages, archivedPages } = useMemo(() => {
    const filtered = searchQuery
      ? pages.filter(
          (p) =>
            p.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
            p.titleAr?.toLowerCase().includes(searchQuery.toLowerCase())
        )
      : pages

    return {
      favoritePages: filtered.filter((p) => p.isFavorite && !p.archivedAt),
      pinnedPages: filtered.filter((p) => p.isPinned && !p.isFavorite && !p.archivedAt),
      regularPages: filtered.filter((p) => !p.isFavorite && !p.isPinned && !p.archivedAt),
      archivedPages: filtered.filter((p) => p.archivedAt),
    }
  }, [pages, searchQuery])

  const toggleSection = (section: string) => {
    setExpandedSections((prev) => ({
      ...prev,
      [section]: !prev[section],
    }))
  }

  const handleCreatePage = async () => {
    if (!newPageTitle.trim()) return

    try {
      const page = await createPage.mutateAsync({
        caseId,
        data: {
          caseId,
          title: newPageTitle,
          pageType: newPageType,
        },
      })
      setShowCreateDialog(false)
      setNewPageTitle('')
      setNewPageType('general')
      if (onPageSelect) {
        onPageSelect(page._id)
      }
    } catch (error) {
      console.error('Failed to create page:', error)
    }
  }

  const handleDeletePage = async (pageId: string) => {
    try {
      await deletePage.mutateAsync({ caseId, pageId })
    } catch (error) {
      console.error('Failed to delete page:', error)
    }
  }

  const handleDuplicatePage = async (pageId: string) => {
    try {
      await duplicatePage.mutateAsync({ caseId, pageId })
    } catch (error) {
      console.error('Failed to duplicate page:', error)
    }
  }

  const handleArchivePage = async (pageId: string) => {
    try {
      await archivePage.mutateAsync({ caseId, pageId })
    } catch (error) {
      console.error('Failed to archive page:', error)
    }
  }

  const handleToggleFavorite = async (pageId: string) => {
    try {
      await toggleFavorite.mutateAsync({ caseId, pageId })
    } catch (error) {
      console.error('Failed to toggle favorite:', error)
    }
  }

  const renderPageItem = (page: CaseNotionPage) => {
    const PageIcon = pageTypeIcons[page.pageType] || FileText
    const isActive = page._id === activePageId
    const pageTitle = isArabic ? page.titleAr || page.title : page.title

    return (
      <div
        key={page._id}
        className={cn(
          'group flex items-center gap-2 px-3 py-2 rounded-lg cursor-pointer transition-all',
          isActive
            ? 'bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-300'
            : 'hover:bg-slate-100 dark:hover:bg-slate-800'
        )}
        onClick={() => onPageSelect?.(page._id)}
      >
        {/* Icon */}
        <div
          className={cn(
            'shrink-0 w-6 h-6 rounded flex items-center justify-center',
            isActive ? 'text-emerald-600' : 'text-slate-500'
          )}
        >
          {page.icon?.emoji ? (
            <span className="text-base">{page.icon.emoji}</span>
          ) : (
            <PageIcon size={16} />
          )}
        </div>

        {/* Title */}
        <span
          className={cn(
            'flex-1 truncate text-sm font-medium',
            isActive ? 'text-emerald-700 dark:text-emerald-300' : 'text-slate-700 dark:text-slate-300'
          )}
        >
          {pageTitle}
        </span>

        {/* Favorite star */}
        {page.isFavorite && (
          <Star size={14} className="shrink-0 text-amber-500 fill-amber-500" />
        )}

        {/* Actions dropdown */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="ghost"
              size="icon"
              className={cn(
                'shrink-0 h-6 w-6 opacity-0 group-hover:opacity-100 transition-opacity',
                isActive && 'opacity-100'
              )}
              onClick={(e) => e.stopPropagation()}
            >
              <MoreHorizontal size={14} />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-48">
            <DropdownMenuItem onClick={() => handleToggleFavorite(page._id)}>
              <Star size={14} className="me-2" />
              {page.isFavorite
                ? t('caseNotion.removeFromFavorites')
                : t('caseNotion.addToFavorites')}
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => handleDuplicatePage(page._id)}>
              <Copy size={14} className="me-2" />
              {t('caseNotion.duplicate')}
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={() => handleArchivePage(page._id)}>
              <Archive size={14} className="me-2" />
              {t('caseNotion.archive')}
            </DropdownMenuItem>
            <DropdownMenuItem
              onClick={() => handleDeletePage(page._id)}
              className="text-red-600 focus:text-red-600"
            >
              <Trash2 size={14} className="me-2" />
              {t('common.delete')}
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    )
  }

  const renderSection = (
    title: string,
    sectionKey: string,
    sectionPages: CaseNotionPage[],
    icon?: React.ReactNode
  ) => {
    if (sectionPages.length === 0) return null

    const isExpanded = expandedSections[sectionKey]

    return (
      <div className="mb-4">
        <button
          onClick={() => toggleSection(sectionKey)}
          className="flex items-center gap-2 w-full px-3 py-1.5 text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider hover:text-slate-700 dark:hover:text-slate-300 transition-colors"
        >
          {isExpanded ? <ChevronDown size={12} /> : <ChevronRight size={12} />}
          {icon}
          <span>{title}</span>
          <Badge variant="secondary" className="ms-auto text-[10px] h-4 px-1.5">
            {sectionPages.length}
          </Badge>
        </button>
        {isExpanded && (
          <div className="mt-1 space-y-0.5">{sectionPages.map(renderPageItem)}</div>
        )}
      </div>
    )
  }

  return (
    <div className="flex flex-col h-full bg-white dark:bg-slate-900 border-e border-slate-200 dark:border-slate-700">
      {/* Header */}
      <div className="p-4 border-b border-slate-200 dark:border-slate-700">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center">
              <Lightbulb className="w-4 h-4 text-white" />
            </div>
            <div>
              <h2 className="font-bold text-slate-900 dark:text-white text-sm">
                {t('caseNotion.title')}
              </h2>
              <p className="text-[10px] text-slate-500">
                {t('caseNotion.subtitle')}
              </p>
            </div>
          </div>
          <Button
            size="icon"
            variant="ghost"
            className="h-8 w-8 text-emerald-600 hover:text-emerald-700 hover:bg-emerald-50"
            onClick={() => setShowCreateDialog(true)}
          >
            <Plus size={18} />
          </Button>
        </div>

        {/* Search */}
        <div className="relative">
          <Search className="absolute start-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
          <Input
            placeholder={t('caseNotion.searchPages')}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="ps-9 h-9 text-sm"
          />
        </div>
      </div>

      {/* Pages list */}
      <ScrollArea className="flex-1 p-2">
        {isLoading ? (
          <div className="flex items-center justify-center py-8">
            <Loader2 className="h-6 w-6 animate-spin text-emerald-600" />
          </div>
        ) : pages.length === 0 ? (
          <div className="text-center py-8 px-4">
            <div className="w-12 h-12 mx-auto mb-3 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center">
              <FileText className="w-6 h-6 text-slate-400" />
            </div>
            <h3 className="font-medium text-slate-700 dark:text-slate-300 mb-1">
              {t('caseNotion.noPages')}
            </h3>
            <p className="text-xs text-slate-500 mb-4">
              {t('caseNotion.noPagesDescription')}
            </p>
            <Button
              size="sm"
              onClick={() => setShowCreateDialog(true)}
              className="bg-emerald-600 hover:bg-emerald-700"
            >
              <Plus size={14} className="me-1" />
              {t('caseNotion.createFirstPage')}
            </Button>
          </div>
        ) : (
          <>
            {renderSection(
              t('caseNotion.favorites'),
              'favorites',
              favoritePages,
              <Star size={12} className="text-amber-500" />
            )}
            {renderSection(
              t('caseNotion.pinned'),
              'pinned',
              pinnedPages,
              <Pin size={12} className="text-blue-500" />
            )}
            {renderSection(t('caseNotion.allPages'), 'pages', regularPages)}
            {renderSection(
              t('caseNotion.archived'),
              'archived',
              archivedPages,
              <Archive size={12} className="text-slate-400" />
            )}
          </>
        )}
      </ScrollArea>

      {/* Quick actions */}
      <div className="p-3 border-t border-slate-200 dark:border-slate-700">
        <Button
          variant="outline"
          size="sm"
          className="w-full justify-start text-slate-600 hover:text-emerald-600 hover:border-emerald-300"
          onClick={() => setShowCreateDialog(true)}
        >
          <FilePlus size={14} className="me-2" />
          {t('caseNotion.newPage')}
        </Button>
      </div>

      {/* Create Page Dialog */}
      <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>{t('caseNotion.createPage')}</DialogTitle>
            <DialogDescription>
              {t('caseNotion.createPageDescription')}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="pageTitle">{t('caseNotion.pageTitle')}</Label>
              <Input
                id="pageTitle"
                placeholder={t('caseNotion.pageTitlePlaceholder')}
                value={newPageTitle}
                onChange={(e) => setNewPageTitle(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="pageType">{t('caseNotion.pageType')}</Label>
              <Select
                value={newPageType}
                onValueChange={(value) => setNewPageType(value as keyof typeof pageTypeLabels)}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {Object.entries(pageTypeLabels).map(([value, labels]) => {
                    const Icon = pageTypeIcons[value as keyof typeof pageTypeIcons] || FileText
                    return (
                      <SelectItem key={value} value={value}>
                        <div className="flex items-center gap-2">
                          <Icon size={14} />
                          <span>{isArabic ? labels.ar : labels.en}</span>
                        </div>
                      </SelectItem>
                    )
                  })}
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowCreateDialog(false)}>
              {t('common.cancel')}
            </Button>
            <Button
              onClick={handleCreatePage}
              disabled={!newPageTitle.trim() || createPage.isPending}
              className="bg-emerald-600 hover:bg-emerald-700"
            >
              {createPage.isPending ? (
                <Loader2 size={14} className="me-2 animate-spin" />
              ) : (
                <Plus size={14} className="me-2" />
              )}
              {t('caseNotion.create')}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}

export default NotionSidebar
