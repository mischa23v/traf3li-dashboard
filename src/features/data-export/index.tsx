import { useState } from 'react'
import { Download, Upload, FileDown } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Header } from '@/components/layout/header'
import { Main } from '@/components/layout/main'
import { ProfileDropdown } from '@/components/profile-dropdown'
import { Search } from '@/components/search'
import { ThemeSwitch } from '@/components/theme-switch'
import { ExportDialog } from './components/export-dialog'
import { ImportDialog } from './components/import-dialog'
import { JobHistory } from './components/job-history'
import { entityTypes } from './data/data'
import { useTranslation } from 'react-i18next'
import { useDownloadSampleTemplate } from '@/hooks/useDataExport'
import type { EntityType } from '@/services/dataExportService'

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
              {t('dataExport.title')}
            </h1>
            <p className="text-muted-foreground">
              {t('dataExport.description')}
            </p>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" onClick={() => setImportDialogOpen(true)}>
              <Upload className="me-2 h-4 w-4" />
              {t('dataExport.import')}
            </Button>
            <Button onClick={() => setExportDialogOpen(true)}>
              <Download className="me-2 h-4 w-4" />
              {t('dataExport.export')}
            </Button>
          </div>
        </div>

        {/* Quick Export Cards */}
        <div className="mb-8">
          <h2 className="text-lg font-semibold mb-4">{t('dataExport.quickExport')}</h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-4">
            {entityTypes.slice(0, 5).map((entity) => {
              const EntityIcon = entity.icon
              return (
                <Card
                  key={entity.value}
                  className="cursor-pointer hover:border-primary transition-colors"
                  onClick={() => handleExportEntity(entity.value)}
                >
                  <CardContent className="p-4 flex flex-col items-center text-center">
                    <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center mb-2">
                      <EntityIcon className="h-5 w-5 text-primary" />
                    </div>
                    <span className="text-sm font-medium">
                      {isRTL ? entity.labelAr : entity.label}
                    </span>
                  </CardContent>
                </Card>
              )
            })}
          </div>
        </div>

        {/* Import Templates */}
        <div className="mb-8">
          <Card>
            <CardHeader>
              <CardTitle>{t('dataExport.importTemplates')}</CardTitle>
              <CardDescription>
                {t('dataExport.importTemplatesDescription')}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                {entityTypes.slice(0, 4).map((entity) => {
                  const EntityIcon = entity.icon
                  return (
                    <div
                      key={entity.value}
                      className="flex items-center justify-between p-3 rounded-lg border"
                    >
                      <div className="flex items-center gap-2">
                        <EntityIcon className="h-4 w-4 text-muted-foreground" />
                        <span className="text-sm">{isRTL ? entity.labelAr : entity.label}</span>
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
                      >
                        <FileDown className="h-4 w-4" />
                      </Button>
                    </div>
                  )
                })}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Job History */}
        <div>
          <h2 className="text-lg font-semibold mb-4">{t('dataExport.jobHistory')}</h2>
          <JobHistory />
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
