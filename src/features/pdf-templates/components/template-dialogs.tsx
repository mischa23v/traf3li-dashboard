import * as React from 'react'
import { lazy, Suspense } from 'react'
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
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog'
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { usePdfTemplatesContext } from './template-provider'
import {
  usePdfmeTemplate,
  useDeletePdfmeTemplate,
  useClonePdfmeTemplate,
} from '@/hooks/usePdfme'
import { templateCategories, templateTypes } from '../data/data'
import { useTranslation } from 'react-i18next'
import { Check, X, Loader2 } from 'lucide-react'

// Lazy load PdfViewer - contains heavy @pdfme libraries (~6MB)
const PdfViewer = lazy(() => import('./pdf-viewer').then(mod => ({ default: mod.PdfViewer })))

const duplicateFormSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  nameAr: z.string().min(1, 'Arabic name is required'),
})

type DuplicateFormValues = z.infer<typeof duplicateFormSchema>

// View Dialog
export function TemplateViewDialog() {
  const { t, i18n } = useTranslation()
  const isRTL = i18n.language === 'ar'
  const { open, setOpen, currentTemplate } = usePdfTemplatesContext()

  if (!currentTemplate || open !== 'view') return null

  const category = templateCategories.find((cat) => cat.value === currentTemplate.category)
  const type = templateTypes.find((t) => t.value === currentTemplate.type)
  const CategoryIcon = category?.icon
  const TypeIcon = type?.icon

  const BooleanIcon = ({ value }: { value: boolean }) =>
    value ? (
      <Check className="h-4 w-4 text-green-500" aria-hidden="true" />
    ) : (
      <X className="h-4 w-4 text-muted-foreground" aria-hidden="true" />
    )

  return (
    <Dialog open={open === 'view'} onOpenChange={() => setOpen(null)}>
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
          {/* Category and Type */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-sm text-muted-foreground">{t('pdfTemplates.category')}</p>
              <div className="flex items-center gap-2">
                {CategoryIcon && <CategoryIcon className="h-4 w-4" />}
                <p className="font-medium">{isRTL ? category?.labelAr : category?.label}</p>
              </div>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">{t('pdfTemplates.type')}</p>
              <p className="font-medium">{isRTL ? type?.labelAr : type?.label}</p>
            </div>
          </div>

          <Separator />

          {/* Status */}
          <div>
            <h4 className="font-medium mb-2">{t('common.status')}</h4>
            <div className="grid grid-cols-2 gap-2 text-sm">
              <div className="flex items-center gap-2">
                <BooleanIcon value={currentTemplate.isActive} />
                <span>{t('common.active')}</span>
              </div>
              <div className="flex items-center gap-2">
                <BooleanIcon value={currentTemplate.isDefault} />
                <span>{t('common.default')}</span>
              </div>
            </div>
          </div>

          <Separator />

          {/* Metadata */}
          <div>
            <h4 className="font-medium mb-2">{t('common.information')}</h4>
            <div className="space-y-2 text-sm">
              <div className="grid grid-cols-2 gap-2">
                <span className="text-muted-foreground">{t('common.createdAt')}:</span>
                <span>{new Date(currentTemplate.createdAt).toLocaleDateString(isRTL ? 'ar' : 'en')}</span>
              </div>
              <div className="grid grid-cols-2 gap-2">
                <span className="text-muted-foreground">{t('common.updatedAt')}:</span>
                <span>{new Date(currentTemplate.updatedAt).toLocaleDateString(isRTL ? 'ar' : 'en')}</span>
              </div>
              {typeof currentTemplate.createdBy === 'object' && currentTemplate.createdBy?.fullName && (
                <div className="grid grid-cols-2 gap-2">
                  <span className="text-muted-foreground">{t('common.createdBy')}:</span>
                  <span>{currentTemplate.createdBy.fullName}</span>
                </div>
              )}
            </div>
          </div>

          <Separator />

          {/* Schema Information */}
          <div>
            <h4 className="font-medium mb-2">{t('pdfTemplates.schema')}</h4>
            <div className="text-sm">
              <span className="text-muted-foreground">{t('pdfTemplates.fieldsCount')}:</span>{' '}
              <span className="font-medium">{currentTemplate.schemas?.length || 0}</span>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}

// Delete Dialog
export function TemplateDeleteDialog() {
  const { t, i18n } = useTranslation()
  const isRTL = i18n.language === 'ar'
  const { open, setOpen, currentTemplate } = usePdfTemplatesContext()
  const deleteMutation = useDeletePdfmeTemplate()

  if (!currentTemplate || open !== 'delete') return null

  const handleDelete = () => {
    deleteMutation.mutate(currentTemplate._id, {
      onSuccess: () => {
        setOpen(null)
      },
    })
  }

  const displayName = isRTL ? currentTemplate.nameAr : currentTemplate.name

  return (
    <AlertDialog open={open === 'delete'} onOpenChange={() => setOpen(null)}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>{t('pdfTemplates.deleteTemplate')}</AlertDialogTitle>
          <AlertDialogDescription>
            {t('pdfTemplates.deleteConfirmation', { name: displayName })}
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>{t('common.cancel')}</AlertDialogCancel>
          <AlertDialogAction
            onClick={handleDelete}
            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            disabled={deleteMutation.isPending}
          >
            {deleteMutation.isPending ? t('common.deleting') : t('common.delete')}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}

// Duplicate Dialog
export function TemplateDuplicateDialog() {
  const { t, i18n } = useTranslation()
  const isRTL = i18n.language === 'ar'
  const { open, setOpen, currentTemplate } = usePdfTemplatesContext()
  const cloneMutation = useClonePdfmeTemplate()

  const form = useForm<DuplicateFormValues>({
    resolver: zodResolver(duplicateFormSchema),
    defaultValues: {
      name: currentTemplate ? `${currentTemplate.name} (Copy)` : '',
      nameAr: currentTemplate ? `${currentTemplate.nameAr} (نسخة)` : '',
    },
  })

  // Reset form when template changes
  React.useEffect(() => {
    if (currentTemplate && open === 'duplicate') {
      form.reset({
        name: `${currentTemplate.name} (Copy)`,
        nameAr: `${currentTemplate.nameAr} (نسخة)`,
      })
    }
  }, [currentTemplate, open, form])

  if (!currentTemplate || open !== 'duplicate') return null

  const onSubmit = (values: DuplicateFormValues) => {
    cloneMutation.mutate(
      {
        id: currentTemplate._id,
        data: {
          name: values.name,
          nameAr: values.nameAr,
        },
      },
      {
        onSuccess: () => {
          setOpen(null)
          form.reset()
        },
      }
    )
  }

  const displayName = isRTL ? currentTemplate.nameAr : currentTemplate.name

  return (
    <Dialog open={open === 'duplicate'} onOpenChange={() => setOpen(null)}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>{t('pdfTemplates.duplicateTemplate')}</DialogTitle>
          <DialogDescription>
            {t('pdfTemplates.duplicateDescription', { name: displayName })}
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{t('pdfTemplates.nameEn')}</FormLabel>
                  <FormControl>
                    <Input {...field} />
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
                  <FormLabel>{t('pdfTemplates.nameAr')}</FormLabel>
                  <FormControl>
                    <Input dir="rtl" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setOpen(null)}>
                {t('common.cancel')}
              </Button>
              <Button type="submit" disabled={cloneMutation.isPending}>
                {cloneMutation.isPending ? t('common.saving') : t('pdfTemplates.duplicate')}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  )
}

// Preview Dialog
export function TemplatePreviewDialog() {
  const { t, i18n } = useTranslation()
  const isRTL = i18n.language === 'ar'
  const { open, setOpen, currentTemplate } = usePdfTemplatesContext()
  const { data: templateData, isLoading } = usePdfmeTemplate(currentTemplate?._id || '')

  if (!currentTemplate || open !== 'preview') return null

  // Sample inputs for preview
  // TODO: Generate sample data based on template schema fields
  // For production use, implement a function that creates appropriate sample data
  // based on currentTemplate.schemas and currentTemplate.category
  const sampleInputs = [
    {
      // Example: invoiceNumber: 'INV-001', date: new Date().toISOString(), etc.
    },
  ]

  return (
    <Dialog open={open === 'preview'} onOpenChange={() => setOpen(null)}>
      <DialogContent className="max-w-4xl max-h-[90vh]">
        <DialogHeader>
          <DialogTitle>
            {t('pdfTemplates.preview')}: {isRTL ? currentTemplate.nameAr : currentTemplate.name}
          </DialogTitle>
          <DialogDescription>{t('pdfTemplates.previewDescription')}</DialogDescription>
        </DialogHeader>

        <div className="flex-1 min-h-[600px] border rounded-lg overflow-hidden">
          {isLoading ? (
            <div className="flex items-center justify-center h-full">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            </div>
          ) : templateData ? (
            <Suspense fallback={
              <div className="flex items-center justify-center h-full bg-slate-50">
                <div className="text-center">
                  <Loader2 className="h-8 w-8 animate-spin mx-auto text-blue-500 mb-2" />
                  <p className="text-slate-500 text-sm">{t('common.loading', 'جاري التحميل...')}</p>
                </div>
              </div>
            }>
              <PdfViewer
                template={{
                  basePdf: templateData.basePdf,
                  schemas: templateData.schemas,
                }}
                inputs={sampleInputs}
                lang={isRTL ? 'ar' : 'en'}
              />
            </Suspense>
          ) : (
            <div className="flex items-center justify-center h-full text-muted-foreground">
              {t('pdfTemplates.noPreviewAvailable')}
            </div>
          )}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => setOpen(null)}>
            {t('common.close')}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
