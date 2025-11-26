import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import type { InvoiceTemplate } from '@/services/invoiceTemplatesService'
import { templateTypes, fontFamilies, vatDisplayModes } from '../data/data'
import { useTranslation } from 'react-i18next'
import { Check, X } from 'lucide-react'

interface TemplateViewDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  currentTemplate: InvoiceTemplate | null
}

export function TemplateViewDialog({
  open,
  onOpenChange,
  currentTemplate,
}: TemplateViewDialogProps) {
  const { t, i18n } = useTranslation()
  const isRTL = i18n.language === 'ar'

  if (!currentTemplate) return null

  const templateType = templateTypes.find((type) => type.value === currentTemplate.type)
  const fontFamily = fontFamilies.find((f) => f.value === currentTemplate.styling.fontFamily)
  const vatMode = vatDisplayModes.find((v) => v.value === currentTemplate.taxSettings.vatDisplayMode)
  const TypeIcon = templateType?.icon

  const BooleanIcon = ({ value }: { value: boolean }) =>
    value ? (
      <Check className="h-4 w-4 text-green-500" />
    ) : (
      <X className="h-4 w-4 text-muted-foreground" />
    )

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            {TypeIcon && <TypeIcon className="h-5 w-5" />}
            {isRTL ? currentTemplate.nameAr : currentTemplate.name}
            <Badge variant={currentTemplate.isActive ? 'default' : 'secondary'}>
              {currentTemplate.isActive ? t('common.active') : t('common.inactive')}
            </Badge>
            {currentTemplate.isDefault && (
              <Badge variant="outline" className="bg-green-50">
                {t('common.default')}
              </Badge>
            )}
          </DialogTitle>
          <DialogDescription>
            {isRTL ? currentTemplate.descriptionAr : currentTemplate.description}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {/* Type and Color */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-sm text-muted-foreground">{t('invoiceTemplates.type')}</p>
              <p className="font-medium">{isRTL ? templateType?.labelAr : templateType?.label}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">{t('invoiceTemplates.primaryColor')}</p>
              <div className="flex items-center gap-2">
                <div
                  className="h-5 w-5 rounded-full border"
                  style={{ backgroundColor: currentTemplate.styling.primaryColor }}
                />
                <span className="font-mono text-sm">{currentTemplate.styling.primaryColor}</span>
              </div>
            </div>
          </div>

          <Separator />

          {/* Header Settings */}
          <div>
            <h4 className="font-medium mb-2">{t('invoiceTemplates.header')}</h4>
            <div className="grid grid-cols-3 gap-2 text-sm">
              <div className="flex items-center gap-2">
                <BooleanIcon value={currentTemplate.header.showLogo} />
                <span>{t('invoiceTemplates.showLogo')}</span>
              </div>
              <div className="flex items-center gap-2">
                <BooleanIcon value={currentTemplate.header.showCompanyInfo} />
                <span>{t('invoiceTemplates.showCompanyInfo')}</span>
              </div>
              <div className="flex items-center gap-2">
                <BooleanIcon value={currentTemplate.header.showInvoiceNumber} />
                <span>{t('invoiceTemplates.showInvoiceNumber')}</span>
              </div>
              <div className="flex items-center gap-2">
                <BooleanIcon value={currentTemplate.header.showDate} />
                <span>{t('invoiceTemplates.showDate')}</span>
              </div>
              <div className="flex items-center gap-2">
                <BooleanIcon value={currentTemplate.header.showDueDate} />
                <span>{t('invoiceTemplates.showDueDate')}</span>
              </div>
            </div>
          </div>

          <Separator />

          {/* Styling */}
          <div>
            <h4 className="font-medium mb-2">{t('invoiceTemplates.styling')}</h4>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <span className="text-muted-foreground">{t('invoiceTemplates.fontFamily')}:</span>{' '}
                {fontFamily?.label}
              </div>
              <div>
                <span className="text-muted-foreground">{t('invoiceTemplates.fontSize')}:</span>{' '}
                {currentTemplate.styling.fontSize}
              </div>
              <div>
                <span className="text-muted-foreground">{t('invoiceTemplates.tableStyle')}:</span>{' '}
                {currentTemplate.styling.tableStyle}
              </div>
              <div>
                <span className="text-muted-foreground">{t('invoiceTemplates.pageSize')}:</span>{' '}
                {currentTemplate.styling.pageSize.toUpperCase()} ({currentTemplate.styling.orientation})
              </div>
            </div>
          </div>

          <Separator />

          {/* Numbering */}
          <div>
            <h4 className="font-medium mb-2">{t('invoiceTemplates.invoiceNumbering')}</h4>
            <div className="bg-muted p-3 rounded-md font-mono text-sm">
              {currentTemplate.numberingFormat.prefix}
              {currentTemplate.numberingFormat.includeYear && '2024'}
              {currentTemplate.numberingFormat.includeYear && currentTemplate.numberingFormat.separator}
              {currentTemplate.numberingFormat.includeMonth && '01'}
              {currentTemplate.numberingFormat.includeMonth && currentTemplate.numberingFormat.separator}
              {'0'.repeat(currentTemplate.numberingFormat.digits - 1)}1
              {currentTemplate.numberingFormat.suffix}
            </div>
          </div>

          <Separator />

          {/* Tax Settings */}
          <div>
            <h4 className="font-medium mb-2">{t('invoiceTemplates.taxSettings')}</h4>
            <div className="grid grid-cols-3 gap-4 text-sm">
              <div>
                <span className="text-muted-foreground">{t('invoiceTemplates.vatRate')}:</span>{' '}
                {currentTemplate.taxSettings.vatRate}%
              </div>
              <div>
                <span className="text-muted-foreground">{t('invoiceTemplates.vatDisplayMode')}:</span>{' '}
                {isRTL ? vatMode?.labelAr : vatMode?.label}
              </div>
              <div className="flex items-center gap-2">
                <BooleanIcon value={currentTemplate.taxSettings.includeVatNumber} />
                <span>{t('invoiceTemplates.includeVatNumber')}</span>
              </div>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
