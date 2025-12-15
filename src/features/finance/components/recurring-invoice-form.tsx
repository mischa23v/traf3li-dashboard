import { useState, useEffect } from 'react'
import { useNavigate } from '@tanstack/react-router'
import { useForm, useFieldArray } from 'react-hook-form'
import { Plus, Trash2, ArrowRight, Save, Loader2, Calendar as CalendarIcon } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Switch } from '@/components/ui/switch'
import { Calendar } from '@/components/ui/calendar'
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover'
import { useCreateRecurringInvoice, useUpdateRecurringInvoice } from '@/hooks/useFinance'
import { useClients } from '@/hooks/useCasesAndClients'
import type { RecurringInvoice, CreateRecurringInvoiceData } from '@/services/recurringInvoiceService'
import { format } from 'date-fns'
import { ar } from 'date-fns/locale'

interface RecurringInvoiceFormProps {
  initialData?: RecurringInvoice
  isEdit?: boolean
}

interface FormData extends Omit<CreateRecurringInvoiceData, 'subtotal' | 'vatAmount' | 'total'> {
  subtotal?: number
  vatAmount?: number
  total?: number
}

export default function RecurringInvoiceForm({ initialData, isEdit = false }: RecurringInvoiceFormProps) {
  const navigate = useNavigate()
  const { data: clientsData } = useClients()
  const { mutate: createRecurring, isPending: isCreating } = useCreateRecurringInvoice()
  const { mutate: updateRecurring, isPending: isUpdating } = useUpdateRecurringInvoice()

  const [startDate, setStartDate] = useState<Date | undefined>(
    initialData?.startDate ? new Date(initialData.startDate) : undefined
  )
  const [endDate, setEndDate] = useState<Date | undefined>(
    initialData?.endDate ? new Date(initialData.endDate) : undefined
  )

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    control,
    formState: { errors },
  } = useForm<FormData>({
    defaultValues: initialData
      ? {
          name: initialData.name,
          nameAr: initialData.nameAr,
          clientId: typeof initialData.clientId === 'object' ? initialData.clientId._id : initialData.clientId,
          caseId: typeof initialData.caseId === 'object' ? initialData.caseId._id : initialData.caseId,
          frequency: initialData.frequency,
          dayOfMonth: initialData.dayOfMonth,
          dayOfWeek: initialData.dayOfWeek,
          startDate: initialData.startDate,
          endDate: initialData.endDate,
          maxGenerations: initialData.maxGenerations,
          items: initialData.items,
          vatRate: initialData.vatRate,
          paymentTerms: initialData.paymentTerms,
          notes: initialData.notes,
          notesAr: initialData.notesAr,
          autoSend: initialData.autoSend,
        }
      : {
          items: [{ description: '', descriptionAr: '', quantity: 1, unitPrice: 0, total: 0 }],
          vatRate: 15,
          paymentTerms: 'net_30',
          autoSend: false,
        },
  })

  const { fields, append, remove } = useFieldArray({
    control,
    name: 'items',
  })

  const items = watch('items')
  const vatRate = watch('vatRate')
  const frequency = watch('frequency')

  // Calculate totals
  useEffect(() => {
    if (items) {
      const subtotal = items.reduce((sum, item) => {
        const itemTotal = (item.quantity || 0) * (item.unitPrice || 0)
        return sum + itemTotal
      }, 0)

      const vatAmount = (subtotal * (vatRate || 0)) / 100
      const total = subtotal + vatAmount

      setValue('subtotal', subtotal)
      setValue('vatAmount', vatAmount)
      setValue('total', total)
    }
  }, [items, vatRate, setValue])

  // Update item totals
  useEffect(() => {
    items?.forEach((item, index) => {
      const total = (item.quantity || 0) * (item.unitPrice || 0)
      if (item.total !== total) {
        setValue(`items.${index}.total`, total)
      }
    })
  }, [items, setValue])

  const onSubmit = (data: FormData) => {
    const payload: any = {
      ...data,
      startDate: startDate ? format(startDate, 'yyyy-MM-dd') : undefined,
      endDate: endDate ? format(endDate, 'yyyy-MM-dd') : undefined,
      subtotal: data.subtotal || 0,
      vatAmount: data.vatAmount || 0,
      total: data.total || 0,
    }

    if (isEdit && initialData) {
      updateRecurring(
        { id: initialData._id, data: payload },
        {
          onSuccess: () => {
            navigate({ to: '/dashboard/finance/recurring-invoices' })
          },
        }
      )
    } else {
      createRecurring(payload, {
        onSuccess: () => {
          navigate({ to: '/dashboard/finance/recurring-invoices' })
        },
      })
    }
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('ar-SA', {
      style: 'currency',
      currency: 'SAR',
      minimumFractionDigits: 2,
    }).format(amount / 100)
  }

  const subtotal = watch('subtotal') || 0
  const vatAmount = watch('vatAmount') || 0
  const total = watch('total') || 0

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      {/* Basic Information */}
      <Card>
        <CardHeader>
          <CardTitle>المعلومات الأساسية</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="name">
                الاسم <span className="text-destructive">*</span>
              </Label>
              <Input
                id="name"
                {...register('name', { required: 'الاسم مطلوب' })}
                placeholder="اشتراك شهري - العميل..."
              />
              {errors.name && (
                <p className="text-sm text-destructive">{errors.name.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="nameAr">الاسم بالعربية</Label>
              <Input
                id="nameAr"
                {...register('nameAr')}
                placeholder="اشتراك شهري - العميل..."
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="clientId">
                العميل <span className="text-destructive">*</span>
              </Label>
              <Select
                value={watch('clientId')}
                onValueChange={(value) => setValue('clientId', value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="اختر العميل" />
                </SelectTrigger>
                <SelectContent>
                  {clientsData?.clients?.map((client: any) => (
                    <SelectItem key={client._id} value={client._id}>
                      {client.name || `${client.firstName} ${client.lastName}`}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {errors.clientId && (
                <p className="text-sm text-destructive">{errors.clientId.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="caseId">القضية (اختياري)</Label>
              <Input
                id="caseId"
                {...register('caseId')}
                placeholder="معرف القضية"
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Frequency Settings */}
      <Card>
        <CardHeader>
          <CardTitle>إعدادات التكرار</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="frequency">
                التكرار <span className="text-destructive">*</span>
              </Label>
              <Select
                value={watch('frequency')}
                onValueChange={(value: any) => setValue('frequency', value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="اختر التكرار" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="weekly">أسبوعياً</SelectItem>
                  <SelectItem value="biweekly">كل أسبوعين</SelectItem>
                  <SelectItem value="monthly">شهرياً</SelectItem>
                  <SelectItem value="quarterly">ربع سنوي</SelectItem>
                  <SelectItem value="annually">سنوياً</SelectItem>
                </SelectContent>
              </Select>
              {errors.frequency && (
                <p className="text-sm text-destructive">{errors.frequency.message}</p>
              )}
            </div>

            {(frequency === 'monthly' || frequency === 'quarterly' || frequency === 'annually') && (
              <div className="space-y-2">
                <Label htmlFor="dayOfMonth">يوم الشهر</Label>
                <Input
                  id="dayOfMonth"
                  type="number"
                  min="1"
                  max="28"
                  {...register('dayOfMonth', {
                    valueAsNumber: true,
                    min: { value: 1, message: 'يجب أن يكون بين 1 و 28' },
                    max: { value: 28, message: 'يجب أن يكون بين 1 و 28' },
                  })}
                  placeholder="1-28"
                />
                {errors.dayOfMonth && (
                  <p className="text-sm text-destructive">{errors.dayOfMonth.message}</p>
                )}
              </div>
            )}

            {(frequency === 'weekly' || frequency === 'biweekly') && (
              <div className="space-y-2">
                <Label htmlFor="dayOfWeek">يوم الأسبوع</Label>
                <Select
                  value={watch('dayOfWeek')?.toString()}
                  onValueChange={(value) => setValue('dayOfWeek', parseInt(value))}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="اختر اليوم" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="0">الأحد</SelectItem>
                    <SelectItem value="1">الاثنين</SelectItem>
                    <SelectItem value="2">الثلاثاء</SelectItem>
                    <SelectItem value="3">الأربعاء</SelectItem>
                    <SelectItem value="4">الخميس</SelectItem>
                    <SelectItem value="5">الجمعة</SelectItem>
                    <SelectItem value="6">السبت</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label>
                تاريخ البدء <span className="text-destructive">*</span>
              </Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className="w-full justify-start text-right font-normal"
                  >
                    <CalendarIcon className="ml-2 h-4 w-4" />
                    {startDate ? format(startDate, 'PPP', { locale: ar }) : 'اختر التاريخ'}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    mode="single"
                    selected={startDate}
                    onSelect={setStartDate}
                    initialFocus
                    locale={ar}
                  />
                </PopoverContent>
              </Popover>
            </div>

            <div className="space-y-2">
              <Label>تاريخ الانتهاء (اختياري)</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className="w-full justify-start text-right font-normal"
                  >
                    <CalendarIcon className="ml-2 h-4 w-4" />
                    {endDate ? format(endDate, 'PPP', { locale: ar }) : 'اختر التاريخ'}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    mode="single"
                    selected={endDate}
                    onSelect={setEndDate}
                    initialFocus
                    locale={ar}
                    disabled={(date) => startDate ? date < startDate : false}
                  />
                </PopoverContent>
              </Popover>
            </div>

            <div className="space-y-2">
              <Label htmlFor="maxGenerations">الحد الأقصى للإنشاءات (اختياري)</Label>
              <Input
                id="maxGenerations"
                type="number"
                min="1"
                {...register('maxGenerations', { valueAsNumber: true })}
                placeholder="غير محدود"
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Invoice Items */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>بنود الفاتورة</CardTitle>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() =>
                append({ description: '', descriptionAr: '', quantity: 1, unitPrice: 0, total: 0 })
              }
            >
              <Plus className="h-4 w-4 ml-2" />
              إضافة بند
            </Button>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          {fields.map((field, index) => (
            <div key={field.id} className="p-4 border rounded-lg space-y-3">
              <div className="flex items-start justify-between">
                <h4 className="font-medium">البند {index + 1}</h4>
                {fields.length > 1 && (
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => remove(index)}
                  >
                    <Trash2 className="h-4 w-4 text-destructive" />
                  </Button>
                )}
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div className="space-y-2">
                  <Label>الوصف</Label>
                  <Input
                    {...register(`items.${index}.description`, { required: true })}
                    placeholder="وصف الخدمة أو المنتج"
                  />
                </div>

                <div className="space-y-2">
                  <Label>الوصف بالعربية</Label>
                  <Input
                    {...register(`items.${index}.descriptionAr`)}
                    placeholder="وصف الخدمة أو المنتج"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
                <div className="space-y-2">
                  <Label>الكمية</Label>
                  <Input
                    type="number"
                    min="0"
                    step="1"
                    {...register(`items.${index}.quantity`, {
                      required: true,
                      valueAsNumber: true,
                    })}
                  />
                </div>

                <div className="space-y-2">
                  <Label>السعر (هللة)</Label>
                  <Input
                    type="number"
                    min="0"
                    step="1"
                    {...register(`items.${index}.unitPrice`, {
                      required: true,
                      valueAsNumber: true,
                    })}
                  />
                </div>

                <div className="space-y-2">
                  <Label>الإجمالي (هللة)</Label>
                  <Input
                    type="number"
                    {...register(`items.${index}.total`, { valueAsNumber: true })}
                    disabled
                  />
                </div>

                <div className="space-y-2">
                  <Label>الإجمالي (ريال)</Label>
                  <div className="h-10 px-3 py-2 border rounded-md bg-muted flex items-center">
                    {formatCurrency(watch(`items.${index}.total`) || 0)}
                  </div>
                </div>
              </div>
            </div>
          ))}

          {/* Totals */}
          <div className="border-t pt-4 space-y-3">
            <div className="flex items-center justify-between text-sm">
              <span>المجموع الفرعي:</span>
              <span className="font-medium">{formatCurrency(subtotal)}</span>
            </div>

            <div className="flex items-center justify-between text-sm">
              <div className="flex items-center gap-2">
                <span>ضريبة القيمة المضافة:</span>
                <Input
                  type="number"
                  min="0"
                  max="100"
                  step="0.1"
                  {...register('vatRate', { valueAsNumber: true })}
                  className="w-20 h-8"
                />
                <span>%</span>
              </div>
              <span className="font-medium">{formatCurrency(vatAmount)}</span>
            </div>

            <div className="flex items-center justify-between text-lg font-bold border-t pt-3">
              <span>الإجمالي:</span>
              <span>{formatCurrency(total)}</span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Additional Settings */}
      <Card>
        <CardHeader>
          <CardTitle>إعدادات إضافية</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="paymentTerms">شروط الدفع</Label>
            <Select
              value={watch('paymentTerms')}
              onValueChange={(value) => setValue('paymentTerms', value)}
            >
              <SelectTrigger>
                <SelectValue placeholder="اختر شروط الدفع" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="net_15">خلال 15 يوم</SelectItem>
                <SelectItem value="net_30">خلال 30 يوم</SelectItem>
                <SelectItem value="net_45">خلال 45 يوم</SelectItem>
                <SelectItem value="net_60">خلال 60 يوم</SelectItem>
                <SelectItem value="due_on_receipt">مستحق عند الاستلام</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="notes">ملاحظات</Label>
              <Textarea
                id="notes"
                {...register('notes')}
                placeholder="أي ملاحظات إضافية..."
                rows={3}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="notesAr">ملاحظات بالعربية</Label>
              <Textarea
                id="notesAr"
                {...register('notesAr')}
                placeholder="أي ملاحظات إضافية..."
                rows={3}
              />
            </div>
          </div>

          <div className="flex items-center justify-between p-4 border rounded-lg">
            <div className="space-y-0.5">
              <Label>إرسال تلقائي</Label>
              <p className="text-sm text-muted-foreground">
                إرسال الفواتير تلقائياً للعميل عند إنشائها
              </p>
            </div>
            <Switch
              checked={watch('autoSend')}
              onCheckedChange={(checked) => setValue('autoSend', checked)}
            />
          </div>
        </CardContent>
      </Card>

      {/* Actions */}
      <div className="flex items-center justify-between">
        <Button
          type="button"
          variant="outline"
          onClick={() => navigate({ to: '/dashboard/finance/recurring-invoices' })}
        >
          <ArrowRight className="h-4 w-4 ml-2" />
          إلغاء
        </Button>

        <Button type="submit" disabled={isCreating || isUpdating}>
          {(isCreating || isUpdating) && <Loader2 className="h-4 w-4 ml-2 animate-spin" />}
          <Save className="h-4 w-4 ml-2" />
          {isEdit ? 'تحديث' : 'إنشاء'} الفاتورة المتكررة
        </Button>
      </div>
    </form>
  )
}
