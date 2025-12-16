import { useState, useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import * as z from 'zod'
import {
  useCreateCompensatoryLeaveRequest,
  useCalculateLeaveDays,
  useHolidayWorkRecords,
  useCompensatoryLeavePolicy,
} from '@/hooks/useCompensatoryLeave'
import type {
  CreateCompensatoryLeaveRequestData,
  WorkReason,
  CalculationMethod,
} from '@/services/compensatoryLeaveService'
import {
  WORK_REASON_LABELS,
  CALCULATION_METHOD_LABELS,
} from '@/services/compensatoryLeaveService'
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  Alert,
  AlertDescription,
  AlertTitle,
} from '@/components/ui/alert'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import { Badge } from '@/components/ui/badge'
import { useToast } from '@/hooks/use-toast'
import {
  Calendar,
  AlertCircle,
  CheckCircle,
  Info,
  Loader2,
  Calculator,
  Clock,
  Award,
  AlertTriangle,
} from 'lucide-react'
import { format } from 'date-fns'

// Form validation schema
const compensatoryLeaveFormSchema = z.object({
  employeeId: z.string().min(1, 'الرجاء اختيار الموظف'),
  workFromDate: z.string().min(1, 'الرجاء اختيار تاريخ بداية العمل'),
  workEndDate: z.string().min(1, 'الرجاء اختيار تاريخ نهاية العمل'),
  reason: z.enum(['holiday_work', 'weekend_work', 'overtime', 'emergency'], {
    required_error: 'الرجاء اختيار سبب العمل',
  }),
  reasonDetails: z.string().min(10, 'الرجاء إدخال تفاصيل السبب (10 أحرف على الأقل)'),
  reasonDetailsAr: z.string().optional(),
  holidayName: z.string().optional(),
  holidayNameAr: z.string().optional(),
  attendanceId: z.string().optional(),
  hoursWorked: z.number().min(1, 'الحد الأدنى ساعة واحدة').max(24, 'الحد الأقصى 24 ساعة'),
  calculationMethod: z.enum(['hour_based', 'day_based', 'half_day']).optional(),
  leaveType: z.string().optional(),
  validityMonths: z.number().min(1).max(12).optional(),
  employeeNotes: z.string().optional(),
})

type CompensatoryLeaveFormValues = z.infer<typeof compensatoryLeaveFormSchema>

interface CompensatoryLeaveDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  employeeId?: string
  onSuccess?: () => void
}

// Mock employee list - In production, this would come from an API
const MOCK_EMPLOYEES = [
  { id: '1', nameAr: 'أحمد محمد السعيد', nameEn: 'Ahmed Mohammed Al-Said', number: 'EMP001' },
  { id: '2', nameAr: 'فاطمة علي الأحمد', nameEn: 'Fatima Ali Al-Ahmad', number: 'EMP002' },
  { id: '3', nameAr: 'محمد عبدالله الخالد', nameEn: 'Mohammed Abdullah Al-Khalid', number: 'EMP003' },
]

export function CompensatoryLeaveDialog({
  open,
  onOpenChange,
  employeeId: initialEmployeeId,
  onSuccess,
}: CompensatoryLeaveDialogProps) {
  const { toast } = useToast()
  const [selectedEmployee, setSelectedEmployee] = useState<string>(initialEmployeeId || '')
  const [selectedReason, setSelectedReason] = useState<WorkReason>('overtime')
  const [hoursWorked, setHoursWorked] = useState<number>(0)
  const [calculationMethod, setCalculationMethod] = useState<CalculationMethod>('hour_based')
  const [showCalculation, setShowCalculation] = useState(false)

  // Form
  const form = useForm<CompensatoryLeaveFormValues>({
    resolver: zodResolver(compensatoryLeaveFormSchema),
    defaultValues: {
      employeeId: initialEmployeeId || '',
      workFromDate: format(new Date(), 'yyyy-MM-dd'),
      workEndDate: format(new Date(), 'yyyy-MM-dd'),
      reason: 'overtime',
      reasonDetails: '',
      reasonDetailsAr: '',
      holidayName: '',
      holidayNameAr: '',
      attendanceId: '',
      hoursWorked: 0,
      calculationMethod: 'hour_based',
      leaveType: 'compensatory',
      validityMonths: 3,
      employeeNotes: '',
    },
  })

  // Mutations and Queries
  const createRequestMutation = useCreateCompensatoryLeaveRequest()
  const calculateMutation = useCalculateLeaveDays()
  const { data: policy } = useCompensatoryLeavePolicy()

  // Get holiday work records when employee is selected
  const {
    data: holidayRecords,
    isLoading: isLoadingRecords,
  } = useHolidayWorkRecords(
    selectedEmployee,
    {
      fromDate: format(new Date(Date.now() - 90 * 24 * 60 * 60 * 1000), 'yyyy-MM-dd'),
      toDate: format(new Date(), 'yyyy-MM-dd'),
      withoutCompLeave: true,
    }
  )

  // Update selected values when form changes
  useEffect(() => {
    const subscription = form.watch((value, { name }) => {
      if (name === 'employeeId') {
        setSelectedEmployee(value.employeeId || '')
      }
      if (name === 'reason') {
        setSelectedReason(value.reason as WorkReason)
      }
      if (name === 'hoursWorked') {
        setHoursWorked(value.hoursWorked || 0)
      }
      if (name === 'calculationMethod') {
        setCalculationMethod(value.calculationMethod as CalculationMethod)
      }
    })
    return () => subscription.unsubscribe()
  }, [form.watch])

  // Calculate leave days when hours/method change
  const handleCalculate = async () => {
    if (hoursWorked <= 0) {
      toast({
        title: 'بيانات غير مكتملة',
        description: 'الرجاء إدخال عدد الساعات',
        variant: 'destructive',
      })
      return
    }

    try {
      await calculateMutation.mutateAsync({
        hoursWorked,
        method: calculationMethod,
        reason: selectedReason,
      })
      setShowCalculation(true)
    } catch (error: any) {
      toast({
        title: 'فشل الحساب',
        description: error.message || 'فشل حساب أيام الإجازة',
        variant: 'destructive',
      })
    }
  }

  // Submit form
  const onSubmit = async (values: CompensatoryLeaveFormValues) => {
    try {
      const data: CreateCompensatoryLeaveRequestData = {
        employeeId: values.employeeId,
        workFromDate: values.workFromDate,
        workEndDate: values.workEndDate,
        reason: values.reason,
        reasonDetails: values.reasonDetails,
        reasonDetailsAr: values.reasonDetailsAr,
        holidayName: values.holidayName,
        holidayNameAr: values.holidayNameAr,
        attendanceId: values.attendanceId,
        hoursWorked: values.hoursWorked,
        calculationMethod: values.calculationMethod,
        leaveType: values.leaveType,
        validityMonths: values.validityMonths,
        notes: {
          employeeNotes: values.employeeNotes,
        },
      }

      await createRequestMutation.mutateAsync(data)

      toast({
        title: 'نجح إنشاء الطلب',
        description: 'تم إنشاء طلب الإجازة التعويضية بنجاح',
      })

      form.reset()
      setShowCalculation(false)
      onOpenChange(false)
      onSuccess?.()
    } catch (error: any) {
      toast({
        title: 'فشل إنشاء الطلب',
        description: error.message || 'فشل إنشاء طلب الإجازة التعويضية',
        variant: 'destructive',
      })
    }
  }

  // Load attendance record data
  const handleLoadAttendance = (attendanceId: string) => {
    const record = holidayRecords?.find((r) => r.attendanceId === attendanceId)
    if (record) {
      form.setValue('workFromDate', record.date)
      form.setValue('workEndDate', record.date)
      form.setValue('hoursWorked', record.hoursWorked)
      form.setValue('attendanceId', record.attendanceId)

      if (record.isHoliday) {
        form.setValue('reason', 'holiday_work')
        form.setValue('holidayName', record.holidayName)
        form.setValue('holidayNameAr', record.holidayNameAr)
      } else if (record.isWeekend) {
        form.setValue('reason', 'weekend_work')
      }

      toast({
        title: 'تم تحميل البيانات',
        description: 'تم تحميل بيانات سجل الحضور بنجاح',
      })
    }
  }

  const calculation = calculateMutation.data
  const isSubmitting = createRequestMutation.isPending

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>طلب إجازة تعويضية جديد</DialogTitle>
          <DialogDescription>
            إنشاء طلب إجازة تعويضية للعمل الإضافي أو العمل في العطل
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            {/* Policy Information */}
            {policy && (
              <Alert>
                <Info className="h-4 w-4" />
                <AlertTitle>سياسة الإجازة التعويضية</AlertTitle>
                <AlertDescription className="space-y-1">
                  <p>• مدة الصلاحية: {policy.defaultValidityMonths} أشهر</p>
                  <p>• الحد الأقصى سنوياً: {policy.maxDaysPerYear} يوم</p>
                  <p>
                    • ساعات العمل القياسية: {policy.calculationRules.standardWorkingHours} ساعة/يوم
                  </p>
                  <p>
                    • معدل العمل الإضافي العادي: {policy.calculationRules.overtimeRateRegular}x
                  </p>
                  <p>
                    • معدل العمل في العطل: {policy.calculationRules.overtimeRateHoliday}x
                  </p>
                </AlertDescription>
              </Alert>
            )}

            {/* Employee Selection */}
            <FormField
              control={form.control}
              name="employeeId"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>الموظف *</FormLabel>
                  <Select onValueChange={field.onChange} value={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="اختر الموظف" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {MOCK_EMPLOYEES.map((emp) => (
                        <SelectItem key={emp.id} value={emp.id}>
                          {emp.nameAr} ({emp.number})
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Holiday Work Records */}
            {selectedEmployee && holidayRecords && holidayRecords.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle className="text-sm">سجلات العمل في العطل</CardTitle>
                  <CardDescription>
                    يمكنك تحميل البيانات من سجلات الحضور السابقة
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    {holidayRecords.map((record) => (
                      <div
                        key={record.attendanceId}
                        className="flex items-center justify-between p-3 border rounded-lg hover:bg-muted/50 cursor-pointer"
                        onClick={() => handleLoadAttendance(record.attendanceId)}
                      >
                        <div className="flex-1">
                          <div className="font-medium">
                            {format(new Date(record.date), 'dd/MM/yyyy')} - {record.dayOfWeek}
                          </div>
                          <div className="text-sm text-muted-foreground">
                            {record.isHoliday && (
                              <Badge variant="destructive" className="mr-2">
                                {record.holidayNameAr || record.holidayName}
                              </Badge>
                            )}
                            {record.isWeekend && (
                              <Badge variant="secondary" className="mr-2">
                                عطلة نهاية الأسبوع
                              </Badge>
                            )}
                            {record.hoursWorked} ساعة عمل
                          </div>
                        </div>
                        <Button type="button" variant="outline" size="sm">
                          تحميل
                        </Button>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Work Details */}
            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="workFromDate"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>تاريخ بداية العمل *</FormLabel>
                    <FormControl>
                      <Input type="date" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="workEndDate"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>تاريخ نهاية العمل *</FormLabel>
                    <FormControl>
                      <Input type="date" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            {/* Reason */}
            <FormField
              control={form.control}
              name="reason"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>سبب العمل *</FormLabel>
                  <Select onValueChange={field.onChange} value={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="اختر سبب العمل" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {Object.entries(WORK_REASON_LABELS).map(([key, label]) => (
                        <SelectItem key={key} value={key}>
                          {label.ar}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormDescription>
                    القانون السعودي: معدل 1.5x للعمل الإضافي، 2x للعطل الرسمية
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Holiday Name (if reason is holiday_work) */}
            {selectedReason === 'holiday_work' && (
              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="holidayName"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>اسم العطلة (English)</FormLabel>
                      <FormControl>
                        <Input {...field} placeholder="e.g., National Day" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="holidayNameAr"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>اسم العطلة (عربي)</FormLabel>
                      <FormControl>
                        <Input {...field} placeholder="مثال: اليوم الوطني" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            )}

            {/* Reason Details */}
            <FormField
              control={form.control}
              name="reasonDetails"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>تفاصيل السبب *</FormLabel>
                  <FormControl>
                    <Textarea
                      {...field}
                      placeholder="الرجاء شرح سبب العمل بالتفصيل..."
                      rows={3}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Hours and Calculation */}
            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="hoursWorked"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>عدد ساعات العمل *</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        step="0.5"
                        min="0"
                        max="24"
                        {...field}
                        onChange={(e) => field.onChange(parseFloat(e.target.value) || 0)}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="calculationMethod"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>طريقة الحساب</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="اختر طريقة الحساب" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {Object.entries(CALCULATION_METHOD_LABELS).map(([key, label]) => (
                          <SelectItem key={key} value={key}>
                            {label.ar}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            {/* Calculate Button */}
            <Button
              type="button"
              variant="outline"
              onClick={handleCalculate}
              disabled={calculateMutation.isPending || hoursWorked <= 0}
              className="w-full"
            >
              {calculateMutation.isPending ? (
                <>
                  <Loader2 className="h-4 w-4 ml-2 animate-spin" />
                  جاري الحساب...
                </>
              ) : (
                <>
                  <Calculator className="h-4 w-4 ml-2" />
                  احسب أيام الإجازة
                </>
              )}
            </Button>

            {/* Calculation Result */}
            {showCalculation && calculation && (
              <Alert className="border-emerald-500 bg-emerald-50">
                <Award className="h-4 w-4 text-emerald-600" />
                <AlertTitle className="text-emerald-900">نتيجة الحساب</AlertTitle>
                <AlertDescription className="space-y-2 text-emerald-800">
                  <div className="flex justify-between items-center font-bold text-lg">
                    <span>الأيام المكتسبة:</span>
                    <span>{calculation.leaveDaysEarned} يوم</span>
                  </div>
                  <div className="text-sm space-y-1 border-t border-emerald-200 pt-2 mt-2">
                    <p>• ساعات العمل القياسية: {calculation.calculation.standardWorkingHours} ساعة</p>
                    {calculation.calculation.overtimeHours && (
                      <p>• ساعات إضافية: {calculation.calculation.overtimeHours} ساعة</p>
                    )}
                    {calculation.calculation.overtimeRate && (
                      <p>• معدل العمل الإضافي: {calculation.calculation.overtimeRate}x</p>
                    )}
                    <p>• الصيغة: {calculation.calculation.formulaAr || calculation.calculation.formula}</p>
                  </div>
                  {calculation.compliance.compliant ? (
                    <div className="flex items-center gap-2 text-emerald-700 text-sm">
                      <CheckCircle className="h-4 w-4" />
                      <span>متوافق مع نظام العمل السعودي {calculation.compliance.article}</span>
                    </div>
                  ) : (
                    <div className="flex items-center gap-2 text-orange-600 text-sm">
                      <AlertTriangle className="h-4 w-4" />
                      <span>{calculation.compliance.notesAr || calculation.compliance.notes}</span>
                    </div>
                  )}
                </AlertDescription>
              </Alert>
            )}

            {/* Validity Period */}
            <FormField
              control={form.control}
              name="validityMonths"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>مدة الصلاحية (بالأشهر)</FormLabel>
                  <FormControl>
                    <Input
                      type="number"
                      min="1"
                      max="12"
                      {...field}
                      onChange={(e) => field.onChange(parseInt(e.target.value) || 3)}
                    />
                  </FormControl>
                  <FormDescription>
                    الافتراضي: 3 أشهر (حسب سياسة الشركة)
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Employee Notes */}
            <FormField
              control={form.control}
              name="employeeNotes"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>ملاحظات إضافية</FormLabel>
                  <FormControl>
                    <Textarea
                      {...field}
                      placeholder="أي ملاحظات أو معلومات إضافية..."
                      rows={3}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => onOpenChange(false)}
                disabled={isSubmitting}
              >
                إلغاء
              </Button>
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting ? (
                  <>
                    <Loader2 className="h-4 w-4 ml-2 animate-spin" />
                    جاري الإنشاء...
                  </>
                ) : (
                  'إنشاء الطلب'
                )}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  )
}
