import { useState, useEffect, lazy, Suspense } from 'react'
import { useSearch } from '@tanstack/react-router'
import { useTranslation } from 'react-i18next'
import { Plus, Upload, Download, Search, Bell, FileText, Layers, CheckCircle2, Calendar, Loader2 } from 'lucide-react'
import { Header } from '@/components/layout/header'
import { TopNav } from '@/components/layout/top-nav'
import { DynamicIsland } from '@/components/dynamic-island'
import { Main } from '@/components/layout/main'
import { ProfileDropdown } from '@/components/profile-dropdown'
import { ThemeSwitch } from '@/components/theme-switch'
import { LanguageSwitcher } from '@/components/language-switcher'
import { ConfigDrawer } from '@/components/config-drawer'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Dialog, DialogContent } from '@/components/ui/dialog'
import { usePdfmeTemplates } from '@/hooks/usePdfme'
import { PdfTemplatesProvider, usePdfTemplatesContext } from './components/template-provider'
import { PdfTemplatesTable } from './components/template-table'
import { TemplateViewDialog, TemplateDeleteDialog, TemplateDuplicateDialog, TemplatePreviewDialog } from './components/template-dialogs'
import { SettingsSidebar } from '../settings/components/settings-sidebar'
import type { PdfmeTemplateCategory } from '@/services/pdfmeService'

// Lazy load PdfDesigner - contains heavy @pdfme libraries (~200KB+)
const PdfDesigner = lazy(() => import('./components/pdf-designer').then(mod => ({ default: mod.PdfDesigner })))

function PdfTemplatesContent() {
  const { t, i18n } = useTranslation()
  const search = useSearch({ from: '/_authenticated/dashboard/pdf-templates/' })
  const [selectedCategory, setSelectedCategory] = useState<PdfmeTemplateCategory | 'all'>('all')
  const [designerOpen, setDesignerOpen] = useState(false)

  const {
    open,
    setOpen,
    currentTemplate,
    setCurrentTemplate,
  } = usePdfTemplatesContext()

  // Handle edit action from row actions
  useEffect(() => {
    if (open === 'edit' || open === 'designer') {
      setDesignerOpen(true)
      setOpen(null)
    }
  }, [open, setOpen])

  // Fetch data for stats display
  // TODO: Replace with dedicated stats endpoint
  //
  // NEEDED ENDPOINT: GET /api/pdf-templates/stats
  // Should return:
  // {
  //   total: number,
  //   byCategory: { invoice: number, contract: number, ... },
  //   defaultTemplates: number,
  //   activeTemplates: number
  // }
  //
  // CURRENT WORKAROUND: Fetching all templates with high limit (1000) and
  // calculating stats client-side (see lines 75-90). This is inefficient as it:
  // - Transfers unnecessary data (full template objects instead of just counts)
  // - Doesn't scale beyond 1000 templates
  // - Increases bundle size and memory usage
  const { data } = usePdfmeTemplates({
    page: 1,
    limit: 1000, // Get a large number to calculate accurate stats
    category: selectedCategory !== 'all' ? selectedCategory : undefined,
  })

  const templates = data?.data || []
  const totalCount = data?.total || 0

  // Calculate stats from fetched data
  const stats = {
    total: totalCount,
    byCategory: {
      invoice: templates.filter(t => t.category === 'invoice').length,
      contract: templates.filter(t => t.category === 'contract').length,
      receipt: templates.filter(t => t.category === 'receipt').length,
      report: templates.filter(t => t.category === 'report').length,
      statement: templates.filter(t => t.category === 'statement').length,
      letter: templates.filter(t => t.category === 'letter').length,
      certificate: templates.filter(t => t.category === 'certificate').length,
      custom: templates.filter(t => t.category === 'custom').length,
    },
    defaultTemplates: templates.filter(t => t.isDefault).length,
    activeTemplates: templates.filter(t => t.isActive).length,
  }

  const handleAdd = () => {
    setCurrentTemplate(null)
    setDesignerOpen(true)
  }

  const handleCloseDesigner = () => {
    setDesignerOpen(false)
    setCurrentTemplate(null)
  }

  const handleSaveTemplate = (template: any) => {
    // Handle save logic here
    console.log('Saving template:', template)
    handleCloseDesigner()
  }

  const topNav = [
    { title: t('nav.overview', 'نظرة عامة'), href: '/dashboard/overview', isActive: false },
    { title: t('nav.settings', 'الإعدادات'), href: '/dashboard/settings', isActive: true },
  ]

  const categories = [
    { value: 'all', label: t('pdfTemplates.categories.all', 'الكل'), icon: Layers },
    { value: 'invoice', label: t('pdfTemplates.categories.invoice', 'فواتير'), icon: FileText },
    { value: 'contract', label: t('pdfTemplates.categories.contract', 'عقود'), icon: FileText },
    { value: 'receipt', label: t('pdfTemplates.categories.receipt', 'إيصالات'), icon: FileText },
    { value: 'report', label: t('pdfTemplates.categories.report', 'تقارير'), icon: FileText },
    { value: 'statement', label: t('pdfTemplates.categories.statement', 'كشوف'), icon: FileText },
    { value: 'letter', label: t('pdfTemplates.categories.letter', 'خطابات'), icon: FileText },
    { value: 'certificate', label: t('pdfTemplates.categories.certificate', 'شهادات'), icon: FileText },
    { value: 'custom', label: t('pdfTemplates.categories.custom', 'مخصص'), icon: FileText },
  ]

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
                  <FileText className="w-3 h-3 ms-2" />
                  {t('settings.title', 'الإعدادات')}
                </Badge>
                <span className="text-slate-500 text-sm">
                  {new Date().toLocaleDateString(i18n.language === 'ar' ? 'ar-SA' : 'en-US', { month: 'long', year: 'numeric' })}
                </span>
              </div>
              <h1 className="text-4xl font-bold leading-tight mb-2">
                {t('pdfTemplates.title', 'قوالب PDF')}
              </h1>
              <p className="text-slate-300 text-lg max-w-xl">
                {t('pdfTemplates.description', 'إنشاء وتخصيص قوالب PDF للفواتير والعقود والمستندات')}
              </p>
            </div>
            <div className="flex gap-3">
              <Button
                variant="outline"
                size="sm"
                className="bg-white/10 border-white/20 text-white hover:bg-white/20 hover:text-white"
              >
                <Upload className="me-2 h-4 w-4" aria-hidden="true" />
                {t('pdfTemplates.import', 'استيراد')}
              </Button>
              <Button
                variant="outline"
                size="sm"
                className="bg-white/10 border-white/20 text-white hover:bg-white/20 hover:text-white"
              >
                <Download className="me-2 h-4 w-4" aria-hidden="true" />
                {t('pdfTemplates.export', 'تصدير')}
              </Button>
              <Button
                onClick={handleAdd}
                className="bg-brand-blue hover:bg-blue-600 text-white rounded-xl h-12 px-8 font-bold shadow-lg shadow-blue-600/30 hover:scale-105 transition-all duration-300 border-0 text-base"
              >
                <Plus className="ms-2 h-5 w-5" aria-hidden="true" />
                {t('pdfTemplates.addTemplate', 'إضافة قالب')}
              </Button>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* --- Main Content --- */}
          <div className="lg:col-span-2 flex flex-col gap-6">
            {/* Stats Cards */}
            <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
              <Card className="border-slate-100 shadow-sm">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium text-slate-500">
                    {t('pdfTemplates.stats.total', 'إجمالي القوالب')}
                  </CardTitle>
                  <FileText className="h-4 w-4 text-primary" aria-hidden="true" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-navy">{totalCount}</div>
                </CardContent>
              </Card>

              <Card className="border-slate-100 shadow-sm">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium text-slate-500">
                    {t('pdfTemplates.stats.categories', 'الفئات')}
                  </CardTitle>
                  <Layers className="h-4 w-4 text-blue-500" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-navy">8</div>
                </CardContent>
              </Card>

              <Card className="border-slate-100 shadow-sm">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium text-slate-500">
                    {t('pdfTemplates.stats.default', 'القوالب الافتراضية')}
                  </CardTitle>
                  <CheckCircle2 className="h-4 w-4 text-green-500" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-navy">{stats.defaultTemplates}</div>
                </CardContent>
              </Card>

              <Card className="border-slate-100 shadow-sm">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium text-slate-500">
                    {t('pdfTemplates.stats.active', 'القوالب النشطة')}
                  </CardTitle>
                  <Calendar className="h-4 w-4 text-emerald-500" aria-hidden="true" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-navy">{stats.activeTemplates}</div>
                </CardContent>
              </Card>
            </div>

            {/* Category Filter Tabs */}
            <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-4">
              <Tabs value={selectedCategory} onValueChange={(value) => setSelectedCategory(value as any)}>
                <TabsList className="grid grid-cols-3 md:grid-cols-5 lg:grid-cols-9 gap-2 h-auto bg-transparent">
                  {categories.map((category) => (
                    <TabsTrigger
                      key={category.value}
                      value={category.value}
                      className="data-[state=active]:bg-brand-blue data-[state=active]:text-white rounded-lg px-3 py-2"
                    >
                      <category.icon className="h-4 w-4 me-1" />
                      {category.label}
                    </TabsTrigger>
                  ))}
                </TabsList>
              </Tabs>
            </div>

            {/* Templates Table */}
            <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
              <PdfTemplatesTable />
            </div>
          </div>

          {/* Sidebar */}
          <SettingsSidebar context="pdf-templates" />
        </div>
      </Main>

      {/* Dialogs */}
      <TemplateViewDialog />
      <TemplateDeleteDialog />
      <TemplateDuplicateDialog />
      <TemplatePreviewDialog />

      {/* PDF Designer Modal - Full Screen (Lazy Loaded) */}
      <Dialog open={designerOpen} onOpenChange={setDesignerOpen}>
        <DialogContent className="max-w-[95vw] h-[95vh] p-0">
          <Suspense fallback={
            <div className="h-full w-full flex items-center justify-center bg-slate-50">
              <div className="text-center">
                <Loader2 className="h-10 w-10 animate-spin mx-auto text-blue-500 mb-3" />
                <p className="text-slate-600 font-medium">{t('common.loading', 'جاري التحميل...')}</p>
              </div>
            </div>
          }>
            <PdfDesigner
              template={currentTemplate ? {
                basePdf: currentTemplate.basePdf,
                schemas: currentTemplate.schemas,
              } : undefined}
              onSave={handleSaveTemplate}
              onCancel={handleCloseDesigner}
              lang={i18n.language === 'ar' ? 'ar' : 'en'}
            />
          </Suspense>
        </DialogContent>
      </Dialog>
    </>
  )
}

export default function PdfTemplates() {
  return (
    <PdfTemplatesProvider>
      <PdfTemplatesContent />
    </PdfTemplatesProvider>
  )
}
