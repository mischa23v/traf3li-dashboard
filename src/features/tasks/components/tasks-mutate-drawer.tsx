import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { ChevronDown, ChevronUp } from 'lucide-react'
import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Checkbox } from '@/components/ui/checkbox'
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from '@/components/ui/collapsible'
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
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Separator } from '@/components/ui/separator'
import {
  Sheet,
  SheetClose,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet'
import { Textarea } from '@/components/ui/textarea'
import { toast } from 'sonner'
import {
  type Task,
  type TaskFormData,
  taskFormSchema,
} from '../data/schema'

type TaskMutateDrawerProps = {
  open: boolean
  onOpenChange: (open: boolean) => void
  currentRow?: Task
}

// Task Type Options (Arabic)
const taskTypeOptions = [
  { value: 'court_hearing', label: 'جلسة محكمة' },
  { value: 'filing_deadline', label: 'موعد تقديم' },
  { value: 'appeal_deadline', label: 'موعد استئناف' },
  { value: 'document_drafting', label: 'صياغة مستندات' },
  { value: 'contract_review', label: 'مراجعة عقد' },
  { value: 'client_meeting', label: 'اجتماع عميل' },
  { value: 'client_call', label: 'مكالمة عميل' },
  { value: 'consultation', label: 'استشارة' },
  { value: 'najiz_procedure', label: 'إجراء ناجز' },
  { value: 'legal_research', label: 'بحث قانوني' },
  { value: 'enforcement_followup', label: 'متابعة تنفيذ' },
  { value: 'notarization', label: 'توثيق' },
  { value: 'billing_task', label: 'فوترة' },
  { value: 'administrative', label: 'إداري' },
  { value: 'follow_up', label: 'متابعة' },
  { value: 'other', label: 'أخرى' },
]

// Status Options (Arabic)
const statusOptions = [
  { value: 'backlog', label: 'قائمة الانتظار' },
  { value: 'todo', label: 'للتنفيذ' },
  { value: 'in_progress', label: 'قيد التنفيذ' },
  { value: 'done', label: 'مكتمل' },
  { value: 'canceled', label: 'ملغي' },
]

// Priority Options (Arabic)
const priorityOptions = [
  { value: 'none', label: 'بدون' },
  { value: 'low', label: 'منخفضة' },
  { value: 'medium', label: 'متوسطة' },
  { value: 'high', label: 'عالية' },
  { value: 'critical', label: 'حرجة' },
]

// Deadline Type Options (Arabic)
const deadlineTypeOptions = [
  { value: 'statutory', label: 'نظامي' },
  { value: 'court_ordered', label: 'بأمر المحكمة' },
  { value: 'contractual', label: 'تعاقدي' },
  { value: 'internal', label: 'داخلي' },
  { value: 'none', label: 'بدون' },
]

// Court Type Options (Arabic)
const courtTypeOptions = [
  { value: 'general_court', label: 'المحكمة العامة' },
  { value: 'criminal_court', label: 'المحكمة الجزائية' },
  { value: 'family_court', label: 'محكمة الأحوال الشخصية' },
  { value: 'commercial_court', label: 'المحكمة التجارية' },
  { value: 'labor_court', label: 'المحكمة العمالية' },
  { value: 'appeal_court', label: 'محكمة الاستئناف' },
  { value: 'supreme_court', label: 'المحكمة العليا' },
  { value: 'administrative_court', label: 'المحكمة الإدارية' },
  { value: 'enforcement_court', label: 'محكمة التنفيذ' },
]

// Billing Type Options (Arabic)
const billingTypeOptions = [
  { value: 'hourly', label: 'بالساعة' },
  { value: 'fixed_fee', label: 'مبلغ ثابت' },
  { value: 'retainer', label: 'اتفاقية شهرية' },
  { value: 'pro_bono', label: 'مجاني' },
  { value: 'not_billable', label: 'غير قابل للفوترة' },
]

// Label Options (Arabic)
const labelOptions = [
  { value: 'legal', label: 'قانوني' },
  { value: 'administrative', label: 'إداري' },
  { value: 'urgent', label: 'عاجل' },
  { value: 'documentation', label: 'توثيق' },
  { value: 'feature', label: 'ميزة' },
  { value: 'bug', label: 'خطأ' },
  { value: 'enhancement', label: 'تحسين' },
  { value: 'question', label: 'سؤال' },
]

export function TasksMutateDrawer({
  open,
  onOpenChange,
  currentRow,
}: TaskMutateDrawerProps) {
  const isUpdate = !!currentRow
  const [billingOpen, setBillingOpen] = useState(false)
  const [courtOpen, setCourtOpen] = useState(false)

  const form = useForm<TaskFormData>({
    resolver: zodResolver(taskFormSchema),
    defaultValues: currentRow
      ? {
          title: currentRow.title,
          description: currentRow.description || '',
          taskType: currentRow.taskType || 'other',
          status: currentRow.status || 'todo',
          priority: currentRow.priority || 'medium',
          label: currentRow.label,
          dueDate: currentRow.dueDate || '',
          dueTime: currentRow.dueTime || '',
          deadlineType: currentRow.deadlineType || 'internal',
          warningDaysBefore: currentRow.warningDaysBefore || 3,
          courtType: currentRow.courtType,
          courtCaseNumber: currentRow.courtCaseNumber || '',
          caseYear: currentRow.caseYear,
          billing: currentRow.billing || {
            isBillable: true,
            billingType: 'hourly',
            currency: 'SAR',
            invoiceStatus: 'not_invoiced',
          },
          estimatedMinutes: currentRow.estimatedMinutes,
          notes: currentRow.notes || '',
        }
      : {
          title: '',
          description: '',
          taskType: 'other',
          status: 'todo',
          priority: 'medium',
          dueDate: '',
          dueTime: '',
          deadlineType: 'internal',
          warningDaysBefore: 3,
          billing: {
            isBillable: true,
            billingType: 'hourly',
            currency: 'SAR',
            invoiceStatus: 'not_invoiced',
          },
          notes: '',
        },
  })

  const taskType = form.watch('taskType')
  const isBillable = form.watch('billing.isBillable')
  const billingType = form.watch('billing.billingType')

  // Show court section for court-related task types
  const showCourtSection = [
    'court_hearing',
    'filing_deadline',
    'appeal_deadline',
    'enforcement_followup',
  ].includes(taskType)

  const onSubmit = async (data: TaskFormData) => {
    try {
      // TODO: Implement API call
      toast.success(isUpdate ? 'تم تحديث المهمة بنجاح' : 'تم إنشاء المهمة بنجاح')
      onOpenChange(false)
      form.reset()
    } catch (error) {
      toast.error('حدث خطأ أثناء حفظ المهمة')
    }
  }

  return (
    <Sheet
      open={open}
      onOpenChange={(v) => {
        onOpenChange(v)
        form.reset()
      }}
    >
      <SheetContent className='flex flex-col sm:max-w-lg'>
        <SheetHeader className='text-start'>
          <SheetTitle>{isUpdate ? 'تعديل المهمة' : 'إنشاء مهمة جديدة'}</SheetTitle>
          <SheetDescription>
            {isUpdate
              ? 'قم بتعديل بيانات المهمة.'
              : 'أضف مهمة جديدة بملء البيانات التالية.'}
          </SheetDescription>
        </SheetHeader>

        <Form {...form}>
          <form
            id='tasks-form'
            onSubmit={form.handleSubmit(onSubmit)}
            className='flex-1 space-y-5 overflow-y-auto px-1 py-4'
          >
            {/* Title */}
            <FormField
              control={form.control}
              name='title'
              render={({ field }) => (
                <FormItem>
                  <FormLabel>العنوان</FormLabel>
                  <FormControl>
                    <Input {...field} placeholder='أدخل عنوان المهمة' />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Description */}
            <FormField
              control={form.control}
              name='description'
              render={({ field }) => (
                <FormItem>
                  <FormLabel>الوصف</FormLabel>
                  <FormControl>
                    <Textarea
                      {...field}
                      placeholder='أدخل وصف المهمة'
                      rows={3}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Task Type */}
            <FormField
              control={form.control}
              name='taskType'
              render={({ field }) => (
                <FormItem>
                  <FormLabel>نوع المهمة</FormLabel>
                  <Select onValueChange={field.onChange} value={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder='اختر نوع المهمة' />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {taskTypeOptions.map((option) => (
                        <SelectItem key={option.value} value={option.value}>
                          {option.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className='grid grid-cols-2 gap-4'>
              {/* Status */}
              <FormField
                control={form.control}
                name='status'
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>الحالة</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder='اختر الحالة' />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {statusOptions.map((option) => (
                          <SelectItem key={option.value} value={option.value}>
                            {option.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Priority */}
              <FormField
                control={form.control}
                name='priority'
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>الأولوية</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder='اختر الأولوية' />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {priorityOptions.map((option) => (
                          <SelectItem key={option.value} value={option.value}>
                            {option.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            {/* Label */}
            <FormField
              control={form.control}
              name='label'
              render={({ field }) => (
                <FormItem>
                  <FormLabel>التصنيف</FormLabel>
                  <FormControl>
                    <RadioGroup
                      onValueChange={field.onChange}
                      value={field.value}
                      className='flex flex-wrap gap-4'
                    >
                      {labelOptions.map((option) => (
                        <FormItem
                          key={option.value}
                          className='flex items-center gap-2'
                        >
                          <FormControl>
                            <RadioGroupItem value={option.value} />
                          </FormControl>
                          <FormLabel className='font-normal cursor-pointer'>
                            {option.label}
                          </FormLabel>
                        </FormItem>
                      ))}
                    </RadioGroup>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <Separator />

            {/* Dates */}
            <div className='grid grid-cols-2 gap-4'>
              <FormField
                control={form.control}
                name='dueDate'
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>تاريخ الاستحقاق</FormLabel>
                    <FormControl>
                      <Input type='date' {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name='dueTime'
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>الوقت</FormLabel>
                    <FormControl>
                      <Input type='time' {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            {/* Deadline Type */}
            <FormField
              control={form.control}
              name='deadlineType'
              render={({ field }) => (
                <FormItem>
                  <FormLabel>نوع الموعد النهائي</FormLabel>
                  <Select onValueChange={field.onChange} value={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder='اختر نوع الموعد' />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {deadlineTypeOptions.map((option) => (
                        <SelectItem key={option.value} value={option.value}>
                          {option.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormDescription>
                    حدد نوع الموعد النهائي لتتبع المواعيد النظامية
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Warning Days */}
            <FormField
              control={form.control}
              name='warningDaysBefore'
              render={({ field }) => (
                <FormItem>
                  <FormLabel>التنبيه قبل (أيام)</FormLabel>
                  <FormControl>
                    <Input
                      type='number'
                      min={0}
                      max={30}
                      {...field}
                      onChange={(e) => field.onChange(parseInt(e.target.value) || 0)}
                    />
                  </FormControl>
                  <FormDescription>
                    عدد الأيام قبل الموعد لإرسال تنبيه
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <Separator />

            {/* Court Section (Collapsible) */}
            {showCourtSection && (
              <Collapsible open={courtOpen} onOpenChange={setCourtOpen}>
                <CollapsibleTrigger asChild>
                  <Button
                    variant='ghost'
                    className='flex w-full justify-between p-0 hover:bg-transparent'
                  >
                    <span className='font-semibold'>معلومات المحكمة</span>
                    {courtOpen ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                  </Button>
                </CollapsibleTrigger>
                <CollapsibleContent className='space-y-4 pt-4'>
                  <FormField
                    control={form.control}
                    name='courtType'
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>نوع المحكمة</FormLabel>
                        <Select onValueChange={field.onChange} value={field.value}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder='اختر نوع المحكمة' />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {courtTypeOptions.map((option) => (
                              <SelectItem key={option.value} value={option.value}>
                                {option.label}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <div className='grid grid-cols-2 gap-4'>
                    <FormField
                      control={form.control}
                      name='courtCaseNumber'
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>رقم القضية</FormLabel>
                          <FormControl>
                            <Input {...field} placeholder='رقم القضية' />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name='caseYear'
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>السنة القضائية</FormLabel>
                          <FormControl>
                            <Input
                              type='number'
                              min={1400}
                              max={1500}
                              placeholder='1446'
                              {...field}
                              onChange={(e) =>
                                field.onChange(parseInt(e.target.value) || undefined)
                              }
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                </CollapsibleContent>
              </Collapsible>
            )}

            {/* Billing Section (Collapsible) */}
            <Collapsible open={billingOpen} onOpenChange={setBillingOpen}>
              <CollapsibleTrigger asChild>
                <Button
                  variant='ghost'
                  className='flex w-full justify-between p-0 hover:bg-transparent'
                >
                  <span className='font-semibold'>الفوترة</span>
                  {billingOpen ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                </Button>
              </CollapsibleTrigger>
              <CollapsibleContent className='space-y-4 pt-4'>
                <FormField
                  control={form.control}
                  name='billing.isBillable'
                  render={({ field }) => (
                    <FormItem className='flex items-center gap-2'>
                      <FormControl>
                        <Checkbox
                          checked={field.value}
                          onCheckedChange={field.onChange}
                        />
                      </FormControl>
                      <FormLabel className='cursor-pointer'>قابل للفوترة</FormLabel>
                    </FormItem>
                  )}
                />

                {isBillable && (
                  <>
                    <FormField
                      control={form.control}
                      name='billing.billingType'
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>نوع الفوترة</FormLabel>
                          <Select onValueChange={field.onChange} value={field.value}>
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder='اختر نوع الفوترة' />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              {billingTypeOptions.map((option) => (
                                <SelectItem key={option.value} value={option.value}>
                                  {option.label}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    {billingType === 'hourly' && (
                      <FormField
                        control={form.control}
                        name='billing.hourlyRate'
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>سعر الساعة (ريال)</FormLabel>
                            <FormControl>
                              <Input
                                type='number'
                                min={0}
                                placeholder='0'
                                {...field}
                                onChange={(e) =>
                                  field.onChange(parseFloat(e.target.value) || undefined)
                                }
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    )}

                    {billingType === 'fixed_fee' && (
                      <FormField
                        control={form.control}
                        name='billing.fixedAmount'
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>المبلغ الثابت (ريال)</FormLabel>
                            <FormControl>
                              <Input
                                type='number'
                                min={0}
                                placeholder='0'
                                {...field}
                                onChange={(e) =>
                                  field.onChange(parseFloat(e.target.value) || undefined)
                                }
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    )}
                  </>
                )}
              </CollapsibleContent>
            </Collapsible>

            <Separator />

            {/* Estimated Time */}
            <FormField
              control={form.control}
              name='estimatedMinutes'
              render={({ field }) => (
                <FormItem>
                  <FormLabel>الوقت المقدر (دقيقة)</FormLabel>
                  <FormControl>
                    <Input
                      type='number'
                      min={0}
                      placeholder='60'
                      {...field}
                      onChange={(e) =>
                        field.onChange(parseInt(e.target.value) || undefined)
                      }
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Notes */}
            <FormField
              control={form.control}
              name='notes'
              render={({ field }) => (
                <FormItem>
                  <FormLabel>ملاحظات</FormLabel>
                  <FormControl>
                    <Textarea
                      {...field}
                      placeholder='أضف ملاحظات إضافية...'
                      rows={3}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </form>
        </Form>

        <SheetFooter className='gap-2 pt-4'>
          <SheetClose asChild>
            <Button variant='outline'>إغلاق</Button>
          </SheetClose>
          <Button form='tasks-form' type='submit'>
            {isUpdate ? 'حفظ التغييرات' : 'إنشاء المهمة'}
          </Button>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  )
}
