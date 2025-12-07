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
import { Checkbox } from '@/components/ui/checkbox'
import { useCreateRateGroup, useUpdateRateGroup } from '@/hooks/useBillingRates'
import type { RateGroup } from '../data/schema'
import { groupColors, applicableToOptions } from '../data/data'
import { useTranslation } from 'react-i18next'

const formSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  nameAr: z.string().min(1, 'Arabic name is required'),
  description: z.string().optional(),
  descriptionAr: z.string().optional(),
  color: z.string().min(1, 'Color is required'),
  discount: z.coerce.number().min(0).max(100).optional(),
  applicableTo: z.array(z.enum(['clients', 'cases', 'services'])).default([]),
  isDefault: z.boolean().default(false),
  isActive: z.boolean().default(true),
})

type FormValues = z.output<typeof formSchema>

interface GroupActionDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  currentGroup?: RateGroup | null
}

export function GroupActionDialog({
  open,
  onOpenChange,
  currentGroup,
}: GroupActionDialogProps) {
  const { t, i18n } = useTranslation()
  const isRTL = i18n.language === 'ar'
  const isEdit = !!currentGroup

  const createGroup = useCreateRateGroup()
  const updateGroup = useUpdateRateGroup()

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema) as any,
    defaultValues: {
      name: '',
      nameAr: '',
      description: '',
      descriptionAr: '',
      color: '#3B82F6',
      discount: undefined,
      applicableTo: [],
      isDefault: false,
      isActive: true,
    },
  })

  useEffect(() => {
    if (currentGroup) {
      form.reset({
        name: currentGroup.name,
        nameAr: currentGroup.nameAr,
        description: currentGroup.description || '',
        descriptionAr: currentGroup.descriptionAr || '',
        color: currentGroup.color,
        discount: currentGroup.discount,
        applicableTo: currentGroup.applicableTo as ('clients' | 'cases' | 'services')[],
        isDefault: currentGroup.isDefault,
        isActive: currentGroup.isActive,
      })
    } else {
      form.reset({
        name: '',
        nameAr: '',
        description: '',
        descriptionAr: '',
        color: '#3B82F6',
        discount: undefined,
        applicableTo: [],
        isDefault: false,
        isActive: true,
      })
    }
  }, [currentGroup, form])

  const onSubmit = (values: FormValues) => {
    if (isEdit && currentGroup) {
      updateGroup.mutate(
        {
          id: currentGroup._id,
          data: values,
        },
        {
          onSuccess: () => {
            onOpenChange(false)
          },
        }
      )
    } else {
      createGroup.mutate(values, {
        onSuccess: () => {
          onOpenChange(false)
        },
      })
    }
  }

  const isPending = createGroup.isPending || updateGroup.isPending

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {isEdit ? t('billingRates.editGroup') : t('billingRates.addGroup')}
          </DialogTitle>
          <DialogDescription>
            {isEdit ? t('billingRates.editGroupDescription') : t('billingRates.addGroupDescription')}
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t('billingRates.nameEn')}</FormLabel>
                    <FormControl>
                      <Input placeholder="Premium Clients" {...field} />
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
                    <FormLabel>{t('billingRates.nameAr')}</FormLabel>
                    <FormControl>
                      <Input placeholder="العملاء المميزون" dir="rtl" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="color"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{t('billingRates.color')}</FormLabel>
                  <div className="flex flex-wrap gap-2">
                    {groupColors.map((color) => (
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

            <FormField
              control={form.control}
              name="discount"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{t('billingRates.discount')}</FormLabel>
                  <FormControl>
                    <div className="relative">
                      <Input
                        type="number"
                        placeholder="10"
                        min="0"
                        max="100"
                        {...field}
                        value={field.value || ''}
                      />
                      <span className="absolute end-3 top-1/2 -translate-y-1/2 text-muted-foreground">
                        %
                      </span>
                    </div>
                  </FormControl>
                  <FormDescription>
                    {t('billingRates.discountDescription')}
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="applicableTo"
              render={() => (
                <FormItem>
                  <FormLabel>{t('billingRates.applicableTo')}</FormLabel>
                  <div className="grid grid-cols-3 gap-4">
                    {applicableToOptions.map((option) => (
                      <FormField
                        key={option.value}
                        control={form.control}
                        name="applicableTo"
                        render={({ field }) => (
                          <FormItem className="flex flex-row items-center gap-3 space-y-0 rtl:gap-reverse">
                            <FormControl>
                              <Checkbox
                                checked={field.value?.includes(option.value)}
                                onCheckedChange={(checked) => {
                                  const current = field.value || []
                                  if (checked) {
                                    field.onChange([...current, option.value])
                                  } else {
                                    field.onChange(current.filter((v) => v !== option.value))
                                  }
                                }}
                              />
                            </FormControl>
                            <FormLabel className="font-normal cursor-pointer">
                              {isRTL ? option.labelAr : option.label}
                            </FormLabel>
                          </FormItem>
                        )}
                      />
                    ))}
                  </div>
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
                    <FormLabel>{t('billingRates.descriptionEn')}</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="Group description..."
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
                    <FormLabel>{t('billingRates.descriptionAr')}</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="وصف المجموعة..."
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
                      <FormLabel className="text-base">{t('billingRates.setAsDefault')}</FormLabel>
                      <FormDescription className="text-xs">
                        {t('billingRates.setAsDefaultDescription')}
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
                        {t('billingRates.activeGroupDescription')}
                      </FormDescription>
                    </div>
                    <FormControl>
                      <Switch checked={field.value} onCheckedChange={field.onChange} />
                    </FormControl>
                  </FormItem>
                )}
              />
            </div>

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
