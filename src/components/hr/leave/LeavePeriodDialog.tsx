import { useState } from 'react'
import { z } from 'zod'
import { useCreateLeavePeriod, useUpdateLeavePeriod, useAllocateLeavesForPeriod } from '@/hooks/useLeavePeriod'
import { GenericFormDialog } from '@/components/generic-form-dialog'
import type { FormSectionConfig } from '@/components/generic-form-dialog'
import { toast } from 'sonner'
import type { LeavePeriod, CreateLeavePeriodData } from '@/services/leavePeriodService'

const leavePeriodSchema = z.object({
  name: z.string().min(1, 'اسم الفترة مطلوب'),
  nameAr: z.string().min(1, 'الاسم بالعربية مطلوب'),
  fromDate: z.string().min(1, 'تاريخ البداية مطلوب'),
  toDate: z.string().min(1, 'تاريخ النهاية مطلوب'),
  company: z.string().optional(),
  isActive: z.boolean().default(false),
  autoAllocateLeaves: z.boolean().default(false),
  allocateOnDayOfPeriodStart: z.boolean().default(false),
}).refine((data) => {
  const fromDate = new Date(data.fromDate)
  const toDate = new Date(data.toDate)
  return fromDate < toDate
}, {
  message: 'تاريخ النهاية يجب أن يكون بعد تاريخ البداية',
  path: ['toDate'],
})

type LeavePeriodFormData = z.infer<typeof leavePeriodSchema>

interface LeavePeriodDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  period?: LeavePeriod | null
}

export function LeavePeriodDialog({ open, onOpenChange, period }: LeavePeriodDialogProps) {
  const [allocateNow, setAllocateNow] = useState(false)
  const isEdit = !!period

  const createMutation = useCreateLeavePeriod()
  const updateMutation = useUpdateLeavePeriod()
  const allocateMutation = useAllocateLeavesForPeriod()

  // Define form sections
  const sections: FormSectionConfig[] = [
    {
      title: 'المعلومات الأساسية',
      titleAr: 'المعلومات الأساسية',
      columns: 2,
      fields: [
        {
          name: 'name',
          type: 'text',
          label: 'اسم الفترة (إنجليزي)',
          labelAr: 'اسم الفترة (إنجليزي)',
          placeholder: '2024 Annual Leave Period',
          required: true,
        },
        {
          name: 'nameAr',
          type: 'text',
          label: 'اسم الفترة (عربي)',
          labelAr: 'اسم الفترة (عربي)',
          placeholder: 'فترة الإجازات السنوية 2024',
          required: true,
        },
      ],
    },
    {
      title: 'التواريخ',
      titleAr: 'التواريخ',
      columns: 2,
      fields: [
        {
          name: 'fromDate',
          type: 'date',
          label: 'تاريخ البداية',
          labelAr: 'تاريخ البداية',
          description: 'بداية فترة الإجازات',
          descriptionAr: 'بداية فترة الإجازات',
          required: true,
        },
        {
          name: 'toDate',
          type: 'date',
          label: 'تاريخ النهاية',
          labelAr: 'تاريخ النهاية',
          description: 'نهاية فترة الإجازات',
          descriptionAr: 'نهاية فترة الإجازات',
          required: true,
        },
      ],
    },
    {
      fields: [
        {
          name: 'company',
          type: 'text',
          label: 'الشركة (اختياري)',
          labelAr: 'الشركة (اختياري)',
          placeholder: 'اسم الشركة',
          description: 'اترك فارغاً لتطبيق الفترة على جميع الشركات',
          descriptionAr: 'اترك فارغاً لتطبيق الفترة على جميع الشركات',
        },
      ],
    },
    {
      title: 'الإعدادات',
      titleAr: 'الإعدادات',
      fields: [
        {
          name: 'isActive',
          type: 'switch',
          label: 'تفعيل الفترة',
          labelAr: 'تفعيل الفترة',
          description: 'جعل هذه الفترة نشطة للموظفين',
          descriptionAr: 'جعل هذه الفترة نشطة للموظفين',
        },
        {
          name: 'autoAllocateLeaves',
          type: 'switch',
          label: 'التخصيص التلقائي',
          labelAr: 'التخصيص التلقائي',
          description: 'تخصيص الإجازات تلقائياً للموظفين',
          descriptionAr: 'تخصيص الإجازات تلقائياً للموظفين',
        },
        {
          name: 'allocateOnDayOfPeriodStart',
          type: 'switch',
          label: 'التخصيص في يوم البداية',
          labelAr: 'التخصيص في يوم البداية',
          description: 'تخصيص الإجازات في اليوم الأول من الفترة',
          descriptionAr: 'تخصيص الإجازات في اليوم الأول من الفترة',
        },
      ],
    },
  ]

  // Prepare default values
  const defaultValues = period
    ? {
        name: period.name,
        nameAr: period.nameAr,
        fromDate: period.fromDate.split('T')[0],
        toDate: period.toDate.split('T')[0],
        company: period.company || '',
        isActive: period.isActive,
        autoAllocateLeaves: period.autoAllocateLeaves,
        allocateOnDayOfPeriodStart: period.allocateOnDayOfPeriodStart,
      }
    : {
        name: '',
        nameAr: '',
        fromDate: '',
        toDate: '',
        company: '',
        isActive: false,
        autoAllocateLeaves: false,
        allocateOnDayOfPeriodStart: false,
      }

  const handleSubmit = async (data: LeavePeriodFormData) => {
    const submitData: CreateLeavePeriodData = {
      name: data.name,
      nameAr: data.nameAr,
      fromDate: data.fromDate,
      toDate: data.toDate,
      company: data.company || undefined,
      isActive: data.isActive,
      autoAllocateLeaves: data.autoAllocateLeaves,
      allocateOnDayOfPeriodStart: data.allocateOnDayOfPeriodStart,
    }

    if (isEdit && period) {
      await updateMutation.mutateAsync({
        id: period._id,
        data: submitData,
      })
      toast.success('تم تحديث الفترة بنجاح')
    } else {
      const newPeriod = await createMutation.mutateAsync(submitData)
      toast.success('تم إنشاء الفترة بنجاح')

      // If allocate now is checked, allocate leaves for the period
      if (allocateNow && newPeriod._id) {
        try {
          const result = await allocateMutation.mutateAsync({
            periodId: newPeriod._id,
            data: {},
          })
          toast.success(
            `تم تخصيص الإجازات بنجاح لـ ${result.employeesProcessed} موظف`,
            {
              description: `تم إنشاء ${result.allocationsCreated} تخصيص إجازة`,
            }
          )
        } catch (error: any) {
          toast.error('حدث خطأ في تخصيص الإجازات', {
            description: error?.message,
          })
        }
      }
    }
  }

  const isPending = createMutation.isPending || updateMutation.isPending || allocateMutation.isPending

  return (
    <GenericFormDialog
      open={open}
      onOpenChange={onOpenChange}
      title={isEdit ? 'تعديل فترة الإجازات' : 'إنشاء فترة إجازات جديدة'}
      titleAr={isEdit ? 'تعديل فترة الإجازات' : 'إنشاء فترة إجازات جديدة'}
      description={
        isEdit
          ? 'قم بتعديل تفاصيل فترة الإجازات'
          : 'قم بإنشاء فترة إجازات جديدة لتخصيص الإجازات للموظفين'
      }
      descriptionAr={
        isEdit
          ? 'قم بتعديل تفاصيل فترة الإجازات'
          : 'قم بإنشاء فترة إجازات جديدة لتخصيص الإجازات للموظفين'
      }
      schema={leavePeriodSchema}
      sections={sections}
      defaultValues={defaultValues}
      onSubmit={handleSubmit}
      isLoading={isPending}
      mode={isEdit ? 'edit' : 'create'}
      submitLabel={isEdit ? 'حفظ التعديلات' : 'إنشاء الفترة'}
      submitLabelAr={isEdit ? 'حفظ التعديلات' : 'إنشاء الفترة'}
      maxWidth="lg"
    />
  )
}
