import { useState } from 'react'
import { useParams, useNavigate } from '@tanstack/react-router'
import { ROUTES } from '@/constants/routes'
import {
  useVehicle,
  useVehicleLogs,
  useVehicleExpenses,
  useVehicleUtilization,
  useAssignVehicle,
  useUnassignVehicle,
} from '@/hooks/useVehicle'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import {
  ArrowLeft, MoreHorizontal, Edit, Trash2, Car, Calendar,
  MapPin, User, DollarSign, Wrench, TrendingUp, Fuel,
  AlertCircle, Loader2, Plus, FileText, Shield, CheckCircle,
  Clock, AlertTriangle
} from 'lucide-react'
import {
  VEHICLE_STATUS_LABELS,
  VEHICLE_TYPE_LABELS,
  FUEL_TYPE_LABELS,
  ASSIGNMENT_TYPE_LABELS,
  TRIP_PURPOSE_LABELS,
  SERVICE_TYPE_LABELS,
  type VehicleLog,
} from '@/services/vehicleService'
import { VehicleDialog } from '@/components/hr/vehicles/VehicleDialog'
import { VehicleLogDialog } from '@/components/hr/vehicles/VehicleLogDialog'
import { useTranslation } from 'react-i18next'
import { toast } from 'sonner'

export function VehicleDetail() {
  const { vehicleId } = useParams({ strict: false })
  const navigate = useNavigate()
  const { t, i18n } = useTranslation()
  const isRTL = i18n.language === 'ar'

  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false)
  const [isLogDialogOpen, setIsLogDialogOpen] = useState(false)
  const [activeTab, setActiveTab] = useState('overview')

  // Date range for expenses and utilization (last 30 days)
  const dateRange = {
    from: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    to: new Date().toISOString().split('T')[0],
  }

  // Queries
  const { data: vehicle, isLoading, error } = useVehicle(vehicleId!)
  const { data: logsData } = useVehicleLogs({ vehicleId, limit: 50 })
  const { data: expenses } = useVehicleExpenses(vehicleId!, dateRange)
  const { data: utilization } = useVehicleUtilization(vehicleId!, dateRange)

  // Mutations
  const assignMutation = useAssignVehicle()
  const unassignMutation = useUnassignVehicle()

  const logs = logsData?.data || []

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat(isRTL ? 'ar-SA' : 'en-US', {
      style: 'currency',
      currency: 'SAR',
    }).format(value)
  }

  const formatDate = (date: string) => {
    return new Date(date).toLocaleDateString(isRTL ? 'ar-SA' : 'en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    })
  }

  const formatDateTime = (date: string) => {
    return new Date(date).toLocaleString(isRTL ? 'ar-SA' : 'en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    })
  }

  const getColorClasses = (color: string) => {
    const colorMap: Record<string, string> = {
      blue: 'bg-blue-100 text-blue-700 border-blue-200',
      emerald: 'bg-emerald-100 text-emerald-700 border-emerald-200',
      red: 'bg-red-100 text-red-700 border-red-200',
      amber: 'bg-amber-100 text-amber-700 border-amber-200',
      purple: 'bg-purple-100 text-purple-700 border-purple-200',
      slate: 'bg-slate-100 text-slate-700 border-slate-200',
      teal: 'bg-teal-100 text-teal-700 border-teal-200',
      indigo: 'bg-indigo-100 text-indigo-700 border-indigo-200',
    }
    return colorMap[color] || 'bg-gray-100 text-gray-700 border-gray-200'
  }

  const handleUnassign = async () => {
    if (!confirm(isRTL ? 'هل أنت متأكد من إلغاء الإسناد؟' : 'Are you sure you want to unassign this vehicle?')) {
      return
    }

    try {
      await unassignMutation.mutateAsync(vehicleId!)
      toast.success(isRTL ? 'تم إلغاء الإسناد بنجاح' : 'Vehicle unassigned successfully')
    } catch (error) {
      toast.error(isRTL ? 'فشل إلغاء الإسناد' : 'Failed to unassign vehicle')
    }
  }

  if (isLoading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    )
  }

  if (error || !vehicle) {
    return (
      <div className="flex h-screen flex-col items-center justify-center gap-2">
        <AlertCircle className="h-8 w-8 text-destructive" />
        <p className="text-sm text-muted-foreground">
          {isRTL ? 'فشل تحميل المركبة' : 'Failed to load vehicle'}
        </p>
        <Button onClick={() => navigate({ to: ROUTES.dashboard.hr.vehicles.list })} variant="outline">
          <ArrowLeft className="mr-2 h-4 w-4" />
          {isRTL ? 'العودة' : 'Go Back'}
        </Button>
      </div>
    )
  }

  const isInsuranceExpiringSoon = new Date(vehicle.insuranceExpiry) < new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)
  const isRegistrationExpiringSoon = new Date(vehicle.registrationExpiry) < new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)
  const isServiceDue = vehicle.nextServiceDue && new Date(vehicle.nextServiceDue) < new Date()

  return (
    <div className="flex h-screen flex-col">
      {/* Header */}
      <div className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="flex h-16 items-center gap-4 px-6">
          <Button variant="ghost" size="icon" onClick={() => navigate({ to: ROUTES.dashboard.hr.vehicles.list })}>
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div className="flex items-center gap-3">
            <Car className="h-6 w-6 text-muted-foreground" />
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-lg font-semibold">
                  {vehicle.make} {vehicle.model}
                </h1>
                <Badge className={getColorClasses(VEHICLE_STATUS_LABELS[vehicle.status].color)}>
                  {isRTL ? VEHICLE_STATUS_LABELS[vehicle.status].ar : VEHICLE_STATUS_LABELS[vehicle.status].en}
                </Badge>
              </div>
              <p className="text-sm text-muted-foreground">{vehicle.licensePlate}</p>
            </div>
          </div>
          <div className="ml-auto flex items-center gap-2">
            <Button onClick={() => setIsLogDialogOpen(true)}>
              <Plus className="mr-2 h-4 w-4" />
              {isRTL ? 'إضافة سجل' : 'Add Log'}
            </Button>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" size="icon">
                  <MoreHorizontal className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={() => setIsEditDialogOpen(true)}>
                  <Edit className="mr-2 h-4 w-4" />
                  {isRTL ? 'تعديل' : 'Edit'}
                </DropdownMenuItem>
                {vehicle.assignedTo && (
                  <DropdownMenuItem onClick={handleUnassign}>
                    <User className="mr-2 h-4 w-4" />
                    {isRTL ? 'إلغاء الإسناد' : 'Unassign'}
                  </DropdownMenuItem>
                )}
                <DropdownMenuSeparator />
                <DropdownMenuItem className="text-destructive">
                  <Trash2 className="mr-2 h-4 w-4" />
                  {isRTL ? 'حذف' : 'Delete'}
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </div>

      {/* Alerts */}
      {(isInsuranceExpiringSoon || isRegistrationExpiringSoon || isServiceDue) && (
        <div className="border-b bg-amber-50 px-6 py-3">
          <div className="flex items-start gap-2">
            <AlertTriangle className="h-5 w-5 text-amber-600 mt-0.5" />
            <div className="space-y-1">
              <p className="text-sm font-medium text-amber-900">
                {isRTL ? 'تنبيهات' : 'Alerts'}
              </p>
              <ul className="text-sm text-amber-800 space-y-1">
                {isInsuranceExpiringSoon && (
                  <li>{isRTL ? `التأمين ينتهي في ${formatDate(vehicle.insuranceExpiry)}` : `Insurance expires on ${formatDate(vehicle.insuranceExpiry)}`}</li>
                )}
                {isRegistrationExpiringSoon && (
                  <li>{isRTL ? `التسجيل ينتهي في ${formatDate(vehicle.registrationExpiry)}` : `Registration expires on ${formatDate(vehicle.registrationExpiry)}`}</li>
                )}
                {isServiceDue && (
                  <li>{isRTL ? 'الصيانة مستحقة' : 'Service is overdue'}</li>
                )}
              </ul>
            </div>
          </div>
        </div>
      )}

      {/* Content */}
      <div className="flex-1 overflow-auto">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="h-full">
          <div className="border-b px-6">
            <TabsList className="h-12">
              <TabsTrigger value="overview">{isRTL ? 'نظرة عامة' : 'Overview'}</TabsTrigger>
              <TabsTrigger value="logs">{isRTL ? 'السجلات' : 'Logs'}</TabsTrigger>
              <TabsTrigger value="expenses">{isRTL ? 'المصروفات' : 'Expenses'}</TabsTrigger>
              <TabsTrigger value="maintenance">{isRTL ? 'الصيانة' : 'Maintenance'}</TabsTrigger>
            </TabsList>
          </div>

          <div className="p-6">
            <TabsContent value="overview" className="mt-0 space-y-6">
              <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                {/* Basic Information */}
                <Card>
                  <CardHeader>
                    <CardTitle className="text-base flex items-center gap-2">
                      <Car className="h-4 w-4" />
                      {isRTL ? 'معلومات أساسية' : 'Basic Information'}
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div>
                      <p className="text-sm text-muted-foreground">{isRTL ? 'رقم اللوحة' : 'License Plate'}</p>
                      <p className="font-medium">{vehicle.licensePlate}</p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">{isRTL ? 'الصنع والموديل' : 'Make & Model'}</p>
                      <p className="font-medium">{vehicle.make} {vehicle.model}</p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">{isRTL ? 'السنة' : 'Year'}</p>
                      <p className="font-medium">{vehicle.year}</p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">{isRTL ? 'اللون' : 'Color'}</p>
                      <p className="font-medium">{isRTL ? vehicle.colorAr : vehicle.color}</p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">{isRTL ? 'النوع' : 'Type'}</p>
                      <p className="font-medium">
                        {isRTL ? VEHICLE_TYPE_LABELS[vehicle.vehicleType].ar : VEHICLE_TYPE_LABELS[vehicle.vehicleType].en}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">{isRTL ? 'نوع الوقود' : 'Fuel Type'}</p>
                      <Badge className={getColorClasses(FUEL_TYPE_LABELS[vehicle.fuelType].color)}>
                        {isRTL ? FUEL_TYPE_LABELS[vehicle.fuelType].ar : FUEL_TYPE_LABELS[vehicle.fuelType].en}
                      </Badge>
                    </div>
                  </CardContent>
                </Card>

                {/* Assignment */}
                <Card>
                  <CardHeader>
                    <CardTitle className="text-base flex items-center gap-2">
                      <User className="h-4 w-4" />
                      {isRTL ? 'الإسناد' : 'Assignment'}
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div>
                      <p className="text-sm text-muted-foreground">{isRTL ? 'نوع الإسناد' : 'Assignment Type'}</p>
                      <Badge className={getColorClasses(ASSIGNMENT_TYPE_LABELS[vehicle.assignmentType].color)}>
                        {isRTL ? ASSIGNMENT_TYPE_LABELS[vehicle.assignmentType].ar : ASSIGNMENT_TYPE_LABELS[vehicle.assignmentType].en}
                      </Badge>
                    </div>
                    {vehicle.assignedTo ? (
                      <>
                        <div>
                          <p className="text-sm text-muted-foreground">{isRTL ? 'مُسند إلى' : 'Assigned To'}</p>
                          <p className="font-medium">{vehicle.assignedToName}</p>
                        </div>
                        <div>
                          <p className="text-sm text-muted-foreground">{isRTL ? 'تاريخ الإسناد' : 'Assignment Date'}</p>
                          <p className="font-medium">{vehicle.assignmentDate ? formatDate(vehicle.assignmentDate) : '-'}</p>
                        </div>
                      </>
                    ) : (
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <AlertCircle className="h-4 w-4" />
                        <span>{isRTL ? 'غير مُسند' : 'Not assigned'}</span>
                      </div>
                    )}
                    <div>
                      <p className="text-sm text-muted-foreground">{isRTL ? 'الموقع' : 'Location'}</p>
                      <p className="font-medium flex items-center gap-2">
                        <MapPin className="h-4 w-4" />
                        {vehicle.location}
                      </p>
                    </div>
                  </CardContent>
                </Card>

                {/* Odometer & Value */}
                <Card>
                  <CardHeader>
                    <CardTitle className="text-base flex items-center gap-2">
                      <TrendingUp className="h-4 w-4" />
                      {isRTL ? 'عداد المسافة والقيمة' : 'Odometer & Value'}
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div>
                      <p className="text-sm text-muted-foreground">{isRTL ? 'عداد المسافة' : 'Odometer'}</p>
                      <p className="text-2xl font-bold">
                        {vehicle.lastOdometerReading.toLocaleString()} {vehicle.odometerUnit}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">{isRTL ? 'قيمة الشراء' : 'Purchase Value'}</p>
                      <p className="font-medium">{formatCurrency(vehicle.purchaseValue)}</p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">{isRTL ? 'القيمة الحالية' : 'Current Value'}</p>
                      <p className="text-xl font-bold text-emerald-600">{formatCurrency(vehicle.currentValue)}</p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">{isRTL ? 'تاريخ الشراء' : 'Purchase Date'}</p>
                      <p className="font-medium">{formatDate(vehicle.purchaseDate)}</p>
                    </div>
                  </CardContent>
                </Card>

                {/* Registration */}
                <Card>
                  <CardHeader>
                    <CardTitle className="text-base flex items-center gap-2">
                      <FileText className="h-4 w-4" />
                      {isRTL ? 'التسجيل' : 'Registration'}
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div>
                      <p className="text-sm text-muted-foreground">{isRTL ? 'رقم التسجيل' : 'Registration Number'}</p>
                      <p className="font-medium">{vehicle.registrationNumber}</p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">{isRTL ? 'تاريخ الانتهاء' : 'Expiry Date'}</p>
                      <div className="flex items-center gap-2">
                        <p className="font-medium">{formatDate(vehicle.registrationExpiry)}</p>
                        {isRegistrationExpiringSoon && (
                          <Badge variant="destructive">{isRTL ? 'قريب الانتهاء' : 'Expiring Soon'}</Badge>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Insurance */}
                <Card>
                  <CardHeader>
                    <CardTitle className="text-base flex items-center gap-2">
                      <Shield className="h-4 w-4" />
                      {isRTL ? 'التأمين' : 'Insurance'}
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div>
                      <p className="text-sm text-muted-foreground">{isRTL ? 'رقم التأمين' : 'Insurance Number'}</p>
                      <p className="font-medium">{vehicle.insuranceNumber}</p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">{isRTL ? 'تاريخ الانتهاء' : 'Expiry Date'}</p>
                      <div className="flex items-center gap-2">
                        <p className="font-medium">{formatDate(vehicle.insuranceExpiry)}</p>
                        {isInsuranceExpiringSoon && (
                          <Badge variant="destructive">{isRTL ? 'قريب الانتهاء' : 'Expiring Soon'}</Badge>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Maintenance */}
                <Card>
                  <CardHeader>
                    <CardTitle className="text-base flex items-center gap-2">
                      <Wrench className="h-4 w-4" />
                      {isRTL ? 'الصيانة' : 'Maintenance'}
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div>
                      <p className="text-sm text-muted-foreground">{isRTL ? 'آخر صيانة' : 'Last Service'}</p>
                      <p className="font-medium">
                        {vehicle.lastServiceDate ? formatDate(vehicle.lastServiceDate) : isRTL ? 'لا يوجد' : 'None'}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">{isRTL ? 'الصيانة التالية' : 'Next Service'}</p>
                      <div className="flex items-center gap-2">
                        <p className="font-medium">
                          {vehicle.nextServiceDue ? formatDate(vehicle.nextServiceDue) : isRTL ? 'غير محدد' : 'Not set'}
                        </p>
                        {isServiceDue && (
                          <Badge variant="destructive">{isRTL ? 'مستحقة' : 'Due'}</Badge>
                        )}
                      </div>
                    </div>
                    {vehicle.nextServiceOdometer && (
                      <div>
                        <p className="text-sm text-muted-foreground">{isRTL ? 'الصيانة عند' : 'Service at'}</p>
                        <p className="font-medium">
                          {vehicle.nextServiceOdometer.toLocaleString()} {vehicle.odometerUnit}
                        </p>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </div>

              {/* Utilization Stats */}
              {utilization && (
                <Card>
                  <CardHeader>
                    <CardTitle>{isRTL ? 'إحصائيات الاستخدام (آخر 30 يوم)' : 'Utilization Stats (Last 30 Days)'}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid gap-4 md:grid-cols-4">
                      <div>
                        <p className="text-sm text-muted-foreground">{isRTL ? 'عدد الرحلات' : 'Total Trips'}</p>
                        <p className="text-2xl font-bold">{utilization.totalTrips}</p>
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground">{isRTL ? 'إجمالي المسافة' : 'Total Distance'}</p>
                        <p className="text-2xl font-bold">
                          {utilization.totalDistance.toLocaleString()} {vehicle.odometerUnit}
                        </p>
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground">{isRTL ? 'متوسط المسافة' : 'Avg Distance'}</p>
                        <p className="text-2xl font-bold">
                          {utilization.averageDistance.toFixed(1)} {vehicle.odometerUnit}
                        </p>
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground">{isRTL ? 'تكلفة الوقود' : 'Fuel Cost'}</p>
                        <p className="text-2xl font-bold">{formatCurrency(utilization.totalFuelCost)}</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )}
            </TabsContent>

            <TabsContent value="logs" className="mt-0">
              <div className="space-y-4">
                {logs.length === 0 ? (
                  <div className="flex h-[400px] flex-col items-center justify-center gap-2">
                    <FileText className="h-12 w-12 text-muted-foreground" />
                    <p className="text-sm text-muted-foreground">
                      {isRTL ? 'لا توجد سجلات' : 'No logs found'}
                    </p>
                    <Button onClick={() => setIsLogDialogOpen(true)} variant="outline" size="sm">
                      <Plus className="mr-2 h-4 w-4" />
                      {isRTL ? 'إضافة سجل' : 'Add Log'}
                    </Button>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {logs.map((log) => (
                      <Card key={log._id}>
                        <CardContent className="p-4">
                          <div className="flex items-start justify-between">
                            <div className="space-y-3 flex-1">
                              <div className="flex items-center gap-2">
                                <Badge className={getColorClasses(TRIP_PURPOSE_LABELS[log.purpose].color)}>
                                  {isRTL ? TRIP_PURPOSE_LABELS[log.purpose].ar : TRIP_PURPOSE_LABELS[log.purpose].en}
                                </Badge>
                                <span className="text-sm text-muted-foreground">
                                  {formatDate(log.date)}
                                </span>
                              </div>

                              <div className="grid gap-3 md:grid-cols-2">
                                <div className="flex items-center gap-2 text-sm">
                                  <User className="h-4 w-4 text-muted-foreground" />
                                  <span>{log.employeeName}</span>
                                </div>
                                {log.destination && (
                                  <div className="flex items-center gap-2 text-sm">
                                    <MapPin className="h-4 w-4 text-muted-foreground" />
                                    <span>{log.destination}</span>
                                  </div>
                                )}
                                <div className="flex items-center gap-2 text-sm">
                                  <TrendingUp className="h-4 w-4 text-muted-foreground" />
                                  <span>
                                    {log.distanceTraveled} {vehicle.odometerUnit} ({log.odometerStart} → {log.odometerEnd})
                                  </span>
                                </div>
                                {log.fuelCost && (
                                  <div className="flex items-center gap-2 text-sm">
                                    <Fuel className="h-4 w-4 text-muted-foreground" />
                                    <span>
                                      {log.fuelQty}L @ {formatCurrency(log.fuelCost)}
                                    </span>
                                  </div>
                                )}
                              </div>

                              {log.serviceDescription && (
                                <div className="text-sm">
                                  <p className="text-muted-foreground">{isRTL ? 'الوصف' : 'Description'}</p>
                                  <p>{log.serviceDescription}</p>
                                </div>
                              )}
                            </div>

                            {log.serviceCost && (
                              <div className="text-right">
                                <p className="text-sm text-muted-foreground">{isRTL ? 'التكلفة' : 'Cost'}</p>
                                <p className="text-lg font-bold">{formatCurrency(log.serviceCost)}</p>
                              </div>
                            )}
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                )}
              </div>
            </TabsContent>

            <TabsContent value="expenses" className="mt-0">
              {expenses ? (
                <div className="space-y-6">
                  <Card>
                    <CardHeader>
                      <CardTitle>{isRTL ? 'إجمالي المصروفات' : 'Total Expenses'}</CardTitle>
                      <p className="text-3xl font-bold">{formatCurrency(expenses.totalExpenses)}</p>
                    </CardHeader>
                  </Card>

                  <Card>
                    <CardHeader>
                      <CardTitle>{isRTL ? 'حسب النوع' : 'By Type'}</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-3">
                        {expenses.byType.map((item) => (
                          <div key={item.serviceType} className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                              <Badge variant="outline">
                                {isRTL ? SERVICE_TYPE_LABELS[item.serviceType].ar : SERVICE_TYPE_LABELS[item.serviceType].en}
                              </Badge>
                              <span className="text-sm text-muted-foreground">({item.count})</span>
                            </div>
                            <span className="font-semibold">{formatCurrency(item.totalCost)}</span>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                </div>
              ) : (
                <div className="flex h-[400px] items-center justify-center">
                  <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
                </div>
              )}
            </TabsContent>

            <TabsContent value="maintenance" className="mt-0">
              <div className="flex h-[400px] flex-col items-center justify-center gap-2">
                <Wrench className="h-12 w-12 text-muted-foreground" />
                <p className="text-sm text-muted-foreground">
                  {isRTL ? 'سجل الصيانة قريباً' : 'Maintenance history coming soon'}
                </p>
              </div>
            </TabsContent>
          </div>
        </Tabs>
      </div>

      {/* Dialogs */}
      <VehicleDialog
        open={isEditDialogOpen}
        onOpenChange={setIsEditDialogOpen}
        vehicle={vehicle}
      />
      <VehicleLogDialog
        open={isLogDialogOpen}
        onOpenChange={setIsLogDialogOpen}
        vehicleId={vehicleId!}
        licensePlate={vehicle.licensePlate}
      />
    </div>
  )
}
