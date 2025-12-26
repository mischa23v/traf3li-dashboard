/**
 * Staff Details View - Comprehensive Law Firm Management
 *
 * Features:
 * - Full staff member profile
 * - Bar licensing & credentials
 * - Practice areas & specializations
 * - Billing rates & targets
 * - Performance metrics
 * - Contact information
 */

import { useState } from 'react'
import {
  FileText,
  Calendar,
  Clock,
  User,
  ArrowLeft,
  Trash2,
  Edit3,
  Loader2,
  Search,
  Bell,
  AlertCircle,
  Phone,
  Mail,
  MapPin,
  Building2,
  Shield,
  Globe,
  CreditCard,
  DollarSign,
  Users,
  Briefcase,
  Tag,
  Award,
  GraduationCap,
  Scale,
  Target,
  TrendingUp,
  BarChart3,
  Star,
  CheckCircle,
  XCircle,
} from 'lucide-react'
import { Skeleton } from '@/components/ui/skeleton'
import { useStaffMember, useDeleteStaff } from '@/hooks/useStaff'
import { ProductivityHero } from '@/components/productivity-hero'
import { useParams, useNavigate } from '@tanstack/react-router'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Progress } from '@/components/ui/progress'
import { Link } from '@tanstack/react-router'
import { Header } from '@/components/layout/header'
import { TopNav } from '@/components/layout/top-nav'
import { DynamicIsland } from '@/components/dynamic-island'
import { Main } from '@/components/layout/main'
import { LanguageSwitcher } from '@/components/language-switcher'
import { ThemeSwitch } from '@/components/theme-switch'
import { ConfigDrawer } from '@/components/config-drawer'
import { ProfileDropdown } from '@/components/profile-dropdown'
import { ClientsSidebar } from '@/features/clients/components/clients-sidebar'

const ROLE_LABELS: Record<string, { label: string; color: string }> = {
  owner: { label: 'مالك', color: 'bg-purple-100 text-purple-700' },
  admin: { label: 'إداري', color: 'bg-gray-100 text-gray-700' },
  partner: { label: 'شريك', color: 'bg-blue-100 text-blue-700' },
  lawyer: { label: 'محامي', color: 'bg-emerald-100 text-emerald-700' },
  paralegal: { label: 'مساعد قانوني', color: 'bg-orange-100 text-orange-700' },
  secretary: { label: 'سكرتير', color: 'bg-pink-100 text-pink-700' },
  accountant: { label: 'محاسب', color: 'bg-teal-100 text-teal-700' },
  departed: { label: 'مغادر', color: 'bg-red-100 text-red-700' },
}

const STATUS_LABELS: Record<string, { label: string; color: string }> = {
  active: { label: 'نشط', color: 'bg-emerald-100 text-emerald-700' },
  departed: { label: 'مغادر', color: 'bg-red-100 text-red-700' },
  suspended: { label: 'معلق', color: 'bg-orange-100 text-orange-700' },
  pending: { label: 'قيد الانتظار', color: 'bg-yellow-100 text-yellow-700' },
  pending_approval: { label: 'في انتظار الموافقة', color: 'bg-blue-100 text-blue-700' },
}

const EMPLOYMENT_TYPE_LABELS: Record<string, string> = {
  full_time: 'دوام كامل',
  part_time: 'دوام جزئي',
  contract: 'عقد',
  consultant: 'استشاري',
}

const BAR_STATUS_LABELS: Record<string, { label: string; color: string }> = {
  active: { label: 'سارية', color: 'bg-emerald-100 text-emerald-700' },
  inactive: { label: 'غير سارية', color: 'bg-gray-100 text-gray-700' },
  suspended: { label: 'معلقة', color: 'bg-red-100 text-red-700' },
  pending: { label: 'قيد المعالجة', color: 'bg-yellow-100 text-yellow-700' },
}

// Format currency in halalas to SAR
const formatCurrency = (halalas: number) => {
  const sar = halalas / 100
  return new Intl.NumberFormat('ar-SA', {
    style: 'currency',
    currency: 'SAR',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(sar)
}

export function StaffDetailsView() {
  const { staffId } = useParams({ strict: false }) as { staffId: string }
  const navigate = useNavigate()
  const [activeTab, setActiveTab] = useState('overview')
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)

  // Fetch staff data
  const { data: staffData, isLoading, isError, error, refetch } = useStaffMember(staffId)

  // Mutations
  const deleteStaffMutation = useDeleteStaff()

  const handleDelete = () => {
    deleteStaffMutation.mutate(staffId, {
      onSuccess: () => {
        navigate({ to: '/dashboard/staff' })
      },
    })
  }

  // Transform API data
  const staff = staffData?.data || staffData

  // Build display name
  const displayName = staff
    ? [staff.salutation, staff.firstName, staff.middleName, staff.lastName]
        .filter(Boolean)
        .join(' ') || staff.fullName || 'عضو فريق'
    : ''

  const topNav = [
    { title: 'فريق العمل', href: '/dashboard/staff', isActive: true },
    { title: 'العملاء', href: '/dashboard/clients', isActive: false },
    { title: 'جهات الاتصال', href: '/dashboard/contacts', isActive: false },
  ]

  return (
    <>
      <Header className="bg-navy shadow-none relative">
        <TopNav
          links={topNav}
          className="[&>a]:text-slate-300 [&>a:hover]:text-white [&>a[aria-current='page']]:text-white"
        />

        <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 z-50">
          <DynamicIsland />
        </div>

        <div className="ms-auto flex items-center gap-4">
          <div className="relative hidden md:block">
            <Search className="absolute end-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-500" aria-hidden="true" />
            <input
              type="text"
              placeholder="بحث..."
              className="h-9 w-64 rounded-xl border border-white/10 bg-white/5 pe-9 ps-4 text-sm text-white placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/50"
            />
          </div>
          <Button
            variant="ghost"
            size="icon"
            className="relative rounded-full text-slate-300 hover:bg-white/10 hover:text-white"
          >
            <Bell className="h-5 w-5" />
            <span className="absolute top-2 end-2 h-2 w-2 bg-red-500 rounded-full border border-navy"></span>
          </Button>
          <LanguageSwitcher className="text-slate-300 hover:bg-white/10 hover:text-white" />
          <ThemeSwitch className="text-slate-300 hover:bg-white/10 hover:text-white" />
          <ConfigDrawer className="text-slate-300 hover:bg-white/10 hover:text-white" />
          <ProfileDropdown className="text-slate-300 hover:bg-white/10 hover:text-white" />
        </div>
        <div className="absolute bottom-0 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-emerald-500/50 to-transparent"></div>
      </Header>

      <Main
        fluid={true}
        className="bg-[#f8f9fa] flex-1 w-full p-6 lg:p-8 space-y-8 rounded-tr-3xl shadow-inner border-e border-white/5 overflow-hidden font-['IBM_Plex_Sans_Arabic']"
      >
        {/* Breadcrumb / Back Link */}
        <div className="mb-6">
          <Link
            to="/dashboard/staff"
            className="inline-flex items-center text-slate-500 hover:text-navy transition-colors"
          >
            <ArrowLeft className="h-4 w-4 ms-2" />
            العودة إلى قائمة فريق العمل
          </Link>
        </div>

        {/* Loading State */}
        {isLoading && (
          <div className="space-y-6">
            <Skeleton className="h-48 w-full rounded-3xl" />
            <div className="grid grid-cols-12 gap-6">
              <div className="col-span-12 lg:col-span-8">
                <Skeleton className="h-96 w-full rounded-2xl" />
              </div>
              <div className="col-span-12 lg:col-span-4">
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
            <h3 className="text-lg font-bold text-slate-900 mb-2">
              حدث خطأ أثناء تحميل بيانات عضو الفريق
            </h3>
            <p className="text-slate-500 mb-4">
              {error?.message || 'تعذر الاتصال بالخادم'}
            </p>
            <Button
              onClick={() => refetch()}
              className="bg-emerald-500 hover:bg-emerald-600"
            >
              إعادة المحاولة
            </Button>
          </div>
        )}

        {/* Empty State */}
        {!isLoading && !isError && !staff && (
          <div className="bg-white rounded-2xl p-12 border border-slate-100 text-center">
            <div className="flex justify-center mb-4">
              <div className="w-16 h-16 rounded-full bg-emerald-50 flex items-center justify-center">
                <User className="w-8 h-8 text-emerald-500" aria-hidden="true" />
              </div>
            </div>
            <h3 className="text-lg font-bold text-slate-900 mb-2">
              عضو الفريق غير موجود
            </h3>
            <p className="text-slate-500 mb-4">
              لم يتم العثور على عضو الفريق المطلوب
            </p>
            <Button asChild className="bg-emerald-500 hover:bg-emerald-600">
              <Link to="/dashboard/staff">العودة إلى القائمة</Link>
            </Button>
          </div>
        )}

        {/* Success State */}
        {!isLoading && !isError && staff && (
          <>
            {/* Staff Hero Content */}
            <ProductivityHero
              badge="فريق العمل"
              title={displayName}
              type="staff"
              listMode={true}
              hideButtons={true}
            >
              <div className="flex flex-wrap gap-3">
                <Link to={`/dashboard/staff/${staffId}/edit`}>
                  <Button
                    variant="outline"
                    className="border-white/10 text-white hover:bg-white/10 hover:text-white backdrop-blur-sm"
                  >
                    <Edit3 className="h-4 w-4 ms-2" aria-hidden="true" />
                    تعديل
                  </Button>
                </Link>
                {!showDeleteConfirm ? (
                  <Button
                    variant="outline"
                    onClick={() => setShowDeleteConfirm(true)}
                    className="border-red-500/30 text-red-300 hover:bg-red-500/20 hover:text-red-200 backdrop-blur-sm"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                ) : (
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setShowDeleteConfirm(false)}
                      className="border-white/10 text-white hover:bg-white/10"
                    >
                      إلغاء
                    </Button>
                    <Button
                      variant="destructive"
                      size="sm"
                      onClick={handleDelete}
                      disabled={deleteStaffMutation.isPending}
                      className="bg-red-500 hover:bg-red-600"
                    >
                      {deleteStaffMutation.isPending ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      ) : (
                        'تأكيد الحذف'
                      )}
                    </Button>
                  </div>
                )}
              </div>
            </ProductivityHero>

            {/* MAIN CONTENT GRID */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              {/* CENTER CONTENT (Tabs & Details) */}
              <div className="lg:col-span-2">
                <Card className="border border-slate-100 shadow-sm rounded-2xl overflow-hidden min-h-[600px]">
                  <Tabs
                    value={activeTab}
                    onValueChange={setActiveTab}
                    className="w-full"
                  >
                    <div className="border-b border-slate-100 px-6 pt-4">
                      <TabsList className="bg-transparent h-auto p-0 gap-6">
                        {['overview', 'credentials', 'billing', 'notes'].map(
                          (tab) => (
                            <TabsTrigger
                              key={tab}
                              value={tab}
                              className="
                                data-[state=active]:bg-transparent data-[state=active]:shadow-none
                                data-[state=active]:border-b-2 data-[state=active]:border-emerald-500
                                data-[state=active]:text-emerald-600
                                text-slate-500 font-medium text-base pb-4 rounded-none px-2
                              "
                            >
                              {tab === 'overview'
                                ? 'نظرة عامة'
                                : tab === 'credentials'
                                  ? 'المؤهلات'
                                  : tab === 'billing'
                                    ? 'الفوترة'
                                    : 'الملاحظات'}
                            </TabsTrigger>
                          )
                        )}
                      </TabsList>
                    </div>

                    <div className="p-6 bg-slate-50/50 min-h-[500px]">
                      {/* Overview Tab */}
                      <TabsContent value="overview" className="mt-0 space-y-6">
                        {/* Role & Status */}
                        <Card className="border-none shadow-sm bg-white rounded-2xl overflow-hidden">
                          <CardHeader>
                            <CardTitle className="text-lg font-bold text-navy flex items-center gap-2">
                              <Briefcase className="h-5 w-5 text-emerald-500" />
                              المنصب والحالة
                            </CardTitle>
                          </CardHeader>
                          <CardContent>
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                              <div className="p-4 bg-slate-50 rounded-xl">
                                <p className="text-xs text-slate-500 mb-1">المنصب</p>
                                <Badge className={ROLE_LABELS[staff.role]?.color || 'bg-gray-100 text-gray-700'}>
                                  {ROLE_LABELS[staff.role]?.label || staff.role || 'غير محدد'}
                                </Badge>
                              </div>
                              <div className="p-4 bg-slate-50 rounded-xl">
                                <p className="text-xs text-slate-500 mb-1">الحالة</p>
                                <Badge className={STATUS_LABELS[staff.status]?.color || 'bg-gray-100 text-gray-700'}>
                                  {STATUS_LABELS[staff.status]?.label || staff.status || 'غير محدد'}
                                </Badge>
                              </div>
                              <div className="p-4 bg-slate-50 rounded-xl">
                                <p className="text-xs text-slate-500 mb-1">نوع التوظيف</p>
                                <p className="font-medium text-navy">
                                  {EMPLOYMENT_TYPE_LABELS[staff.employmentType] || staff.employmentType || 'غير محدد'}
                                </p>
                              </div>
                              {staff.department && (
                                <div className="p-4 bg-slate-50 rounded-xl">
                                  <p className="text-xs text-slate-500 mb-1">القسم</p>
                                  <p className="font-medium text-navy">{staff.department}</p>
                                </div>
                              )}
                            </div>
                          </CardContent>
                        </Card>

                        {/* Contact Info */}
                        <Card className="border-none shadow-sm bg-white rounded-2xl overflow-hidden">
                          <CardHeader>
                            <CardTitle className="text-lg font-bold text-navy flex items-center gap-2">
                              <Phone className="h-5 w-5 text-blue-500" aria-hidden="true" />
                              معلومات الاتصال
                            </CardTitle>
                          </CardHeader>
                          <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="space-y-4">
                              <div className="flex items-center gap-3 p-3 bg-slate-50 rounded-xl">
                                <Mail className="h-5 w-5 text-blue-500" aria-hidden="true" />
                                <div>
                                  <p className="text-xs text-slate-500">البريد الإلكتروني</p>
                                  <p className="font-medium text-navy" dir="ltr">
                                    {staff.email || 'غير محدد'}
                                  </p>
                                </div>
                              </div>
                              {staff.workEmail && staff.workEmail !== staff.email && (
                                <div className="flex items-center gap-3 p-3 bg-slate-50 rounded-xl">
                                  <Mail className="h-5 w-5 text-slate-500" aria-hidden="true" />
                                  <div>
                                    <p className="text-xs text-slate-500">البريد الرسمي</p>
                                    <p className="font-medium text-navy" dir="ltr">{staff.workEmail}</p>
                                  </div>
                                </div>
                              )}
                            </div>
                            <div className="space-y-4">
                              <div className="flex items-center gap-3 p-3 bg-slate-50 rounded-xl">
                                <Phone className="h-5 w-5 text-emerald-500" aria-hidden="true" />
                                <div>
                                  <p className="text-xs text-slate-500">الهاتف</p>
                                  <p className="font-medium text-navy" dir="ltr">
                                    {staff.phone || staff.mobilePhone || 'غير محدد'}
                                  </p>
                                </div>
                              </div>
                              {staff.officePhone && (
                                <div className="flex items-center gap-3 p-3 bg-slate-50 rounded-xl">
                                  <Phone className="h-5 w-5 text-slate-500" aria-hidden="true" />
                                  <div>
                                    <p className="text-xs text-slate-500">هاتف المكتب</p>
                                    <p className="font-medium text-navy" dir="ltr">{staff.officePhone}</p>
                                    {staff.extension && <span className="text-xs text-slate-500"> تحويلة: {staff.extension}</span>}
                                  </div>
                                </div>
                              )}
                            </div>
                          </CardContent>
                        </Card>

                        {/* Employment Info */}
                        <Card className="border-none shadow-sm bg-white rounded-2xl overflow-hidden">
                          <CardHeader>
                            <CardTitle className="text-lg font-bold text-navy flex items-center gap-2">
                              <Calendar className="h-5 w-5 text-orange-500" aria-hidden="true" />
                              بيانات التوظيف
                            </CardTitle>
                          </CardHeader>
                          <CardContent>
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                              {staff.hireDate && (
                                <div className="p-4 bg-slate-50 rounded-xl">
                                  <p className="text-xs text-slate-500 mb-1">تاريخ التعيين</p>
                                  <p className="font-medium text-navy">
                                    {new Date(staff.hireDate).toLocaleDateString('ar-SA')}
                                  </p>
                                </div>
                              )}
                              {staff.startDate && (
                                <div className="p-4 bg-slate-50 rounded-xl">
                                  <p className="text-xs text-slate-500 mb-1">تاريخ البدء</p>
                                  <p className="font-medium text-navy">
                                    {new Date(staff.startDate).toLocaleDateString('ar-SA')}
                                  </p>
                                </div>
                              )}
                              {staff.reportsTo && (
                                <div className="p-4 bg-slate-50 rounded-xl">
                                  <p className="text-xs text-slate-500 mb-1">المدير المباشر</p>
                                  <p className="font-medium text-navy">{staff.reportsTo}</p>
                                </div>
                              )}
                              {staff.officeLocation && (
                                <div className="p-4 bg-slate-50 rounded-xl">
                                  <p className="text-xs text-slate-500 mb-1">موقع المكتب</p>
                                  <p className="font-medium text-navy">{staff.officeLocation}</p>
                                </div>
                              )}
                            </div>
                          </CardContent>
                        </Card>

                        {/* Practice Areas */}
                        {staff.practiceAreas && staff.practiceAreas.length > 0 && (
                          <Card className="border-none shadow-sm bg-white rounded-2xl overflow-hidden">
                            <CardHeader>
                              <CardTitle className="text-lg font-bold text-navy flex items-center gap-2">
                                <Scale className="h-5 w-5 text-purple-500" />
                                مجالات الممارسة
                              </CardTitle>
                            </CardHeader>
                            <CardContent>
                              <div className="flex flex-wrap gap-2">
                                {staff.practiceAreas.map((area: any, i: number) => (
                                  <Badge
                                    key={i}
                                    className={`${area.isPrimary ? 'bg-purple-100 text-purple-700' : 'bg-slate-100 text-slate-700'} rounded-full`}
                                  >
                                    {area.isPrimary && <Star className="h-3 w-3 ms-1" />}
                                    {area.name || area}
                                    {area.yearsExperience && <span className="text-xs me-1">({area.yearsExperience} سنة)</span>}
                                  </Badge>
                                ))}
                              </div>
                            </CardContent>
                          </Card>
                        )}
                      </TabsContent>

                      {/* Credentials Tab */}
                      <TabsContent value="credentials" className="mt-0 space-y-6">
                        {/* Bar Licenses */}
                        <Card className="border-none shadow-sm bg-white rounded-2xl overflow-hidden">
                          <CardHeader>
                            <CardTitle className="text-lg font-bold text-navy flex items-center gap-2">
                              <Scale className="h-5 w-5 text-blue-500" />
                              تراخيص المحاماة
                            </CardTitle>
                          </CardHeader>
                          <CardContent>
                            {staff.barLicenses && staff.barLicenses.length > 0 ? (
                              <div className="space-y-4">
                                {staff.barLicenses.map((license: any, i: number) => (
                                  <div key={i} className="p-4 bg-slate-50 rounded-xl space-y-3">
                                    <div className="flex items-center justify-between">
                                      <div className="flex items-center gap-2">
                                        <Scale className="h-5 w-5 text-blue-500" />
                                        <span className="font-bold text-navy">{license.jurisdiction || 'المملكة العربية السعودية'}</span>
                                      </div>
                                      <Badge className={BAR_STATUS_LABELS[license.status]?.color || 'bg-gray-100 text-gray-700'}>
                                        {BAR_STATUS_LABELS[license.status]?.label || license.status}
                                      </Badge>
                                    </div>
                                    <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-sm">
                                      {license.barNumber && (
                                        <div>
                                          <p className="text-xs text-slate-500">رقم الترخيص</p>
                                          <p className="font-medium text-navy">{license.barNumber}</p>
                                        </div>
                                      )}
                                      {license.admissionDate && (
                                        <div>
                                          <p className="text-xs text-slate-500">تاريخ القبول</p>
                                          <p className="font-medium text-navy">
                                            {new Date(license.admissionDate).toLocaleDateString('ar-SA')}
                                          </p>
                                        </div>
                                      )}
                                      {license.expiryDate && (
                                        <div>
                                          <p className="text-xs text-slate-500">تاريخ الانتهاء</p>
                                          <p className="font-medium text-navy">
                                            {new Date(license.expiryDate).toLocaleDateString('ar-SA')}
                                          </p>
                                        </div>
                                      )}
                                    </div>
                                  </div>
                                ))}
                              </div>
                            ) : (
                              <p className="text-slate-500 text-center py-8">لا توجد تراخيص مسجلة</p>
                            )}
                          </CardContent>
                        </Card>

                        {/* Education */}
                        {staff.education && staff.education.length > 0 && (
                          <Card className="border-none shadow-sm bg-white rounded-2xl overflow-hidden">
                            <CardHeader>
                              <CardTitle className="text-lg font-bold text-navy flex items-center gap-2">
                                <GraduationCap className="h-5 w-5 text-emerald-500" />
                                التعليم
                              </CardTitle>
                            </CardHeader>
                            <CardContent>
                              <div className="space-y-4">
                                {staff.education.map((edu: any, i: number) => (
                                  <div key={i} className="p-4 bg-slate-50 rounded-xl">
                                    <div className="flex items-start justify-between">
                                      <div>
                                        <p className="font-bold text-navy">{edu.degree}</p>
                                        <p className="text-slate-600">{edu.institution}</p>
                                        {edu.field && <p className="text-sm text-slate-500">{edu.field}</p>}
                                      </div>
                                      {edu.year && (
                                        <Badge variant="secondary">{edu.year}</Badge>
                                      )}
                                    </div>
                                  </div>
                                ))}
                              </div>
                            </CardContent>
                          </Card>
                        )}

                        {/* Certifications */}
                        {staff.certifications && staff.certifications.length > 0 && (
                          <Card className="border-none shadow-sm bg-white rounded-2xl overflow-hidden">
                            <CardHeader>
                              <CardTitle className="text-lg font-bold text-navy flex items-center gap-2">
                                <Award className="h-5 w-5 text-yellow-500" />
                                الشهادات المهنية
                              </CardTitle>
                            </CardHeader>
                            <CardContent>
                              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                {staff.certifications.map((cert: any, i: number) => (
                                  <div key={i} className="p-4 bg-slate-50 rounded-xl">
                                    <div className="flex items-center gap-2 mb-2">
                                      <Award className="h-4 w-4 text-yellow-500" />
                                      <span className="font-medium text-navy">{cert.name}</span>
                                    </div>
                                    {cert.issuingBody && (
                                      <p className="text-sm text-slate-600">{cert.issuingBody}</p>
                                    )}
                                    <div className="flex gap-4 mt-2 text-xs text-slate-500">
                                      {cert.issueDate && <span>صدر: {new Date(cert.issueDate).toLocaleDateString('ar-SA')}</span>}
                                      {cert.expiryDate && <span>ينتهي: {new Date(cert.expiryDate).toLocaleDateString('ar-SA')}</span>}
                                    </div>
                                  </div>
                                ))}
                              </div>
                            </CardContent>
                          </Card>
                        )}

                        {/* Languages */}
                        {staff.languages && staff.languages.length > 0 && (
                          <Card className="border-none shadow-sm bg-white rounded-2xl overflow-hidden">
                            <CardHeader>
                              <CardTitle className="text-lg font-bold text-navy flex items-center gap-2">
                                <Globe className="h-5 w-5 text-indigo-500" aria-hidden="true" />
                                اللغات
                              </CardTitle>
                            </CardHeader>
                            <CardContent>
                              <div className="flex flex-wrap gap-3">
                                {staff.languages.map((lang: any, i: number) => (
                                  <div key={i} className="flex items-center gap-2 px-3 py-2 bg-slate-50 rounded-xl">
                                    <span className="font-medium text-navy">{lang.language || lang}</span>
                                    {lang.proficiency && (
                                      <Badge variant="secondary" className="text-xs">
                                        {lang.proficiency === 'native' ? 'لغة أم' :
                                         lang.proficiency === 'fluent' ? 'طلاقة' :
                                         lang.proficiency === 'professional' ? 'مهني' :
                                         lang.proficiency === 'conversational' ? 'محادثة' :
                                         lang.proficiency}
                                      </Badge>
                                    )}
                                  </div>
                                ))}
                              </div>
                            </CardContent>
                          </Card>
                        )}
                      </TabsContent>

                      {/* Billing Tab */}
                      <TabsContent value="billing" className="mt-0 space-y-6">
                        {/* Billing Rates */}
                        <Card className="border-none shadow-sm bg-white rounded-2xl overflow-hidden">
                          <CardHeader>
                            <CardTitle className="text-lg font-bold text-navy flex items-center gap-2">
                              <DollarSign className="h-5 w-5 text-emerald-500" />
                              أسعار الفوترة
                            </CardTitle>
                          </CardHeader>
                          <CardContent>
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                              {staff.hourlyRate && (
                                <div className="p-4 bg-emerald-50 rounded-xl">
                                  <p className="text-xs text-emerald-600 mb-1">السعر بالساعة (افتراضي)</p>
                                  <p className="font-bold text-navy text-xl">{formatCurrency(staff.hourlyRate)}</p>
                                </div>
                              )}
                              {staff.standardRate && (
                                <div className="p-4 bg-slate-50 rounded-xl">
                                  <p className="text-xs text-slate-500 mb-1">السعر القياسي</p>
                                  <p className="font-bold text-navy text-lg">{formatCurrency(staff.standardRate)}</p>
                                </div>
                              )}
                              {staff.discountedRate && (
                                <div className="p-4 bg-slate-50 rounded-xl">
                                  <p className="text-xs text-slate-500 mb-1">السعر المخفض</p>
                                  <p className="font-bold text-navy text-lg">{formatCurrency(staff.discountedRate)}</p>
                                </div>
                              )}
                              {staff.premiumRate && (
                                <div className="p-4 bg-slate-50 rounded-xl">
                                  <p className="text-xs text-slate-500 mb-1">السعر المميز</p>
                                  <p className="font-bold text-navy text-lg">{formatCurrency(staff.premiumRate)}</p>
                                </div>
                              )}
                              {staff.costRate && (
                                <div className="p-4 bg-slate-50 rounded-xl">
                                  <p className="text-xs text-slate-500 mb-1">سعر التكلفة</p>
                                  <p className="font-bold text-navy text-lg">{formatCurrency(staff.costRate)}</p>
                                </div>
                              )}
                            </div>
                          </CardContent>
                        </Card>

                        {/* Billing Targets */}
                        <Card className="border-none shadow-sm bg-white rounded-2xl overflow-hidden">
                          <CardHeader>
                            <CardTitle className="text-lg font-bold text-navy flex items-center gap-2">
                              <Target className="h-5 w-5 text-blue-500" />
                              الأهداف
                            </CardTitle>
                          </CardHeader>
                          <CardContent>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                              {staff.billableHoursTarget && (
                                <div className="p-4 bg-slate-50 rounded-xl">
                                  <div className="flex items-center justify-between mb-2">
                                    <p className="text-sm text-slate-600">ساعات العمل المستهدفة (سنوياً)</p>
                                    <span className="font-bold text-navy">{staff.billableHoursTarget} ساعة</span>
                                  </div>
                                  <Progress value={65} className="h-2" />
                                  <p className="text-xs text-slate-500 mt-1">65% تم الإنجاز</p>
                                </div>
                              )}
                              {staff.revenueTarget && (
                                <div className="p-4 bg-slate-50 rounded-xl">
                                  <div className="flex items-center justify-between mb-2">
                                    <p className="text-sm text-slate-600">هدف الإيرادات (سنوياً)</p>
                                    <span className="font-bold text-navy">{formatCurrency(staff.revenueTarget)}</span>
                                  </div>
                                  <Progress value={45} className="h-2" />
                                  <p className="text-xs text-slate-500 mt-1">45% تم الإنجاز</p>
                                </div>
                              )}
                              {staff.utilizationTarget && (
                                <div className="p-4 bg-slate-50 rounded-xl">
                                  <div className="flex items-center justify-between mb-2">
                                    <p className="text-sm text-slate-600">هدف الاستخدام</p>
                                    <span className="font-bold text-navy">{staff.utilizationTarget}%</span>
                                  </div>
                                  <Progress value={staff.utilizationTarget} className="h-2" />
                                </div>
                              )}
                            </div>
                          </CardContent>
                        </Card>

                        {/* Billing Settings */}
                        <Card className="border-none shadow-sm bg-white rounded-2xl overflow-hidden">
                          <CardHeader>
                            <CardTitle className="text-lg font-bold text-navy flex items-center gap-2">
                              <BarChart3 className="h-5 w-5 text-purple-500" />
                              إعدادات الفوترة
                            </CardTitle>
                          </CardHeader>
                          <CardContent>
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                              <div className="flex items-center gap-2 p-3 bg-slate-50 rounded-xl">
                                {staff.canBillTime !== false ? (
                                  <CheckCircle className="h-5 w-5 text-emerald-500" />
                                ) : (
                                  <XCircle className="h-5 w-5 text-red-500" />
                                )}
                                <span className="text-sm text-slate-600">تسجيل الوقت</span>
                              </div>
                              <div className="flex items-center gap-2 p-3 bg-slate-50 rounded-xl">
                                {staff.canApproveTime ? (
                                  <CheckCircle className="h-5 w-5 text-emerald-500" />
                                ) : (
                                  <XCircle className="h-5 w-5 text-red-500" />
                                )}
                                <span className="text-sm text-slate-600">اعتماد الوقت</span>
                              </div>
                              <div className="flex items-center gap-2 p-3 bg-slate-50 rounded-xl">
                                {staff.canViewRates ? (
                                  <CheckCircle className="h-5 w-5 text-emerald-500" />
                                ) : (
                                  <XCircle className="h-5 w-5 text-red-500" />
                                )}
                                <span className="text-sm text-slate-600">عرض الأسعار</span>
                              </div>
                              <div className="flex items-center gap-2 p-3 bg-slate-50 rounded-xl">
                                {staff.canEditRates ? (
                                  <CheckCircle className="h-5 w-5 text-emerald-500" />
                                ) : (
                                  <XCircle className="h-5 w-5 text-red-500" />
                                )}
                                <span className="text-sm text-slate-600">تعديل الأسعار</span>
                              </div>
                            </div>
                          </CardContent>
                        </Card>
                      </TabsContent>

                      {/* Notes Tab */}
                      <TabsContent value="notes" className="mt-0 space-y-6">
                        <Card className="border-none shadow-sm bg-white rounded-2xl overflow-hidden">
                          <CardHeader>
                            <CardTitle className="text-lg font-bold text-navy flex items-center gap-2">
                              <FileText className="h-5 w-5 text-slate-500" aria-hidden="true" />
                              الملاحظات
                            </CardTitle>
                          </CardHeader>
                          <CardContent>
                            <p className="text-slate-600 leading-relaxed whitespace-pre-wrap">
                              {staff.notes || 'لا توجد ملاحظات'}
                            </p>
                          </CardContent>
                        </Card>

                        {/* Bio */}
                        {staff.bio && (
                          <Card className="border-none shadow-sm bg-white rounded-2xl overflow-hidden">
                            <CardHeader>
                              <CardTitle className="text-lg font-bold text-navy flex items-center gap-2">
                                <User className="h-5 w-5 text-blue-500" aria-hidden="true" />
                                السيرة الذاتية
                              </CardTitle>
                            </CardHeader>
                            <CardContent>
                              <p className="text-slate-600 leading-relaxed whitespace-pre-wrap">
                                {staff.bio}
                              </p>
                            </CardContent>
                          </Card>
                        )}

                        {/* Tags */}
                        {staff.tags && staff.tags.length > 0 && (
                          <Card className="border-none shadow-sm bg-white rounded-2xl overflow-hidden">
                            <CardHeader>
                              <CardTitle className="text-lg font-bold text-navy flex items-center gap-2">
                                <Tag className="h-5 w-5 text-blue-500" />
                                الوسوم
                              </CardTitle>
                            </CardHeader>
                            <CardContent>
                              <div className="flex flex-wrap gap-2">
                                {staff.tags.map((tag: string, i: number) => (
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

              {/* SIDEBAR */}
              <ClientsSidebar context="staff" />
            </div>
          </>
        )}
      </Main>
    </>
  )
}
