import { useState, useEffect, lazy, Suspense } from 'react'
import { Link, useParams, useNavigate, useSearch } from '@tanstack/react-router'
import { useTranslation } from 'react-i18next'
import {
  ArrowRight,
  Save,
  FileText,
  BookOpen,
  AlertCircle,
  Loader2,
  Plus,
  X,
  ChevronDown,
  ChevronUp,
  Tag,
  FolderOpen,
  Shield,
  Eye,
  Search,
  Bell,
  Calendar,
  Palette
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Checkbox } from '@/components/ui/checkbox'
import { Badge } from '@/components/ui/badge'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '@/components/ui/select'
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger
} from '@/components/ui/collapsible'
import { Header } from '@/components/layout/header'
import { TopNav } from '@/components/layout/top-nav'
import { DynamicIsland } from '@/components/dynamic-island'
import { Main } from '@/components/layout/main'
import { LanguageSwitcher } from '@/components/language-switcher'
import { ThemeSwitch } from '@/components/theme-switch'
import { ConfigDrawer } from '@/components/config-drawer'
import { ProfileDropdown } from '@/components/profile-dropdown'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Skeleton } from '@/components/ui/skeleton'
import { ProductivityHero } from '@/components/productivity-hero'

// Lazy load the rich text editor to reduce initial bundle size
const RichTextEditor = lazy(() => import('@/components/rich-text-editor'))

import {
  useWikiPage,
  useWikiCollections,
  useWikiPages,
  useCreateWikiPage,
  useUpdateWikiPage
} from '@/hooks/useWiki'
import { useCase } from '@/hooks/useCasesAndClients'
import type {
  WikiPageType,
  WikiConfidentialityLevel,
  WikiVisibility,
  CreateWikiPageInput
} from '@/types/wiki'
import {
  pageTypeLabels,
  pageTypeLabelsAr,
  pageTypeIcons,
  confidentialityLabels,
  confidentialityLabelsAr,
  visibilityLabels,
  visibilityLabelsAr
} from '@/constants/wikiLabels'

const PAGE_TYPE_OPTIONS: WikiPageType[] = [
  'note',
  'general',
  'pleading',
  'motion',
  'brief',
  'petition',
  'timeline',
  'evidence_log',
  'witness_notes',
  'interview_notes',
  'deposition',
  'legal_research',
  'precedent',
  'case_analysis',
  'strategy',
  'correspondence',
  'client_memo',
  'internal_memo',
  'meeting_notes',
  'court_documents',
  'hearing_notes',
  'judgment_analysis'
]

const CONFIDENTIALITY_OPTIONS: WikiConfidentialityLevel[] = [
  'public',
  'internal',
  'confidential',
  'highly_confidential'
]

const VISIBILITY_OPTIONS: WikiVisibility[] = ['private', 'case_team', 'firm_wide']

export function WikiCreateView() {
  const { t, i18n } = useTranslation()
  const isArabic = i18n.language === 'ar'
  const navigate = useNavigate()
  const { caseId, pageId } = useParams({ strict: false }) as { caseId: string; pageId?: string }

  const isEditMode = !!pageId

  // Fetch data
  const { data: caseData } = useCase(caseId)
  const { data: existingPageData, isLoading: pageLoading } = useWikiPage(pageId || '')
  const { data: collections } = useWikiCollections(caseId)
  const { data: pages } = useWikiPages(caseId)

  // Mutations
  const createMutation = useCreateWikiPage()
  const updateMutation = useUpdateWikiPage()

  // Form state
  const [formData, setFormData] = useState<CreateWikiPageInput>({
    title: '',
    titleAr: '',
    content: null,
    contentText: '',
    summary: '',
    pageType: 'note',
    collectionId: '',
    parentPageId: '',
    tags: [],
    isTemplate: false,
    visibility: 'case_team',
    isConfidential: false,
    // Calendar integration
    showOnCalendar: false,
    calendarDate: '',
    calendarEndDate: '',
    calendarColor: '#8b5cf6'
  })

  const [showCalendarSettings, setShowCalendarSettings] = useState(false)

  const [confidentialityLevel, setConfidentialityLevel] = useState<WikiConfidentialityLevel>('internal')
  const [tagInput, setTagInput] = useState('')
  const [showAdvanced, setShowAdvanced] = useState(false)
  const [showSecurity, setShowSecurity] = useState(false)

  // Load existing page data for edit mode
  useEffect(() => {
    if (isEditMode && existingPageData?.page) {
      const page = existingPageData.page
      setFormData({
        title: page.title,
        titleAr: page.titleAr || '',
        content: page.content,
        contentText: page.contentText || '',
        summary: page.summary || '',
        pageType: page.pageType,
        collectionId: typeof page.collectionId === 'string' ? page.collectionId : page.collectionId?._id || '',
        parentPageId: typeof page.parentPageId === 'string' ? page.parentPageId : page.parentPageId?._id || '',
        tags: page.tags || [],
        isTemplate: page.isTemplate,
        visibility: page.visibility,
        isConfidential: page.isConfidential,
        // Calendar fields
        showOnCalendar: page.showOnCalendar || false,
        calendarDate: page.calendarDate || '',
        calendarEndDate: page.calendarEndDate || '',
        calendarColor: page.calendarColor || '#8b5cf6'
      })
      setConfidentialityLevel(page.confidentialityLevel)
      if (page.showOnCalendar) {
        setShowCalendarSettings(true)
      }
    }
  }, [isEditMode, existingPageData])

  const handleChange = (field: keyof CreateWikiPageInput, value: unknown) => {
    setFormData(prev => ({ ...prev, [field]: value }))
  }

  const addTag = () => {
    if (tagInput.trim() && !formData.tags?.includes(tagInput.trim())) {
      handleChange('tags', [...(formData.tags || []), tagInput.trim()])
      setTagInput('')
    }
  }

  const removeTag = (tag: string) => {
    handleChange('tags', (formData.tags || []).filter(t => t !== tag))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    const data: CreateWikiPageInput = {
      ...formData,
      collectionId: formData.collectionId || undefined,
      parentPageId: formData.parentPageId || undefined
    }

    if (isEditMode && pageId) {
      updateMutation.mutate(
        { pageId, data },
        {
          onSuccess: () => {
            navigate({ to: `/dashboard/cases/${caseId}/wiki/${pageId}` as any })
          }
        }
      )
    } else {
      createMutation.mutate(
        { caseId, data },
        {
          onSuccess: (newPage) => {
            navigate({ to: `/dashboard/cases/${caseId}/wiki/${newPage._id}` as any })
          }
        }
      )
    }
  }

  const isPending = createMutation.isPending || updateMutation.isPending

  const getPageTypeLabel = (type: WikiPageType) =>
    isArabic ? pageTypeLabelsAr[type] : pageTypeLabels[type]

  const getConfidentialityLabel = (level: WikiConfidentialityLevel) =>
    isArabic ? confidentialityLabelsAr[level] : confidentialityLabels[level]

  const getVisibilityLabel = (visibility: WikiVisibility) =>
    isArabic ? visibilityLabelsAr[visibility] : visibilityLabels[visibility]

  const caseName = caseData?.title || caseData?.caseNumber || (isArabic ? 'القضية' : 'Case')

  const topNav = [
    { title: isArabic ? 'القضايا' : 'Cases', href: '/dashboard/cases', isActive: false },
    { title: isArabic ? 'ويكي القضية' : 'Case Wiki', href: `/dashboard/cases/${caseId}/wiki` as any, isActive: false },
    { title: isEditMode ? t('wiki.editPage') : t('wiki.createPage'), href: '#', isActive: true },
  ]

  if (isEditMode && pageLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin text-emerald-500" />
      </div>
    )
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
          </Button>
          <LanguageSwitcher className="text-slate-300 hover:bg-white/10 hover:text-white" />
          <ThemeSwitch className="text-slate-300 hover:bg-white/10 hover:text-white" />
          <ConfigDrawer className="text-slate-300 hover:bg-white/10 hover:text-white" />
          <ProfileDropdown className="text-slate-300 hover:bg-white/10 hover:text-white" />
        </div>
        <div className="absolute bottom-0 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-emerald-500/50 to-transparent"></div>
      </Header>

      <Main fluid={true} className="bg-[#f8f9fa] flex-1 w-full p-6 lg:p-8 space-y-8 rounded-tr-3xl shadow-inner border-r border-white/5 overflow-hidden font-['IBM_Plex_Sans_Arabic']">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 max-w-7xl mx-auto">

          {/* Sidebar Widgets */}
          <div className="space-y-6">
            {/* Collections Card */}
            <Card className="border border-slate-100 shadow-sm rounded-2xl overflow-hidden">
              <CardHeader className="bg-white border-b border-slate-50 pb-4">
                <CardTitle className="text-lg font-bold text-navy flex items-center gap-2">
                  <FolderOpen className="h-5 w-5 text-emerald-500" />
                  {t('wiki.stats.collections')}
                </CardTitle>
              </CardHeader>
              <CardContent className="p-4">
                <ScrollArea className="h-[200px]">
                  <div className="space-y-2">
                    {collections && collections.length > 0 ? (
                      collections.map((collection) => (
                        <div
                          key={collection._id}
                          onClick={() => handleChange('collectionId', collection._id)}
                          className={`flex items-center gap-3 p-3 rounded-xl cursor-pointer transition-colors ${formData.collectionId === collection._id
                            ? 'bg-emerald-50 border border-emerald-200'
                            : 'bg-slate-50 hover:bg-slate-100'
                            }`}
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
                          </div>
                        </div>
                      ))
                    ) : (
                      <div className="text-center py-6 text-slate-500 text-sm">
                        {t('wiki.noCollections')}
                      </div>
                    )}
                  </div>
                </ScrollArea>
              </CardContent>
            </Card>

            {/* Quick Tips Card */}
            <Card className="border border-slate-100 shadow-sm rounded-2xl">
              <CardHeader className="pb-3">
                <CardTitle className="text-base font-bold text-navy">{isArabic ? 'نصائح' : 'Tips'}</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3 text-sm text-slate-600">
                <p>{isArabic ? '• استخدم عناوين واضحة ومحددة' : '• Use clear and specific titles'}</p>
                <p>{isArabic ? '• أضف ملخصاً للصفحة لتسهيل البحث' : '• Add a summary for easier searching'}</p>
                <p>{isArabic ? '• استخدم الوسوم لتصنيف المحتوى' : '• Use tags to categorize content'}</p>
                <p>{isArabic ? '• اختر مستوى السرية المناسب' : '• Choose appropriate confidentiality'}</p>
              </CardContent>
            </Card>
          </div>

          {/* Main Form Content */}
          <div className="lg:col-span-2 space-y-8">

            {/* HERO CARD */}
            <ProductivityHero badge="الموسوعة القانونية" title={isEditMode ? t('wiki.editPage') : t('wiki.createPage')} type="wiki" hideButtons={true} />

            {/* Form Card */}
            <div className="bg-white rounded-3xl p-8 shadow-sm border border-slate-100">
              <form onSubmit={handleSubmit} className="space-y-8">
                {/* Basic Info */}
                <div className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <label className="text-sm font-medium text-slate-700 flex items-center gap-2">
                        <FileText className="w-4 h-4 text-emerald-500" />
                        {t('wiki.form.title')} <span className="text-red-500">*</span>
                      </label>
                      <Input
                        placeholder={t('wiki.form.titlePlaceholder')}
                        className="rounded-xl border-slate-200 focus:border-emerald-500 focus:ring-emerald-500"
                        required
                        value={formData.title}
                        onChange={(e) => handleChange('title', e.target.value)}
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-medium text-slate-700 flex items-center gap-2">
                        <FileText className="w-4 h-4 text-emerald-500" />
                        {t('wiki.form.titleAr')}
                      </label>
                      <Input
                        placeholder={t('wiki.form.titleArPlaceholder')}
                        className="rounded-xl border-slate-200 focus:border-emerald-500 focus:ring-emerald-500"
                        dir="rtl"
                        value={formData.titleAr}
                        onChange={(e) => handleChange('titleAr', e.target.value)}
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <label className="text-sm font-medium text-slate-700 flex items-center gap-2">
                        <AlertCircle className="w-4 h-4 text-emerald-500" />
                        {t('wiki.form.pageType')} <span className="text-red-500">*</span>
                      </label>
                      <Select value={formData.pageType} onValueChange={(value) => handleChange('pageType', value)}>
                        <SelectTrigger className="rounded-xl border-slate-200 focus:ring-emerald-500">
                          <SelectValue placeholder={t('wiki.form.selectPageType')} />
                        </SelectTrigger>
                        <SelectContent>
                          {PAGE_TYPE_OPTIONS.map(type => (
                            <SelectItem key={type} value={type}>
                              {getPageTypeLabel(type)}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-medium text-slate-700 flex items-center gap-2">
                        <FolderOpen className="w-4 h-4 text-emerald-500" />
                        {t('wiki.form.collection')}
                      </label>
                      <Select
                        value={formData.collectionId || 'none'}
                        onValueChange={(value) => handleChange('collectionId', value === 'none' ? '' : value)}
                      >
                        <SelectTrigger className="rounded-xl border-slate-200 focus:ring-emerald-500">
                          <SelectValue placeholder={t('wiki.form.selectCollection')} />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="none">{isArabic ? 'بدون مجموعة' : 'No Collection'}</SelectItem>
                          {collections?.map(collection => (
                            <SelectItem key={collection._id} value={collection._id}>
                              {isArabic ? collection.nameAr || collection.name : collection.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-medium text-slate-700 flex items-center gap-2">
                      <FileText className="w-4 h-4 text-emerald-500" />
                      {t('wiki.form.summary')}
                    </label>
                    <Textarea
                      placeholder={t('wiki.form.summaryPlaceholder')}
                      className="min-h-[80px] rounded-xl border-slate-200 focus:border-emerald-500 focus:ring-emerald-500"
                      value={formData.summary}
                      onChange={(e) => handleChange('summary', e.target.value)}
                    />
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-medium text-slate-700 flex items-center gap-2">
                      <FileText className="w-4 h-4 text-emerald-500" />
                      {t('wiki.form.content')}
                    </label>
                    <Suspense fallback={
                      <Skeleton className="min-h-[200px] w-full rounded-xl" />
                    }>
                      <RichTextEditor
                        value={formData.contentText || ''}
                        onChange={(content) => handleChange('contentText', content)}
                        placeholder={isArabic ? 'اكتب محتوى الصفحة هنا...' : 'Write page content here...'}
                        minHeight="250px"
                      />
                    </Suspense>
                  </div>

                  {/* Tags */}
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-slate-700 flex items-center gap-2">
                      <Tag className="w-4 h-4 text-emerald-500" />
                      {t('wiki.form.tags')}
                    </label>
                    <div className="flex flex-wrap gap-2 mb-2">
                      {formData.tags?.map(tag => (
                        <Badge key={tag} variant="secondary" className="gap-1">
                          {tag}
                          <button type="button" onClick={() => removeTag(tag)} className="hover:text-red-500">
                            <X className="w-3 h-3" />
                          </button>
                        </Badge>
                      ))}
                    </div>
                    <div className="flex gap-2">
                      <Input
                        placeholder={t('wiki.form.tagsPlaceholder')}
                        className="rounded-xl border-slate-200 focus:border-emerald-500 focus:ring-emerald-500 flex-1"
                        value={tagInput}
                        onChange={(e) => setTagInput(e.target.value)}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter') {
                            e.preventDefault()
                            addTag()
                          }
                        }}
                      />
                      <Button type="button" variant="outline" onClick={addTag} className="rounded-xl">
                        <Plus className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                </div>

                {/* Security Settings */}
                <Collapsible open={showSecurity} onOpenChange={setShowSecurity}>
                  <div className="border-t border-slate-100 pt-6">
                    <CollapsibleTrigger asChild>
                      <Button variant="ghost" className="w-full justify-between p-0 h-auto hover:bg-transparent">
                        <h3 className="text-lg font-semibold text-slate-800 flex items-center gap-2">
                          <Shield className="w-5 h-5 text-emerald-500" />
                          {isArabic ? 'إعدادات الأمان' : 'Security Settings'}
                        </h3>
                        {showSecurity ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
                      </Button>
                    </CollapsibleTrigger>
                    <CollapsibleContent className="mt-4">
                      <div className="space-y-4 p-4 bg-slate-50 rounded-xl">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div className="space-y-2">
                            <label className="text-sm font-medium text-slate-700">
                              {t('wiki.form.confidentialityLevel')}
                            </label>
                            <Select value={confidentialityLevel} onValueChange={(v) => setConfidentialityLevel(v as WikiConfidentialityLevel)}>
                              <SelectTrigger className="rounded-xl">
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                {CONFIDENTIALITY_OPTIONS.map(level => (
                                  <SelectItem key={level} value={level}>
                                    {getConfidentialityLabel(level)}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          </div>
                          <div className="space-y-2">
                            <label className="text-sm font-medium text-slate-700">
                              {t('wiki.form.visibilityLevel')}
                            </label>
                            <Select
                              value={formData.visibility}
                              onValueChange={(v) => handleChange('visibility', v as WikiVisibility)}
                            >
                              <SelectTrigger className="rounded-xl">
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                {VISIBILITY_OPTIONS.map(visibility => (
                                  <SelectItem key={visibility} value={visibility}>
                                    <div className="flex items-center gap-2">
                                      <Eye className="w-4 h-4" />
                                      {getVisibilityLabel(visibility)}
                                    </div>
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          </div>
                        </div>
                        <div className="flex items-center gap-3">
                          <Checkbox
                            id="confidential"
                            checked={formData.isConfidential}
                            onCheckedChange={(checked) => handleChange('isConfidential', checked === true)}
                          />
                          <label htmlFor="confidential" className="text-sm text-slate-700">
                            {isArabic ? 'تمييز كمستند سري' : 'Mark as confidential document'}
                          </label>
                        </div>
                      </div>
                    </CollapsibleContent>
                  </div>
                </Collapsible>

                {/* Calendar Settings */}
                <Collapsible open={showCalendarSettings} onOpenChange={setShowCalendarSettings}>
                  <div className="border-t border-slate-100 pt-6">
                    <CollapsibleTrigger asChild>
                      <Button variant="ghost" className="w-full justify-between p-0 h-auto hover:bg-transparent">
                        <h3 className="text-lg font-semibold text-slate-800 flex items-center gap-2">
                          <Calendar className="w-5 h-5 text-emerald-500" />
                          {isArabic ? 'إعدادات التقويم' : 'Calendar Settings'}
                        </h3>
                        {showCalendarSettings ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
                      </Button>
                    </CollapsibleTrigger>
                    <CollapsibleContent className="mt-4">
                      <div className="space-y-4 p-4 bg-slate-50 rounded-xl">
                        <div className="flex items-center gap-3">
                          <Checkbox
                            id="showOnCalendar"
                            checked={formData.showOnCalendar}
                            onCheckedChange={(checked) => handleChange('showOnCalendar', checked === true)}
                          />
                          <div>
                            <label htmlFor="showOnCalendar" className="text-sm font-medium text-slate-700 cursor-pointer">
                              {isArabic ? 'إظهار في التقويم' : 'Show on Calendar'}
                            </label>
                            <p className="text-xs text-slate-500">
                              {isArabic ? 'عرض هذه الصفحة كحدث في التقويم' : 'Display this page as an event in the calendar'}
                            </p>
                          </div>
                        </div>

                        {formData.showOnCalendar && (
                          <div className="space-y-4 pt-2">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                              <div className="space-y-2">
                                <label className="text-sm font-medium text-slate-700">
                                  {isArabic ? 'تاريخ التقويم' : 'Calendar Date'}
                                </label>
                                <Input
                                  type="datetime-local"
                                  className="rounded-xl"
                                  value={formData.calendarDate}
                                  onChange={(e) => handleChange('calendarDate', e.target.value)}
                                />
                              </div>
                              <div className="space-y-2">
                                <label className="text-sm font-medium text-slate-700">
                                  {isArabic ? 'تاريخ الانتهاء' : 'End Date'} <span className="text-slate-400">({isArabic ? 'اختياري' : 'optional'})</span>
                                </label>
                                <Input
                                  type="datetime-local"
                                  className="rounded-xl"
                                  value={formData.calendarEndDate}
                                  onChange={(e) => handleChange('calendarEndDate', e.target.value)}
                                />
                              </div>
                            </div>
                            <div className="space-y-2">
                              <label className="text-sm font-medium text-slate-700 flex items-center gap-2">
                                <Palette className="w-4 h-4 text-emerald-500" />
                                {isArabic ? 'لون التقويم' : 'Calendar Color'}
                              </label>
                              <div className="flex items-center gap-3">
                                <input
                                  type="color"
                                  value={formData.calendarColor || '#8b5cf6'}
                                  onChange={(e) => handleChange('calendarColor', e.target.value)}
                                  className="w-10 h-10 rounded-lg border border-slate-200 cursor-pointer"
                                />
                                <div className="flex gap-2">
                                  {['#8b5cf6', '#10b981', '#f59e0b', '#ef4444', '#3b82f6', '#ec4899'].map((color) => (
                                    <button
                                      key={color}
                                      type="button"
                                      onClick={() => handleChange('calendarColor', color)}
                                      className={`w-8 h-8 rounded-lg border-2 transition-all ${formData.calendarColor === color
                                        ? 'border-slate-800 scale-110'
                                        : 'border-transparent hover:border-slate-300'
                                        }`}
                                      style={{ backgroundColor: color }}
                                    />
                                  ))}
                                </div>
                              </div>
                            </div>
                          </div>
                        )}
                      </div>
                    </CollapsibleContent>
                  </div>
                </Collapsible>

                {/* Advanced Settings */}
                <Collapsible open={showAdvanced} onOpenChange={setShowAdvanced}>
                  <div className="border-t border-slate-100 pt-6">
                    <CollapsibleTrigger asChild>
                      <Button variant="ghost" className="w-full justify-between p-0 h-auto hover:bg-transparent">
                        <h3 className="text-lg font-semibold text-slate-800 flex items-center gap-2">
                          <AlertCircle className="w-5 h-5 text-emerald-500" />
                          {isArabic ? 'إعدادات متقدمة' : 'Advanced Settings'}
                        </h3>
                        {showAdvanced ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
                      </Button>
                    </CollapsibleTrigger>
                    <CollapsibleContent className="mt-4">
                      <div className="space-y-4 p-4 bg-slate-50 rounded-xl">
                        <div className="space-y-2">
                          <label className="text-sm font-medium text-slate-700">
                            {t('wiki.form.parentPage')}
                          </label>
                          <Select
                            value={formData.parentPageId || 'none'}
                            onValueChange={(v) => handleChange('parentPageId', v === 'none' ? '' : v)}
                          >
                            <SelectTrigger className="rounded-xl">
                              <SelectValue placeholder={t('wiki.form.selectParentPage')} />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="none">{isArabic ? 'بدون صفحة أصل' : 'No Parent Page'}</SelectItem>
                              {pages?.filter(p => p._id !== pageId).map(page => (
                                <SelectItem key={page._id} value={page._id}>
                                  {isArabic ? page.titleAr || page.title : page.title}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>
                        <div className="flex items-center gap-3">
                          <Checkbox
                            id="template"
                            checked={formData.isTemplate}
                            onCheckedChange={(checked) => handleChange('isTemplate', checked === true)}
                          />
                          <div>
                            <label htmlFor="template" className="text-sm font-medium text-slate-700">
                              {t('wiki.form.isTemplate')}
                            </label>
                            <p className="text-xs text-slate-500">{t('wiki.form.isTemplateDescription')}</p>
                          </div>
                        </div>
                      </div>
                    </CollapsibleContent>
                  </div>
                </Collapsible>

                {/* Submit */}
                <div className="flex items-center justify-end gap-4 pt-6 border-t border-slate-100">
                  <Link to={`/dashboard/cases/${caseId}/wiki` as any}>
                    <Button type="button" variant="ghost" className="text-slate-500 hover:text-navy">
                      {isArabic ? 'إلغاء' : 'Cancel'}
                    </Button>
                  </Link>
                  <Button
                    type="submit"
                    className="bg-emerald-500 hover:bg-emerald-600 text-white min-w-[140px] rounded-xl shadow-lg shadow-emerald-500/20"
                    disabled={isPending}
                  >
                    {isPending ? (
                      <span className="flex items-center gap-2">
                        <Loader2 className="w-4 h-4 animate-spin" />
                        {isArabic ? 'جاري الحفظ...' : 'Saving...'}
                      </span>
                    ) : (
                      <span className="flex items-center gap-2">
                        <Save className="w-4 h-4" />
                        {isEditMode ? (isArabic ? 'تحديث الصفحة' : 'Update Page') : (isArabic ? 'إنشاء الصفحة' : 'Create Page')}
                      </span>
                    )}
                  </Button>
                </div>
              </form>
            </div>
          </div>
        </div>
      </Main>
    </>
  )
}
