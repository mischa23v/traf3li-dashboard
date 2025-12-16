import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Switch } from '@/components/ui/switch'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import {
  useCreateLeaveAllocation,
  useUpdateLeaveAllocation,
  useLeaveAllocation,
} from '@/hooks/useLeaveAllocation'
import type { LeaveType } from '@/services/leaveService'
import type { CreateLeaveAllocationData } from '@/services/leaveAllocationService'
import { Calendar, Save, X, AlertTriangle, Palmtree, Users, Clock, TrendingUp } from 'lucide-react'
import { Alert, AlertDescription } from '@/components/ui/alert'

interface LeaveAllocationCreateViewProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  allocationId?: string
  employeeId?: string
  onSuccess?: () => void
}

const LEAVE_TYPES: { value: LeaveType; label: string; labelAr: string }[] = [
  { value: 'annual', label: 'Annual Leave', labelAr: 'إجازة سنوية' },
  { value: 'sick', label: 'Sick Leave', labelAr: 'إجازة مرضية' },
  { value: 'hajj', label: 'Hajj Leave', labelAr: 'إجازة حج' },
  { value: 'marriage', label: 'Marriage Leave', labelAr: 'إجازة زواج' },
  { value: 'birth', label: 'Birth Leave', labelAr: 'إجازة ولادة' },
  { value: 'death', label: 'Death Leave', labelAr: 'إجازة وفاة' },
  { value: 'maternity', label: 'Maternity Leave', labelAr: 'إجازة وضع' },
  { value: 'paternity', label: 'Paternity Leave', labelAr: 'إجازة أبوة' },
  { value: 'exam', label: 'Exam Leave', labelAr: 'إجازة امتحان' },
  { value: 'unpaid', label: 'Unpaid Leave', labelAr: 'إجازة بدون راتب' },
]

export function LeaveAllocationCreateView({
  open,
  onOpenChange,
  allocationId,
  employeeId: initialEmployeeId,
  onSuccess,
}: LeaveAllocationCreateViewProps) {
  const isEditMode = !!allocationId

  // Form state
  const [employeeId, setEmployeeId] = useState(initialEmployeeId || '')
  const [leaveType, setLeaveType] = useState<LeaveType>('annual')
  const [fromDate, setFromDate] = useState('')
  const [toDate, setToDate] = useState('')
  const [newLeavesAllocated, setNewLeavesAllocated] = useState<number>(0)
  const [unusedLeaves, setUnusedLeaves] = useState<number>(0)
  const [carryForward, setCarryForward] = useState(false)
  const [carryForwardedLeaves, setCarryForwardedLeaves] = useState<number>(0)
  const [carryForwardExpiryDate, setCarryForwardExpiryDate] = useState('')
  const [leavePeriodId, setLeavePeriodId] = useState('')
  const [leavePolicyId, setLeavePolicyId] = useState('')
  const [notes, setNotes] = useState('')

  // Error state
  const [errors, setErrors] = useState<Record<string, string>>({})

  // Hooks
  const createMutation = useCreateLeaveAllocation()
  const updateMutation = useUpdateLeaveAllocation()
  const { data: existingAllocation, isLoading: isLoadingAllocation } = useLeaveAllocation(
    allocationId || ''
  )

  // Load existing allocation data in edit mode
  useEffect(() => {
    if (isEditMode && existingAllocation) {
      setEmployeeId(existingAllocation.employeeId)
      setLeaveType(existingAllocation.leaveType)
      setFromDate(existingAllocation.fromDate)
      setToDate(existingAllocation.toDate)
      setNewLeavesAllocated(existingAllocation.newLeavesAllocated)
      setUnusedLeaves(existingAllocation.unusedLeaves)
      setCarryForward(existingAllocation.carryForward)
      setCarryForwardedLeaves(existingAllocation.carryForwardedLeaves)
      setCarryForwardExpiryDate(existingAllocation.carryForwardExpiryDate || '')
      setLeavePeriodId(existingAllocation.leavePeriodId || '')
      setLeavePolicyId(existingAllocation.leavePolicyId || '')
      setNotes(existingAllocation.notes || '')
    }
  }, [isEditMode, existingAllocation])

  // Calculate total allocated
  const totalAllocated = newLeavesAllocated + (carryForward ? carryForwardedLeaves : 0) + unusedLeaves

  // Validate form
  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {}

    if (!employeeId) newErrors.employeeId = 'الموظف مطلوب'
    if (!leaveType) newErrors.leaveType = 'نوع الإجازة مطلوب'
    if (!fromDate) newErrors.fromDate = 'تاريخ البداية مطلوب'
    if (!toDate) newErrors.toDate = 'تاريخ النهاية مطلوب'
    if (fromDate && toDate && new Date(fromDate) > new Date(toDate)) {
      newErrors.toDate = 'تاريخ النهاية يجب أن يكون بعد تاريخ البداية'
    }
    if (newLeavesAllocated < 0) newErrors.newLeavesAllocated = 'الأيام المخصصة يجب أن تكون صفر أو أكثر'
    if (unusedLeaves < 0) newErrors.unusedLeaves = 'الأيام غير المستخدمة يجب أن تكون صفر أو أكثر'
    if (carryForward && carryForwardedLeaves < 0) {
      newErrors.carryForwardedLeaves = 'الأيام المنقولة يجب أن تكون صفر أو أكثر'
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  // Handle submit
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!validateForm()) return

    const data: CreateLeaveAllocationData = {
      employeeId,
      leaveType,
      fromDate,
      toDate,
      newLeavesAllocated,
      unusedLeaves: unusedLeaves || undefined,
      carryForward: carryForward || undefined,
      carryForwardedLeaves: carryForward ? carryForwardedLeaves : undefined,
      carryForwardExpiryDate: carryForward && carryForwardExpiryDate ? carryForwardExpiryDate : undefined,
      leavePeriodId: leavePeriodId || undefined,
      leavePolicyId: leavePolicyId || undefined,
      notes: notes || undefined,
    }

    try {
      if (isEditMode && allocationId) {
        await updateMutation.mutateAsync({ allocationId, data })
      } else {
        await createMutation.mutateAsync(data)
      }
      handleClose()
      onSuccess?.()
    } catch (error) {
      console.error('Failed to save allocation:', error)
    }
  }

  // Handle close
  const handleClose = () => {
    resetForm()
    onOpenChange(false)
  }

  // Reset form
  const resetForm = () => {
    if (!isEditMode) {
      setEmployeeId(initialEmployeeId || '')
      setLeaveType('annual')
      setFromDate('')
      setToDate('')
      setNewLeavesAllocated(0)
      setUnusedLeaves(0)
      setCarryForward(false)
      setCarryForwardedLeaves(0)
      setCarryForwardExpiryDate('')
      setLeavePeriodId('')
      setLeavePolicyId('')
      setNotes('')
    }
    setErrors({})
  }

  const isLoading = createMutation.isPending || updateMutation.isPending
  const isLoadingData = isEditMode && isLoadingAllocation

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-xl">
            <div className="h-10 w-10 rounded-xl bg-emerald-50 flex items-center justify-center">
              <Calendar className="h-5 w-5 text-emerald-600" />
            </div>
            {isEditMode ? 'تعديل تخصيص الإجازة' : 'تخصيص إجازة جديد'}
          </DialogTitle>
          <DialogDescription>
            {isEditMode
              ? 'تعديل بيانات تخصيص الإجازة للموظف'
              : 'إنشاء تخصيص إجازة جديد للموظف حسب نوع الإجازة'}
          </DialogDescription>
        </DialogHeader>

        {isLoadingData ? (
          <div className="py-12 text-center">
            <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-emerald-600 border-r-transparent"></div>
            <p className="mt-4 text-slate-500">جاري التحميل...</p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Basic Information */}
            <Card className="border-slate-200">
              <CardHeader className="pb-4">
                <CardTitle className="text-base flex items-center gap-2">
                  <Users className="w-4 h-4 text-blue-600" />
                  المعلومات الأساسية
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Employee ID */}
                  <div className="space-y-2">
                    <Label htmlFor="employeeId">
                      الموظف <span className="text-red-500">*</span>
                    </Label>
                    <Input
                      id="employeeId"
                      value={employeeId}
                      onChange={(e) => setEmployeeId(e.target.value)}
                      placeholder="رقم الموظف أو اختر من القائمة"
                      className={`rounded-xl ${errors.employeeId ? 'border-red-500' : ''}`}
                      disabled={isEditMode}
                    />
                    {errors.employeeId && (
                      <p className="text-xs text-red-500">{errors.employeeId}</p>
                    )}
                  </div>

                  {/* Leave Type */}
                  <div className="space-y-2">
                    <Label htmlFor="leaveType">
                      نوع الإجازة <span className="text-red-500">*</span>
                    </Label>
                    <Select value={leaveType} onValueChange={(v) => setLeaveType(v as LeaveType)}>
                      <SelectTrigger
                        id="leaveType"
                        className={`rounded-xl ${errors.leaveType ? 'border-red-500' : ''}`}
                      >
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {LEAVE_TYPES.map((type) => (
                          <SelectItem key={type.value} value={type.value}>
                            {type.labelAr}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    {errors.leaveType && (
                      <p className="text-xs text-red-500">{errors.leaveType}</p>
                    )}
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* From Date */}
                  <div className="space-y-2">
                    <Label htmlFor="fromDate">
                      من تاريخ <span className="text-red-500">*</span>
                    </Label>
                    <Input
                      id="fromDate"
                      type="date"
                      value={fromDate}
                      onChange={(e) => setFromDate(e.target.value)}
                      className={`rounded-xl ${errors.fromDate ? 'border-red-500' : ''}`}
                    />
                    {errors.fromDate && <p className="text-xs text-red-500">{errors.fromDate}</p>}
                  </div>

                  {/* To Date */}
                  <div className="space-y-2">
                    <Label htmlFor="toDate">
                      إلى تاريخ <span className="text-red-500">*</span>
                    </Label>
                    <Input
                      id="toDate"
                      type="date"
                      value={toDate}
                      onChange={(e) => setToDate(e.target.value)}
                      className={`rounded-xl ${errors.toDate ? 'border-red-500' : ''}`}
                      min={fromDate}
                    />
                    {errors.toDate && <p className="text-xs text-red-500">{errors.toDate}</p>}
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Allocation Details */}
            <Card className="border-slate-200">
              <CardHeader className="pb-4">
                <CardTitle className="text-base flex items-center gap-2">
                  <Palmtree className="w-4 h-4 text-emerald-600" />
                  تفاصيل التخصيص
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* New Leaves Allocated */}
                  <div className="space-y-2">
                    <Label htmlFor="newLeavesAllocated">
                      الأيام المخصصة الجديدة <span className="text-red-500">*</span>
                    </Label>
                    <Input
                      id="newLeavesAllocated"
                      type="number"
                      min="0"
                      step="0.5"
                      value={newLeavesAllocated}
                      onChange={(e) => setNewLeavesAllocated(parseFloat(e.target.value) || 0)}
                      className={`rounded-xl ${errors.newLeavesAllocated ? 'border-red-500' : ''}`}
                    />
                    {errors.newLeavesAllocated && (
                      <p className="text-xs text-red-500">{errors.newLeavesAllocated}</p>
                    )}
                  </div>

                  {/* Unused Leaves */}
                  <div className="space-y-2">
                    <Label htmlFor="unusedLeaves">الأيام غير المستخدمة (من الفترة السابقة)</Label>
                    <Input
                      id="unusedLeaves"
                      type="number"
                      min="0"
                      step="0.5"
                      value={unusedLeaves}
                      onChange={(e) => setUnusedLeaves(parseFloat(e.target.value) || 0)}
                      className={`rounded-xl ${errors.unusedLeaves ? 'border-red-500' : ''}`}
                    />
                    {errors.unusedLeaves && (
                      <p className="text-xs text-red-500">{errors.unusedLeaves}</p>
                    )}
                  </div>
                </div>

                {/* Carry Forward Toggle */}
                <div className="flex items-center justify-between p-4 bg-purple-50 rounded-xl border border-purple-200">
                  <div className="flex items-center gap-2">
                    <TrendingUp className="w-5 h-5 text-purple-600" />
                    <div>
                      <Label className="text-purple-700 font-medium">ترحيل الإجازة</Label>
                      <p className="text-xs text-purple-600">السماح بترحيل الإجازة إلى الفترة التالية</p>
                    </div>
                  </div>
                  <Switch checked={carryForward} onCheckedChange={setCarryForward} />
                </div>

                {/* Carry Forward Details */}
                {carryForward && (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-4 bg-purple-50 rounded-xl">
                    <div className="space-y-2">
                      <Label htmlFor="carryForwardedLeaves">الأيام المنقولة</Label>
                      <Input
                        id="carryForwardedLeaves"
                        type="number"
                        min="0"
                        step="0.5"
                        value={carryForwardedLeaves}
                        onChange={(e) => setCarryForwardedLeaves(parseFloat(e.target.value) || 0)}
                        className={`rounded-xl ${errors.carryForwardedLeaves ? 'border-red-500' : ''}`}
                      />
                      {errors.carryForwardedLeaves && (
                        <p className="text-xs text-red-500">{errors.carryForwardedLeaves}</p>
                      )}
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="carryForwardExpiryDate">تاريخ انتهاء الترحيل</Label>
                      <Input
                        id="carryForwardExpiryDate"
                        type="date"
                        value={carryForwardExpiryDate}
                        onChange={(e) => setCarryForwardExpiryDate(e.target.value)}
                        className="rounded-xl"
                      />
                    </div>
                  </div>
                )}

                {/* Total Allocated Summary */}
                <Alert className="bg-blue-50 border-blue-200">
                  <Clock className="h-4 w-4 text-blue-600" />
                  <AlertDescription className="text-blue-700">
                    <div className="flex items-center justify-between">
                      <span className="font-medium">إجمالي الأيام المخصصة:</span>
                      <span className="text-2xl font-bold">{totalAllocated}</span>
                    </div>
                    <div className="text-xs mt-2 space-y-1">
                      <div className="flex justify-between">
                        <span>جديدة: {newLeavesAllocated}</span>
                        {unusedLeaves > 0 && <span>+ غير مستخدمة: {unusedLeaves}</span>}
                        {carryForward && carryForwardedLeaves > 0 && (
                          <span>+ منقولة: {carryForwardedLeaves}</span>
                        )}
                      </div>
                    </div>
                  </AlertDescription>
                </Alert>
              </CardContent>
            </Card>

            {/* Additional Information */}
            <Card className="border-slate-200">
              <CardHeader className="pb-4">
                <CardTitle className="text-base flex items-center gap-2">
                  <Clock className="w-4 h-4 text-slate-600" />
                  معلومات إضافية
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Leave Period ID */}
                  <div className="space-y-2">
                    <Label htmlFor="leavePeriodId">فترة الإجازة</Label>
                    <Input
                      id="leavePeriodId"
                      value={leavePeriodId}
                      onChange={(e) => setLeavePeriodId(e.target.value)}
                      placeholder="معرف فترة الإجازة"
                      className="rounded-xl"
                    />
                  </div>

                  {/* Leave Policy ID */}
                  <div className="space-y-2">
                    <Label htmlFor="leavePolicyId">سياسة الإجازة</Label>
                    <Input
                      id="leavePolicyId"
                      value={leavePolicyId}
                      onChange={(e) => setLeavePolicyId(e.target.value)}
                      placeholder="معرف سياسة الإجازة"
                      className="rounded-xl"
                    />
                  </div>
                </div>

                {/* Notes */}
                <div className="space-y-2">
                  <Label htmlFor="notes">ملاحظات</Label>
                  <Textarea
                    id="notes"
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    placeholder="أي ملاحظات أو تعليقات إضافية..."
                    className="rounded-xl min-h-[100px]"
                  />
                </div>
              </CardContent>
            </Card>

            {/* Form Actions */}
            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={handleClose}
                disabled={isLoading}
                className="rounded-xl"
              >
                <X className="w-4 h-4 ms-2" />
                إلغاء
              </Button>
              <Button
                type="submit"
                disabled={isLoading}
                className="bg-emerald-500 hover:bg-emerald-600 text-white rounded-xl"
              >
                <Save className="w-4 h-4 ms-2" />
                {isLoading ? 'جاري الحفظ...' : isEditMode ? 'حفظ التعديلات' : 'إنشاء التخصيص'}
              </Button>
            </DialogFooter>
          </form>
        )}
      </DialogContent>
    </Dialog>
  )
}
