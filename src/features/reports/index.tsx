import { useState } from 'react'
import { Plus, BarChart2, FileText, BookMarked } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Header } from '@/components/layout/header'
import { Main } from '@/components/layout/main'
import { ProfileDropdown } from '@/components/profile-dropdown'
import { Search } from '@/components/search'
import { ThemeSwitch } from '@/components/theme-switch'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { useTranslation } from 'react-i18next'
import { useGenerateReport } from '@/hooks/useReports'
import { reportTypes } from './data/data'
import { ReportConfigDialog } from './components/report-config-dialog'
import { ReportViewer } from './components/report-viewer'
import { SavedReportsList } from './components/saved-reports-list'
import type { ReportType, ReportConfig, SavedReport } from '@/services/reportsService'

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

  return (
    <>
      <Header>
        <Search />
        <div className="ms-auto flex items-center space-x-4 rtl:space-x-reverse">
          <ThemeSwitch />
          <ProfileDropdown />
        </div>
      </Header>

      <Main>
        <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-2xl font-bold tracking-tight">
              {t('reports.title')}
            </h1>
            <p className="text-muted-foreground">
              {t('reports.description')}
            </p>
          </div>
          <Button onClick={handleCreateNew}>
            <Plus className="me-2 h-4 w-4" />
            {t('reports.createReport')}
          </Button>
        </div>

        <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as 'quick' | 'saved')}>
          <TabsList className="mb-6">
            <TabsTrigger value="quick" className="flex items-center gap-2">
              <BarChart2 className="h-4 w-4" />
              {t('reports.quickReports')}
            </TabsTrigger>
            <TabsTrigger value="saved" className="flex items-center gap-2">
              <BookMarked className="h-4 w-4" />
              {t('reports.savedReports')}
            </TabsTrigger>
          </TabsList>

          <TabsContent value="quick">
            {/* Report Type Selection */}
            <div className="mb-6">
              <h2 className="text-lg font-semibold mb-4">{t('reports.selectReportType')}</h2>
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
                {reportTypes.map((type) => {
                  const TypeIcon = type.icon
                  const isSelected = selectedReportType === type.value

                  return (
                    <Card
                      key={type.value}
                      className={`cursor-pointer transition-all hover:border-primary ${
                        isSelected ? 'border-primary bg-primary/5' : ''
                      }`}
                      onClick={() => handleReportTypeSelect(type.value)}
                    >
                      <CardContent className="p-4">
                        <div className="flex items-start gap-3">
                          <div className={`p-2 rounded-lg bg-primary/10 ${type.color}`}>
                            <TypeIcon className="h-5 w-5" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <h3 className="font-medium text-sm">
                              {isRTL ? type.labelAr : type.label}
                            </h3>
                            <p className="text-xs text-muted-foreground mt-0.5 line-clamp-2">
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
            <ReportViewer
              reportType={selectedReportType}
              config={reportConfig}
              data={generateReport.data?.data}
              isLoading={generateReport.isPending}
              onConfigChange={handleConfigChange}
              onRefresh={handleRefresh}
            />
          </TabsContent>

          <TabsContent value="saved">
            <SavedReportsList
              onRunReport={handleRunSavedReport}
              onEditReport={handleEditSavedReport}
            />
          </TabsContent>
        </Tabs>
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
