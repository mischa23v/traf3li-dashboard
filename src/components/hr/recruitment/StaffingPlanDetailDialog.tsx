import { useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import * as z from 'zod'
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
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
  FormDescription,
} from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { useAddPlanDetail, useUpdatePlanDetail, useCurrentHeadcount } from '@/hooks/useStaffingPlan'
import type { StaffingPlanDetail } from '@/services/staffingPlanService'
import { Calendar } from '@/components/ui/calendar'
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover'
import { CalendarIcon, Info } from 'lucide-react'
import { format } from 'date-fns'
import { ar } from 'date-fns/locale'
import { cn } from '@/lib/utils'
import { Alert, AlertDescription } from '@/components/ui/alert'

const formSchema = z.object({
  departmentId: z.string().min(1, 'Department is required'),
  departmentName: z.string().min(1, 'Department name is required'),
  departmentNameAr: z.string().optional(),
  designation: z.string().min(1, 'Designation is required'),
  designationAr: z.string().optional(),
  numberOfPositions: z.coerce.number().min(1, 'Must be at least 1'),
  currentCount: z.coerce.number().min(0, 'Must be 0 or more'),
  estimatedCostPerPosition: z.coerce.number().min(0, 'Must be 0 or more'),
  expectedHireDate: z.date().optional(),
  priority: z.enum(['high', 'medium', 'low']).default('medium'),
  justification: z.string().min(1, 'Justification is required'),
  justificationAr: z.string().optional(),
})

type FormValues = z.infer<typeof formSchema>

interface StaffingPlanDetailDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  planId: string
  detail?: StaffingPlanDetail
}

export function StaffingPlanDetailDialog({
  open,
  onOpenChange,
  planId,
  detail,
}: StaffingPlanDetailDialogProps) {
  const { t, i18n } = useTranslation()
  const isArabic = i18n.language === 'ar'

  const addMutation = useAddPlanDetail()
  const updateMutation = useUpdatePlanDetail()

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      departmentId: '',
      departmentName: '',
      departmentNameAr: '',
      designation: '',
      designationAr: '',
      numberOfPositions: 1,
      currentCount: 0,
      estimatedCostPerPosition: 0,
      expectedHireDate: undefined,
      priority: 'medium',
      justification: '',
      justificationAr: '',
    },
  })

  const watchedDepartmentId = form.watch('departmentId')
  const watchedDesignation = form.watch('designation')
  const watchedNumberOfPositions = form.watch('numberOfPositions')
  const watchedCurrentCount = form.watch('currentCount')
  const watchedCostPerPosition = form.watch('estimatedCostPerPosition')

  // Calculate vacancies and total budget
  const vacancies = Math.max(0, (watchedNumberOfPositions || 0) - (watchedCurrentCount || 0))
  const totalBudget = vacancies * (watchedCostPerPosition || 0)

  // Fetch current headcount when department and designation change
  const { data: headcountData } = useCurrentHeadcount(watchedDepartmentId, watchedDesignation)

  // Reset form when detail changes
  useEffect(() => {
    if (detail) {
      form.reset({
        departmentId: detail.departmentId,
        departmentName: detail.departmentName,
        departmentNameAr: detail.departmentNameAr || '',
        designation: detail.designation,
        designationAr: detail.designationAr || '',
        numberOfPositions: detail.numberOfPositions,
        currentCount: detail.currentCount,
        estimatedCostPerPosition: detail.estimatedCostPerPosition,
        expectedHireDate: detail.expectedHireDate ? new Date(detail.expectedHireDate) : undefined,
        priority: detail.priority,
        justification: detail.justification,
        justificationAr: detail.justificationAr || '',
      })
    } else {
      form.reset({
        departmentId: '',
        departmentName: '',
        departmentNameAr: '',
        designation: '',
        designationAr: '',
        numberOfPositions: 1,
        currentCount: 0,
        estimatedCostPerPosition: 0,
        expectedHireDate: undefined,
        priority: 'medium',
        justification: '',
        justificationAr: '',
      })
    }
  }, [detail, form])

  // Update current count when headcount data is available
  useEffect(() => {
    if (headcountData && !detail) {
      form.setValue('currentCount', headcountData.currentCount || 0)
    }
  }, [headcountData, detail, form])

  const onSubmit = async (data: FormValues) => {
    try {
      const payload = {
        ...data,
        expectedHireDate: data.expectedHireDate?.toISOString(),
        vacancies, // Auto-calculated
        totalEstimatedBudget: totalBudget, // Auto-calculated
      }

      if (detail) {
        await updateMutation.mutateAsync({
          planId,
          detailId: detail.detailId,
          detail: payload,
        })
      } else {
        await addMutation.mutateAsync({
          planId,
          detail: payload as any,
        })
      }

      onOpenChange(false)
      form.reset()
    } catch (error) {
      console.error('Error saving plan detail:', error)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {detail
              ? t('hr.dialogs.staffingPlanDetail.editTitle')
              : t('hr.dialogs.staffingPlanDetail.addTitle')}
          </DialogTitle>
          <DialogDescription>
            {t('hr.dialogs.staffingPlanDetail.description')}
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            {/* Department */}
            <div className="grid gap-4 md:grid-cols-2">
              <FormField
                control={form.control}
                name="departmentId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>
                      {t('hr.dialogs.staffingPlanDetail.departmentId')} *
                    </FormLabel>
                    <FormControl>
                      <Input
                        placeholder="DEPT001"
                        {...field}
                      />
                    </FormControl>
                    <FormDescription>
                      {t('hr.dialogs.staffingPlanDetail.departmentIdDescription')}
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="departmentName"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>
                      {t('hr.dialogs.staffingPlanDetail.departmentName')} *
                    </FormLabel>
                    <FormControl>
                      <Input
                        placeholder={t('hr.dialogs.staffingPlanDetail.departmentNamePlaceholder')}
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="departmentNameAr"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>
                    {t('hr.dialogs.staffingPlanDetail.departmentNameAr')}
                  </FormLabel>
                  <FormControl>
                    <Input placeholder={t('hr.dialogs.staffingPlanDetail.departmentNamePlaceholder')} {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Designation */}
            <div className="grid gap-4 md:grid-cols-2">
              <FormField
                control={form.control}
                name="designation"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>
                      {t('hr.dialogs.staffingPlanDetail.designation')} *
                    </FormLabel>
                    <FormControl>
                      <Input
                        placeholder={t('hr.dialogs.staffingPlanDetail.designationPlaceholder')}
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="designationAr"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>
                      {t('hr.dialogs.staffingPlanDetail.designationAr')}
                    </FormLabel>
                    <FormControl>
                      <Input placeholder={t('hr.dialogs.staffingPlanDetail.designationPlaceholder')} {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            {/* Headcount */}
            <div className="grid gap-4 md:grid-cols-2">
              <FormField
                control={form.control}
                name="numberOfPositions"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>
                      {t('hr.dialogs.staffingPlanDetail.plannedPositions')} *
                    </FormLabel>
                    <FormControl>
                      <Input type="number" min="1" {...field} />
                    </FormControl>
                    <FormDescription>
                      {t('hr.dialogs.staffingPlanDetail.plannedPositionsDescription')}
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="currentCount"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>
                      {t('hr.dialogs.staffingPlanDetail.currentCount')}
                    </FormLabel>
                    <FormControl>
                      <Input type="number" min="0" {...field} />
                    </FormControl>
                    <FormDescription>
                      {t('hr.dialogs.staffingPlanDetail.currentCountDescription')}
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            {/* Vacancies Alert */}
            {vacancies > 0 && (
              <Alert>
                <Info className="h-4 w-4" />
                <AlertDescription>
                  {t('hr.dialogs.staffingPlanDetail.vacancies')}: <strong>{vacancies}</strong>{' '}
                  {t('hr.dialogs.staffingPlanDetail.vacantPositions')}
                </AlertDescription>
              </Alert>
            )}

            {/* Budget */}
            <FormField
              control={form.control}
              name="estimatedCostPerPosition"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>
                    {t('hr.dialogs.staffingPlanDetail.estimatedCostPerPosition')} *
                  </FormLabel>
                  <FormControl>
                    <Input
                      type="number"
                      min="0"
                      step="0.01"
                      placeholder="15000"
                      {...field}
                    />
                  </FormControl>
                  <FormDescription>
                    {isArabic
                      ? `إجمالي الميزانية المقدرة: ${new Intl.NumberFormat('ar-SA', {
                          style: 'currency',
                          currency: 'SAR',
                        }).format(totalBudget)}`
                      : `Total estimated budget: ${new Intl.NumberFormat('en-US', {
                          style: 'currency',
                          currency: 'SAR',
                        }).format(totalBudget)}`}
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Timeline & Priority */}
            <div className="grid gap-4 md:grid-cols-2">
              <FormField
                control={form.control}
                name="expectedHireDate"
                render={({ field }) => (
                  <FormItem className="flex flex-col">
                    <FormLabel>
                      {t('hr.dialogs.staffingPlanDetail.expectedHireDate')}
                    </FormLabel>
                    <Popover>
                      <PopoverTrigger asChild>
                        <FormControl>
                          <Button
                            variant="outline"
                            className={cn(
                              'w-full pl-3 text-left font-normal',
                              !field.value && 'text-muted-foreground'
                            )}
                          >
                            {field.value ? (
                              format(field.value, 'PPP', {
                                locale: isArabic ? ar : undefined,
                              })
                            ) : (
                              <span>{t('hr.dialogs.staffingPlanDetail.pickDate')}</span>
                            )}
                            <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                          </Button>
                        </FormControl>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0" align="start">
                        <Calendar
                          mode="single"
                          selected={field.value}
                          onSelect={field.onChange}
                          initialFocus
                        />
                      </PopoverContent>
                    </Popover>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="priority"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t('hr.dialogs.staffingPlanDetail.priority')} *</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="high">
                          {t('hr.dialogs.staffingPlanDetail.priorityHigh')}
                        </SelectItem>
                        <SelectItem value="medium">
                          {t('hr.dialogs.staffingPlanDetail.priorityMedium')}
                        </SelectItem>
                        <SelectItem value="low">
                          {t('hr.dialogs.staffingPlanDetail.priorityLow')}
                        </SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            {/* Justification */}
            <div className="grid gap-4 md:grid-cols-2">
              <FormField
                control={form.control}
                name="justification"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>
                      {t('hr.dialogs.staffingPlanDetail.justification')} *
                    </FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder={t('hr.dialogs.staffingPlanDetail.justificationPlaceholder')}
                        rows={4}
                        {...field}
                      />
                    </FormControl>
                    <FormDescription>
                      {t('hr.dialogs.staffingPlanDetail.justificationDescription')}
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="justificationAr"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>
                      {t('hr.dialogs.staffingPlanDetail.justificationAr')}
                    </FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder={t('hr.dialogs.staffingPlanDetail.justificationArPlaceholder')}
                        rows={4}
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => onOpenChange(false)}
              >
                {t('hr.dialogs.staffingPlanDetail.cancel')}
              </Button>
              <Button
                type="submit"
                disabled={addMutation.isPending || updateMutation.isPending}
              >
                {addMutation.isPending || updateMutation.isPending
                  ? t('hr.dialogs.staffingPlanDetail.saving')
                  : detail
                  ? t('hr.dialogs.staffingPlanDetail.update')
                  : t('hr.dialogs.staffingPlanDetail.add')}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  )
}
