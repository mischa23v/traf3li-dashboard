import { HRSidebar } from './hr-sidebar'
import { useState, useMemo } from 'react'
import { Main } from '@/components/layout/main'
import { LanguageSwitcher } from '@/components/language-switcher'
import { ThemeSwitch } from '@/components/theme-switch'
import { ConfigDrawer } from '@/components/config-drawer'
import { ProfileDropdown } from '@/components/profile-dropdown'
import { Link } from '@tanstack/react-router'
import { Checkbox } from '@/components/ui/checkbox'
import { ProductivityHero } from '@/components/productivity-hero'
import { useDevices, useDeleteDevice } from '@/hooks/useBiometric'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import { Header } from '@/components/layout/header'
import { TopNav } from '@/components/layout/top-nav'
import { DynamicIsland } from '@/components/dynamic-island'
import { Search, Bell, AlertCircle, Plus, MoreHorizontal, ChevronLeft, Eye, Trash2, Edit3, SortAsc, Filter, X, Wifi, WifiOff, Activity, Monitor, MapPin, Smartphone } from 'lucide-react'
import { useNavigate } from '@tanstack/react-router'
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
import type { BiometricDevice, DeviceStatus, DeviceType, DeviceManufacturer } from '@/types/biometric'

export function BiometricListView() {
    const navigate = useNavigate()
    const [isSelectionMode, setIsSelectionMode] = useState(false)
    const [selectedIds, setSelectedIds] = useState<string[]>([])

    // Filter states
    const [searchQuery, setSearchQuery] = useState('')
    const [statusFilter, setStatusFilter] = useState<string>('all')
    const [typeFilter, setTypeFilter] = useState<string>('all')
    const [manufacturerFilter, setManufacturerFilter] = useState<string>('all')
    const [sortBy, setSortBy] = useState<string>('name')

    // Mutations
    const deleteDeviceMutation = useDeleteDevice()

    // API Filters
    const filters = useMemo(() => {
        const f: any = {}

        // Status filter
        if (statusFilter !== 'all') {
            f.status = statusFilter as DeviceStatus
        }

        // Device type filter
        if (typeFilter !== 'all') {
            f.deviceType = typeFilter as DeviceType
        }

        // Manufacturer filter
        if (manufacturerFilter !== 'all') {
            f.manufacturer = manufacturerFilter as DeviceManufacturer
        }

        // Search
        if (searchQuery.trim()) {
            f.search = searchQuery.trim()
        }

        return f
    }, [statusFilter, typeFilter, manufacturerFilter, searchQuery])

    // Check if any filter is active
    const hasActiveFilters = searchQuery || statusFilter !== 'all' || typeFilter !== 'all' || manufacturerFilter !== 'all'

    // Clear all filters
    const clearFilters = () => {
        setSearchQuery('')
        setStatusFilter('all')
        setTypeFilter('all')
        setManufacturerFilter('all')
    }

    // Fetch devices
    const { data: devicesData, isLoading, isError, error, refetch } = useDevices(filters)

    // Helper function to format dates in both languages
    const formatDualDate = (dateString: string | Date | null | undefined) => {
        if (!dateString) return { arabic: 'غير محدد', english: 'Not set' }
        const date = new Date(dateString)
        return {
            arabic: format(date, 'd MMMM yyyy', { locale: arSA }),
            english: format(date, 'MMM d, yyyy')
        }
    }

    // Transform API data
    const devices = useMemo(() => {
        if (!devicesData?.data) return []

        let deviceList = devicesData.data.map((device: BiometricDevice) => ({
            id: device._id,
            deviceId: device.deviceId,
            deviceName: device.deviceName,
            deviceType: device.deviceType,
            manufacturer: device.manufacturer,
            status: device.status,
            location: device.location.name,
            connectionType: device.connection.type,
            ipAddress: device.connection.ipAddress,
            port: device.connection.port,
            lastSync: device.lastSync,
            lastSyncFormatted: formatDualDate(device.lastSync),
            firmwareVersion: device.firmwareVersion,
            capabilities: device.capabilities,
            createdAt: device.createdAt,
        }))

        // Client-side sorting
        if (sortBy === 'name') {
            deviceList = deviceList.sort((a, b) => a.deviceName.localeCompare(b.deviceName, 'ar'))
        } else if (sortBy === 'location') {
            deviceList = deviceList.sort((a, b) => a.location.localeCompare(b.location, 'ar'))
        } else if (sortBy === 'status') {
            deviceList = deviceList.sort((a, b) => a.status.localeCompare(b.status))
        }

        return deviceList
    }, [devicesData, sortBy])

    // Compute device stats
    const deviceStats = useMemo(() => {
        if (!devices.length) return null

        const total = devices.length
        const online = devices.filter(d => d.status === 'online').length
        const offline = devices.filter(d => d.status === 'offline').length
        const maintenance = devices.filter(d => d.status === 'maintenance').length
        const error = devices.filter(d => d.status === 'error').length

        return { total, online, offline, maintenance, error }
    }, [devices])

    // Selection Handlers
    const handleToggleSelectionMode = () => {
        setIsSelectionMode(!isSelectionMode)
        setSelectedIds([])
    }

    const handleSelectDevice = (deviceId: string) => {
        if (selectedIds.includes(deviceId)) {
            setSelectedIds(selectedIds.filter(id => id !== deviceId))
        } else {
            setSelectedIds([...selectedIds, deviceId])
        }
    }

    const handleDeleteSelected = () => {
        if (selectedIds.length === 0) return

        if (confirm(`هل أنت متأكد من حذف ${selectedIds.length} جهاز؟`)) {
            // Bulk delete - delete one by one
            selectedIds.forEach(id => {
                deleteDeviceMutation.mutate(id)
            })
            setIsSelectionMode(false)
            setSelectedIds([])
        }
    }

    // Single device actions
    const handleViewDevice = (deviceId: string) => {
        navigate({ to: '/dashboard/hr/biometric/$deviceId', params: { deviceId } })
    }

    const handleEditDevice = (deviceId: string) => {
        navigate({ to: '/dashboard/hr/biometric/new', search: { editId: deviceId } })
    }

    const handleDeleteDevice = (deviceId: string) => {
        if (confirm('هل أنت متأكد من حذف هذا الجهاز؟')) {
            deleteDeviceMutation.mutate(deviceId)
        }
    }

    // Status badge styling
    const getStatusBadge = (status: DeviceStatus) => {
        const styles: Record<DeviceStatus, string> = {
            online: 'bg-emerald-100 text-emerald-700 border-emerald-200',
            offline: 'bg-red-100 text-red-700 border-red-200',
            maintenance: 'bg-amber-100 text-amber-700 border-amber-200',
            error: 'bg-rose-100 text-rose-700 border-rose-200',
        }
        const labels: Record<DeviceStatus, string> = {
            online: 'متصل',
            offline: 'غير متصل',
            maintenance: 'صيانة',
            error: 'خطأ',
        }
        const icons: Record<DeviceStatus, any> = {
            online: Wifi,
            offline: WifiOff,
            maintenance: Activity,
            error: AlertCircle,
        }
        const Icon = icons[status]
        return (
            <Badge className={`${styles[status]} border-0 rounded-md px-2 flex items-center gap-1`}>
                <Icon className="h-3 w-3" aria-hidden="true" />
                {labels[status]}
            </Badge>
        )
    }

    // Device type badge
    const getTypeBadge = (type: DeviceType) => {
        const labels: Record<DeviceType, string> = {
            fingerprint: 'بصمة الإصبع',
            facial: 'بصمة الوجه',
            card_reader: 'قارئ بطاقات',
            iris: 'بصمة العين',
            palm: 'بصمة الكف',
            multi_modal: 'متعدد',
        }
        return <Badge variant="outline" className="text-xs">{labels[type]}</Badge>
    }

    // Stats for hero
    const heroStats = useMemo(() => {
        if (!deviceStats) return undefined
        return [
            { label: 'إجمالي الأجهزة', value: deviceStats.total || 0, icon: Monitor, status: 'normal' as const },
            { label: 'متصل', value: deviceStats.online || 0, icon: Wifi, status: 'normal' as const },
            { label: 'غير متصل', value: deviceStats.offline || 0, icon: WifiOff, status: deviceStats.offline > 0 ? 'attention' as const : 'zero' as const },
            { label: 'صيانة', value: deviceStats.maintenance || 0, icon: Activity, status: deviceStats.maintenance > 0 ? 'attention' as const : 'zero' as const },
        ]
    }, [deviceStats])

    const topNav = [
        { title: 'نظرة عامة', href: '/dashboard/overview', isActive: false },
        { title: 'الموظفين', href: '/dashboard/hr/employees', isActive: false },
        { title: 'الأجهزة البيومترية', href: '/dashboard/hr/biometric', isActive: true },
        { title: 'الإجازات', href: '/dashboard/hr/leaves', isActive: false },
    ]

    return (
        <>
            {/* Header */}
            <Header className="bg-navy shadow-none relative">
                <TopNav links={topNav} className="[&>a]:text-slate-300 [&>a:hover]:text-white [&>a[aria-current='page']]:text-white" />

                {/* Dynamic Island - Centered */}
                <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 z-50">
                    <DynamicIsland />
                </div>

                <div className='ms-auto flex items-center gap-2 sm:gap-4 overflow-x-auto min-w-0'>
                    <div className="relative hidden md:block min-w-0">
                        <Search className="absolute end-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-500" aria-hidden="true" />
                        <input type="text" placeholder="بحث..." aria-label="بحث" className="h-9 w-64 rounded-xl border border-white/10 bg-white/5 pe-9 ps-4 text-sm text-white placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/50" />
                    </div>
                    <Button variant="ghost" size="icon" className="relative rounded-full text-slate-300 hover:bg-white/10 hover:text-white flex-shrink-0" aria-label="الإشعارات">
                        <Bell className="h-5 w-5" aria-hidden="true" />
                        <span className="absolute top-2 end-2 h-2 w-2 bg-red-500 rounded-full border border-navy"></span>
                    </Button>
                    <LanguageSwitcher className="text-slate-300 hover:bg-white/10 hover:text-white flex-shrink-0" />
                    <ThemeSwitch className="text-slate-300 hover:bg-white/10 hover:text-white hidden sm:flex flex-shrink-0" />
                    <ConfigDrawer className="text-slate-300 hover:bg-white/10 hover:text-white hidden lg:flex flex-shrink-0" />
                    <ProfileDropdown className="text-slate-300 hover:bg-white/10 hover:text-white flex-shrink-0" />
                </div>
                {/* Bottom Gradient Line */}
                <div className="absolute bottom-0 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-emerald-500/50 to-transparent"></div>
            </Header>

            <Main fluid={true} className="bg-[#f8f9fa] flex-1 w-full p-6 lg:p-8 space-y-8 rounded-tr-3xl shadow-inner border-e border-white/5 overflow-hidden font-['IBM_Plex_Sans_Arabic']">

                {/* HERO CARD & STATS */}
                <ProductivityHero badge="الموارد البشرية" title="Biometric Devices" type="biometric" stats={heroStats} />

                {/* MAIN GRID LAYOUT */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

                    {/* RIGHT COLUMN (Main Content) */}
                    <div className="lg:col-span-2 space-y-6">

                        {/* FILTERS BAR */}
                        <div className="bg-white rounded-2xl p-4 shadow-sm border border-slate-100">
                            <div className="flex flex-col gap-4">
                                {/* Row 1: Search and primary filters */}
                                <div className="flex flex-wrap items-center gap-3">
                                    {/* Search Input */}
                                    <div className="relative flex-1 min-w-[200px] max-w-md">
                                        <Search className="absolute end-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-500" aria-hidden="true" />
                                        <Input
                                            type="text"
                                            placeholder="بحث بالاسم أو الرقم التسلسلي..." aria-label="بحث بالاسم أو الرقم التسلسلي"
                                            value={searchQuery}
                                            onChange={(e) => setSearchQuery(e.target.value)}
                                            className="pe-10 h-10 rounded-xl border-slate-200 focus:border-emerald-500 focus:ring-emerald-500/20"
                                        />
                                    </div>

                                    {/* Status Filter */}
                                    <Select value={statusFilter} onValueChange={setStatusFilter}>
                                        <SelectTrigger className="w-[130px] h-10 rounded-xl border-slate-200">
                                            <SelectValue placeholder="الحالة" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="all">كل الحالات</SelectItem>
                                            <SelectItem value="online">متصل</SelectItem>
                                            <SelectItem value="offline">غير متصل</SelectItem>
                                            <SelectItem value="maintenance">صيانة</SelectItem>
                                            <SelectItem value="error">خطأ</SelectItem>
                                        </SelectContent>
                                    </Select>

                                    {/* Device Type Filter */}
                                    <Select value={typeFilter} onValueChange={setTypeFilter}>
                                        <SelectTrigger className="w-[140px] h-10 rounded-xl border-slate-200">
                                            <SelectValue placeholder="نوع الجهاز" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="all">كل الأنواع</SelectItem>
                                            <SelectItem value="fingerprint">بصمة الإصبع</SelectItem>
                                            <SelectItem value="facial">بصمة الوجه</SelectItem>
                                            <SelectItem value="card_reader">قارئ بطاقات</SelectItem>
                                            <SelectItem value="iris">بصمة العين</SelectItem>
                                            <SelectItem value="palm">بصمة الكف</SelectItem>
                                            <SelectItem value="multi_modal">متعدد</SelectItem>
                                        </SelectContent>
                                    </Select>

                                    {/* Manufacturer Filter */}
                                    <Select value={manufacturerFilter} onValueChange={setManufacturerFilter}>
                                        <SelectTrigger className="w-[130px] h-10 rounded-xl border-slate-200">
                                            <SelectValue placeholder="الشركة المصنعة" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="all">الكل</SelectItem>
                                            <SelectItem value="zkteco">ZKTeco</SelectItem>
                                            <SelectItem value="suprema">Suprema</SelectItem>
                                            <SelectItem value="hikvision">Hikvision</SelectItem>
                                            <SelectItem value="dahua">Dahua</SelectItem>
                                            <SelectItem value="generic">عام</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>

                                {/* Row 2: Sort and clear */}
                                <div className="flex flex-wrap items-center gap-3">
                                    {/* Sort By */}
                                    <Select value={sortBy} onValueChange={setSortBy}>
                                        <SelectTrigger className="w-[160px] h-10 rounded-xl border-slate-200">
                                            <SortAsc className="h-4 w-4 ms-2 text-slate-500" aria-hidden="true" />
                                            <SelectValue placeholder="ترتيب حسب" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="name">الاسم</SelectItem>
                                            <SelectItem value="location">الموقع</SelectItem>
                                            <SelectItem value="status">الحالة</SelectItem>
                                        </SelectContent>
                                    </Select>

                                    {/* Clear Filters Button */}
                                    {hasActiveFilters && (
                                        <Button
                                            variant="ghost"
                                            size="sm"
                                            onClick={clearFilters}
                                            className="h-10 px-4 text-red-500 hover:text-red-600 hover:bg-red-50 rounded-xl"
                                        >
                                            <X className="h-4 w-4 ms-2" aria-hidden="true" />
                                            مسح الفلاتر
                                        </Button>
                                    )}
                                </div>
                            </div>
                        </div>

                        {/* MAIN DEVICES LIST */}
                        <div className="bg-white rounded-3xl p-1 shadow-sm border border-slate-100">
                            <div className="p-6 pb-2 flex justify-between items-center">
                                <h3 className="font-bold text-navy text-xl">قائمة الأجهزة</h3>
                                <Badge className="bg-slate-100 text-slate-600 border-0 rounded-full px-4 py-1">
                                    {devices.length} جهاز
                                </Badge>
                            </div>

                            <div className="p-4 space-y-4">
                                {/* Loading State */}
                                {isLoading && (
                                    <>
                                        {[1, 2, 3].map((i) => (
                                            <div key={i} className="bg-[#F8F9FA] rounded-2xl p-6 border border-slate-100">
                                                <div className="flex gap-4 mb-4">
                                                    <Skeleton className="w-14 h-14 rounded-xl" />
                                                    <div className="flex-1 space-y-2">
                                                        <Skeleton className="h-6 w-3/4" />
                                                        <Skeleton className="h-4 w-1/2" />
                                                    </div>
                                                </div>
                                                <Skeleton className="h-16 w-full" />
                                            </div>
                                        ))}
                                    </>
                                )}

                                {/* Error State */}
                                {isError && (
                                    <div className="bg-white rounded-2xl p-12 border border-slate-100 text-center">
                                        <div className="flex justify-center mb-4">
                                            <div className="w-16 h-16 rounded-full bg-red-50 flex items-center justify-center">
                                                <AlertCircle className="w-8 h-8 text-red-500" aria-hidden="true" />
                                            </div>
                                        </div>
                                        <h3 className="text-lg font-bold text-slate-900 mb-2">حدث خطأ أثناء تحميل الأجهزة</h3>
                                        <p className="text-slate-500 mb-4">{error?.message || 'تعذر الاتصال بالخادم'}</p>
                                        <Button onClick={() => refetch()} className="bg-emerald-500 hover:bg-emerald-600">
                                            إعادة المحاولة
                                        </Button>
                                    </div>
                                )}

                                {/* Empty State */}
                                {!isLoading && !isError && devices.length === 0 && (
                                    <div className="bg-white rounded-2xl p-12 border border-slate-100 text-center">
                                        <div className="flex justify-center mb-4">
                                            <div className="w-16 h-16 rounded-full bg-emerald-50 flex items-center justify-center">
                                                <Monitor className="w-8 h-8 text-emerald-500" aria-hidden="true" />
                                            </div>
                                        </div>
                                        <h3 className="text-lg font-bold text-slate-900 mb-2">لا يوجد أجهزة</h3>
                                        <p className="text-slate-500 mb-4">ابدأ بإضافة جهاز بيومتري جديد</p>
                                        <Button asChild className="bg-emerald-500 hover:bg-emerald-600">
                                            <Link to="/dashboard/hr/biometric/new">
                                                <Plus className="w-4 h-4 ms-2" aria-hidden="true" />
                                                إضافة جهاز
                                            </Link>
                                        </Button>
                                    </div>
                                )}

                                {/* Success State - Devices List */}
                                {!isLoading && !isError && devices.map((device) => (
                                    <div key={device.id} className={`bg-[#F8F9FA] rounded-2xl p-6 border transition-all group ${selectedIds.includes(device.id) ? 'border-emerald-500 bg-emerald-50/30' : 'border-slate-100 hover:border-emerald-200'}`}>
                                        <div className="flex justify-between items-start mb-4">
                                            <div className="flex gap-4 items-center">
                                                {isSelectionMode && (
                                                    <Checkbox
                                                        checked={selectedIds.includes(device.id)}
                                                        onCheckedChange={() => handleSelectDevice(device.id)}
                                                        className="h-6 w-6 rounded-md border-slate-300 data-[state=checked]:bg-emerald-500 data-[state=checked]:border-emerald-500"
                                                    />
                                                )}
                                                <div className="w-14 h-14 rounded-xl bg-white flex items-center justify-center shadow-sm text-emerald-600">
                                                    <Smartphone className="w-8 h-8" aria-hidden="true" />
                                                </div>
                                                <div>
                                                    <div className="flex items-center gap-2 mb-1">
                                                        <h4 className="font-bold text-navy text-lg">{device.deviceName}</h4>
                                                        {getStatusBadge(device.status)}
                                                    </div>
                                                    <p className="text-slate-500 text-sm">{device.deviceId} • {device.manufacturer}</p>
                                                </div>
                                            </div>
                                            <DropdownMenu>
                                                <DropdownMenuTrigger asChild>
                                                    <Button variant="ghost" size="icon" className="text-slate-500 hover:text-navy" aria-label="خيارات">
                                                        <MoreHorizontal className="h-5 w-5" aria-hidden="true" />
                                                    </Button>
                                                </DropdownMenuTrigger>
                                                <DropdownMenuContent align="end" className="w-48">
                                                    <DropdownMenuItem onClick={() => handleViewDevice(device.id)}>
                                                        <Eye className="h-4 w-4 ms-2" aria-hidden="true" />
                                                        عرض التفاصيل
                                                    </DropdownMenuItem>
                                                    <DropdownMenuItem onClick={() => handleEditDevice(device.id)}>
                                                        <Edit3 className="h-4 w-4 ms-2 text-blue-500" aria-hidden="true" />
                                                        تعديل البيانات
                                                    </DropdownMenuItem>
                                                    <DropdownMenuSeparator />
                                                    <DropdownMenuItem
                                                        onClick={() => handleDeleteDevice(device.id)}
                                                        className="text-red-600 focus:text-red-600"
                                                    >
                                                        <Trash2 className="h-4 w-4 ms-2" aria-hidden="true" />
                                                        حذف الجهاز
                                                    </DropdownMenuItem>
                                                </DropdownMenuContent>
                                            </DropdownMenu>
                                        </div>

                                        <div className="flex items-center justify-between pt-4 border-t border-slate-200/50">
                                            <div className="flex items-center gap-6">
                                                {/* Device Info */}
                                                <div className="flex items-center gap-4 text-sm text-slate-500">
                                                    <span className="flex items-center gap-1">
                                                        <MapPin className="h-4 w-4" aria-hidden="true" />
                                                        {device.location}
                                                    </span>
                                                    {device.ipAddress && (
                                                        <span className="flex items-center gap-1">
                                                            {device.ipAddress}:{device.port}
                                                        </span>
                                                    )}
                                                </div>
                                                {/* Type & Sync Info */}
                                                <div className="flex items-center gap-3">
                                                    {getTypeBadge(device.deviceType)}
                                                    {device.lastSync && (
                                                        <div className="text-center">
                                                            <div className="text-xs text-slate-600">آخر مزامنة</div>
                                                            <div className="font-medium text-navy text-sm">{device.lastSyncFormatted.arabic}</div>
                                                        </div>
                                                    )}
                                                </div>
                                            </div>
                                            <Link to={`/dashboard/hr/biometric/${device.id}` as any}>
                                                <Button className="bg-emerald-500 hover:bg-emerald-600 text-white rounded-lg px-6 shadow-lg shadow-emerald-500/20">
                                                    عرض التفاصيل
                                                </Button>
                                            </Link>
                                        </div>
                                    </div>
                                ))}
                            </div>

                            <div className="p-4 pt-0 text-center">
                                <Button variant="ghost" className="text-emerald-600 hover:text-emerald-700 hover:bg-emerald-50 w-full rounded-xl py-6">
                                    عرض جميع الأجهزة
                                    <ChevronLeft className="h-4 w-4 me-2" aria-hidden="true" />
                                </Button>
                            </div>
                        </div>
                    </div>

                    {/* LEFT COLUMN (Widgets) */}
                    <HRSidebar
                        context="biometric"
                        isSelectionMode={isSelectionMode}
                        onToggleSelectionMode={handleToggleSelectionMode}
                        selectedCount={selectedIds.length}
                        onDeleteSelected={handleDeleteSelected}
                    />
                </div>
            </Main>
        </>
    )
}
