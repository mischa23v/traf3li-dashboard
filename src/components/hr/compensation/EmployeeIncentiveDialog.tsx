import { useState, useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import * as z from 'zod'
import { useTranslation } from 'react-i18next'
import {
  useCreateEmployeeIncentive,
  useUpdateEmployeeIncentive,
} from '@/hooks/useEmployeeIncentive'
import { useSalaryComponents } from '@/hooks/useSalaryComponent'
import type {
  EmployeeIncentive,
  CreateEmployeeIncentiveData,
  IncentiveType,
  ReferenceType,
} from '@/services/employeeIncentiveService'
import {
  incentiveTypeLabels,
  referenceTypeLabels,
} from '@/services/employeeIncentiveService'
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
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Loader2, Award, DollarSign, Calendar, FileText } from 'lucide-react'

// Form validation schema
const incentiveFormSchema = z.object({
  employeeId: z.string().min(1, 'الرجاء اختيار الموظف'),
  employeeName: z.string().min(1, 'الرجاء إدخال اسم الموظف'),
  employeeNameAr: z.string().min(1, 'الرجاء إدخال اسم الموظف بالعربية'),
  employeeNumber: z.string().optional(),
  departmentId: z.string().min(1, 'الرجاء اختيار القسم'),
  departmentName: z.string().optional(),
  departmentNameAr: z.string().optional(),
  incentiveType: z.string().min(1, 'الرجاء اختيار نوع الحافز'),
  incentiveAmount: z.number().min(1, 'المبلغ يجب أن يكون أكبر من صفر'),
  currency: z.string().default('SAR'),
  salaryComponentId: z.string().optional(),
  salaryComponentName: z.string().optional(),
  salaryComponentNameAr: z.string().optional(),
  payrollDate: z.string().min(1, 'الرجاء اختيار تاريخ الرواتب'),
  incentiveReason: z.string().min(1, 'الرجاء إدخال سبب الحافز'),
  incentiveReasonAr: z.string().min(1, 'الرجاء إدخال سبب الحافز بالعربية'),
  referenceType: z.string().optional(),
  referenceId: z.string().optional(),
  referenceName: z.string().optional(),
  referenceNameAr: z.string().optional(),
  officeId: z.string().min(1, 'الرجاء اختيار المكتب'),
})

type IncentiveFormValues = z.infer<typeof incentiveFormSchema>

interface EmployeeIncentiveDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  incentive?: EmployeeIncentive
  employeeId?: string
  onSuccess?: () => void
}

// Mock data - In production, these would come from APIs
const MOCK_EMPLOYEES = [
  {
    id: '1',
    nameAr: 'أحمد محمد السعيد',
    nameEn: 'Ahmed Mohammed Al-Said',
    number: 'EMP001',
    departmentId: 'dept1',
    departmentNameAr: 'قسم المبيعات',
    departmentNameEn: 'Sales Department',
  },
  {
    id: '2',
    nameAr: 'فاطمة علي الأحمد',
    nameEn: 'Fatima Ali Al-Ahmad',
    number: 'EMP002',
    departmentId: 'dept2',
    departmentNameAr: 'قسم التسويق',
    departmentNameEn: 'Marketing Department',
  },
  {
    id: '3',
    nameAr: 'محمد عبدالله الخالد',
    nameEn: 'Mohammed Abdullah Al-Khalid',
    number: 'EMP003',
    departmentId: 'dept1',
    departmentNameAr: 'قسم المبيعات',
    departmentNameEn: 'Sales Department',
  },
]

const MOCK_OFFICES = [
  { id: 'office1', nameAr: 'المكتب الرئيسي', nameEn: 'Main Office' },
  { id: 'office2', nameAr: 'فرع الرياض', nameEn: 'Riyadh Branch' },
]

export function EmployeeIncentiveDialog({
  open,
  onOpenChange,
  incentive,
  employeeId: initialEmployeeId,
  onSuccess,
}: EmployeeIncentiveDialogProps) {
  const { i18n } = useTranslation()
  const isArabic = i18n.language === 'ar'
  const isEditMode = !!incentive

  // State
  const [selectedEmployee, setSelectedEmployee] = useState<string>(
    initialEmployeeId || incentive?.employeeId || ''
  )
  const [selectedSalaryComponent, setSelectedSalaryComponent] = useState<string>('')

  // Queries
  const { data: salaryComponentsData } = useSalaryComponents({
    type: 'earning',
    isActive: true,
  })

  // Mutations
  const createMutation = useCreateEmployeeIncentive()
  const updateMutation = useUpdateEmployeeIncentive()

  const salaryComponents = salaryComponentsData?.components || []

  // Form
  const form = useForm<IncentiveFormValues>({
    resolver: zodResolver(incentiveFormSchema),
    defaultValues: {
      employeeId: initialEmployeeId || '',
      employeeName: '',
      employeeNameAr: '',
      employeeNumber: '',
      departmentId: '',
      departmentName: '',
      departmentNameAr: '',
      incentiveType: 'performance_bonus',
      incentiveAmount: 0,
      currency: 'SAR',
      salaryComponentId: '',
      salaryComponentName: '',
      salaryComponentNameAr: '',
      payrollDate: new Date().toISOString().split('T')[0],
      incentiveReason: '',
      incentiveReasonAr: '',
      referenceType: '',
      referenceId: '',
      referenceName: '',
      referenceNameAr: '',
      officeId: 'office1',
    },
  })

  // Update form when incentive changes
  useEffect(() => {
    if (incentive && open) {
      form.reset({
        employeeId: incentive.employeeId,
        employeeName: incentive.employeeName,
        employeeNameAr: incentive.employeeNameAr,
        employeeNumber: incentive.employeeNumber || '',
        departmentId: incentive.departmentId,
        departmentName: incentive.departmentName || '',
        departmentNameAr: incentive.departmentNameAr || '',
        incentiveType: incentive.incentiveType,
        incentiveAmount: incentive.incentiveAmount,
        currency: incentive.currency,
        salaryComponentId: incentive.salaryComponentId || '',
        salaryComponentName: incentive.salaryComponentName || '',
        salaryComponentNameAr: incentive.salaryComponentNameAr || '',
        payrollDate: incentive.payrollDate.split('T')[0],
        incentiveReason: incentive.incentiveReason,
        incentiveReasonAr: incentive.incentiveReasonAr,
        referenceType: incentive.referenceType || '',
        referenceId: incentive.referenceId || '',
        referenceName: incentive.referenceName || '',
        referenceNameAr: incentive.referenceNameAr || '',
        officeId: incentive.officeId,
      })
      setSelectedEmployee(incentive.employeeId)
      setSelectedSalaryComponent(incentive.salaryComponentId || '')
    } else if (!open) {
      form.reset()
      setSelectedEmployee('')
      setSelectedSalaryComponent('')
    }
  }, [incentive, open, form])

  // Watch for employee selection changes
  useEffect(() => {
    const subscription = form.watch((value, { name }) => {
      if (name === 'employeeId' && value.employeeId) {
        const employee = MOCK_EMPLOYEES.find((e) => e.id === value.employeeId)
        if (employee) {
          form.setValue('employeeName', employee.nameEn)
          form.setValue('employeeNameAr', employee.nameAr)
          form.setValue('employeeNumber', employee.number)
          form.setValue('departmentId', employee.departmentId)
          form.setValue('departmentName', employee.departmentNameEn)
          form.setValue('departmentNameAr', employee.departmentNameAr)
        }
        setSelectedEmployee(value.employeeId)
      }
      if (name === 'salaryComponentId' && value.salaryComponentId) {
        const component = salaryComponents.find((c) => c._id === value.salaryComponentId)
        if (component) {
          form.setValue('salaryComponentName', component.name)
          form.setValue('salaryComponentNameAr', component.nameAr)
        }
        setSelectedSalaryComponent(value.salaryComponentId)
      }
    })
    return () => subscription.unsubscribe()
  }, [form, salaryComponents])

  // Submit handler
  const onSubmit = async (data: IncentiveFormValues) => {
    try {
      const payload: CreateEmployeeIncentiveData = {
        ...data,
        incentiveType: data.incentiveType as IncentiveType,
        referenceType: data.referenceType
          ? (data.referenceType as ReferenceType)
          : undefined,
      }

      if (isEditMode && incentive) {
        await updateMutation.mutateAsync({ id: incentive._id, data: payload })
      } else {
        await createMutation.mutateAsync(payload)
      }

      onOpenChange(false)
      onSuccess?.()
    } catch (error) {
      // Error is handled by the mutation
      console.error('Error submitting incentive:', error)
    }
  }

  const isLoading = createMutation.isPending || updateMutation.isPending

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-[700px]">
        <DialogHeader>
          <DialogTitle>
            {isEditMode
              ? isArabic
                ? 'تعديل حافز موظف'
                : 'Edit Employee Incentive'
              : isArabic
              ? 'حافز موظف جديد'
              : 'New Employee Incentive'}
          </DialogTitle>
          <DialogDescription>
            {isArabic
              ? 'أدخل تفاصيل الحافز للموظف'
              : 'Enter the details of the employee incentive'}
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            {/* Employee Information */}
            <Card>
              <CardHeader>
                <CardTitle className="text-base">
                  {isArabic ? 'معلومات الموظف' : 'Employee Information'}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <FormField
                  control={form.control}
                  name="employeeId"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>{isArabic ? 'الموظف' : 'Employee'} *</FormLabel>
                      <Select
                        onValueChange={field.onChange}
                        defaultValue={field.value}
                        disabled={isEditMode}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue
                              placeholder={isArabic ? 'اختر الموظف' : 'Select Employee'}
                            />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {MOCK_EMPLOYEES.map((employee) => (
                            <SelectItem key={employee.id} value={employee.id}>
                              {isArabic ? employee.nameAr : employee.nameEn} ({employee.number})
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
                  name="officeId"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>{isArabic ? 'المكتب' : 'Office'} *</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue
                              placeholder={isArabic ? 'اختر المكتب' : 'Select Office'}
                            />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {MOCK_OFFICES.map((office) => (
                            <SelectItem key={office.id} value={office.id}>
                              {isArabic ? office.nameAr : office.nameEn}
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

            {/* Incentive Details */}
            <Card>
              <CardHeader>
                <CardTitle className="text-base">
                  {isArabic ? 'تفاصيل الحافز' : 'Incentive Details'}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <FormField
                  control={form.control}
                  name="incentiveType"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>{isArabic ? 'نوع الحافز' : 'Incentive Type'} *</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue
                              placeholder={
                                isArabic ? 'اختر نوع الحافز' : 'Select Incentive Type'
                              }
                            />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {Object.entries(incentiveTypeLabels).map(([value, label]) => (
                            <SelectItem key={value} value={value}>
                              {isArabic ? label.ar : label.en}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <div className="grid gap-4 md:grid-cols-2">
                  <FormField
                    control={form.control}
                    name="incentiveAmount"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>{isArabic ? 'المبلغ' : 'Amount'} *</FormLabel>
                        <FormControl>
                          <Input
                            type="number"
                            placeholder="0.00"
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
                    name="currency"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>{isArabic ? 'العملة' : 'Currency'} *</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="SAR">
                              {isArabic ? 'ريال سعودي' : 'Saudi Riyal'}
                            </SelectItem>
                            <SelectItem value="USD">
                              {isArabic ? 'دولار أمريكي' : 'US Dollar'}
                            </SelectItem>
                            <SelectItem value="EUR">
                              {isArabic ? 'يورو' : 'Euro'}
                            </SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <FormField
                  control={form.control}
                  name="salaryComponentId"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>{isArabic ? 'مكون الراتب' : 'Salary Component'}</FormLabel>
                      <Select onValueChange={field.onChange} value={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue
                              placeholder={
                                isArabic
                                  ? 'اختر مكون الراتب (اختياري)'
                                  : 'Select Salary Component (Optional)'
                              }
                            />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {salaryComponents.map((component) => (
                            <SelectItem key={component._id} value={component._id}>
                              {isArabic ? component.nameAr : component.name} ({component.abbr})
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormDescription>
                        {isArabic
                          ? 'ربط الحافز بمكون راتب محدد'
                          : 'Link the incentive to a specific salary component'}
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="payrollDate"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>{isArabic ? 'تاريخ الرواتب' : 'Payroll Date'} *</FormLabel>
                      <FormControl>
                        <Input type="date" {...field} />
                      </FormControl>
                      <FormDescription>
                        {isArabic
                          ? 'فترة الرواتب التي سيتم إضافة الحافز إليها'
                          : 'The payroll period this incentive will be added to'}
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </CardContent>
            </Card>

            {/* Reason & Reference */}
            <Card>
              <CardHeader>
                <CardTitle className="text-base">
                  {isArabic ? 'السبب والمرجع' : 'Reason & Reference'}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <FormField
                  control={form.control}
                  name="incentiveReason"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>{isArabic ? 'السبب (English)' : 'Reason (English)'} *</FormLabel>
                      <FormControl>
                        <Textarea
                          placeholder={
                            isArabic
                              ? 'أدخل سبب منح الحافز بالإنجليزية'
                              : 'Enter the reason for granting the incentive'
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
                  name="incentiveReasonAr"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>{isArabic ? 'السبب (العربية)' : 'Reason (Arabic)'} *</FormLabel>
                      <FormControl>
                        <Textarea
                          placeholder={
                            isArabic
                              ? 'أدخل سبب منح الحافز بالعربية'
                              : 'Enter the reason in Arabic'
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
                  name="referenceType"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>{isArabic ? 'نوع المرجع' : 'Reference Type'}</FormLabel>
                      <Select onValueChange={field.onChange} value={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue
                              placeholder={
                                isArabic
                                  ? 'اختر نوع المرجع (اختياري)'
                                  : 'Select Reference Type (Optional)'
                              }
                            />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {Object.entries(referenceTypeLabels).map(([value, label]) => (
                            <SelectItem key={value} value={value}>
                              {isArabic ? label.ar : label.en}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormDescription>
                        {isArabic
                          ? 'نوع المستند أو المرجع المرتبط بالحافز'
                          : 'Type of document or reference linked to the incentive'}
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="referenceId"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>{isArabic ? 'رقم المرجع' : 'Reference ID'}</FormLabel>
                      <FormControl>
                        <Input
                          placeholder={
                            isArabic ? 'مثال: REF-2024-001' : 'e.g., REF-2024-001'
                          }
                          {...field}
                        />
                      </FormControl>
                      <FormDescription>
                        {isArabic
                          ? 'رقم المستند أو المرجع المرتبط'
                          : 'Reference document or ID number'}
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </CardContent>
            </Card>

            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => onOpenChange(false)}
                disabled={isLoading}
              >
                {isArabic ? 'إلغاء' : 'Cancel'}
              </Button>
              <Button type="submit" disabled={isLoading}>
                {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                {isEditMode
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
