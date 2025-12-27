import { useState, useMemo, lazy, Suspense } from 'react'
import { useParams, useNavigate, Link } from '@tanstack/react-router'
import { ROUTES } from '@/constants/routes'
import { Main } from '@/components/layout/main'
import { LanguageSwitcher } from '@/components/language-switcher'
import { ThemeSwitch } from '@/components/theme-switch'
import { ConfigDrawer } from '@/components/config-drawer'
import { ProfileDropdown } from '@/components/profile-dropdown'
import { ProductivityHero } from '@/components/productivity-hero'
import { HRSidebar } from './hr-sidebar'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Skeleton } from '@/components/ui/skeleton'
import { Header } from '@/components/layout/header'
import { TopNav } from '@/components/layout/top-nav'
import { DynamicIsland } from '@/components/dynamic-island'
import { useGeofence, useDeleteGeofence, useToggleGeofence } from '@/hooks/useBiometric'
import {
    Search, Bell, AlertCircle, MapPin, Loader2, AlertTriangle, Trash2,
    Clock, Circle, Hexagon, Users, Edit3, Power, CheckCircle, XCircle
} from 'lucide-react'
import { format } from 'date-fns'
import { arSA } from 'date-fns/locale'
import type { GeofenceType } from '@/types/biometric'

// Lazy load Leaflet map components (~250KB) - only loaded when viewing geofencing details
const LeafletMap = lazy(() => import('./geofencing-map').then(mod => ({ default: mod.GeofencingMap })))

export function GeofencingDetailsView() {
    const { zoneId } = useParams({ strict: false }) as { zoneId: string }
    const navigate = useNavigate()
    const [activeTab, setActiveTab] = useState('overview')
    const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)

    // Fetch zone data
    const { data: zoneData, isLoading, isError, error, refetch } = useGeofence(zoneId)

    // Delete mutation
    const deleteZoneMutation = useDeleteGeofence()
    const toggleZoneMutation = useToggleGeofence()

    // Handle delete
    const handleDelete = () => {
        deleteZoneMutation.mutate(zoneId, {
            onSuccess: () => {
                navigate({ to: ROUTES.dashboard.hr.geofencing.list })
            }
        })
    }

    // Handle toggle active status
    const handleToggleActive = () => {
        toggleZoneMutation.mutate(zoneId)
    }

    // Format date helper
    const formatDate = (dateString: string | undefined | null) => {
        if (!dateString) return 'غير محدد'
        return format(new Date(dateString), 'd MMMM yyyy', { locale: arSA })
    }

    // Status badge styling
    const getStatusBadge = (isActive: boolean) => {
        if (isActive) {
            return <Badge className="bg-emerald-100 text-emerald-700 border-emerald-200 border-0 rounded-md px-3 py-1">نشط</Badge>
        }
        return <Badge className="bg-slate-100 text-slate-700 border-slate-200 border-0 rounded-md px-3 py-1">غير نشط</Badge>
    }

    // Type badge
    const getTypeBadge = (type: GeofenceType) => {
        const labels: Record<GeofenceType, { arabic: string; icon: any; color: string }> = {
            circle: { arabic: 'دائري', icon: Circle, color: 'text-blue-600' },
            polygon: { arabic: 'متعدد الأضلاع', icon: Hexagon, color: 'text-purple-600' },
        }
        const IconComponent = labels[type].icon
        return (
            <Badge variant="outline" className="flex items-center gap-1">
                <IconComponent className={`h-4 w-4 ${labels[type].color}`} aria-hidden="true" />
                {labels[type].arabic}
            </Badge>
        )
    }

    // Transform data for display
    const zone = useMemo(() => {
        if (!zoneData) return null
        return {
            ...zoneData,
            assignedEmployeesCount: zoneData.assignedEmployees?.length || 0,
        }
    }, [zoneData])

    // Calculate map center
    const mapCenter = useMemo(() => {
        if (!zone) return { lat: 24.7136, lng: 46.6753 }

        if (zone.type === 'circle' && zone.center) {
            return { lat: zone.center.latitude, lng: zone.center.longitude }
        } else if (zone.type === 'polygon' && zone.coordinates && zone.coordinates.length > 0) {
            const avgLat = zone.coordinates.reduce((sum, c) => sum + c.latitude, 0) / zone.coordinates.length
            const avgLng = zone.coordinates.reduce((sum, c) => sum + c.longitude, 0) / zone.coordinates.length
            return { lat: avgLat, lng: avgLng }
        }

        return { lat: 24.7136, lng: 46.6753 }
    }, [zone])

    const topNav = [
        { title: 'نظرة عامة', href: '/dashboard/overview', isActive: false },
        { title: 'الموظفين', href: ROUTES.dashboard.hr.employees.list, isActive: false },
        { title: 'الحضور', href: ROUTES.dashboard.hr.attendance.list, isActive: false },
        { title: 'النطاق الجغرافي', href: ROUTES.dashboard.hr.geofencing.list, isActive: true },
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

                <div className='ms-auto flex items-center gap-4'>
                    <div className="relative hidden md:block">
                        <Search className="absolute end-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-500" aria-hidden="true" />
                        <input type="text" placeholder="بحث..." aria-label="بحث" className="h-9 w-64 rounded-xl border border-white/10 bg-white/5 pe-9 ps-4 text-sm text-white placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/50" />
                    </div>
                    <Button variant="ghost" size="icon" className="relative rounded-full text-slate-300 hover:bg-white/10 hover:text-white" aria-label="الإشعارات">
                        <Bell className="h-5 w-5" aria-hidden="true" />
                        <span className="absolute top-2 end-2 h-2 w-2 bg-red-500 rounded-full border border-navy"></span>
                    </Button>
                    <LanguageSwitcher className="text-slate-300 hover:bg-white/10 hover:text-white" />
                    <ThemeSwitch className="text-slate-300 hover:bg-white/10 hover:text-white" />
                    <ConfigDrawer className="text-slate-300 hover:bg-white/10 hover:text-white" />
                    <ProfileDropdown className="text-slate-300 hover:bg-white/10 hover:text-white" />
                </div>
                {/* Bottom Gradient Line */}
                <div className="absolute bottom-0 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-emerald-500/50 to-transparent"></div>
            </Header>

            <Main fluid={true} className="bg-[#f8f9fa] flex-1 w-full p-6 lg:p-8 space-y-8 rounded-tr-3xl shadow-inner border-e border-white/5 overflow-hidden font-['IBM_Plex_Sans_Arabic']">

                {/* Loading State */}
                {isLoading && (
                    <div className="space-y-6">
                        <Skeleton className="h-48 w-full rounded-3xl" />
                        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                            <div className="lg:col-span-2">
                                <Skeleton className="h-96 w-full rounded-2xl" />
                            </div>
                            <div>
                                <Skeleton className="h-96 w-full rounded-2xl" />
                            </div>
                        </div>
                    </div>
                )}

                {/* Error State */}
                {isError && (
                    <div className="bg-white rounded-2xl p-12 border border-slate-100 text-center">
                        <div className="flex justify-center mb-4">
                            <div className="w-16 h-16 rounded-full bg-red-50 flex items-center justify-center">
                                <AlertCircle className="w-8 h-8 text-red-500" aria-hidden="true" />
                            </div>
                        </div>
                        <h3 className="text-lg font-bold text-slate-900 mb-2">حدث خطأ أثناء تحميل بيانات النطاق</h3>
                        <p className="text-slate-500 mb-4">{error?.message || 'تعذر الاتصال بالخادم'}</p>
                        <Button onClick={() => refetch()} className="bg-emerald-500 hover:bg-emerald-600">
                            إعادة المحاولة
                        </Button>
                    </div>
                )}

                {/* Empty State */}
                {!isLoading && !isError && !zone && (
                    <div className="bg-white rounded-2xl p-12 border border-slate-100 text-center">
                        <div className="flex justify-center mb-4">
                            <div className="w-16 h-16 rounded-full bg-emerald-50 flex items-center justify-center">
                                <MapPin className="w-8 h-8 text-emerald-500" aria-hidden="true" />
                            </div>
                        </div>
                        <h3 className="text-lg font-bold text-slate-900 mb-2">النطاق غير موجود</h3>
                        <p className="text-slate-500 mb-4">لم يتم العثور على النطاق الجغرافي المطلوب</p>
                        <Button asChild className="bg-emerald-500 hover:bg-emerald-600">
                            <Link to="/dashboard/hr/geofencing">
                                العودة إلى القائمة
                            </Link>
                        </Button>
                    </div>
                )}

                {/* Success State */}
                {!isLoading && !isError && zone && (
                    <>
                        {/* HERO CARD */}
                        <ProductivityHero
                            badge="الموارد البشرية"
                            title={zone.name}
                            type="geofencing"
                            listMode={true}
                        />

                        {/* MAIN GRID LAYOUT */}
                        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

                            {/* RIGHT COLUMN (Main Content) */}
                            <div className="lg:col-span-2 space-y-8">
                                <Card className="border border-slate-100 shadow-sm rounded-2xl overflow-hidden min-h-[600px]">
                                    <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
                                        <div className="border-b border-slate-100 px-4 sm:px-6 py-4">
                                            <TabsList className="inline-flex h-10 items-center justify-center rounded-lg bg-slate-100 p-1 text-slate-500 w-full sm:w-auto">
                                                {['overview', 'employees', 'settings'].map((tab) => (
                                                    <TabsTrigger
                                                        key={tab}
                                                        value={tab}
                                                        className="
                                                            inline-flex items-center justify-center whitespace-nowrap rounded-md px-3 sm:px-4 py-2 text-sm font-medium ring-offset-white transition-all
                                                            focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500 focus-visible:ring-offset-2
                                                            disabled:pointer-events-none disabled:opacity-50
                                                            data-[state=active]:bg-emerald-950 data-[state=active]:text-white data-[state=active]:shadow-sm
                                                            data-[state=inactive]:hover:bg-slate-200
                                                            flex-1 sm:flex-initial
                                                        "
                                                    >
                                                        {tab === 'overview' ? 'نظرة عامة' :
                                                            tab === 'employees' ? 'الموظفين' : 'الإعدادات'}
                                                    </TabsTrigger>
                                                ))}
                                            </TabsList>
                                        </div>

                                        <div className="p-4 sm:p-6 bg-slate-50/50 min-h-[400px] sm:min-h-[500px]">
                                            {/* Overview Tab */}
                                            <TabsContent value="overview" className="mt-0 space-y-6">
                                                {/* Zone Header Card */}
                                                <Card className="border-none shadow-sm bg-white rounded-2xl overflow-hidden">
                                                    <CardContent className="p-6">
                                                        <div className="flex gap-6 items-start">
                                                            <div className="w-20 h-20 rounded-2xl bg-emerald-100 flex items-center justify-center text-emerald-600 font-bold text-2xl">
                                                                <MapPin className="h-10 w-10" />
                                                            </div>
                                                            <div className="flex-1">
                                                                <div className="flex items-center gap-3 mb-2">
                                                                    <h2 className="text-2xl font-bold text-navy">{zone.name}</h2>
                                                                    {getStatusBadge(zone.isActive)}
                                                                </div>
                                                                <div className="flex items-center gap-2 mb-2">
                                                                    {getTypeBadge(zone.type)}
                                                                    <span className="text-slate-500 text-sm">
                                                                        • {zone.assignedEmployeesCount} موظف مسند
                                                                    </span>
                                                                </div>
                                                                <p className="text-sm text-slate-600 mt-1">
                                                                    تاريخ الإنشاء: {formatDate(zone.createdAt as any)}
                                                                </p>
                                                            </div>
                                                        </div>
                                                    </CardContent>
                                                </Card>

                                                {/* Map Display */}
                                                <Card className="border-none shadow-sm bg-white rounded-2xl overflow-hidden">
                                                    <CardHeader className="pb-3">
                                                        <CardTitle className="text-base font-bold text-navy flex items-center gap-2">
                                                            <MapPin className="w-4 h-4 text-emerald-600" aria-hidden="true" />
                                                            خريطة النطاق الجغرافي
                                                        </CardTitle>
                                                    </CardHeader>
                                                    <CardContent>
                                                        <div className="rounded-2xl overflow-hidden border border-slate-200" style={{ height: '400px' }}>
                                                            <Suspense fallback={
                                                                <div className="h-full w-full bg-slate-100 animate-pulse flex items-center justify-center">
                                                                    <span className="text-slate-500">جاري تحميل الخريطة...</span>
                                                                </div>
                                                            }>
                                                                <LeafletMap mapCenter={mapCenter} zone={zone} />
                                                            </Suspense>
                                                        </div>
                                                    </CardContent>
                                                </Card>

                                                {/* Zone Details */}
                                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                                    <Card className="border-none shadow-sm bg-white rounded-2xl overflow-hidden">
                                                        <CardHeader className="pb-3">
                                                            <CardTitle className="text-base font-bold text-navy flex items-center gap-2">
                                                                {zone.type === 'circle' ? <Circle className="w-4 h-4 text-blue-600" /> : <Hexagon className="w-4 h-4 text-purple-600" />}
                                                                تفاصيل النطاق
                                                            </CardTitle>
                                                        </CardHeader>
                                                        <CardContent className="space-y-3">
                                                            <div className="flex justify-between text-sm">
                                                                <span className="text-slate-500">النوع</span>
                                                                <span className="font-medium text-slate-900">{zone.type === 'circle' ? 'دائري' : 'متعدد الأضلاع'}</span>
                                                            </div>
                                                            {zone.type === 'circle' && (
                                                                <>
                                                                    <div className="flex justify-between text-sm">
                                                                        <span className="text-slate-500">نصف القطر</span>
                                                                        <span className="font-medium text-slate-900">{zone.radius} متر</span>
                                                                    </div>
                                                                    {zone.center && (
                                                                        <>
                                                                            <div className="flex justify-between text-sm">
                                                                                <span className="text-slate-500">خط العرض</span>
                                                                                <span className="font-medium text-slate-900" dir="ltr">{zone.center.latitude.toFixed(6)}</span>
                                                                            </div>
                                                                            <div className="flex justify-between text-sm">
                                                                                <span className="text-slate-500">خط الطول</span>
                                                                                <span className="font-medium text-slate-900" dir="ltr">{zone.center.longitude.toFixed(6)}</span>
                                                                            </div>
                                                                        </>
                                                                    )}
                                                                </>
                                                            )}
                                                            {zone.type === 'polygon' && zone.coordinates && (
                                                                <div className="flex justify-between text-sm">
                                                                    <span className="text-slate-500">عدد النقاط</span>
                                                                    <span className="font-medium text-slate-900">{zone.coordinates.length} نقطة</span>
                                                                </div>
                                                            )}
                                                            <div className="flex justify-between text-sm">
                                                                <span className="text-slate-500">الحالة</span>
                                                                {getStatusBadge(zone.isActive)}
                                                            </div>
                                                        </CardContent>
                                                    </Card>

                                                    <Card className="border-none shadow-sm bg-white rounded-2xl overflow-hidden">
                                                        <CardHeader className="pb-3">
                                                            <CardTitle className="text-base font-bold text-navy flex items-center gap-2">
                                                                <Users className="w-4 h-4 text-emerald-600" aria-hidden="true" />
                                                                الموظفين المسندين
                                                            </CardTitle>
                                                        </CardHeader>
                                                        <CardContent className="space-y-3">
                                                            <div className="flex justify-between text-sm">
                                                                <span className="text-slate-500">إجمالي الموظفين</span>
                                                                <span className="font-medium text-slate-900">{zone.assignedEmployeesCount} موظف</span>
                                                            </div>
                                                            <div className="pt-2">
                                                                <Button
                                                                    variant="outline"
                                                                    size="sm"
                                                                    className="w-full rounded-xl"
                                                                    onClick={() => setActiveTab('employees')}
                                                                >
                                                                    عرض الموظفين
                                                                </Button>
                                                            </div>
                                                        </CardContent>
                                                    </Card>
                                                </div>
                                            </TabsContent>

                                            {/* Employees Tab */}
                                            <TabsContent value="employees" className="mt-0 space-y-6">
                                                <Card className="border-none shadow-sm bg-white rounded-2xl overflow-hidden">
                                                    <CardHeader className="pb-3">
                                                        <CardTitle className="text-base font-bold text-navy flex items-center gap-2">
                                                            <Users className="w-4 h-4 text-emerald-600" aria-hidden="true" />
                                                            الموظفين المسندين للنطاق
                                                        </CardTitle>
                                                    </CardHeader>
                                                    <CardContent>
                                                        {zone.assignedEmployeesCount > 0 ? (
                                                            <div className="space-y-3">
                                                                <p className="text-slate-600">
                                                                    عدد الموظفين المسندين: {zone.assignedEmployeesCount}
                                                                </p>
                                                                <div className="bg-blue-50 rounded-xl p-4 border border-blue-100">
                                                                    <p className="text-sm text-blue-800">
                                                                        سيتم عرض قائمة الموظفين المسندين هنا عند توفر البيانات من الخادم.
                                                                    </p>
                                                                </div>
                                                            </div>
                                                        ) : (
                                                            <div className="text-center py-8 text-slate-500">
                                                                <Users className="w-12 h-12 mx-auto mb-3 opacity-30" aria-hidden="true" />
                                                                <p>لا يوجد موظفين مسندين لهذا النطاق</p>
                                                            </div>
                                                        )}
                                                    </CardContent>
                                                </Card>
                                            </TabsContent>

                                            {/* Settings Tab */}
                                            <TabsContent value="settings" className="mt-0 space-y-6">
                                                <Card className="border-none shadow-sm bg-white rounded-2xl overflow-hidden">
                                                    <CardHeader className="pb-3">
                                                        <CardTitle className="text-base font-bold text-navy flex items-center gap-2">
                                                            <Clock className="w-4 h-4 text-amber-600" />
                                                            إعدادات النطاق
                                                        </CardTitle>
                                                    </CardHeader>
                                                    <CardContent className="space-y-4">
                                                        <div className="grid grid-cols-2 gap-4">
                                                            <div className="flex items-center gap-3">
                                                                {zone.settings.allowClockIn ? (
                                                                    <CheckCircle className="h-5 w-5 text-emerald-500" />
                                                                ) : (
                                                                    <XCircle className="h-5 w-5 text-slate-400" />
                                                                )}
                                                                <span className="text-sm text-slate-700">السماح بتسجيل الدخول</span>
                                                            </div>
                                                            <div className="flex items-center gap-3">
                                                                {zone.settings.allowClockOut ? (
                                                                    <CheckCircle className="h-5 w-5 text-emerald-500" />
                                                                ) : (
                                                                    <XCircle className="h-5 w-5 text-slate-400" />
                                                                )}
                                                                <span className="text-sm text-slate-700">السماح بتسجيل الخروج</span>
                                                            </div>
                                                            <div className="flex items-center gap-3">
                                                                {zone.settings.alertOnEntry ? (
                                                                    <CheckCircle className="h-5 w-5 text-emerald-500" />
                                                                ) : (
                                                                    <XCircle className="h-5 w-5 text-slate-400" />
                                                                )}
                                                                <span className="text-sm text-slate-700">تنبيه عند الدخول</span>
                                                            </div>
                                                            <div className="flex items-center gap-3">
                                                                {zone.settings.alertOnExit ? (
                                                                    <CheckCircle className="h-5 w-5 text-emerald-500" />
                                                                ) : (
                                                                    <XCircle className="h-5 w-5 text-slate-400" />
                                                                )}
                                                                <span className="text-sm text-slate-700">تنبيه عند الخروج</span>
                                                            </div>
                                                        </div>

                                                        {zone.settings.restrictedHours && (
                                                            <div className="mt-4 p-4 bg-amber-50 rounded-xl border border-amber-200">
                                                                <h4 className="font-semibold text-amber-800 mb-2">الساعات المقيدة</h4>
                                                                <div className="flex items-center gap-4 text-sm text-amber-700">
                                                                    <span>من: {zone.settings.restrictedHours.start}</span>
                                                                    <span>إلى: {zone.settings.restrictedHours.end}</span>
                                                                </div>
                                                            </div>
                                                        )}
                                                    </CardContent>
                                                </Card>

                                                {/* Action Buttons */}
                                                <div className="flex gap-4">
                                                    <Button
                                                        onClick={handleToggleActive}
                                                        disabled={toggleZoneMutation.isPending}
                                                        className={`flex-1 h-12 rounded-xl ${zone.isActive ? 'bg-slate-500 hover:bg-slate-600' : 'bg-emerald-500 hover:bg-emerald-600'} text-white`}
                                                    >
                                                        {toggleZoneMutation.isPending ? (
                                                            <Loader2 className="h-5 w-5 animate-spin ms-2" />
                                                        ) : (
                                                            <Power className="h-5 w-5 ms-2" />
                                                        )}
                                                        {zone.isActive ? 'تعطيل النطاق' : 'تفعيل النطاق'}
                                                    </Button>
                                                    <Button
                                                        onClick={() => navigate({ to: ROUTES.dashboard.hr.geofencing.new, search: { editId: zoneId } })}
                                                        className="flex-1 h-12 bg-blue-500 hover:bg-blue-600 text-white rounded-xl"
                                                    >
                                                        <Edit3 className="h-5 w-5 ms-2" />
                                                        تعديل النطاق
                                                    </Button>
                                                </div>
                                            </TabsContent>
                                        </div>
                                    </Tabs>
                                </Card>
                            </div>

                            {/* LEFT SIDEBAR - Quick Actions */}
                            <HRSidebar
                                context="geofencing"
                                zoneId={zoneId}
                                onDeleteZone={() => setShowDeleteConfirm(true)}
                                isDeletePending={deleteZoneMutation.isPending}
                            />
                        </div>
                    </>
                )}
            </Main>

            {/* Delete Confirmation Dialog */}
            {showDeleteConfirm && zone && (
                <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
                    <div className="bg-white rounded-2xl p-6 max-w-md w-full shadow-xl">
                        <div className="flex justify-center mb-4">
                            <div className="w-16 h-16 rounded-full bg-red-50 flex items-center justify-center">
                                <AlertTriangle className="w-8 h-8 text-red-500" aria-hidden="true" />
                            </div>
                        </div>
                        <h3 className="text-lg font-bold text-slate-900 text-center mb-2">
                            هل أنت متأكد من حذف هذا النطاق؟
                        </h3>
                        <p className="text-slate-500 text-center mb-6">
                            سيتم حذف النطاق "{zone.name}" نهائياً ولا يمكن استرجاعه.
                        </p>
                        <div className="flex gap-3 justify-center">
                            <Button
                                variant="outline"
                                onClick={() => setShowDeleteConfirm(false)}
                                className="px-6 rounded-xl"
                            >
                                إلغاء
                            </Button>
                            <Button
                                onClick={() => {
                                    setShowDeleteConfirm(false)
                                    handleDelete()
                                }}
                                disabled={deleteZoneMutation.isPending}
                                className="px-6 rounded-xl bg-red-500 hover:bg-red-600 text-white"
                            >
                                {deleteZoneMutation.isPending ? (
                                    <Loader2 className="h-4 w-4 animate-spin ms-2" />
                                ) : (
                                    <Trash2 className="h-4 w-4 ms-2" aria-hidden="true" />
                                )}
                                حذف النطاق
                            </Button>
                        </div>
                    </div>
                </div>
            )}
        </>
    )
}
