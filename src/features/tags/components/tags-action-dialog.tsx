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
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Button } from '@/components/ui/button'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { useCreateTag, useUpdateTag } from '@/hooks/useTags'
import { createTagSchema, type CreateTagData, type Tag } from '../data/schema'
import { tagColors, entityTypeOptions } from '../data/data'
import { useTranslation } from 'react-i18next'

interface TagsActionDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  currentRow?: Tag | null
}

export function TagsActionDialog({
  open,
  onOpenChange,
  currentRow,
}: TagsActionDialogProps) {
  const { t, i18n } = useTranslation()
  const isArabic = i18n.language === 'ar'
  const isEdit = !!currentRow

  const createTag = useCreateTag()
  const updateTag = useUpdateTag()

  const form = useForm<CreateTagData>({
    resolver: zodResolver(createTagSchema) as any,
    defaultValues: {
      name: '',
      nameAr: '',
      color: '#3B82F6',
      description: '',
      entityType: 'all',
    },
  })

  useEffect(() => {
    if (currentRow) {
      form.reset({
        name: currentRow.name,
        nameAr: currentRow.nameAr || '',
        color: currentRow.color,
        description: currentRow.description || '',
        entityType: currentRow.entityType || 'all',
      })
    } else {
      form.reset({
        name: '',
        nameAr: '',
        color: '#3B82F6',
        description: '',
        entityType: 'all',
      })
    }
  }, [currentRow, form])

  const onSubmit = (data: CreateTagData) => {
    if (isEdit && currentRow) {
      updateTag.mutate(
        { id: currentRow._id, data },
        {
          onSuccess: () => {
            onOpenChange(false)
            form.reset()
          },
        }
      )
    } else {
      createTag.mutate(data, {
        onSuccess: () => {
          onOpenChange(false)
          form.reset()
        },
      })
    }
  }

  const isLoading = createTag.isPending || updateTag.isPending

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className='sm:max-w-[500px]'>
        <DialogHeader>
          <DialogTitle>
            {isEdit ? t('tags.editTag') : t('tags.addTag')}
          </DialogTitle>
          <DialogDescription>
            {isEdit
              ? t('tags.editTagDescription')
              : t('tags.addTagDescription')}
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className='space-y-4'>
            <div className='grid grid-cols-2 gap-4'>
              <FormField
                control={form.control}
                name='name'
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t('tags.nameEn')}</FormLabel>
                    <FormControl>
                      <Input placeholder={t('tags.nameEnPlaceholder')} {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name='nameAr'
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t('tags.nameAr')}</FormLabel>
                    <FormControl>
                      <Input
                        placeholder={t('tags.nameArPlaceholder')}
                        dir='rtl'
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name='color'
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{t('tags.color')}</FormLabel>
                  <div className='flex flex-wrap gap-2'>
                    {tagColors.map((color) => (
                      <button
                        key={color.value}
                        type='button'
                        onClick={() => field.onChange(color.value)}
                        className={`h-8 w-8 rounded-full border-2 transition-all ${
                          field.value === color.value
                            ? 'border-primary scale-110'
                            : 'border-transparent hover:scale-105'
                        }`}
                        style={{ backgroundColor: color.value }}
                        title={isArabic ? color.labelAr : color.label}
                      />
                    ))}
                  </div>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name='entityType'
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{t('tags.entityType')}</FormLabel>
                  <Select
                    onValueChange={field.onChange}
                    defaultValue={field.value}
                    value={field.value}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder={t('tags.selectEntityType')} />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {entityTypeOptions.map((option) => (
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
                      placeholder={t('tags.descriptionPlaceholder')}
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
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
                {isLoading
                  ? t('common.saving')
                  : isEdit
                    ? t('common.save')
                    : t('common.add')}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  )
}
