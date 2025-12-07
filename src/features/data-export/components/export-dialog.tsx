import { useState } from 'react'
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
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Separator } from '@/components/ui/separator'
import { useStartExport } from '@/hooks/useDataExport'
import { entityColumns, type EntityType, type ExportFormat } from '@/services/dataExportService'
import { entityTypes, exportFormats } from '../data/data'
import { useTranslation } from 'react-i18next'
import { Download, FileSpreadsheet, FileText, FileJson } from 'lucide-react'

interface ExportDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  defaultEntityType?: EntityType
}

export function ExportDialog({
  open,
  onOpenChange,
  defaultEntityType = 'clients',
}: ExportDialogProps) {
  const { t, i18n } = useTranslation()
  const isRTL = i18n.language === 'ar'
  const startExport = useStartExport()

  const [entityType, setEntityType] = useState<EntityType>(defaultEntityType)
  const [format, setFormat] = useState<ExportFormat>('xlsx')
  const [selectedColumns, setSelectedColumns] = useState<string[]>([])
  const [includeRelated, setIncludeRelated] = useState(false)

  const columns = entityColumns[entityType] || []

  const handleSelectAll = () => {
    if (selectedColumns.length === columns.length) {
      setSelectedColumns([])
    } else {
      setSelectedColumns(columns.map((c) => c.field))
    }
  }

  const handleColumnToggle = (field: string) => {
    if (selectedColumns.includes(field)) {
      setSelectedColumns(selectedColumns.filter((c) => c !== field))
    } else {
      setSelectedColumns([...selectedColumns, field])
    }
  }

  const handleExport = () => {
    startExport.mutate(
      {
        entityType,
        format,
        columns: selectedColumns.length > 0 ? selectedColumns : undefined,
        includeRelated,
        language: isRTL ? 'ar' : 'en',
      },
      {
        onSuccess: () => {
          onOpenChange(false)
        },
      }
    )
  }

  const getFormatIcon = (fmt: ExportFormat) => {
    switch (fmt) {
      case 'xlsx':
        return FileSpreadsheet
      case 'csv':
        return FileText
      case 'pdf':
        return FileText
      case 'json':
        return FileJson
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-hidden flex flex-col">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Download className="h-5 w-5" aria-hidden="true" />
            {t('dataExport.exportData')}
          </DialogTitle>
          <DialogDescription>
            {t('dataExport.exportDataDescription')}
          </DialogDescription>
        </DialogHeader>

        <div className="flex-1 overflow-y-auto space-y-6 py-4">
          {/* Entity Type Selection */}
          <div className="space-y-3">
            <Label>{t('dataExport.selectEntityType')}</Label>
            <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
              {entityTypes.map((entity) => {
                const EntityIcon = entity.icon
                const isSelected = entityType === entity.value
                return (
                  <button
                    key={entity.value}
                    type="button"
                    onClick={() => {
                      setEntityType(entity.value)
                      setSelectedColumns([])
                    }}
                    className={`flex flex-col items-center p-3 rounded-lg border transition-all ${
                      isSelected
                        ? 'border-primary bg-primary/5'
                        : 'border-border hover:border-primary/50'
                    }`}
                  >
                    <EntityIcon className={`h-5 w-5 mb-1 ${isSelected ? 'text-primary' : ''}`} />
                    <span className="text-xs">{isRTL ? entity.labelAr : entity.label}</span>
                  </button>
                )
              })}
            </div>
          </div>

          <Separator />

          {/* Format Selection */}
          <div className="space-y-3">
            <Label>{t('dataExport.selectFormat')}</Label>
            <RadioGroup value={format} onValueChange={(v) => setFormat(v as ExportFormat)}>
              <div className="grid grid-cols-2 gap-3">
                {exportFormats.map((fmt) => {
                  const FormatIcon = getFormatIcon(fmt.value)
                  return (
                    <div
                      key={fmt.value}
                      className={`flex items-start gap-3 p-3 rounded-lg border cursor-pointer transition-all ${
                        format === fmt.value
                          ? 'border-primary bg-primary/5'
                          : 'border-border hover:border-primary/50'
                      }`}
                      onClick={() => setFormat(fmt.value)}
                    >
                      <RadioGroupItem value={fmt.value} id={fmt.value} />
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <FormatIcon className="h-4 w-4" />
                          <Label htmlFor={fmt.value} className="font-medium cursor-pointer">
                            {isRTL ? fmt.labelAr : fmt.label}
                          </Label>
                        </div>
                        <p className="text-xs text-muted-foreground mt-1">
                          {isRTL ? fmt.descriptionAr : fmt.description}
                        </p>
                      </div>
                    </div>
                  )
                })}
              </div>
            </RadioGroup>
          </div>

          <Separator />

          {/* Column Selection */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <Label>{t('dataExport.selectColumns')}</Label>
              <Button variant="ghost" size="sm" onClick={handleSelectAll}>
                {selectedColumns.length === columns.length
                  ? t('dataExport.deselectAll')
                  : t('dataExport.selectAll')}
              </Button>
            </div>
            <ScrollArea className="h-40 rounded-md border p-3">
              <div className="grid grid-cols-2 gap-2">
                {columns.map((column) => (
                  <div key={column.field} className="flex items-center gap-2 rtl:gap-reverse">
                    <Checkbox
                      id={column.field}
                      checked={
                        selectedColumns.length === 0 || selectedColumns.includes(column.field)
                      }
                      onCheckedChange={() => handleColumnToggle(column.field)}
                    />
                    <Label htmlFor={column.field} className="text-sm font-normal cursor-pointer">
                      {isRTL ? column.labelAr : column.label}
                    </Label>
                  </div>
                ))}
              </div>
            </ScrollArea>
            <p className="text-xs text-muted-foreground">
              {selectedColumns.length === 0
                ? t('dataExport.allColumnsSelected')
                : t('dataExport.columnsSelected', { count: selectedColumns.length })}
            </p>
          </div>

          <Separator />

          {/* Additional Options */}
          <div className="space-y-3">
            <Label>{t('dataExport.additionalOptions')}</Label>
            <div className="flex items-center gap-2 rtl:gap-reverse">
              <Checkbox
                id="includeRelated"
                checked={includeRelated}
                onCheckedChange={(checked) => setIncludeRelated(checked === true)}
              />
              <Label htmlFor="includeRelated" className="text-sm font-normal cursor-pointer">
                {t('dataExport.includeRelatedData')}
              </Label>
            </div>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            {t('common.cancel')}
          </Button>
          <Button onClick={handleExport} disabled={startExport.isPending}>
            {startExport.isPending ? (
              <>
                <div className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent me-2" />
                {t('dataExport.exporting')}
              </>
            ) : (
              <>
                <Download className="h-4 w-4 me-2" aria-hidden="true" />
                {t('dataExport.startExport')}
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
