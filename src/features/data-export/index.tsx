import { useState } from 'react'
import { Download, Upload, FileDown, Search, Bell, Database, History, CloudCog } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Header } from '@/components/layout/header'
import { Main } from '@/components/layout/main'
import { ProfileDropdown } from '@/components/profile-dropdown'
import { ThemeSwitch } from '@/components/theme-switch'
import { ExportDialog } from './components/export-dialog'
import { ImportDialog } from './components/import-dialog'
import { JobHistory } from './components/job-history'
import { entityTypes } from './data/data'
import { useTranslation } from 'react-i18next'
import { useDownloadSampleTemplate } from '@/hooks/useDataExport'
import type { EntityType } from '@/services/dataExportService'
import { TopNav } from '@/components/layout/top-nav'
import { DynamicIsland } from '@/components/dynamic-island'
import { LanguageSwitcher } from '@/components/language-switcher'
import { ConfigDrawer } from '@/components/config-drawer'
import { Badge } from '@/components/ui/badge'
import { DataExportSidebar } from './components/data-export-sidebar'

export default function DataExport() {
  const { t, i18n } = useTranslation()
  const isRTL = i18n.language === 'ar'
  const [exportDialogOpen, setExportDialogOpen] = useState(false)
  const [importDialogOpen, setImportDialogOpen] = useState(false)
  const [selectedEntityType, setSelectedEntityType] = useState<EntityType>('clients')
  const downloadTemplate = useDownloadSampleTemplate()

  const handleExportEntity = (entityType: EntityType) => {
    setSelectedEntityType(entityType)
    setExportDialogOpen(true)
  }

  const handleImportEntity = (entityType: EntityType) => {
    setSelectedEntityType(entityType)
    setImportDialogOpen(true)
  }

  const topNav = [
    { title: isRTL ? 'تصدير البيانات' : 'Data Export', href: '/dashboard/data-export', isActive: true },
    { title: isRTL ? 'النسخ الاحتياطي' : 'Backup', href: '/dashboard/backup', isActive: false },
  ]

  return (
    <>
      <Header className="bg-navy shadow-none relative">
        <TopNav links={topNav} className="[&>a]:text-slate-300 [&>a:hover]:text-white [&>a[aria-current='page']]:text-white" />

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
        <div className="bg-navy rounded-3xl p-8 relative overflow-hidden text-white shadow-xl shadow-navy/20 group">
          <div className="absolute -bottom-32 -left-32 w-96 h-96 bg-brand-blue rounded-full blur-[120px] opacity-40 group-hover:opacity-50 transition-opacity duration-700"></div>
          <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-6">
            <div>
              <div className="flex items-center gap-2 mb-2">
                <Badge className="bg-blue-500/20 text-blue-100 hover:bg-blue-500/30 border-0 px-3 py-1">
                  <Database className="w-3 h-3 ml-2" />
                  {isRTL ? 'إدارة البيانات' : 'Data Management'}
                </Badge>
                <span className="text-slate-400 text-sm">
                  {new Date().toLocaleDateString('ar-SA', { month: 'long', year: 'numeric' })}
                </span>
              </div>
              <h1 className="text-4xl font-bold leading-tight mb-2">
                {t('dataExport.title')}
              </h1>
              <p className="text-slate-300 text-lg max-w-xl">
                {t('dataExport.description')}
              </p>
            </div>
            <div className="flex gap-3">
              <Button
                variant="outline"
                onClick={() => setImportDialogOpen(true)}
                className="bg-white/10 text-white border-white/20 hover:bg-white/20 hover:text-white h-12 px-6 rounded-xl"
              >
                <Upload className="me-2 h-5 w-5" />
                {t('dataExport.import')}
              </Button>
              <Button
                onClick={() => setExportDialogOpen(true)}
                className="bg-emerald-500 hover:bg-emerald-600 text-white h-12 px-6 rounded-xl shadow-lg shadow-emerald-500/20 border-0"
              >
                <Download className="me-2 h-5 w-5" />
                {t('dataExport.export')}
              </Button>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* --- Main Content --- */}
          <div className="lg:col-span-2 flex flex-col gap-8">

            {/* Quick Export Cards */}
            <div className="bg-white rounded-3xl p-6 shadow-sm border border-slate-100">
              <h2 className="text-lg font-bold text-navy mb-4">{t('dataExport.quickExport')}</h2>
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-4">
                {entityTypes.slice(0, 5).map((entity) => {
                  const EntityIcon = entity.icon
                  return (
                    <Card
                      key={entity.value}
                      className="cursor-pointer hover:border-emerald-500 hover:shadow-md transition-all duration-200 border-slate-100 group"
                      onClick={() => handleExportEntity(entity.value)}
                    >
                      <CardContent className="p-4 flex flex-col items-center text-center">
                        <div className="h-12 w-12 rounded-xl bg-slate-50 flex items-center justify-center mb-3 group-hover:bg-emerald-50 transition-colors">
                          <EntityIcon className="h-6 w-6 text-slate-500 group-hover:text-emerald-600 transition-colors" />
                        </div>
                        <span className="text-sm font-bold text-navy group-hover:text-emerald-700 transition-colors">
                          {isRTL ? entity.labelAr : entity.label}
                        </span>
                      </CardContent>
                    </Card>
                  )
                })}
              </div>
            </div>

            {/* Import Templates */}
            <Card className="border-slate-100 shadow-sm rounded-3xl overflow-hidden">
              <CardHeader className="bg-slate-50/50 border-b border-slate-50">
                <CardTitle className="text-navy">{t('dataExport.importTemplates')}</CardTitle>
                <CardDescription>
                  {t('dataExport.importTemplatesDescription')}
                </CardDescription>
              </CardHeader>
              <CardContent className="p-6">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {entityTypes.slice(0, 4).map((entity) => {
                    const EntityIcon = entity.icon
                    return (
                      <div
                        key={entity.value}
                        className="flex items-center justify-between p-4 rounded-xl border border-slate-100 hover:border-emerald-200 hover:bg-emerald-50/30 transition-all group"
                      >
                        <div className="flex items-center gap-3">
                          <div className="h-10 w-10 bg-slate-50 rounded-lg flex items-center justify-center group-hover:bg-white transition-colors">
                            <EntityIcon className="h-5 w-5 text-slate-500 group-hover:text-emerald-600 transition-colors" />
                          </div>
                          <span className="text-sm font-bold text-navy">{isRTL ? entity.labelAr : entity.label}</span>
                        </div>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() =>
                            downloadTemplate.mutate({
                              entityType: entity.value,
                              format: 'xlsx',
                            })
                          }
                          disabled={downloadTemplate.isPending}
                          className="text-slate-400 hover:text-emerald-600 hover:bg-emerald-100"
                        >
                          <FileDown className="h-4 w-4" />
                        </Button>
                      </div>
                    )
                  })}
                </div>
              </CardContent>
            </Card>

            {/* Job History */}
            <div className="bg-white rounded-3xl p-1 shadow-sm border border-slate-100 overflow-hidden">
              <div className="p-6 border-b border-slate-50">
                <h2 className="text-lg font-bold text-navy">{t('dataExport.jobHistory')}</h2>
              </div>
              <JobHistory />
            </div>
          </div>

          {/* Sidebar */}
          <DataExportSidebar context="export" />
        </div>
      </Main>

      {/* Dialogs */}
      <ExportDialog
        open={exportDialogOpen}
        onOpenChange={setExportDialogOpen}
        defaultEntityType={selectedEntityType}
      />

      <ImportDialog
        open={importDialogOpen}
        onOpenChange={setImportDialogOpen}
        defaultEntityType={selectedEntityType}
      />
    </>
  )
}
