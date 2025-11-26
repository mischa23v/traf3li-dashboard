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
import { useCreateRate, useUpdateRate } from '@/hooks/useBillingRates'
import type { BillingRate } from '../data/schema'
import { rateTypes, rateCategories, currencies, roundingIncrements } from '../data/data'
import { useTranslation } from 'react-i18next'

const formSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  nameAr: z.string().min(1, 'Arabic name is required'),
  description: z.string().optional(),
  descriptionAr: z.string().optional(),
  type: z.enum(['hourly', 'flat', 'contingency', 'retainer', 'task_based', 'milestone']),
  category: z.enum(['consultation', 'court_appearance', 'document_preparation', 'research', 'meeting', 'travel', 'administrative', 'other']),
  amount: z.coerce.number().positive('Amount must be positive'),
  currency: z.enum(['SAR', 'USD', 'EUR', 'GBP', 'AED']).default('SAR'),
  unit: z.string().optional(),
  minimumCharge: z.coerce.number().optional(),
  roundingIncrement: z.coerce.number().optional(),
  isActive: z.boolean().default(true),
})

type FormValues = z.infer<typeof formSchema>

interface RateActionDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  currentRate?: BillingRate | null
}

export function RateActionDialog({
  open,
  onOpenChange,
  currentRate,
}: RateActionDialogProps) {
  const { t, i18n } = useTranslation()
  const isRTL = i18n.language === 'ar'
  const isEdit = !!currentRate

  const createRate = useCreateRate()
  const updateRate = useUpdateRate()

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: '',
      nameAr: '',
      description: '',
      descriptionAr: '',
      type: 'hourly',
      category: 'consultation',
      amount: 0,
      currency: 'SAR',
      unit: 'hour',
      minimumCharge: undefined,
      roundingIncrement: undefined,
      isActive: true,
    },
  })

  useEffect(() => {
    if (currentRate) {
      form.reset({
        name: currentRate.name,
        nameAr: currentRate.nameAr,
        description: currentRate.description || '',
        descriptionAr: currentRate.descriptionAr || '',
        type: currentRate.type,
        category: currentRate.category,
        amount: currentRate.amount,
        currency: currentRate.currency,
        unit: currentRate.unit || '',
        minimumCharge: currentRate.minimumCharge,
        roundingIncrement: currentRate.roundingIncrement,
        isActive: currentRate.isActive,
      })
    } else {
      form.reset({
        name: '',
        nameAr: '',
        description: '',
        descriptionAr: '',
        type: 'hourly',
        category: 'consultation',
        amount: 0,
        currency: 'SAR',
        unit: 'hour',
        minimumCharge: undefined,
        roundingIncrement: undefined,
        isActive: true,
      })
    }
  }, [currentRate, form])

  const onSubmit = (values: FormValues) => {
    if (isEdit && currentRate) {
      updateRate.mutate(
        {
          id: currentRate._id,
          data: values,
        },
        {
          onSuccess: () => {
            onOpenChange(false)
          },
        }
      )
    } else {
      createRate.mutate(values, {
        onSuccess: () => {
          onOpenChange(false)
        },
      })
    }
  }

  const isPending = createRate.isPending || updateRate.isPending

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {isEdit ? t('billingRates.editRate') : t('billingRates.addRate')}
          </DialogTitle>
          <DialogDescription>
            {isEdit ? t('billingRates.editRateDescription') : t('billingRates.addRateDescription')}
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
                      <Input placeholder="Consultation Fee" {...field} />
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
                      <Input placeholder="رسوم الاستشارة" dir="rtl" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="type"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t('billingRates.type')}</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder={t('billingRates.selectType')} />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {rateTypes.map((type) => (
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

              <FormField
                control={form.control}
                name="category"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t('billingRates.category')}</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder={t('billingRates.selectCategory')} />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {rateCategories.map((category) => (
                          <SelectItem key={category.value} value={category.value}>
                            <div className="flex items-center gap-2">
                              <category.icon className="h-4 w-4" />
                              {isRTL ? category.labelAr : category.label}
                            </div>
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <FormField
                control={form.control}
                name="amount"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t('billingRates.amount')}</FormLabel>
                    <FormControl>
                      <Input type="number" placeholder="500" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="currency"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t('billingRates.currency')}</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {currencies.map((currency) => (
                          <SelectItem key={currency.value} value={currency.value}>
                            {currency.symbol} - {isRTL ? currency.labelAr : currency.label}
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
                name="unit"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t('billingRates.unit')}</FormLabel>
                    <FormControl>
                      <Input placeholder="hour" {...field} />
                    </FormControl>
                    <FormDescription className="text-xs">
                      {t('billingRates.unitDescription')}
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="minimumCharge"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t('billingRates.minimumCharge')}</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        placeholder="100"
                        {...field}
                        value={field.value || ''}
                      />
                    </FormControl>
                    <FormDescription className="text-xs">
                      {t('billingRates.minimumChargeDescription')}
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="roundingIncrement"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t('billingRates.roundingIncrement')}</FormLabel>
                    <Select
                      onValueChange={(v) => field.onChange(v ? parseInt(v) : undefined)}
                      value={field.value?.toString() || ''}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder={t('billingRates.selectRounding')} />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {roundingIncrements.map((increment) => (
                          <SelectItem key={increment.value} value={increment.value.toString()}>
                            {isRTL ? increment.labelAr : increment.label}
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
                name="description"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t('billingRates.descriptionEn')}</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="Rate description..."
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
                        placeholder="وصف السعر..."
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

            <FormField
              control={form.control}
              name="isActive"
              render={({ field }) => (
                <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                  <div className="space-y-0.5">
                    <FormLabel className="text-base">{t('common.active')}</FormLabel>
                    <FormDescription>
                      {t('billingRates.activeDescription')}
                    </FormDescription>
                  </div>
                  <FormControl>
                    <Switch checked={field.value} onCheckedChange={field.onChange} />
                  </FormControl>
                </FormItem>
              )}
            />

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
