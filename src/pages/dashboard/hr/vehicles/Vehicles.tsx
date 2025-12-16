import { useState } from 'react'
import { useNavigate } from '@tanstack/react-router'
import { useVehicles, useVehicleStats, useBulkDeleteVehicles } from '@/hooks/useVehicle'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Checkbox } from '@/components/ui/checkbox'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import {
  Search, Plus, MoreHorizontal, Eye, Edit, Trash2,
  AlertCircle, Loader2, Car, Calendar, MapPin,
  User, DollarSign, Wrench, AlertTriangle, TrendingUp,
  Package, CheckCircle, Clock, Filter
} from 'lucide-react'
import {
  VEHICLE_STATUS_LABELS,
  VEHICLE_TYPE_LABELS,
  FUEL_TYPE_LABELS,
  ASSIGNMENT_TYPE_LABELS,
  type VehicleStatus,
  type VehicleType,
  type FuelType,
  type VehicleAssignmentType,
} from '@/services/vehicleService'
import { VehicleDialog } from '@/components/hr/vehicles/VehicleDialog'
import { useTranslation } from 'react-i18next'
import { toast } from 'sonner'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog'

export function Vehicles() {
  const { t, i18n } = useTranslation()
  const navigate = useNavigate()
  const isRTL = i18n.language === 'ar'

  // Filters
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState<VehicleStatus | 'all'>('all')
  const [typeFilter, setTypeFilter] = useState<VehicleType | 'all'>('all')
  const [fuelFilter, setFuelFilter] = useState<FuelType | 'all'>('all')
  const [assignmentFilter, setAssignmentFilter] = useState<VehicleAssignmentType | 'all'>('all')
  const [locationFilter, setLocationFilter] = useState('')
  const [page, setPage] = useState(1)

  // Selected vehicles for bulk actions
  const [selectedVehicles, setSelectedVehicles] = useState<string[]>([])

  // Dialog state
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [editingVehicle, setEditingVehicle] = useState<any>(null)

  // Delete confirmation dialog
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)

  // Build filters
  const filters = {
    search: search || undefined,
    status: statusFilter !== 'all' ? statusFilter : undefined,
    vehicleType: typeFilter !== 'all' ? typeFilter : undefined,
    fuelType: fuelFilter !== 'all' ? fuelFilter : undefined,
    assignmentType: assignmentFilter !== 'all' ? assignmentFilter : undefined,
    location: locationFilter || undefined,
    page,
    limit: 20,
  }

  // Queries
  const { data: vehiclesData, isLoading, error } = useVehicles(filters)
  const { data: stats } = useVehicleStats()
  const bulkDeleteMutation = useBulkDeleteVehicles()

  const vehicles = vehiclesData?.data || []
  const pagination = vehiclesData?.pagination

  // Handlers
  const handleCreateVehicle = () => {
    setEditingVehicle(null)
    setIsDialogOpen(true)
  }

  const handleEditVehicle = (vehicle: any) => {
    setEditingVehicle(vehicle)
    setIsDialogOpen(true)
  }

  const handleViewVehicle = (vehicleId: string) => {
    navigate({ to: `/dashboard/hr/vehicles/${vehicleId}` })
  }

  const handleSelectVehicle = (vehicleId: string) => {
    setSelectedVehicles(prev =>
      prev.includes(vehicleId)
        ? prev.filter(id => id !== vehicleId)
        : [...prev, vehicleId]
    )
  }

  const handleSelectAll = () => {
    if (selectedVehicles.length === vehicles.length) {
      setSelectedVehicles([])
    } else {
      setSelectedVehicles(vehicles.map(v => v._id))
    }
  }

  const handleBulkDelete = () => {
    if (selectedVehicles.length === 0) return
    setDeleteDialogOpen(true)
  }

  const confirmBulkDelete = async () => {
    try {
      await bulkDeleteMutation.mutateAsync(selectedVehicles)
      toast.success(t('hr.vehicles.deleteSuccess', 'Vehicles deleted successfully'))
      setSelectedVehicles([])
      setDeleteDialogOpen(false)
    } catch (error) {
      toast.error(t('hr.vehicles.deleteError', 'Failed to delete vehicles'))
    }
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
    }
    return colorMap[color] || 'bg-gray-100 text-gray-700 border-gray-200'
  }

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

  return (
    <div className="flex h-screen flex-col">
      {/* Header */}
      <div className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="flex h-16 items-center gap-4 px-6">
          <div className="flex items-center gap-3">
            <Car className="h-6 w-6 text-muted-foreground" />
            <div>
              <h1 className="text-lg font-semibold">
                {t('hr.vehicles.title', 'Vehicle Management')}
              </h1>
              <p className="text-sm text-muted-foreground">
                {t('hr.vehicles.subtitle', 'Manage fleet vehicles and logs')}
              </p>
            </div>
          </div>
          <div className="ml-auto flex items-center gap-2">
            {selectedVehicles.length > 0 && (
              <Button
                variant="destructive"
                size="sm"
                onClick={handleBulkDelete}
                disabled={bulkDeleteMutation.isPending}
              >
                {bulkDeleteMutation.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                {t('hr.vehicles.deleteSelected', 'Delete ({{count}})', { count: selectedVehicles.length })}
              </Button>
            )}
            <Button onClick={handleCreateVehicle}>
              <Plus className="mr-2 h-4 w-4" />
              {t('hr.vehicles.addVehicle', 'Add Vehicle')}
            </Button>
          </div>
        </div>
      </div>

      {/* Stats Cards */}
      {stats && (
        <div className="border-b bg-muted/40 px-6 py-4">
          <div className="grid grid-cols-2 gap-4 md:grid-cols-4 lg:grid-cols-6">
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <div className="rounded-lg bg-blue-100 p-2">
                    <Car className="h-5 w-5 text-blue-600" />
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">
                      {t('hr.vehicles.stats.totalVehicles', 'Total Vehicles')}
                    </p>
                    <p className="text-2xl font-bold">{stats.totalVehicles}</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <div className="rounded-lg bg-emerald-100 p-2">
                    <CheckCircle className="h-5 w-5 text-emerald-600" />
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">
                      {t('hr.vehicles.stats.active', 'Active')}
                    </p>
                    <p className="text-2xl font-bold">{stats.activeVehicles}</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <div className="rounded-lg bg-amber-100 p-2">
                    <Wrench className="h-5 w-5 text-amber-600" />
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">
                      {t('hr.vehicles.stats.maintenance', 'Maintenance')}
                    </p>
                    <p className="text-2xl font-bold">{stats.inMaintenance}</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <div className="rounded-lg bg-purple-100 p-2">
                    <User className="h-5 w-5 text-purple-600" />
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">
                      {t('hr.vehicles.stats.assigned', 'Assigned')}
                    </p>
                    <p className="text-2xl font-bold">{stats.assignedVehicles}</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <div className="rounded-lg bg-red-100 p-2">
                    <AlertTriangle className="h-5 w-5 text-red-600" />
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">
                      {t('hr.vehicles.stats.serviceDue', 'Service Due')}
                    </p>
                    <p className="text-2xl font-bold">{stats.serviceDueThisMonth}</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <div className="rounded-lg bg-teal-100 p-2">
                    <DollarSign className="h-5 w-5 text-teal-600" />
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">
                      {t('hr.vehicles.stats.fleetValue', 'Fleet Value')}
                    </p>
                    <p className="text-lg font-bold">{formatCurrency(stats.totalFleetValue)}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      )}

      {/* Filters */}
      <div className="border-b bg-background px-6 py-4">
        <div className="flex flex-col gap-4">
          <div className="flex flex-wrap items-center gap-2">
            <div className="relative flex-1 min-w-[200px] max-w-md">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder={t('hr.vehicles.searchPlaceholder', 'Search vehicles...')}
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-9"
              />
            </div>

            <Select value={statusFilter} onValueChange={(value) => setStatusFilter(value as any)}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder={t('hr.vehicles.filters.status', 'Status')} />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">{t('hr.vehicles.filters.allStatuses', 'All Statuses')}</SelectItem>
                {Object.entries(VEHICLE_STATUS_LABELS).map(([key, label]) => (
                  <SelectItem key={key} value={key}>
                    {isRTL ? label.ar : label.en}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select value={typeFilter} onValueChange={(value) => setTypeFilter(value as any)}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder={t('hr.vehicles.filters.type', 'Type')} />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">{t('hr.vehicles.filters.allTypes', 'All Types')}</SelectItem>
                {Object.entries(VEHICLE_TYPE_LABELS).map(([key, label]) => (
                  <SelectItem key={key} value={key}>
                    {isRTL ? label.ar : label.en}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select value={fuelFilter} onValueChange={(value) => setFuelFilter(value as any)}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder={t('hr.vehicles.filters.fuelType', 'Fuel Type')} />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">{t('hr.vehicles.filters.allFuelTypes', 'All Fuel Types')}</SelectItem>
                {Object.entries(FUEL_TYPE_LABELS).map(([key, label]) => (
                  <SelectItem key={key} value={key}>
                    {isRTL ? label.ar : label.en}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select value={assignmentFilter} onValueChange={(value) => setAssignmentFilter(value as any)}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder={t('hr.vehicles.filters.assignment', 'Assignment')} />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">{t('hr.vehicles.filters.allAssignments', 'All Types')}</SelectItem>
                {Object.entries(ASSIGNMENT_TYPE_LABELS).map(([key, label]) => (
                  <SelectItem key={key} value={key}>
                    {isRTL ? label.ar : label.en}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-auto px-6 py-4">
        {isLoading ? (
          <div className="flex h-[400px] items-center justify-center">
            <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
          </div>
        ) : error ? (
          <div className="flex h-[400px] flex-col items-center justify-center gap-2">
            <AlertCircle className="h-8 w-8 text-destructive" />
            <p className="text-sm text-muted-foreground">
              {t('hr.vehicles.errorLoading', 'Failed to load vehicles')}
            </p>
          </div>
        ) : vehicles.length === 0 ? (
          <div className="flex h-[400px] flex-col items-center justify-center gap-2">
            <Package className="h-12 w-12 text-muted-foreground" />
            <p className="text-sm text-muted-foreground">
              {t('hr.vehicles.noVehicles', 'No vehicles found')}
            </p>
            <Button onClick={handleCreateVehicle} variant="outline" size="sm">
              <Plus className="mr-2 h-4 w-4" />
              {t('hr.vehicles.addVehicle', 'Add Vehicle')}
            </Button>
          </div>
        ) : (
          <div className="space-y-4">
            {/* Select All */}
            <div className="flex items-center gap-2 border-b pb-2">
              <Checkbox
                checked={selectedVehicles.length === vehicles.length && vehicles.length > 0}
                onCheckedChange={handleSelectAll}
              />
              <span className="text-sm text-muted-foreground">
                {t('hr.vehicles.selectAll', 'Select All')}
              </span>
            </div>

            {/* Vehicle Cards */}
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {vehicles.map((vehicle) => (
                <Card key={vehicle._id} className="overflow-hidden">
                  <CardContent className="p-0">
                    <div className="p-4">
                      <div className="flex items-start justify-between">
                        <div className="flex items-start gap-3">
                          <Checkbox
                            checked={selectedVehicles.includes(vehicle._id)}
                            onCheckedChange={() => handleSelectVehicle(vehicle._id)}
                          />
                          <div className="flex-1">
                            <div className="flex items-center gap-2">
                              <h3 className="font-semibold">
                                {vehicle.make} {vehicle.model}
                              </h3>
                              <Badge className={getColorClasses(VEHICLE_STATUS_LABELS[vehicle.status].color)}>
                                {isRTL ? VEHICLE_STATUS_LABELS[vehicle.status].ar : VEHICLE_STATUS_LABELS[vehicle.status].en}
                              </Badge>
                            </div>
                            <p className="text-sm text-muted-foreground">{vehicle.licensePlate}</p>
                          </div>
                        </div>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon">
                              <MoreHorizontal className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem onClick={() => handleViewVehicle(vehicle._id)}>
                              <Eye className="mr-2 h-4 w-4" />
                              {t('hr.vehicles.actions.view', 'View')}
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => handleEditVehicle(vehicle)}>
                              <Edit className="mr-2 h-4 w-4" />
                              {t('hr.vehicles.actions.edit', 'Edit')}
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem className="text-destructive">
                              <Trash2 className="mr-2 h-4 w-4" />
                              {t('hr.vehicles.actions.delete', 'Delete')}
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </div>

                      <div className="mt-4 space-y-2">
                        <div className="flex items-center gap-2 text-sm">
                          <Car className="h-4 w-4 text-muted-foreground" />
                          <span>{vehicle.year} • {isRTL ? VEHICLE_TYPE_LABELS[vehicle.vehicleType].ar : VEHICLE_TYPE_LABELS[vehicle.vehicleType].en}</span>
                        </div>
                        {vehicle.assignedToName && (
                          <div className="flex items-center gap-2 text-sm">
                            <User className="h-4 w-4 text-muted-foreground" />
                            <span>{vehicle.assignedToName}</span>
                          </div>
                        )}
                        <div className="flex items-center gap-2 text-sm">
                          <MapPin className="h-4 w-4 text-muted-foreground" />
                          <span>{vehicle.location}</span>
                        </div>
                        <div className="flex items-center gap-2 text-sm">
                          <TrendingUp className="h-4 w-4 text-muted-foreground" />
                          <span>
                            {vehicle.lastOdometerReading.toLocaleString()} {vehicle.odometerUnit}
                          </span>
                        </div>
                      </div>
                    </div>
                    <div className="border-t bg-muted/50 px-4 py-2 flex items-center justify-between">
                      <span className="text-xs text-muted-foreground">
                        {t('hr.vehicles.currentValue', 'Current Value')}
                      </span>
                      <span className="text-sm font-semibold">{formatCurrency(vehicle.currentValue)}</span>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>

            {/* Pagination */}
            {pagination && pagination.pages > 1 && (
              <div className="flex items-center justify-between border-t pt-4">
                <p className="text-sm text-muted-foreground">
                  {t('hr.vehicles.pagination.showing', 'Showing {{count}} of {{total}} vehicles', {
                    count: vehicles.length,
                    total: pagination.total
                  })}
                </p>
                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setPage(page - 1)}
                    disabled={page === 1}
                  >
                    {t('hr.vehicles.pagination.previous', 'Previous')}
                  </Button>
                  <span className="text-sm">
                    {t('hr.vehicles.pagination.pageInfo', 'Page {{current}} of {{total}}', {
                      current: page,
                      total: pagination.pages
                    })}
                  </span>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setPage(page + 1)}
                    disabled={page === pagination.pages}
                  >
                    {t('hr.vehicles.pagination.next', 'Next')}
                  </Button>
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Dialog */}
      <VehicleDialog
        open={isDialogOpen}
        onOpenChange={setIsDialogOpen}
        vehicle={editingVehicle}
      />

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>
              {t('hr.vehicles.confirmDelete.title', 'Confirm Deletion')}
            </AlertDialogTitle>
            <AlertDialogDescription>
              {t('hr.vehicles.confirmDelete.description',
                'Are you sure you want to delete {{count}} vehicle(s)? This action cannot be undone.',
                { count: selectedVehicles.length }
              )}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>
              {t('hr.vehicles.confirmDelete.cancel', 'Cancel')}
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={confirmBulkDelete}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {t('hr.vehicles.confirmDelete.confirm', 'Delete')}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
