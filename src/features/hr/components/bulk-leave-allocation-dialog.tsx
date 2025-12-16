import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Switch } from '@/components/ui/switch'
import { Checkbox } from '@/components/ui/checkbox'
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
import { Badge } from '@/components/ui/badge'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { useBulkAllocateLeaves } from '@/hooks/useLeaveAllocation'
import type { LeaveType } from '@/services/leaveService'
import type { BulkAllocationData } from '@/services/leaveAllocationService'
import {
  Calendar,
  Save,
  X,
  Users,
  Palmtree,
  Clock,
  AlertTriangle,
  CheckCircle,
  Building2,
  Search,
} from 'lucide-react'

interface BulkLeaveAllocationDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
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

// Mock employee data - in real app this would come from API
const MOCK_EMPLOYEES = [
  { id: 'emp-1', name: 'أحمد محمد', nameAr: 'أحمد محمد', department: 'IT', departmentAr: 'تقنية المعلومات' },
  { id: 'emp-2', name: 'فاطمة علي', nameAr: 'فاطمة علي', department: 'HR', departmentAr: 'الموارد البشرية' },
  { id: 'emp-3', name: 'محمد خالد', nameAr: 'محمد خالد', department: 'Finance', departmentAr: 'المالية' },
  { id: 'emp-4', name: 'نورة سعد', nameAr: 'نورة سعد', department: 'Marketing', departmentAr: 'التسويق' },
  { id: 'emp-5', name: 'عبدالله يوسف', nameAr: 'عبدالله يوسف', department: 'IT', departmentAr: 'تقنية المعلومات' },
]

const DEPARTMENTS = [
  { value: 'all', label: 'جميع الأقسام' },
  { value: 'IT', label: 'تقنية المعلومات' },
  { value: 'HR', label: 'الموارد البشرية' },
  { value: 'Finance', label: 'المالية' },
  { value: 'Marketing', label: 'التسويق' },
]

export function BulkLeaveAllocationDialog({
  open,
  onOpenChange,
  onSuccess,
}: BulkLeaveAllocationDialogProps) {
  // Form state
  const [leaveType, setLeaveType] = useState<LeaveType>('annual')
  const [fromDate, setFromDate] = useState('')
  const [toDate, setToDate] = useState('')
  const [newLeavesAllocated, setNewLeavesAllocated] = useState<number>(30)
  const [carryForward, setCarryForward] = useState(true)
  const [leavePeriodId, setLeavePeriodId] = useState('')
  const [leavePolicyId, setLeavePolicyId] = useState('')
  const [notes, setNotes] = useState('')

  // Employee selection
  const [selectedEmployeeIds, setSelectedEmployeeIds] = useState<string[]>([])
  const [departmentFilter, setDepartmentFilter] = useState('all')
  const [searchQuery, setSearchQuery] = useState('')

  // Error state
  const [errors, setErrors] = useState<Record<string, string>>({})

  // Mutation
  const bulkAllocateMutation = useBulkAllocateLeaves()

  // Filter employees
  const filteredEmployees = MOCK_EMPLOYEES.filter((emp) => {
    const matchesDept = departmentFilter === 'all' || emp.department === departmentFilter
    const matchesSearch =
      !searchQuery ||
      emp.nameAr.toLowerCase().includes(searchQuery.toLowerCase()) ||
      emp.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      emp.id.toLowerCase().includes(searchQuery.toLowerCase())
    return matchesDept && matchesSearch
  })

  // Handle employee selection
  const handleToggleEmployee = (employeeId: string) => {
    setSelectedEmployeeIds((prev) =>
      prev.includes(employeeId)
        ? prev.filter((id) => id !== employeeId)
        : [...prev, employeeId]
    )
  }

  const handleSelectAll = () => {
    setSelectedEmployeeIds(filteredEmployees.map((emp) => emp.id))
  }

  const handleDeselectAll = () => {
    setSelectedEmployeeIds([])
  }

  // Validate form
  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {}

    if (selectedEmployeeIds.length === 0) {
      newErrors.employees = 'يجب اختيار موظف واحد على الأقل'
    }
    if (!leaveType) newErrors.leaveType = 'نوع الإجازة مطلوب'
    if (!fromDate) newErrors.fromDate = 'تاريخ البداية مطلوب'
    if (!toDate) newErrors.toDate = 'تاريخ النهاية مطلوب'
    if (fromDate && toDate && new Date(fromDate) > new Date(toDate)) {
      newErrors.toDate = 'تاريخ النهاية يجب أن يكون بعد تاريخ البداية'
    }
    if (newLeavesAllocated <= 0) {
      newErrors.newLeavesAllocated = 'الأيام المخصصة يجب أن تكون أكثر من صفر'
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  // Handle submit
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!validateForm()) return

    const data: BulkAllocationData = {
      employeeIds: selectedEmployeeIds,
      leaveType,
      fromDate,
      toDate,
      newLeavesAllocated,
      carryForward: carryForward || undefined,
      leavePeriodId: leavePeriodId || undefined,
      leavePolicyId: leavePolicyId || undefined,
      notes: notes || undefined,
    }

    try {
      const result = await bulkAllocateMutation.mutateAsync(data)

      // Show success message
      if (result.success) {
        handleClose()
        onSuccess?.()
      }
    } catch (error) {
      console.error('Failed to bulk allocate:', error)
    }
  }

  // Handle close
  const handleClose = () => {
    resetForm()
    onOpenChange(false)
  }

  // Reset form
  const resetForm = () => {
    setLeaveType('annual')
    setFromDate('')
    setToDate('')
    setNewLeavesAllocated(30)
    setCarryForward(true)
    setLeavePeriodId('')
    setLeavePolicyId('')
    setNotes('')
    setSelectedEmployeeIds([])
    setDepartmentFilter('all')
    setSearchQuery('')
    setErrors({})
  }

  const isLoading = bulkAllocateMutation.isPending

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-5xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-xl">
            <div className="h-10 w-10 rounded-xl bg-emerald-50 flex items-center justify-center">
              <Users className="h-5 w-5 text-emerald-600" />
            </div>
            تخصيص إجازات جماعي
          </DialogTitle>
          <DialogDescription>
            تخصيص إجازات لمجموعة من الموظفين دفعة واحدة
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Left Column - Employee Selection */}
            <Card className="border-slate-200">
              <CardHeader className="pb-4">
                <CardTitle className="text-base flex items-center gap-2">
                  <Users className="w-4 h-4 text-blue-600" />
                  اختيار الموظفين
                  {selectedEmployeeIds.length > 0 && (
                    <Badge className="bg-blue-100 text-blue-700 border-0 ms-auto">
                      {selectedEmployeeIds.length} محدد
                    </Badge>
                  )}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Error message */}
                {errors.employees && (
                  <Alert className="bg-red-50 border-red-200">
                    <AlertTriangle className="h-4 w-4 text-red-600" />
                    <AlertDescription className="text-red-700">
                      {errors.employees}
                    </AlertDescription>
                  </Alert>
                )}

                {/* Search and filters */}
                <div className="space-y-3">
                  <div className="relative">
                    <Search className="absolute start-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                    <Input
                      type="text"
                      placeholder="بحث بالاسم أو الرقم..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="ps-10 rounded-xl"
                    />
                  </div>

                  <Select value={departmentFilter} onValueChange={setDepartmentFilter}>
                    <SelectTrigger className="rounded-xl">
                      <Building2 className="w-4 h-4 ms-2" />
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {DEPARTMENTS.map((dept) => (
                        <SelectItem key={dept.value} value={dept.value}>
                          {dept.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>

                  <div className="flex gap-2">
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={handleSelectAll}
                      className="flex-1 rounded-xl"
                    >
                      <CheckCircle className="w-3 h-3 ms-1" />
                      تحديد الكل
                    </Button>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={handleDeselectAll}
                      className="flex-1 rounded-xl"
                    >
                      <X className="w-3 h-3 ms-1" />
                      إلغاء التحديد
                    </Button>
                  </div>
                </div>

                {/* Employee list */}
                <div className="space-y-2 max-h-[400px] overflow-y-auto border rounded-xl p-3">
                  {filteredEmployees.length === 0 ? (
                    <div className="text-center py-8 text-slate-500">
                      لا يوجد موظفين متاحين
                    </div>
                  ) : (
                    filteredEmployees.map((employee) => (
                      <div
                        key={employee.id}
                        className="flex items-center gap-3 p-3 rounded-lg hover:bg-slate-50 cursor-pointer"
                        onClick={() => handleToggleEmployee(employee.id)}
                      >
                        <Checkbox
                          checked={selectedEmployeeIds.includes(employee.id)}
                          onCheckedChange={() => handleToggleEmployee(employee.id)}
                        />
                        <div className="flex-1">
                          <p className="font-medium text-navy">{employee.nameAr}</p>
                          <p className="text-xs text-slate-500">{employee.departmentAr}</p>
                        </div>
                        <Badge variant="outline" className="text-xs">
                          {employee.id}
                        </Badge>
                      </div>
                    ))
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Right Column - Allocation Details */}
            <div className="space-y-4">
              {/* Leave Type & Dates */}
              <Card className="border-slate-200">
                <CardHeader className="pb-4">
                  <CardTitle className="text-base flex items-center gap-2">
                    <Palmtree className="w-4 h-4 text-emerald-600" />
                    معلومات الإجازة
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {/* Leave Type */}
                  <div className="space-y-2">
                    <Label htmlFor="leaveType">
                      نوع الإجازة <span className="text-red-500">*</span>
                    </Label>
                    <Select
                      value={leaveType}
                      onValueChange={(v) => setLeaveType(v as LeaveType)}
                    >
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

                  <div className="grid grid-cols-2 gap-4">
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
                      {errors.fromDate && (
                        <p className="text-xs text-red-500">{errors.fromDate}</p>
                      )}
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
                      {errors.toDate && (
                        <p className="text-xs text-red-500">{errors.toDate}</p>
                      )}
                    </div>
                  </div>

                  {/* New Leaves Allocated */}
                  <div className="space-y-2">
                    <Label htmlFor="newLeavesAllocated">
                      الأيام المخصصة <span className="text-red-500">*</span>
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

                  {/* Carry Forward */}
                  <div className="flex items-center justify-between p-3 bg-purple-50 rounded-xl">
                    <div className="flex items-center gap-2">
                      <Calendar className="w-4 h-4 text-purple-600" />
                      <Label className="text-purple-700 font-medium">السماح بالترحيل</Label>
                    </div>
                    <Switch checked={carryForward} onCheckedChange={setCarryForward} />
                  </div>
                </CardContent>
              </Card>

              {/* Additional Info */}
              <Card className="border-slate-200">
                <CardHeader className="pb-4">
                  <CardTitle className="text-base flex items-center gap-2">
                    <Clock className="w-4 h-4 text-slate-600" />
                    معلومات إضافية
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    {/* Leave Period ID */}
                    <div className="space-y-2">
                      <Label htmlFor="leavePeriodId">فترة الإجازة</Label>
                      <Input
                        id="leavePeriodId"
                        value={leavePeriodId}
                        onChange={(e) => setLeavePeriodId(e.target.value)}
                        placeholder="معرف الفترة"
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
                        placeholder="معرف السياسة"
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
                      placeholder="ملاحظات عامة للتخصيص..."
                      className="rounded-xl min-h-[80px]"
                    />
                  </div>
                </CardContent>
              </Card>

              {/* Summary */}
              {selectedEmployeeIds.length > 0 && newLeavesAllocated > 0 && (
                <Alert className="bg-emerald-50 border-emerald-200">
                  <CheckCircle className="h-4 w-4 text-emerald-600" />
                  <AlertDescription className="text-emerald-700">
                    <div className="font-medium mb-2">ملخص التخصيص الجماعي:</div>
                    <div className="space-y-1 text-sm">
                      <div className="flex justify-between">
                        <span>عدد الموظفين:</span>
                        <span className="font-bold">{selectedEmployeeIds.length}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>أيام لكل موظف:</span>
                        <span className="font-bold">{newLeavesAllocated}</span>
                      </div>
                      <div className="flex justify-between border-t border-emerald-300 pt-1 mt-1">
                        <span>إجمالي الأيام:</span>
                        <span className="font-bold text-lg">
                          {selectedEmployeeIds.length * newLeavesAllocated}
                        </span>
                      </div>
                    </div>
                  </AlertDescription>
                </Alert>
              )}
            </div>
          </div>

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
              disabled={isLoading || selectedEmployeeIds.length === 0}
              className="bg-emerald-500 hover:bg-emerald-600 text-white rounded-xl"
            >
              <Save className="w-4 h-4 ms-2" />
              {isLoading
                ? 'جاري التخصيص...'
                : `تخصيص لـ ${selectedEmployeeIds.length} موظف`}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
