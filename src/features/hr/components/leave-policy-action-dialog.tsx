'use client'

import { useEffect, useState } from 'react'
import { useForm, useFieldArray } from 'react-hook-form'
import { Settings, Plus, Trash2 } from 'lucide-react'
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
import { Textarea } from '@/components/ui/textarea'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Separator } from '@/components/ui/separator'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Switch } from '@/components/ui/switch'
import { Badge } from '@/components/ui/badge'
import {
  useCreateLeavePolicy,
  useUpdateLeavePolicy,
} from '@/hooks/useLeavePolicy'
import type {
  LeavePolicy,
  CreateLeavePolicyData,
  ApplicabilityType,
  EarnedLeaveFrequency,
} from '@/services/leavePolicyService'
import { LEAVE_TYPE_LABELS, LeaveType } from '@/services/leaveService'

type LeavePolicyActionDialogProps = {
  open: boolean
  onOpenChange: (open: boolean) => void
  currentRow?: LeavePolicy
}

type PolicyFormData = {
  name: string
  nameAr: string
  description: string
  descriptionAr: string
  applicableFor: ApplicabilityType
  applicableValue: string
  isActive: boolean
  isDefault: boolean
  saudiLaborLawCompliant: boolean
  leavePolicyDetails: Array<{
    leaveType: LeaveType
    annualAllocation: number
    allowCarryForward: boolean
    maxCarryForwardDays: number
    carryForwardExpiryDays: number
    allowEncashment: boolean
    maxEncashableDays: number
    isEarnedLeave: boolean
    earnedLeaveFrequency?: EarnedLeaveFrequency
  }>
}

export function LeavePolicyActionDialog({
  open,
  onOpenChange,
  currentRow,
}: LeavePolicyActionDialogProps) {
  const isEdit = !!currentRow
  const { mutate: createPolicy, isPending: isCreating } = useCreateLeavePolicy()
  const { mutate: updatePolicy, isPending: isUpdating } = useUpdateLeavePolicy()

  const form = useForm<PolicyFormData>({
    defaultValues: {
      name: '',
      nameAr: '',
      description: '',
      descriptionAr: '',
      applicableFor: 'all',
      applicableValue: '',
      isActive: true,
      isDefault: false,
      saudiLaborLawCompliant: false,
      leavePolicyDetails: [],
    },
  })

  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: 'leavePolicyDetails',
  })

  useEffect(() => {
    if (currentRow) {
      form.reset({
        name: currentRow.name || '',
        nameAr: currentRow.nameAr || '',
        description: currentRow.description || '',
        descriptionAr: currentRow.descriptionAr || '',
        applicableFor: currentRow.applicableFor || 'all',
        applicableValue: currentRow.applicableValue || '',
        isActive: currentRow.isActive ?? true,
        isDefault: currentRow.isDefault ?? false,
        saudiLaborLawCompliant: currentRow.saudiLaborLawCompliant ?? false,
        leavePolicyDetails:
          currentRow.leavePolicyDetails.map((detail) => ({
            leaveType: detail.leaveType,
            annualAllocation: detail.annualAllocation,
            allowCarryForward: detail.allowCarryForward,
            maxCarryForwardDays: detail.maxCarryForwardDays,
            carryForwardExpiryDays: detail.carryForwardExpiryDays,
            allowEncashment: detail.allowEncashment,
            maxEncashableDays: detail.maxEncashableDays,
            isEarnedLeave: detail.isEarnedLeave,
            earnedLeaveFrequency: detail.earnedLeaveFrequency,
          })) || [],
      })
    } else {
      form.reset({
        name: '',
        nameAr: '',
        description: '',
        descriptionAr: '',
        applicableFor: 'all',
        applicableValue: '',
        isActive: true,
        isDefault: false,
        saudiLaborLawCompliant: false,
        leavePolicyDetails: [],
      })
    }
  }, [currentRow, form])

  const onSubmit = (data: PolicyFormData) => {
    const payload: CreateLeavePolicyData = {
      name: data.name,
      nameAr: data.nameAr,
      description: data.description,
      descriptionAr: data.descriptionAr,
      applicableFor: data.applicableFor,
      applicableValue: data.applicableValue || undefined,
      isActive: data.isActive,
      isDefault: data.isDefault,
      saudiLaborLawCompliant: data.saudiLaborLawCompliant,
      leavePolicyDetails: data.leavePolicyDetails.map((detail) => ({
        leaveType: detail.leaveType,
        annualAllocation: detail.annualAllocation,
        allowCarryForward: detail.allowCarryForward,
        maxCarryForwardDays: detail.maxCarryForwardDays,
        carryForwardExpiryDays: detail.carryForwardExpiryDays,
        allowEncashment: detail.allowEncashment,
        maxEncashableDays: detail.maxEncashableDays,
        isEarnedLeave: detail.isEarnedLeave,
        earnedLeaveFrequency: detail.earnedLeaveFrequency,
      })),
    }

    if (isEdit && currentRow) {
      updatePolicy(
        { policyId: currentRow._id, data: payload },
        {
          onSuccess: () => {
            onOpenChange(false)
            form.reset()
          },
        }
      )
    } else {
      createPolicy(payload, {
        onSuccess: () => {
          onOpenChange(false)
          form.reset()
        },
      })
    }
  }

  const addLeaveTypeDetail = () => {
    append({
      leaveType: 'annual',
      annualAllocation: 21,
      allowCarryForward: false,
      maxCarryForwardDays: 0,
      carryForwardExpiryDays: 0,
      allowEncashment: false,
      maxEncashableDays: 0,
      isEarnedLeave: false,
    })
  }

  // Available leave types (not yet added)
  const addedLeaveTypes = fields.map((f) => f.leaveType)
  const availableLeaveTypes = Object.keys(LEAVE_TYPE_LABELS).filter(
    (type) => !addedLeaveTypes.includes(type as LeaveType)
  ) as LeaveType[]

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[90vh] sm:max-w-4xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Settings className="h-5 w-5" />
            {isEdit ? 'تعديل سياسة الإجازة' : 'إضافة سياسة إجازة جديدة'}
          </DialogTitle>
          <DialogDescription>
            {isEdit
              ? 'قم بتحديث تفاصيل سياسة الإجازة'
              : 'قم بإنشاء سياسة إجازة جديدة مع تحديد أنواع الإجازات والتخصيصات'}
          </DialogDescription>
        </DialogHeader>

        <ScrollArea className="max-h-[60vh] pe-4">
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              {/* Basic Information */}
              <div className="space-y-4">
                <h4 className="text-sm font-medium">المعلومات الأساسية</h4>
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  <FormField
                    control={form.control}
                    name="name"
                    rules={{ required: 'الاسم بالإنجليزية مطلوب' }}
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>اسم السياسة (EN)</FormLabel>
                        <FormControl>
                          <Input placeholder="Standard Leave Policy" {...field} dir="ltr" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="nameAr"
                    rules={{ required: 'الاسم بالعربية مطلوب' }}
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>اسم السياسة (AR)</FormLabel>
                        <FormControl>
                          <Input placeholder="سياسة الإجازات القياسية" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  <FormField
                    control={form.control}
                    name="description"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>الوصف (EN)</FormLabel>
                        <FormControl>
                          <Textarea
                            placeholder="Policy description..."
                            className="min-h-[80px]"
                            {...field}
                            dir="ltr"
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="descriptionAr"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>الوصف (AR)</FormLabel>
                        <FormControl>
                          <Textarea
                            placeholder="وصف السياسة..."
                            className="min-h-[80px]"
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              </div>

              <Separator />

              {/* Applicability */}
              <div className="space-y-4">
                <h4 className="text-sm font-medium">قابلية التطبيق</h4>
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  <FormField
                    control={form.control}
                    name="applicableFor"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>نطاق التطبيق</FormLabel>
                        <Select onValueChange={field.onChange} value={field.value}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="اختر النطاق" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="all">جميع الموظفين</SelectItem>
                            <SelectItem value="department">حسب القسم</SelectItem>
                            <SelectItem value="designation">حسب المسمى الوظيفي</SelectItem>
                            <SelectItem value="grade">حسب الدرجة</SelectItem>
                            <SelectItem value="employee_type">حسب نوع الموظف</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  {form.watch('applicableFor') !== 'all' && (
                    <FormField
                      control={form.control}
                      name="applicableValue"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>القيمة</FormLabel>
                          <FormControl>
                            <Input
                              placeholder="مثال: الموارد البشرية، مدير، الدرجة أ"
                              {...field}
                            />
                          </FormControl>
                          <FormDescription>
                            أدخل القيمة المحددة للنطاق المختار
                          </FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  )}
                </div>
              </div>

              <Separator />

              {/* Settings */}
              <div className="space-y-4">
                <h4 className="text-sm font-medium">الإعدادات</h4>
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
                  <FormField
                    control={form.control}
                    name="isActive"
                    render={({ field }) => (
                      <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                        <div className="space-y-0.5">
                          <FormLabel className="text-base">نشط</FormLabel>
                          <FormDescription>تفعيل السياسة</FormDescription>
                        </div>
                        <FormControl>
                          <Switch checked={field.value} onCheckedChange={field.onChange} />
                        </FormControl>
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="isDefault"
                    render={({ field }) => (
                      <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                        <div className="space-y-0.5">
                          <FormLabel className="text-base">افتراضي</FormLabel>
                          <FormDescription>سياسة افتراضية</FormDescription>
                        </div>
                        <FormControl>
                          <Switch checked={field.value} onCheckedChange={field.onChange} />
                        </FormControl>
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="saudiLaborLawCompliant"
                    render={({ field }) => (
                      <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                        <div className="space-y-0.5">
                          <FormLabel className="text-base">متوافق</FormLabel>
                          <FormDescription>نظام العمل السعودي</FormDescription>
                        </div>
                        <FormControl>
                          <Switch checked={field.value} onCheckedChange={field.onChange} />
                        </FormControl>
                      </FormItem>
                    )}
                  />
                </div>
              </div>

              <Separator />

              {/* Leave Types Details */}
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h4 className="text-sm font-medium">أنواع الإجازات والتخصيصات</h4>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={addLeaveTypeDetail}
                    disabled={availableLeaveTypes.length === 0}
                  >
                    <Plus className="h-4 w-4 ms-2" />
                    إضافة نوع إجازة
                  </Button>
                </div>

                {fields.length === 0 && (
                  <div className="text-center p-8 border-2 border-dashed rounded-lg">
                    <p className="text-slate-500 mb-2">لم يتم إضافة أي نوع إجازة بعد</p>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={addLeaveTypeDetail}
                    >
                      <Plus className="h-4 w-4 ms-2" />
                      إضافة نوع إجازة
                    </Button>
                  </div>
                )}

                {fields.map((field, index) => (
                  <div key={field.id} className="p-4 border rounded-lg space-y-4">
                    <div className="flex items-center justify-between">
                      <Badge className="bg-emerald-100 text-emerald-700">
                        {LEAVE_TYPE_LABELS[form.watch(`leavePolicyDetails.${index}.leaveType`)]
                          ?.ar || 'نوع إجازة'}
                      </Badge>
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => remove(index)}
                      >
                        <Trash2 className="h-4 w-4 text-red-500" />
                      </Button>
                    </div>

                    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                      <FormField
                        control={form.control}
                        name={`leavePolicyDetails.${index}.leaveType`}
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>نوع الإجازة</FormLabel>
                            <Select onValueChange={field.onChange} value={field.value}>
                              <FormControl>
                                <SelectTrigger>
                                  <SelectValue placeholder="اختر نوع الإجازة" />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                {Object.entries(LEAVE_TYPE_LABELS).map(([key, value]) => (
                                  <SelectItem key={key} value={key}>
                                    {value.ar} - {value.en}
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
                        name={`leavePolicyDetails.${index}.annualAllocation`}
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>التخصيص السنوي (أيام)</FormLabel>
                            <FormControl>
                              <Input
                                type="number"
                                min="0"
                                {...field}
                                onChange={(e) => field.onChange(Number(e.target.value))}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>

                    {/* Carry Forward Settings */}
                    <div className="space-y-3">
                      <FormField
                        control={form.control}
                        name={`leavePolicyDetails.${index}.allowCarryForward`}
                        render={({ field }) => (
                          <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                            <FormControl>
                              <Switch checked={field.value} onCheckedChange={field.onChange} />
                            </FormControl>
                            <div className="space-y-1 leading-none">
                              <FormLabel>السماح بترحيل الرصيد</FormLabel>
                              <FormDescription>
                                السماح بترحيل الرصيد غير المستخدم للسنة القادمة
                              </FormDescription>
                            </div>
                          </FormItem>
                        )}
                      />

                      {form.watch(`leavePolicyDetails.${index}.allowCarryForward`) && (
                        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 ms-6">
                          <FormField
                            control={form.control}
                            name={`leavePolicyDetails.${index}.maxCarryForwardDays`}
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>الحد الأقصى للترحيل (أيام)</FormLabel>
                                <FormControl>
                                  <Input
                                    type="number"
                                    min="0"
                                    {...field}
                                    onChange={(e) => field.onChange(Number(e.target.value))}
                                  />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                          <FormField
                            control={form.control}
                            name={`leavePolicyDetails.${index}.carryForwardExpiryDays`}
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>صلاحية الترحيل (أيام)</FormLabel>
                                <FormControl>
                                  <Input
                                    type="number"
                                    min="0"
                                    {...field}
                                    onChange={(e) => field.onChange(Number(e.target.value))}
                                  />
                                </FormControl>
                                <FormDescription>0 = لا تنتهي</FormDescription>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                        </div>
                      )}
                    </div>

                    {/* Encashment Settings */}
                    <div className="space-y-3">
                      <FormField
                        control={form.control}
                        name={`leavePolicyDetails.${index}.allowEncashment`}
                        render={({ field }) => (
                          <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                            <FormControl>
                              <Switch checked={field.value} onCheckedChange={field.onChange} />
                            </FormControl>
                            <div className="space-y-1 leading-none">
                              <FormLabel>السماح بصرف الإجازة</FormLabel>
                              <FormDescription>
                                السماح بصرف الرصيد غير المستخدم نقداً
                              </FormDescription>
                            </div>
                          </FormItem>
                        )}
                      />

                      {form.watch(`leavePolicyDetails.${index}.allowEncashment`) && (
                        <div className="ms-6">
                          <FormField
                            control={form.control}
                            name={`leavePolicyDetails.${index}.maxEncashableDays`}
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>الحد الأقصى للصرف (أيام)</FormLabel>
                                <FormControl>
                                  <Input
                                    type="number"
                                    min="0"
                                    {...field}
                                    onChange={(e) => field.onChange(Number(e.target.value))}
                                  />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                        </div>
                      )}
                    </div>

                    {/* Earned Leave Settings */}
                    <div className="space-y-3">
                      <FormField
                        control={form.control}
                        name={`leavePolicyDetails.${index}.isEarnedLeave`}
                        render={({ field }) => (
                          <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                            <FormControl>
                              <Switch checked={field.value} onCheckedChange={field.onChange} />
                            </FormControl>
                            <div className="space-y-1 leading-none">
                              <FormLabel>إجازة مكتسبة</FormLabel>
                              <FormDescription>
                                يتم استحقاق الإجازة بشكل دوري بدلاً من سنوياً
                              </FormDescription>
                            </div>
                          </FormItem>
                        )}
                      />

                      {form.watch(`leavePolicyDetails.${index}.isEarnedLeave`) && (
                        <div className="ms-6">
                          <FormField
                            control={form.control}
                            name={`leavePolicyDetails.${index}.earnedLeaveFrequency`}
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>تكرار الاستحقاق</FormLabel>
                                <Select onValueChange={field.onChange} value={field.value}>
                                  <FormControl>
                                    <SelectTrigger>
                                      <SelectValue placeholder="اختر التكرار" />
                                    </SelectTrigger>
                                  </FormControl>
                                  <SelectContent>
                                    <SelectItem value="monthly">شهرياً</SelectItem>
                                    <SelectItem value="quarterly">ربع سنوي</SelectItem>
                                    <SelectItem value="yearly">سنوياً</SelectItem>
                                  </SelectContent>
                                </Select>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </form>
          </Form>
        </ScrollArea>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            إلغاء
          </Button>
          <Button onClick={form.handleSubmit(onSubmit)} disabled={isCreating || isUpdating}>
            {isCreating || isUpdating ? 'جاري الحفظ...' : isEdit ? 'تحديث' : 'إنشاء'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
