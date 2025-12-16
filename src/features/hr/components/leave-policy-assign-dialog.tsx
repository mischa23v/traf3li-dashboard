'use client'

import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { UserCheck, AlertCircle } from 'lucide-react'
import { Button } from '@/components/ui/button'
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Separator } from '@/components/ui/separator'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Badge } from '@/components/ui/badge'
import { Checkbox } from '@/components/ui/checkbox'
import {
  useAssignPolicyToEmployee,
  useAssignPolicyBulk,
  useLeavePolicies,
  usePreviewPolicyAllocations,
} from '@/hooks/useLeavePolicy'
import type { AssignPolicyData } from '@/services/leavePolicyService'

type LeavePolicyAssignDialogProps = {
  open: boolean
  onOpenChange: (open: boolean) => void
  preSelectedEmployeeId?: string
  preSelectedEmployeeIds?: string[]
}

type AssignFormData = {
  employeeIds: string[]
  leavePolicyId: string
  leavePeriodId: string
  effectiveFrom: string
  effectiveTo: string
}

export function LeavePolicyAssignDialog({
  open,
  onOpenChange,
  preSelectedEmployeeId,
  preSelectedEmployeeIds,
}: LeavePolicyAssignDialogProps) {
  const isBulkAssignment = !!preSelectedEmployeeIds && preSelectedEmployeeIds.length > 1
  const [showPreview, setShowPreview] = useState(false)

  const { mutate: assignSingle, isPending: isAssigningSingle } = useAssignPolicyToEmployee()
  const { mutate: assignBulk, isPending: isAssigningBulk } = useAssignPolicyBulk()
  const { data: policiesData } = useLeavePolicies({ isActive: true })

  const form = useForm<AssignFormData>({
    defaultValues: {
      employeeIds: preSelectedEmployeeIds || (preSelectedEmployeeId ? [preSelectedEmployeeId] : []),
      leavePolicyId: '',
      leavePeriodId: '',
      effectiveFrom: new Date().toISOString().split('T')[0],
      effectiveTo: '',
    },
  })

  // Preview allocations (only for single assignment)
  const employeeId = form.watch('employeeIds')[0]
  const policyId = form.watch('leavePolicyId')
  const periodId = form.watch('leavePeriodId')

  const { data: previewData, isLoading: isLoadingPreview } = usePreviewPolicyAllocations(
    policyId,
    employeeId,
    periodId
  )

  const onSubmit = (data: AssignFormData) => {
    if (isBulkAssignment) {
      // Bulk assignment
      assignBulk(
        {
          employeeIds: data.employeeIds,
          leavePolicyId: data.leavePolicyId,
          leavePeriodId: data.leavePeriodId,
          effectiveFrom: data.effectiveFrom,
          effectiveTo: data.effectiveTo || undefined,
        },
        {
          onSuccess: () => {
            onOpenChange(false)
            form.reset()
          },
        }
      )
    } else {
      // Single assignment
      const payload: AssignPolicyData = {
        employeeId: data.employeeIds[0],
        leavePolicyId: data.leavePolicyId,
        leavePeriodId: data.leavePeriodId,
        effectiveFrom: data.effectiveFrom,
        effectiveTo: data.effectiveTo || undefined,
      }

      assignSingle(payload, {
        onSuccess: () => {
          onOpenChange(false)
          form.reset()
        },
      })
    }
  }

  const isPending = isAssigningSingle || isAssigningBulk

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[90vh] sm:max-w-3xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <UserCheck className="h-5 w-5" />
            {isBulkAssignment
              ? `تعيين سياسة لـ ${preSelectedEmployeeIds?.length} موظف`
              : 'تعيين سياسة إجازة للموظف'}
          </DialogTitle>
          <DialogDescription>
            {isBulkAssignment
              ? 'قم بتعيين سياسة إجازة لعدة موظفين دفعة واحدة'
              : 'قم بتعيين سياسة إجازة للموظف المحدد'}
          </DialogDescription>
        </DialogHeader>

        <ScrollArea className="max-h-[60vh] pe-4">
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              {/* Employee Selection (only if not pre-selected) */}
              {!preSelectedEmployeeId && !preSelectedEmployeeIds && (
                <div className="space-y-4">
                  <h4 className="text-sm font-medium">اختيار الموظف</h4>
                  <FormField
                    control={form.control}
                    name="employeeIds"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>الموظف / الموظفون</FormLabel>
                        <FormControl>
                          {/* TODO: Replace with actual employee multi-select component */}
                          <Input
                            placeholder="ابحث واختر الموظفين..."
                            disabled
                            value={field.value.join(', ')}
                          />
                        </FormControl>
                        <FormDescription>
                          ابحث عن الموظفين واختر واحد أو أكثر لتعيين السياسة لهم
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              )}

              {preSelectedEmployeeIds && preSelectedEmployeeIds.length > 1 && (
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <div className="flex items-start gap-2">
                    <AlertCircle className="h-5 w-5 text-blue-600 mt-0.5" />
                    <div>
                      <p className="text-sm font-medium text-blue-900">تعيين جماعي</p>
                      <p className="text-sm text-blue-700">
                        سيتم تعيين السياسة لـ {preSelectedEmployeeIds.length} موظف
                      </p>
                    </div>
                  </div>
                </div>
              )}

              <Separator />

              {/* Policy Selection */}
              <div className="space-y-4">
                <h4 className="text-sm font-medium">اختيار السياسة والفترة</h4>
                <FormField
                  control={form.control}
                  name="leavePolicyId"
                  rules={{ required: 'يجب اختيار سياسة الإجازة' }}
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>سياسة الإجازة</FormLabel>
                      <Select onValueChange={field.onChange} value={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="اختر سياسة الإجازة" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {policiesData?.data.map((policy) => (
                            <SelectItem key={policy._id} value={policy._id}>
                              <div className="flex items-center gap-2">
                                {policy.nameAr || policy.name}
                                {policy.isDefault && (
                                  <Badge className="bg-amber-100 text-amber-700">افتراضي</Badge>
                                )}
                              </div>
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="leavePeriodId"
                  rules={{ required: 'يجب اختيار فترة الإجازة' }}
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>فترة الإجازة</FormLabel>
                      <Select onValueChange={field.onChange} value={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="اختر فترة الإجازة" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {/* TODO: Load leave periods from API */}
                          <SelectItem value="2025">2025 (01 يناير 2025 - 31 ديسمبر 2025)</SelectItem>
                          <SelectItem value="2024">2024 (01 يناير 2024 - 31 ديسمبر 2024)</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormDescription>
                        اختر الفترة الزمنية التي سيتم فيها تطبيق السياسة
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <Separator />

              {/* Effective Dates */}
              <div className="space-y-4">
                <h4 className="text-sm font-medium">تواريخ السريان</h4>
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  <FormField
                    control={form.control}
                    name="effectiveFrom"
                    rules={{ required: 'تاريخ البدء مطلوب' }}
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>سريان من</FormLabel>
                        <FormControl>
                          <Input type="date" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="effectiveTo"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>سريان حتى (اختياري)</FormLabel>
                        <FormControl>
                          <Input type="date" {...field} />
                        </FormControl>
                        <FormDescription>اتركه فارغاً لتطبيق غير محدود</FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              </div>

              {/* Preview (only for single assignment) */}
              {!isBulkAssignment && employeeId && policyId && periodId && (
                <>
                  <Separator />
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <h4 className="text-sm font-medium">معاينة التخصيصات</h4>
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => setShowPreview(!showPreview)}
                      >
                        {showPreview ? 'إخفاء' : 'عرض'}
                      </Button>
                    </div>

                    {showPreview && (
                      <div className="space-y-3">
                        {isLoadingPreview && (
                          <div className="text-center p-4">
                            <p className="text-sm text-slate-500">جاري تحميل المعاينة...</p>
                          </div>
                        )}

                        {previewData && (
                          <>
                            <div className="bg-slate-50 rounded-lg p-4 space-y-3">
                              <div className="text-sm font-medium text-slate-700">
                                السياسة: {previewData.policy.nameAr}
                              </div>
                              <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                                {previewData.allocations.map((allocation) => (
                                  <div
                                    key={allocation.leaveType}
                                    className="bg-white p-3 rounded-lg border"
                                  >
                                    <div className="text-xs text-slate-600 mb-1">
                                      {allocation.leaveType}
                                    </div>
                                    <div className="font-bold text-emerald-600">
                                      {allocation.total} يوم
                                    </div>
                                    {allocation.carryForward > 0 && (
                                      <div className="text-xs text-blue-600">
                                        +{allocation.carryForward} محول
                                      </div>
                                    )}
                                  </div>
                                ))}
                              </div>
                            </div>

                            {previewData.warnings && previewData.warnings.length > 0 && (
                              <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
                                <div className="flex items-start gap-2">
                                  <AlertCircle className="h-5 w-5 text-amber-600 mt-0.5" />
                                  <div className="space-y-1">
                                    <p className="text-sm font-medium text-amber-900">
                                      تحذيرات
                                    </p>
                                    {previewData.warnings.map((warning, index) => (
                                      <p key={index} className="text-sm text-amber-700">
                                        • {warning}
                                      </p>
                                    ))}
                                  </div>
                                </div>
                              </div>
                            )}
                          </>
                        )}
                      </div>
                    )}
                  </div>
                </>
              )}
            </form>
          </Form>
        </ScrollArea>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            إلغاء
          </Button>
          <Button onClick={form.handleSubmit(onSubmit)} disabled={isPending}>
            {isPending
              ? 'جاري التعيين...'
              : isBulkAssignment
                ? `تعيين لـ ${preSelectedEmployeeIds?.length} موظف`
                : 'تعيين السياسة'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
