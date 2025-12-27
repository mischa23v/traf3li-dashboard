import { useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog'
import { Form, FormField, FormItem, FormLabel, FormControl, FormMessage } from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from '@/components/ui/select'
import { Textarea } from '@/components/ui/textarea'
import { Switch } from '@/components/ui/switch'
import { Button } from '@/components/ui/button'
import { DatePicker } from '@/components/date-picker'
import { useTranslation } from 'react-i18next'
import { Loader2 } from 'lucide-react'
import { cn } from '@/lib/utils'

// Field type definitions
type FieldType = 'text' | 'number' | 'email' | 'tel' | 'textarea' | 'select' | 'date' | 'switch' | 'currency'

interface SelectOption {
  value: string
  label: string
  labelAr?: string
}

interface FormFieldConfig {
  name: string
  type: FieldType
  label: string
  labelAr?: string
  placeholder?: string
  placeholderAr?: string
  required?: boolean
  disabled?: boolean
  options?: SelectOption[] // For select fields
  min?: number // For number fields
  max?: number
  step?: number
  rows?: number // For textarea
  defaultValue?: any
  colSpan?: 1 | 2 // Grid column span
  description?: string
  descriptionAr?: string
}

interface FormSectionConfig {
  title?: string
  titleAr?: string
  fields: FormFieldConfig[]
  columns?: 1 | 2
}

interface GenericFormDialogProps<T extends z.ZodObject<any>> {
  open: boolean
  onOpenChange: (open: boolean) => void
  title: string
  titleAr?: string
  description?: string
  descriptionAr?: string
  schema: T
  sections: FormSectionConfig[]
  defaultValues?: Partial<z.infer<T>>
  onSubmit: (data: z.infer<T>) => Promise<void> | void
  isLoading?: boolean
  mode?: 'create' | 'edit'
  submitLabel?: string
  submitLabelAr?: string
  cancelLabel?: string
  cancelLabelAr?: string
  maxWidth?: 'sm' | 'md' | 'lg' | 'xl' | '2xl' | '3xl'
}

export function GenericFormDialog<T extends z.ZodObject<any>>({
  open,
  onOpenChange,
  title,
  titleAr,
  description,
  descriptionAr,
  schema,
  sections,
  defaultValues,
  onSubmit,
  isLoading = false,
  mode = 'create',
  submitLabel,
  submitLabelAr,
  cancelLabel,
  cancelLabelAr,
  maxWidth = '2xl',
}: GenericFormDialogProps<T>) {
  const { t, i18n } = useTranslation()
  const isArabic = i18n.language === 'ar'

  const form = useForm<z.infer<T>>({
    resolver: zodResolver(schema),
    defaultValues: defaultValues as any,
  })

  // Reset form when dialog opens/closes or defaultValues change
  useEffect(() => {
    if (open && defaultValues) {
      form.reset(defaultValues as any)
    } else if (!open) {
      form.reset()
    }
  }, [open, defaultValues, form])

  const handleSubmit = async (data: z.infer<T>) => {
    try {
      await onSubmit(data)
      form.reset()
      onOpenChange(false)
    } catch (error) {
      // Error handling is expected to be done in the onSubmit callback
      console.error('Form submission error:', error)
    }
  }

  const renderField = (field: FormFieldConfig) => {
    const label = isArabic && field.labelAr ? field.labelAr : field.label
    const placeholder = isArabic && field.placeholderAr ? field.placeholderAr : field.placeholder
    const description = isArabic && field.descriptionAr ? field.descriptionAr : field.description

    return (
      <FormField
        key={field.name}
        control={form.control}
        name={field.name as any}
        render={({ field: formField }) => (
          <FormItem className={cn(field.colSpan === 2 ? 'col-span-2' : '')}>
            <FormLabel>
              {label}
              {field.required && <span className="text-red-500 ms-1">*</span>}
            </FormLabel>
            <FormControl>
              {/* Text input */}
              {field.type === 'text' && (
                <Input
                  {...formField}
                  placeholder={placeholder}
                  disabled={field.disabled}
                  className="h-11 rounded-xl"
                />
              )}

              {/* Number input */}
              {field.type === 'number' && (
                <Input
                  {...formField}
                  type="number"
                  placeholder={placeholder}
                  min={field.min}
                  max={field.max}
                  step={field.step}
                  disabled={field.disabled}
                  className="h-11 rounded-xl"
                  onChange={(e) => {
                    const value = e.target.value ? parseFloat(e.target.value) : undefined
                    formField.onChange(value)
                  }}
                  value={formField.value || ''}
                />
              )}

              {/* Email input */}
              {field.type === 'email' && (
                <Input
                  {...formField}
                  type="email"
                  placeholder={placeholder}
                  disabled={field.disabled}
                  className="h-11 rounded-xl"
                  dir="ltr"
                />
              )}

              {/* Tel input */}
              {field.type === 'tel' && (
                <Input
                  {...formField}
                  type="tel"
                  placeholder={placeholder}
                  disabled={field.disabled}
                  className="h-11 rounded-xl"
                  dir="ltr"
                />
              )}

              {/* Textarea */}
              {field.type === 'textarea' && (
                <Textarea
                  {...formField}
                  placeholder={placeholder}
                  rows={field.rows || 3}
                  disabled={field.disabled}
                  className="rounded-xl"
                />
              )}

              {/* Select */}
              {field.type === 'select' && field.options && (
                <Select
                  onValueChange={formField.onChange}
                  value={formField.value}
                  disabled={field.disabled}
                >
                  <SelectTrigger className="h-11 rounded-xl">
                    <SelectValue placeholder={placeholder} />
                  </SelectTrigger>
                  <SelectContent>
                    {field.options.map((opt) => (
                      <SelectItem key={opt.value} value={opt.value}>
                        {isArabic && opt.labelAr ? opt.labelAr : opt.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}

              {/* Date picker */}
              {field.type === 'date' && (
                <DatePicker
                  value={formField.value}
                  onChange={formField.onChange}
                  disabled={field.disabled}
                />
              )}

              {/* Switch */}
              {field.type === 'switch' && (
                <div className="flex items-center space-x-2 space-x-reverse pt-2">
                  <Switch
                    checked={formField.value}
                    onCheckedChange={formField.onChange}
                    disabled={field.disabled}
                  />
                </div>
              )}

              {/* Currency input */}
              {field.type === 'currency' && (
                <div className="relative">
                  <Input
                    {...formField}
                    type="number"
                    placeholder={placeholder}
                    min={field.min}
                    max={field.max}
                    step={field.step || 0.01}
                    disabled={field.disabled}
                    className={cn(
                      'h-11 rounded-xl',
                      isArabic ? 'pl-16' : 'pr-16'
                    )}
                    onChange={(e) => {
                      const value = e.target.value ? parseFloat(e.target.value) : undefined
                      formField.onChange(value)
                    }}
                    value={formField.value || ''}
                  />
                  <span
                    className={cn(
                      'absolute top-1/2 -translate-y-1/2 text-sm text-muted-foreground font-medium',
                      isArabic ? 'left-3' : 'right-3'
                    )}
                  >
                    {t('common.sar')}
                  </span>
                </div>
              )}
            </FormControl>
            {description && (
              <p className="text-sm text-muted-foreground">{description}</p>
            )}
            <FormMessage />
          </FormItem>
        )}
      />
    )
  }

  const maxWidthClass = {
    sm: 'sm:max-w-sm',
    md: 'sm:max-w-md',
    lg: 'sm:max-w-lg',
    xl: 'sm:max-w-xl',
    '2xl': 'sm:max-w-2xl',
    '3xl': 'sm:max-w-3xl',
  }[maxWidth]

  const dialogTitle = isArabic && titleAr ? titleAr : title
  const dialogDescription = isArabic && descriptionAr ? descriptionAr : description

  const finalSubmitLabel =
    isArabic
      ? submitLabelAr || (mode === 'create' ? t('common.create') : t('common.save'))
      : submitLabel || (mode === 'create' ? t('common.create') : t('common.save'))

  const finalCancelLabel =
    isArabic ? cancelLabelAr || t('common.cancel') : cancelLabel || t('common.cancel')

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className={cn('max-h-[90vh] overflow-y-auto', maxWidthClass)}>
        <DialogHeader>
          <DialogTitle className="text-xl font-bold">{dialogTitle}</DialogTitle>
          {dialogDescription && (
            <p className="text-sm text-muted-foreground">{dialogDescription}</p>
          )}
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
            {sections.map((section, idx) => (
              <div key={idx} className="space-y-4">
                {section.title && (
                  <h3 className="font-semibold text-base text-foreground">
                    {isArabic && section.titleAr ? section.titleAr : section.title}
                  </h3>
                )}
                <div
                  className={cn(
                    'grid gap-4',
                    section.columns === 2 ? 'grid-cols-1 md:grid-cols-2' : 'grid-cols-1'
                  )}
                >
                  {section.fields.map(renderField)}
                </div>
              </div>
            ))}

            <DialogFooter className="gap-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => onOpenChange(false)}
                disabled={isLoading}
                className="rounded-xl"
              >
                {finalCancelLabel}
              </Button>
              <Button
                type="submit"
                disabled={isLoading}
                className="rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white"
              >
                {isLoading && <Loader2 className="w-4 h-4 me-2 animate-spin" />}
                {isLoading
                  ? t('common.saving')
                  : finalSubmitLabel}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  )
}

export type { FormFieldConfig, FormSectionConfig, GenericFormDialogProps, SelectOption, FieldType }
