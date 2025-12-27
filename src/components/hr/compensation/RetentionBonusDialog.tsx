import * as z from 'zod'
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
import { GenericFormDialog, FormSectionConfig } from '@/components/generic-form-dialog'

// Form validation schema
// Note: Employee-related fields (employeeName, employeeNameAr, departmentId, designation)
// are computed from the selected employee in the onSubmit handler
const bonusFormSchema = z.object({
  employeeId: z.string().min(1, 'الرجاء اختيار الموظف'),
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

export function RetentionBonusDialog({
  open,
  onOpenChange,
  bonus,
  onSuccess,
}: RetentionBonusDialogProps) {
  // Mutations
  const createMutation = useCreateRetentionBonus()
  const updateMutation = useUpdateRetentionBonus()

  // Prepare default values
  const defaultValues: Partial<BonusFormValues> = bonus
    ? {
        employeeId: bonus.employeeId,
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
      }
    : {
        bonusType: BonusType.RETENTION,
        currency: 'SAR',
        paymentMethod: PaymentMethod.PAYROLL,
        clawbackApplicable: false,
      }

  // Submit form
  const handleSubmit = async (values: BonusFormValues) => {
    // Get employee details from selected employee
    const selectedEmployee = MOCK_EMPLOYEES.find(e => e.id === values.employeeId)
    if (!selectedEmployee) {
      throw new Error('Employee not found')
    }

    const data: CreateRetentionBonusInput = {
      ...values,
      employeeName: selectedEmployee.nameEn,
      employeeNameAr: selectedEmployee.nameAr,
      departmentId: selectedEmployee.departmentId,
      designation: selectedEmployee.designation,
      vestingPeriod: values.vestingPeriod || undefined,
      vestingStartDate: values.vestingStartDate || undefined,
      vestingEndDate: values.vestingEndDate || undefined,
      clawbackConditions: values.clawbackApplicable ? values.clawbackConditions : undefined,
      clawbackPeriod: values.clawbackApplicable ? values.clawbackPeriod : undefined,
    }

    if (bonus) {
      await updateMutation.mutateAsync({ id: bonus._id, data })
    } else {
      await createMutation.mutateAsync(data)
    }

    onSuccess?.()
  }

  const isPending = createMutation.isPending || updateMutation.isPending

  // Generate form sections based on current form values
  const getFormSections = (currentValues?: Partial<BonusFormValues>): FormSectionConfig[] => {
    const sections: FormSectionConfig[] = [
      {
        title: 'Employee Information',
        titleAr: 'معلومات الموظف',
        columns: 2,
        fields: [
          {
            name: 'employeeId',
            type: 'select' as const,
            label: 'Employee',
            labelAr: 'الموظف',
            placeholder: 'Select employee',
            placeholderAr: 'اختر الموظف',
            required: true,
            colSpan: 2,
            options: MOCK_EMPLOYEES.map((emp) => ({
              value: emp.id,
              label: `${emp.nameEn} (${emp.number})`,
              labelAr: `${emp.nameAr} (${emp.number})`,
            })),
          },
        ],
      },
      {
        title: 'Bonus Details',
        titleAr: 'تفاصيل المكافأة',
        columns: 2,
        fields: [
          {
            name: 'bonusType',
            type: 'select' as const,
            label: 'Bonus Type',
            labelAr: 'نوع المكافأة',
            required: true,
            options: Object.values(BonusType).map((type) => ({
              value: type,
              label: bonusTypeLabels[type].en,
              labelAr: bonusTypeLabels[type].ar,
            })),
          },
          {
            name: 'bonusAmount',
            type: 'currency' as const,
            label: 'Amount',
            labelAr: 'المبلغ',
            placeholder: 'Enter amount',
            placeholderAr: 'أدخل المبلغ',
            required: true,
            min: 0,
            step: 0.01,
          },
          {
            name: 'paymentDate',
            type: 'date' as const,
            label: 'Payment Date',
            labelAr: 'تاريخ الدفع',
            required: true,
          },
          {
            name: 'paymentMethod',
            type: 'select' as const,
            label: 'Payment Method',
            labelAr: 'طريقة الدفع',
            required: true,
            options: Object.values(PaymentMethod).map((method) => ({
              value: method,
              label: paymentMethodLabels[method].en,
              labelAr: paymentMethodLabels[method].ar,
            })),
          },
        ],
      },
      {
        title: 'Vesting Period (Optional)',
        titleAr: 'فترة الاستحقاق (اختياري)',
        columns: 2,
        fields: [
          {
            name: 'vestingPeriod',
            type: 'number' as const,
            label: 'Vesting Period (months)',
            labelAr: 'فترة الاستحقاق (أشهر)',
            placeholder: 'e.g. 12',
            placeholderAr: 'مثال: 12',
            min: 1,
            description: 'Number of months over which bonus vests',
            descriptionAr: 'عدد الأشهر التي تستحق فيها المكافأة',
          },
          {
            name: 'vestingStartDate',
            type: 'date' as const,
            label: 'Vesting Start Date',
            labelAr: 'تاريخ بداية الاستحقاق',
          },
          {
            name: 'vestingEndDate',
            type: 'date' as const,
            label: 'Vesting End Date',
            labelAr: 'تاريخ نهاية الاستحقاق',
          },
        ],
      },
      {
        title: 'Conditions & Reasons',
        titleAr: 'الشروط والأسباب',
        columns: 1,
        fields: [
          {
            name: 'reasonForGiving',
            type: 'textarea' as const,
            label: 'Reason for Bonus (English)',
            labelAr: 'سبب المكافأة (إنجليزي)',
            placeholder: 'Enter the reason for granting this bonus in English...',
            placeholderAr: 'اكتب سبب منح المكافأة بالإنجليزي...',
            required: true,
            rows: 3,
          },
          {
            name: 'reasonForGivingAr',
            type: 'textarea' as const,
            label: 'Reason for Bonus (Arabic)',
            labelAr: 'سبب المكافأة (عربي)',
            placeholder: 'Enter the reason for granting this bonus in Arabic...',
            placeholderAr: 'اكتب سبب منح المكافأة بالعربي...',
            required: true,
            rows: 3,
          },
          {
            name: 'conditionsForPayment',
            type: 'textarea' as const,
            label: 'Payment Conditions (English)',
            labelAr: 'شروط الدفع (إنجليزي)',
            placeholder: 'Enter the payment conditions in English...',
            placeholderAr: 'اكتب شروط الدفع بالإنجليزي...',
            required: true,
            rows: 3,
          },
          {
            name: 'conditionsForPaymentAr',
            type: 'textarea' as const,
            label: 'Payment Conditions (Arabic)',
            labelAr: 'شروط الدفع (عربي)',
            placeholder: 'Enter the payment conditions in Arabic...',
            placeholderAr: 'اكتب شروط الدفع بالعربي...',
            required: true,
            rows: 3,
          },
        ],
      },
      {
        title: 'Clawback Policy',
        titleAr: 'سياسة الاسترداد',
        columns: 1,
        fields: [
          {
            name: 'clawbackApplicable',
            type: 'switch' as const,
            label: 'Enable Clawback',
            labelAr: 'تفعيل سياسة الاسترداد',
            description: 'The bonus can be recovered if conditions are not met',
            descriptionAr: 'يمكن استرداد المكافأة في حالة عدم الالتزام بالشروط',
          },
        ],
      },
    ]

    // Add clawback fields if enabled
    if (currentValues?.clawbackApplicable) {
      sections[4].fields.push(
        {
          name: 'clawbackPeriod',
          type: 'number' as const,
          label: 'Clawback Period (months)',
          labelAr: 'فترة الاسترداد (أشهر)',
          placeholder: 'e.g. 12',
          placeholderAr: 'مثال: 12',
          min: 1,
          description: 'Period during which the bonus can be recovered after payment',
          descriptionAr: 'الفترة التي يمكن خلالها استرداد المكافأة بعد الدفع',
        },
        {
          name: 'clawbackConditions',
          type: 'textarea' as const,
          label: 'Clawback Conditions',
          labelAr: 'شروط الاسترداد',
          placeholder: 'Enter the conditions that may trigger a clawback...',
          placeholderAr: 'اكتب الشروط التي قد تؤدي إلى استرداد المكافأة...',
          rows: 3,
        }
      )
    }

    return sections
  }

  return (
    <GenericFormDialog
      open={open}
      onOpenChange={onOpenChange}
      title={bonus ? 'Edit Bonus' : 'New Bonus'}
      titleAr={bonus ? 'تعديل المكافأة' : 'مكافأة جديدة'}
      description="Fill in the details below to create a new employee bonus"
      descriptionAr="قم بتعبئة البيانات أدناه لإنشاء مكافأة جديدة للموظف"
      schema={bonusFormSchema}
      sections={getFormSections(defaultValues)}
      defaultValues={defaultValues}
      onSubmit={handleSubmit}
      isLoading={isPending}
      mode={bonus ? 'edit' : 'create'}
      submitLabel={bonus ? 'Save Changes' : 'Create Bonus'}
      submitLabelAr={bonus ? 'حفظ التعديلات' : 'إنشاء المكافأة'}
      maxWidth="3xl"
    />
  )
}
