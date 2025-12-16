import { useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import * as z from 'zod'
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
  FormDescription,
} from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { useCreateStaffingPlan, useUpdateStaffingPlan } from '@/hooks/useStaffingPlan'
import type { StaffingPlan } from '@/services/staffingPlanService'
import { Calendar } from '@/components/ui/calendar'
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover'
import { CalendarIcon } from 'lucide-react'
import { format } from 'date-fns'
import { ar } from 'date-fns/locale'
import { cn } from '@/lib/utils'

const formSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  nameAr: z.string().optional(),
  company: z.string().optional(),
  fromDate: z.date({ required_error: 'From date is required' }),
  toDate: z.date({ required_error: 'To date is required' }),
  status: z.enum(['draft', 'active', 'closed']).default('draft'),
  notes: z.string().optional(),
  notesAr: z.string().optional(),
}).refine((data) => data.toDate > data.fromDate, {
  message: 'To date must be after from date',
  path: ['toDate'],
})

type FormValues = z.infer<typeof formSchema>

interface StaffingPlanDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  plan?: StaffingPlan
}

export function StaffingPlanDialog({
  open,
  onOpenChange,
  plan,
}: StaffingPlanDialogProps) {
  const { t, i18n } = useTranslation()
  const isArabic = i18n.language === 'ar'

  const createMutation = useCreateStaffingPlan()
  const updateMutation = useUpdateStaffingPlan()

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: '',
      nameAr: '',
      company: '',
      fromDate: new Date(),
      toDate: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000), // 1 year from now
      status: 'draft',
      notes: '',
      notesAr: '',
    },
  })

  // Reset form when plan changes
  useEffect(() => {
    if (plan) {
      form.reset({
        name: plan.name,
        nameAr: plan.nameAr || '',
        company: plan.company || '',
        fromDate: new Date(plan.fromDate),
        toDate: new Date(plan.toDate),
        status: plan.status,
        notes: plan.notes || '',
        notesAr: plan.notesAr || '',
      })
    } else {
      form.reset({
        name: '',
        nameAr: '',
        company: '',
        fromDate: new Date(),
        toDate: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000),
        status: 'draft',
        notes: '',
        notesAr: '',
      })
    }
  }, [plan, form])

  const onSubmit = async (data: FormValues) => {
    try {
      const payload = {
        ...data,
        fromDate: data.fromDate.toISOString(),
        toDate: data.toDate.toISOString(),
      }

      if (plan) {
        await updateMutation.mutateAsync({
          planId: plan._id,
          data: payload,
        })
      } else {
        await createMutation.mutateAsync(payload)
      }

      onOpenChange(false)
      form.reset()
    } catch (error) {
      console.error('Error saving staffing plan:', error)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {plan
              ? isArabic
                ? 'تعديل خطة التوظيف'
                : 'Edit Staffing Plan'
              : isArabic
              ? 'خطة توظيف جديدة'
              : 'New Staffing Plan'}
          </DialogTitle>
          <DialogDescription>
            {isArabic
              ? 'أدخل تفاصيل خطة التوظيف. سيتم حساب الشواغر تلقائياً.'
              : 'Enter the staffing plan details. Vacancies will be calculated automatically.'}
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            {/* Plan Name */}
            <div className="grid gap-4 md:grid-cols-2">
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>
                      {isArabic ? 'اسم الخطة' : 'Plan Name'} *
                    </FormLabel>
                    <FormControl>
                      <Input
                        placeholder={
                          isArabic
                            ? 'خطة التوظيف السنوية 2024'
                            : 'Annual Staffing Plan 2024'
                        }
                        {...field}
                      />
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
                    <FormLabel>{isArabic ? 'الاسم بالعربية' : 'Arabic Name'}</FormLabel>
                    <FormControl>
                      <Input
                        placeholder={
                          isArabic
                            ? 'خطة التوظيف السنوية 2024'
                            : 'خطة التوظيف السنوية 2024'
                        }
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            {/* Company */}
            <FormField
              control={form.control}
              name="company"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{isArabic ? 'الشركة' : 'Company'}</FormLabel>
                  <FormControl>
                    <Input
                      placeholder={isArabic ? 'اسم الشركة' : 'Company name'}
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Period */}
            <div className="grid gap-4 md:grid-cols-2">
              <FormField
                control={form.control}
                name="fromDate"
                render={({ field }) => (
                  <FormItem className="flex flex-col">
                    <FormLabel>
                      {isArabic ? 'من تاريخ' : 'From Date'} *
                    </FormLabel>
                    <Popover>
                      <PopoverTrigger asChild>
                        <FormControl>
                          <Button
                            variant="outline"
                            className={cn(
                              'w-full pl-3 text-left font-normal',
                              !field.value && 'text-muted-foreground'
                            )}
                          >
                            {field.value ? (
                              format(field.value, 'PPP', {
                                locale: isArabic ? ar : undefined,
                              })
                            ) : (
                              <span>{isArabic ? 'اختر التاريخ' : 'Pick a date'}</span>
                            )}
                            <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                          </Button>
                        </FormControl>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0" align="start">
                        <Calendar
                          mode="single"
                          selected={field.value}
                          onSelect={field.onChange}
                          initialFocus
                        />
                      </PopoverContent>
                    </Popover>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="toDate"
                render={({ field }) => (
                  <FormItem className="flex flex-col">
                    <FormLabel>
                      {isArabic ? 'إلى تاريخ' : 'To Date'} *
                    </FormLabel>
                    <Popover>
                      <PopoverTrigger asChild>
                        <FormControl>
                          <Button
                            variant="outline"
                            className={cn(
                              'w-full pl-3 text-left font-normal',
                              !field.value && 'text-muted-foreground'
                            )}
                          >
                            {field.value ? (
                              format(field.value, 'PPP', {
                                locale: isArabic ? ar : undefined,
                              })
                            ) : (
                              <span>{isArabic ? 'اختر التاريخ' : 'Pick a date'}</span>
                            )}
                            <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                          </Button>
                        </FormControl>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0" align="start">
                        <Calendar
                          mode="single"
                          selected={field.value}
                          onSelect={field.onChange}
                          initialFocus
                        />
                      </PopoverContent>
                    </Popover>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            {/* Status */}
            <FormField
              control={form.control}
              name="status"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{isArabic ? 'الحالة' : 'Status'}</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="draft">
                        {isArabic ? 'مسودة' : 'Draft'}
                      </SelectItem>
                      <SelectItem value="active">
                        {isArabic ? 'نشط' : 'Active'}
                      </SelectItem>
                      <SelectItem value="closed">
                        {isArabic ? 'مغلق' : 'Closed'}
                      </SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Notes */}
            <div className="grid gap-4 md:grid-cols-2">
              <FormField
                control={form.control}
                name="notes"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{isArabic ? 'الملاحظات' : 'Notes'}</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder={
                          isArabic
                            ? 'أدخل أي ملاحظات...'
                            : 'Enter any notes...'
                        }
                        rows={3}
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="notesAr"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>
                      {isArabic ? 'الملاحظات بالعربية' : 'Notes (Arabic)'}
                    </FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder={isArabic ? 'ملاحظات...' : 'Notes...'}
                        rows={3}
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => onOpenChange(false)}
              >
                {isArabic ? 'إلغاء' : 'Cancel'}
              </Button>
              <Button
                type="submit"
                disabled={createMutation.isPending || updateMutation.isPending}
              >
                {createMutation.isPending || updateMutation.isPending
                  ? isArabic
                    ? 'جاري الحفظ...'
                    : 'Saving...'
                  : plan
                  ? isArabic
                    ? 'تحديث'
                    : 'Update'
                  : isArabic
                  ? 'إنشاء'
                  : 'Create'}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  )
}
