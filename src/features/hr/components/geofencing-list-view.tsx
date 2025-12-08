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
import { useGeofences, useDeleteGeofence } from '@/hooks/useBiometric'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import { Header } from '@/components/layout/header'
import { TopNav } from '@/components/layout/top-nav'
import { DynamicIsland } from '@/components/dynamic-island'
import { Search, Bell, AlertCircle, MapPin, Plus, MoreHorizontal, ChevronLeft, Eye, Trash2, Edit3, SortAsc, Filter, X, Users, Circle, Hexagon, Clock } from 'lucide-react'
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
import type { GeofenceZone, GeofenceType } from '@/types/biometric'
import { MapContainer, TileLayer, Circle as LeafletCircle, Polygon as LeafletPolygon, Marker, Popup } from 'react-leaflet'
import 'leaflet/dist/leaflet.css'
import L from 'leaflet'

// Fix for default marker icon
delete (L.Icon.Default.prototype as any)._getIconUrl
L.Icon.Default.mergeOptions({
    iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png',
    iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png',
    shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png',
})

export function GeofencingListView() {
    const navigate = useNavigate()
    const [isSelectionMode, setIsSelectionMode] = useState(false)
    const [selectedIds, setSelectedIds] = useState<string[]>([])

    // Filter states
    const [searchQuery, setSearchQuery] = useState('')
    const [typeFilter, setTypeFilter] = useState<string>('all')
    const [statusFilter, setStatusFilter] = useState<string>('all')
    const [sortBy, setSortBy] = useState<string>('createdAt')

    // Mutations
    const deleteGeofenceMutation = useDeleteGeofence()

    // API Filters
    const filters = useMemo(() => {
        const f: any = {}

        // Type filter
        if (typeFilter !== 'all') {
            f.type = typeFilter
        }

        // Status filter
        if (statusFilter === 'active') {
            f.isActive = true
        } else if (statusFilter === 'inactive') {
            f.isActive = false
        }

        // Search
        if (searchQuery.trim()) {
            f.search = searchQuery.trim()
        }

        return f
    }, [typeFilter, statusFilter, searchQuery])

    // Check if any filter is active
    const hasActiveFilters = searchQuery || typeFilter !== 'all' || statusFilter !== 'all'

    // Clear all filters
    const clearFilters = () => {
        setSearchQuery('')
        setTypeFilter('all')
        setStatusFilter('all')
    }

    // Fetch geofences
    const { data: geofencesData, isLoading, isError, error, refetch } = useGeofences(filters)

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
    const geofences = useMemo(() => {
        if (!geofencesData?.zones) return []

        return geofencesData.zones.map((zone: GeofenceZone) => ({
            id: zone._id,
            name: zone.name,
            type: zone.type,
            center: zone.center,
            radius: zone.radius,
            coordinates: zone.coordinates,
            settings: zone.settings,
            isActive: zone.isActive,
            assignedEmployeesCount: zone.assignedEmployees?.length || 0,
            createdAt: zone.createdAt,
            createdAtFormatted: formatDualDate(zone.createdAt),
            _id: zone._id,
        }))
    }, [geofencesData])

    // Selection Handlers
    const handleToggleSelectionMode = () => {
        setIsSelectionMode(!isSelectionMode)
        setSelectedIds([])
    }

    const handleSelectGeofence = (geofenceId: string) => {
        if (selectedIds.includes(geofenceId)) {
            setSelectedIds(selectedIds.filter(id => id !== geofenceId))
        } else {
            setSelectedIds([...selectedIds, geofenceId])
        }
    }

    const handleDeleteSelected = () => {
        if (selectedIds.length === 0) return

        if (confirm(`هل أنت متأكد من حذف ${selectedIds.length} نطاق جغرافي؟`)) {
            selectedIds.forEach(id => {
                deleteGeofenceMutation.mutate(id)
            })
            setIsSelectionMode(false)
            setSelectedIds([])
        }
    }

    // Single geofence actions
    const handleViewGeofence = (geofenceId: string) => {
        navigate({ to: '/dashboard/hr/geofencing/$geofenceId', params: { geofenceId } })
    }

    const handleEditGeofence = (geofenceId: string) => {
        navigate({ to: '/dashboard/hr/geofencing/new', search: { editId: geofenceId } })
    }

    const handleDeleteGeofence = (geofenceId: string) => {
        if (confirm('هل أنت متأكد من حذف هذا النطاق الجغرافي؟')) {
            deleteGeofenceMutation.mutate(geofenceId)
        }
    }

    // Status badge styling
    const getStatusBadge = (isActive: boolean) => {
        if (isActive) {
            return <Badge className="bg-emerald-100 text-emerald-700 border-emerald-200 border-0 rounded-md px-2">نشط</Badge>
        }
        return <Badge className="bg-slate-100 text-slate-700 border-slate-200 border-0 rounded-md px-2">غير نشط</Badge>
    }

    // Type badge
    const getTypeBadge = (type: GeofenceType) => {
        const labels: Record<GeofenceType, { arabic: string; icon: any }> = {
            circle: { arabic: 'دائري', icon: Circle },
            polygon: { arabic: 'متعدد الأضلاع', icon: Hexagon },
        }
        const IconComponent = labels[type].icon
        return (
            <Badge variant="outline" className="text-xs flex items-center gap-1">
                <IconComponent className="h-3 w-3" aria-hidden="true" />
                {labels[type].arabic}
            </Badge>
        )
    }

    // Stats for hero
    const heroStats = useMemo(() => {
        if (!geofencesData?.zones) return undefined
        const totalZones = geofencesData.zones.length
        const activeZones = geofencesData.zones.filter((z: GeofenceZone) => z.isActive).length
        const circleZones = geofencesData.zones.filter((z: GeofenceZone) => z.type === 'circle').length
        const polygonZones = geofencesData.zones.filter((z: GeofenceZone) => z.type === 'polygon').length

        return [
            { label: 'إجمالي النطاقات', value: totalZones || 0, icon: MapPin, status: 'normal' as const },
            { label: 'نشطة', value: activeZones || 0, icon: Circle, status: 'normal' as const },
            { label: 'دائرية', value: circleZones || 0, icon: Circle, status: 'normal' as const },
            { label: 'متعددة الأضلاع', value: polygonZones || 0, icon: Hexagon, status: 'normal' as const },
        ]
    }, [geofencesData])

    const topNav = [
        { title: 'نظرة عامة', href: '/dashboard/overview', isActive: false },
        { title: 'الموظفين', href: '/dashboard/hr/employees', isActive: false },
        { title: 'الحضور', href: '/dashboard/hr/attendance', isActive: false },
        { title: 'النطاق الجغرافي', href: '/dashboard/hr/geofencing', isActive: true },
    ]

    // Calculate map center (average of all zone centers)
    const mapCenter = useMemo(() => {
        if (!geofences || geofences.length === 0) {
            // Default to Riyadh, Saudi Arabia
            return { lat: 24.7136, lng: 46.6753 }
        }

        const validCenters = geofences.filter(g => g.center).map(g => g.center!)
        if (validCenters.length === 0) {
            return { lat: 24.7136, lng: 46.6753 }
        }

        const avgLat = validCenters.reduce((sum, c) => sum + c.latitude, 0) / validCenters.length
        const avgLng = validCenters.reduce((sum, c) => sum + c.longitude, 0) / validCenters.length

        return { lat: avgLat, lng: avgLng }
    }, [geofences])

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
                        <Search className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-500" aria-hidden="true" />
                        <input type="text" placeholder="بحث..." aria-label="بحث" className="h-9 w-64 rounded-xl border border-white/10 bg-white/5 pe-9 ps-4 text-sm text-white placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/50" />
                    </div>
                    <Button variant="ghost" size="icon" className="relative rounded-full text-slate-300 hover:bg-white/10 hover:text-white flex-shrink-0" aria-label="الإشعارات">
                        <Bell className="h-5 w-5" aria-hidden="true" />
                        <span className="absolute top-2 right-2 h-2 w-2 bg-red-500 rounded-full border border-navy"></span>
                    </Button>
                    <LanguageSwitcher className="text-slate-300 hover:bg-white/10 hover:text-white flex-shrink-0" />
                    <ThemeSwitch className="text-slate-300 hover:bg-white/10 hover:text-white hidden sm:flex flex-shrink-0" />
                    <ConfigDrawer className="text-slate-300 hover:bg-white/10 hover:text-white hidden lg:flex flex-shrink-0" />
                    <ProfileDropdown className="text-slate-300 hover:bg-white/10 hover:text-white flex-shrink-0" />
                </div>
                {/* Bottom Gradient Line */}
                <div className="absolute bottom-0 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-emerald-500/50 to-transparent"></div>
            </Header>

            <Main fluid={true} className="bg-[#f8f9fa] flex-1 w-full p-6 lg:p-8 space-y-8 rounded-tr-3xl shadow-inner border-r border-white/5 overflow-hidden font-['IBM_Plex_Sans_Arabic']">

                {/* HERO CARD & STATS */}
                <ProductivityHero badge="الموارد البشرية" title="Geofencing Zones" type="geofencing" stats={heroStats} />

                {/* MAIN GRID LAYOUT */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

                    {/* RIGHT COLUMN (Main Content) */}
                    <div className="lg:col-span-2 space-y-6">

                        {/* MAP PREVIEW SECTION */}
                        <div className="bg-white rounded-3xl p-1 shadow-sm border border-slate-100 overflow-hidden">
                            <div className="p-6 pb-2">
                                <h3 className="font-bold text-navy text-xl">خريطة النطاقات الجغرافية</h3>
                            </div>
                            <div className="p-4">
                                <div className="rounded-2xl overflow-hidden border border-slate-200" style={{ height: '400px' }}>
                                    {!isLoading && geofences.length > 0 ? (
                                        <MapContainer
                                            center={[mapCenter.lat, mapCenter.lng]}
                                            zoom={12}
                                            style={{ height: '100%', width: '100%' }}
                                            scrollWheelZoom={false}
                                        >
                                            <TileLayer
                                                attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                                                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                                            />
                                            {geofences.map((zone) => {
                                                if (zone.type === 'circle' && zone.center && zone.radius) {
                                                    return (
                                                        <LeafletCircle
                                                            key={zone.id}
                                                            center={[zone.center.latitude, zone.center.longitude]}
                                                            radius={zone.radius}
                                                            pathOptions={{
                                                                color: zone.isActive ? '#10b981' : '#94a3b8',
                                                                fillColor: zone.isActive ? '#10b981' : '#94a3b8',
                                                                fillOpacity: 0.2,
                                                            }}
                                                        >
                                                            <Popup>
                                                                <div className="text-center">
                                                                    <strong>{zone.name}</strong>
                                                                    <br />
                                                                    <span className="text-xs text-slate-500">
                                                                        {zone.isActive ? 'نشط' : 'غير نشط'}
                                                                    </span>
                                                                </div>
                                                            </Popup>
                                                        </LeafletCircle>
                                                    )
                                                } else if (zone.type === 'polygon' && zone.coordinates && zone.coordinates.length > 0) {
                                                    return (
                                                        <LeafletPolygon
                                                            key={zone.id}
                                                            positions={zone.coordinates.map(coord => [coord.latitude, coord.longitude])}
                                                            pathOptions={{
                                                                color: zone.isActive ? '#10b981' : '#94a3b8',
                                                                fillColor: zone.isActive ? '#10b981' : '#94a3b8',
                                                                fillOpacity: 0.2,
                                                            }}
                                                        >
                                                            <Popup>
                                                                <div className="text-center">
                                                                    <strong>{zone.name}</strong>
                                                                    <br />
                                                                    <span className="text-xs text-slate-500">
                                                                        {zone.isActive ? 'نشط' : 'غير نشط'}
                                                                    </span>
                                                                </div>
                                                            </Popup>
                                                        </LeafletPolygon>
                                                    )
                                                }
                                                return null
                                            })}
                                        </MapContainer>
                                    ) : (
                                        <div className="flex items-center justify-center h-full bg-slate-50">
                                            {isLoading ? (
                                                <div className="text-center">
                                                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-emerald-600 mx-auto mb-2"></div>
                                                    <p className="text-slate-500 text-sm">جاري تحميل الخريطة...</p>
                                                </div>
                                            ) : (
                                                <div className="text-center">
                                                    <MapPin className="w-12 h-12 text-slate-300 mx-auto mb-2" />
                                                    <p className="text-slate-500 text-sm">لا توجد نطاقات جغرافية لعرضها على الخريطة</p>
                                                </div>
                                            )}
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>

                        {/* FILTERS BAR */}
                        <div className="bg-white rounded-2xl p-4 shadow-sm border border-slate-100">
                            <div className="flex flex-col gap-4">
                                {/* Row 1: Search and primary filters */}
                                <div className="flex flex-wrap items-center gap-3">
                                    {/* Search Input */}
                                    <div className="relative flex-1 min-w-[200px] max-w-md">
                                        <Search className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-500" aria-hidden="true" />
                                        <Input
                                            type="text"
                                            placeholder="بحث بالاسم..." aria-label="بحث بالاسم"
                                            value={searchQuery}
                                            onChange={(e) => setSearchQuery(e.target.value)}
                                            className="pe-10 h-10 rounded-xl border-slate-200 focus:border-emerald-500 focus:ring-emerald-500/20"
                                        />
                                    </div>

                                    {/* Type Filter */}
                                    <Select value={typeFilter} onValueChange={setTypeFilter}>
                                        <SelectTrigger className="w-[150px] h-10 rounded-xl border-slate-200">
                                            <SelectValue placeholder="نوع النطاق" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="all">كل الأنواع</SelectItem>
                                            <SelectItem value="circle">دائري</SelectItem>
                                            <SelectItem value="polygon">متعدد الأضلاع</SelectItem>
                                        </SelectContent>
                                    </Select>

                                    {/* Status Filter */}
                                    <Select value={statusFilter} onValueChange={setStatusFilter}>
                                        <SelectTrigger className="w-[130px] h-10 rounded-xl border-slate-200">
                                            <SelectValue placeholder="الحالة" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="all">كل الحالات</SelectItem>
                                            <SelectItem value="active">نشط</SelectItem>
                                            <SelectItem value="inactive">غير نشط</SelectItem>
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
                                            <SelectItem value="createdAt">تاريخ الإنشاء</SelectItem>
                                            <SelectItem value="name">الاسم</SelectItem>
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

                        {/* MAIN GEOFENCES LIST */}
                        <div className="bg-white rounded-3xl p-1 shadow-sm border border-slate-100">
                            <div className="p-6 pb-2 flex justify-between items-center">
                                <h3 className="font-bold text-navy text-xl">قائمة النطاقات الجغرافية</h3>
                                <Badge className="bg-slate-100 text-slate-600 border-0 rounded-full px-4 py-1">
                                    {geofences.length} نطاق
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
                                        <h3 className="text-lg font-bold text-slate-900 mb-2">حدث خطأ أثناء تحميل النطاقات الجغرافية</h3>
                                        <p className="text-slate-500 mb-4">{error?.message || 'تعذر الاتصال بالخادم'}</p>
                                        <Button onClick={() => refetch()} className="bg-emerald-500 hover:bg-emerald-600">
                                            إعادة المحاولة
                                        </Button>
                                    </div>
                                )}

                                {/* Empty State */}
                                {!isLoading && !isError && geofences.length === 0 && (
                                    <div className="bg-white rounded-2xl p-12 border border-slate-100 text-center">
                                        <div className="flex justify-center mb-4">
                                            <div className="w-16 h-16 rounded-full bg-emerald-50 flex items-center justify-center">
                                                <MapPin className="w-8 h-8 text-emerald-500" aria-hidden="true" />
                                            </div>
                                        </div>
                                        <h3 className="text-lg font-bold text-slate-900 mb-2">لا يوجد نطاقات جغرافية</h3>
                                        <p className="text-slate-500 mb-4">ابدأ بإضافة نطاق جغرافي جديد</p>
                                        <Button asChild className="bg-emerald-500 hover:bg-emerald-600">
                                            <Link to="/dashboard/hr/geofencing/new">
                                                <Plus className="w-4 h-4 ms-2" aria-hidden="true" />
                                                إضافة نطاق جغرافي
                                            </Link>
                                        </Button>
                                    </div>
                                )}

                                {/* Success State - Geofences List */}
                                {!isLoading && !isError && geofences.map((geofence) => (
                                    <div key={geofence.id} className={`bg-[#F8F9FA] rounded-2xl p-6 border transition-all group ${selectedIds.includes(geofence.id) ? 'border-emerald-500 bg-emerald-50/30' : 'border-slate-100 hover:border-emerald-200'}`}>
                                        <div className="flex justify-between items-start mb-4">
                                            <div className="flex gap-4 items-center">
                                                {isSelectionMode && (
                                                    <Checkbox
                                                        checked={selectedIds.includes(geofence.id)}
                                                        onCheckedChange={() => handleSelectGeofence(geofence.id)}
                                                        className="h-6 w-6 rounded-md border-slate-300 data-[state=checked]:bg-emerald-500 data-[state=checked]:border-emerald-500"
                                                    />
                                                )}
                                                <div className="w-14 h-14 rounded-xl bg-white flex items-center justify-center shadow-sm text-emerald-600 font-bold text-lg">
                                                    <MapPin className="h-8 w-8" />
                                                </div>
                                                <div>
                                                    <div className="flex items-center gap-2 mb-1">
                                                        <h4 className="font-bold text-navy text-lg">{geofence.name}</h4>
                                                        {getStatusBadge(geofence.isActive)}
                                                    </div>
                                                    <div className="flex items-center gap-2">
                                                        {getTypeBadge(geofence.type)}
                                                        <span className="text-slate-500 text-sm">
                                                            • {geofence.assignedEmployeesCount} موظف
                                                        </span>
                                                    </div>
                                                </div>
                                            </div>
                                            <DropdownMenu>
                                                <DropdownMenuTrigger asChild>
                                                    <Button variant="ghost" size="icon" className="text-slate-500 hover:text-navy" aria-label="خيارات">
                                                        <MoreHorizontal className="h-5 w-5" aria-hidden="true" />
                                                    </Button>
                                                </DropdownMenuTrigger>
                                                <DropdownMenuContent align="end" className="w-48">
                                                    <DropdownMenuItem onClick={() => handleViewGeofence(geofence.id)}>
                                                        <Eye className="h-4 w-4 ms-2" aria-hidden="true" />
                                                        عرض التفاصيل
                                                    </DropdownMenuItem>
                                                    <DropdownMenuItem onClick={() => handleEditGeofence(geofence.id)}>
                                                        <Edit3 className="h-4 w-4 ms-2 text-blue-500" aria-hidden="true" />
                                                        تعديل النطاق
                                                    </DropdownMenuItem>
                                                    <DropdownMenuSeparator />
                                                    <DropdownMenuItem
                                                        onClick={() => handleDeleteGeofence(geofence.id)}
                                                        className="text-red-600 focus:text-red-600"
                                                    >
                                                        <Trash2 className="h-4 w-4 ms-2" aria-hidden="true" />
                                                        حذف النطاق
                                                    </DropdownMenuItem>
                                                </DropdownMenuContent>
                                            </DropdownMenu>
                                        </div>

                                        <div className="flex items-center justify-between pt-4 border-t border-slate-200/50">
                                            <div className="flex items-center gap-6">
                                                {/* Settings Info */}
                                                <div className="flex items-center gap-4 text-sm text-slate-500">
                                                    {geofence.settings.allowClockIn && (
                                                        <span className="flex items-center gap-1">
                                                            <Clock className="h-4 w-4 text-emerald-500" aria-hidden="true" />
                                                            تسجيل الدخول
                                                        </span>
                                                    )}
                                                    {geofence.settings.allowClockOut && (
                                                        <span className="flex items-center gap-1">
                                                            <Clock className="h-4 w-4 text-blue-500" aria-hidden="true" />
                                                            تسجيل الخروج
                                                        </span>
                                                    )}
                                                </div>
                                                {/* Zone Info */}
                                                <div className="flex items-center gap-3">
                                                    {geofence.type === 'circle' && geofence.radius && (
                                                        <div className="text-center">
                                                            <div className="text-xs text-slate-600">نصف القطر</div>
                                                            <div className="font-medium text-navy text-sm">{geofence.radius}م</div>
                                                        </div>
                                                    )}
                                                    <div className="text-center">
                                                        <div className="text-xs text-slate-600">تاريخ الإنشاء</div>
                                                        <div className="font-medium text-navy text-sm">{geofence.createdAtFormatted.arabic}</div>
                                                    </div>
                                                </div>
                                            </div>
                                            <Link to={`/dashboard/hr/geofencing/${geofence.id}` as any}>
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
                                    عرض جميع النطاقات الجغرافية
                                    <ChevronLeft className="h-4 w-4 me-2" aria-hidden="true" />
                                </Button>
                            </div>
                        </div>
                    </div>

                    {/* LEFT COLUMN (Widgets) */}
                    <HRSidebar
                        context="geofencing"
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
