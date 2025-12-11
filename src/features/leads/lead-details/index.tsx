import { useState } from 'react'
import { Link, getRouteApi, useNavigate } from '@tanstack/react-router'
import { useTranslation } from 'react-i18next'
import { format } from 'date-fns'
import { arSA, enUS } from 'date-fns/locale'
import {
    Phone, Mail, Building2, MapPin, Calendar, FileText,
    Edit, Trash2, Search, Bell, AlertCircle, TrendingUp,
    ArrowUpRight, Target, DollarSign, Clock, User, Loader2,
    ArrowRight, CheckCircle
} from 'lucide-react'
import { Header } from '@/components/layout/header'
import { Main } from '@/components/layout/main'
import { TopNav } from '@/components/layout/top-nav'
import { DynamicIsland } from '@/components/dynamic-island'
import { LanguageSwitcher } from '@/components/language-switcher'
import { ThemeSwitch } from '@/components/theme-switch'
import { ConfigDrawer } from '@/components/config-drawer'
import { ProfileDropdown } from '@/components/profile-dropdown'
import { ProductivityHero } from '@/components/productivity-hero'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { useLead, useDeleteLead, useConvertLead } from '@/hooks/useCrm'
import { SalesSidebar } from '@/features/crm/components/sales-sidebar'
import { cn } from '@/lib/utils'

const route = getRouteApi('/_authenticated/dashboard/crm/leads/$leadId')

// Status options
const LEAD_STATUSES = [
    { value: 'new', label: 'جديد', color: 'bg-blue-100 text-blue-700' },
    { value: 'contacted', label: 'تم التواصل', color: 'bg-purple-100 text-purple-700' },
    { value: 'qualified', label: 'مؤهل', color: 'bg-emerald-100 text-emerald-700' },
    { value: 'proposal', label: 'عرض سعر', color: 'bg-orange-100 text-orange-700' },
    { value: 'negotiation', label: 'تفاوض', color: 'bg-yellow-100 text-yellow-700' },
    { value: 'won', label: 'تم الكسب', color: 'bg-green-100 text-green-700' },
    { value: 'lost', label: 'خسارة', color: 'bg-red-100 text-red-700' },
]

export function LeadDetails() {
    const { t, i18n } = useTranslation()
    const isRTL = i18n.language === 'ar'
    const dateLocale = isRTL ? arSA : enUS
    const { leadId } = route.useParams()
    const navigate = useNavigate()
    const [activeTab, setActiveTab] = useState('overview')
    const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)

    const { data, isLoading, isError, error, refetch } = useLead(leadId)
    const deleteLeadMutation = useDeleteLead()
    const convertLeadMutation = useConvertLead()

    const lead = data?.lead

    const topNav = [
        { title: 'نظرة عامة', href: '/dashboard/overview', isActive: false },
        { title: 'العملاء المحتملين', href: '/dashboard/crm/leads', isActive: true },
        { title: 'خط المبيعات', href: '/dashboard/crm/pipeline', isActive: false },
        { title: 'العملاء', href: '/dashboard/clients', isActive: false },
    ]

    const handleDelete = () => {
        deleteLeadMutation.mutate(leadId, {
            onSuccess: () => navigate({ to: '/dashboard/crm/leads' }),
        })
    }

    const handleConvert = () => {
        convertLeadMutation.mutate(leadId, {
            onSuccess: () => navigate({ to: '/dashboard/clients' }),
        })
    }

    const getStatusColor = (status: string) => {
        const statusObj = LEAD_STATUSES.find(s => s.value === status)
        return statusObj?.color || 'bg-slate-100 text-slate-700'
    }

    const getStatusLabel = (status: string) => {
        const statusObj = LEAD_STATUSES.find(s => s.value === status)
        return statusObj?.label || status
    }

    return (
        <>
            {/* Header */}
            <Header className="bg-navy shadow-none relative">
                <TopNav links={topNav} className="[&>a]:text-slate-300 [&>a:hover]:text-white [&>a[aria-current='page']]:text-white" />
                <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 z-50">
                    <DynamicIsland />
                </div>
                <div className="ms-auto flex items-center gap-2 sm:gap-4 overflow-x-auto min-w-0">
                    <div className="relative hidden md:block min-w-0">
                        <Search className="absolute end-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-500" />
                        <input
                            type="text"
                            placeholder="بحث..."
                            className="h-9 w-64 rounded-xl border border-white/10 bg-white/5 pe-9 ps-4 text-sm text-white placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/50"
                        />
                    </div>
                    <Button variant="ghost" size="icon" className="relative rounded-full text-slate-300 hover:bg-white/10 hover:text-white flex-shrink-0">
                        <Bell className="h-5 w-5" />
                        <span className="absolute top-2 end-2 h-2 w-2 bg-red-500 rounded-full border border-navy"></span>
                    </Button>
                    <LanguageSwitcher className="text-slate-300 hover:bg-white/10 hover:text-white flex-shrink-0" />
                    <ThemeSwitch className="text-slate-300 hover:bg-white/10 hover:text-white hidden sm:flex flex-shrink-0" />
                    <ConfigDrawer className="text-slate-300 hover:bg-white/10 hover:text-white hidden lg:flex flex-shrink-0" />
                    <ProfileDropdown className="text-slate-300 hover:bg-white/10 hover:text-white flex-shrink-0" />
                </div>
                <div className="absolute bottom-0 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-emerald-500/50 to-transparent"></div>
            </Header>

            {/* Main Content */}
            <Main fluid={true} className="bg-[#f8f9fa] flex-1 w-full p-4 sm:p-6 lg:p-8 space-y-6 rounded-tr-3xl shadow-inner border-e border-white/5 overflow-hidden font-['IBM_Plex_Sans_Arabic']">

                {/* Hero Card - Always visible */}
                <div className="hidden md:block">
                    <ProductivityHero
                        badge="إدارة المبيعات"
                        title={lead ? (lead.displayName || `${lead.firstName || ''} ${lead.lastName || ''}`.trim() || 'عميل محتمل') : 'تفاصيل العميل المحتمل'}
                        type="leads"
                        listMode={true}
                    />
                </div>

                {/* Loading State */}
                {isLoading && (
                    <div className="space-y-6">
                        <Skeleton className="h-32 w-full rounded-2xl" />
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
                                <AlertCircle className="w-8 h-8 text-red-500" />
                            </div>
                        </div>
                        <h3 className="text-lg font-bold text-slate-900 mb-2">لم يتم العثور على العميل المحتمل</h3>
                        <p className="text-slate-500 mb-4">{error?.message || 'حدث خطأ أثناء تحميل البيانات'}</p>
                        <div className="flex gap-3 justify-center">
                            <Button onClick={() => refetch()} className="bg-emerald-500 hover:bg-emerald-600">
                                إعادة المحاولة
                            </Button>
                            <Button variant="outline" asChild>
                                <Link to="/dashboard/crm/leads">العودة للقائمة</Link>
                            </Button>
                        </div>
                    </div>
                )}

                {/* Success State */}
                {!isLoading && !isError && lead && (
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                        {/* Main Content (col-span-2) */}
                        <div className="lg:col-span-2 space-y-4">

                            {/* Back Link */}
                            <Link to="/dashboard/crm/leads" className="flex items-center gap-3 p-4 bg-white rounded-2xl shadow-sm border border-slate-100 hover:border-emerald-200 hover:shadow-md transition-all group">
                                <div className="w-10 h-10 rounded-xl bg-slate-100 group-hover:bg-emerald-100 flex items-center justify-center transition-colors">
                                    <ArrowRight className="w-5 h-5 text-slate-500 group-hover:text-emerald-600 transition-colors" />
                                </div>
                                <span className="text-base font-medium text-slate-700 group-hover:text-emerald-700 transition-colors">العودة لقائمة العملاء المحتملين</span>
                            </Link>

                            {/* Lead Header Card */}
                            <div className="bg-white rounded-2xl p-6 border border-slate-100 shadow-sm">
                                <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                                    <div className="flex items-center gap-4">
                                        <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center text-white shadow-lg shadow-emerald-500/20">
                                            <TrendingUp className="h-8 w-8" />
                                        </div>
                                        <div>
                                            <div className="flex items-center gap-3 mb-1">
                                                <h2 className="text-xl font-bold text-navy">
                                                    {lead.displayName || `${lead.firstName || ''} ${lead.lastName || ''}`.trim() || 'غير محدد'}
                                                </h2>
                                                <Badge className={cn('border-0', getStatusColor(lead.status))}>
                                                    {getStatusLabel(lead.status)}
                                                </Badge>
                                                {lead.convertedToClient && (
                                                    <Badge className="bg-green-100 text-green-700 border-0">
                                                        <CheckCircle className="w-3 h-3 ms-1" />
                                                        تم التحويل
                                                    </Badge>
                                                )}
                                            </div>
                                            <p className="text-slate-500 text-sm">
                                                {lead.createdAt && (
                                                    <>
                                                        <Calendar className="h-3 w-3 inline ms-1" />
                                                        {format(new Date(lead.createdAt), 'PPP', { locale: dateLocale })}
                                                    </>
                                                )}
                                            </p>
                                        </div>
                                    </div>
                                    <div className="flex gap-2 flex-wrap">
                                        {!lead.convertedToClient && (
                                            <Button
                                                onClick={handleConvert}
                                                disabled={convertLeadMutation.isPending}
                                                className="bg-emerald-500 hover:bg-emerald-600 text-white rounded-xl shadow-lg shadow-emerald-500/20"
                                            >
                                                {convertLeadMutation.isPending ? (
                                                    <Loader2 className="ms-2 h-4 w-4 animate-spin" />
                                                ) : (
                                                    <ArrowUpRight className="ms-2 h-4 w-4" />
                                                )}
                                                تحويل لعميل
                                            </Button>
                                        )}
                                        {!showDeleteConfirm ? (
                                            <Button
                                                variant="outline"
                                                size="sm"
                                                onClick={() => setShowDeleteConfirm(true)}
                                                className="rounded-xl text-red-600 hover:bg-red-50 hover:text-red-700 border-red-200"
                                            >
                                                <Trash2 className="h-4 w-4" />
                                            </Button>
                                        ) : (
                                            <div className="flex gap-2">
                                                <Button variant="outline" size="sm" onClick={() => setShowDeleteConfirm(false)} className="rounded-xl">
                                                    إلغاء
                                                </Button>
                                                <Button
                                                    variant="destructive"
                                                    size="sm"
                                                    onClick={handleDelete}
                                                    disabled={deleteLeadMutation.isPending}
                                                    className="rounded-xl"
                                                >
                                                    {deleteLeadMutation.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : 'تأكيد الحذف'}
                                                </Button>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>

                            {/* Summary Cards */}
                            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                                <div className="bg-white rounded-2xl p-5 border border-slate-100 shadow-sm">
                                    <div className="flex items-center justify-between mb-3">
                                        <span className="text-sm text-slate-500">القيمة المتوقعة</span>
                                        <div className="w-10 h-10 rounded-xl bg-emerald-50 flex items-center justify-center">
                                            <DollarSign className="h-5 w-5 text-emerald-600" />
                                        </div>
                                    </div>
                                    <p className="text-2xl font-bold text-emerald-600">
                                        {(lead.estimatedValue || 0).toLocaleString()} <span className="text-sm font-normal">ر.س</span>
                                    </p>
                                </div>

                                <div className="bg-white rounded-2xl p-5 border border-slate-100 shadow-sm">
                                    <div className="flex items-center justify-between mb-3">
                                        <span className="text-sm text-slate-500">الاحتمالية</span>
                                        <div className="w-10 h-10 rounded-xl bg-blue-50 flex items-center justify-center">
                                            <Target className="h-5 w-5 text-blue-600" />
                                        </div>
                                    </div>
                                    <p className="text-2xl font-bold text-slate-900">{lead.probability || 0}%</p>
                                </div>

                                <div className="bg-white rounded-2xl p-5 border border-slate-100 shadow-sm">
                                    <div className="flex items-center justify-between mb-3">
                                        <span className="text-sm text-slate-500">أيام منذ الإنشاء</span>
                                        <div className="w-10 h-10 rounded-xl bg-amber-50 flex items-center justify-center">
                                            <Clock className="h-5 w-5 text-amber-600" />
                                        </div>
                                    </div>
                                    <p className="text-2xl font-bold text-slate-900">{lead.daysSinceCreated || 0}</p>
                                </div>

                                <div className="bg-white rounded-2xl p-5 border border-slate-100 shadow-sm">
                                    <div className="flex items-center justify-between mb-3">
                                        <span className="text-sm text-slate-500">عدد الأنشطة</span>
                                        <div className="w-10 h-10 rounded-xl bg-purple-50 flex items-center justify-center">
                                            <FileText className="h-5 w-5 text-purple-600" />
                                        </div>
                                    </div>
                                    <p className="text-2xl font-bold text-slate-900">{lead.activityCount || 0}</p>
                                </div>
                            </div>

                            {/* Tabs Card */}
                            <Card className="border border-slate-100 shadow-sm rounded-2xl overflow-hidden min-h-[400px]">
                                <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
                                    <div className="border-b border-slate-100 px-4 sm:px-6 py-4">
                                        <TabsList className="inline-flex h-10 items-center justify-center rounded-lg bg-slate-100 p-1 text-slate-500 w-full sm:w-auto">
                                            {['overview', 'intake', 'qualification', 'notes'].map((tab) => (
                                                <TabsTrigger
                                                    key={tab}
                                                    value={tab}
                                                    className="inline-flex items-center justify-center whitespace-nowrap rounded-md px-3 sm:px-4 py-2 text-sm font-medium ring-offset-white transition-all focus-visible:outline-none data-[state=active]:bg-emerald-950 data-[state=active]:text-white data-[state=active]:shadow-sm data-[state=inactive]:hover:bg-slate-200 flex-1 sm:flex-initial"
                                                >
                                                    {tab === 'overview' ? 'نظرة عامة' :
                                                     tab === 'intake' ? 'بيانات الاستلام' :
                                                     tab === 'qualification' ? 'التأهيل' :
                                                     'الملاحظات'}
                                                </TabsTrigger>
                                            ))}
                                        </TabsList>
                                    </div>

                                    <div className="p-4 sm:p-6 bg-slate-50/50 min-h-[300px]">
                                        {/* Overview Tab */}
                                        <TabsContent value="overview" className="mt-0 space-y-6">
                                            <Card className="border-none shadow-sm bg-white rounded-2xl overflow-hidden">
                                                <CardHeader className="pb-3">
                                                    <CardTitle className="text-base font-bold text-navy flex items-center gap-2">
                                                        <Phone className="w-4 h-4 text-emerald-600" />
                                                        معلومات الاتصال
                                                    </CardTitle>
                                                </CardHeader>
                                                <CardContent className="space-y-4">
                                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                                        {lead.phone && (
                                                            <div className="flex items-center gap-3 p-3 rounded-xl bg-slate-50">
                                                                <div className="w-10 h-10 rounded-lg bg-emerald-100 flex items-center justify-center">
                                                                    <Phone className="h-5 w-5 text-emerald-600" />
                                                                </div>
                                                                <div>
                                                                    <p className="text-xs text-slate-500">الهاتف</p>
                                                                    <p className="font-medium text-slate-900" dir="ltr">{lead.phone}</p>
                                                                </div>
                                                            </div>
                                                        )}
                                                        {lead.email && (
                                                            <div className="flex items-center gap-3 p-3 rounded-xl bg-slate-50">
                                                                <div className="w-10 h-10 rounded-lg bg-blue-100 flex items-center justify-center">
                                                                    <Mail className="h-5 w-5 text-blue-600" />
                                                                </div>
                                                                <div>
                                                                    <p className="text-xs text-slate-500">البريد الإلكتروني</p>
                                                                    <p className="font-medium text-slate-900" dir="ltr">{lead.email}</p>
                                                                </div>
                                                            </div>
                                                        )}
                                                    </div>
                                                </CardContent>
                                            </Card>

                                            {/* Organization/Contact Links */}
                                            {(lead.organizationId || lead.contactId) && (
                                                <Card className="border-none shadow-sm bg-white rounded-2xl overflow-hidden">
                                                    <CardHeader className="pb-3">
                                                        <CardTitle className="text-base font-bold text-navy flex items-center gap-2">
                                                            <Building2 className="w-4 h-4 text-emerald-600" />
                                                            السجلات المرتبطة
                                                        </CardTitle>
                                                    </CardHeader>
                                                    <CardContent className="space-y-4">
                                                        {lead.organizationId && typeof lead.organizationId === 'object' && (
                                                            <div className="p-4 bg-emerald-50 rounded-xl border border-emerald-100">
                                                                <div className="flex items-center gap-3">
                                                                    <Building2 className="h-5 w-5 text-emerald-600" />
                                                                    <div>
                                                                        <p className="text-xs text-emerald-600">المنشأة المرتبطة</p>
                                                                        <p className="font-bold text-navy">{lead.organizationId.legalName}</p>
                                                                    </div>
                                                                </div>
                                                            </div>
                                                        )}
                                                        {lead.contactId && typeof lead.contactId === 'object' && (
                                                            <div className="p-4 bg-blue-50 rounded-xl border border-blue-100">
                                                                <div className="flex items-center gap-3">
                                                                    <User className="h-5 w-5 text-blue-600" />
                                                                    <div>
                                                                        <p className="text-xs text-blue-600">جهة الاتصال المرتبطة</p>
                                                                        <p className="font-bold text-navy">{lead.contactId.firstName} {lead.contactId.lastName || ''}</p>
                                                                    </div>
                                                                </div>
                                                            </div>
                                                        )}
                                                    </CardContent>
                                                </Card>
                                            )}

                                            {/* Address */}
                                            {lead.address && (
                                                <Card className="border-none shadow-sm bg-white rounded-2xl overflow-hidden">
                                                    <CardHeader className="pb-3">
                                                        <CardTitle className="text-base font-bold text-navy flex items-center gap-2">
                                                            <MapPin className="w-4 h-4 text-red-600" />
                                                            العنوان
                                                        </CardTitle>
                                                    </CardHeader>
                                                    <CardContent>
                                                        <p className="text-slate-600">
                                                            {[lead.address.street, lead.address.city, lead.address.postalCode, lead.address.country]
                                                                .filter(Boolean)
                                                                .join('، ') || 'غير محدد'}
                                                        </p>
                                                    </CardContent>
                                                </Card>
                                            )}
                                        </TabsContent>

                                        {/* Intake Tab */}
                                        <TabsContent value="intake" className="mt-0 space-y-6">
                                            <Card className="border-none shadow-sm bg-white rounded-2xl overflow-hidden">
                                                <CardHeader className="pb-3">
                                                    <CardTitle className="text-base font-bold text-navy">تفاصيل الاستلام</CardTitle>
                                                </CardHeader>
                                                <CardContent className="space-y-4">
                                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                                        <div className="p-4 bg-slate-50 rounded-xl">
                                                            <p className="text-xs text-slate-500 mb-1">نوع القضية</p>
                                                            <p className="font-medium text-navy">{lead.intake?.caseType || 'غير محدد'}</p>
                                                        </div>
                                                        <div className="p-4 bg-slate-50 rounded-xl">
                                                            <p className="text-xs text-slate-500 mb-1">الأولوية</p>
                                                            <p className="font-medium text-navy">{lead.intake?.urgency || 'غير محدد'}</p>
                                                        </div>
                                                    </div>
                                                    {lead.intake?.caseDescription && (
                                                        <div className="p-4 bg-slate-50 rounded-xl">
                                                            <p className="text-xs text-slate-500 mb-2">وصف القضية</p>
                                                            <p className="text-slate-600">{lead.intake.caseDescription}</p>
                                                        </div>
                                                    )}
                                                </CardContent>
                                            </Card>
                                        </TabsContent>

                                        {/* Qualification Tab */}
                                        <TabsContent value="qualification" className="mt-0 space-y-6">
                                            <Card className="border-none shadow-sm bg-white rounded-2xl overflow-hidden">
                                                <CardHeader className="pb-3">
                                                    <CardTitle className="text-base font-bold text-navy">معايير التأهيل (BANT)</CardTitle>
                                                </CardHeader>
                                                <CardContent>
                                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                                        <div className="p-4 bg-slate-50 rounded-xl">
                                                            <p className="text-xs text-slate-500 mb-1">الميزانية</p>
                                                            <p className="font-medium text-navy">{lead.qualification?.budget || 'غير محدد'}</p>
                                                        </div>
                                                        <div className="p-4 bg-slate-50 rounded-xl">
                                                            <p className="text-xs text-slate-500 mb-1">صلاحية القرار</p>
                                                            <p className="font-medium text-navy">{lead.qualification?.authority || 'غير محدد'}</p>
                                                        </div>
                                                        <div className="p-4 bg-slate-50 rounded-xl">
                                                            <p className="text-xs text-slate-500 mb-1">الحاجة</p>
                                                            <p className="font-medium text-navy">{lead.qualification?.need || 'غير محدد'}</p>
                                                        </div>
                                                        <div className="p-4 bg-slate-50 rounded-xl">
                                                            <p className="text-xs text-slate-500 mb-1">الجدول الزمني</p>
                                                            <p className="font-medium text-navy">{lead.qualification?.timeline || 'غير محدد'}</p>
                                                        </div>
                                                    </div>
                                                </CardContent>
                                            </Card>
                                        </TabsContent>

                                        {/* Notes Tab */}
                                        <TabsContent value="notes" className="mt-0 space-y-6">
                                            <Card className="border-none shadow-sm bg-white rounded-2xl overflow-hidden">
                                                <CardHeader className="pb-3">
                                                    <CardTitle className="text-base font-bold text-navy flex items-center gap-2">
                                                        <FileText className="w-4 h-4 text-slate-600" />
                                                        الملاحظات
                                                    </CardTitle>
                                                </CardHeader>
                                                <CardContent>
                                                    <p className="text-sm text-slate-600 whitespace-pre-wrap leading-relaxed">
                                                        {lead.notes || 'لا توجد ملاحظات'}
                                                    </p>
                                                </CardContent>
                                            </Card>

                                            {lead.tags && lead.tags.length > 0 && (
                                                <Card className="border-none shadow-sm bg-white rounded-2xl overflow-hidden">
                                                    <CardHeader className="pb-3">
                                                        <CardTitle className="text-base font-bold text-navy">الوسوم</CardTitle>
                                                    </CardHeader>
                                                    <CardContent>
                                                        <div className="flex flex-wrap gap-2">
                                                            {lead.tags.map((tag: string, i: number) => (
                                                                <Badge key={i} variant="secondary" className="rounded-full">
                                                                    {tag}
                                                                </Badge>
                                                            ))}
                                                        </div>
                                                    </CardContent>
                                                </Card>
                                            )}
                                        </TabsContent>
                                    </div>
                                </Tabs>
                            </Card>
                        </div>

                        {/* Sidebar (col-span-1) */}
                        <div className="hidden lg:block">
                            <SalesSidebar context="leads" leadId={leadId} />
                        </div>
                    </div>
                )}
            </Main>
        </>
    )
}
