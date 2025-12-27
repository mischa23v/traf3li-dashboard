import { useTranslation } from 'react-i18next'
import * as z from 'zod'
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
import { GenericFormDialog, FormSectionConfig } from '@/components/generic-form-dialog'

// Form validation schema
const incentiveFormSchema = z.object({
  employeeId: z.string().min(1, 'الرجاء اختيار الموظف'),
  employeeName: z.string().optional(),
  employeeNameAr: z.string().optional(),
  employeeNumber: z.string().optional(),
  departmentId: z.string().optional(),
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

  // Queries
  const { data: salaryComponentsData } = useSalaryComponents({
    type: 'earning',
    isActive: true,
  })

  // Mutations
  const createMutation = useCreateEmployeeIncentive()
  const updateMutation = useUpdateEmployeeIncentive()

  const salaryComponents = salaryComponentsData?.components || []

  // Prepare default values
  const defaultValues: Partial<IncentiveFormValues> = incentive
    ? {
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
      }
    : {
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
      }

  // Submit handler
  const handleSubmit = async (data: IncentiveFormValues) => {
    try {
      // Auto-populate employee data
      const employee = MOCK_EMPLOYEES.find((e) => e.id === data.employeeId)
      if (employee) {
        data.employeeName = employee.nameEn
        data.employeeNameAr = employee.nameAr
        data.employeeNumber = employee.number
        data.departmentId = employee.departmentId
        data.departmentName = employee.departmentNameEn
        data.departmentNameAr = employee.departmentNameAr
      }

      // Auto-populate salary component data if selected
      if (data.salaryComponentId) {
        const component = salaryComponents.find((c) => c._id === data.salaryComponentId)
        if (component) {
          data.salaryComponentName = component.name
          data.salaryComponentNameAr = component.nameAr
        }
      }

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

      onSuccess?.()
    } catch (error) {
      // Error is handled by the mutation
      console.error('Error submitting incentive:', error)
      throw error // Re-throw to prevent dialog from closing
    }
  }

  const isLoading = createMutation.isPending || updateMutation.isPending

  // Form sections configuration
  const formSections: FormSectionConfig[] = [
    {
      title: 'Employee Information',
      titleAr: 'معلومات الموظف',
      columns: 2,
      fields: [
        {
          name: 'employeeId',
          type: 'select',
          label: 'Employee',
          labelAr: 'الموظف',
          placeholder: 'Select Employee',
          placeholderAr: 'اختر الموظف',
          required: true,
          disabled: isEditMode,
          colSpan: 2,
          options: MOCK_EMPLOYEES.map((employee) => ({
            value: employee.id,
            label: `${employee.nameEn} (${employee.number})`,
            labelAr: `${employee.nameAr} (${employee.number})`,
          })),
        },
        {
          name: 'officeId',
          type: 'select',
          label: 'Office',
          labelAr: 'المكتب',
          placeholder: 'Select Office',
          placeholderAr: 'اختر المكتب',
          required: true,
          colSpan: 2,
          options: MOCK_OFFICES.map((office) => ({
            value: office.id,
            label: office.nameEn,
            labelAr: office.nameAr,
          })),
        },
      ],
    },
    {
      title: 'Incentive Details',
      titleAr: 'تفاصيل الحافز',
      columns: 2,
      fields: [
        {
          name: 'incentiveType',
          type: 'select',
          label: 'Incentive Type',
          labelAr: 'نوع الحافز',
          placeholder: 'Select Incentive Type',
          placeholderAr: 'اختر نوع الحافز',
          required: true,
          colSpan: 2,
          options: Object.entries(incentiveTypeLabels).map(([value, label]) => ({
            value,
            label: label.en,
            labelAr: label.ar,
          })),
        },
        {
          name: 'incentiveAmount',
          type: 'number',
          label: 'Amount',
          labelAr: 'المبلغ',
          placeholder: '0.00',
          required: true,
          min: 0,
          step: 0.01,
        },
        {
          name: 'currency',
          type: 'select',
          label: 'Currency',
          labelAr: 'العملة',
          required: true,
          options: [
            { value: 'SAR', label: 'Saudi Riyal', labelAr: 'ريال سعودي' },
            { value: 'USD', label: 'US Dollar', labelAr: 'دولار أمريكي' },
            { value: 'EUR', label: 'Euro', labelAr: 'يورو' },
          ],
        },
        {
          name: 'salaryComponentId',
          type: 'select',
          label: 'Salary Component',
          labelAr: 'مكون الراتب',
          placeholder: 'Select Salary Component (Optional)',
          placeholderAr: 'اختر مكون الراتب (اختياري)',
          description: 'Link the incentive to a specific salary component',
          descriptionAr: 'ربط الحافز بمكون راتب محدد',
          colSpan: 2,
          options: salaryComponents.map((component) => ({
            value: component._id,
            label: `${component.name} (${component.abbr})`,
            labelAr: `${component.nameAr} (${component.abbr})`,
          })),
        },
        {
          name: 'payrollDate',
          type: 'date',
          label: 'Payroll Date',
          labelAr: 'تاريخ الرواتب',
          required: true,
          description: 'The payroll period this incentive will be added to',
          descriptionAr: 'فترة الرواتب التي سيتم إضافة الحافز إليها',
          colSpan: 2,
        },
      ],
    },
    {
      title: 'Reason & Reference',
      titleAr: 'السبب والمرجع',
      columns: 1,
      fields: [
        {
          name: 'incentiveReason',
          type: 'textarea',
          label: 'Reason (English)',
          labelAr: 'السبب (English)',
          placeholder: 'Enter the reason for granting the incentive',
          placeholderAr: 'أدخل سبب منح الحافز بالإنجليزية',
          required: true,
          rows: 3,
        },
        {
          name: 'incentiveReasonAr',
          type: 'textarea',
          label: 'Reason (Arabic)',
          labelAr: 'السبب (العربية)',
          placeholder: 'Enter the reason in Arabic',
          placeholderAr: 'أدخل سبب منح الحافز بالعربية',
          required: true,
          rows: 3,
        },
        {
          name: 'referenceType',
          type: 'select',
          label: 'Reference Type',
          labelAr: 'نوع المرجع',
          placeholder: 'Select Reference Type (Optional)',
          placeholderAr: 'اختر نوع المرجع (اختياري)',
          description: 'Type of document or reference linked to the incentive',
          descriptionAr: 'نوع المستند أو المرجع المرتبط بالحافز',
          options: Object.entries(referenceTypeLabels).map(([value, label]) => ({
            value,
            label: label.en,
            labelAr: label.ar,
          })),
        },
        {
          name: 'referenceId',
          type: 'text',
          label: 'Reference ID',
          labelAr: 'رقم المرجع',
          placeholder: 'e.g., REF-2024-001',
          placeholderAr: 'مثال: REF-2024-001',
          description: 'Reference document or ID number',
          descriptionAr: 'رقم المستند أو المرجع المرتبط',
        },
      ],
    },
  ]

  return (
    <GenericFormDialog
      open={open}
      onOpenChange={onOpenChange}
      title={isEditMode ? 'Edit Employee Incentive' : 'New Employee Incentive'}
      titleAr={isEditMode ? 'تعديل حافز موظف' : 'حافز موظف جديد'}
      description="Enter the details of the employee incentive"
      descriptionAr="أدخل تفاصيل الحافز للموظف"
      schema={incentiveFormSchema}
      sections={formSections}
      defaultValues={defaultValues}
      onSubmit={handleSubmit}
      isLoading={isLoading}
      mode={isEditMode ? 'edit' : 'create'}
      submitLabel={isEditMode ? 'Update' : 'Create'}
      submitLabelAr={isEditMode ? 'تحديث' : 'إنشاء'}
      maxWidth="lg"
    />
  )
}
