import { useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { useCreateVehicle, useUpdateVehicle } from '@/hooks/useVehicle'
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
import { Loader2 } from 'lucide-react'
import { toast } from 'sonner'
import { useTranslation } from 'react-i18next'
import type { Vehicle } from '@/services/vehicleService'
import {
  VEHICLE_TYPE_LABELS,
  FUEL_TYPE_LABELS,
  ASSIGNMENT_TYPE_LABELS,
  VEHICLE_STATUS_LABELS,
} from '@/services/vehicleService'

const vehicleSchema = z.object({
  licensePlate: z.string().min(1, 'رقم اللوحة مطلوب'),
  make: z.string().min(1, 'الصنع مطلوب'),
  model: z.string().min(1, 'الموديل مطلوب'),
  year: z.number().min(1900).max(new Date().getFullYear() + 1),
  color: z.string().min(1, 'اللون مطلوب'),
  colorAr: z.string().min(1, 'اللون بالعربية مطلوب'),
  vehicleType: z.enum(['sedan', 'suv', 'van', 'truck', 'motorcycle', 'bus']),
  fuelType: z.enum(['gasoline', 'diesel', 'electric', 'hybrid']),
  registrationNumber: z.string().min(1, 'رقم التسجيل مطلوب'),
  registrationExpiry: z.string().min(1, 'تاريخ انتهاء التسجيل مطلوب'),
  insuranceNumber: z.string().min(1, 'رقم التأمين مطلوب'),
  insuranceExpiry: z.string().min(1, 'تاريخ انتهاء التأمين مطلوب'),
  assignmentType: z.enum(['permanent', 'temporary', 'pool']),
  lastOdometerReading: z.number().min(0),
  odometerUnit: z.enum(['km', 'miles']),
  purchaseDate: z.string().min(1, 'تاريخ الشراء مطلوب'),
  purchaseValue: z.number().min(0),
  currentValue: z.number().min(0),
  location: z.string().min(1, 'الموقع مطلوب'),
  status: z.enum(['active', 'maintenance', 'retired', 'sold']).optional(),
  assignedTo: z.string().optional(),
  assignedToName: z.string().optional(),
  assignmentDate: z.string().optional(),
  lastServiceDate: z.string().optional(),
  nextServiceDue: z.string().optional(),
  nextServiceOdometer: z.number().optional(),
})

type VehicleFormData = z.infer<typeof vehicleSchema>

interface VehicleDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  vehicle?: Vehicle | null
}

export function VehicleDialog({ open, onOpenChange, vehicle }: VehicleDialogProps) {
  const { t, i18n } = useTranslation()
  const isRTL = i18n.language === 'ar'
  const isEdit = !!vehicle

  const createMutation = useCreateVehicle()
  const updateMutation = useUpdateVehicle()

  const form = useForm<VehicleFormData>({
    resolver: zodResolver(vehicleSchema),
    defaultValues: {
      licensePlate: '',
      make: '',
      model: '',
      year: new Date().getFullYear(),
      color: '',
      colorAr: '',
      vehicleType: 'sedan',
      fuelType: 'gasoline',
      registrationNumber: '',
      registrationExpiry: '',
      insuranceNumber: '',
      insuranceExpiry: '',
      assignmentType: 'pool',
      lastOdometerReading: 0,
      odometerUnit: 'km',
      purchaseDate: '',
      purchaseValue: 0,
      currentValue: 0,
      location: '',
      status: 'active',
    },
  })

  useEffect(() => {
    if (vehicle) {
      form.reset({
        licensePlate: vehicle.licensePlate,
        make: vehicle.make,
        model: vehicle.model,
        year: vehicle.year,
        color: vehicle.color,
        colorAr: vehicle.colorAr,
        vehicleType: vehicle.vehicleType,
        fuelType: vehicle.fuelType,
        registrationNumber: vehicle.registrationNumber,
        registrationExpiry: vehicle.registrationExpiry.split('T')[0],
        insuranceNumber: vehicle.insuranceNumber,
        insuranceExpiry: vehicle.insuranceExpiry.split('T')[0],
        assignmentType: vehicle.assignmentType,
        lastOdometerReading: vehicle.lastOdometerReading,
        odometerUnit: vehicle.odometerUnit,
        purchaseDate: vehicle.purchaseDate.split('T')[0],
        purchaseValue: vehicle.purchaseValue,
        currentValue: vehicle.currentValue,
        location: vehicle.location,
        status: vehicle.status,
        assignedTo: vehicle.assignedTo || '',
        assignedToName: vehicle.assignedToName || '',
        assignmentDate: vehicle.assignmentDate ? vehicle.assignmentDate.split('T')[0] : '',
        lastServiceDate: vehicle.lastServiceDate ? vehicle.lastServiceDate.split('T')[0] : '',
        nextServiceDue: vehicle.nextServiceDue ? vehicle.nextServiceDue.split('T')[0] : '',
        nextServiceOdometer: vehicle.nextServiceOdometer,
      })
    } else {
      form.reset({
        licensePlate: '',
        make: '',
        model: '',
        year: new Date().getFullYear(),
        color: '',
        colorAr: '',
        vehicleType: 'sedan',
        fuelType: 'gasoline',
        registrationNumber: '',
        registrationExpiry: '',
        insuranceNumber: '',
        insuranceExpiry: '',
        assignmentType: 'pool',
        lastOdometerReading: 0,
        odometerUnit: 'km',
        purchaseDate: '',
        purchaseValue: 0,
        currentValue: 0,
        location: '',
        status: 'active',
      })
    }
  }, [vehicle, form])

  const onSubmit = async (data: VehicleFormData) => {
    try {
      if (isEdit) {
        await updateMutation.mutateAsync({
          vehicleId: vehicle._id,
          data: {
            licensePlate: data.licensePlate,
            make: data.make,
            model: data.model,
            year: data.year,
            color: data.color,
            colorAr: data.colorAr,
            vehicleType: data.vehicleType,
            fuelType: data.fuelType,
            registrationNumber: data.registrationNumber,
            registrationExpiry: data.registrationExpiry,
            insuranceNumber: data.insuranceNumber,
            insuranceExpiry: data.insuranceExpiry,
            assignmentType: data.assignmentType,
            lastOdometerReading: data.lastOdometerReading,
            odometerUnit: data.odometerUnit,
            purchaseValue: data.purchaseValue,
            currentValue: data.currentValue,
            location: data.location,
            status: data.status,
            lastServiceDate: data.lastServiceDate,
            nextServiceDue: data.nextServiceDue,
            nextServiceOdometer: data.nextServiceOdometer,
          },
        })
        toast.success(isRTL ? 'تم تحديث المركبة بنجاح' : 'Vehicle updated successfully')
      } else {
        await createMutation.mutateAsync(data)
        toast.success(isRTL ? 'تم إنشاء المركبة بنجاح' : 'Vehicle created successfully')
      }
      onOpenChange(false)
    } catch (error) {
      toast.error(isRTL ? 'فشل في حفظ المركبة' : 'Failed to save vehicle')
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {isEdit
              ? isRTL ? 'تعديل مركبة' : 'Edit Vehicle'
              : isRTL ? 'إضافة مركبة' : 'Add Vehicle'}
          </DialogTitle>
          <DialogDescription>
            {isEdit
              ? isRTL ? 'تحديث معلومات المركبة' : 'Update vehicle information'
              : isRTL ? 'إضافة مركبة جديدة إلى الأسطول' : 'Add a new vehicle to the fleet'}
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            {/* Basic Information */}
            <div className="space-y-4">
              <h3 className="text-sm font-semibold">{isRTL ? 'معلومات أساسية' : 'Basic Information'}</h3>

              <div className="grid gap-4 md:grid-cols-2">
                <FormField
                  control={form.control}
                  name="licensePlate"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>{isRTL ? 'رقم اللوحة' : 'License Plate'}</FormLabel>
                      <FormControl>
                        <Input {...field} placeholder={isRTL ? 'أ ب ج 1234' : 'ABC 1234'} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="vehicleType"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>{isRTL ? 'نوع المركبة' : 'Vehicle Type'}</FormLabel>
                      <Select onValueChange={field.onChange} value={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {Object.entries(VEHICLE_TYPE_LABELS).map(([key, label]) => (
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
                  name="make"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>{isRTL ? 'الصنع' : 'Make'}</FormLabel>
                      <FormControl>
                        <Input {...field} placeholder={isRTL ? 'تويوتا' : 'Toyota'} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="model"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>{isRTL ? 'الموديل' : 'Model'}</FormLabel>
                      <FormControl>
                        <Input {...field} placeholder={isRTL ? 'كامري' : 'Camry'} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="year"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>{isRTL ? 'السنة' : 'Year'}</FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          {...field}
                          onChange={(e) => field.onChange(parseInt(e.target.value))}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="fuelType"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>{isRTL ? 'نوع الوقود' : 'Fuel Type'}</FormLabel>
                      <Select onValueChange={field.onChange} value={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {Object.entries(FUEL_TYPE_LABELS).map(([key, label]) => (
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
                  name="color"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>{isRTL ? 'اللون (EN)' : 'Color (EN)'}</FormLabel>
                      <FormControl>
                        <Input {...field} placeholder="White" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="colorAr"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>{isRTL ? 'اللون (AR)' : 'Color (AR)'}</FormLabel>
                      <FormControl>
                        <Input {...field} placeholder="أبيض" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </div>

            {/* Registration & Insurance */}
            <div className="space-y-4">
              <h3 className="text-sm font-semibold">{isRTL ? 'التسجيل والتأمين' : 'Registration & Insurance'}</h3>

              <div className="grid gap-4 md:grid-cols-2">
                <FormField
                  control={form.control}
                  name="registrationNumber"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>{isRTL ? 'رقم التسجيل' : 'Registration Number'}</FormLabel>
                      <FormControl>
                        <Input {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="registrationExpiry"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>{isRTL ? 'تاريخ انتهاء التسجيل' : 'Registration Expiry'}</FormLabel>
                      <FormControl>
                        <Input type="date" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="insuranceNumber"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>{isRTL ? 'رقم التأمين' : 'Insurance Number'}</FormLabel>
                      <FormControl>
                        <Input {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="insuranceExpiry"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>{isRTL ? 'تاريخ انتهاء التأمين' : 'Insurance Expiry'}</FormLabel>
                      <FormControl>
                        <Input type="date" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </div>

            {/* Assignment & Location */}
            <div className="space-y-4">
              <h3 className="text-sm font-semibold">{isRTL ? 'الإسناد والموقع' : 'Assignment & Location'}</h3>

              <div className="grid gap-4 md:grid-cols-2">
                <FormField
                  control={form.control}
                  name="assignmentType"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>{isRTL ? 'نوع الإسناد' : 'Assignment Type'}</FormLabel>
                      <Select onValueChange={field.onChange} value={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {Object.entries(ASSIGNMENT_TYPE_LABELS).map(([key, label]) => (
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
                  name="location"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>{isRTL ? 'الموقع' : 'Location'}</FormLabel>
                      <FormControl>
                        <Input {...field} placeholder={isRTL ? 'الرياض' : 'Riyadh'} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {isEdit && (
                  <FormField
                    control={form.control}
                    name="status"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>{isRTL ? 'الحالة' : 'Status'}</FormLabel>
                        <Select onValueChange={field.onChange} value={field.value}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {Object.entries(VEHICLE_STATUS_LABELS).map(([key, label]) => (
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
                )}
              </div>
            </div>

            {/* Odometer & Value */}
            <div className="space-y-4">
              <h3 className="text-sm font-semibold">{isRTL ? 'عداد المسافة والقيمة' : 'Odometer & Value'}</h3>

              <div className="grid gap-4 md:grid-cols-2">
                <FormField
                  control={form.control}
                  name="lastOdometerReading"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>{isRTL ? 'قراءة العداد' : 'Odometer Reading'}</FormLabel>
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
                  name="odometerUnit"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>{isRTL ? 'وحدة القياس' : 'Unit'}</FormLabel>
                      <Select onValueChange={field.onChange} value={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="km">{isRTL ? 'كيلومتر' : 'Kilometers'}</SelectItem>
                          <SelectItem value="miles">{isRTL ? 'ميل' : 'Miles'}</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="purchaseDate"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>{isRTL ? 'تاريخ الشراء' : 'Purchase Date'}</FormLabel>
                      <FormControl>
                        <Input type="date" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="purchaseValue"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>{isRTL ? 'قيمة الشراء' : 'Purchase Value'}</FormLabel>
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
                  name="currentValue"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>{isRTL ? 'القيمة الحالية' : 'Current Value'}</FormLabel>
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

            {/* Maintenance (optional, only in edit) */}
            {isEdit && (
              <div className="space-y-4">
                <h3 className="text-sm font-semibold">{isRTL ? 'الصيانة' : 'Maintenance'}</h3>

                <div className="grid gap-4 md:grid-cols-2">
                  <FormField
                    control={form.control}
                    name="lastServiceDate"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>{isRTL ? 'تاريخ آخر صيانة' : 'Last Service Date'}</FormLabel>
                        <FormControl>
                          <Input type="date" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="nextServiceDue"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>{isRTL ? 'تاريخ الصيانة التالية' : 'Next Service Due'}</FormLabel>
                        <FormControl>
                          <Input type="date" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="nextServiceOdometer"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>{isRTL ? 'الصيانة عند قراءة العداد' : 'Service at Odometer'}</FormLabel>
                        <FormControl>
                          <Input
                            type="number"
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
              </div>
            )}

            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
                {isRTL ? 'إلغاء' : 'Cancel'}
              </Button>
              <Button type="submit" disabled={createMutation.isPending || updateMutation.isPending}>
                {(createMutation.isPending || updateMutation.isPending) && (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                )}
                {isEdit ? (isRTL ? 'تحديث' : 'Update') : (isRTL ? 'إنشاء' : 'Create')}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  )
}
