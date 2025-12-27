import { z } from 'zod'
import { useCreateVehicle, useUpdateVehicle } from '@/hooks/useVehicle'
import { toast } from 'sonner'
import { useTranslation } from 'react-i18next'
import type { Vehicle } from '@/services/vehicleService'
import {
  VEHICLE_TYPE_LABELS,
  FUEL_TYPE_LABELS,
  ASSIGNMENT_TYPE_LABELS,
  VEHICLE_STATUS_LABELS,
} from '@/services/vehicleService'
import { GenericFormDialog } from '@/components/generic-form-dialog'
import type { FormSectionConfig } from '@/components/generic-form-dialog'

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
  const { i18n } = useTranslation()
  const isRTL = i18n.language === 'ar'
  const isEdit = !!vehicle

  const createMutation = useCreateVehicle()
  const updateMutation = useUpdateVehicle()

  // Convert label objects to options arrays
  const vehicleTypeOptions = Object.entries(VEHICLE_TYPE_LABELS).map(([key, label]) => ({
    value: key,
    label: label.en,
    labelAr: label.ar,
  }))

  const fuelTypeOptions = Object.entries(FUEL_TYPE_LABELS).map(([key, label]) => ({
    value: key,
    label: label.en,
    labelAr: label.ar,
  }))

  const assignmentTypeOptions = Object.entries(ASSIGNMENT_TYPE_LABELS).map(([key, label]) => ({
    value: key,
    label: label.en,
    labelAr: label.ar,
  }))

  const statusOptions = Object.entries(VEHICLE_STATUS_LABELS).map(([key, label]) => ({
    value: key,
    label: label.en,
    labelAr: label.ar,
  }))

  // Build sections configuration
  const sections: FormSectionConfig[] = [
    // Basic Information
    {
      title: 'Basic Information',
      titleAr: 'معلومات أساسية',
      fields: [
        {
          name: 'licensePlate',
          type: 'text',
          label: 'License Plate',
          labelAr: 'رقم اللوحة',
          placeholder: 'ABC 1234',
          placeholderAr: 'أ ب ج 1234',
          required: true,
        },
        {
          name: 'vehicleType',
          type: 'select',
          label: 'Vehicle Type',
          labelAr: 'نوع المركبة',
          required: true,
          options: vehicleTypeOptions,
        },
        {
          name: 'make',
          type: 'text',
          label: 'Make',
          labelAr: 'الصنع',
          placeholder: 'Toyota',
          placeholderAr: 'تويوتا',
          required: true,
        },
        {
          name: 'model',
          type: 'text',
          label: 'Model',
          labelAr: 'الموديل',
          placeholder: 'Camry',
          placeholderAr: 'كامري',
          required: true,
        },
        {
          name: 'year',
          type: 'number',
          label: 'Year',
          labelAr: 'السنة',
          required: true,
          min: 1900,
          max: new Date().getFullYear() + 1,
        },
        {
          name: 'fuelType',
          type: 'select',
          label: 'Fuel Type',
          labelAr: 'نوع الوقود',
          required: true,
          options: fuelTypeOptions,
        },
        {
          name: 'color',
          type: 'text',
          label: 'Color (EN)',
          labelAr: 'اللون (EN)',
          placeholder: 'White',
          required: true,
        },
        {
          name: 'colorAr',
          type: 'text',
          label: 'Color (AR)',
          labelAr: 'اللون (AR)',
          placeholder: 'أبيض',
          placeholderAr: 'أبيض',
          required: true,
        },
      ],
      columns: 2,
    },
    // Registration & Insurance
    {
      title: 'Registration & Insurance',
      titleAr: 'التسجيل والتأمين',
      fields: [
        {
          name: 'registrationNumber',
          type: 'text',
          label: 'Registration Number',
          labelAr: 'رقم التسجيل',
          required: true,
        },
        {
          name: 'registrationExpiry',
          type: 'date',
          label: 'Registration Expiry',
          labelAr: 'تاريخ انتهاء التسجيل',
          required: true,
        },
        {
          name: 'insuranceNumber',
          type: 'text',
          label: 'Insurance Number',
          labelAr: 'رقم التأمين',
          required: true,
        },
        {
          name: 'insuranceExpiry',
          type: 'date',
          label: 'Insurance Expiry',
          labelAr: 'تاريخ انتهاء التأمين',
          required: true,
        },
      ],
      columns: 2,
    },
    // Assignment & Location
    {
      title: 'Assignment & Location',
      titleAr: 'الإسناد والموقع',
      fields: [
        {
          name: 'assignmentType',
          type: 'select',
          label: 'Assignment Type',
          labelAr: 'نوع الإسناد',
          required: true,
          options: assignmentTypeOptions,
        },
        {
          name: 'location',
          type: 'text',
          label: 'Location',
          labelAr: 'الموقع',
          placeholder: 'Riyadh',
          placeholderAr: 'الرياض',
          required: true,
        },
        ...(isEdit
          ? [
              {
                name: 'status' as const,
                type: 'select' as const,
                label: 'Status',
                labelAr: 'الحالة',
                options: statusOptions,
              },
            ]
          : []),
      ],
      columns: 2,
    },
    // Odometer & Value
    {
      title: 'Odometer & Value',
      titleAr: 'عداد المسافة والقيمة',
      fields: [
        {
          name: 'lastOdometerReading',
          type: 'number',
          label: 'Odometer Reading',
          labelAr: 'قراءة العداد',
          required: true,
          min: 0,
        },
        {
          name: 'odometerUnit',
          type: 'select',
          label: 'Unit',
          labelAr: 'وحدة القياس',
          required: true,
          options: [
            { value: 'km', label: 'Kilometers', labelAr: 'كيلومتر' },
            { value: 'miles', label: 'Miles', labelAr: 'ميل' },
          ],
        },
        {
          name: 'purchaseDate',
          type: 'date',
          label: 'Purchase Date',
          labelAr: 'تاريخ الشراء',
          required: true,
        },
        {
          name: 'purchaseValue',
          type: 'currency',
          label: 'Purchase Value',
          labelAr: 'قيمة الشراء',
          required: true,
          min: 0,
        },
        {
          name: 'currentValue',
          type: 'currency',
          label: 'Current Value',
          labelAr: 'القيمة الحالية',
          required: true,
          min: 0,
        },
      ],
      columns: 2,
    },
  ]

  // Add maintenance section only in edit mode
  if (isEdit) {
    sections.push({
      title: 'Maintenance',
      titleAr: 'الصيانة',
      fields: [
        {
          name: 'lastServiceDate',
          type: 'date',
          label: 'Last Service Date',
          labelAr: 'تاريخ آخر صيانة',
        },
        {
          name: 'nextServiceDue',
          type: 'date',
          label: 'Next Service Due',
          labelAr: 'تاريخ الصيانة التالية',
        },
        {
          name: 'nextServiceOdometer',
          type: 'number',
          label: 'Service at Odometer',
          labelAr: 'الصيانة عند قراءة العداد',
          min: 0,
        },
      ],
      columns: 2,
    })
  }

  // Default values from vehicle prop or initial values
  const defaultValues: Partial<VehicleFormData> = vehicle
    ? {
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
      }
    : {
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
      }

  // Handle form submission
  const handleSubmit = async (data: VehicleFormData) => {
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
    } catch (error) {
      toast.error(isRTL ? 'فشل في حفظ المركبة' : 'Failed to save vehicle')
      throw error // Re-throw to prevent dialog from closing
    }
  }

  return (
    <GenericFormDialog
      open={open}
      onOpenChange={onOpenChange}
      title={isEdit ? 'Edit Vehicle' : 'Add Vehicle'}
      titleAr={isEdit ? 'تعديل مركبة' : 'إضافة مركبة'}
      description={isEdit ? 'Update vehicle information' : 'Add a new vehicle to the fleet'}
      descriptionAr={isEdit ? 'تحديث معلومات المركبة' : 'إضافة مركبة جديدة إلى الأسطول'}
      schema={vehicleSchema}
      sections={sections}
      defaultValues={defaultValues}
      onSubmit={handleSubmit}
      isLoading={createMutation.isPending || updateMutation.isPending}
      mode={isEdit ? 'edit' : 'create'}
      submitLabel={isEdit ? 'Update' : 'Create'}
      submitLabelAr={isEdit ? 'تحديث' : 'إنشاء'}
      cancelLabel="Cancel"
      cancelLabelAr="إلغاء"
      maxWidth="3xl"
    />
  )
}
