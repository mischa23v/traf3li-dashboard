import { useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Button } from '@/components/ui/button'
import { Switch } from '@/components/ui/switch'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { useCreateTemplate, useUpdateTemplate } from '@/hooks/useInvoiceTemplates'
import type { InvoiceTemplate } from '@/services/invoiceTemplatesService'
import { defaultTemplateSettings } from '@/services/invoiceTemplatesService'
import {
  templateTypes,
  fontFamilies,
  fontSizes,
  tableStyles,
  pageSizes,
  orientations,
  logoPositions,
  vatDisplayModes,
  templateColors,
} from '../data/data'
import { useTranslation } from 'react-i18next'

const formSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  nameAr: z.string().min(1, 'Arabic name is required'),
  description: z.string().optional(),
  descriptionAr: z.string().optional(),
  type: z.enum(['standard', 'detailed', 'summary', 'retainer', 'pro_bono', 'custom']),
  isDefault: z.boolean().default(false),
  isActive: z.boolean().default(true),
  // Header
  headerShowLogo: z.boolean(),
  headerLogoPosition: z.enum(['left', 'center', 'right']),
  headerShowCompanyInfo: z.boolean(),
  headerShowInvoiceNumber: z.boolean(),
  headerShowDate: z.boolean(),
  headerShowDueDate: z.boolean(),
  // Styling
  stylingPrimaryColor: z.string(),
  stylingFontFamily: z.enum(['cairo', 'tajawal', 'arial', 'times']),
  stylingFontSize: z.enum(['small', 'medium', 'large']),
  stylingTableStyle: z.enum(['striped', 'bordered', 'minimal']),
  stylingPageSize: z.enum(['a4', 'letter']),
  stylingOrientation: z.enum(['portrait', 'landscape']),
  // Numbering
  numberingPrefix: z.string(),
  numberingSuffix: z.string(),
  numberingDigits: z.coerce.number().min(1).max(10),
  numberingIncludeYear: z.boolean(),
  numberingIncludeMonth: z.boolean(),
  // Tax
  taxVatRate: z.coerce.number().min(0).max(100),
  taxIncludeVatNumber: z.boolean(),
  taxVatDisplayMode: z.enum(['inclusive', 'exclusive', 'none']),
})

type FormValues = z.infer<typeof formSchema>

interface TemplateActionDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  currentTemplate?: InvoiceTemplate | null
}

export function TemplateActionDialog({
  open,
  onOpenChange,
  currentTemplate,
}: TemplateActionDialogProps) {
  const { t, i18n } = useTranslation()
  const isRTL = i18n.language === 'ar'
  const isEdit = !!currentTemplate

  const createTemplate = useCreateTemplate()
  const updateTemplate = useUpdateTemplate()

  const getDefaultValues = (): FormValues => {
    const defaults = defaultTemplateSettings
    return {
      name: '',
      nameAr: '',
      description: '',
      descriptionAr: '',
      type: defaults.type,
      isDefault: defaults.isDefault,
      isActive: defaults.isActive,
      headerShowLogo: defaults.header.showLogo,
      headerLogoPosition: defaults.header.logoPosition,
      headerShowCompanyInfo: defaults.header.showCompanyInfo,
      headerShowInvoiceNumber: defaults.header.showInvoiceNumber,
      headerShowDate: defaults.header.showDate,
      headerShowDueDate: defaults.header.showDueDate,
      stylingPrimaryColor: defaults.styling.primaryColor,
      stylingFontFamily: defaults.styling.fontFamily,
      stylingFontSize: defaults.styling.fontSize,
      stylingTableStyle: defaults.styling.tableStyle,
      stylingPageSize: defaults.styling.pageSize,
      stylingOrientation: defaults.styling.orientation,
      numberingPrefix: defaults.numberingFormat.prefix,
      numberingSuffix: defaults.numberingFormat.suffix,
      numberingDigits: defaults.numberingFormat.digits,
      numberingIncludeYear: defaults.numberingFormat.includeYear,
      numberingIncludeMonth: defaults.numberingFormat.includeMonth,
      taxVatRate: defaults.taxSettings.vatRate,
      taxIncludeVatNumber: defaults.taxSettings.includeVatNumber,
      taxVatDisplayMode: defaults.taxSettings.vatDisplayMode,
    }
  }

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema) as any,
    defaultValues: getDefaultValues(),
  })

  useEffect(() => {
    if (currentTemplate) {
      form.reset({
        name: currentTemplate.name,
        nameAr: currentTemplate.nameAr,
        description: currentTemplate.description || '',
        descriptionAr: currentTemplate.descriptionAr || '',
        type: currentTemplate.type,
        isDefault: currentTemplate.isDefault,
        isActive: currentTemplate.isActive,
        headerShowLogo: currentTemplate.header.showLogo,
        headerLogoPosition: currentTemplate.header.logoPosition,
        headerShowCompanyInfo: currentTemplate.header.showCompanyInfo,
        headerShowInvoiceNumber: currentTemplate.header.showInvoiceNumber,
        headerShowDate: currentTemplate.header.showDate,
        headerShowDueDate: currentTemplate.header.showDueDate,
        stylingPrimaryColor: currentTemplate.styling.primaryColor,
        stylingFontFamily: currentTemplate.styling.fontFamily,
        stylingFontSize: currentTemplate.styling.fontSize,
        stylingTableStyle: currentTemplate.styling.tableStyle,
        stylingPageSize: currentTemplate.styling.pageSize,
        stylingOrientation: currentTemplate.styling.orientation,
        numberingPrefix: currentTemplate.numberingFormat.prefix,
        numberingSuffix: currentTemplate.numberingFormat.suffix,
        numberingDigits: currentTemplate.numberingFormat.digits,
        numberingIncludeYear: currentTemplate.numberingFormat.includeYear,
        numberingIncludeMonth: currentTemplate.numberingFormat.includeMonth,
        taxVatRate: currentTemplate.taxSettings.vatRate,
        taxIncludeVatNumber: currentTemplate.taxSettings.includeVatNumber,
        taxVatDisplayMode: currentTemplate.taxSettings.vatDisplayMode,
      })
    } else {
      form.reset(getDefaultValues())
    }
  }, [currentTemplate, form])

  const onSubmit = (values: FormValues) => {
    const data = {
      name: values.name,
      nameAr: values.nameAr,
      description: values.description,
      descriptionAr: values.descriptionAr,
      type: values.type,
      isDefault: values.isDefault,
      isActive: values.isActive,
      header: {
        showLogo: values.headerShowLogo,
        logoPosition: values.headerLogoPosition,
        showCompanyInfo: values.headerShowCompanyInfo,
        showInvoiceNumber: values.headerShowInvoiceNumber,
        showDate: values.headerShowDate,
        showDueDate: values.headerShowDueDate,
      },
      styling: {
        primaryColor: values.stylingPrimaryColor,
        accentColor: values.stylingPrimaryColor,
        fontFamily: values.stylingFontFamily,
        fontSize: values.stylingFontSize,
        tableStyle: values.stylingTableStyle,
        pageSize: values.stylingPageSize,
        orientation: values.stylingOrientation,
      },
      numberingFormat: {
        prefix: values.numberingPrefix,
        suffix: values.numberingSuffix,
        digits: values.numberingDigits,
        startFrom: 1,
        includeYear: values.numberingIncludeYear,
        includeMonth: values.numberingIncludeMonth,
        separator: '-',
      },
      taxSettings: {
        vatRate: values.taxVatRate,
        includeVatNumber: values.taxIncludeVatNumber,
        vatDisplayMode: values.taxVatDisplayMode,
      },
    }

    if (isEdit && currentTemplate) {
      updateTemplate.mutate(
        { id: currentTemplate._id, data },
        { onSuccess: () => onOpenChange(false) }
      )
    } else {
      createTemplate.mutate(data, { onSuccess: () => onOpenChange(false) })
    }
  }

  const isPending = createTemplate.isPending || updateTemplate.isPending

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {isEdit ? t('invoiceTemplates.editTemplate') : t('invoiceTemplates.addTemplate')}
          </DialogTitle>
          <DialogDescription>
            {isEdit
              ? t('invoiceTemplates.editTemplateDescription')
              : t('invoiceTemplates.addTemplateDescription')}
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <Tabs defaultValue="basic" className="w-full">
              <TabsList className="grid w-full grid-cols-4">
                <TabsTrigger value="basic">{t('invoiceTemplates.basicInfo')}</TabsTrigger>
                <TabsTrigger value="header">{t('invoiceTemplates.header')}</TabsTrigger>
                <TabsTrigger value="styling">{t('invoiceTemplates.styling')}</TabsTrigger>
                <TabsTrigger value="settings">{t('invoiceTemplates.settings')}</TabsTrigger>
              </TabsList>

              <TabsContent value="basic" className="space-y-4 mt-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="name"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>{t('invoiceTemplates.nameEn')}</FormLabel>
                        <FormControl>
                          <Input placeholder="Standard Invoice" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="nameAr"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>{t('invoiceTemplates.nameAr')}</FormLabel>
                        <FormControl>
                          <Input placeholder="فاتورة قياسية" dir="rtl" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <FormField
                  control={form.control}
                  name="type"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>{t('invoiceTemplates.type')}</FormLabel>
                      <Select onValueChange={field.onChange} value={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder={t('invoiceTemplates.selectType')} />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {templateTypes.map((type) => (
                            <SelectItem key={type.value} value={type.value}>
                              <div className="flex items-center gap-2">
                                <type.icon className="h-4 w-4" />
                                {isRTL ? type.labelAr : type.label}
                              </div>
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="description"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>{t('invoiceTemplates.descriptionEn')}</FormLabel>
                        <FormControl>
                          <Textarea
                            placeholder="Template description..."
                            className="resize-none"
                            rows={2}
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="descriptionAr"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>{t('invoiceTemplates.descriptionAr')}</FormLabel>
                        <FormControl>
                          <Textarea
                            placeholder="وصف القالب..."
                            className="resize-none"
                            dir="rtl"
                            rows={2}
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="isDefault"
                    render={({ field }) => (
                      <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                        <div className="space-y-0.5">
                          <FormLabel className="text-base">
                            {t('invoiceTemplates.setAsDefault')}
                          </FormLabel>
                          <FormDescription className="text-xs">
                            {t('invoiceTemplates.setAsDefaultDescription')}
                          </FormDescription>
                        </div>
                        <FormControl>
                          <Switch checked={field.value} onCheckedChange={field.onChange} />
                        </FormControl>
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="isActive"
                    render={({ field }) => (
                      <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                        <div className="space-y-0.5">
                          <FormLabel className="text-base">{t('common.active')}</FormLabel>
                          <FormDescription className="text-xs">
                            {t('invoiceTemplates.activeDescription')}
                          </FormDescription>
                        </div>
                        <FormControl>
                          <Switch checked={field.value} onCheckedChange={field.onChange} />
                        </FormControl>
                      </FormItem>
                    )}
                  />
                </div>
              </TabsContent>

              <TabsContent value="header" className="space-y-4 mt-4">
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                  <FormField
                    control={form.control}
                    name="headerShowLogo"
                    render={({ field }) => (
                      <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                        <FormLabel>{t('invoiceTemplates.showLogo')}</FormLabel>
                        <FormControl>
                          <Switch checked={field.value} onCheckedChange={field.onChange} />
                        </FormControl>
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="headerShowCompanyInfo"
                    render={({ field }) => (
                      <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                        <FormLabel>{t('invoiceTemplates.showCompanyInfo')}</FormLabel>
                        <FormControl>
                          <Switch checked={field.value} onCheckedChange={field.onChange} />
                        </FormControl>
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="headerShowInvoiceNumber"
                    render={({ field }) => (
                      <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                        <FormLabel>{t('invoiceTemplates.showInvoiceNumber')}</FormLabel>
                        <FormControl>
                          <Switch checked={field.value} onCheckedChange={field.onChange} />
                        </FormControl>
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="headerShowDate"
                    render={({ field }) => (
                      <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                        <FormLabel>{t('invoiceTemplates.showDate')}</FormLabel>
                        <FormControl>
                          <Switch checked={field.value} onCheckedChange={field.onChange} />
                        </FormControl>
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="headerShowDueDate"
                    render={({ field }) => (
                      <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                        <FormLabel>{t('invoiceTemplates.showDueDate')}</FormLabel>
                        <FormControl>
                          <Switch checked={field.value} onCheckedChange={field.onChange} />
                        </FormControl>
                      </FormItem>
                    )}
                  />
                </div>

                <FormField
                  control={form.control}
                  name="headerLogoPosition"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>{t('invoiceTemplates.logoPosition')}</FormLabel>
                      <Select onValueChange={field.onChange} value={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {logoPositions.map((pos) => (
                            <SelectItem key={pos.value} value={pos.value}>
                              {isRTL ? pos.labelAr : pos.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </TabsContent>

              <TabsContent value="styling" className="space-y-4 mt-4">
                <FormField
                  control={form.control}
                  name="stylingPrimaryColor"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>{t('invoiceTemplates.primaryColor')}</FormLabel>
                      <div className="flex flex-wrap gap-2">
                        {templateColors.map((color) => (
                          <button
                            key={color.value}
                            type="button"
                            className={`w-8 h-8 rounded-full border-2 transition-all ${
                              field.value === color.value
                                ? 'border-foreground scale-110'
                                : 'border-transparent'
                            }`}
                            style={{ backgroundColor: color.value }}
                            onClick={() => field.onChange(color.value)}
                            title={isRTL ? color.labelAr : color.label}
                          />
                        ))}
                      </div>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <FormField
                    control={form.control}
                    name="stylingFontFamily"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>{t('invoiceTemplates.fontFamily')}</FormLabel>
                        <Select onValueChange={field.onChange} value={field.value}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {fontFamilies.map((font) => (
                              <SelectItem key={font.value} value={font.value}>
                                {font.label}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="stylingFontSize"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>{t('invoiceTemplates.fontSize')}</FormLabel>
                        <Select onValueChange={field.onChange} value={field.value}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {fontSizes.map((size) => (
                              <SelectItem key={size.value} value={size.value}>
                                {isRTL ? size.labelAr : size.label}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="stylingTableStyle"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>{t('invoiceTemplates.tableStyle')}</FormLabel>
                        <Select onValueChange={field.onChange} value={field.value}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {tableStyles.map((style) => (
                              <SelectItem key={style.value} value={style.value}>
                                {isRTL ? style.labelAr : style.label}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="stylingPageSize"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>{t('invoiceTemplates.pageSize')}</FormLabel>
                        <Select onValueChange={field.onChange} value={field.value}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {pageSizes.map((size) => (
                              <SelectItem key={size.value} value={size.value}>
                                {size.label}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="stylingOrientation"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>{t('invoiceTemplates.orientation')}</FormLabel>
                        <Select onValueChange={field.onChange} value={field.value}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {orientations.map((orient) => (
                              <SelectItem key={orient.value} value={orient.value}>
                                {isRTL ? orient.labelAr : orient.label}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              </TabsContent>

              <TabsContent value="settings" className="space-y-4 mt-4">
                <div className="space-y-4">
                  <h4 className="font-medium">{t('invoiceTemplates.invoiceNumbering')}</h4>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <FormField
                      control={form.control}
                      name="numberingPrefix"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>{t('invoiceTemplates.prefix')}</FormLabel>
                          <FormControl>
                            <Input placeholder="INV-" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="numberingSuffix"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>{t('invoiceTemplates.suffix')}</FormLabel>
                          <FormControl>
                            <Input placeholder="" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="numberingDigits"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>{t('invoiceTemplates.digits')}</FormLabel>
                          <FormControl>
                            <Input type="number" min={1} max={10} {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                  <div className="flex gap-4">
                    <FormField
                      control={form.control}
                      name="numberingIncludeYear"
                      render={({ field }) => (
                        <FormItem className="flex items-center gap-2">
                          <FormControl>
                            <Switch checked={field.value} onCheckedChange={field.onChange} />
                          </FormControl>
                          <FormLabel>{t('invoiceTemplates.includeYear')}</FormLabel>
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="numberingIncludeMonth"
                      render={({ field }) => (
                        <FormItem className="flex items-center gap-2">
                          <FormControl>
                            <Switch checked={field.value} onCheckedChange={field.onChange} />
                          </FormControl>
                          <FormLabel>{t('invoiceTemplates.includeMonth')}</FormLabel>
                        </FormItem>
                      )}
                    />
                  </div>
                </div>

                <div className="space-y-4">
                  <h4 className="font-medium">{t('invoiceTemplates.taxSettings')}</h4>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <FormField
                      control={form.control}
                      name="taxVatRate"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>{t('invoiceTemplates.vatRate')}</FormLabel>
                          <FormControl>
                            <div className="relative">
                              <Input type="number" min={0} max={100} {...field} />
                              <span className="absolute end-3 top-1/2 -translate-y-1/2 text-muted-foreground">
                                %
                              </span>
                            </div>
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="taxVatDisplayMode"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>{t('invoiceTemplates.vatDisplayMode')}</FormLabel>
                          <Select onValueChange={field.onChange} value={field.value}>
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              {vatDisplayModes.map((mode) => (
                                <SelectItem key={mode.value} value={mode.value}>
                                  {isRTL ? mode.labelAr : mode.label}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="taxIncludeVatNumber"
                      render={({ field }) => (
                        <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                          <FormLabel>{t('invoiceTemplates.includeVatNumber')}</FormLabel>
                          <FormControl>
                            <Switch checked={field.value} onCheckedChange={field.onChange} />
                          </FormControl>
                        </FormItem>
                      )}
                    />
                  </div>
                </div>
              </TabsContent>
            </Tabs>

            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
                {t('common.cancel')}
              </Button>
              <Button type="submit" disabled={isPending}>
                {isPending
                  ? t('common.saving')
                  : isEdit
                    ? t('common.saveChanges')
                    : t('common.create')}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  )
}
