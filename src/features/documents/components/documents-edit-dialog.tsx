import { useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
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
import { useUpdateDocument } from '@/hooks/useDocuments'
import { updateDocumentSchema, type UpdateDocumentData, type Document } from '../data/schema'
import { categoryOptions } from '../data/data'
import { useTranslation } from 'react-i18next'

interface DocumentsEditDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  currentRow: Document
}

export function DocumentsEditDialog({
  open,
  onOpenChange,
  currentRow,
}: DocumentsEditDialogProps) {
  const { t, i18n } = useTranslation()
  const isArabic = i18n.language === 'ar'

  const updateDocument = useUpdateDocument()

  const form = useForm<UpdateDocumentData>({
    resolver: zodResolver(updateDocumentSchema) as any,
    defaultValues: {
      category: currentRow.category,
      description: currentRow.description || '',
      isConfidential: currentRow.isConfidential,
    },
  })

  useEffect(() => {
    form.reset({
      category: currentRow.category,
      description: currentRow.description || '',
      isConfidential: currentRow.isConfidential,
    })
  }, [currentRow, form])

  const onSubmit = (data: UpdateDocumentData) => {
    updateDocument.mutate(
      { id: currentRow._id, data },
      {
        onSuccess: () => {
          onOpenChange(false)
        },
      }
    )
  }

  const isLoading = updateDocument.isPending

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className='sm:max-w-[500px]'>
        <DialogHeader>
          <DialogTitle>{t('documents.editDocument')}</DialogTitle>
          <DialogDescription>
            {t('documents.editDocumentDescription', { name: currentRow.originalName })}
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className='space-y-4'>
            <FormField
              control={form.control}
              name='category'
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{t('documents.category')}</FormLabel>
                  <Select
                    onValueChange={field.onChange}
                    defaultValue={field.value}
                    value={field.value}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder={t('documents.selectCategory')} />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {categoryOptions.map((option) => (
                        <SelectItem key={option.value} value={option.value}>
                          {isArabic ? option.labelAr : option.label}
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
              name='description'
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{t('common.description')}</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder={t('documents.descriptionPlaceholder')}
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name='isConfidential'
              render={({ field }) => (
                <FormItem className='flex items-center justify-between gap-2 rounded-lg border p-3'>
                  <div className='space-y-0.5'>
                    <FormLabel>{t('documents.confidential')}</FormLabel>
                    <p className='text-xs text-muted-foreground'>
                      {t('documents.confidentialHelp')}
                    </p>
                  </div>
                  <FormControl>
                    <Switch
                      checked={field.value}
                      onCheckedChange={field.onChange}
                    />
                  </FormControl>
                </FormItem>
              )}
            />

            <DialogFooter>
              <Button
                type='button'
                variant='outline'
                onClick={() => onOpenChange(false)}
              >
                {t('common.cancel')}
              </Button>
              <Button type='submit' disabled={isLoading}>
                {isLoading ? t('common.saving') : t('common.save')}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  )
}
