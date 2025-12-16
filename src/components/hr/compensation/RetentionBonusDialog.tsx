import { useState, useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import * as z from 'zod'
import { useTranslation } from 'react-i18next'
import {
  useCreateRetentionBonus,
  useUpdateRetentionBonus,
} from '@/hooks/useRetentionBonus'
import type { RetentionBonus, CreateRetentionBonusInput } from '@/services/retentionBonusService'
import {
  BonusType,
  PaymentMethod,
  bonusTypeLabels,
  paymentMethodLabels,
} from '@/services/retentionBonusService'
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
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { Switch } from '@/components/ui/switch'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Separator } from '@/components/ui/separator'
import { Label } from '@/components/ui/label'
import {
  Loader2,
  DollarSign,
  Calendar,
  Info,
  AlertCircle,
  Users,
  FileText,
  Clock,
  Shield,
} from 'lucide-react'
import { cn } from '@/lib/utils'

// Form validation schema
const bonusFormSchema = z.object({
  employeeId: z.string().min(1, 'الرجاء اختيار الموظف'),
  employeeName: z.string().min(1, 'اسم الموظف مطلوب'),
  employeeNameAr: z.string().min(1, 'اسم الموظف بالعربي مطلوب'),
  departmentId: z.string().min(1, 'الرجاء اختيار القسم'),
  designation: z.string().min(1, 'المسمى الوظيفي مطلوب'),
  bonusType: z.nativeEnum(BonusType),
  bonusAmount: z.number().min(1, 'المبلغ يجب أن يكون أكبر من صفر'),
  currency: z.string().default('SAR'),
  paymentDate: z.string().min(1, 'تاريخ الدفع مطلوب'),
  paymentMethod: z.nativeEnum(PaymentMethod),
  conditionsForPayment: z.string().min(1, 'شروط الدفع مطلوبة'),
  conditionsForPaymentAr: z.string().min(1, 'شروط الدفع بالعربي مطلوبة'),
  reasonForGiving: z.string().min(1, 'سبب المكافأة مطلوب'),
  reasonForGivingAr: z.string().min(1, 'سبب المكافأة بالعربي مطلوب'),
  vestingPeriod: z.number().optional(),
  vestingStartDate: z.string().optional(),
  vestingEndDate: z.string().optional(),
  clawbackApplicable: z.boolean().default(false),
  clawbackConditions: z.string().optional(),
  clawbackPeriod: z.number().optional(),
})

type BonusFormValues = z.infer<typeof bonusFormSchema>

interface RetentionBonusDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  bonus?: RetentionBonus
  onSuccess?: () => void
}

// Mock employee list - In production, this would come from an API
const MOCK_EMPLOYEES = [
  {
    id: '1',
    nameAr: 'أحمد محمد السعيد',
    nameEn: 'Ahmed Mohammed Al-Said',
    number: 'EMP001',
    departmentId: 'dept1',
    designation: 'Senior Developer'
  },
  {
    id: '2',
    nameAr: 'فاطمة علي الأحمد',
    nameEn: 'Fatima Ali Al-Ahmad',
    number: 'EMP002',
    departmentId: 'dept2',
    designation: 'HR Manager'
  },
  {
    id: '3',
    nameAr: 'محمد عبدالله الخالد',
    nameEn: 'Mohammed Abdullah Al-Khalid',
    number: 'EMP003',
    departmentId: 'dept1',
    designation: 'Project Manager'
  },
]

const MOCK_DEPARTMENTS = [
  { id: 'dept1', nameAr: 'قسم التقنية', nameEn: 'IT Department' },
  { id: 'dept2', nameAr: 'قسم الموارد البشرية', nameEn: 'HR Department' },
  { id: 'dept3', nameAr: 'قسم المالية', nameEn: 'Finance Department' },
]

export function RetentionBonusDialog({
  open,
  onOpenChange,
  bonus,
  onSuccess,
}: RetentionBonusDialogProps) {
  const { i18n } = useTranslation()
  const isArabic = i18n.language === 'ar'
  const [selectedEmployee, setSelectedEmployee] = useState<typeof MOCK_EMPLOYEES[0] | null>(null)
  const [hasVesting, setHasVesting] = useState(false)

  // Form
  const form = useForm<BonusFormValues>({
    resolver: zodResolver(bonusFormSchema),
    defaultValues: {
      employeeId: '',
      employeeName: '',
      employeeNameAr: '',
      departmentId: '',
      designation: '',
      bonusType: BonusType.RETENTION,
      bonusAmount: 0,
      currency: 'SAR',
      paymentDate: '',
      paymentMethod: PaymentMethod.PAYROLL,
      conditionsForPayment: '',
      conditionsForPaymentAr: '',
      reasonForGiving: '',
      reasonForGivingAr: '',
      clawbackApplicable: false,
    },
  })

  // Mutations
  const createMutation = useCreateRetentionBonus()
  const updateMutation = useUpdateRetentionBonus()

  // Set form values when editing
  useEffect(() => {
    if (bonus) {
      form.reset({
        employeeId: bonus.employeeId,
        employeeName: bonus.employeeName,
        employeeNameAr: bonus.employeeNameAr,
        departmentId: bonus.departmentId,
        designation: bonus.designation,
        bonusType: bonus.bonusType,
        bonusAmount: bonus.bonusAmount,
        currency: bonus.currency,
        paymentDate: bonus.paymentDate.split('T')[0],
        paymentMethod: bonus.paymentMethod,
        conditionsForPayment: bonus.conditionsForPayment,
        conditionsForPaymentAr: bonus.conditionsForPaymentAr,
        reasonForGiving: bonus.reasonForGiving,
        reasonForGivingAr: bonus.reasonForGivingAr,
        vestingPeriod: bonus.vestingPeriod,
        vestingStartDate: bonus.vestingStartDate?.split('T')[0],
        vestingEndDate: bonus.vestingEndDate?.split('T')[0],
        clawbackApplicable: bonus.clawbackApplicable,
        clawbackConditions: bonus.clawbackConditions,
        clawbackPeriod: bonus.clawbackPeriod,
      })
      setHasVesting(!!bonus.vestingPeriod)
    }
  }, [bonus, form])

  // Watch employee selection
  useEffect(() => {
    const subscription = form.watch((value, { name }) => {
      if (name === 'employeeId' && value.employeeId) {
        const emp = MOCK_EMPLOYEES.find(e => e.id === value.employeeId)
        if (emp) {
          setSelectedEmployee(emp)
          form.setValue('employeeName', emp.nameEn)
          form.setValue('employeeNameAr', emp.nameAr)
          form.setValue('departmentId', emp.departmentId)
          form.setValue('designation', emp.designation)
        }
      }
    })
    return () => subscription.unsubscribe()
  }, [form])

  // Submit form
  const onSubmit = async (values: BonusFormValues) => {
    try {
      const data: CreateRetentionBonusInput = {
        ...values,
        vestingPeriod: hasVesting ? values.vestingPeriod : undefined,
        vestingStartDate: hasVesting ? values.vestingStartDate : undefined,
        vestingEndDate: hasVesting ? values.vestingEndDate : undefined,
      }

      if (bonus) {
        await updateMutation.mutateAsync({ id: bonus._id, data })
      } else {
        await createMutation.mutateAsync(data)
      }

      form.reset()
      onOpenChange(false)
      onSuccess?.()
    } catch (error) {
      // Error is handled by mutation hooks
    }
  }

  // Reset when dialog closes
  useEffect(() => {
    if (!open) {
      form.reset()
      setSelectedEmployee(null)
      setHasVesting(false)
    }
  }, [open, form])

  const isPending = createMutation.isPending || updateMutation.isPending

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {bonus
              ? isArabic ? 'تعديل المكافأة' : 'Edit Bonus'
              : isArabic ? 'مكافأة جديدة' : 'New Bonus'}
          </DialogTitle>
          <DialogDescription>
            {isArabic
              ? 'قم بتعبئة البيانات أدناه لإنشاء مكافأة جديدة للموظف'
              : 'Fill in the details below to create a new employee bonus'}
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            {/* Employee Information */}
            <Card>
              <CardHeader>
                <CardTitle className="text-base flex items-center gap-2">
                  <Users className="h-4 w-4" />
                  {isArabic ? 'معلومات الموظف' : 'Employee Information'}
                </CardTitle>
              </CardHeader>
              <CardContent className="grid gap-4 md:grid-cols-2">
                <FormField
                  control={form.control}
                  name="employeeId"
                  render={({ field }) => (
                    <FormItem className="md:col-span-2">
                      <FormLabel>{isArabic ? 'الموظف' : 'Employee'} *</FormLabel>
                      <Select onValueChange={field.onChange} value={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder={isArabic ? 'اختر الموظف' : 'Select employee'} />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {MOCK_EMPLOYEES.map((emp) => (
                            <SelectItem key={emp.id} value={emp.id}>
                              {isArabic ? emp.nameAr : emp.nameEn} ({emp.number})
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {selectedEmployee && (
                  <>
                    <div className="space-y-2">
                      <Label className="text-sm text-muted-foreground">
                        {isArabic ? 'القسم' : 'Department'}
                      </Label>
                      <div className="text-sm font-medium">
                        {isArabic
                          ? MOCK_DEPARTMENTS.find(d => d.id === selectedEmployee.departmentId)?.nameAr
                          : MOCK_DEPARTMENTS.find(d => d.id === selectedEmployee.departmentId)?.nameEn}
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label className="text-sm text-muted-foreground">
                        {isArabic ? 'المسمى الوظيفي' : 'Designation'}
                      </Label>
                      <div className="text-sm font-medium">{selectedEmployee.designation}</div>
                    </div>
                  </>
                )}
              </CardContent>
            </Card>

            {/* Bonus Details */}
            <Card>
              <CardHeader>
                <CardTitle className="text-base flex items-center gap-2">
                  <DollarSign className="h-4 w-4" />
                  {isArabic ? 'تفاصيل المكافأة' : 'Bonus Details'}
                </CardTitle>
              </CardHeader>
              <CardContent className="grid gap-4 md:grid-cols-2">
                <FormField
                  control={form.control}
                  name="bonusType"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>{isArabic ? 'نوع المكافأة' : 'Bonus Type'} *</FormLabel>
                      <Select onValueChange={field.onChange} value={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {Object.values(BonusType).map((type) => (
                            <SelectItem key={type} value={type}>
                              {isArabic ? bonusTypeLabels[type].ar : bonusTypeLabels[type].en}
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
                  name="bonusAmount"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>{isArabic ? 'المبلغ' : 'Amount'} *</FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          min={0}
                          step={0.01}
                          {...field}
                          onChange={(e) => field.onChange(parseFloat(e.target.value) || 0)}
                          placeholder={isArabic ? 'أدخل المبلغ' : 'Enter amount'}
                        />
                      </FormControl>
                      <FormDescription>
                        {isArabic ? 'بالريال السعودي' : 'In Saudi Riyals'}
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="paymentDate"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>{isArabic ? 'تاريخ الدفع' : 'Payment Date'} *</FormLabel>
                      <FormControl>
                        <Input type="date" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="paymentMethod"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>{isArabic ? 'طريقة الدفع' : 'Payment Method'} *</FormLabel>
                      <Select onValueChange={field.onChange} value={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {Object.values(PaymentMethod).map((method) => (
                            <SelectItem key={method} value={method}>
                              {isArabic ? paymentMethodLabels[method].ar : paymentMethodLabels[method].en}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </CardContent>
            </Card>

            {/* Vesting */}
            <Card>
              <CardHeader>
                <CardTitle className="text-base flex items-center gap-2">
                  <Clock className="h-4 w-4" />
                  {isArabic ? 'فترة الاستحقاق (اختياري)' : 'Vesting Period (Optional)'}
                </CardTitle>
                <CardDescription>
                  {isArabic
                    ? 'إذا كانت المكافأة تستحق على فترات، حدد تفاصيل الاستحقاق'
                    : 'If the bonus vests over time, specify the vesting details'}
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center space-x-2">
                  <Switch
                    checked={hasVesting}
                    onCheckedChange={setHasVesting}
                  />
                  <Label>
                    {isArabic ? 'تفعيل فترة الاستحقاق' : 'Enable vesting period'}
                  </Label>
                </div>

                {hasVesting && (
                  <div className="grid gap-4 md:grid-cols-3">
                    <FormField
                      control={form.control}
                      name="vestingPeriod"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>{isArabic ? 'فترة الاستحقاق (أشهر)' : 'Vesting Period (months)'}</FormLabel>
                          <FormControl>
                            <Input
                              type="number"
                              min={1}
                              {...field}
                              onChange={(e) => field.onChange(parseInt(e.target.value) || undefined)}
                              placeholder={isArabic ? 'مثال: 12' : 'e.g. 12'}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="vestingStartDate"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>{isArabic ? 'تاريخ البداية' : 'Start Date'}</FormLabel>
                          <FormControl>
                            <Input type="date" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="vestingEndDate"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>{isArabic ? 'تاريخ النهاية' : 'End Date'}</FormLabel>
                          <FormControl>
                            <Input type="date" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Conditions & Reason */}
            <Card>
              <CardHeader>
                <CardTitle className="text-base flex items-center gap-2">
                  <FileText className="h-4 w-4" />
                  {isArabic ? 'الشروط والأسباب' : 'Conditions & Reasons'}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <FormField
                  control={form.control}
                  name="reasonForGiving"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>{isArabic ? 'سبب المكافأة (إنجليزي)' : 'Reason for Bonus (English)'} *</FormLabel>
                      <FormControl>
                        <Textarea
                          {...field}
                          rows={3}
                          placeholder={isArabic
                            ? 'اكتب سبب منح المكافأة بالإنجليزي...'
                            : 'Enter the reason for granting this bonus in English...'}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="reasonForGivingAr"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>{isArabic ? 'سبب المكافأة (عربي)' : 'Reason for Bonus (Arabic)'} *</FormLabel>
                      <FormControl>
                        <Textarea
                          {...field}
                          rows={3}
                          placeholder={isArabic
                            ? 'اكتب سبب منح المكافأة بالعربي...'
                            : 'Enter the reason for granting this bonus in Arabic...'}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <Separator />

                <FormField
                  control={form.control}
                  name="conditionsForPayment"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>{isArabic ? 'شروط الدفع (إنجليزي)' : 'Payment Conditions (English)'} *</FormLabel>
                      <FormControl>
                        <Textarea
                          {...field}
                          rows={3}
                          placeholder={isArabic
                            ? 'اكتب شروط الدفع بالإنجليزي...'
                            : 'Enter the payment conditions in English...'}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="conditionsForPaymentAr"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>{isArabic ? 'شروط الدفع (عربي)' : 'Payment Conditions (Arabic)'} *</FormLabel>
                      <FormControl>
                        <Textarea
                          {...field}
                          rows={3}
                          placeholder={isArabic
                            ? 'اكتب شروط الدفع بالعربي...'
                            : 'Enter the payment conditions in Arabic...'}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </CardContent>
            </Card>

            {/* Clawback */}
            <Card>
              <CardHeader>
                <CardTitle className="text-base flex items-center gap-2">
                  <Shield className="h-4 w-4" />
                  {isArabic ? 'سياسة الاسترداد' : 'Clawback Policy'}
                </CardTitle>
                <CardDescription>
                  {isArabic
                    ? 'حدد ما إذا كان يمكن استرداد المكافأة في حالات معينة'
                    : 'Specify if the bonus can be recovered under certain conditions'}
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <FormField
                  control={form.control}
                  name="clawbackApplicable"
                  render={({ field }) => (
                    <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                      <div className="space-y-0.5">
                        <FormLabel className="text-base">
                          {isArabic ? 'تفعيل سياسة الاسترداد' : 'Enable Clawback'}
                        </FormLabel>
                        <FormDescription>
                          {isArabic
                            ? 'يمكن استرداد المكافأة في حالة عدم الالتزام بالشروط'
                            : 'The bonus can be recovered if conditions are not met'}
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

                {form.watch('clawbackApplicable') && (
                  <div className="space-y-4">
                    <FormField
                      control={form.control}
                      name="clawbackPeriod"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>{isArabic ? 'فترة الاسترداد (أشهر)' : 'Clawback Period (months)'}</FormLabel>
                          <FormControl>
                            <Input
                              type="number"
                              min={1}
                              {...field}
                              onChange={(e) => field.onChange(parseInt(e.target.value) || undefined)}
                              placeholder={isArabic ? 'مثال: 12' : 'e.g. 12'}
                            />
                          </FormControl>
                          <FormDescription>
                            {isArabic
                              ? 'الفترة التي يمكن خلالها استرداد المكافأة بعد الدفع'
                              : 'Period during which the bonus can be recovered after payment'}
                          </FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="clawbackConditions"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>{isArabic ? 'شروط الاسترداد' : 'Clawback Conditions'}</FormLabel>
                          <FormControl>
                            <Textarea
                              {...field}
                              rows={3}
                              placeholder={isArabic
                                ? 'اكتب الشروط التي قد تؤدي إلى استرداد المكافأة...'
                                : 'Enter the conditions that may trigger a clawback...'}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                )}
              </CardContent>
            </Card>

            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => onOpenChange(false)}
                disabled={isPending}
              >
                {isArabic ? 'إلغاء' : 'Cancel'}
              </Button>
              <Button type="submit" disabled={isPending}>
                {isPending && <Loader2 className="h-4 w-4 ml-2 animate-spin" />}
                {bonus
                  ? isArabic ? 'حفظ التعديلات' : 'Save Changes'
                  : isArabic ? 'إنشاء المكافأة' : 'Create Bonus'}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  )
}
