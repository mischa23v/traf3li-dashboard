import { useState, useCallback } from 'react'
import { useDropzone } from 'react-dropzone'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Checkbox } from '@/components/ui/checkbox'
import { Label } from '@/components/ui/label'
import { Progress } from '@/components/ui/progress'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { usePreviewImport, useStartImport, useImportStatus } from '@/hooks/useDataExport'
import { entityColumns, type EntityType } from '@/services/dataExportService'
import { entityTypes } from '../data/data'
import { useTranslation } from 'react-i18next'
import { Upload, FileUp, AlertCircle, CheckCircle2, X } from 'lucide-react'

interface ImportDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  defaultEntityType?: EntityType
}

type Step = 'upload' | 'preview' | 'mapping' | 'importing' | 'complete'

export function ImportDialog({
  open,
  onOpenChange,
  defaultEntityType = 'clients',
}: ImportDialogProps) {
  const { t, i18n } = useTranslation()
  const isRTL = i18n.language === 'ar'
  const previewImport = usePreviewImport()
  const startImport = useStartImport()

  const [step, setStep] = useState<Step>('upload')
  const [entityType, setEntityType] = useState<EntityType>(defaultEntityType)
  const [file, setFile] = useState<File | null>(null)
  const [mapping, setMapping] = useState<Record<string, string>>({})
  const [skipDuplicates, setSkipDuplicates] = useState(true)
  const [updateExisting, setUpdateExisting] = useState(false)
  const [importJobId, setImportJobId] = useState<string | null>(null)

  const { data: importStatus } = useImportStatus(importJobId || '', step === 'importing')

  const onDrop = useCallback(
    (acceptedFiles: File[]) => {
      if (acceptedFiles.length > 0) {
        const selectedFile = acceptedFiles[0]
        setFile(selectedFile)
        previewImport.mutate(
          { file: selectedFile, entityType },
          {
            onSuccess: (preview) => {
              // Auto-map columns based on suggestions
              setMapping(preview.suggestedMapping || {})
              setStep('preview')
            },
          }
        )
      }
    },
    [entityType, previewImport]
  )

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet': ['.xlsx'],
      'text/csv': ['.csv'],
      'application/json': ['.json'],
    },
    maxFiles: 1,
  })

  const handleStartImport = () => {
    if (!file) return

    startImport.mutate(
      {
        entityType,
        file,
        mapping,
        skipDuplicates,
        updateExisting,
      },
      {
        onSuccess: (job) => {
          setImportJobId(job._id)
          setStep('importing')
        },
      }
    )
  }

  const handleClose = () => {
    setStep('upload')
    setFile(null)
    setMapping({})
    setImportJobId(null)
    onOpenChange(false)
  }

  const columns = entityColumns[entityType] || []

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-hidden flex flex-col">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Upload className="h-5 w-5" />
            {t('dataExport.importData')}
          </DialogTitle>
          <DialogDescription>
            {t('dataExport.importDataDescription')}
          </DialogDescription>
        </DialogHeader>

        <div className="flex-1 overflow-y-auto py-4">
          {step === 'upload' && (
            <div className="space-y-4">
              {/* Entity Type Selection */}
              <div className="space-y-2">
                <Label>{t('dataExport.selectEntityType')}</Label>
                <Select value={entityType} onValueChange={(v) => setEntityType(v as EntityType)}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {entityTypes.map((entity) => (
                      <SelectItem key={entity.value} value={entity.value}>
                        <div className="flex items-center gap-2">
                          <entity.icon className="h-4 w-4" />
                          {isRTL ? entity.labelAr : entity.label}
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* File Upload Area */}
              <div
                {...getRootProps()}
                className={`border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-colors ${
                  isDragActive
                    ? 'border-primary bg-primary/5'
                    : 'border-border hover:border-primary/50'
                }`}
              >
                <input {...getInputProps()} />
                <FileUp className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                <p className="text-lg font-medium">
                  {isDragActive
                    ? t('dataExport.dropFileHere')
                    : t('dataExport.dragOrClickToUpload')}
                </p>
                <p className="text-sm text-muted-foreground mt-2">
                  {t('dataExport.supportedFormats')}
                </p>
              </div>
            </div>
          )}

          {step === 'preview' && previewImport.data && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium">{file?.name}</p>
                  <p className="text-sm text-muted-foreground">
                    {t('dataExport.rowsFound', { count: previewImport.data.totalRows })}
                  </p>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => {
                    setStep('upload')
                    setFile(null)
                  }}
                >
                  <X className="h-4 w-4 me-1" />
                  {t('common.change')}
                </Button>
              </div>

              {/* Column Mapping */}
              <div className="space-y-2">
                <Label>{t('dataExport.columnMapping')}</Label>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>{t('dataExport.fileColumn')}</TableHead>
                      <TableHead>{t('dataExport.mapsTo')}</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {previewImport.data.columns.map((column) => (
                      <TableRow key={column}>
                        <TableCell className="font-mono text-sm">{column}</TableCell>
                        <TableCell>
                          <Select
                            value={mapping[column] || ''}
                            onValueChange={(v) =>
                              setMapping({ ...mapping, [column]: v })
                            }
                          >
                            <SelectTrigger className="w-full">
                              <SelectValue placeholder={t('dataExport.selectField')} />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="">{t('dataExport.skip')}</SelectItem>
                              {columns.map((col) => (
                                <SelectItem key={col.field} value={col.field}>
                                  {isRTL ? col.labelAr : col.label}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>

              {/* Import Options */}
              <div className="space-y-3">
                <Label>{t('dataExport.importOptions')}</Label>
                <div className="flex flex-col gap-2">
                  <div className="flex items-center space-x-2 rtl:space-x-reverse">
                    <Checkbox
                      id="skipDuplicates"
                      checked={skipDuplicates}
                      onCheckedChange={(checked) => setSkipDuplicates(checked === true)}
                    />
                    <Label htmlFor="skipDuplicates" className="text-sm font-normal cursor-pointer">
                      {t('dataExport.skipDuplicates')}
                    </Label>
                  </div>
                  <div className="flex items-center space-x-2 rtl:space-x-reverse">
                    <Checkbox
                      id="updateExisting"
                      checked={updateExisting}
                      onCheckedChange={(checked) => setUpdateExisting(checked === true)}
                    />
                    <Label htmlFor="updateExisting" className="text-sm font-normal cursor-pointer">
                      {t('dataExport.updateExisting')}
                    </Label>
                  </div>
                </div>
              </div>
            </div>
          )}

          {step === 'importing' && importStatus && (
            <div className="space-y-6 text-center py-8">
              <div className="h-16 w-16 mx-auto rounded-full bg-primary/10 flex items-center justify-center">
                <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
              </div>
              <div>
                <p className="font-medium text-lg">{t('dataExport.importingData')}</p>
                <p className="text-muted-foreground">
                  {t('dataExport.processingRecords', {
                    current: importStatus.successCount + importStatus.errorCount,
                    total: importStatus.totalRecords,
                  })}
                </p>
              </div>
              <Progress value={importStatus.progress} className="w-full max-w-md mx-auto" />
            </div>
          )}

          {step === 'complete' && importStatus && (
            <div className="space-y-6 text-center py-8">
              <div
                className={`h-16 w-16 mx-auto rounded-full flex items-center justify-center ${
                  importStatus.status === 'completed'
                    ? 'bg-green-100 text-green-600'
                    : importStatus.status === 'partial'
                      ? 'bg-orange-100 text-orange-600'
                      : 'bg-red-100 text-red-600'
                }`}
              >
                {importStatus.status === 'completed' ? (
                  <CheckCircle2 className="h-8 w-8" />
                ) : (
                  <AlertCircle className="h-8 w-8" />
                )}
              </div>
              <div>
                <p className="font-medium text-lg">
                  {importStatus.status === 'completed'
                    ? t('dataExport.importComplete')
                    : importStatus.status === 'partial'
                      ? t('dataExport.importPartial')
                      : t('dataExport.importFailed')}
                </p>
                <div className="text-muted-foreground mt-2 space-y-1">
                  <p>
                    {t('dataExport.successfulRecords', { count: importStatus.successCount })}
                  </p>
                  {importStatus.errorCount > 0 && (
                    <p className="text-red-600">
                      {t('dataExport.failedRecords', { count: importStatus.errorCount })}
                    </p>
                  )}
                  {importStatus.skippedCount > 0 && (
                    <p>
                      {t('dataExport.skippedRecords', { count: importStatus.skippedCount })}
                    </p>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>

        <DialogFooter>
          {step === 'upload' && (
            <Button variant="outline" onClick={handleClose}>
              {t('common.cancel')}
            </Button>
          )}
          {step === 'preview' && (
            <>
              <Button variant="outline" onClick={() => setStep('upload')}>
                {t('common.back')}
              </Button>
              <Button onClick={handleStartImport} disabled={startImport.isPending}>
                {startImport.isPending ? t('dataExport.importing') : t('dataExport.startImport')}
              </Button>
            </>
          )}
          {(step === 'importing' || step === 'complete') && (
            <Button onClick={handleClose}>
              {step === 'complete' ? t('common.close') : t('common.cancel')}
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
