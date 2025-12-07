import { Plus, Upload, Download, Search, Bell, Scale } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Header } from '@/components/layout/header'
import { TopNav } from '@/components/layout/top-nav'
import { DynamicIsland } from '@/components/dynamic-island'
import { Main } from '@/components/layout/main'
import { ProfileDropdown } from '@/components/profile-dropdown'
import { ThemeSwitch } from '@/components/theme-switch'
import { LanguageSwitcher } from '@/components/language-switcher'
import { ConfigDrawer } from '@/components/config-drawer'
import { Badge } from '@/components/ui/badge'
import { useInvoiceTemplates, useSetDefaultTemplate } from '@/hooks/useInvoiceTemplates'
import { TemplatesProvider, useTemplatesContext } from './components/templates-provider'
import { TemplatesTable } from './components/templates-table'
import { TemplateActionDialog } from './components/template-action-dialog'
import { TemplateDeleteDialog } from './components/template-delete-dialog'
import { TemplateViewDialog } from './components/template-view-dialog'
import { TemplateDuplicateDialog } from './components/template-duplicate-dialog'
import { useTranslation } from 'react-i18next'
import { SettingsSidebar } from '../settings/components/settings-sidebar'

function InvoiceTemplatesContent() {
  const { t } = useTranslation()
  const {
    open,
    setOpen,
    currentTemplate,
    setCurrentTemplate,
  } = useTemplatesContext()

  const { data, isLoading } = useInvoiceTemplates()
  const setDefaultMutation = useSetDefaultTemplate()

  const templates = data?.data || []

  const handleAdd = () => {
    setCurrentTemplate(null)
    setOpen('add')
  }

  const handleCloseDialog = () => {
    setOpen(null)
    setCurrentTemplate(null)
  }

  const handleSetDefault = () => {
    if (currentTemplate) {
      setDefaultMutation.mutate(currentTemplate._id, {
        onSuccess: () => {
          setOpen(null)
          setCurrentTemplate(null)
        },
      })
    }
  }

  const topNav = [
    { title: t('nav.overview', 'نظرة عامة'), href: '/dashboard/overview', isActive: false },
    { title: t('nav.settings', 'الإعدادات'), href: '/dashboard/settings', isActive: true },
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
            <Search className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" aria-hidden="true" />
            <input
              type="text"
              placeholder={t('common.search', 'بحث...')}
              className="h-9 w-64 rounded-xl border border-white/10 bg-white/5 pe-9 ps-4 text-sm text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500/50"
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
        <div className="bg-navy rounded-3xl p-8 relative overflow-hidden text-white shadow-xl shadow-navy/20 group">
          <div className="absolute -bottom-32 -left-32 w-96 h-96 bg-brand-blue rounded-full blur-[120px] opacity-40 group-hover:opacity-50 transition-opacity duration-700"></div>
          <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-6">
            <div>
              <div className="flex items-center gap-2 mb-2">
                <Badge className="bg-blue-500/20 text-blue-100 hover:bg-blue-500/30 border-0 px-3 py-1">
                  <Scale className="w-3 h-3 ms-2" />
                  {t('settings.title', 'الإعدادات')}
                </Badge>
                <span className="text-slate-400 text-sm">
                  {new Date().toLocaleDateString('ar-SA', { month: 'long', year: 'numeric' })}
                </span>
              </div>
              <h1 className="text-4xl font-bold leading-tight mb-2">
                {t('invoiceTemplates.title', 'قوالب الفواتير')}
              </h1>
              <p className="text-slate-300 text-lg max-w-xl">
                {t('invoiceTemplates.description', 'تخصيص وإدارة قوالب الفواتير وعروض الأسعار')}
              </p>
            </div>
            <div className="flex gap-3">
              <Button
                variant="outline"
                size="sm"
                className="bg-white/10 border-white/20 text-white hover:bg-white/20 hover:text-white"
              >
                <Upload className="me-2 h-4 w-4" aria-hidden="true" />
                {t('invoiceTemplates.import', 'استيراد')}
              </Button>
              <Button
                variant="outline"
                size="sm"
                className="bg-white/10 border-white/20 text-white hover:bg-white/20 hover:text-white"
              >
                <Download className="me-2 h-4 w-4" aria-hidden="true" />
                {t('invoiceTemplates.export', 'تصدير')}
              </Button>
              <Button
                onClick={handleAdd}
                className="bg-brand-blue hover:bg-blue-600 text-white rounded-xl h-12 px-8 font-bold shadow-lg shadow-blue-600/30 hover:scale-105 transition-all duration-300 border-0 text-base"
              >
                <Plus className="ms-2 h-5 w-5" aria-hidden="true" />
                {t('invoiceTemplates.addTemplate', 'إضافة قالب')}
              </Button>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* --- Main Content --- */}
          <div className="lg:col-span-2 flex flex-col gap-6">
            {isLoading ? (
              <div className="flex h-[400px] items-center justify-center bg-white rounded-2xl border border-slate-100">
                <div className="h-8 w-8 animate-spin rounded-full border-4 border-brand-blue border-t-transparent" />
              </div>
            ) : (
              <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
                <TemplatesTable data={templates} />
              </div>
            )}
          </div>

          {/* Sidebar */}
          <SettingsSidebar context="invoice-templates" />
        </div>
      </Main>

      {/* Dialogs */}
      <TemplateActionDialog
        open={open === 'add' || open === 'edit'}
        onOpenChange={(isOpen) => !isOpen && handleCloseDialog()}
        currentTemplate={currentTemplate}
      />

      <TemplateViewDialog
        open={open === 'view'}
        onOpenChange={(isOpen) => !isOpen && handleCloseDialog()}
        currentTemplate={currentTemplate}
      />

      <TemplateDeleteDialog
        open={open === 'delete'}
        onOpenChange={(isOpen) => !isOpen && handleCloseDialog()}
        currentTemplate={currentTemplate}
      />

      <TemplateDuplicateDialog
        open={open === 'duplicate'}
        onOpenChange={(isOpen) => !isOpen && handleCloseDialog()}
        currentTemplate={currentTemplate}
      />

      {/* Set as default confirmation */}
      {open === 'settings' && currentTemplate && (
        <TemplateDeleteDialog
          open={false}
          onOpenChange={() => { }}
          currentTemplate={null}
        />
      )}
    </>
  )
}

export default function InvoiceTemplates() {
  return (
    <TemplatesProvider>
      <InvoiceTemplatesContent />
    </TemplatesProvider>
  )
}
