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
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { useDuplicateTemplate } from '@/hooks/useInvoiceTemplates'
import type { InvoiceTemplate } from '@/services/invoiceTemplatesService'
import { useTranslation } from 'react-i18next'

const formSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  nameAr: z.string().min(1, 'Arabic name is required'),
})

type FormValues = z.infer<typeof formSchema>

interface TemplateDuplicateDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  currentTemplate: InvoiceTemplate | null
}

export function TemplateDuplicateDialog({
  open,
  onOpenChange,
  currentTemplate,
}: TemplateDuplicateDialogProps) {
  const { t, i18n } = useTranslation()
  const isRTL = i18n.language === 'ar'
  const duplicateTemplate = useDuplicateTemplate()

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema) as any,
    defaultValues: {
      name: currentTemplate ? `${currentTemplate.name} (Copy)` : '',
      nameAr: currentTemplate ? `${currentTemplate.nameAr} (نسخة)` : '',
    },
  })

  const onSubmit = (values: FormValues) => {
    if (currentTemplate) {
      duplicateTemplate.mutate(
        {
          id: currentTemplate._id,
          name: values.name,
          nameAr: values.nameAr,
        },
        {
          onSuccess: () => {
            onOpenChange(false)
          },
        }
      )
    }
  }

  const displayName = currentTemplate
    ? isRTL
      ? currentTemplate.nameAr
      : currentTemplate.name
    : ''

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>{t('invoiceTemplates.duplicateTemplate')}</DialogTitle>
          <DialogDescription>
            {t('invoiceTemplates.duplicateDescription', { name: displayName })}
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{t('invoiceTemplates.nameEn')}</FormLabel>
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
                  <FormLabel>{t('invoiceTemplates.nameAr')}</FormLabel>
                  <FormControl>
                    <Input dir="rtl" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
                {t('common.cancel')}
              </Button>
              <Button type="submit" disabled={duplicateTemplate.isPending}>
                {duplicateTemplate.isPending ? t('common.saving') : t('invoiceTemplates.duplicate')}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  )
}
