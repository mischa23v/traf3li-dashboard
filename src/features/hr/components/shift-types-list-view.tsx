import { HRSidebar } from './hr-sidebar'
import { useState, useMemo } from 'react'
import { Main } from '@/components/layout/main'
import { LanguageSwitcher } from '@/components/language-switcher'
import { ThemeSwitch } from '@/components/theme-switch'
import { ConfigDrawer } from '@/components/config-drawer'
import { ProfileDropdown } from '@/components/profile-dropdown'
import { Checkbox } from '@/components/ui/checkbox'
import { ProductivityHero } from '@/components/productivity-hero'
import {
  useShiftTypes,
  useDeleteShiftType,
  useBulkDeleteShiftTypes,
  useSetAsDefaultShift,
  useActivateShiftType,
  useDeactivateShiftType,
  useCloneShiftType,
  useCreateShiftType,
  useUpdateShiftType,
  useShiftTypeStats,
} from '@/hooks/useShiftType'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import { Header } from '@/components/layout/header'
import { TopNav } from '@/components/layout/top-nav'
import { DynamicIsland } from '@/components/dynamic-island'
import {
  Search,
  Bell,
  AlertCircle,
  Plus,
  MoreHorizontal,
  Eye,
  Trash2,
  Edit3,
  Filter,
  X,
  Clock,
  Sun,
  Moon,
  Calendar,
  CheckCircle2,
  XCircle,
  Copy,
  Star,
  TrendingUp,
} from 'lucide-react'
import { format } from 'date-fns'
import { arSA } from 'date-fns/locale'
import { Input } from '@/components/ui/input'
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
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import * as z from 'zod'
import { Switch } from '@/components/ui/switch'
import { Label } from '@/components/ui/label'
import type { ShiftType, CreateShiftTypeData, DayOfWeek } from '@/services/shiftTypeService'
import { DAY_OF_WEEK_LABELS, BREAK_TYPE_LABELS } from '@/services/shiftTypeService'

// Form validation schema
const shiftTypeFormSchema = z.object({
  name: z.string().min(1, 'اسم الوردية مطلوب'),
  nameAr: z.string().min(1, 'الاسم بالعربية مطلوب'),
  startTime: z.string().regex(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/, 'صيغة الوقت غير صحيحة'),
  endTime: z.string().regex(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/, 'صيغة الوقت غير صحيحة'),
  enableAutoAttendance: z.boolean().default(true),
  processAttendanceAfter: z.number().min(0).default(60),
  beginCheckInBeforeShiftStart: z.number().min(0).default(15),
  allowCheckOutAfterShiftEnd: z.number().min(0).default(30),
  lateEntryGracePeriod: z.number().min(0).default(5),
  earlyExitGracePeriod: z.number().min(0).default(5),
  workingHoursThresholdForHalfDay: z.number().min(0).default(4),
  workingHoursThresholdForAbsent: z.number().min(0).default(2),
  breakDuration: z.number().min(0).default(60),
  breakType: z.enum(['paid', 'unpaid']).default('paid'),
  breakStartTime: z.string().optional(),
  breakEndTime: z.string().optional(),
  allowOvertime: z.boolean().default(false),
  maxOvertimeHours: z.number().min(0).default(2),
  overtimeMultiplier: z.number().min(1).default(1.5),
  isRamadanShift: z.boolean().default(false),
  ramadanStartTime: z.string().optional(),
  ramadanEndTime: z.string().optional(),
  applicableDays: z.array(z.string()).default(['sunday', 'monday', 'tuesday', 'wednesday', 'thursday']),
  isActive: z.boolean().default(true),
  isDefault: z.boolean().default(false),
})

type ShiftTypeFormValues = z.infer<typeof shiftTypeFormSchema>

export function ShiftTypesListView() {
  const [isSelectionMode, setIsSelectionMode] = useState(false)
  const [selectedIds, setSelectedIds] = useState<string[]>([])
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [editingShiftType, setEditingShiftType] = useState<ShiftType | null>(null)

  // Filter states
  const [searchQuery, setSearchQuery] = useState('')
  const [activeFilter, setActiveFilter] = useState<string>('all')
  const [ramadanFilter, setRamadanFilter] = useState<string>('all')
  const [sortBy, setSortBy] = useState<string>('name')

  // Mutations
  const deleteShiftTypeMutation = useDeleteShiftType()
  const bulkDeleteMutation = useBulkDeleteShiftTypes()
  const setDefaultMutation = useSetAsDefaultShift()
  const activateMutation = useActivateShiftType()
  const deactivateMutation = useDeactivateShiftType()
  const cloneMutation = useCloneShiftType()
  const createMutation = useCreateShiftType()
  const updateMutation = useUpdateShiftType()

  // API Filters
  const filters = useMemo(() => {
    const f: any = {}

    // Active filter
    if (activeFilter === 'active') f.isActive = true
    if (activeFilter === 'inactive') f.isActive = false

    // Ramadan filter
    if (ramadanFilter === 'ramadan') f.isRamadanShift = true
    if (ramadanFilter === 'regular') f.isRamadanShift = false

    // Search
    if (searchQuery.trim()) {
      f.search = searchQuery.trim()
    }

    return f
  }, [activeFilter, ramadanFilter, searchQuery])

  // Check if any filter is active
  const hasActiveFilters = searchQuery || activeFilter !== 'all' || ramadanFilter !== 'all'

  // Clear all filters
  const clearFilters = () => {
    setSearchQuery('')
    setActiveFilter('all')
    setRamadanFilter('all')
  }

  // Fetch shift types
  const { data: shiftTypesData, isLoading, isError, error, refetch } = useShiftTypes(filters)
  const { data: stats } = useShiftTypeStats()

  // Form
  const form = useForm<ShiftTypeFormValues>({
    resolver: zodResolver(shiftTypeFormSchema),
    defaultValues: {
      name: '',
      nameAr: '',
      startTime: '08:00',
      endTime: '17:00',
      enableAutoAttendance: true,
      processAttendanceAfter: 60,
      beginCheckInBeforeShiftStart: 15,
      allowCheckOutAfterShiftEnd: 30,
      lateEntryGracePeriod: 5,
      earlyExitGracePeriod: 5,
      workingHoursThresholdForHalfDay: 4,
      workingHoursThresholdForAbsent: 2,
      breakDuration: 60,
      breakType: 'paid',
      allowOvertime: false,
      maxOvertimeHours: 2,
      overtimeMultiplier: 1.5,
      isRamadanShift: false,
      applicableDays: ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday'],
      isActive: true,
      isDefault: false,
    },
  })

  // Helper function to format dates
  const formatDualDate = (dateString: string | Date | null | undefined) => {
    if (!dateString) return { arabic: 'غير محدد', english: 'Not set' }
    const date = new Date(dateString)
    return {
      arabic: format(date, 'd MMMM yyyy', { locale: arSA }),
      english: format(date, 'MMM d, yyyy'),
    }
  }

  // Helper function to format time
  const formatTime = (time: string) => {
    return time
  }

  // Helper function to calculate shift duration
  const calculateShiftDuration = (startTime: string, endTime: string, breakDuration: number) => {
    const [startHour, startMin] = startTime.split(':').map(Number)
    const [endHour, endMin] = endTime.split(':').map(Number)

    let totalMinutes = (endHour * 60 + endMin) - (startHour * 60 + startMin)

    // Handle overnight shifts
    if (totalMinutes < 0) {
      totalMinutes += 24 * 60
    }

    // Subtract break
    totalMinutes -= breakDuration

    const hours = Math.floor(totalMinutes / 60)
    const minutes = totalMinutes % 60

    return { hours, minutes, total: totalMinutes }
  }

  // Toggle selection
  const toggleSelection = (id: string) => {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
    )
  }

  // Toggle all selection
  const toggleAllSelection = () => {
    if (selectedIds.length === shiftTypesData?.data.length) {
      setSelectedIds([])
    } else {
      setSelectedIds(shiftTypesData?.data.map((st) => st._id) || [])
    }
  }

  // Handle delete
  const handleDelete = async (id: string) => {
    if (confirm('هل أنت متأكد من حذف نوع الوردية هذا؟')) {
      await deleteShiftTypeMutation.mutateAsync(id)
    }
  }

  // Handle bulk delete
  const handleBulkDelete = async () => {
    if (confirm(`هل أنت متأكد من حذف ${selectedIds.length} نوع وردية؟`)) {
      await bulkDeleteMutation.mutateAsync(selectedIds)
      setSelectedIds([])
      setIsSelectionMode(false)
    }
  }

  // Handle set default
  const handleSetDefault = async (id: string) => {
    await setDefaultMutation.mutateAsync(id)
  }

  // Handle activate/deactivate
  const handleToggleActive = async (id: string, isActive: boolean) => {
    if (isActive) {
      await deactivateMutation.mutateAsync(id)
    } else {
      await activateMutation.mutateAsync(id)
    }
  }

  // Handle clone
  const handleClone = async (id: string) => {
    await cloneMutation.mutateAsync({ shiftTypeId: id })
  }

  // Handle create/edit dialog
  const openCreateDialog = () => {
    setEditingShiftType(null)
    form.reset()
    setIsDialogOpen(true)
  }

  const openEditDialog = (shiftType: ShiftType) => {
    setEditingShiftType(shiftType)
    form.reset({
      name: shiftType.name,
      nameAr: shiftType.nameAr,
      startTime: shiftType.startTime,
      endTime: shiftType.endTime,
      enableAutoAttendance: shiftType.enableAutoAttendance,
      processAttendanceAfter: shiftType.processAttendanceAfter,
      beginCheckInBeforeShiftStart: shiftType.beginCheckInBeforeShiftStart,
      allowCheckOutAfterShiftEnd: shiftType.allowCheckOutAfterShiftEnd,
      lateEntryGracePeriod: shiftType.lateEntryGracePeriod,
      earlyExitGracePeriod: shiftType.earlyExitGracePeriod,
      workingHoursThresholdForHalfDay: shiftType.workingHoursThresholdForHalfDay,
      workingHoursThresholdForAbsent: shiftType.workingHoursThresholdForAbsent,
      breakDuration: shiftType.breakDuration,
      breakType: shiftType.breakType,
      breakStartTime: shiftType.breakStartTime,
      breakEndTime: shiftType.breakEndTime,
      allowOvertime: shiftType.allowOvertime,
      maxOvertimeHours: shiftType.maxOvertimeHours,
      overtimeMultiplier: shiftType.overtimeMultiplier,
      isRamadanShift: shiftType.isRamadanShift,
      ramadanStartTime: shiftType.ramadanStartTime,
      ramadanEndTime: shiftType.ramadanEndTime,
      applicableDays: shiftType.applicableDays,
      isActive: shiftType.isActive,
      isDefault: shiftType.isDefault,
    })
    setIsDialogOpen(true)
  }

  // Handle form submit
  const onSubmit = async (values: ShiftTypeFormValues) => {
    try {
      if (editingShiftType) {
        await updateMutation.mutateAsync({
          shiftTypeId: editingShiftType._id,
          data: values as CreateShiftTypeData,
        })
      } else {
        await createMutation.mutateAsync(values as CreateShiftTypeData)
      }
      setIsDialogOpen(false)
      form.reset()
    } catch (error) {
      // Error is already handled in mutation
    }
  }

  return (
    <div className="flex min-h-screen w-full flex-col bg-muted/40 dark:bg-background rtl:font-cairo">
      <HRSidebar />
      <div className="flex flex-col sm:gap-4 sm:py-4 sm:ltr:pl-14 sm:rtl:pr-14">
        <Header className="sticky top-0 z-30 flex h-14 items-center gap-4 border-b bg-background px-4 sm:static sm:h-auto sm:border-0 sm:bg-transparent sm:px-6">
          <DynamicIsland />
          <TopNav />
          <div className="relative ms-auto flex-1 md:grow-0">
            <Search className="text-muted-foreground absolute start-2.5 top-2.5 h-4 w-4" />
            <Input
              type="search"
              placeholder="بحث في أنواع الورديات..."
              className="w-full rounded-lg bg-background ltr:pl-8 rtl:pr-8 md:w-[200px] lg:w-[336px]"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          <LanguageSwitcher />
          <ThemeSwitch />
          <ConfigDrawer />
          <Button variant="ghost" size="icon" className="relative rounded-full">
            <Bell className="h-5 w-5" />
            <span className="absolute -top-1 -end-1 flex h-4 w-4 items-center justify-center rounded-full bg-red-600 text-[10px] text-white">
              3
            </span>
          </Button>
          <ProfileDropdown />
        </Header>

        <Main className="grid flex-1 items-start gap-4 p-4 sm:px-6 sm:py-0 md:gap-8">
          <ProductivityHero />

          {/* Stats Cards */}
          {stats && (
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
              <div className="rounded-lg border bg-card p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-muted-foreground text-sm font-medium">مجموع الورديات</p>
                    <p className="text-2xl font-bold">{stats.totalShifts}</p>
                  </div>
                  <Clock className="text-muted-foreground h-8 w-8" />
                </div>
              </div>
              <div className="rounded-lg border bg-card p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-muted-foreground text-sm font-medium">الورديات النشطة</p>
                    <p className="text-2xl font-bold">{stats.activeShifts}</p>
                  </div>
                  <CheckCircle2 className="h-8 w-8 text-green-600" />
                </div>
              </div>
              <div className="rounded-lg border bg-card p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-muted-foreground text-sm font-medium">ورديات رمضان</p>
                    <p className="text-2xl font-bold">{stats.ramadanShifts}</p>
                  </div>
                  <Moon className="h-8 w-8 text-purple-600" />
                </div>
              </div>
              <div className="rounded-lg border bg-card p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-muted-foreground text-sm font-medium">متوسط ساعات الوردية</p>
                    <p className="text-2xl font-bold">{stats.averageShiftDuration.toFixed(1)}h</p>
                  </div>
                  <TrendingUp className="text-muted-foreground h-8 w-8" />
                </div>
              </div>
            </div>
          )}

          {/* Filters Bar */}
          <div className="flex flex-col gap-4 rounded-lg border bg-card p-4 md:flex-row md:items-center md:justify-between">
            <div className="flex flex-1 flex-wrap items-center gap-2">
              <Select value={activeFilter} onValueChange={setActiveFilter}>
                <SelectTrigger className="w-[140px]">
                  <SelectValue placeholder="الحالة" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">جميع الحالات</SelectItem>
                  <SelectItem value="active">نشط</SelectItem>
                  <SelectItem value="inactive">غير نشط</SelectItem>
                </SelectContent>
              </Select>

              <Select value={ramadanFilter} onValueChange={setRamadanFilter}>
                <SelectTrigger className="w-[140px]">
                  <SelectValue placeholder="النوع" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">جميع الأنواع</SelectItem>
                  <SelectItem value="regular">عادية</SelectItem>
                  <SelectItem value="ramadan">رمضان</SelectItem>
                </SelectContent>
              </Select>

              {hasActiveFilters && (
                <Button variant="ghost" size="sm" onClick={clearFilters}>
                  <X className="h-4 w-4 ltr:mr-2 rtl:ml-2" />
                  مسح الفلاتر
                </Button>
              )}
            </div>

            <div className="flex items-center gap-2">
              {isSelectionMode && selectedIds.length > 0 && (
                <Button variant="destructive" size="sm" onClick={handleBulkDelete}>
                  <Trash2 className="h-4 w-4 ltr:mr-2 rtl:ml-2" />
                  حذف المحدد ({selectedIds.length})
                </Button>
              )}

              <Button
                variant={isSelectionMode ? 'secondary' : 'outline'}
                size="sm"
                onClick={() => {
                  setIsSelectionMode(!isSelectionMode)
                  setSelectedIds([])
                }}
              >
                {isSelectionMode ? 'إلغاء التحديد' : 'تحديد متعدد'}
              </Button>

              <Button size="sm" onClick={openCreateDialog}>
                <Plus className="h-4 w-4 ltr:mr-2 rtl:ml-2" />
                إضافة وردية جديدة
              </Button>
            </div>
          </div>

          {/* Shift Types List */}
          <div className="rounded-lg border bg-card">
            {isLoading ? (
              <div className="p-4 space-y-4">
                {[1, 2, 3].map((i) => (
                  <Skeleton key={i} className="h-24 w-full" />
                ))}
              </div>
            ) : isError ? (
              <div className="flex flex-col items-center justify-center p-8">
                <AlertCircle className="text-muted-foreground h-12 w-12" />
                <p className="text-muted-foreground mt-4">حدث خطأ في تحميل أنواع الورديات</p>
                <Button variant="outline" size="sm" className="mt-4" onClick={() => refetch()}>
                  إعادة المحاولة
                </Button>
              </div>
            ) : !shiftTypesData?.data.length ? (
              <div className="flex flex-col items-center justify-center p-8">
                <Clock className="text-muted-foreground h-12 w-12" />
                <p className="text-muted-foreground mt-4">لا توجد أنواع ورديات</p>
                <Button variant="outline" size="sm" className="mt-4" onClick={openCreateDialog}>
                  <Plus className="h-4 w-4 ltr:mr-2 rtl:ml-2" />
                  إضافة وردية جديدة
                </Button>
              </div>
            ) : (
              <div className="divide-y">
                {/* Header */}
                {isSelectionMode && (
                  <div className="flex items-center gap-4 p-4 bg-muted/50">
                    <Checkbox
                      checked={selectedIds.length === shiftTypesData.data.length}
                      onCheckedChange={toggleAllSelection}
                    />
                    <span className="text-sm font-medium">
                      {selectedIds.length === 0
                        ? 'تحديد الكل'
                        : `تم تحديد ${selectedIds.length} من ${shiftTypesData.data.length}`}
                    </span>
                  </div>
                )}

                {/* Shift Types */}
                {shiftTypesData.data.map((shiftType) => {
                  const duration = calculateShiftDuration(
                    shiftType.startTime,
                    shiftType.endTime,
                    shiftType.breakDuration
                  )

                  return (
                    <div
                      key={shiftType._id}
                      className="flex items-start gap-4 p-4 transition-colors hover:bg-muted/50"
                    >
                      {isSelectionMode && (
                        <Checkbox
                          checked={selectedIds.includes(shiftType._id)}
                          onCheckedChange={() => toggleSelection(shiftType._id)}
                        />
                      )}

                      <div className="flex-1 space-y-2">
                        <div className="flex items-start justify-between">
                          <div className="space-y-1">
                            <div className="flex items-center gap-2">
                              <h3 className="font-semibold">{shiftType.name}</h3>
                              <span className="text-muted-foreground text-sm">
                                {shiftType.nameAr}
                              </span>
                              {shiftType.isDefault && (
                                <Badge variant="secondary" className="gap-1">
                                  <Star className="h-3 w-3" />
                                  افتراضي
                                </Badge>
                              )}
                              {shiftType.isRamadanShift && (
                                <Badge variant="secondary" className="gap-1 bg-purple-100 text-purple-700">
                                  <Moon className="h-3 w-3" />
                                  رمضان
                                </Badge>
                              )}
                            </div>
                            <div className="flex items-center gap-4 text-sm text-muted-foreground">
                              <span className="flex items-center gap-1">
                                <Sun className="h-4 w-4" />
                                {formatTime(shiftType.startTime)} - {formatTime(shiftType.endTime)}
                              </span>
                              <span>({duration.hours}h {duration.minutes}m)</span>
                              <span className="flex items-center gap-1">
                                <Calendar className="h-4 w-4" />
                                {shiftType.applicableDays.length} أيام
                              </span>
                            </div>
                          </div>

                          <Badge variant={shiftType.isActive ? 'default' : 'secondary'}>
                            {shiftType.isActive ? 'نشط' : 'غير نشط'}
                          </Badge>
                        </div>

                        <div className="flex flex-wrap gap-2 text-xs text-muted-foreground">
                          {shiftType.enableAutoAttendance && (
                            <Badge variant="outline" className="gap-1">
                              <CheckCircle2 className="h-3 w-3" />
                              حضور تلقائي
                            </Badge>
                          )}
                          {shiftType.allowOvertime && (
                            <Badge variant="outline" className="gap-1">
                              <TrendingUp className="h-3 w-3" />
                              وقت إضافي ({shiftType.overtimeMultiplier}x)
                            </Badge>
                          )}
                          <Badge variant="outline">
                            استراحة: {shiftType.breakDuration} دقيقة ({BREAK_TYPE_LABELS[shiftType.breakType].ar})
                          </Badge>
                          <Badge variant="outline">
                            فترة سماح: {shiftType.lateEntryGracePeriod} دقيقة
                          </Badge>
                        </div>

                        <div className="flex items-center gap-2 text-xs text-muted-foreground">
                          <span>الأيام:</span>
                          {shiftType.applicableDays.map((day) => (
                            <Badge key={day} variant="secondary" className="text-xs">
                              {DAY_OF_WEEK_LABELS[day as DayOfWeek].ar}
                            </Badge>
                          ))}
                        </div>
                      </div>

                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon">
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem onClick={() => openEditDialog(shiftType)}>
                            <Edit3 className="h-4 w-4 ltr:mr-2 rtl:ml-2" />
                            تعديل
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => handleClone(shiftType._id)}>
                            <Copy className="h-4 w-4 ltr:mr-2 rtl:ml-2" />
                            نسخ
                          </DropdownMenuItem>
                          {!shiftType.isDefault && (
                            <DropdownMenuItem onClick={() => handleSetDefault(shiftType._id)}>
                              <Star className="h-4 w-4 ltr:mr-2 rtl:ml-2" />
                              تعيين كافتراضي
                            </DropdownMenuItem>
                          )}
                          <DropdownMenuItem
                            onClick={() => handleToggleActive(shiftType._id, shiftType.isActive)}
                          >
                            {shiftType.isActive ? (
                              <>
                                <XCircle className="h-4 w-4 ltr:mr-2 rtl:ml-2" />
                                إلغاء التفعيل
                              </>
                            ) : (
                              <>
                                <CheckCircle2 className="h-4 w-4 ltr:mr-2 rtl:ml-2" />
                                تفعيل
                              </>
                            )}
                          </DropdownMenuItem>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem
                            onClick={() => handleDelete(shiftType._id)}
                            className="text-red-600"
                          >
                            <Trash2 className="h-4 w-4 ltr:mr-2 rtl:ml-2" />
                            حذف
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                  )
                })}
              </div>
            )}
          </div>
        </Main>
      </div>

      {/* Create/Edit Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {editingShiftType ? 'تعديل نوع الوردية' : 'إضافة نوع وردية جديد'}
            </DialogTitle>
            <DialogDescription>
              {editingShiftType
                ? 'قم بتعديل معلومات نوع الوردية'
                : 'قم بإضافة نوع وردية جديد للنظام'}
            </DialogDescription>
          </DialogHeader>

          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              {/* Basic Information */}
              <div className="space-y-4">
                <h3 className="font-semibold">المعلومات الأساسية</h3>
                <div className="grid gap-4 md:grid-cols-2">
                  <FormField
                    control={form.control}
                    name="name"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>اسم الوردية (English)</FormLabel>
                        <FormControl>
                          <Input {...field} placeholder="Morning Shift" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="nameAr"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>اسم الوردية (العربية)</FormLabel>
                        <FormControl>
                          <Input {...field} placeholder="وردية صباحية" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              </div>

              {/* Timing */}
              <div className="space-y-4">
                <h3 className="font-semibold">التوقيت</h3>
                <div className="grid gap-4 md:grid-cols-2">
                  <FormField
                    control={form.control}
                    name="startTime"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>وقت البداية</FormLabel>
                        <FormControl>
                          <Input {...field} type="time" />
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
                        <FormLabel>وقت النهاية</FormLabel>
                        <FormControl>
                          <Input {...field} type="time" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              </div>

              {/* Grace Periods */}
              <div className="space-y-4">
                <h3 className="font-semibold">فترات السماح</h3>
                <div className="grid gap-4 md:grid-cols-2">
                  <FormField
                    control={form.control}
                    name="lateEntryGracePeriod"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>فترة سماح التأخير (دقيقة)</FormLabel>
                        <FormControl>
                          <Input
                            {...field}
                            type="number"
                            onChange={(e) => field.onChange(Number(e.target.value))}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="earlyExitGracePeriod"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>فترة سماح الخروج المبكر (دقيقة)</FormLabel>
                        <FormControl>
                          <Input
                            {...field}
                            type="number"
                            onChange={(e) => field.onChange(Number(e.target.value))}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="beginCheckInBeforeShiftStart"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>بداية تسجيل الدخول قبل الوردية (دقيقة)</FormLabel>
                        <FormControl>
                          <Input
                            {...field}
                            type="number"
                            onChange={(e) => field.onChange(Number(e.target.value))}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="allowCheckOutAfterShiftEnd"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>السماح بتسجيل الخروج بعد الوردية (دقيقة)</FormLabel>
                        <FormControl>
                          <Input
                            {...field}
                            type="number"
                            onChange={(e) => field.onChange(Number(e.target.value))}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              </div>

              {/* Break Settings */}
              <div className="space-y-4">
                <h3 className="font-semibold">إعدادات الاستراحة</h3>
                <div className="grid gap-4 md:grid-cols-3">
                  <FormField
                    control={form.control}
                    name="breakDuration"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>مدة الاستراحة (دقيقة)</FormLabel>
                        <FormControl>
                          <Input
                            {...field}
                            type="number"
                            onChange={(e) => field.onChange(Number(e.target.value))}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="breakType"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>نوع الاستراحة</FormLabel>
                        <Select onValueChange={field.onChange} value={field.value}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="paid">مدفوعة</SelectItem>
                            <SelectItem value="unpaid">غير مدفوعة</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
                <div className="grid gap-4 md:grid-cols-2">
                  <FormField
                    control={form.control}
                    name="breakStartTime"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>وقت بداية الاستراحة (اختياري)</FormLabel>
                        <FormControl>
                          <Input {...field} type="time" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="breakEndTime"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>وقت نهاية الاستراحة (اختياري)</FormLabel>
                        <FormControl>
                          <Input {...field} type="time" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              </div>

              {/* Overtime Settings */}
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="font-semibold">إعدادات الوقت الإضافي</h3>
                  <FormField
                    control={form.control}
                    name="allowOvertime"
                    render={({ field }) => (
                      <FormItem className="flex items-center gap-2">
                        <FormControl>
                          <Switch checked={field.value} onCheckedChange={field.onChange} />
                        </FormControl>
                        <FormLabel className="!mt-0">السماح بالوقت الإضافي</FormLabel>
                      </FormItem>
                    )}
                  />
                </div>
                {form.watch('allowOvertime') && (
                  <div className="grid gap-4 md:grid-cols-2">
                    <FormField
                      control={form.control}
                      name="maxOvertimeHours"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>أقصى ساعات وقت إضافي</FormLabel>
                          <FormControl>
                            <Input
                              {...field}
                              type="number"
                              onChange={(e) => field.onChange(Number(e.target.value))}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="overtimeMultiplier"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>معامل الوقت الإضافي</FormLabel>
                          <FormControl>
                            <Input
                              {...field}
                              type="number"
                              step="0.1"
                              onChange={(e) => field.onChange(Number(e.target.value))}
                            />
                          </FormControl>
                          <FormDescription>مثال: 1.5 = 150% من الأجر الأساسي</FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                )}
              </div>

              {/* Ramadan Settings */}
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="font-semibold">إعدادات رمضان</h3>
                  <FormField
                    control={form.control}
                    name="isRamadanShift"
                    render={({ field }) => (
                      <FormItem className="flex items-center gap-2">
                        <FormControl>
                          <Switch checked={field.value} onCheckedChange={field.onChange} />
                        </FormControl>
                        <FormLabel className="!mt-0">وردية رمضان</FormLabel>
                      </FormItem>
                    )}
                  />
                </div>
                {form.watch('isRamadanShift') && (
                  <div className="grid gap-4 md:grid-cols-2">
                    <FormField
                      control={form.control}
                      name="ramadanStartTime"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>وقت بداية وردية رمضان</FormLabel>
                          <FormControl>
                            <Input {...field} type="time" />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="ramadanEndTime"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>وقت نهاية وردية رمضان</FormLabel>
                          <FormControl>
                            <Input {...field} type="time" />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                )}
              </div>

              {/* Auto Attendance */}
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="font-semibold">الحضور التلقائي</h3>
                  <FormField
                    control={form.control}
                    name="enableAutoAttendance"
                    render={({ field }) => (
                      <FormItem className="flex items-center gap-2">
                        <FormControl>
                          <Switch checked={field.value} onCheckedChange={field.onChange} />
                        </FormControl>
                        <FormLabel className="!mt-0">تفعيل الحضور التلقائي</FormLabel>
                      </FormItem>
                    )}
                  />
                </div>
                {form.watch('enableAutoAttendance') && (
                  <FormField
                    control={form.control}
                    name="processAttendanceAfter"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>معالجة الحضور بعد (دقيقة من نهاية الوردية)</FormLabel>
                        <FormControl>
                          <Input
                            {...field}
                            type="number"
                            onChange={(e) => field.onChange(Number(e.target.value))}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                )}
              </div>

              {/* Working Hours Thresholds */}
              <div className="space-y-4">
                <h3 className="font-semibold">حدود ساعات العمل</h3>
                <div className="grid gap-4 md:grid-cols-2">
                  <FormField
                    control={form.control}
                    name="workingHoursThresholdForHalfDay"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>حد نصف يوم (ساعة)</FormLabel>
                        <FormControl>
                          <Input
                            {...field}
                            type="number"
                            onChange={(e) => field.onChange(Number(e.target.value))}
                          />
                        </FormControl>
                        <FormDescription>
                          إذا عمل الموظف هذا القدر أو أقل يحتسب نصف يوم
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="workingHoursThresholdForAbsent"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>حد الغياب (ساعة)</FormLabel>
                        <FormControl>
                          <Input
                            {...field}
                            type="number"
                            onChange={(e) => field.onChange(Number(e.target.value))}
                          />
                        </FormControl>
                        <FormDescription>
                          إذا عمل الموظف هذا القدر أو أقل يحتسب غائب
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              </div>

              {/* Applicable Days */}
              <div className="space-y-4">
                <h3 className="font-semibold">الأيام المطبقة</h3>
                <FormField
                  control={form.control}
                  name="applicableDays"
                  render={() => (
                    <FormItem>
                      <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
                        {Object.entries(DAY_OF_WEEK_LABELS).map(([day, labels]) => (
                          <FormField
                            key={day}
                            control={form.control}
                            name="applicableDays"
                            render={({ field }) => (
                              <FormItem className="flex items-center space-x-2 space-y-0">
                                <FormControl>
                                  <Checkbox
                                    checked={field.value?.includes(day)}
                                    onCheckedChange={(checked) => {
                                      const current = field.value || []
                                      field.onChange(
                                        checked
                                          ? [...current, day]
                                          : current.filter((d) => d !== day)
                                      )
                                    }}
                                  />
                                </FormControl>
                                <FormLabel className="!mt-0 font-normal">
                                  {labels.ar}
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
              </div>

              {/* Status */}
              <div className="flex items-center gap-6">
                <FormField
                  control={form.control}
                  name="isActive"
                  render={({ field }) => (
                    <FormItem className="flex items-center gap-2">
                      <FormControl>
                        <Switch checked={field.value} onCheckedChange={field.onChange} />
                      </FormControl>
                      <FormLabel className="!mt-0">نشط</FormLabel>
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="isDefault"
                  render={({ field }) => (
                    <FormItem className="flex items-center gap-2">
                      <FormControl>
                        <Switch checked={field.value} onCheckedChange={field.onChange} />
                      </FormControl>
                      <FormLabel className="!mt-0">افتراضي</FormLabel>
                    </FormItem>
                  )}
                />
              </div>

              <DialogFooter>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setIsDialogOpen(false)}
                >
                  إلغاء
                </Button>
                <Button
                  type="submit"
                  disabled={createMutation.isPending || updateMutation.isPending}
                >
                  {editingShiftType ? 'تحديث' : 'إضافة'}
                </Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>
    </div>
  )
}
