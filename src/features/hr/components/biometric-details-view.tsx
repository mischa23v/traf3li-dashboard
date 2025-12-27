import { useState, useMemo } from 'react'
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
import {
    Search, Bell, AlertCircle, Fingerprint, MapPin, Network,
    Server, Loader2, Trash2, AlertTriangle, Clock, Activity,
    Calendar, Users
} from 'lucide-react'
import { format } from 'date-fns'
import { arSA } from 'date-fns/locale'

// Mock data for demonstration
const MOCK_DEVICE = {
    _id: '1',
    deviceName: 'Main Entrance Device',
    deviceNameAr: 'جهاز المدخل الرئيسي',
    deviceType: 'fingerprint' as const,
    serialNumber: 'SN123456789',
    manufacturer: 'ZKTeco',
    model: 'K40',
    location: 'Main Entrance - First Floor',
    locationAr: 'المدخل الرئيسي - الطابق الأول',
    ipAddress: '192.168.1.100',
    port: '4370',
    status: 'active' as const,
    isOnline: true,
    notes: 'Device installed on Jan 15, 2024',
    lastSync: '2024-01-20T10:30:00',
    enrolledUsers: 45,
    totalRecords: 12543,
    createdAt: '2024-01-15T08:00:00',
}

export function BiometricDetailsView() {
    const { deviceId } = useParams({ strict: false }) as { deviceId: string }
    const navigate = useNavigate()
    const [activeTab, setActiveTab] = useState('overview')
    const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)

    // Mock loading/error states
    const [isLoading] = useState(false)
    const [isError] = useState(false)
    const [isDeletePending] = useState(false)

    // Use mock data for now
    const device = MOCK_DEVICE

    // Format date helper
    const formatDate = (dateString: string | undefined | null) => {
        if (!dateString) return 'غير محدد'
        return format(new Date(dateString), 'd MMMM yyyy', { locale: arSA })
    }

    const formatDateTime = (dateString: string | undefined | null) => {
        if (!dateString) return 'غير محدد'
        return format(new Date(dateString), 'd MMMM yyyy - h:mm a', { locale: arSA })
    }

    // Status badge styling
    const getStatusBadge = (status: 'active' | 'inactive' | 'maintenance') => {
        const styles = {
            active: 'bg-emerald-100 text-emerald-700 border-emerald-200',
            inactive: 'bg-red-100 text-red-700 border-red-200',
            maintenance: 'bg-amber-100 text-amber-700 border-amber-200',
        }
        const labels = {
            active: 'نشط',
            inactive: 'غير نشط',
            maintenance: 'صيانة',
        }
        return <Badge className={`${styles[status]} border-0 rounded-md px-3 py-1`}>{labels[status]}</Badge>
    }

    // Device type label
    const getTypeLabel = (type: string) => {
        const labels: Record<string, string> = {
            fingerprint: 'بصمة الإصبع',
            face_recognition: 'التعرف على الوجه',
            card_reader: 'قارئ البطاقات',
            hybrid: 'هجين',
        }
        return labels[type] || type
    }

    // Handle delete
    const handleDelete = () => {
        // TODO: Replace with actual API call
        setTimeout(() => {
            navigate({ to: ROUTES.dashboard.hr.biometric.list })
        }, 1000)
    }

    const topNav = [
        { title: 'نظرة عامة', href: ROUTES.dashboard.overview, isActive: false },
        { title: 'البصمة', href: ROUTES.dashboard.hr.biometric.list, isActive: true },
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
                        <h3 className="text-lg font-bold text-slate-900 mb-2">حدث خطأ أثناء تحميل بيانات الجهاز</h3>
                        <p className="text-slate-500 mb-4">تعذر الاتصال بالخادم</p>
                        <Button className="bg-emerald-500 hover:bg-emerald-600">
                            إعادة المحاولة
                        </Button>
                    </div>
                )}

                {/* Empty State */}
                {!isLoading && !isError && !device && (
                    <div className="bg-white rounded-2xl p-12 border border-slate-100 text-center">
                        <div className="flex justify-center mb-4">
                            <div className="w-16 h-16 rounded-full bg-emerald-50 flex items-center justify-center">
                                <Fingerprint className="w-8 h-8 text-emerald-500" aria-hidden="true" />
                            </div>
                        </div>
                        <h3 className="text-lg font-bold text-slate-900 mb-2">الجهاز غير موجود</h3>
                        <p className="text-slate-500 mb-4">لم يتم العثور على الجهاز المطلوب</p>
                        <Button asChild className="bg-emerald-500 hover:bg-emerald-600">
                            <Link to={ROUTES.dashboard.hr.biometric.list}>
                                العودة إلى القائمة
                            </Link>
                        </Button>
                    </div>
                )}

                {/* Success State */}
                {!isLoading && !isError && device && (
                    <>
                        {/* HERO CARD */}
                        <ProductivityHero
                            badge="الموارد البشرية"
                            title={device.deviceNameAr}
                            type="biometric"
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
                                                {['overview', 'network', 'activity', 'users'].map((tab) => (
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
                                                            tab === 'network' ? 'الشبكة' :
                                                            tab === 'activity' ? 'النشاط' : 'المستخدمين'}
                                                    </TabsTrigger>
                                                ))}
                                            </TabsList>
                                        </div>

                                        <div className="p-4 sm:p-6 bg-slate-50/50 min-h-[400px] sm:min-h-[500px]">
                                            {/* Overview Tab */}
                                            <TabsContent value="overview" className="mt-0 space-y-6">
                                                {/* Device Header Card */}
                                                <Card className="border-none shadow-sm bg-white rounded-2xl overflow-hidden">
                                                    <CardContent className="p-6">
                                                        <div className="flex gap-6 items-start">
                                                            <div className="w-20 h-20 rounded-2xl bg-emerald-100 flex items-center justify-center text-emerald-600">
                                                                <Fingerprint className="w-10 h-10" />
                                                            </div>
                                                            <div className="flex-1">
                                                                <div className="flex items-center gap-3 mb-2">
                                                                    <h2 className="text-2xl font-bold text-navy">{device.deviceNameAr}</h2>
                                                                    {getStatusBadge(device.status)}
                                                                    {device.isOnline && (
                                                                        <Badge className="bg-green-100 text-green-700 flex items-center gap-1">
                                                                            <Activity className="w-3 h-3" />
                                                                            متصل
                                                                        </Badge>
                                                                    )}
                                                                </div>
                                                                {device.deviceName && (
                                                                    <p className="text-slate-500 mb-2" dir="ltr">{device.deviceName}</p>
                                                                )}
                                                                <p className="text-lg text-slate-600">
                                                                    {getTypeLabel(device.deviceType)}
                                                                </p>
                                                                <p className="text-sm text-slate-600 mt-1">
                                                                    الرقم التسلسلي: {device.serialNumber}
                                                                </p>
                                                            </div>
                                                        </div>
                                                    </CardContent>
                                                </Card>

                                                {/* Device Info & Location */}
                                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                                    <Card className="border-none shadow-sm bg-white rounded-2xl overflow-hidden">
                                                        <CardHeader className="pb-3">
                                                            <CardTitle className="text-base font-bold text-navy flex items-center gap-2">
                                                                <Server className="w-4 h-4 text-emerald-600" aria-hidden="true" />
                                                                معلومات الجهاز
                                                            </CardTitle>
                                                        </CardHeader>
                                                        <CardContent className="space-y-3">
                                                            <div className="flex justify-between text-sm">
                                                                <span className="text-slate-500">الشركة المصنعة</span>
                                                                <span className="font-medium text-slate-900">{device.manufacturer || 'غير محدد'}</span>
                                                            </div>
                                                            <div className="flex justify-between text-sm">
                                                                <span className="text-slate-500">الموديل</span>
                                                                <span className="font-medium text-slate-900">{device.model || 'غير محدد'}</span>
                                                            </div>
                                                            <div className="flex justify-between text-sm">
                                                                <span className="text-slate-500">الرقم التسلسلي</span>
                                                                <span className="font-medium text-slate-900" dir="ltr">{device.serialNumber}</span>
                                                            </div>
                                                            <div className="flex justify-between text-sm">
                                                                <span className="text-slate-500">نوع الجهاز</span>
                                                                <span className="font-medium text-slate-900">{getTypeLabel(device.deviceType)}</span>
                                                            </div>
                                                        </CardContent>
                                                    </Card>

                                                    <Card className="border-none shadow-sm bg-white rounded-2xl overflow-hidden">
                                                        <CardHeader className="pb-3">
                                                            <CardTitle className="text-base font-bold text-navy flex items-center gap-2">
                                                                <MapPin className="w-4 h-4 text-blue-600" aria-hidden="true" />
                                                                معلومات الموقع
                                                            </CardTitle>
                                                        </CardHeader>
                                                        <CardContent className="space-y-3">
                                                            <div className="flex justify-between text-sm">
                                                                <span className="text-slate-500">الموقع</span>
                                                                <span className="font-medium text-slate-900">{device.locationAr || 'غير محدد'}</span>
                                                            </div>
                                                            {device.location && (
                                                                <div className="flex justify-between text-sm">
                                                                    <span className="text-slate-500">Location</span>
                                                                    <span className="font-medium text-slate-900" dir="ltr">{device.location}</span>
                                                                </div>
                                                            )}
                                                            <div className="flex justify-between text-sm">
                                                                <span className="text-slate-500">تاريخ التثبيت</span>
                                                                <span className="font-medium text-slate-900">{formatDate(device.createdAt)}</span>
                                                            </div>
                                                        </CardContent>
                                                    </Card>
                                                </div>

                                                {/* Statistics */}
                                                <Card className="border-none shadow-sm bg-white rounded-2xl overflow-hidden">
                                                    <CardHeader className="pb-3">
                                                        <CardTitle className="text-base font-bold text-navy flex items-center gap-2">
                                                            <Activity className="w-4 h-4 text-purple-600" />
                                                            إحصائيات
                                                        </CardTitle>
                                                    </CardHeader>
                                                    <CardContent>
                                                        <div className="grid grid-cols-3 gap-4 text-center">
                                                            <div className="bg-blue-50 rounded-xl p-4">
                                                                <div className="text-2xl font-bold text-blue-700">{device.enrolledUsers}</div>
                                                                <div className="text-xs text-blue-600">مستخدم مسجل</div>
                                                            </div>
                                                            <div className="bg-emerald-50 rounded-xl p-4">
                                                                <div className="text-2xl font-bold text-emerald-700">{device.totalRecords.toLocaleString('ar-SA')}</div>
                                                                <div className="text-xs text-emerald-600">سجل إجمالي</div>
                                                            </div>
                                                            <div className="bg-purple-50 rounded-xl p-4">
                                                                <div className="text-2xl font-bold text-purple-700">
                                                                    {device.isOnline ? 'متصل' : 'غير متصل'}
                                                                </div>
                                                                <div className="text-xs text-purple-600">حالة الاتصال</div>
                                                            </div>
                                                        </div>
                                                    </CardContent>
                                                </Card>

                                                {/* Notes */}
                                                {device.notes && (
                                                    <Card className="border-none shadow-sm bg-amber-50 rounded-2xl overflow-hidden border border-amber-100">
                                                        <CardContent className="p-4">
                                                            <div className="flex items-start gap-3">
                                                                <AlertCircle className="w-5 h-5 text-amber-600 mt-0.5" aria-hidden="true" />
                                                                <div>
                                                                    <span className="font-bold text-amber-800">ملاحظات</span>
                                                                    <p className="text-sm text-amber-700 mt-1">{device.notes}</p>
                                                                </div>
                                                            </div>
                                                        </CardContent>
                                                    </Card>
                                                )}
                                            </TabsContent>

                                            {/* Network Tab */}
                                            <TabsContent value="network" className="mt-0 space-y-6">
                                                <Card className="border-none shadow-sm bg-white rounded-2xl overflow-hidden">
                                                    <CardHeader className="pb-3">
                                                        <CardTitle className="text-base font-bold text-navy flex items-center gap-2">
                                                            <Network className="w-4 h-4 text-purple-600" aria-hidden="true" />
                                                            إعدادات الشبكة
                                                        </CardTitle>
                                                    </CardHeader>
                                                    <CardContent className="space-y-4">
                                                        <div className="grid grid-cols-2 gap-4">
                                                            <div>
                                                                <span className="text-sm text-slate-500 block">عنوان IP</span>
                                                                <span className="font-medium text-slate-900" dir="ltr">{device.ipAddress}</span>
                                                            </div>
                                                            <div>
                                                                <span className="text-sm text-slate-500 block">المنفذ (Port)</span>
                                                                <span className="font-medium text-slate-900" dir="ltr">{device.port}</span>
                                                            </div>
                                                            <div>
                                                                <span className="text-sm text-slate-500 block">حالة الاتصال</span>
                                                                <Badge className={device.isOnline ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}>
                                                                    {device.isOnline ? 'متصل' : 'غير متصل'}
                                                                </Badge>
                                                            </div>
                                                            <div>
                                                                <span className="text-sm text-slate-500 block">آخر مزامنة</span>
                                                                <span className="font-medium text-slate-900">{formatDateTime(device.lastSync)}</span>
                                                            </div>
                                                        </div>
                                                    </CardContent>
                                                </Card>
                                            </TabsContent>

                                            {/* Activity Tab */}
                                            <TabsContent value="activity" className="mt-0 space-y-6">
                                                <Card className="border-none shadow-sm bg-white rounded-2xl overflow-hidden">
                                                    <CardContent className="p-6">
                                                        <div className="text-center py-8 text-slate-500">
                                                            <Clock className="w-12 h-12 mx-auto mb-3 opacity-30" aria-hidden="true" />
                                                            <p>لا توجد سجلات نشاط حديثة</p>
                                                        </div>
                                                    </CardContent>
                                                </Card>
                                            </TabsContent>

                                            {/* Users Tab */}
                                            <TabsContent value="users" className="mt-0 space-y-6">
                                                <Card className="border-none shadow-sm bg-white rounded-2xl overflow-hidden">
                                                    <CardContent className="p-6">
                                                        <div className="text-center py-8 text-slate-500">
                                                            <Users className="w-12 h-12 mx-auto mb-3 opacity-30" aria-hidden="true" />
                                                            <p>عدد المستخدمين المسجلين: {device.enrolledUsers}</p>
                                                        </div>
                                                    </CardContent>
                                                </Card>
                                            </TabsContent>
                                        </div>
                                    </Tabs>
                                </Card>
                            </div>

                            {/* LEFT SIDEBAR - Quick Actions */}
                            <HRSidebar
                                context="biometric"
                                deviceId={deviceId}
                                onDeleteDevice={() => setShowDeleteConfirm(true)}
                                isDeletePending={isDeletePending}
                            />
                        </div>
                    </>
                )}
            </Main>

            {/* Delete Confirmation Dialog */}
            {showDeleteConfirm && device && (
                <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
                    <div className="bg-white rounded-2xl p-6 max-w-md w-full shadow-xl">
                        <div className="flex justify-center mb-4">
                            <div className="w-16 h-16 rounded-full bg-red-50 flex items-center justify-center">
                                <AlertTriangle className="w-8 h-8 text-red-500" aria-hidden="true" />
                            </div>
                        </div>
                        <h3 className="text-lg font-bold text-slate-900 text-center mb-2">
                            هل أنت متأكد من حذف هذا الجهاز؟
                        </h3>
                        <p className="text-slate-500 text-center mb-6">
                            سيتم حذف الجهاز "{device.deviceNameAr}" نهائياً ولا يمكن استرجاعه.
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
                                disabled={isDeletePending}
                                className="px-6 rounded-xl bg-red-500 hover:bg-red-600 text-white"
                            >
                                {isDeletePending ? (
                                    <Loader2 className="h-4 w-4 animate-spin ms-2" />
                                ) : (
                                    <Trash2 className="h-4 w-4 ms-2" aria-hidden="true" />
                                )}
                                حذف الجهاز
                            </Button>
                        </div>
                    </div>
                </div>
            )}
        </>
    )
}
