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
              ? t('hr.payroll.components.dialog.titleEdit')
              : t('hr.payroll.components.dialog.titleNew')}
          </DialogTitle>
          <DialogDescription>
            {isEdit
              ? t('hr.payroll.components.dialog.descriptionEdit')
              : t('hr.payroll.components.dialog.descriptionNew')}
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <Tabs defaultValue="basic" dir={isArabic ? 'rtl' : 'ltr'}>
              <TabsList className="grid w-full grid-cols-3">
                <TabsTrigger value="basic">
                  {t('hr.payroll.components.dialog.tabs.basic')}
                </TabsTrigger>
                <TabsTrigger value="calculation">
                  {t('hr.payroll.components.dialog.tabs.calculation')}
                </TabsTrigger>
                <TabsTrigger value="advanced">
                  {t('hr.payroll.components.dialog.tabs.advanced')}
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
                        <FormLabel>{t('hr.payroll.components.dialog.fields.nameEn')}</FormLabel>
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
                        <FormLabel>{t('hr.payroll.components.dialog.fields.nameAr')}</FormLabel>
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
                        <FormLabel>{t('hr.payroll.components.dialog.fields.abbreviation')}</FormLabel>
                        <FormControl>
                          <Input placeholder="HRA" {...field} className="uppercase" />
                        </FormControl>
                        <FormDescription>
                          {t('hr.payroll.components.dialog.fields.abbreviationDesc')}
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
                        <FormLabel>{t('hr.payroll.components.dialog.fields.type')}</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="earning">
                              {t('hr.payroll.components.type.earning')}
                            </SelectItem>
                            <SelectItem value="deduction">
                              {t('hr.payroll.components.type.deduction')}
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
                      <FormLabel>{t('hr.payroll.components.dialog.fields.descriptionEn')}</FormLabel>
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
                      <FormLabel>{t('hr.payroll.components.dialog.fields.descriptionAr')}</FormLabel>
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
                          {t('hr.payroll.components.dialog.fields.active')}
                        </FormLabel>
                        <FormDescription>
                          {t('hr.payroll.components.dialog.fields.activeDesc')}
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
                          {t('hr.payroll.components.dialog.fields.formulaBased')}
                        </FormLabel>
                        <FormDescription>
                          {t('hr.payroll.components.dialog.fields.formulaBasedDesc')}
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
                        <FormLabel>{t('hr.payroll.components.dialog.fields.formula')}</FormLabel>
                        <FormControl>
                          <Input
                            placeholder="base_salary * 0.25"
                            {...field}
                            className="font-mono"
                          />
                        </FormControl>
                        <FormDescription>
                          {t('hr.payroll.components.dialog.fields.formulaExample')}
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
                        <FormLabel>{t('hr.payroll.components.dialog.fields.fixedAmount')}</FormLabel>
                        <FormControl>
                          <Input type="number" placeholder="500" {...field} />
                        </FormControl>
                        <FormDescription>
                          {t('hr.payroll.components.dialog.fields.amountInSar')}
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
                      <FormLabel>{t('hr.payroll.components.dialog.fields.condition')}</FormLabel>
                      <FormControl>
                        <Input
                          placeholder="employee.is_saudi == true"
                          {...field}
                          className="font-mono"
                        />
                      </FormControl>
                      <FormDescription>
                        {t('hr.payroll.components.dialog.fields.conditionDesc')}
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
                      <FormLabel>{t('hr.payroll.components.dialog.fields.roundTo')}</FormLabel>
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
                        {t('hr.payroll.components.dialog.fields.roundDesc')}
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
                      <FormLabel>{t('hr.payroll.components.dialog.fields.applicableFor')}</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="all">{t('hr.payroll.components.dialog.fields.all')}</SelectItem>
                          <SelectItem value="saudi">
                            {t('hr.payroll.components.dialog.fields.saudiOnly')}
                          </SelectItem>
                          <SelectItem value="non_saudi">
                            {t('hr.payroll.components.dialog.fields.nonSaudiOnly')}
                          </SelectItem>
                          <SelectItem value="custom">
                            {t('hr.payroll.components.dialog.fields.custom')}
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
                          <FormLabel>{t('hr.payroll.components.dialog.fields.taxApplicable')}</FormLabel>
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
                            {t('hr.payroll.components.dialog.fields.exemptFromIncomeTax')}
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
                            {t('hr.payroll.components.dialog.fields.gosiApplicable')}
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
                            <FormLabel>{t('hr.payroll.components.dialog.fields.gosiType')}</FormLabel>
                            <Select onValueChange={field.onChange} defaultValue={field.value}>
                              <FormControl>
                                <SelectTrigger>
                                  <SelectValue />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                <SelectItem value="employee_contribution">
                                  {t('hr.payroll.components.dialog.fields.employeeContribution')}
                                </SelectItem>
                                <SelectItem value="employer_contribution">
                                  {t('hr.payroll.components.dialog.fields.employerContribution')}
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
                            <FormLabel>{t('hr.payroll.components.dialog.fields.gosiPercentage')}</FormLabel>
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
                            {t('hr.payroll.components.dialog.fields.dependsOnPaymentDays')}
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
                            {t('hr.payroll.components.dialog.fields.flexibleBenefit')}
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
                            {t('hr.payroll.components.dialog.fields.maxBenefitAmount')}
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
                            {t('hr.payroll.components.dialog.fields.statisticalComponent')}
                          </FormLabel>
                          <FormDescription>
                            {t('hr.payroll.components.dialog.fields.statisticalDesc')}
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
                            {t('hr.payroll.components.dialog.fields.variableComponent')}
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
                {t('hr.payroll.components.dialog.buttons.cancel')}
              </Button>
              <Button
                type="submit"
                disabled={createMutation.isPending || updateMutation.isPending}
              >
                {createMutation.isPending || updateMutation.isPending
                  ? t('hr.payroll.components.dialog.buttons.saving')
                  : isEdit
                  ? t('hr.payroll.components.dialog.buttons.update')
                  : t('hr.payroll.components.dialog.buttons.save')}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  )
}
