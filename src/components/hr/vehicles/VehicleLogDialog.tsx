import { useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { useCreateVehicleLog } from '@/hooks/useVehicle'
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
import { Checkbox } from '@/components/ui/checkbox'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Loader2 } from 'lucide-react'
import { toast } from 'sonner'
import { useTranslation } from 'react-i18next'
import {
  TRIP_PURPOSE_LABELS,
  SERVICE_TYPE_LABELS,
} from '@/services/vehicleService'

const vehicleLogSchema = z.object({
  employeeId: z.string().min(1, 'معرف الموظف مطلوب'),
  employeeName: z.string().min(1, 'اسم الموظف مطلوب'),
  date: z.string().min(1, 'التاريخ مطلوب'),
  startTime: z.string().optional(),
  endTime: z.string().optional(),
  odometerStart: z.number().min(0, 'قراءة العداد عند البداية مطلوبة'),
  odometerEnd: z.number().min(0, 'قراءة العداد عند النهاية مطلوبة'),
  purpose: z.enum(['business', 'personal', 'commute', 'client_visit', 'court', 'other']),
  destination: z.string().optional(),
  fuelQty: z.number().optional(),
  fuelPrice: z.number().optional(),
  serviceType: z.enum(['fuel', 'service', 'repair', 'insurance', 'registration', 'toll', 'parking', 'other']).optional(),
  serviceCost: z.number().optional(),
  serviceDescription: z.string().optional(),
  invoiceNumber: z.string().optional(),
  invoiceAttachment: z.string().optional(),
  isReimbursable: z.boolean().default(false),
}).refine((data) => {
  return data.odometerEnd > data.odometerStart
}, {
  message: 'قراءة العداد عند النهاية يجب أن تكون أكبر من البداية',
  path: ['odometerEnd'],
})

type VehicleLogFormData = z.infer<typeof vehicleLogSchema>

interface VehicleLogDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  vehicleId: string
  licensePlate: string
}

export function VehicleLogDialog({ open, onOpenChange, vehicleId, licensePlate }: VehicleLogDialogProps) {
  const { t, i18n } = useTranslation()
  const isRTL = i18n.language === 'ar'

  const createMutation = useCreateVehicleLog()

  const form = useForm<VehicleLogFormData>({
    resolver: zodResolver(vehicleLogSchema),
    defaultValues: {
      employeeId: '',
      employeeName: '',
      date: new Date().toISOString().split('T')[0],
      startTime: '',
      endTime: '',
      odometerStart: 0,
      odometerEnd: 0,
      purpose: 'business',
      destination: '',
      fuelQty: undefined,
      fuelPrice: undefined,
      serviceType: undefined,
      serviceCost: undefined,
      serviceDescription: '',
      invoiceNumber: '',
      invoiceAttachment: '',
      isReimbursable: false,
    },
  })

  // Watch values for conditional rendering
  const purpose = form.watch('purpose')
  const fuelQty = form.watch('fuelQty')
  const fuelPrice = form.watch('fuelPrice')

  useEffect(() => {
    if (!open) {
      form.reset({
        employeeId: '',
        employeeName: '',
        date: new Date().toISOString().split('T')[0],
        startTime: '',
        endTime: '',
        odometerStart: 0,
        odometerEnd: 0,
        purpose: 'business',
        destination: '',
        fuelQty: undefined,
        fuelPrice: undefined,
        serviceType: undefined,
        serviceCost: undefined,
        serviceDescription: '',
        invoiceNumber: '',
        invoiceAttachment: '',
        isReimbursable: false,
      })
    }
  }, [open, form])

  const onSubmit = async (data: VehicleLogFormData) => {
    try {
      await createMutation.mutateAsync({
        vehicleId,
        employeeId: data.employeeId,
        employeeName: data.employeeName,
        date: data.date,
        startTime: data.startTime,
        endTime: data.endTime,
        odometerStart: data.odometerStart,
        odometerEnd: data.odometerEnd,
        purpose: data.purpose,
        destination: data.destination,
        fuelQty: data.fuelQty,
        fuelPrice: data.fuelPrice,
        serviceType: data.serviceType,
        serviceCost: data.serviceCost,
        serviceDescription: data.serviceDescription,
        invoiceNumber: data.invoiceNumber,
        invoiceAttachment: data.invoiceAttachment,
        isReimbursable: data.isReimbursable,
      })
      toast.success(isRTL ? 'تم إنشاء السجل بنجاح' : 'Log created successfully')
      onOpenChange(false)
    } catch (error) {
      toast.error(isRTL ? 'فشل في إنشاء السجل' : 'Failed to create log')
    }
  }

  // Calculate fuel cost
  const fuelCost = fuelQty && fuelPrice ? fuelQty * fuelPrice : 0

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{isRTL ? 'إضافة سجل مركبة' : 'Add Vehicle Log'}</DialogTitle>
          <DialogDescription>
            {isRTL ? `إضافة سجل جديد للمركبة ${licensePlate}` : `Add a new log for vehicle ${licensePlate}`}
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            {/* Employee & Date */}
            <div className="space-y-4">
              <h3 className="text-sm font-semibold">{isRTL ? 'الموظف والتاريخ' : 'Employee & Date'}</h3>

              <div className="grid gap-4 md:grid-cols-2">
                <FormField
                  control={form.control}
                  name="employeeId"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>{isRTL ? 'معرف الموظف' : 'Employee ID'}</FormLabel>
                      <FormControl>
                        <Input {...field} placeholder="EMP001" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="employeeName"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>{isRTL ? 'اسم الموظف' : 'Employee Name'}</FormLabel>
                      <FormControl>
                        <Input {...field} placeholder={isRTL ? 'أحمد محمد' : 'Ahmad Mohammed'} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="date"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>{isRTL ? 'التاريخ' : 'Date'}</FormLabel>
                      <FormControl>
                        <Input type="date" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="purpose"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>{isRTL ? 'الغرض' : 'Purpose'}</FormLabel>
                      <Select onValueChange={field.onChange} value={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {Object.entries(TRIP_PURPOSE_LABELS).map(([key, label]) => (
                            <SelectItem key={key} value={key}>
                              {isRTL ? label.ar : label.en}
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
                  name="startTime"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>{isRTL ? 'وقت البداية (اختياري)' : 'Start Time (optional)'}</FormLabel>
                      <FormControl>
                        <Input type="time" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="endTime"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>{isRTL ? 'وقت النهاية (اختياري)' : 'End Time (optional)'}</FormLabel>
                      <FormControl>
                        <Input type="time" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <FormField
                control={form.control}
                name="destination"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{isRTL ? 'الوجهة (اختياري)' : 'Destination (optional)'}</FormLabel>
                    <FormControl>
                      <Input {...field} placeholder={isRTL ? 'جدة' : 'Jeddah'} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            {/* Odometer */}
            <div className="space-y-4">
              <h3 className="text-sm font-semibold">{isRTL ? 'عداد المسافة' : 'Odometer'}</h3>

              <div className="grid gap-4 md:grid-cols-2">
                <FormField
                  control={form.control}
                  name="odometerStart"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>{isRTL ? 'قراءة العداد عند البداية' : 'Odometer Start'}</FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          {...field}
                          onChange={(e) => field.onChange(parseFloat(e.target.value))}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="odometerEnd"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>{isRTL ? 'قراءة العداد عند النهاية' : 'Odometer End'}</FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          {...field}
                          onChange={(e) => field.onChange(parseFloat(e.target.value))}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </div>

            {/* Fuel */}
            <div className="space-y-4">
              <h3 className="text-sm font-semibold">{isRTL ? 'الوقود (اختياري)' : 'Fuel (optional)'}</h3>

              <div className="grid gap-4 md:grid-cols-3">
                <FormField
                  control={form.control}
                  name="fuelQty"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>{isRTL ? 'الكمية (لتر)' : 'Quantity (L)'}</FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          step="0.01"
                          {...field}
                          onChange={(e) => field.onChange(parseFloat(e.target.value) || undefined)}
                          value={field.value || ''}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="fuelPrice"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>{isRTL ? 'السعر/لتر' : 'Price/L'}</FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          step="0.01"
                          {...field}
                          onChange={(e) => field.onChange(parseFloat(e.target.value) || undefined)}
                          value={field.value || ''}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <div className="flex items-end">
                  <div className="w-full">
                    <FormLabel>{isRTL ? 'التكلفة الإجمالية' : 'Total Cost'}</FormLabel>
                    <div className="flex h-10 w-full rounded-md border border-input bg-muted px-3 py-2 text-sm">
                      {fuelCost.toFixed(2)} {isRTL ? 'ريال' : 'SAR'}
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Service/Expense */}
            <div className="space-y-4">
              <h3 className="text-sm font-semibold">{isRTL ? 'الخدمة/المصروف (اختياري)' : 'Service/Expense (optional)'}</h3>

              <div className="grid gap-4 md:grid-cols-2">
                <FormField
                  control={form.control}
                  name="serviceType"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>{isRTL ? 'نوع الخدمة' : 'Service Type'}</FormLabel>
                      <Select onValueChange={field.onChange} value={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder={isRTL ? 'اختر النوع' : 'Select type'} />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {Object.entries(SERVICE_TYPE_LABELS).map(([key, label]) => (
                            <SelectItem key={key} value={key}>
                              {isRTL ? label.ar : label.en}
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
                  name="serviceCost"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>{isRTL ? 'التكلفة' : 'Cost'}</FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          step="0.01"
                          {...field}
                          onChange={(e) => field.onChange(parseFloat(e.target.value) || undefined)}
                          value={field.value || ''}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <FormField
                control={form.control}
                name="serviceDescription"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{isRTL ? 'الوصف' : 'Description'}</FormLabel>
                    <FormControl>
                      <Textarea
                        {...field}
                        placeholder={isRTL ? 'وصف الخدمة أو المصروف' : 'Service or expense description'}
                        rows={3}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="invoiceNumber"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{isRTL ? 'رقم الفاتورة' : 'Invoice Number'}</FormLabel>
                    <FormControl>
                      <Input {...field} placeholder="INV-001" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            {/* Reimbursement */}
            <FormField
              control={form.control}
              name="isReimbursable"
              render={({ field }) => (
                <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4">
                  <FormControl>
                    <Checkbox
                      checked={field.value}
                      onCheckedChange={field.onChange}
                    />
                  </FormControl>
                  <div className="space-y-1 leading-none">
                    <FormLabel>
                      {isRTL ? 'قابل للتعويض' : 'Reimbursable'}
                    </FormLabel>
                    <FormDescription>
                      {isRTL
                        ? 'حدد هذا الخيار إذا كان هذا المصروف قابل للتعويض من قبل الشركة'
                        : 'Check this if this expense is reimbursable by the company'}
                    </FormDescription>
                  </div>
                </FormItem>
              )}
            />

            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
                {isRTL ? 'إلغاء' : 'Cancel'}
              </Button>
              <Button type="submit" disabled={createMutation.isPending}>
                {createMutation.isPending && (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                )}
                {isRTL ? 'إنشاء' : 'Create'}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  )
}
