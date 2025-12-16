import { useState, useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import * as z from 'zod'
import {
  useCreateLeaveEncashment,
  useCalculateEncashmentAmount,
  useEncashableBalance,
} from '@/hooks/useLeaveEncashment'
import type { CreateLeaveEncashmentData } from '@/services/leaveEncashmentService'
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
  DollarSign,
  Calendar,
  AlertCircle,
  CheckCircle,
  Info,
  Loader2,
  Calculator,
} from 'lucide-react'

// Form validation schema
const encashmentFormSchema = z.object({
  employeeId: z.string().min(1, 'الرجاء اختيار الموظف'),
  leaveType: z.string().min(1, 'الرجاء اختيار نوع الإجازة'),
  encashmentDays: z.number().min(1, 'الحد الأدنى يوم واحد').max(365, 'عدد الأيام غير صحيح'),
  notes: z.string().optional(),
  employeeNotes: z.string().optional(),
})

type EncashmentFormValues = z.infer<typeof encashmentFormSchema>

interface LeaveEncashmentDialogProps {
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

const LEAVE_TYPES = [
  { value: 'annual', labelAr: 'إجازة سنوية', labelEn: 'Annual Leave' },
  { value: 'sick', labelAr: 'إجازة مرضية', labelEn: 'Sick Leave' },
]

export function LeaveEncashmentDialog({
  open,
  onOpenChange,
  employeeId: initialEmployeeId,
  onSuccess,
}: LeaveEncashmentDialogProps) {
  const { toast } = useToast()
  const [selectedEmployee, setSelectedEmployee] = useState<string>(initialEmployeeId || '')
  const [selectedLeaveType, setSelectedLeaveType] = useState<string>('annual')
  const [daysToEncash, setDaysToEncash] = useState<number>(0)
  const [showCalculation, setShowCalculation] = useState(false)

  // Form
  const form = useForm<EncashmentFormValues>({
    resolver: zodResolver(encashmentFormSchema),
    defaultValues: {
      employeeId: initialEmployeeId || '',
      leaveType: 'annual',
      encashmentDays: 0,
      notes: '',
      employeeNotes: '',
    },
  })

  // Mutations and Queries
  const createEncashmentMutation = useCreateLeaveEncashment()
  const calculateMutation = useCalculateEncashmentAmount()

  // Get eligibility when employee and leave type are selected
  const {
    data: eligibility,
    isLoading: isLoadingEligibility,
    refetch: refetchEligibility,
  } = useEncashableBalance(selectedEmployee, selectedLeaveType)

  // Update selected employee when it changes
  useEffect(() => {
    const subscription = form.watch((value, { name }) => {
      if (name === 'employeeId') {
        setSelectedEmployee(value.employeeId || '')
      }
      if (name === 'leaveType') {
        setSelectedLeaveType(value.leaveType || 'annual')
      }
      if (name === 'encashmentDays') {
        setDaysToEncash(value.encashmentDays || 0)
      }
    })
    return () => subscription.unsubscribe()
  }, [form.watch])

  // Calculate amount when days change
  const handleCalculate = async () => {
    if (!selectedEmployee || !selectedLeaveType || daysToEncash <= 0) {
      toast({
        title: 'بيانات غير مكتملة',
        description: 'الرجاء تعبئة جميع الحقول المطلوبة',
        variant: 'destructive',
      })
      return
    }

    try {
      await calculateMutation.mutateAsync({
        employeeId: selectedEmployee,
        leaveType: selectedLeaveType,
        days: daysToEncash,
      })
      setShowCalculation(true)
    } catch (error: any) {
      toast({
        title: 'فشل الحساب',
        description: error.message || 'فشل حساب مبلغ الصرف',
        variant: 'destructive',
      })
    }
  }

  // Submit form
  const onSubmit = async (values: EncashmentFormValues) => {
    try {
      const data: CreateLeaveEncashmentData = {
        employeeId: values.employeeId,
        leaveType: values.leaveType,
        encashmentDays: values.encashmentDays,
        notes: values.notes,
        employeeNotes: values.employeeNotes,
      }

      await createEncashmentMutation.mutateAsync(data)

      toast({
        title: 'نجح إنشاء الطلب',
        description: 'تم إنشاء طلب صرف الإجازة بنجاح',
      })

      form.reset()
      setShowCalculation(false)
      onOpenChange(false)
      onSuccess?.()
    } catch (error: any) {
      toast({
        title: 'فشل إنشاء الطلب',
        description: error.message || 'فشل إنشاء طلب صرف الإجازة',
        variant: 'destructive',
      })
    }
  }

  // Format currency
  const formatCurrency = (amount: number, currency = 'SAR') => {
    return new Intl.NumberFormat('ar-SA', {
      style: 'currency',
      currency: currency,
    }).format(amount)
  }

  // Reset when dialog closes
  useEffect(() => {
    if (!open) {
      form.reset()
      setShowCalculation(false)
      setSelectedEmployee(initialEmployeeId || '')
      setSelectedLeaveType('annual')
      setDaysToEncash(0)
    }
  }, [open, form.reset, initialEmployeeId])

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>طلب صرف إجازة جديد</DialogTitle>
          <DialogDescription>
            قم بتعبئة البيانات أدناه لإنشاء طلب صرف إجازة وفقاً لسياسة الشركة ونظام العمل السعودي
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
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

            {/* Leave Type Selection */}
            <FormField
              control={form.control}
              name="leaveType"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>نوع الإجازة *</FormLabel>
                  <Select onValueChange={field.onChange} value={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="اختر نوع الإجازة" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {LEAVE_TYPES.map((type) => (
                        <SelectItem key={type.value} value={type.value}>
                          {type.labelAr}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormDescription>
                    نوع الإجازة المراد صرفها
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Eligibility Information */}
            {selectedEmployee && selectedLeaveType && (
              <Card>
                <CardHeader>
                  <CardTitle className="text-base">معلومات الأهلية</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {isLoadingEligibility ? (
                    <div className="space-y-2">
                      <Skeleton className="h-4 w-full" />
                      <Skeleton className="h-4 w-3/4" />
                    </div>
                  ) : eligibility ? (
                    <>
                      {eligibility.eligible ? (
                        <Alert>
                          <CheckCircle className="h-4 w-4" />
                          <AlertTitle>مؤهل للصرف</AlertTitle>
                          <AlertDescription>
                            يمكن صرف الإجازة وفقاً لسياسة الشركة
                          </AlertDescription>
                        </Alert>
                      ) : (
                        <Alert variant="destructive">
                          <AlertCircle className="h-4 w-4" />
                          <AlertTitle>غير مؤهل للصرف</AlertTitle>
                          <AlertDescription>
                            {eligibility.reasonAr || eligibility.reason}
                          </AlertDescription>
                        </Alert>
                      )}

                      <div className="grid grid-cols-2 gap-4 text-sm">
                        <div>
                          <div className="text-muted-foreground">رصيد الإجازات</div>
                          <div className="font-medium text-lg">{eligibility.leaveBalance} يوم</div>
                        </div>
                        <div>
                          <div className="text-muted-foreground">الأيام القابلة للصرف</div>
                          <div className="font-medium text-lg">{eligibility.encashableDays} يوم</div>
                        </div>
                        <div>
                          <div className="text-muted-foreground">الحد الأقصى للصرف</div>
                          <div className="font-medium text-lg">{eligibility.maxEncashableDays} يوم</div>
                        </div>
                        <div>
                          <div className="text-muted-foreground">الحد الأدنى المطلوب</div>
                          <div className="font-medium text-lg">{eligibility.minBalanceRequired} يوم</div>
                        </div>
                        <div>
                          <div className="text-muted-foreground">الراتب الأساسي</div>
                          <div className="font-medium text-lg">{formatCurrency(eligibility.basicSalary)}</div>
                        </div>
                        <div>
                          <div className="text-muted-foreground">المعدل اليومي</div>
                          <div className="font-medium text-lg">{formatCurrency(eligibility.dailyRate)}</div>
                        </div>
                      </div>

                      {/* Policy Rules */}
                      {eligibility.policyRules && eligibility.policyRules.length > 0 && (
                        <div className="space-y-2">
                          <div className="text-sm font-medium">قواعد السياسة:</div>
                          {eligibility.policyRules.map((rule, index) => (
                            <div key={index} className="flex items-start gap-2 text-sm">
                              {rule.satisfied ? (
                                <CheckCircle className="h-4 w-4 text-green-500 mt-0.5" />
                              ) : (
                                <AlertCircle className="h-4 w-4 text-destructive mt-0.5" />
                              )}
                              <div>
                                <div>{rule.ruleAr || rule.rule}</div>
                                {rule.details && (
                                  <div className="text-muted-foreground text-xs">{rule.details}</div>
                                )}
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </>
                  ) : (
                    <Alert>
                      <Info className="h-4 w-4" />
                      <AlertDescription>
                        اختر الموظف ونوع الإجازة لعرض معلومات الأهلية
                      </AlertDescription>
                    </Alert>
                  )}
                </CardContent>
              </Card>
            )}

            {/* Days to Encash */}
            <FormField
              control={form.control}
              name="encashmentDays"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>عدد الأيام المراد صرفها *</FormLabel>
                  <div className="flex gap-2">
                    <FormControl>
                      <Input
                        type="number"
                        min={1}
                        max={eligibility?.encashableDays || 365}
                        {...field}
                        onChange={(e) => field.onChange(parseInt(e.target.value) || 0)}
                        placeholder="أدخل عدد الأيام"
                      />
                    </FormControl>
                    <Button
                      type="button"
                      variant="outline"
                      onClick={handleCalculate}
                      disabled={!selectedEmployee || !selectedLeaveType || !daysToEncash}
                    >
                      <Calculator className="h-4 w-4 ml-2" />
                      احسب
                    </Button>
                  </div>
                  <FormDescription>
                    الحد الأقصى: {eligibility?.encashableDays || 0} يوم
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Calculation Result */}
            {showCalculation && calculateMutation.data && (
              <Card className="bg-primary/5">
                <CardHeader>
                  <CardTitle className="text-base flex items-center gap-2">
                    <DollarSign className="h-5 w-5" />
                    نتيجة الحساب
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <div className="text-muted-foreground">عدد الأيام</div>
                      <div className="font-medium">{calculateMutation.data.encashmentDays} يوم</div>
                    </div>
                    <div>
                      <div className="text-muted-foreground">المعدل اليومي</div>
                      <div className="font-medium">{formatCurrency(calculateMutation.data.dailyRate)}</div>
                    </div>
                  </div>
                  <div className="pt-3 border-t">
                    <div className="text-muted-foreground text-sm">مبلغ الصرف الإجمالي</div>
                    <div className="text-2xl font-bold text-primary">
                      {formatCurrency(calculateMutation.data.encashmentAmount, calculateMutation.data.currency)}
                    </div>
                  </div>
                  {calculateMutation.data.deductions && (
                    <div className="text-xs text-muted-foreground">
                      * المبلغ قبل الخصومات (إن وجدت)
                    </div>
                  )}
                </CardContent>
              </Card>
            )}

            {/* Notes */}
            <FormField
              control={form.control}
              name="employeeNotes"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>ملاحظات الموظف</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="أدخل أي ملاحظات أو تفاصيل إضافية..."
                      className="resize-none"
                      rows={3}
                      {...field}
                    />
                  </FormControl>
                  <FormDescription>
                    ملاحظات اختيارية حول طلب الصرف
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => onOpenChange(false)}
                disabled={createEncashmentMutation.isPending}
              >
                إلغاء
              </Button>
              <Button
                type="submit"
                disabled={createEncashmentMutation.isPending || !eligibility?.eligible}
              >
                {createEncashmentMutation.isPending && (
                  <Loader2 className="h-4 w-4 ml-2 animate-spin" />
                )}
                إنشاء الطلب
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  )
}
