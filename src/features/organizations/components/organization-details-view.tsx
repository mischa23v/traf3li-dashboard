/**
 * Organization Details View - Comprehensive Law Firm CRM
 *
 * Features:
 * - Full organization information display
 * - Saudi business identification (CR, VAT)
 * - Industry & classification
 * - Banking & billing information
 * - Key contacts
 * - Conflict check status
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
  CheckCircle,
  AlertTriangle,
  Hash,
  Receipt,
  Link as LinkIcon,
  Star,
} from 'lucide-react'
import { Skeleton } from '@/components/ui/skeleton'
import { useOrganization, useDeleteOrganization } from '@/hooks/useOrganizations'
import { ProductivityHero } from '@/components/productivity-hero'
import { useParams, useNavigate } from '@tanstack/react-router'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
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

const ORG_TYPE_LABELS: Record<string, string> = {
  llc: 'شركة ذات مسؤولية محدودة',
  joint_stock: 'شركة مساهمة',
  partnership: 'شركة تضامنية',
  sole_proprietorship: 'مؤسسة فردية',
  branch: 'فرع شركة أجنبية',
  government: 'جهة حكومية',
  nonprofit: 'منظمة غير ربحية',
  professional: 'شركة مهنية',
  holding: 'شركة قابضة',
  other: 'أخرى',
}

const STATUS_LABELS: Record<string, { label: string; color: string }> = {
  active: { label: 'نشط', color: 'bg-emerald-100 text-emerald-700' },
  inactive: { label: 'غير نشط', color: 'bg-gray-100 text-gray-700' },
  suspended: { label: 'معلق', color: 'bg-orange-100 text-orange-700' },
  dissolved: { label: 'منحلة', color: 'bg-red-100 text-red-700' },
  pending: { label: 'قيد التأسيس', color: 'bg-blue-100 text-blue-700' },
}

const CONFLICT_STATUS_LABELS: Record<string, { label: string; color: string; icon: typeof AlertTriangle }> = {
  not_checked: { label: 'لم يتم الفحص', color: 'bg-gray-100 text-gray-700', icon: AlertTriangle },
  clear: { label: 'واضح - لا يوجد تعارض', color: 'bg-emerald-100 text-emerald-700', icon: CheckCircle },
  potential_conflict: { label: 'تعارض محتمل', color: 'bg-yellow-100 text-yellow-700', icon: AlertTriangle },
  confirmed_conflict: { label: 'تعارض مؤكد', color: 'bg-red-100 text-red-700', icon: Shield },
}

const SIZE_LABELS: Record<string, string> = {
  micro: 'متناهية الصغر (1-9 موظفين)',
  small: 'صغيرة (10-49 موظف)',
  medium: 'متوسطة (50-249 موظف)',
  large: 'كبيرة (250+ موظف)',
  enterprise: 'مؤسسة عملاقة',
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

export function OrganizationDetailsView() {
  const { organizationId } = useParams({ strict: false }) as { organizationId: string }
  const navigate = useNavigate()
  const [activeTab, setActiveTab] = useState('overview')
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)

  // Fetch organization data
  const { data: orgData, isLoading, isError, error, refetch } = useOrganization(organizationId)

  // Mutations
  const deleteOrgMutation = useDeleteOrganization()

  const handleDelete = () => {
    deleteOrgMutation.mutate(organizationId, {
      onSuccess: () => {
        navigate({ to: '/dashboard/organizations' })
      },
    })
  }

  // Transform API data
  const org = orgData?.data || orgData

  const topNav = [
    { title: 'المنظمات', href: '/dashboard/organizations', isActive: true },
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
            <Search className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-500" />
            <input
              type="text"
              placeholder="بحث..."
              className="h-9 w-64 rounded-xl border border-white/10 bg-white/5 pe-9 ps-4 text-sm text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500/50"
            />
          </div>
          <Button
            variant="ghost"
            size="icon"
            className="relative rounded-full text-slate-300 hover:bg-white/10 hover:text-white"
          >
            <Bell className="h-5 w-5" />
            <span className="absolute top-2 right-2 h-2 w-2 bg-red-500 rounded-full border border-navy"></span>
          </Button>
          <LanguageSwitcher className="text-slate-300 hover:bg-white/10 hover:text-white" />
          <ThemeSwitch className="text-slate-300 hover:bg-white/10 hover:text-white" />
          <ConfigDrawer className="text-slate-300 hover:bg-white/10 hover:text-white" />
          <ProfileDropdown className="text-slate-300 hover:bg-white/10 hover:text-white" />
        </div>
        <div className="absolute bottom-0 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-blue-500/50 to-transparent"></div>
      </Header>

      <Main
        fluid={true}
        className="bg-[#f8f9fa] flex-1 w-full p-6 lg:p-8 space-y-8 rounded-tr-3xl shadow-inner border-r border-white/5 overflow-hidden font-['IBM_Plex_Sans_Arabic']"
      >
        {/* Breadcrumb / Back Link */}
        <div className="mb-6">
          <Link
            to="/dashboard/organizations"
            className="inline-flex items-center text-slate-500 hover:text-navy transition-colors"
          >
            <ArrowLeft className="h-4 w-4 ms-2" />
            العودة إلى قائمة المنظمات
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
                <AlertCircle className="w-8 h-8 text-red-500" />
              </div>
            </div>
            <h3 className="text-lg font-bold text-slate-900 mb-2">
              حدث خطأ أثناء تحميل بيانات المنظمة
            </h3>
            <p className="text-slate-500 mb-4">
              {error?.message || 'تعذر الاتصال بالخادم'}
            </p>
            <Button
              onClick={() => refetch()}
              className="bg-blue-500 hover:bg-blue-600"
            >
              إعادة المحاولة
            </Button>
          </div>
        )}

        {/* Empty State */}
        {!isLoading && !isError && !org && (
          <div className="bg-white rounded-2xl p-12 border border-slate-100 text-center">
            <div className="flex justify-center mb-4">
              <div className="w-16 h-16 rounded-full bg-blue-50 flex items-center justify-center">
                <Building2 className="w-8 h-8 text-blue-500" />
              </div>
            </div>
            <h3 className="text-lg font-bold text-slate-900 mb-2">
              المنظمة غير موجودة
            </h3>
            <p className="text-slate-500 mb-4">
              لم يتم العثور على المنظمة المطلوبة
            </p>
            <Button asChild className="bg-blue-500 hover:bg-blue-600">
              <Link to="/dashboard/organizations">العودة إلى القائمة</Link>
            </Button>
          </div>
        )}

        {/* Success State */}
        {!isLoading && !isError && org && (
          <>
            {/* Organization Hero Content */}
            <ProductivityHero
              badge="المنظمات"
              title={org.legalNameAr || org.legalName || org.name || 'منظمة'}
              type="organizations"
              listMode={true}
              hideButtons={true}
            >
              <div className="flex flex-wrap gap-3">
                <Link to={`/dashboard/organizations/${organizationId}/edit`}>
                  <Button
                    variant="outline"
                    className="border-white/10 text-white hover:bg-white/10 hover:text-white backdrop-blur-sm"
                  >
                    <Edit3 className="h-4 w-4 ms-2" />
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
                      disabled={deleteOrgMutation.isPending}
                      className="bg-red-500 hover:bg-red-600"
                    >
                      {deleteOrgMutation.isPending ? (
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
                        {['overview', 'registration', 'financial', 'notes'].map(
                          (tab) => (
                            <TabsTrigger
                              key={tab}
                              value={tab}
                              className="
                                data-[state=active]:bg-transparent data-[state=active]:shadow-none
                                data-[state=active]:border-b-2 data-[state=active]:border-blue-500
                                data-[state=active]:text-blue-600
                                text-slate-500 font-medium text-base pb-4 rounded-none px-2
                              "
                            >
                              {tab === 'overview'
                                ? 'نظرة عامة'
                                : tab === 'registration'
                                  ? 'التسجيل'
                                  : tab === 'financial'
                                    ? 'المالية'
                                    : 'الملاحظات'}
                            </TabsTrigger>
                          )
                        )}
                      </TabsList>
                    </div>

                    <div className="p-6 bg-slate-50/50 min-h-[500px]">
                      {/* Overview Tab */}
                      <TabsContent value="overview" className="mt-0 space-y-6">
                        {/* Basic Info */}
                        <Card className="border-none shadow-sm bg-white rounded-2xl overflow-hidden">
                          <CardHeader>
                            <CardTitle className="text-lg font-bold text-navy flex items-center gap-2">
                              <Building2 className="h-5 w-5 text-blue-500" />
                              المعلومات الأساسية
                            </CardTitle>
                          </CardHeader>
                          <CardContent>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                              {org.tradeName && (
                                <div className="p-4 bg-slate-50 rounded-xl">
                                  <p className="text-xs text-slate-500 mb-1">الاسم التجاري</p>
                                  <p className="font-medium text-navy">{org.tradeName}</p>
                                </div>
                              )}
                              {org.tradeNameAr && (
                                <div className="p-4 bg-slate-50 rounded-xl">
                                  <p className="text-xs text-slate-500 mb-1">الاسم التجاري (عربي)</p>
                                  <p className="font-medium text-navy">{org.tradeNameAr}</p>
                                </div>
                              )}
                              <div className="p-4 bg-slate-50 rounded-xl">
                                <p className="text-xs text-slate-500 mb-1">نوع الكيان</p>
                                <Badge className="bg-blue-100 text-blue-700">
                                  {ORG_TYPE_LABELS[org.type] || org.type || 'غير محدد'}
                                </Badge>
                              </div>
                              <div className="p-4 bg-slate-50 rounded-xl">
                                <p className="text-xs text-slate-500 mb-1">الحالة</p>
                                <Badge className={STATUS_LABELS[org.status]?.color || 'bg-gray-100 text-gray-700'}>
                                  {STATUS_LABELS[org.status]?.label || org.status || 'غير محدد'}
                                </Badge>
                              </div>
                              {org.industry && (
                                <div className="p-4 bg-slate-50 rounded-xl">
                                  <p className="text-xs text-slate-500 mb-1">الصناعة</p>
                                  <p className="font-medium text-navy">{org.industry}</p>
                                </div>
                              )}
                              {org.size && (
                                <div className="p-4 bg-slate-50 rounded-xl">
                                  <p className="text-xs text-slate-500 mb-1">الحجم</p>
                                  <p className="font-medium text-navy">{SIZE_LABELS[org.size] || org.size}</p>
                                </div>
                              )}
                            </div>
                          </CardContent>
                        </Card>

                        {/* Contact Info */}
                        <Card className="border-none shadow-sm bg-white rounded-2xl overflow-hidden">
                          <CardHeader>
                            <CardTitle className="text-lg font-bold text-navy flex items-center gap-2">
                              <Phone className="h-5 w-5 text-emerald-500" />
                              معلومات الاتصال
                            </CardTitle>
                          </CardHeader>
                          <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="space-y-4">
                              <div className="flex items-center gap-3 p-3 bg-slate-50 rounded-xl">
                                <Phone className="h-5 w-5 text-emerald-500" />
                                <div>
                                  <p className="text-xs text-slate-500">الهاتف</p>
                                  <p className="font-medium text-navy" dir="ltr">
                                    {org.phone || 'غير محدد'}
                                  </p>
                                </div>
                              </div>
                              {org.fax && (
                                <div className="flex items-center gap-3 p-3 bg-slate-50 rounded-xl">
                                  <Phone className="h-5 w-5 text-slate-500" />
                                  <div>
                                    <p className="text-xs text-slate-500">الفاكس</p>
                                    <p className="font-medium text-navy" dir="ltr">{org.fax}</p>
                                  </div>
                                </div>
                              )}
                            </div>
                            <div className="space-y-4">
                              <div className="flex items-center gap-3 p-3 bg-slate-50 rounded-xl">
                                <Mail className="h-5 w-5 text-blue-500" />
                                <div>
                                  <p className="text-xs text-slate-500">البريد الإلكتروني</p>
                                  <p className="font-medium text-navy" dir="ltr">
                                    {org.email || 'غير محدد'}
                                  </p>
                                </div>
                              </div>
                              {org.website && (
                                <div className="flex items-center gap-3 p-3 bg-slate-50 rounded-xl">
                                  <Globe className="h-5 w-5 text-purple-500" />
                                  <div>
                                    <p className="text-xs text-slate-500">الموقع الإلكتروني</p>
                                    <a href={org.website} target="_blank" rel="noopener noreferrer" className="font-medium text-blue-600 hover:underline" dir="ltr">
                                      {org.website}
                                    </a>
                                  </div>
                                </div>
                              )}
                            </div>
                          </CardContent>
                        </Card>

                        {/* Address */}
                        {(org.address || org.street || org.city) && (
                          <Card className="border-none shadow-sm bg-white rounded-2xl overflow-hidden">
                            <CardHeader>
                              <CardTitle className="text-lg font-bold text-navy flex items-center gap-2">
                                <MapPin className="h-5 w-5 text-red-500" />
                                العنوان
                              </CardTitle>
                            </CardHeader>
                            <CardContent>
                              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className="p-4 bg-slate-50 rounded-xl">
                                  <p className="text-xs text-slate-500 mb-1">العنوان الكامل</p>
                                  <p className="text-slate-600">
                                    {[
                                      org.street || org.address,
                                      org.buildingNumber,
                                      org.district,
                                      org.city,
                                      org.postalCode,
                                      org.country,
                                    ]
                                      .filter(Boolean)
                                      .join(', ') || 'غير محدد'}
                                  </p>
                                </div>
                                {org.nationalAddress && (
                                  <div className="p-4 bg-slate-50 rounded-xl">
                                    <p className="text-xs text-slate-500 mb-1">العنوان الوطني</p>
                                    <p className="font-medium text-navy" dir="ltr">{org.nationalAddress}</p>
                                  </div>
                                )}
                                {org.poBox && (
                                  <div className="p-4 bg-slate-50 rounded-xl">
                                    <p className="text-xs text-slate-500 mb-1">صندوق البريد</p>
                                    <p className="font-medium text-navy">{org.poBox}</p>
                                  </div>
                                )}
                              </div>
                            </CardContent>
                          </Card>
                        )}

                        {/* Conflict Check */}
                        <Card className="border-none shadow-sm bg-white rounded-2xl overflow-hidden">
                          <CardHeader>
                            <CardTitle className="text-lg font-bold text-navy flex items-center gap-2">
                              <Shield className="h-5 w-5 text-orange-500" />
                              فحص تعارض المصالح
                            </CardTitle>
                          </CardHeader>
                          <CardContent>
                            <div className="flex items-center gap-3 p-4 bg-slate-50 rounded-xl">
                              {(() => {
                                const status = CONFLICT_STATUS_LABELS[org.conflictCheckStatus] || CONFLICT_STATUS_LABELS.not_checked
                                const Icon = status.icon
                                return (
                                  <>
                                    <Icon className={`h-5 w-5 ${status.color.replace('bg-', 'text-').replace('-100', '-500')}`} />
                                    <Badge className={status.color}>{status.label}</Badge>
                                  </>
                                )
                              })()}
                            </div>
                          </CardContent>
                        </Card>
                      </TabsContent>

                      {/* Registration Tab */}
                      <TabsContent value="registration" className="mt-0 space-y-6">
                        <Card className="border-none shadow-sm bg-white rounded-2xl overflow-hidden">
                          <CardHeader>
                            <CardTitle className="text-lg font-bold text-navy flex items-center gap-2">
                              <CreditCard className="h-5 w-5 text-blue-500" />
                              بيانات التسجيل السعودية
                            </CardTitle>
                          </CardHeader>
                          <CardContent className="space-y-4">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                              {org.commercialRegistration && (
                                <div className="p-4 bg-blue-50 rounded-xl">
                                  <p className="text-xs text-blue-600 mb-1">رقم السجل التجاري</p>
                                  <p className="font-bold text-navy text-lg" dir="ltr">{org.commercialRegistration}</p>
                                </div>
                              )}
                              {org.crIssueDate && (
                                <div className="p-4 bg-slate-50 rounded-xl">
                                  <p className="text-xs text-slate-500 mb-1">تاريخ إصدار السجل</p>
                                  <p className="font-medium text-navy">
                                    {new Date(org.crIssueDate).toLocaleDateString('ar-SA')}
                                  </p>
                                </div>
                              )}
                              {org.crExpiryDate && (
                                <div className="p-4 bg-slate-50 rounded-xl">
                                  <p className="text-xs text-slate-500 mb-1">تاريخ انتهاء السجل</p>
                                  <p className="font-medium text-navy">
                                    {new Date(org.crExpiryDate).toLocaleDateString('ar-SA')}
                                  </p>
                                </div>
                              )}
                              {org.vatNumber && (
                                <div className="p-4 bg-emerald-50 rounded-xl">
                                  <p className="text-xs text-emerald-600 mb-1">الرقم الضريبي</p>
                                  <p className="font-bold text-navy text-lg" dir="ltr">{org.vatNumber}</p>
                                </div>
                              )}
                              {org.unifiedNumber && (
                                <div className="p-4 bg-slate-50 rounded-xl">
                                  <p className="text-xs text-slate-500 mb-1">الرقم الموحد (700)</p>
                                  <p className="font-medium text-navy" dir="ltr">{org.unifiedNumber}</p>
                                </div>
                              )}
                              {org.municipalLicense && (
                                <div className="p-4 bg-slate-50 rounded-xl">
                                  <p className="text-xs text-slate-500 mb-1">رخصة البلدية</p>
                                  <p className="font-medium text-navy">{org.municipalLicense}</p>
                                </div>
                              )}
                              {org.chamberMembership && (
                                <div className="p-4 bg-slate-50 rounded-xl">
                                  <p className="text-xs text-slate-500 mb-1">عضوية الغرفة التجارية</p>
                                  <p className="font-medium text-navy">{org.chamberMembership}</p>
                                </div>
                              )}
                              {org.foundedDate && (
                                <div className="p-4 bg-slate-50 rounded-xl">
                                  <p className="text-xs text-slate-500 mb-1">تاريخ التأسيس</p>
                                  <p className="font-medium text-navy">
                                    {new Date(org.foundedDate).toLocaleDateString('ar-SA')}
                                  </p>
                                </div>
                              )}
                            </div>
                            {!org.commercialRegistration && !org.vatNumber && (
                              <p className="text-slate-500 text-center py-8">لا توجد بيانات تسجيل مسجلة</p>
                            )}
                          </CardContent>
                        </Card>

                        {/* Parent Company / Subsidiaries */}
                        {(org.parentCompany || org.subsidiaries?.length > 0) && (
                          <Card className="border-none shadow-sm bg-white rounded-2xl overflow-hidden">
                            <CardHeader>
                              <CardTitle className="text-lg font-bold text-navy flex items-center gap-2">
                                <LinkIcon className="h-5 w-5 text-purple-500" />
                                الهيكل التنظيمي
                              </CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-4">
                              {org.parentCompany && (
                                <div className="p-4 bg-slate-50 rounded-xl">
                                  <p className="text-xs text-slate-500 mb-1">الشركة الأم</p>
                                  <p className="font-medium text-navy">{org.parentCompany}</p>
                                </div>
                              )}
                              {org.subsidiaries?.length > 0 && (
                                <div className="p-4 bg-slate-50 rounded-xl">
                                  <p className="text-xs text-slate-500 mb-2">الشركات التابعة</p>
                                  <div className="flex flex-wrap gap-2">
                                    {org.subsidiaries.map((sub: string, i: number) => (
                                      <Badge key={i} variant="secondary">{sub}</Badge>
                                    ))}
                                  </div>
                                </div>
                              )}
                            </CardContent>
                          </Card>
                        )}
                      </TabsContent>

                      {/* Financial Tab */}
                      <TabsContent value="financial" className="mt-0 space-y-6">
                        <Card className="border-none shadow-sm bg-white rounded-2xl overflow-hidden">
                          <CardHeader>
                            <CardTitle className="text-lg font-bold text-navy flex items-center gap-2">
                              <DollarSign className="h-5 w-5 text-emerald-500" />
                              المعلومات المالية
                            </CardTitle>
                          </CardHeader>
                          <CardContent className="space-y-4">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                              {org.capital && (
                                <div className="p-4 bg-emerald-50 rounded-xl">
                                  <p className="text-xs text-emerald-600 mb-1">رأس المال</p>
                                  <p className="font-bold text-navy text-lg">{formatCurrency(org.capital)}</p>
                                </div>
                              )}
                              {org.annualRevenue && (
                                <div className="p-4 bg-slate-50 rounded-xl">
                                  <p className="text-xs text-slate-500 mb-1">الإيرادات السنوية</p>
                                  <p className="font-medium text-navy">{formatCurrency(org.annualRevenue)}</p>
                                </div>
                              )}
                              {org.creditLimit && (
                                <div className="p-4 bg-slate-50 rounded-xl">
                                  <p className="text-xs text-slate-500 mb-1">الحد الائتماني</p>
                                  <p className="font-medium text-navy">{formatCurrency(org.creditLimit)}</p>
                                </div>
                              )}
                              {org.paymentTerms && (
                                <div className="p-4 bg-slate-50 rounded-xl">
                                  <p className="text-xs text-slate-500 mb-1">شروط الدفع</p>
                                  <p className="font-medium text-navy">{org.paymentTerms} يوم</p>
                                </div>
                              )}
                            </div>
                          </CardContent>
                        </Card>

                        {/* Banking Info */}
                        {(org.bankName || org.iban) && (
                          <Card className="border-none shadow-sm bg-white rounded-2xl overflow-hidden">
                            <CardHeader>
                              <CardTitle className="text-lg font-bold text-navy flex items-center gap-2">
                                <Receipt className="h-5 w-5 text-blue-500" />
                                المعلومات البنكية
                              </CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-4">
                              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                {org.bankName && (
                                  <div className="p-4 bg-slate-50 rounded-xl">
                                    <p className="text-xs text-slate-500 mb-1">اسم البنك</p>
                                    <p className="font-medium text-navy">{org.bankName}</p>
                                  </div>
                                )}
                                {org.iban && (
                                  <div className="p-4 bg-slate-50 rounded-xl">
                                    <p className="text-xs text-slate-500 mb-1">IBAN</p>
                                    <p className="font-medium text-navy font-mono" dir="ltr">{org.iban}</p>
                                  </div>
                                )}
                                {org.accountHolderName && (
                                  <div className="p-4 bg-slate-50 rounded-xl">
                                    <p className="text-xs text-slate-500 mb-1">اسم صاحب الحساب</p>
                                    <p className="font-medium text-navy">{org.accountHolderName}</p>
                                  </div>
                                )}
                                {org.swiftCode && (
                                  <div className="p-4 bg-slate-50 rounded-xl">
                                    <p className="text-xs text-slate-500 mb-1">SWIFT Code</p>
                                    <p className="font-medium text-navy font-mono" dir="ltr">{org.swiftCode}</p>
                                  </div>
                                )}
                              </div>
                            </CardContent>
                          </Card>
                        )}

                        {/* Billing Preferences */}
                        <Card className="border-none shadow-sm bg-white rounded-2xl overflow-hidden">
                          <CardHeader>
                            <CardTitle className="text-lg font-bold text-navy flex items-center gap-2">
                              <Receipt className="h-5 w-5 text-purple-500" />
                              تفضيلات الفوترة
                            </CardTitle>
                          </CardHeader>
                          <CardContent className="space-y-4">
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                              <div className="p-4 bg-slate-50 rounded-xl">
                                <p className="text-xs text-slate-500 mb-1">نوع الفوترة</p>
                                <p className="font-medium text-navy">
                                  {org.billingType === 'hourly' ? 'بالساعة' :
                                   org.billingType === 'fixed' ? 'مبلغ ثابت' :
                                   org.billingType === 'contingency' ? 'نسبة من القضية' :
                                   org.billingType === 'retainer' ? 'مبلغ شهري' :
                                   'غير محدد'}
                                </p>
                              </div>
                              <div className="p-4 bg-slate-50 rounded-xl">
                                <p className="text-xs text-slate-500 mb-1">طريقة الدفع</p>
                                <p className="font-medium text-navy">
                                  {org.preferredPaymentMethod === 'bank_transfer' ? 'تحويل بنكي' :
                                   org.preferredPaymentMethod === 'check' ? 'شيك' :
                                   org.preferredPaymentMethod === 'cash' ? 'نقدي' :
                                   org.preferredPaymentMethod === 'credit_card' ? 'بطاقة ائتمان' :
                                   'غير محدد'}
                                </p>
                              </div>
                              <div className="p-4 bg-slate-50 rounded-xl">
                                <p className="text-xs text-slate-500 mb-1">دورة الفوترة</p>
                                <p className="font-medium text-navy">
                                  {org.billingCycle === 'monthly' ? 'شهري' :
                                   org.billingCycle === 'quarterly' ? 'ربع سنوي' :
                                   org.billingCycle === 'upon_completion' ? 'عند الانتهاء' :
                                   'غير محدد'}
                                </p>
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
                              <FileText className="h-5 w-5 text-slate-500" />
                              الملاحظات
                            </CardTitle>
                          </CardHeader>
                          <CardContent>
                            <p className="text-slate-600 leading-relaxed whitespace-pre-wrap">
                              {org.notes || 'لا توجد ملاحظات'}
                            </p>
                          </CardContent>
                        </Card>

                        {/* Description */}
                        {org.description && (
                          <Card className="border-none shadow-sm bg-white rounded-2xl overflow-hidden">
                            <CardHeader>
                              <CardTitle className="text-lg font-bold text-navy flex items-center gap-2">
                                <FileText className="h-5 w-5 text-blue-500" />
                                الوصف
                              </CardTitle>
                            </CardHeader>
                            <CardContent>
                              <p className="text-slate-600 leading-relaxed whitespace-pre-wrap">
                                {org.description}
                              </p>
                            </CardContent>
                          </Card>
                        )}

                        {/* Tags */}
                        {org.tags && org.tags.length > 0 && (
                          <Card className="border-none shadow-sm bg-white rounded-2xl overflow-hidden">
                            <CardHeader>
                              <CardTitle className="text-lg font-bold text-navy flex items-center gap-2">
                                <Tag className="h-5 w-5 text-blue-500" />
                                الوسوم
                              </CardTitle>
                            </CardHeader>
                            <CardContent>
                              <div className="flex flex-wrap gap-2">
                                {org.tags.map((tag: string, i: number) => (
                                  <Badge key={i} variant="secondary" className="rounded-full">
                                    {tag}
                                  </Badge>
                                ))}
                              </div>
                            </CardContent>
                          </Card>
                        )}

                        {/* Practice Areas */}
                        {org.practiceAreas && org.practiceAreas.length > 0 && (
                          <Card className="border-none shadow-sm bg-white rounded-2xl overflow-hidden">
                            <CardHeader>
                              <CardTitle className="text-lg font-bold text-navy flex items-center gap-2">
                                <Briefcase className="h-5 w-5 text-purple-500" />
                                مجالات الممارسة
                              </CardTitle>
                            </CardHeader>
                            <CardContent>
                              <div className="flex flex-wrap gap-2">
                                {org.practiceAreas.map((area: string, i: number) => (
                                  <Badge key={i} className="bg-purple-100 text-purple-700 rounded-full">
                                    {area}
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
              <ClientsSidebar context="organizations" />
            </div>
          </>
        )}
      </Main>
    </>
  )
}
