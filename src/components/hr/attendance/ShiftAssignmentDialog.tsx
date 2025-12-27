import { useState, useEffect } from 'react'
import { z } from 'zod'
import { GenericFormDialog, FormSectionConfig } from '@/components/generic-form-dialog'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Checkbox } from '@/components/ui/checkbox'
import { useToast } from '@/hooks/use-toast'
import {
  useShiftAssignment,
  useAssignShift,
  useUpdateAssignment,
} from '@/hooks/useShiftAssignment'
import type {
  CreateShiftAssignmentData,
  DayOfWeek,
} from '@/services/shiftAssignmentService'
import { DAY_OF_WEEK_LABELS } from '@/services/shiftAssignmentService'
import { Plus, Trash2 } from 'lucide-react'
import { Skeleton } from '@/components/ui/skeleton'

interface ShiftAssignmentDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  assignmentId?: string
  employeeId?: string
  onSuccess?: () => void
}

// Zod schema for form validation
const shiftAssignmentSchema = z.object({
  employeeId: z.string().min(1, 'الموظف مطلوب'),
  shiftTypeId: z.string().min(1, 'نوع النوبة مطلوب'),
  startDate: z.string().min(1, 'تاريخ البدء مطلوب'),
  endDate: z.string().optional(),
  status: z.enum(['active', 'inactive', 'scheduled']).default('active'),
  isRotational: z.boolean().default(false),
  rotationWeeks: z.number().optional(),
  overrideDefaultShift: z.boolean().default(false),
  overrideReason: z.string().optional(),
  assignmentNotes: z.string().optional(),
})

type ShiftAssignmentFormData = z.infer<typeof shiftAssignmentSchema>

const daysOfWeek: DayOfWeek[] = [
  'sunday',
  'monday',
  'tuesday',
  'wednesday',
  'thursday',
  'friday',
  'saturday',
]

export function ShiftAssignmentDialog({
  open,
  onOpenChange,
  assignmentId,
  employeeId,
  onSuccess,
}: ShiftAssignmentDialogProps) {
  const { toast } = useToast()

  // State for rotation patterns (managed separately due to complexity)
  const [rotationPatterns, setRotationPatterns] = useState<
    Array<{
      shiftTypeId: string
      shiftName: string
      daysOfWeek: DayOfWeek[]
    }>
  >([])

  // Fetch existing assignment if editing
  const {
    data: existingAssignment,
    isLoading: isLoadingAssignment,
  } = useShiftAssignment(assignmentId || '', {
    enabled: !!assignmentId,
  } as any)

  // Mutations
  const createMutation = useAssignShift()
  const updateMutation = useUpdateAssignment()

  // Initialize rotation patterns when editing
  useEffect(() => {
    if (existingAssignment?.rotationPattern) {
      setRotationPatterns(existingAssignment.rotationPattern)
    } else {
      setRotationPatterns([])
    }
  }, [existingAssignment])

  // Prepare default values for form
  const defaultValues: Partial<ShiftAssignmentFormData> = existingAssignment
    ? {
        employeeId: existingAssignment.employeeId,
        shiftTypeId: existingAssignment.shiftTypeId,
        startDate: existingAssignment.startDate,
        endDate: existingAssignment.endDate,
        status: existingAssignment.status,
        isRotational: existingAssignment.isRotational,
        rotationWeeks: existingAssignment.rotationWeeks,
        overrideDefaultShift: existingAssignment.overrideDefaultShift,
        overrideReason: existingAssignment.overrideReason,
        assignmentNotes: existingAssignment.notes?.assignmentNotes,
      }
    : employeeId
    ? { employeeId, status: 'active' as const }
    : { status: 'active' as const }

  // Handle form submission
  const handleSubmit = async (data: ShiftAssignmentFormData) => {
    try {
      const submitData: CreateShiftAssignmentData = {
        employeeId: data.employeeId,
        shiftTypeId: data.shiftTypeId,
        startDate: data.startDate,
        endDate: data.endDate,
        status: data.status,
        isRotational: data.isRotational,
        rotationPattern: data.isRotational && rotationPatterns.length > 0 ? rotationPatterns : undefined,
        rotationWeeks: data.rotationWeeks,
        overrideDefaultShift: data.overrideDefaultShift,
        overrideReason: data.overrideReason,
        notes: {
          assignmentNotes: data.assignmentNotes,
        },
      }

      if (assignmentId) {
        await updateMutation.mutateAsync({
          assignmentId,
          data: submitData,
        })
        toast({
          title: 'تم التحديث',
          description: 'تم تحديث مهمة النوبة بنجاح',
        })
      } else {
        await createMutation.mutateAsync(submitData)
        toast({
          title: 'تم الإنشاء',
          description: 'تم إنشاء مهمة النوبة بنجاح',
        })
      }
      setRotationPatterns([])
      onSuccess?.()
    } catch (error: any) {
      toast({
        title: 'خطأ',
        description: error.message || 'فشلت العملية',
        variant: 'destructive',
      })
      throw error // Re-throw to prevent dialog from closing
    }
  }

  // Rotation pattern management functions
  // NOTE: These functions are prepared for when rotation patterns UI is implemented
  // They are currently used in handleSubmit to combine rotation data with form data
  const addRotationPattern = () => {
    setRotationPatterns([
      ...rotationPatterns,
      {
        shiftTypeId: '',
        shiftName: '',
        daysOfWeek: [],
      },
    ])
  }

  const removeRotationPattern = (index: number) => {
    setRotationPatterns(rotationPatterns.filter((_, i) => i !== index))
  }

  const updateRotationPattern = (
    index: number,
    field: string,
    value: any
  ) => {
    const newPatterns = [...rotationPatterns]
    newPatterns[index] = { ...newPatterns[index], [field]: value }
    setRotationPatterns(newPatterns)
  }

  const toggleDayInPattern = (index: number, day: DayOfWeek) => {
    const pattern = rotationPatterns[index]
    const days = pattern.daysOfWeek.includes(day)
      ? pattern.daysOfWeek.filter((d) => d !== day)
      : [...pattern.daysOfWeek, day]
    updateRotationPattern(index, 'daysOfWeek', days)
  }

  const isLoading = createMutation.isPending || updateMutation.isPending

  // Form sections configuration
  // NOTE: Conditional fields (rotationWeeks, overrideReason) are based on defaultValues
  // GenericFormDialog doesn't currently support dynamic field visibility based on form value changes
  // For fully dynamic forms, GenericFormDialog would need to be extended with reactive sections
  const getFormSections = (formValues?: Partial<ShiftAssignmentFormData>): FormSectionConfig[] => {
    const sections: FormSectionConfig[] = [
      {
        title: 'Assignment Details',
        titleAr: 'تفاصيل التعيين',
        columns: 2,
        fields: [
          // Employee field - only show if not pre-selected
          ...(!employeeId ? [{
            name: 'employeeId',
            type: 'select' as const,
            label: 'Employee',
            labelAr: 'الموظف',
            placeholder: 'Select employee',
            placeholderAr: 'اختر موظف',
            required: true,
            disabled: !!assignmentId,
            colSpan: 2 as const,
            options: [
              { value: 'emp1', label: 'Ahmed Mohammed', labelAr: 'أحمد محمد' },
              { value: 'emp2', label: 'Sarah Ahmed', labelAr: 'سارة أحمد' },
              { value: 'emp3', label: 'Mohammed Ali', labelAr: 'محمد علي' },
            ],
          }] : []),
          {
            name: 'shiftTypeId',
            type: 'select' as const,
            label: 'Shift Type',
            labelAr: 'نوع النوبة',
            placeholder: 'Select shift type',
            placeholderAr: 'اختر نوع النوبة',
            required: true,
            colSpan: 2 as const,
            options: [
              { value: 'shift1', label: 'Morning Shift (8AM - 4PM)', labelAr: 'نوبة صباحية (8ص - 4م)' },
              { value: 'shift2', label: 'Evening Shift (4PM - 12AM)', labelAr: 'نوبة مسائية (4م - 12م)' },
              { value: 'shift3', label: 'Night Shift (12AM - 8AM)', labelAr: 'نوبة ليلية (12م - 8ص)' },
            ],
          },
          {
            name: 'startDate',
            type: 'date' as const,
            label: 'Start Date',
            labelAr: 'تاريخ البدء',
            required: true,
          },
          {
            name: 'endDate',
            type: 'date' as const,
            label: 'End Date',
            labelAr: 'تاريخ الانتهاء',
            description: 'Optional for permanent assignments',
            descriptionAr: 'اختياري للمهام الدائمة',
          },
          {
            name: 'status',
            type: 'select' as const,
            label: 'Status',
            labelAr: 'الحالة',
            required: true,
            options: [
              { value: 'active', label: 'Active', labelAr: 'نشط' },
              { value: 'inactive', label: 'Inactive', labelAr: 'غير نشط' },
              { value: 'scheduled', label: 'Scheduled', labelAr: 'مجدول' },
            ],
          },
          {
            name: 'isRotational',
            type: 'switch' as const,
            label: 'Rotational Shift',
            labelAr: 'نوبة دورية',
            description: 'Rotate between multiple shift types',
            descriptionAr: 'تناوب بين عدة أنواع نوبات',
          },
        ],
      },
    ]

    // Add rotation weeks field if isRotational is true
    if (formValues?.isRotational) {
      sections[0].fields.push({
        name: 'rotationWeeks',
        type: 'number' as const,
        label: 'Rotation Weeks',
        labelAr: 'أسابيع التناوب',
        description: 'Number of weeks in rotation cycle',
        descriptionAr: 'عدد الأسابيع في دورة التناوب',
        min: 1,
        max: 52,
        colSpan: 2 as const,
      })
    }

    // Override section
    sections.push({
      title: 'Override Settings',
      titleAr: 'إعدادات التجاوز',
      columns: 1,
      fields: [
        {
          name: 'overrideDefaultShift',
          type: 'switch' as const,
          label: 'Override Default Shift',
          labelAr: 'تجاوز النوبة الافتراضية',
          description: 'Override the employee\'s default shift assignment',
          descriptionAr: 'تجاوز تعيين النوبة الافتراضية للموظف',
        },
      ],
    })

    // Add override reason field if overrideDefaultShift is true
    if (formValues?.overrideDefaultShift) {
      sections[1].fields.push({
        name: 'overrideReason',
        type: 'textarea' as const,
        label: 'Override Reason',
        labelAr: 'سبب التجاوز',
        placeholder: 'Explain why the default shift is being overridden...',
        placeholderAr: 'اذكر سبب تجاوز النوبة الافتراضية...',
        rows: 2,
      })
    }

    // Notes section
    sections.push({
      title: 'Additional Notes',
      titleAr: 'ملاحظات إضافية',
      columns: 1,
      fields: [
        {
          name: 'assignmentNotes',
          type: 'textarea' as const,
          label: 'Notes',
          labelAr: 'ملاحظات',
          placeholder: 'Any additional notes about this assignment...',
          placeholderAr: 'أي ملاحظات إضافية حول المهمة...',
          rows: 3,
        },
      ],
    })

    return sections
  }

  if (isLoadingAssignment) {
    return (
      <div className="space-y-4 p-6">
        {[1, 2, 3, 4].map((i) => (
          <Skeleton key={i} className="h-12 w-full" />
        ))}
      </div>
    )
  }

  return (
    <GenericFormDialog
      open={open}
      onOpenChange={(isOpen) => {
        onOpenChange(isOpen)
        if (!isOpen) {
          setRotationPatterns([])
        }
      }}
      title={assignmentId ? 'Edit Shift Assignment' : 'New Shift Assignment'}
      titleAr={assignmentId ? 'تعديل مهمة النوبة' : 'مهمة نوبة جديدة'}
      description={
        assignmentId
          ? 'Update the shift assignment details'
          : 'Assign a work shift to an employee'
      }
      descriptionAr={
        assignmentId
          ? 'قم بتعديل تفاصيل مهمة النوبة'
          : 'قم بتعيين نوبة عمل لموظف'
      }
      schema={shiftAssignmentSchema}
      sections={getFormSections(defaultValues)}
      defaultValues={defaultValues}
      onSubmit={handleSubmit}
      isLoading={isLoading}
      mode={assignmentId ? 'edit' : 'create'}
      submitLabel={assignmentId ? 'Update' : 'Create'}
      submitLabelAr={assignmentId ? 'تحديث' : 'إنشاء'}
      maxWidth="3xl"
    />
  )

  /*
    NOTE: Rotation Patterns Feature

    The rotation patterns section requires complex dynamic array manipulation
    (add/remove patterns, nested fields, checkbox groups for days) which is
    not currently supported by GenericFormDialog.

    Current implementation:
    - Rotation patterns state is managed with useState
    - Patterns are combined with form data in the onSubmit handler
    - The UI for rotation patterns is not yet implemented in this GenericFormDialog version

    To fully implement this feature, GenericFormDialog would need to be extended
    to support one of the following:

    1. Dynamic array fields with add/remove functionality
    2. Nested field groups within array items
    3. Custom field renderers or a 'custom' field type that accepts JSX
    4. A renderCustomContent prop that allows injecting custom sections

    Alternative implementation approaches:
    - Create a separate RotationPatternsDialog component
    - Extend GenericFormDialog with custom field support
    - Use a compound component pattern with GenericFormDialog
    - Create a dedicated ArrayField component for dynamic arrays

    For now, the rotation patterns functionality is prepared in the state management
    and submit handler, but the UI needs to be implemented separately or GenericFormDialog
    needs to be extended to support this use case.
  */
}
