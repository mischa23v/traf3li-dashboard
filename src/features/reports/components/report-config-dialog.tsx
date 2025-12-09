import { useEffect, useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { CalendarIcon } from 'lucide-react'
import { format } from 'date-fns'
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
import { Checkbox } from '@/components/ui/checkbox'
import { Calendar } from '@/components/ui/calendar'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { useTranslation } from 'react-i18next'
import { useCreateSavedReport, useUpdateSavedReport } from '@/hooks/useReports'
import {
  reportTypes,
  periodOptions,
  formatOptions,
  chartTypeOptions,
  reportColumns,
  quickDateRanges,
} from '../data/data'
import type { SavedReport, ReportType } from '../data/schema'
import { cn } from '@/lib/utils'

const reportConfigSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  description: z.string().optional(),
  type: z.string().min(1, 'Report type is required'),
  period: z.string().min(1, 'Period is required'),
  startDate: z.date().optional(),
  endDate: z.date().optional(),
  format: z.string().min(1, 'Format is required'),
  chartType: z.string().optional(),
  columns: z.array(z.string()).min(1, 'Select at least one column'),
  groupBy: z.array(z.string()).optional(),
  sortBy: z.string().optional(),
  sortOrder: z.enum(['asc', 'desc']).optional(),
  isScheduled: z.boolean().default(false),
  scheduleFrequency: z.enum(['daily', 'weekly', 'monthly']).optional(),
  recipients: z.array(z.string()).optional(),
})

type ReportConfigFormValues = z.infer<typeof reportConfigSchema>

interface ReportConfigDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  currentReport: SavedReport | null
  onSuccess?: () => void
}

export function ReportConfigDialog({
  open,
  onOpenChange,
  currentReport,
  onSuccess,
}: ReportConfigDialogProps) {
  const { t, i18n } = useTranslation()
  const isRTL = i18n.language === 'ar'
  const [selectedType, setSelectedType] = useState<ReportType>('revenue')
  const createMutation = useCreateSavedReport()
  const updateMutation = useUpdateSavedReport()

  const form = useForm<ReportConfigFormValues>({
    resolver: zodResolver(reportConfigSchema) as any,
    defaultValues: {
      name: '',
      description: '',
      type: 'revenue',
      period: 'monthly',
      format: 'table',
      chartType: 'bar',
      columns: [],
      groupBy: [],
      isScheduled: false,
      recipients: [],
    },
  })

  const watchedPeriod = form.watch('period')
  const watchedFormat = form.watch('format')
  const watchedIsScheduled = form.watch('isScheduled')

  useEffect(() => {
    if (currentReport) {
      form.reset({
        name: currentReport.name,
        description: currentReport.description || '',
        type: currentReport.type,
        period: currentReport.config.period,
        startDate: currentReport.config.startDate ? new Date(currentReport.config.startDate) : undefined,
        endDate: currentReport.config.endDate ? new Date(currentReport.config.endDate) : undefined,
        format: currentReport.config.format,
        chartType: currentReport.config.chartType,
        columns: currentReport.config.columns || [],
        groupBy: currentReport.config.groupBy || [],
        sortBy: currentReport.config.sortBy,
        sortOrder: currentReport.config.sortOrder,
        isScheduled: currentReport.config.isScheduled,
        scheduleFrequency: currentReport.config.scheduleFrequency,
        recipients: currentReport.config.recipients || [],
      })
      setSelectedType(currentReport.type)
    } else {
      form.reset({
        name: '',
        description: '',
        type: 'revenue',
        period: 'monthly',
        format: 'table',
        chartType: 'bar',
        columns: [],
        groupBy: [],
        isScheduled: false,
        recipients: [],
      })
      setSelectedType('revenue')
    }
  }, [currentReport, form])

  const handleTypeChange = (type: ReportType) => {
    setSelectedType(type)
    form.setValue('type', type)
    form.setValue('columns', [])
  }

  const availableColumns = reportColumns[selectedType] || []

  const onSubmit = async (data: ReportConfigFormValues) => {
    const reportData = {
      name: data.name,
      description: data.description,
      type: data.type as ReportType,
      config: {
        _id: currentReport?.config._id || '',
        name: data.name,
        type: data.type as ReportType,
        period: data.period as 'daily' | 'weekly' | 'monthly' | 'quarterly' | 'yearly' | 'custom',
        startDate: data.startDate?.toISOString(),
        endDate: data.endDate?.toISOString(),
        format: data.format as 'table' | 'chart' | 'summary' | 'detailed',
        chartType: data.chartType as 'bar' | 'line' | 'pie' | 'area' | 'donut' | undefined,
        columns: data.columns,
        groupBy: data.groupBy,
        sortBy: data.sortBy,
        sortOrder: data.sortOrder,
        isScheduled: data.isScheduled,
        scheduleFrequency: data.scheduleFrequency,
        recipients: data.recipients,
        filters: {},
        createdBy: '',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      },
      createdBy: '',
    }

    try {
      if (currentReport) {
        await updateMutation.mutateAsync({
          id: currentReport._id,
          data: reportData,
        })
      } else {
        await createMutation.mutateAsync(reportData)
      }
      onSuccess?.()
      onOpenChange(false)
    } catch {
      // Error handled by mutation
    }
  }

  const isLoading = createMutation.isPending || updateMutation.isPending

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {currentReport
              ? t('reports.editReport')
              : t('reports.createReport')}
          </DialogTitle>
          <DialogDescription>
            {currentReport
              ? t('reports.editReportDescription')
              : t('reports.createReportDescription')}
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <Tabs defaultValue="general" className="w-full">
              <TabsList className="grid w-full grid-cols-4">
                <TabsTrigger value="general">{t('reports.general')}</TabsTrigger>
                <TabsTrigger value="columns">{t('reports.columns')}</TabsTrigger>
                <TabsTrigger value="display">{t('reports.display')}</TabsTrigger>
                <TabsTrigger value="schedule">{t('reports.schedule')}</TabsTrigger>
              </TabsList>

              <TabsContent value="general" className="space-y-4 mt-4">
                <FormField
                  control={form.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>{t('reports.reportName')}</FormLabel>
                      <FormControl>
                        <Input {...field} placeholder={t('reports.reportNamePlaceholder')} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="description"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>{t('reports.description')}</FormLabel>
                      <FormControl>
                        <Textarea {...field} placeholder={t('reports.descriptionPlaceholder')} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="type"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>{t('reports.reportType')}</FormLabel>
                      <Select
                        value={field.value}
                        onValueChange={(value) => handleTypeChange(value as ReportType)}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder={t('reports.selectReportType')} />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {reportTypes.map((type) => (
                            <SelectItem key={type.value} value={type.value}>
                              {isRTL ? type.labelAr : type.label}
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
                  name="period"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>{t('reports.period')}</FormLabel>
                      <Select value={field.value} onValueChange={field.onChange}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder={t('reports.selectPeriod')} />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {periodOptions.map((period) => (
                            <SelectItem key={period.value} value={period.value}>
                              {isRTL ? period.labelAr : period.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {watchedPeriod === 'custom' && (
                  <div className="grid grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="startDate"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>{t('reports.startDate')}</FormLabel>
                          <Popover>
                            <PopoverTrigger asChild>
                              <FormControl>
                                <Button
                                  variant="outline"
                                  className={cn(
                                    'w-full justify-start text-start font-normal',
                                    !field.value && 'text-muted-foreground'
                                  )}
                                >
                                  <CalendarIcon className="me-2 h-4 w-4" />
                                  {field.value
                                    ? format(field.value, 'PPP')
                                    : t('reports.selectDate')}
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
                      name="endDate"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>{t('reports.endDate')}</FormLabel>
                          <Popover>
                            <PopoverTrigger asChild>
                              <FormControl>
                                <Button
                                  variant="outline"
                                  className={cn(
                                    'w-full justify-start text-start font-normal',
                                    !field.value && 'text-muted-foreground'
                                  )}
                                >
                                  <CalendarIcon className="me-2 h-4 w-4" />
                                  {field.value
                                    ? format(field.value, 'PPP')
                                    : t('reports.selectDate')}
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
                  </div>
                )}

                {/* Quick date range presets */}
                {watchedPeriod === 'custom' && (
                  <div className="flex flex-wrap gap-2">
                    {quickDateRanges.slice(0, 6).map((range) => (
                      <Button
                        key={range.value}
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          const { start, end } = range.getRange()
                          form.setValue('startDate', start)
                          form.setValue('endDate', end)
                        }}
                      >
                        {isRTL ? range.labelAr : range.label}
                      </Button>
                    ))}
                  </div>
                )}
              </TabsContent>

              <TabsContent value="columns" className="space-y-4 mt-4">
                <FormField
                  control={form.control}
                  name="columns"
                  render={() => (
                    <FormItem>
                      <FormLabel>{t('reports.selectColumns')}</FormLabel>
                      <div className="grid grid-cols-2 gap-4 mt-2">
                        {availableColumns.map((column) => (
                          <FormField
                            key={column.key}
                            control={form.control}
                            name="columns"
                            render={({ field }) => (
                              <FormItem className="flex items-center gap-2 rtl:gap-reverse">
                                <FormControl>
                                  <Checkbox
                                    checked={field.value?.includes(column.key)}
                                    onCheckedChange={(checked) => {
                                      const current = field.value || []
                                      if (checked) {
                                        field.onChange([...current, column.key])
                                      } else {
                                        field.onChange(
                                          current.filter((v) => v !== column.key)
                                        )
                                      }
                                    }}
                                  />
                                </FormControl>
                                <FormLabel className="font-normal cursor-pointer">
                                  {isRTL ? column.labelAr : column.label}
                                </FormLabel>
                              </FormItem>
                            )}
                          />
                        ))}
                      </div>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <div className="flex gap-2">
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() =>
                      form.setValue(
                        'columns',
                        availableColumns.map((c) => c.key)
                      )
                    }
                  >
                    {t('reports.selectAll')}
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => form.setValue('columns', [])}
                  >
                    {t('reports.clearAll')}
                  </Button>
                </div>

                <FormField
                  control={form.control}
                  name="groupBy"
                  render={() => (
                    <FormItem>
                      <FormLabel>{t('reports.groupBy')}</FormLabel>
                      <div className="flex flex-wrap gap-2 mt-2">
                        {availableColumns.slice(0, 5).map((column) => (
                          <FormField
                            key={column.key}
                            control={form.control}
                            name="groupBy"
                            render={({ field }) => (
                              <Button
                                type="button"
                                variant={
                                  field.value?.includes(column.key)
                                    ? 'default'
                                    : 'outline'
                                }
                                size="sm"
                                onClick={() => {
                                  const current = field.value || []
                                  if (current.includes(column.key)) {
                                    field.onChange(
                                      current.filter((v) => v !== column.key)
                                    )
                                  } else {
                                    field.onChange([...current, column.key])
                                  }
                                }}
                              >
                                {isRTL ? column.labelAr : column.label}
                              </Button>
                            )}
                          />
                        ))}
                      </div>
                    </FormItem>
                  )}
                />

                <div className="grid grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="sortBy"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>{t('reports.sortBy')}</FormLabel>
                        <Select value={field.value || ''} onValueChange={field.onChange}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder={t('reports.selectSortColumn')} />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {availableColumns.map((column) => (
                              <SelectItem key={column.key} value={column.key}>
                                {isRTL ? column.labelAr : column.label}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="sortOrder"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>{t('reports.sortOrder')}</FormLabel>
                        <Select value={field.value || 'asc'} onValueChange={field.onChange}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="asc">{t('reports.ascending')}</SelectItem>
                            <SelectItem value="desc">{t('reports.descending')}</SelectItem>
                          </SelectContent>
                        </Select>
                      </FormItem>
                    )}
                  />
                </div>
              </TabsContent>

              <TabsContent value="display" className="space-y-4 mt-4">
                <FormField
                  control={form.control}
                  name="format"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>{t('reports.displayFormat')}</FormLabel>
                      <Select value={field.value} onValueChange={field.onChange}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder={t('reports.selectFormat')} />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {formatOptions.map((format) => (
                            <SelectItem key={format.value} value={format.value}>
                              {isRTL ? format.labelAr : format.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {watchedFormat === 'chart' && (
                  <FormField
                    control={form.control}
                    name="chartType"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>{t('reports.chartType')}</FormLabel>
                        <Select value={field.value || 'bar'} onValueChange={field.onChange}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder={t('reports.selectChartType')} />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {chartTypeOptions.map((chart) => (
                              <SelectItem key={chart.value} value={chart.value}>
                                {isRTL ? chart.labelAr : chart.label}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                )}
              </TabsContent>

              <TabsContent value="schedule" className="space-y-4 mt-4">
                <FormField
                  control={form.control}
                  name="isScheduled"
                  render={({ field }) => (
                    <FormItem className="flex items-center gap-2 rtl:gap-reverse">
                      <FormControl>
                        <Checkbox
                          checked={field.value}
                          onCheckedChange={field.onChange}
                        />
                      </FormControl>
                      <FormLabel className="font-normal cursor-pointer">
                        {t('reports.enableScheduling')}
                      </FormLabel>
                    </FormItem>
                  )}
                />

                {watchedIsScheduled && (
                  <>
                    <FormField
                      control={form.control}
                      name="scheduleFrequency"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>{t('reports.frequency')}</FormLabel>
                          <Select
                            value={field.value || 'weekly'}
                            onValueChange={field.onChange}
                          >
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              <SelectItem value="daily">{t('reports.daily')}</SelectItem>
                              <SelectItem value="weekly">{t('reports.weekly')}</SelectItem>
                              <SelectItem value="monthly">{t('reports.monthly')}</SelectItem>
                            </SelectContent>
                          </Select>
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="recipients"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>{t('reports.recipients')}</FormLabel>
                          <FormControl>
                            <Input
                              placeholder={t('reports.recipientsPlaceholder')}
                              value={field.value?.join(', ') || ''}
                              onChange={(e) =>
                                field.onChange(
                                  e.target.value.split(',').map((s) => s.trim())
                                )
                              }
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </>
                )}
              </TabsContent>
            </Tabs>

            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => onOpenChange(false)}
              >
                {t('common.cancel')}
              </Button>
              <Button type="submit" disabled={isLoading}>
                {isLoading
                  ? t('common.saving')
                  : currentReport
                    ? t('common.update')
                    : t('common.create')}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  )
}
