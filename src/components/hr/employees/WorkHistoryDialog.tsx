import { useMemo } from 'react'
import { useTranslation } from 'react-i18next'
import * as z from 'zod'
import { GenericFormDialog, FormSectionConfig } from '@/components/generic-form-dialog'
import type { ExternalWorkHistory } from '@/services/hrService'

interface WorkHistoryDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  workHistory?: ExternalWorkHistory | null
  onSave: (history: Omit<ExternalWorkHistory, 'historyId'>) => void
  isLoading?: boolean
}

// Form validation schema
const workHistoryFormSchema = z.object({
  companyName: z.string().min(1, 'Company name is required'),
  companyNameAr: z.string().min(1, 'اسم الشركة مطلوب'),
  designation: z.string().min(1, 'Designation is required'),
  designationAr: z.string().min(1, 'المسمى الوظيفي مطلوب'),
  fromDate: z.string().min(1, 'From date is required'),
  toDate: z.string().min(1, 'To date is required'),
  salary: z.number().optional(),
  currency: z.string().default('SAR'),
  address: z.string().optional(),
  contactPerson: z.string().optional(),
  contactPhone: z.string().optional(),
  reasonForLeaving: z.string().optional(),
  verified: z.boolean().default(false),
})

type WorkHistoryFormValues = z.infer<typeof workHistoryFormSchema>

// Calculate total experience helper
const calculateExperience = (from: string, to: string): string => {
  if (!from || !to) return ''

  const fromDate = new Date(from)
  const toDate = new Date(to)

  const diffMs = toDate.getTime() - fromDate.getTime()
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24))

  const years = Math.floor(diffDays / 365)
  const months = Math.floor((diffDays % 365) / 30)

  if (years > 0 && months > 0) {
    return `${years} سنة ${months} شهر`
  } else if (years > 0) {
    return `${years} سنة`
  } else if (months > 0) {
    return `${months} شهر`
  } else {
    return `${diffDays} يوم`
  }
}

export function WorkHistoryDialog({
  open,
  onOpenChange,
  workHistory,
  onSave,
  isLoading
}: WorkHistoryDialogProps) {
  const { i18n } = useTranslation()
  const isArabic = i18n.language === 'ar'
  const isEditMode = !!workHistory

  // Prepare default values
  const defaultValues: Partial<WorkHistoryFormValues> = useMemo(() => {
    if (workHistory) {
      return {
        companyName: workHistory.companyName,
        companyNameAr: workHistory.companyNameAr,
        designation: workHistory.designation,
        designationAr: workHistory.designationAr,
        fromDate: workHistory.fromDate.split('T')[0],
        toDate: workHistory.toDate.split('T')[0],
        salary: workHistory.salary,
        currency: workHistory.currency || 'SAR',
        address: workHistory.address || '',
        contactPerson: workHistory.contactPerson || '',
        contactPhone: workHistory.contactPhone || '',
        reasonForLeaving: workHistory.reasonForLeaving || '',
        verified: workHistory.verified,
      }
    }
    return {
      companyName: '',
      companyNameAr: '',
      designation: '',
      designationAr: '',
      fromDate: '',
      toDate: '',
      salary: undefined,
      currency: 'SAR',
      address: '',
      contactPerson: '',
      contactPhone: '',
      reasonForLeaving: '',
      verified: false,
    }
  }, [workHistory])

  // Submit handler
  const handleSubmit = async (data: WorkHistoryFormValues) => {
    const totalExperience = calculateExperience(data.fromDate, data.toDate)

    const historyData: Omit<ExternalWorkHistory, 'historyId'> = {
      companyName: data.companyName,
      companyNameAr: data.companyNameAr,
      designation: data.designation,
      designationAr: data.designationAr,
      fromDate: data.fromDate,
      toDate: data.toDate,
      salary: data.salary,
      currency: data.currency,
      totalExperience,
      address: data.address,
      contactPerson: data.contactPerson,
      contactPhone: data.contactPhone,
      reasonForLeaving: data.reasonForLeaving,
      verified: data.verified,
      verificationDate: data.verified ? new Date().toISOString() : undefined,
    }

    onSave(historyData)
  }

  // Form sections configuration
  const formSections: FormSectionConfig[] = [
    {
      title: 'Company Information',
      titleAr: 'معلومات الشركة',
      columns: 2,
      fields: [
        {
          name: 'companyNameAr',
          type: 'text',
          label: 'Company Name (Arabic)',
          labelAr: 'اسم الشركة (عربي)',
          placeholder: 'شركة المحاماة السعودية',
          required: true,
        },
        {
          name: 'companyName',
          type: 'text',
          label: 'Company Name (English)',
          labelAr: 'اسم الشركة (إنجليزي)',
          placeholder: 'Saudi Law Firm',
          required: true,
        },
      ],
    },
    {
      title: 'Position Information',
      titleAr: 'معلومات الوظيفة',
      columns: 2,
      fields: [
        {
          name: 'designationAr',
          type: 'text',
          label: 'Designation (Arabic)',
          labelAr: 'المسمى الوظيفي (عربي)',
          placeholder: 'محامي أول',
          required: true,
        },
        {
          name: 'designation',
          type: 'text',
          label: 'Designation (English)',
          labelAr: 'المسمى الوظيفي (إنجليزي)',
          placeholder: 'Senior Attorney',
          required: true,
        },
      ],
    },
    {
      title: 'Employment Period',
      titleAr: 'فترة العمل',
      columns: 2,
      fields: [
        {
          name: 'fromDate',
          type: 'date',
          label: 'From Date',
          labelAr: 'من تاريخ',
          required: true,
        },
        {
          name: 'toDate',
          type: 'date',
          label: 'To Date',
          labelAr: 'إلى تاريخ',
          required: true,
        },
      ],
    },
    {
      title: 'Compensation',
      titleAr: 'التعويضات',
      columns: 2,
      fields: [
        {
          name: 'salary',
          type: 'number',
          label: 'Salary',
          labelAr: 'الراتب',
          placeholder: '15000',
          min: 0,
          step: 100,
          colSpan: 1,
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
            { value: 'AED', label: 'UAE Dirham', labelAr: 'درهم إماراتي' },
            { value: 'KWD', label: 'Kuwaiti Dinar', labelAr: 'دينار كويتي' },
          ],
        },
      ],
    },
    {
      title: 'Additional Information',
      titleAr: 'معلومات إضافية',
      columns: 1,
      fields: [
        {
          name: 'address',
          type: 'text',
          label: 'Company Address',
          labelAr: 'عنوان الشركة',
          placeholder: 'الرياض، المملكة العربية السعودية',
        },
      ],
    },
    {
      title: 'Reference Contact',
      titleAr: 'بيانات المرجع',
      columns: 2,
      fields: [
        {
          name: 'contactPerson',
          type: 'text',
          label: 'Reference Name',
          labelAr: 'اسم المرجع',
          placeholder: 'اسم المدير أو المشرف',
        },
        {
          name: 'contactPhone',
          type: 'tel',
          label: 'Reference Phone',
          labelAr: 'رقم هاتف المرجع',
          placeholder: '+966 5XXXXXXXX',
          description: 'Confidential - for verification purposes only',
          descriptionAr: 'سري - لأغراض التحقق فقط',
        },
      ],
    },
    {
      title: 'Leaving Information',
      titleAr: 'معلومات ترك العمل',
      columns: 1,
      fields: [
        {
          name: 'reasonForLeaving',
          type: 'textarea',
          label: 'Reason for Leaving',
          labelAr: 'سبب ترك العمل',
          placeholder: 'اذكر سبب ترك العمل (اختياري)',
          rows: 3,
        },
      ],
    },
    {
      title: 'Verification',
      titleAr: 'التحقق',
      columns: 1,
      fields: [
        {
          name: 'verified',
          type: 'switch',
          label: 'Verified',
          labelAr: 'تم التحقق من الخبرة',
          description: 'Has this work history been verified?',
          descriptionAr: 'هل تم التحقق من صحة هذه الخبرة؟',
        },
      ],
    },
  ]

  return (
    <GenericFormDialog
      open={open}
      onOpenChange={onOpenChange}
      title={isEditMode ? 'Edit Work History' : 'Add Work History'}
      titleAr={isEditMode ? 'تعديل الخبرة الوظيفية' : 'إضافة خبرة وظيفية'}
      description="Enter the external work experience details"
      descriptionAr="أدخل تفاصيل الخبرة الوظيفية الخارجية"
      schema={workHistoryFormSchema}
      sections={formSections}
      defaultValues={defaultValues}
      onSubmit={handleSubmit}
      isLoading={isLoading}
      mode={isEditMode ? 'edit' : 'create'}
      submitLabel="Save"
      submitLabelAr="حفظ"
      maxWidth="3xl"
    />
  )
}
