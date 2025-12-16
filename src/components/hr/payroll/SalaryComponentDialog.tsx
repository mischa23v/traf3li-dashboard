import { useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { useTranslation } from 'react-i18next'
import { DollarSign, X } from 'lucide-react'
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
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { useCreateSalaryComponent, useUpdateSalaryComponent } from '@/hooks/useSalaryComponent'
import type { SalaryComponent } from '@/services/salaryComponentService'

// Form Schema
const salaryComponentSchema = z.object({
  name: z.string().min(2, 'الاسم مطلوب'),
  nameAr: z.string().min(2, 'الاسم بالعربية مطلوب'),
  abbr: z.string().min(1, 'الرمز مطلوب').max(10, 'الرمز يجب أن يكون أقل من 10 أحرف'),
  type: z.enum(['earning', 'deduction']),
  description: z.string().min(1, 'الوصف مطلوب'),
  descriptionAr: z.string().min(1, 'الوصف بالعربية مطلوب'),

  // Calculation
  amountBasedOnFormula: z.boolean(),
  formula: z.string().optional(),
  amount: z.coerce.number().optional(),

  // Conditions
  condition: z.string().optional(),

  // Tax settings
  isTaxApplicable: z.boolean().default(true),
  exemptFromIncomeTax: z.boolean().default(false),

  // GOSI settings
  isGosiApplicable: z.boolean().default(false),
  gosiType: z.enum(['employee_contribution', 'employer_contribution']).optional(),
  gosiPercentage: z.coerce.number().min(0).max(100).optional(),

  // Dependency
  dependsOnPaymentDays: z.boolean().default(false),

  // Flexible benefit
  isFlexibleBenefit: z.boolean().default(false),
  maxBenefitAmount: z.coerce.number().optional(),

  // Statistical
  statisticalComponent: z.boolean().default(false),

  // Variable component
  isVariableComponent: z.boolean().default(false),
  variableBasedOnTaxableSalary: z.boolean().default(false),

  // Round settings
  roundToNearest: z.coerce.number().default(1),

  // Applicability
  applicableFor: z.enum(['all', 'saudi', 'non_saudi', 'custom']).default('all'),

  // Status
  isActive: z.boolean().default(true),
})

type SalaryComponentFormData = z.infer<typeof salaryComponentSchema>

interface SalaryComponentDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  component?: SalaryComponent
}

export function SalaryComponentDialog({
  open,
  onOpenChange,
  component,
}: SalaryComponentDialogProps) {
  const { t, i18n } = useTranslation()
  const isArabic = i18n.language === 'ar'
  const isEdit = !!component

  const createMutation = useCreateSalaryComponent()
  const updateMutation = useUpdateSalaryComponent()

  const form = useForm<SalaryComponentFormData>({
    resolver: zodResolver(salaryComponentSchema),
    defaultValues: {
      name: '',
      nameAr: '',
      abbr: '',
      type: 'earning',
      description: '',
      descriptionAr: '',
      amountBasedOnFormula: false,
      formula: '',
      amount: 0,
      condition: '',
      isTaxApplicable: true,
      exemptFromIncomeTax: false,
      isGosiApplicable: false,
      dependsOnPaymentDays: false,
      isFlexibleBenefit: false,
      statisticalComponent: false,
      isVariableComponent: false,
      variableBasedOnTaxableSalary: false,
      roundToNearest: 1,
      applicableFor: 'all',
      isActive: true,
    },
  })

  const amountBasedOnFormula = form.watch('amountBasedOnFormula')
  const isGosiApplicable = form.watch('isGosiApplicable')
  const isFlexibleBenefit = form.watch('isFlexibleBenefit')

  // Load component data when editing
  useEffect(() => {
    if (component) {
      form.reset({
        name: component.name,
        nameAr: component.nameAr,
        abbr: component.abbr,
        type: component.type,
        description: component.description,
        descriptionAr: component.descriptionAr,
        amountBasedOnFormula: component.amountBasedOnFormula,
        formula: component.formula || '',
        amount: component.amount || 0,
        condition: component.condition || '',
        isTaxApplicable: component.isTaxApplicable,
        exemptFromIncomeTax: component.exemptFromIncomeTax,
        isGosiApplicable: component.isGosiApplicable,
        gosiType: component.gosiType,
        gosiPercentage: component.gosiPercentage,
        dependsOnPaymentDays: component.dependsOnPaymentDays,
        isFlexibleBenefit: component.isFlexibleBenefit,
        maxBenefitAmount: component.maxBenefitAmount,
        statisticalComponent: component.statisticalComponent,
        isVariableComponent: component.isVariableComponent,
        variableBasedOnTaxableSalary: component.variableBasedOnTaxableSalary,
        roundToNearest: component.roundToNearest,
        applicableFor: component.applicableFor,
        isActive: component.isActive,
      })
    } else {
      form.reset()
    }
  }, [component, form])

  const onSubmit = async (data: SalaryComponentFormData) => {
    try {
      if (isEdit && component) {
        await updateMutation.mutateAsync({ id: component._id, data })
      } else {
        await createMutation.mutateAsync(data)
      }
      onOpenChange(false)
      form.reset()
    } catch (error) {
      // Error handling is done in the mutation hooks
    }
  }

  const handleClose = () => {
    onOpenChange(false)
    form.reset()
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <DollarSign className="h-5 w-5" />
            {isEdit
              ? isArabic
                ? 'تعديل مكون الراتب'
                : 'Edit Salary Component'
              : isArabic
              ? 'مكون راتب جديد'
              : 'New Salary Component'}
          </DialogTitle>
          <DialogDescription>
            {isEdit
              ? isArabic
                ? 'تعديل تفاصيل مكون الراتب'
                : 'Edit salary component details'
              : isArabic
              ? 'إضافة مكون جديد للراتب (بدل أو استقطاع)'
              : 'Add a new salary component (allowance or deduction)'}
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <Tabs defaultValue="basic" dir={isArabic ? 'rtl' : 'ltr'}>
              <TabsList className="grid w-full grid-cols-3">
                <TabsTrigger value="basic">
                  {isArabic ? 'المعلومات الأساسية' : 'Basic Info'}
                </TabsTrigger>
                <TabsTrigger value="calculation">
                  {isArabic ? 'الحساب' : 'Calculation'}
                </TabsTrigger>
                <TabsTrigger value="advanced">
                  {isArabic ? 'متقدم' : 'Advanced'}
                </TabsTrigger>
              </TabsList>

              {/* Basic Information Tab */}
              <TabsContent value="basic" className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="name"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>{isArabic ? 'الاسم (EN)' : 'Name (EN)'}</FormLabel>
                        <FormControl>
                          <Input placeholder="Housing Allowance" {...field} />
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
                        <FormLabel>{isArabic ? 'الاسم (AR)' : 'Name (AR)'}</FormLabel>
                        <FormControl>
                          <Input placeholder="بدل السكن" {...field} dir="rtl" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="abbr"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>{isArabic ? 'الرمز' : 'Abbreviation'}</FormLabel>
                        <FormControl>
                          <Input placeholder="HRA" {...field} className="uppercase" />
                        </FormControl>
                        <FormDescription>
                          {isArabic
                            ? 'رمز مختصر (مثل: HRA, GOSI)'
                            : 'Short code (e.g., HRA, GOSI)'}
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="type"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>{isArabic ? 'النوع' : 'Type'}</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="earning">
                              {isArabic ? 'استحقاق' : 'Earning'}
                            </SelectItem>
                            <SelectItem value="deduction">
                              {isArabic ? 'استقطاع' : 'Deduction'}
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
                  name="description"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>{isArabic ? 'الوصف (EN)' : 'Description (EN)'}</FormLabel>
                      <FormControl>
                        <Textarea
                          placeholder="Housing allowance provided to all employees"
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
                      <FormLabel>{isArabic ? 'الوصف (AR)' : 'Description (AR)'}</FormLabel>
                      <FormControl>
                        <Textarea
                          placeholder="بدل السكن المقدم لجميع الموظفين"
                          {...field}
                          dir="rtl"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="isActive"
                  render={({ field }) => (
                    <FormItem className="flex items-center justify-between rounded-lg border p-4">
                      <div className="space-y-0.5">
                        <FormLabel className="text-base">
                          {isArabic ? 'نشط' : 'Active'}
                        </FormLabel>
                        <FormDescription>
                          {isArabic
                            ? 'تفعيل أو تعطيل هذا المكون'
                            : 'Enable or disable this component'}
                        </FormDescription>
                      </div>
                      <FormControl>
                        <Switch checked={field.value} onCheckedChange={field.onChange} />
                      </FormControl>
                    </FormItem>
                  )}
                />
              </TabsContent>

              {/* Calculation Tab */}
              <TabsContent value="calculation" className="space-y-4">
                <FormField
                  control={form.control}
                  name="amountBasedOnFormula"
                  render={({ field }) => (
                    <FormItem className="flex items-center justify-between rounded-lg border p-4">
                      <div className="space-y-0.5">
                        <FormLabel className="text-base">
                          {isArabic ? 'مبني على معادلة' : 'Formula-based'}
                        </FormLabel>
                        <FormDescription>
                          {isArabic
                            ? 'حساب المبلغ باستخدام معادلة'
                            : 'Calculate amount using a formula'}
                        </FormDescription>
                      </div>
                      <FormControl>
                        <Switch checked={field.value} onCheckedChange={field.onChange} />
                      </FormControl>
                    </FormItem>
                  )}
                />

                {amountBasedOnFormula ? (
                  <FormField
                    control={form.control}
                    name="formula"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>{isArabic ? 'المعادلة' : 'Formula'}</FormLabel>
                        <FormControl>
                          <Input
                            placeholder="base_salary * 0.25"
                            {...field}
                            className="font-mono"
                          />
                        </FormControl>
                        <FormDescription>
                          {isArabic
                            ? 'مثال: base_salary * 0.25'
                            : 'Example: base_salary * 0.25'}
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                ) : (
                  <FormField
                    control={form.control}
                    name="amount"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>{isArabic ? 'المبلغ الثابت' : 'Fixed Amount'}</FormLabel>
                        <FormControl>
                          <Input type="number" placeholder="500" {...field} />
                        </FormControl>
                        <FormDescription>
                          {isArabic ? 'المبلغ بالريال السعودي' : 'Amount in SAR'}
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                )}

                <FormField
                  control={form.control}
                  name="condition"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>{isArabic ? 'الشرط' : 'Condition'}</FormLabel>
                      <FormControl>
                        <Input
                          placeholder="employee.is_saudi == true"
                          {...field}
                          className="font-mono"
                        />
                      </FormControl>
                      <FormDescription>
                        {isArabic
                          ? 'شرط اختياري لتطبيق هذا المكون'
                          : 'Optional condition to apply this component'}
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="roundToNearest"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>{isArabic ? 'التقريب' : 'Round to nearest'}</FormLabel>
                      <Select
                        onValueChange={(v) => field.onChange(Number(v))}
                        defaultValue={String(field.value)}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="1">1</SelectItem>
                          <SelectItem value="5">5</SelectItem>
                          <SelectItem value="10">10</SelectItem>
                          <SelectItem value="50">50</SelectItem>
                          <SelectItem value="100">100</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormDescription>
                        {isArabic ? 'تقريب المبلغ لأقرب رقم' : 'Round amount to nearest number'}
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </TabsContent>

              {/* Advanced Tab */}
              <TabsContent value="advanced" className="space-y-4">
                <FormField
                  control={form.control}
                  name="applicableFor"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>{isArabic ? 'ينطبق على' : 'Applicable for'}</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="all">{isArabic ? 'الكل' : 'All'}</SelectItem>
                          <SelectItem value="saudi">
                            {isArabic ? 'سعوديين فقط' : 'Saudi only'}
                          </SelectItem>
                          <SelectItem value="non_saudi">
                            {isArabic ? 'غير سعوديين فقط' : 'Non-Saudi only'}
                          </SelectItem>
                          <SelectItem value="custom">
                            {isArabic ? 'مخصص' : 'Custom'}
                          </SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <div className="space-y-4">
                  <FormField
                    control={form.control}
                    name="isTaxApplicable"
                    render={({ field }) => (
                      <FormItem className="flex items-center justify-between rounded-lg border p-4">
                        <div className="space-y-0.5">
                          <FormLabel>{isArabic ? 'خاضع للضريبة' : 'Tax applicable'}</FormLabel>
                        </div>
                        <FormControl>
                          <Switch checked={field.value} onCheckedChange={field.onChange} />
                        </FormControl>
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="exemptFromIncomeTax"
                    render={({ field }) => (
                      <FormItem className="flex items-center justify-between rounded-lg border p-4">
                        <div className="space-y-0.5">
                          <FormLabel>
                            {isArabic ? 'معفى من ضريبة الدخل' : 'Exempt from income tax'}
                          </FormLabel>
                        </div>
                        <FormControl>
                          <Switch checked={field.value} onCheckedChange={field.onChange} />
                        </FormControl>
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="isGosiApplicable"
                    render={({ field }) => (
                      <FormItem className="flex items-center justify-between rounded-lg border p-4">
                        <div className="space-y-0.5">
                          <FormLabel>
                            {isArabic ? 'ينطبق عليه GOSI' : 'GOSI applicable'}
                          </FormLabel>
                        </div>
                        <FormControl>
                          <Switch checked={field.value} onCheckedChange={field.onChange} />
                        </FormControl>
                      </FormItem>
                    )}
                  />

                  {isGosiApplicable && (
                    <>
                      <FormField
                        control={form.control}
                        name="gosiType"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>{isArabic ? 'نوع GOSI' : 'GOSI Type'}</FormLabel>
                            <Select onValueChange={field.onChange} defaultValue={field.value}>
                              <FormControl>
                                <SelectTrigger>
                                  <SelectValue />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                <SelectItem value="employee_contribution">
                                  {isArabic ? 'حصة الموظف' : 'Employee contribution'}
                                </SelectItem>
                                <SelectItem value="employer_contribution">
                                  {isArabic ? 'حصة صاحب العمل' : 'Employer contribution'}
                                </SelectItem>
                              </SelectContent>
                            </Select>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="gosiPercentage"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>{isArabic ? 'نسبة GOSI %' : 'GOSI Percentage %'}</FormLabel>
                            <FormControl>
                              <Input type="number" placeholder="10" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </>
                  )}

                  <FormField
                    control={form.control}
                    name="dependsOnPaymentDays"
                    render={({ field }) => (
                      <FormItem className="flex items-center justify-between rounded-lg border p-4">
                        <div className="space-y-0.5">
                          <FormLabel>
                            {isArabic ? 'يعتمد على أيام الدفع' : 'Depends on payment days'}
                          </FormLabel>
                        </div>
                        <FormControl>
                          <Switch checked={field.value} onCheckedChange={field.onChange} />
                        </FormControl>
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="isFlexibleBenefit"
                    render={({ field }) => (
                      <FormItem className="flex items-center justify-between rounded-lg border p-4">
                        <div className="space-y-0.5">
                          <FormLabel>
                            {isArabic ? 'ميزة مرنة' : 'Flexible benefit'}
                          </FormLabel>
                        </div>
                        <FormControl>
                          <Switch checked={field.value} onCheckedChange={field.onChange} />
                        </FormControl>
                      </FormItem>
                    )}
                  />

                  {isFlexibleBenefit && (
                    <FormField
                      control={form.control}
                      name="maxBenefitAmount"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>
                            {isArabic ? 'الحد الأقصى للمزايا' : 'Max benefit amount'}
                          </FormLabel>
                          <FormControl>
                            <Input type="number" placeholder="5000" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  )}

                  <FormField
                    control={form.control}
                    name="statisticalComponent"
                    render={({ field }) => (
                      <FormItem className="flex items-center justify-between rounded-lg border p-4">
                        <div className="space-y-0.5">
                          <FormLabel>
                            {isArabic ? 'مكون إحصائي' : 'Statistical component'}
                          </FormLabel>
                          <FormDescription>
                            {isArabic
                              ? 'للتقارير فقط، لا يظهر في قسيمة الراتب'
                              : 'For reports only, not shown in payslip'}
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
                    name="isVariableComponent"
                    render={({ field }) => (
                      <FormItem className="flex items-center justify-between rounded-lg border p-4">
                        <div className="space-y-0.5">
                          <FormLabel>
                            {isArabic ? 'مكون متغير' : 'Variable component'}
                          </FormLabel>
                        </div>
                        <FormControl>
                          <Switch checked={field.value} onCheckedChange={field.onChange} />
                        </FormControl>
                      </FormItem>
                    )}
                  />
                </div>
              </TabsContent>
            </Tabs>

            <DialogFooter>
              <Button type="button" variant="outline" onClick={handleClose}>
                {isArabic ? 'إلغاء' : 'Cancel'}
              </Button>
              <Button
                type="submit"
                disabled={createMutation.isPending || updateMutation.isPending}
              >
                {createMutation.isPending || updateMutation.isPending
                  ? isArabic
                    ? 'جارٍ الحفظ...'
                    : 'Saving...'
                  : isEdit
                  ? isArabic
                    ? 'تحديث'
                    : 'Update'
                  : isArabic
                  ? 'حفظ'
                  : 'Save'}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  )
}
