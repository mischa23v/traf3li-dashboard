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
import { useCreateFollowup, useUpdateFollowup } from '@/hooks/useFollowups'
import { createFollowupSchema, type CreateFollowupData, type Followup } from '../data/schema'
import { typeOptions, priorityOptions, entityTypeOptions } from '../data/data'
import { useTranslation } from 'react-i18next'

interface FollowupsActionDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  currentRow?: Followup | null
}

export function FollowupsActionDialog({
  open,
  onOpenChange,
  currentRow,
}: FollowupsActionDialogProps) {
  const { t, i18n } = useTranslation()
  const isArabic = i18n.language === 'ar'
  const isEdit = !!currentRow

  const createFollowup = useCreateFollowup()
  const updateFollowup = useUpdateFollowup()

  const form = useForm<CreateFollowupData>({
    resolver: zodResolver(createFollowupSchema),
    defaultValues: {
      title: '',
      description: '',
      type: 'general',
      priority: 'medium',
      dueDate: '',
      dueTime: '',
      entityType: 'case',
      entityId: '',
    },
  })

  useEffect(() => {
    if (currentRow) {
      form.reset({
        title: currentRow.title,
        description: currentRow.description || '',
        type: currentRow.type,
        priority: currentRow.priority,
        dueDate: currentRow.dueDate.split('T')[0],
        dueTime: currentRow.dueTime || '',
        entityType: currentRow.entityType,
        entityId: currentRow.entityId,
      })
    } else {
      form.reset({
        title: '',
        description: '',
        type: 'general',
        priority: 'medium',
        dueDate: '',
        dueTime: '',
        entityType: 'case',
        entityId: '',
      })
    }
  }, [currentRow, form])

  const onSubmit = (data: CreateFollowupData) => {
    if (isEdit && currentRow) {
      updateFollowup.mutate(
        { id: currentRow._id, data },
        {
          onSuccess: () => {
            onOpenChange(false)
            form.reset()
          },
        }
      )
    } else {
      createFollowup.mutate(data, {
        onSuccess: () => {
          onOpenChange(false)
          form.reset()
        },
      })
    }
  }

  const isLoading = createFollowup.isPending || updateFollowup.isPending

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className='sm:max-w-[600px]'>
        <DialogHeader>
          <DialogTitle>
            {isEdit ? t('followups.editFollowup') : t('followups.addFollowup')}
          </DialogTitle>
          <DialogDescription>
            {isEdit
              ? t('followups.editFollowupDescription')
              : t('followups.addFollowupDescription')}
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className='space-y-4'>
            <FormField
              control={form.control}
              name='title'
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{t('followups.followupTitle')}</FormLabel>
                  <FormControl>
                    <Input placeholder={t('followups.titlePlaceholder')} {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className='grid grid-cols-2 gap-4'>
              <FormField
                control={form.control}
                name='type'
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t('followups.type')}</FormLabel>
                    <Select
                      onValueChange={field.onChange}
                      defaultValue={field.value}
                      value={field.value}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder={t('followups.selectType')} />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {typeOptions.map((option) => (
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
                name='priority'
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t('followups.priority')}</FormLabel>
                    <Select
                      onValueChange={field.onChange}
                      defaultValue={field.value}
                      value={field.value}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder={t('followups.selectPriority')} />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {priorityOptions.map((option) => (
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
            </div>

            <div className='grid grid-cols-2 gap-4'>
              <FormField
                control={form.control}
                name='dueDate'
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t('followups.dueDate')}</FormLabel>
                    <FormControl>
                      <Input type='date' {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name='dueTime'
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t('followups.dueTime')}</FormLabel>
                    <FormControl>
                      <Input type='time' {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className='grid grid-cols-2 gap-4'>
              <FormField
                control={form.control}
                name='entityType'
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t('followups.entityType')}</FormLabel>
                    <Select
                      onValueChange={field.onChange}
                      defaultValue={field.value}
                      value={field.value}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder={t('followups.selectEntityType')} />
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
                name='entityId'
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t('followups.entityId')}</FormLabel>
                    <FormControl>
                      <Input placeholder={t('followups.entityIdPlaceholder')} {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name='description'
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{t('common.description')}</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder={t('followups.descriptionPlaceholder')}
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
