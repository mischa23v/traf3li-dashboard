import { useEffect, useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { useCreateLeavePeriod, useUpdateLeavePeriod, useAllocateLeavesForPeriod } from '@/hooks/useLeavePeriod'
import { Button } from '@/components/ui/button'
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
import { Switch } from '@/components/ui/switch'
import { Loader2, Calendar } from 'lucide-react'
import { toast } from 'sonner'
import type { LeavePeriod, CreateLeavePeriodData } from '@/services/leavePeriodService'

const leavePeriodSchema = z.object({
  name: z.string().min(1, 'اسم الفترة مطلوب'),
  nameAr: z.string().min(1, 'الاسم بالعربية مطلوب'),
  fromDate: z.string().min(1, 'تاريخ البداية مطلوب'),
  toDate: z.string().min(1, 'تاريخ النهاية مطلوب'),
  company: z.string().optional(),
  isActive: z.boolean().default(false),
  autoAllocateLeaves: z.boolean().default(false),
  allocateOnDayOfPeriodStart: z.boolean().default(false),
}).refine((data) => {
  const fromDate = new Date(data.fromDate)
  const toDate = new Date(data.toDate)
  return fromDate < toDate
}, {
  message: 'تاريخ النهاية يجب أن يكون بعد تاريخ البداية',
  path: ['toDate'],
})

type LeavePeriodFormData = z.infer<typeof leavePeriodSchema>

interface LeavePeriodDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  period?: LeavePeriod | null
}

export function LeavePeriodDialog({ open, onOpenChange, period }: LeavePeriodDialogProps) {
  const [allocateNow, setAllocateNow] = useState(false)
  const isEdit = !!period

  const createMutation = useCreateLeavePeriod()
  const updateMutation = useUpdateLeavePeriod()
  const allocateMutation = useAllocateLeavesForPeriod()

  const form = useForm<LeavePeriodFormData>({
    resolver: zodResolver(leavePeriodSchema),
    defaultValues: {
      name: '',
      nameAr: '',
      fromDate: '',
      toDate: '',
      company: '',
      isActive: false,
      autoAllocateLeaves: false,
      allocateOnDayOfPeriodStart: false,
    },
  })

  useEffect(() => {
    if (period) {
      form.reset({
        name: period.name,
        nameAr: period.nameAr,
        fromDate: period.fromDate.split('T')[0],
        toDate: period.toDate.split('T')[0],
        company: period.company || '',
        isActive: period.isActive,
        autoAllocateLeaves: period.autoAllocateLeaves,
        allocateOnDayOfPeriodStart: period.allocateOnDayOfPeriodStart,
      })
    } else {
      form.reset({
        name: '',
        nameAr: '',
        fromDate: '',
        toDate: '',
        company: '',
        isActive: false,
        autoAllocateLeaves: false,
        allocateOnDayOfPeriodStart: false,
      })
    }
  }, [period, form])

  const onSubmit = async (data: LeavePeriodFormData) => {
    const submitData: CreateLeavePeriodData = {
      name: data.name,
      nameAr: data.nameAr,
      fromDate: data.fromDate,
      toDate: data.toDate,
      company: data.company || undefined,
      isActive: data.isActive,
      autoAllocateLeaves: data.autoAllocateLeaves,
      allocateOnDayOfPeriodStart: data.allocateOnDayOfPeriodStart,
    }

    try {
      if (isEdit && period) {
        await updateMutation.mutateAsync({
          id: period._id,
          data: submitData,
        })
        toast.success('تم تحديث الفترة بنجاح')
      } else {
        const newPeriod = await createMutation.mutateAsync(submitData)
        toast.success('تم إنشاء الفترة بنجاح')

        // If allocate now is checked, allocate leaves for the period
        if (allocateNow && newPeriod._id) {
          try {
            const result = await allocateMutation.mutateAsync({
              periodId: newPeriod._id,
              data: {},
            })
            toast.success(
              `تم تخصيص الإجازات بنجاح لـ ${result.employeesProcessed} موظف`,
              {
                description: `تم إنشاء ${result.allocationsCreated} تخصيص إجازة`,
              }
            )
          } catch (error: any) {
            toast.error('حدث خطأ في تخصيص الإجازات', {
              description: error?.message,
            })
          }
        }
      }
      onOpenChange(false)
    } catch (error: any) {
      toast.error(error?.message || 'حدث خطأ')
    }
  }

  const isPending = createMutation.isPending || updateMutation.isPending || allocateMutation.isPending

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle className="text-xl font-bold text-navy flex items-center gap-2">
            <Calendar className="w-5 h-5" />
            {isEdit ? 'تعديل فترة الإجازات' : 'إنشاء فترة إجازات جديدة'}
          </DialogTitle>
          <DialogDescription>
            {isEdit
              ? 'قم بتعديل تفاصيل فترة الإجازات'
              : 'قم بإنشاء فترة إجازات جديدة لتخصيص الإجازات للموظفين'}
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>اسم الفترة (إنجليزي)</FormLabel>
                    <FormControl>
                      <Input placeholder="2024 Annual Leave Period" {...field} />
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
                    <FormLabel>اسم الفترة (عربي)</FormLabel>
                    <FormControl>
                      <Input placeholder="فترة الإجازات السنوية 2024" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="fromDate"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>تاريخ البداية</FormLabel>
                    <FormControl>
                      <Input type="date" {...field} />
                    </FormControl>
                    <FormDescription>بداية فترة الإجازات</FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="toDate"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>تاريخ النهاية</FormLabel>
                    <FormControl>
                      <Input type="date" {...field} />
                    </FormControl>
                    <FormDescription>نهاية فترة الإجازات</FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="company"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>الشركة (اختياري)</FormLabel>
                  <FormControl>
                    <Input placeholder="اسم الشركة" {...field} />
                  </FormControl>
                  <FormDescription>
                    اترك فارغاً لتطبيق الفترة على جميع الشركات
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="space-y-4 rounded-lg border border-slate-200 p-4">
              <h4 className="text-sm font-medium text-navy">الإعدادات</h4>

              <FormField
                control={form.control}
                name="isActive"
                render={({ field }) => (
                  <FormItem className="flex items-center justify-between rounded-lg border border-slate-100 p-3">
                    <div className="space-y-0.5">
                      <FormLabel className="text-sm font-medium">تفعيل الفترة</FormLabel>
                      <FormDescription className="text-xs">
                        جعل هذه الفترة نشطة للموظفين
                      </FormDescription>
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

              <FormField
                control={form.control}
                name="autoAllocateLeaves"
                render={({ field }) => (
                  <FormItem className="flex items-center justify-between rounded-lg border border-slate-100 p-3">
                    <div className="space-y-0.5">
                      <FormLabel className="text-sm font-medium">التخصيص التلقائي</FormLabel>
                      <FormDescription className="text-xs">
                        تخصيص الإجازات تلقائياً للموظفين
                      </FormDescription>
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

              <FormField
                control={form.control}
                name="allocateOnDayOfPeriodStart"
                render={({ field }) => (
                  <FormItem className="flex items-center justify-between rounded-lg border border-slate-100 p-3">
                    <div className="space-y-0.5">
                      <FormLabel className="text-sm font-medium">التخصيص في يوم البداية</FormLabel>
                      <FormDescription className="text-xs">
                        تخصيص الإجازات في اليوم الأول من الفترة
                      </FormDescription>
                    </div>
                    <FormControl>
                      <Switch
                        checked={field.value}
                        onCheckedChange={field.onChange}
                        disabled={!form.watch('autoAllocateLeaves')}
                      />
                    </FormControl>
                  </FormItem>
                )}
              />

              {!isEdit && (
                <div className="flex items-center justify-between rounded-lg border border-emerald-100 bg-emerald-50/50 p-3">
                  <div className="space-y-0.5">
                    <p className="text-sm font-medium text-emerald-900">تخصيص الإجازات الآن</p>
                    <p className="text-xs text-emerald-700">
                      تخصيص الإجازات مباشرة بعد إنشاء الفترة
                    </p>
                  </div>
                  <Switch
                    checked={allocateNow}
                    onCheckedChange={setAllocateNow}
                  />
                </div>
              )}
            </div>

            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => onOpenChange(false)}
                disabled={isPending}
              >
                إلغاء
              </Button>
              <Button
                type="submit"
                disabled={isPending}
                className="bg-emerald-500 hover:bg-emerald-600"
              >
                {isPending ? (
                  <>
                    <Loader2 className="w-4 h-4 ms-1 animate-spin" />
                    جاري الحفظ...
                  </>
                ) : (
                  isEdit ? 'حفظ التعديلات' : 'إنشاء الفترة'
                )}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  )
}
