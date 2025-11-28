import { useState } from 'react'
import { Plus, BarChart2, FileText, BookMarked, Search, Bell } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Header } from '@/components/layout/header'
import { Main } from '@/components/layout/main'
import { ProfileDropdown } from '@/components/profile-dropdown'
import { ThemeSwitch } from '@/components/theme-switch'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { useTranslation } from 'react-i18next'
import { useGenerateReport } from '@/hooks/useReports'
import { reportTypes } from './data/data'
import { ReportConfigDialog } from './components/report-config-dialog'
import { ReportViewer } from './components/report-viewer'
import { SavedReportsList } from './components/saved-reports-list'
import type { ReportType, ReportConfig, SavedReport } from '@/services/reportsService'
import { TopNav } from '@/components/layout/top-nav'
import { DynamicIsland } from '@/components/dynamic-island'
import { LanguageSwitcher } from '@/components/language-switcher'
import { ConfigDrawer } from '@/components/config-drawer'
import { Badge } from '@/components/ui/badge'
import { ReportsSidebar } from './components/reports-sidebar'

export default function Reports() {
  const { t, i18n } = useTranslation()
  const isRTL = i18n.language === 'ar'
  const [activeTab, setActiveTab] = useState<'quick' | 'saved'>('quick')
  const [selectedReportType, setSelectedReportType] = useState<ReportType>('revenue')
  const [reportConfig, setReportConfig] = useState<Partial<ReportConfig>>({
    period: 'monthly',
    format: 'table',
  })
  const [configDialogOpen, setConfigDialogOpen] = useState(false)
  const [editingReport, setEditingReport] = useState<SavedReport | null>(null)

  const generateReport = useGenerateReport()

  const handleReportTypeSelect = (type: ReportType) => {
    setSelectedReportType(type)
    setReportConfig({ ...reportConfig, type })
    generateReport.mutate({ type, config: { ...reportConfig, type } })
  }

  const handleConfigChange = (config: Partial<ReportConfig>) => {
    setReportConfig(config)
    generateReport.mutate({ type: selectedReportType, config })
  }

  const handleRefresh = () => {
    generateReport.mutate({ type: selectedReportType, config: reportConfig })
  }

  const handleRunSavedReport = (report: SavedReport) => {
    setSelectedReportType(report.type)
    setReportConfig(report.config)
    generateReport.mutate({ type: report.type, config: report.config })
    setActiveTab('quick')
  }

  const handleEditSavedReport = (report: SavedReport) => {
    setEditingReport(report)
    setConfigDialogOpen(true)
  }

  const handleCreateNew = () => {
    setEditingReport(null)
    setConfigDialogOpen(true)
  }

  const topNav = [
    { title: isRTL ? 'التقارير' : 'Reports', href: '/dashboard/reports', isActive: true },
    { title: isRTL ? 'التحليلات' : 'Analytics', href: '/dashboard/analytics', isActive: false },
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
                  <BarChart2 className="w-3 h-3 ml-2" />
                  {isRTL ? 'التقارير والتحليلات' : 'Reports & Analytics'}
                </Badge>
                <span className="text-slate-400 text-sm">
                  {new Date().toLocaleDateString('ar-SA', { month: 'long', year: 'numeric' })}
                </span>
              </div>
              <h1 className="text-4xl font-bold leading-tight mb-2">
                {t('reports.title')}
              </h1>
              <p className="text-slate-300 text-lg max-w-xl">
                {t('reports.description')}
              </p>
            </div>
            <Button onClick={handleCreateNew} className="bg-emerald-500 hover:bg-emerald-600 text-white h-12 px-6 rounded-xl shadow-lg shadow-emerald-500/20 border-0">
              <Plus className="me-2 h-5 w-5" />
              {t('reports.createReport')}
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* --- Main Content --- */}
          <div className="lg:col-span-2 flex flex-col gap-6">

            <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as 'quick' | 'saved')} className="w-full">
              <TabsList className="w-full justify-start bg-transparent p-0 mb-6 border-b border-slate-200 rounded-none h-auto">
                <TabsTrigger
                  value="quick"
                  className="flex items-center gap-2 px-6 py-3 rounded-none border-b-2 border-transparent data-[state=active]:border-emerald-500 data-[state=active]:bg-transparent data-[state=active]:text-emerald-600 text-slate-500 hover:text-slate-700 transition-colors"
                >
                  <BarChart2 className="h-4 w-4" />
                  {t('reports.quickReports')}
                </TabsTrigger>
                <TabsTrigger
                  value="saved"
                  className="flex items-center gap-2 px-6 py-3 rounded-none border-b-2 border-transparent data-[state=active]:border-emerald-500 data-[state=active]:bg-transparent data-[state=active]:text-emerald-600 text-slate-500 hover:text-slate-700 transition-colors"
                >
                  <BookMarked className="h-4 w-4" />
                  {t('reports.savedReports')}
                </TabsTrigger>
              </TabsList>

              <TabsContent value="quick" className="mt-0 space-y-6">
                {/* Report Type Selection */}
                <div className="bg-white rounded-3xl p-6 shadow-sm border border-slate-100">
                  <h2 className="text-lg font-bold text-navy mb-4">{t('reports.selectReportType')}</h2>
                  <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
                    {reportTypes.map((type) => {
                      const TypeIcon = type.icon
                      const isSelected = selectedReportType === type.value

                      return (
                        <Card
                          key={type.value}
                          className={`cursor-pointer transition-all duration-200 border-2 ${isSelected
                              ? 'border-emerald-500 bg-emerald-50/50 shadow-md shadow-emerald-500/10'
                              : 'border-slate-100 hover:border-emerald-200 hover:bg-slate-50'
                            }`}
                          onClick={() => handleReportTypeSelect(type.value)}
                        >
                          <CardContent className="p-4">
                            <div className="flex flex-col items-center text-center gap-3">
                              <div className={`p-3 rounded-xl ${isSelected ? 'bg-emerald-100 text-emerald-600' : 'bg-slate-100 text-slate-500'}`}>
                                <TypeIcon className="h-6 w-6" />
                              </div>
                              <div className="flex-1 min-w-0">
                                <h3 className={`font-bold text-sm ${isSelected ? 'text-emerald-700' : 'text-navy'}`}>
                                  {isRTL ? type.labelAr : type.label}
                                </h3>
                                <p className="text-xs text-slate-500 mt-1 line-clamp-2">
                                  {isRTL ? type.descriptionAr : type.description}
                                </p>
                              </div>
                            </div>
                          </CardContent>
                        </Card>
                      )
                    })}
                  </div>
                </div>

                {/* Report Viewer */}
                <div className="bg-white rounded-3xl p-1 shadow-sm border border-slate-100 overflow-hidden">
                  <ReportViewer
                    reportType={selectedReportType}
                    config={reportConfig}
                    data={generateReport.data?.data}
                    isLoading={generateReport.isPending}
                    onConfigChange={handleConfigChange}
                    onRefresh={handleRefresh}
                  />
                </div>
              </TabsContent>

              <TabsContent value="saved" className="mt-0">
                <div className="bg-white rounded-3xl p-1 shadow-sm border border-slate-100 overflow-hidden">
                  <SavedReportsList
                    onRunReport={handleRunSavedReport}
                    onEditReport={handleEditSavedReport}
                  />
                </div>
              </TabsContent>
            </Tabs>
          </div>

          {/* Sidebar */}
          <ReportsSidebar context="overview" />
        </div>
      </Main>

      {/* Report Configuration Dialog */}
      <ReportConfigDialog
        open={configDialogOpen}
        onOpenChange={setConfigDialogOpen}
        currentReport={editingReport}
        onSuccess={() => {
          setEditingReport(null)
        }}
      />
    </>
  )
}
