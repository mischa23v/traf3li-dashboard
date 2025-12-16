import { useEffect, useState } from 'react'
import { useForm } from 'react-hook-form'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
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
import { Loader2, Plus, Trash2, Calendar } from 'lucide-react'
import { Skeleton } from '@/components/ui/skeleton'

interface ShiftAssignmentDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  assignmentId?: string
  employeeId?: string
  onSuccess?: () => void
}

interface FormData extends CreateShiftAssignmentData {}

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
  const [isRotational, setIsRotational] = useState(false)
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

  // Form
  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
    setValue,
    watch,
  } = useForm<FormData>()

  const startDate = watch('startDate')
  const endDate = watch('endDate')

  // Initialize form with existing data
  useEffect(() => {
    if (existingAssignment) {
      reset({
        employeeId: existingAssignment.employeeId,
        shiftTypeId: existingAssignment.shiftTypeId,
        startDate: existingAssignment.startDate,
        endDate: existingAssignment.endDate,
        status: existingAssignment.status,
        isRotational: existingAssignment.isRotational,
        rotationPattern: existingAssignment.rotationPattern,
        rotationWeeks: existingAssignment.rotationWeeks,
        overrideDefaultShift: existingAssignment.overrideDefaultShift,
        overrideReason: existingAssignment.overrideReason,
        notes: existingAssignment.notes,
      })
      setIsRotational(existingAssignment.isRotational)
      if (existingAssignment.rotationPattern) {
        setRotationPatterns(existingAssignment.rotationPattern)
      }
    } else if (employeeId) {
      setValue('employeeId', employeeId)
    }
  }, [existingAssignment, employeeId, reset, setValue])

  // Handle form submission
  const onSubmit = async (data: FormData) => {
    try {
      const submitData: CreateShiftAssignmentData = {
        ...data,
        isRotational,
        rotationPattern: isRotational && rotationPatterns.length > 0 ? rotationPatterns : undefined,
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
      onSuccess?.()
    } catch (error: any) {
      toast({
        title: 'خطأ',
        description: error.message || 'فشلت العملية',
        variant: 'destructive',
      })
    }
  }

  // Add rotation pattern
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

  // Remove rotation pattern
  const removeRotationPattern = (index: number) => {
    setRotationPatterns(rotationPatterns.filter((_, i) => i !== index))
  }

  // Update rotation pattern
  const updateRotationPattern = (
    index: number,
    field: string,
    value: any
  ) => {
    const newPatterns = [...rotationPatterns]
    newPatterns[index] = { ...newPatterns[index], [field]: value }
    setRotationPatterns(newPatterns)
  }

  // Toggle day in rotation pattern
  const toggleDayInPattern = (index: number, day: DayOfWeek) => {
    const pattern = rotationPatterns[index]
    const days = pattern.daysOfWeek.includes(day)
      ? pattern.daysOfWeek.filter((d) => d !== day)
      : [...pattern.daysOfWeek, day]
    updateRotationPattern(index, 'daysOfWeek', days)
  }

  const isLoading = createMutation.isPending || updateMutation.isPending

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {assignmentId ? 'تعديل مهمة النوبة' : 'مهمة نوبة جديدة'}
          </DialogTitle>
          <DialogDescription>
            {assignmentId
              ? 'قم بتعديل تفاصيل مهمة النوبة'
              : 'قم بتعيين نوبة عمل لموظف'}
          </DialogDescription>
        </DialogHeader>

        {isLoadingAssignment ? (
          <div className="space-y-4">
            {[1, 2, 3, 4].map((i) => (
              <Skeleton key={i} className="h-12 w-full" />
            ))}
          </div>
        ) : (
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            {/* Employee Selection */}
            {!employeeId && (
              <div className="space-y-2">
                <Label htmlFor="employeeId">الموظف *</Label>
                <Select
                  onValueChange={(value) => setValue('employeeId', value)}
                  defaultValue={watch('employeeId')}
                  disabled={!!assignmentId}
                >
                  <SelectTrigger id="employeeId">
                    <SelectValue placeholder="اختر موظف" />
                  </SelectTrigger>
                  <SelectContent>
                    {/* TODO: Load employees dynamically */}
                    <SelectItem value="emp1">أحمد محمد</SelectItem>
                    <SelectItem value="emp2">سارة أحمد</SelectItem>
                    <SelectItem value="emp3">محمد علي</SelectItem>
                  </SelectContent>
                </Select>
                {errors.employeeId && (
                  <p className="text-sm text-red-600">
                    {errors.employeeId.message}
                  </p>
                )}
              </div>
            )}

            {/* Shift Type */}
            <div className="space-y-2">
              <Label htmlFor="shiftTypeId">نوع النوبة *</Label>
              <Select
                onValueChange={(value) => setValue('shiftTypeId', value)}
                defaultValue={watch('shiftTypeId')}
              >
                <SelectTrigger id="shiftTypeId">
                  <SelectValue placeholder="اختر نوع النوبة" />
                </SelectTrigger>
                <SelectContent>
                  {/* TODO: Load shift types dynamically */}
                  <SelectItem value="shift1">نوبة صباحية (8ص - 4م)</SelectItem>
                  <SelectItem value="shift2">نوبة مسائية (4م - 12م)</SelectItem>
                  <SelectItem value="shift3">نوبة ليلية (12م - 8ص)</SelectItem>
                </SelectContent>
              </Select>
              {errors.shiftTypeId && (
                <p className="text-sm text-red-600">
                  {errors.shiftTypeId.message}
                </p>
              )}
            </div>

            {/* Date Range */}
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="startDate">تاريخ البدء *</Label>
                <Input
                  id="startDate"
                  type="date"
                  {...register('startDate', {
                    required: 'تاريخ البدء مطلوب',
                  })}
                />
                {errors.startDate && (
                  <p className="text-sm text-red-600">
                    {errors.startDate.message}
                  </p>
                )}
              </div>
              <div className="space-y-2">
                <Label htmlFor="endDate">
                  تاريخ الانتهاء (اختياري للمهام الدائمة)
                </Label>
                <Input id="endDate" type="date" {...register('endDate')} />
              </div>
            </div>

            {/* Status */}
            <div className="space-y-2">
              <Label htmlFor="status">الحالة</Label>
              <Select
                onValueChange={(value) =>
                  setValue('status', value as 'active' | 'inactive' | 'scheduled')
                }
                defaultValue={watch('status') || 'active'}
              >
                <SelectTrigger id="status">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="active">نشط</SelectItem>
                  <SelectItem value="inactive">غير نشط</SelectItem>
                  <SelectItem value="scheduled">مجدول</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Is Rotational */}
            <div className="flex items-center space-x-2 space-x-reverse">
              <Checkbox
                id="isRotational"
                checked={isRotational}
                onCheckedChange={(checked) =>
                  setIsRotational(checked as boolean)
                }
              />
              <Label htmlFor="isRotational" className="cursor-pointer">
                نوبة دورية (تناوب بين عدة أنواع نوبات)
              </Label>
            </div>

            {/* Rotation Patterns */}
            {isRotational && (
              <div className="space-y-4 p-4 bg-purple-50 dark:bg-purple-900/20 rounded-lg border border-purple-200 dark:border-purple-800">
                <div className="flex items-center justify-between">
                  <Label>أنماط التناوب</Label>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={addRotationPattern}
                    className="rounded-xl"
                  >
                    <Plus className="w-4 h-4 me-2" />
                    إضافة نمط
                  </Button>
                </div>

                {rotationPatterns.map((pattern, index) => (
                  <div
                    key={index}
                    className="p-4 bg-white dark:bg-slate-900 rounded-lg border border-purple-200 dark:border-purple-800 space-y-3"
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium">
                        نمط {index + 1}
                      </span>
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => removeRotationPattern(index)}
                        className="text-red-600 hover:text-red-700 hover:bg-red-50"
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>

                    <div className="space-y-2">
                      <Label>نوع النوبة</Label>
                      <Select
                        value={pattern.shiftTypeId}
                        onValueChange={(value) =>
                          updateRotationPattern(index, 'shiftTypeId', value)
                        }
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="اختر نوع النوبة" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="shift1">
                            نوبة صباحية (8ص - 4م)
                          </SelectItem>
                          <SelectItem value="shift2">
                            نوبة مسائية (4م - 12م)
                          </SelectItem>
                          <SelectItem value="shift3">
                            نوبة ليلية (12م - 8ص)
                          </SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-2">
                      <Label>أيام الأسبوع</Label>
                      <div className="flex flex-wrap gap-2">
                        {daysOfWeek.map((day) => (
                          <div
                            key={day}
                            className="flex items-center space-x-2 space-x-reverse"
                          >
                            <Checkbox
                              id={`day-${index}-${day}`}
                              checked={pattern.daysOfWeek.includes(day)}
                              onCheckedChange={() =>
                                toggleDayInPattern(index, day)
                              }
                            />
                            <Label
                              htmlFor={`day-${index}-${day}`}
                              className="text-sm cursor-pointer"
                            >
                              {DAY_OF_WEEK_LABELS[day].ar}
                            </Label>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                ))}

                {rotationPatterns.length === 0 && (
                  <p className="text-sm text-slate-600 dark:text-slate-400 text-center py-4">
                    لم يتم إضافة أنماط تناوب بعد
                  </p>
                )}
              </div>
            )}

            {/* Override Default Shift */}
            <div className="space-y-3">
              <div className="flex items-center space-x-2 space-x-reverse">
                <Checkbox
                  id="overrideDefaultShift"
                  {...register('overrideDefaultShift')}
                />
                <Label htmlFor="overrideDefaultShift" className="cursor-pointer">
                  تجاوز النوبة الافتراضية
                </Label>
              </div>

              {watch('overrideDefaultShift') && (
                <div className="space-y-2">
                  <Label htmlFor="overrideReason">سبب التجاوز</Label>
                  <Textarea
                    id="overrideReason"
                    {...register('overrideReason')}
                    placeholder="اذكر سبب تجاوز النوبة الافتراضية..."
                    rows={2}
                  />
                </div>
              )}
            </div>

            {/* Notes */}
            <div className="space-y-2">
              <Label htmlFor="notes">ملاحظات</Label>
              <Textarea
                id="notes"
                {...register('notes.assignmentNotes')}
                placeholder="أي ملاحظات إضافية حول المهمة..."
                rows={3}
              />
            </div>

            <DialogFooter className="gap-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => onOpenChange(false)}
                disabled={isLoading}
                className="rounded-xl"
              >
                إلغاء
              </Button>
              <Button
                type="submit"
                disabled={isLoading}
                className="bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl"
              >
                {isLoading && <Loader2 className="w-4 h-4 me-2 animate-spin" />}
                {assignmentId ? 'تحديث' : 'إنشاء'}
              </Button>
            </DialogFooter>
          </form>
        )}
      </DialogContent>
    </Dialog>
  )
}
