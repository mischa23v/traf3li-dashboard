import { useState } from 'react'
import { format } from 'date-fns'
import { ar, enUS } from 'date-fns/locale'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { useExportHistory, useImportHistory, useDownloadExport } from '@/hooks/useDataExport'
import { entityTypes, jobStatuses } from '../data/data'
import { useTranslation } from 'react-i18next'
import { Download, Upload, Loader2 } from 'lucide-react'

export function JobHistory() {
  const { t, i18n } = useTranslation()
  const isRTL = i18n.language === 'ar'
  const locale = isRTL ? ar : enUS
  const [activeTab, setActiveTab] = useState('exports')

  const { data: exports, isLoading: exportsLoading } = useExportHistory()
  const { data: imports, isLoading: importsLoading } = useImportHistory()
  const downloadExport = useDownloadExport()

  const getStatusBadge = (status: string) => {
    const statusConfig = jobStatuses.find((s) => s.value === status)
    if (!statusConfig) return null

    const variants: Record<string, 'default' | 'secondary' | 'destructive' | 'outline'> = {
      completed: 'default',
      failed: 'destructive',
      processing: 'secondary',
      pending: 'outline',
      partial: 'secondary',
    }

    return (
      <Badge variant={variants[status] || 'outline'}>
        {isRTL ? statusConfig.labelAr : statusConfig.label}
      </Badge>
    )
  }

  const getEntityLabel = (entityType: string) => {
    const entity = entityTypes.find((e) => e.value === entityType)
    return entity ? (isRTL ? entity.labelAr : entity.label) : entityType
  }

  const formatFileSize = (bytes?: number) => {
    if (!bytes) return '-'
    const sizes = ['B', 'KB', 'MB', 'GB']
    const i = Math.floor(Math.log(bytes) / Math.log(1024))
    return `${(bytes / Math.pow(1024, i)).toFixed(1)} ${sizes[i]}`
  }

  return (
    <div className="space-y-4">
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="exports" className="flex items-center gap-2">
            <Download className="h-4 w-4" aria-hidden="true" />
            {t('dataExport.exports')}
          </TabsTrigger>
          <TabsTrigger value="imports" className="flex items-center gap-2">
            <Upload className="h-4 w-4" aria-hidden="true" />
            {t('dataExport.imports')}
          </TabsTrigger>
        </TabsList>

        <TabsContent value="exports" className="mt-4">
          {exportsLoading ? (
            <div className="flex justify-center py-8">
              <Loader2 className="h-6 w-6 animate-spin" />
            </div>
          ) : (
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>{t('dataExport.entityType')}</TableHead>
                    <TableHead>{t('dataExport.format')}</TableHead>
                    <TableHead>{t('dataExport.records')}</TableHead>
                    <TableHead>{t('dataExport.fileSize')}</TableHead>
                    <TableHead>{t('common.status')}</TableHead>
                    <TableHead>{t('common.date')}</TableHead>
                    <TableHead></TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {exports?.length ? (
                    exports.map((job) => (
                      <TableRow key={job._id}>
                        <TableCell>{getEntityLabel(job.entityType)}</TableCell>
                        <TableCell className="uppercase">{job.format}</TableCell>
                        <TableCell>{job.totalRecords || '-'}</TableCell>
                        <TableCell>{formatFileSize(job.fileSize)}</TableCell>
                        <TableCell>{getStatusBadge(job.status)}</TableCell>
                        <TableCell>
                          {format(new Date(job.createdAt), 'PPp', { locale })}
                        </TableCell>
                        <TableCell>
                          {job.status === 'completed' && job.fileName && (
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() =>
                                downloadExport.mutate({
                                  jobId: job._id,
                                  fileName: job.fileName!,
                                })
                              }
                              disabled={downloadExport.isPending}
                            >
                              <Download className="h-4 w-4" aria-hidden="true" />
                            </Button>
                          )}
                        </TableCell>
                      </TableRow>
                    ))
                  ) : (
                    <TableRow>
                      <TableCell colSpan={7} className="text-center py-8 text-muted-foreground">
                        {t('dataExport.noExports')}
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </div>
          )}
        </TabsContent>

        <TabsContent value="imports" className="mt-4">
          {importsLoading ? (
            <div className="flex justify-center py-8">
              <Loader2 className="h-6 w-6 animate-spin" />
            </div>
          ) : (
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>{t('dataExport.entityType')}</TableHead>
                    <TableHead>{t('dataExport.totalRecords')}</TableHead>
                    <TableHead>{t('dataExport.successful')}</TableHead>
                    <TableHead>{t('dataExport.failed')}</TableHead>
                    <TableHead>{t('dataExport.skipped')}</TableHead>
                    <TableHead>{t('common.status')}</TableHead>
                    <TableHead>{t('common.date')}</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {imports?.length ? (
                    imports.map((job) => (
                      <TableRow key={job._id}>
                        <TableCell>{getEntityLabel(job.entityType)}</TableCell>
                        <TableCell>{job.totalRecords}</TableCell>
                        <TableCell className="text-green-600">{job.successCount}</TableCell>
                        <TableCell className="text-red-600">{job.errorCount}</TableCell>
                        <TableCell>{job.skippedCount}</TableCell>
                        <TableCell>{getStatusBadge(job.status)}</TableCell>
                        <TableCell>
                          {format(new Date(job.createdAt), 'PPp', { locale })}
                        </TableCell>
                      </TableRow>
                    ))
                  ) : (
                    <TableRow>
                      <TableCell colSpan={7} className="text-center py-8 text-muted-foreground">
                        {t('dataExport.noImports')}
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  )
}
