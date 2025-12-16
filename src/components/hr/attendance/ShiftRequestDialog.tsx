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
  useShiftRequest,
  useCreateShiftRequest,
  useUpdateShiftRequest,
  useCheckShiftRequestConflicts,
} from '@/hooks/useShiftAssignment'
import type { CreateShiftRequestData } from '@/services/shiftAssignmentService'
import { Loader2, AlertTriangle, CheckCircle, Info } from 'lucide-react'
import { Skeleton } from '@/components/ui/skeleton'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'

interface ShiftRequestDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  requestId?: string
  employeeId?: string
  onSuccess?: () => void
}

interface FormData extends CreateShiftRequestData {}

const reasonCategories = [
  { value: 'personal', label: 'شخصي' },
  { value: 'health', label: 'صحي' },
  { value: 'family', label: 'عائلي' },
  { value: 'transportation', label: 'مواصلات' },
  { value: 'education', label: 'تعليمي' },
  { value: 'other', label: 'أخرى' },
]

export function ShiftRequestDialog({
  open,
  onOpenChange,
  requestId,
  employeeId,
  onSuccess,
}: ShiftRequestDialogProps) {
  const { toast } = useToast()
  const [isPermanent, setIsPermanent] = useState(false)
  const [showConflicts, setShowConflicts] = useState(false)
  const [conflicts, setConflicts] = useState<any>(null)

  // Fetch existing request if editing
  const {
    data: existingRequest,
    isLoading: isLoadingRequest,
  } = useShiftRequest(requestId || '', {
    enabled: !!requestId,
  } as any)

  // Mutations
  const createMutation = useCreateShiftRequest()
  const updateMutation = useUpdateShiftRequest()
  const checkConflictsMutation = useCheckShiftRequestConflicts()

  // Form
  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
    setValue,
    watch,
  } = useForm<FormData>()

  const requestedShiftTypeId = watch('requestedShiftTypeId')
  const fromDate = watch('fromDate')
  const toDate = watch('toDate')

  // Initialize form with existing data
  useEffect(() => {
    if (existingRequest) {
      reset({
        employeeId: existingRequest.employeeId,
        requestedShiftTypeId: existingRequest.requestedShiftTypeId,
        fromDate: existingRequest.fromDate,
        toDate: existingRequest.toDate,
        permanent: existingRequest.permanent,
        reason: existingRequest.reason,
        reasonAr: existingRequest.reasonAr,
        reasonCategory: existingRequest.reasonCategory,
        notes: existingRequest.notes,
      })
      setIsPermanent(existingRequest.permanent)
    } else if (employeeId) {
      setValue('employeeId', employeeId)
    }
  }, [existingRequest, employeeId, reset, setValue])

  // Check for conflicts when relevant fields change
  useEffect(() => {
    if (
      employeeId &&
      requestedShiftTypeId &&
      fromDate &&
      toDate &&
      !requestId
    ) {
      checkConflicts()
    }
  }, [employeeId, requestedShiftTypeId, fromDate, toDate])

  const checkConflicts = async () => {
    if (!employeeId || !requestedShiftTypeId || !fromDate || !toDate) return

    try {
      const result = await checkConflictsMutation.mutateAsync({
        employeeId: employeeId || watch('employeeId'),
        requestedShiftTypeId,
        fromDate,
        toDate,
      })
      setConflicts(result)
      setShowConflicts(result.hasConflicts)
    } catch (error) {
      console.error('Failed to check conflicts:', error)
    }
  }

  // Handle form submission
  const onSubmit = async (data: FormData) => {
    try {
      const submitData: CreateShiftRequestData = {
        ...data,
        permanent: isPermanent,
      }

      if (requestId) {
        await updateMutation.mutateAsync({
          requestId,
          data: submitData,
        })
        toast({
          title: 'تم التحديث',
          description: 'تم تحديث طلب تغيير النوبة بنجاح',
        })
      } else {
        await createMutation.mutateAsync(submitData)
        toast({
          title: 'تم الإرسال',
          description: 'تم إرسال طلب تغيير النوبة بنجاح',
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

  const isLoading = createMutation.isPending || updateMutation.isPending

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {requestId ? 'تعديل طلب تغيير النوبة' : 'طلب تغيير نوبة'}
          </DialogTitle>
          <DialogDescription>
            {requestId
              ? 'قم بتعديل تفاصيل الطلب'
              : 'قم بتقديم طلب لتغيير نوبة العمل'}
          </DialogDescription>
        </DialogHeader>

        {isLoadingRequest ? (
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
                  disabled={!!requestId}
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

            {/* Current Shift Info */}
            {existingRequest?.currentShiftTypeName && (
              <Alert>
                <Info className="h-4 w-4" />
                <AlertTitle>النوبة الحالية</AlertTitle>
                <AlertDescription>
                  {existingRequest.currentShiftTypeNameAr ||
                    existingRequest.currentShiftTypeName}
                </AlertDescription>
              </Alert>
            )}

            {/* Requested Shift Type */}
            <div className="space-y-2">
              <Label htmlFor="requestedShiftTypeId">النوبة المطلوبة *</Label>
              <Select
                onValueChange={(value) =>
                  setValue('requestedShiftTypeId', value)
                }
                defaultValue={watch('requestedShiftTypeId')}
              >
                <SelectTrigger id="requestedShiftTypeId">
                  <SelectValue placeholder="اختر النوبة المطلوبة" />
                </SelectTrigger>
                <SelectContent>
                  {/* TODO: Load shift types dynamically */}
                  <SelectItem value="shift1">نوبة صباحية (8ص - 4م)</SelectItem>
                  <SelectItem value="shift2">نوبة مسائية (4م - 12م)</SelectItem>
                  <SelectItem value="shift3">نوبة ليلية (12م - 8ص)</SelectItem>
                </SelectContent>
              </Select>
              {errors.requestedShiftTypeId && (
                <p className="text-sm text-red-600">
                  {errors.requestedShiftTypeId.message}
                </p>
              )}
            </div>

            {/* Date Range */}
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="fromDate">من تاريخ *</Label>
                <Input
                  id="fromDate"
                  type="date"
                  {...register('fromDate', {
                    required: 'تاريخ البدء مطلوب',
                  })}
                />
                {errors.fromDate && (
                  <p className="text-sm text-red-600">
                    {errors.fromDate.message}
                  </p>
                )}
              </div>
              <div className="space-y-2">
                <Label htmlFor="toDate">إلى تاريخ *</Label>
                <Input
                  id="toDate"
                  type="date"
                  {...register('toDate', {
                    required: 'تاريخ الانتهاء مطلوب',
                  })}
                  disabled={isPermanent}
                />
                {errors.toDate && (
                  <p className="text-sm text-red-600">
                    {errors.toDate.message}
                  </p>
                )}
              </div>
            </div>

            {/* Permanent Change */}
            <div className="flex items-center space-x-2 space-x-reverse">
              <Checkbox
                id="permanent"
                checked={isPermanent}
                onCheckedChange={(checked) => {
                  setIsPermanent(checked as boolean)
                  if (checked) {
                    // Set toDate to far future for permanent changes
                    setValue('toDate', '2099-12-31')
                  }
                }}
              />
              <Label htmlFor="permanent" className="cursor-pointer">
                تغيير دائم
              </Label>
            </div>

            {/* Reason Category */}
            <div className="space-y-2">
              <Label htmlFor="reasonCategory">تصنيف السبب *</Label>
              <Select
                onValueChange={(value) =>
                  setValue(
                    'reasonCategory',
                    value as
                      | 'personal'
                      | 'health'
                      | 'family'
                      | 'transportation'
                      | 'education'
                      | 'other'
                  )
                }
                defaultValue={watch('reasonCategory')}
              >
                <SelectTrigger id="reasonCategory">
                  <SelectValue placeholder="اختر تصنيف السبب" />
                </SelectTrigger>
                <SelectContent>
                  {reasonCategories.map((cat) => (
                    <SelectItem key={cat.value} value={cat.value}>
                      {cat.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {errors.reasonCategory && (
                <p className="text-sm text-red-600">
                  {errors.reasonCategory.message}
                </p>
              )}
            </div>

            {/* Reason */}
            <div className="space-y-2">
              <Label htmlFor="reason">سبب الطلب *</Label>
              <Textarea
                id="reason"
                {...register('reason', {
                  required: 'السبب مطلوب',
                  minLength: {
                    value: 10,
                    message: 'السبب يجب أن يكون 10 أحرف على الأقل',
                  },
                })}
                placeholder="اشرح سبب طلب تغيير النوبة بالتفصيل..."
                rows={4}
              />
              {errors.reason && (
                <p className="text-sm text-red-600">{errors.reason.message}</p>
              )}
            </div>

            {/* Additional Notes */}
            <div className="space-y-2">
              <Label htmlFor="notes">ملاحظات إضافية</Label>
              <Textarea
                id="notes"
                {...register('notes.employeeNotes')}
                placeholder="أي معلومات إضافية تود إضافتها..."
                rows={3}
              />
            </div>

            {/* Conflict Warnings */}
            {showConflicts && conflicts && conflicts.hasConflicts && (
              <Alert variant="destructive">
                <AlertTriangle className="h-4 w-4" />
                <AlertTitle>تحذير - توجد تعارضات</AlertTitle>
                <AlertDescription>
                  <ul className="list-disc list-inside space-y-1 mt-2">
                    {conflicts.conflicts.map(
                      (conflict: any, index: number) => (
                        <li key={index}>
                          {conflict.conflictDetails}
                          <span
                            className={`ms-2 text-xs ${
                              conflict.severity === 'high'
                                ? 'text-red-600 font-semibold'
                                : conflict.severity === 'medium'
                                  ? 'text-orange-600'
                                  : 'text-yellow-600'
                            }`}
                          >
                            ({conflict.severity === 'high'
                              ? 'عالي'
                              : conflict.severity === 'medium'
                                ? 'متوسط'
                                : 'منخفض'}
                            )
                          </span>
                        </li>
                      )
                    )}
                  </ul>
                </AlertDescription>
              </Alert>
            )}

            {/* Team Impact */}
            {conflicts && conflicts.teamImpact && (
              <Alert
                variant={
                  conflicts.teamImpact.affectsTeamCoverage
                    ? 'destructive'
                    : 'default'
                }
              >
                {conflicts.teamImpact.affectsTeamCoverage ? (
                  <AlertTriangle className="h-4 w-4" />
                ) : (
                  <CheckCircle className="h-4 w-4" />
                )}
                <AlertTitle>تأثير على الفريق</AlertTitle>
                <AlertDescription>
                  <div className="space-y-1 mt-2">
                    <p>
                      عدد الموظفين في النوبة:{' '}
                      {conflicts.teamImpact.onShiftCount} من{' '}
                      {conflicts.teamImpact.currentTeamSize}
                    </p>
                    <p>
                      نسبة التغطية: {conflicts.teamImpact.coveragePercentage}%
                    </p>
                    {!conflicts.teamImpact.acceptable && (
                      <p className="text-red-600 font-semibold">
                        تحذير: قد يؤثر هذا الطلب على تغطية الفريق
                      </p>
                    )}
                  </div>
                </AlertDescription>
              </Alert>
            )}

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
                {requestId ? 'تحديث الطلب' : 'إرسال الطلب'}
              </Button>
            </DialogFooter>
          </form>
        )}
      </DialogContent>
    </Dialog>
  )
}
