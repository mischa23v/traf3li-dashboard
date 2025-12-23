/**
 * Organization Details View - Comprehensive Law Firm CRM
 */

import { useState } from 'react'
import {
  FileText,
  Building2,
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
  Globe,
  Shield,
  Tag,
  CheckCircle,
  AlertTriangle,
  CreditCard,
  Building,
  DollarSign,
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
import { useTranslation } from 'react-i18next'
import { maskIBAN } from '@/utils/data-masking'

const ORG_TYPE_LABELS: Record<string, string> = {
  llc: 'شركة ذات مسؤولية محدودة',
  joint_stock: 'شركة مساهمة',
  partnership: 'شراكة',
  sole_proprietorship: 'مؤسسة فردية',
  branch: 'فرع',
  government: 'جهة حكومية',
  nonprofit: 'منظمة غير ربحية',
  professional: 'مهنية',
  holding: 'شركة قابضة',
  company: 'شركة',
  court: 'محكمة',
  law_firm: 'مكتب محاماة',
  other: 'أخرى',
}

const STATUS_LABELS: Record<string, { label: string; color: string }> = {
  active: { label: 'نشط', color: 'bg-emerald-100 text-emerald-700' },
  inactive: { label: 'غير نشط', color: 'bg-gray-100 text-gray-700' },
  suspended: { label: 'معلق', color: 'bg-yellow-100 text-yellow-700' },
  dissolved: { label: 'محلول', color: 'bg-red-100 text-red-700' },
  pending: { label: 'قيد الانتظار', color: 'bg-blue-100 text-blue-700' },
  archived: { label: 'مؤرشف', color: 'bg-slate-100 text-slate-700' },
}

const CONFLICT_STATUS_LABELS: Record<string, { label: string; color: string; iconColor: string }> = {
  not_checked: { label: 'لم يتم الفحص', color: 'bg-gray-100 text-gray-700', iconColor: 'text-gray-500' },
  clear: { label: 'واضح - لا يوجد تعارض', color: 'bg-emerald-100 text-emerald-700', iconColor: 'text-emerald-500' },
  potential_conflict: { label: 'تعارض محتمل', color: 'bg-yellow-100 text-yellow-700', iconColor: 'text-yellow-500' },
  confirmed_conflict: { label: 'تعارض مؤكد', color: 'bg-red-100 text-red-700', iconColor: 'text-red-500' },
}

const SIZE_LABELS: Record<string, string> = {
  micro: 'مصغرة',
  small: 'صغيرة',
  medium: 'متوسطة',
  large: 'كبيرة',
  enterprise: 'مؤسسة كبرى',
}

export function OrganizationDetailsView() {
  const { organizationId } = useParams({ strict: false }) as { organizationId: string }
  const navigate = useNavigate()
  const { i18n } = useTranslation()
  const [activeTab, setActiveTab] = useState('overview')
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)

  const { data: orgData, isLoading, isError, error, refetch } = useOrganization(organizationId)
  const deleteOrgMutation = useDeleteOrganization()

  const handleDelete = () => {
    deleteOrgMutation.mutate(organizationId, {
      onSuccess: () => {
        navigate({ to: '/dashboard/organizations' })
      },
    })
  }

  const organization = orgData?.data || orgData

  const displayName = organization
    ? (i18n.language === 'ar' 
        ? (organization.nameAr || organization.legalNameAr || organization.name || organization.legalName || 'منظمة')
        : (organization.name || organization.legalName || organization.nameAr || organization.legalNameAr || 'Organization'))
    : ''

  const topNav = [
    { title: 'جهات الاتصال', href: '/dashboard/contacts', isActive: false },
    { title: 'العملاء', href: '/dashboard/clients', isActive: false },
    { title: 'المنظمات', href: '/dashboard/organizations', isActive: true },
  ]

  const getConflictIcon = (status: string) => {
    if (status === 'clear') return CheckCircle
    if (status === 'confirmed_conflict') return Shield
    return AlertTriangle
  }

  return (
    <>
      <Header className="bg-navy shadow-none relative">
        <TopNav links={topNav} className="[&>a]:text-slate-300 [&>a:hover]:text-white [&>a[aria-current='page']]:text-white" />
        <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 z-50">
          <DynamicIsland />
        </div>
        <div className="ms-auto flex items-center gap-4">
          <div className="relative hidden md:block">
            <Search className="absolute end-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-500" />
            <input type="text" placeholder="بحث..." className="h-9 w-64 rounded-xl border border-white/10 bg-white/5 pe-9 ps-4 text-sm text-white placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/50" />
          </div>
          <Button variant="ghost" size="icon" className="relative rounded-full text-slate-300 hover:bg-white/10 hover:text-white">
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

      <Main fluid={true} className="bg-[#f8f9fa] flex-1 w-full p-6 lg:p-8 space-y-8 rounded-tr-3xl shadow-inner border-e border-white/5 overflow-hidden font-['IBM_Plex_Sans_Arabic']">
        <div className="mb-6">
          <Link to="/dashboard/organizations" className="inline-flex items-center text-slate-500 hover:text-navy transition-colors">
            <ArrowLeft className="h-4 w-4 ms-2" />
            العودة إلى قائمة المنظمات
          </Link>
        </div>

        {isLoading && (
          <div className="space-y-6">
            <Skeleton className="h-48 w-full rounded-3xl" />
            <div className="grid grid-cols-12 gap-6">
              <div className="col-span-12 lg:col-span-8"><Skeleton className="h-96 w-full rounded-2xl" /></div>
              <div className="col-span-12 lg:col-span-4"><Skeleton className="h-96 w-full rounded-2xl" /></div>
            </div>
          </div>
        )}

        {isError && (
          <div className="bg-white rounded-2xl p-12 border border-slate-100 text-center">
            <div className="flex justify-center mb-4">
              <div className="w-16 h-16 rounded-full bg-red-50 flex items-center justify-center">
                <AlertCircle className="w-8 h-8 text-red-500" />
              </div>
            </div>
            <h3 className="text-lg font-bold text-slate-900 mb-2">حدث خطأ أثناء تحميل بيانات المنظمة</h3>
            <p className="text-slate-500 mb-4">{error?.message || 'تعذر الاتصال بالخادم'}</p>
            <Button onClick={() => refetch()} className="bg-emerald-500 hover:bg-emerald-600">إعادة المحاولة</Button>
          </div>
        )}

        {!isLoading && !isError && !organization && (
          <div className="bg-white rounded-2xl p-12 border border-slate-100 text-center">
            <div className="flex justify-center mb-4">
              <div className="w-16 h-16 rounded-full bg-emerald-50 flex items-center justify-center">
                <Building2 className="w-8 h-8 text-emerald-500" />
              </div>
            </div>
            <h3 className="text-lg font-bold text-slate-900 mb-2">المنظمة غير موجودة</h3>
            <p className="text-slate-500 mb-4">لم يتم العثور على المنظمة المطلوبة</p>
            <Button asChild className="bg-emerald-500 hover:bg-emerald-600">
              <Link to="/dashboard/organizations">العودة إلى القائمة</Link>
            </Button>
          </div>
        )}

        {!isLoading && !isError && organization && (
          <>
            <ProductivityHero badge="المنظمات" title={displayName} type="organizations" listMode={true} hideButtons={true}>
              <div className="flex flex-wrap gap-3">
                <Link to={`/dashboard/organizations/${organizationId}/edit`}>
                  <Button variant="outline" className="border-white/10 text-white hover:bg-white/10 hover:text-white backdrop-blur-sm">
                    <Edit3 className="h-4 w-4 ms-2" />
                    تعديل
                  </Button>
                </Link>
                {!showDeleteConfirm ? (
                  <Button variant="outline" onClick={() => setShowDeleteConfirm(true)} className="border-red-500/30 text-red-300 hover:bg-red-500/20 hover:text-red-200 backdrop-blur-sm">
                    <Trash2 className="h-4 w-4" />
                  </Button>
                ) : (
                  <div className="flex gap-2">
                    <Button variant="outline" size="sm" onClick={() => setShowDeleteConfirm(false)} className="border-white/10 text-white hover:bg-white/10">إلغاء</Button>
                    <Button variant="destructive" size="sm" onClick={handleDelete} disabled={deleteOrgMutation.isPending} className="bg-red-500 hover:bg-red-600">
                      {deleteOrgMutation.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : 'تأكيد الحذف'}
                    </Button>
                  </div>
                )}
              </div>
            </ProductivityHero>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              <div className="lg:col-span-2">
                <Card className="border border-slate-100 shadow-sm rounded-2xl overflow-hidden min-h-[600px]">
                  <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
                    <div className="border-b border-slate-100 px-6 pt-4">
                      <TabsList className="bg-transparent h-auto p-0 gap-6">
                        {['overview', 'registration', 'financial', 'notes'].map((tab) => (
                          <TabsTrigger key={tab} value={tab} className="data-[state=active]:bg-transparent data-[state=active]:shadow-none data-[state=active]:border-b-2 data-[state=active]:border-emerald-500 data-[state=active]:text-emerald-600 text-slate-500 font-medium text-base pb-4 rounded-none px-2">
                            {tab === 'overview' ? 'نظرة عامة' : tab === 'registration' ? 'التسجيل' : tab === 'financial' ? 'المالية' : 'الملاحظات'}
                          </TabsTrigger>
                        ))}
                      </TabsList>
                    </div>

                    <div className="p-6 bg-slate-50/50 min-h-[500px]">
                      <TabsContent value="overview" className="mt-0 space-y-6">
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
                                  <p className="font-medium text-navy" dir="ltr">{organization.phone || 'غير محدد'}</p>
                                </div>
                              </div>
                              {organization.fax && (
                                <div className="flex items-center gap-3 p-3 bg-slate-50 rounded-xl">
                                  <Phone className="h-5 w-5 text-slate-500" />
                                  <div>
                                    <p className="text-xs text-slate-500">فاكس</p>
                                    <p className="font-medium text-navy" dir="ltr">{organization.fax}</p>
                                  </div>
                                </div>
                              )}
                            </div>
                            <div className="space-y-4">
                              <div className="flex items-center gap-3 p-3 bg-slate-50 rounded-xl">
                                <Mail className="h-5 w-5 text-blue-500" />
                                <div>
                                  <p className="text-xs text-slate-500">البريد الإلكتروني</p>
                                  <p className="font-medium text-navy" dir="ltr">{organization.email || 'غير محدد'}</p>
                                </div>
                              </div>
                              {organization.website && (
                                <div className="flex items-center gap-3 p-3 bg-slate-50 rounded-xl">
                                  <Globe className="h-5 w-5 text-purple-500" />
                                  <div>
                                    <p className="text-xs text-slate-500">الموقع الإلكتروني</p>
                                    <p className="font-medium text-navy" dir="ltr">{organization.website}</p>
                                  </div>
                                </div>
                              )}
                            </div>
                          </CardContent>
                        </Card>

                        <Card className="border-none shadow-sm bg-white rounded-2xl overflow-hidden">
                          <CardHeader>
                            <CardTitle className="text-lg font-bold text-navy flex items-center gap-2">
                              <Tag className="h-5 w-5 text-blue-500" />
                              النوع والتصنيف
                            </CardTitle>
                          </CardHeader>
                          <CardContent>
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                              <div className="p-4 bg-slate-50 rounded-xl">
                                <p className="text-xs text-slate-500 mb-1">نوع المنظمة</p>
                                <Badge className="bg-blue-100 text-blue-700">{ORG_TYPE_LABELS[organization.type] || organization.type || 'غير محدد'}</Badge>
                              </div>
                              <div className="p-4 bg-slate-50 rounded-xl">
                                <p className="text-xs text-slate-500 mb-1">الحالة</p>
                                <Badge className={STATUS_LABELS[organization.status]?.color || 'bg-gray-100 text-gray-700'}>{STATUS_LABELS[organization.status]?.label || organization.status || 'غير محدد'}</Badge>
                              </div>
                              <div className="p-4 bg-slate-50 rounded-xl">
                                <p className="text-xs text-slate-500 mb-1">الحجم</p>
                                <span className="text-slate-700 text-sm">{SIZE_LABELS[organization.size] || organization.size || 'غير محدد'}</span>
                              </div>
                              <div className="p-4 bg-slate-50 rounded-xl">
                                <p className="text-xs text-slate-500 mb-1">الصناعة</p>
                                <span className="text-slate-700 text-sm">{organization.industry || 'غير محدد'}</span>
                              </div>
                            </div>
                          </CardContent>
                        </Card>

                        <Card className="border-none shadow-sm bg-white rounded-2xl overflow-hidden">
                          <CardHeader>
                            <CardTitle className="text-lg font-bold text-navy flex items-center gap-2">
                              <MapPin className="h-5 w-5 text-red-500" />
                              العنوان
                            </CardTitle>
                          </CardHeader>
                          <CardContent>
                            <p className="text-slate-600">{[organization.address, organization.district, organization.city, organization.province, organization.postalCode, organization.country].filter(Boolean).join(', ') || 'غير محدد'}</p>
                            {organization.nationalAddress && <p className="text-slate-500 text-sm mt-2">العنوان الوطني: {organization.nationalAddress}</p>}
                          </CardContent>
                        </Card>

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
                                const status = CONFLICT_STATUS_LABELS[organization.conflictCheckStatus] || CONFLICT_STATUS_LABELS.not_checked
                                const Icon = getConflictIcon(organization.conflictCheckStatus)
                                return (
                                  <>
                                    <Icon className={`h-5 w-5 ${status.iconColor}`} />
                                    <Badge className={status.color}>{status.label}</Badge>
                                  </>
                                )
                              })()}
                            </div>
                            {organization.conflictNotes && (
                              <div className="mt-4 p-4 bg-orange-50 rounded-xl">
                                <p className="text-xs text-orange-600 mb-2">ملاحظات التعارض</p>
                                <p className="text-slate-600">{organization.conflictNotes}</p>
                              </div>
                            )}
                          </CardContent>
                        </Card>
                      </TabsContent>

                      <TabsContent value="registration" className="mt-0 space-y-6">
                        <Card className="border-none shadow-sm bg-white rounded-2xl overflow-hidden">
                          <CardHeader>
                            <CardTitle className="text-lg font-bold text-navy flex items-center gap-2">
                              <CreditCard className="h-5 w-5 text-blue-500" />
                              التسجيل السعودي
                            </CardTitle>
                          </CardHeader>
                          <CardContent className="space-y-4">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                              {organization.commercialRegistration && (
                                <div className="p-4 bg-slate-50 rounded-xl">
                                  <p className="text-xs text-slate-500 mb-1">السجل التجاري</p>
                                  <p className="font-medium text-navy" dir="ltr">{organization.commercialRegistration}</p>
                                </div>
                              )}
                              {organization.vatNumber && (
                                <div className="p-4 bg-slate-50 rounded-xl">
                                  <p className="text-xs text-slate-500 mb-1">الرقم الضريبي</p>
                                  <p className="font-medium text-navy" dir="ltr">{organization.vatNumber}</p>
                                </div>
                              )}
                              {organization.unifiedNumber && (
                                <div className="p-4 bg-slate-50 rounded-xl">
                                  <p className="text-xs text-slate-500 mb-1">الرقم الموحد</p>
                                  <p className="font-medium text-navy" dir="ltr">{organization.unifiedNumber}</p>
                                </div>
                              )}
                              {organization.municipalLicense && (
                                <div className="p-4 bg-slate-50 rounded-xl">
                                  <p className="text-xs text-slate-500 mb-1">رخصة البلدية</p>
                                  <p className="font-medium text-navy" dir="ltr">{organization.municipalLicense}</p>
                                </div>
                              )}
                              {organization.crIssueDate && (
                                <div className="p-4 bg-slate-50 rounded-xl">
                                  <p className="text-xs text-slate-500 mb-1">تاريخ إصدار السجل</p>
                                  <p className="font-medium text-navy">{new Date(organization.crIssueDate).toLocaleDateString('ar-SA')}</p>
                                </div>
                              )}
                              {organization.crExpiryDate && (
                                <div className="p-4 bg-slate-50 rounded-xl">
                                  <p className="text-xs text-slate-500 mb-1">تاريخ انتهاء السجل</p>
                                  <p className="font-medium text-navy">{new Date(organization.crExpiryDate).toLocaleDateString('ar-SA')}</p>
                                </div>
                              )}
                            </div>
                            {!organization.commercialRegistration && !organization.vatNumber && (
                              <p className="text-slate-500 text-center py-8">لا توجد معلومات تسجيل مسجلة</p>
                            )}
                          </CardContent>
                        </Card>
                      </TabsContent>

                      <TabsContent value="financial" className="mt-0 space-y-6">
                        <Card className="border-none shadow-sm bg-white rounded-2xl overflow-hidden">
                          <CardHeader>
                            <CardTitle className="text-lg font-bold text-navy flex items-center gap-2">
                              <DollarSign className="h-5 w-5 text-green-500" />
                              المعلومات المالية
                            </CardTitle>
                          </CardHeader>
                          <CardContent className="space-y-4">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                              {organization.capital && (
                                <div className="p-4 bg-slate-50 rounded-xl">
                                  <p className="text-xs text-slate-500 mb-1">رأس المال</p>
                                  <p className="font-medium text-navy">{(organization.capital / 100).toLocaleString('ar-SA')} ريال</p>
                                </div>
                              )}
                              {organization.annualRevenue && (
                                <div className="p-4 bg-slate-50 rounded-xl">
                                  <p className="text-xs text-slate-500 mb-1">الإيراد السنوي</p>
                                  <p className="font-medium text-navy">{(organization.annualRevenue / 100).toLocaleString('ar-SA')} ريال</p>
                                </div>
                              )}
                              {organization.creditLimit && (
                                <div className="p-4 bg-slate-50 rounded-xl">
                                  <p className="text-xs text-slate-500 mb-1">الحد الائتماني</p>
                                  <p className="font-medium text-navy">{(organization.creditLimit / 100).toLocaleString('ar-SA')} ريال</p>
                                </div>
                              )}
                              {organization.paymentTerms && (
                                <div className="p-4 bg-slate-50 rounded-xl">
                                  <p className="text-xs text-slate-500 mb-1">شروط الدفع</p>
                                  <p className="font-medium text-navy">{organization.paymentTerms} يوم</p>
                                </div>
                              )}
                            </div>
                          </CardContent>
                        </Card>

                        <Card className="border-none shadow-sm bg-white rounded-2xl overflow-hidden">
                          <CardHeader>
                            <CardTitle className="text-lg font-bold text-navy flex items-center gap-2">
                              <Building className="h-5 w-5 text-blue-500" />
                              المعلومات البنكية
                            </CardTitle>
                          </CardHeader>
                          <CardContent className="space-y-4">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                              {organization.bankName && (
                                <div className="p-4 bg-slate-50 rounded-xl">
                                  <p className="text-xs text-slate-500 mb-1">البنك</p>
                                  <p className="font-medium text-navy">{organization.bankName}</p>
                                </div>
                              )}
                              {organization.iban && (
                                <div className="p-4 bg-slate-50 rounded-xl">
                                  <p className="text-xs text-slate-500 mb-1">IBAN</p>
                                  <p className="font-medium text-navy" dir="ltr">{maskIBAN(organization.iban)}</p>
                                </div>
                              )}
                              {organization.accountHolderName && (
                                <div className="p-4 bg-slate-50 rounded-xl">
                                  <p className="text-xs text-slate-500 mb-1">اسم صاحب الحساب</p>
                                  <p className="font-medium text-navy">{organization.accountHolderName}</p>
                                </div>
                              )}
                              {organization.swiftCode && (
                                <div className="p-4 bg-slate-50 rounded-xl">
                                  <p className="text-xs text-slate-500 mb-1">SWIFT</p>
                                  <p className="font-medium text-navy" dir="ltr">{organization.swiftCode}</p>
                                </div>
                              )}
                            </div>
                            {!organization.bankName && !organization.iban && (
                              <p className="text-slate-500 text-center py-8">لا توجد معلومات بنكية مسجلة</p>
                            )}
                          </CardContent>
                        </Card>
                      </TabsContent>

                      <TabsContent value="notes" className="mt-0 space-y-6">
                        <Card className="border-none shadow-sm bg-white rounded-2xl overflow-hidden">
                          <CardHeader>
                            <CardTitle className="text-lg font-bold text-navy flex items-center gap-2">
                              <FileText className="h-5 w-5 text-slate-500" />
                              الملاحظات
                            </CardTitle>
                          </CardHeader>
                          <CardContent>
                            <p className="text-slate-600 leading-relaxed whitespace-pre-wrap">{organization.notes || 'لا توجد ملاحظات'}</p>
                          </CardContent>
                        </Card>

                        {organization.description && (
                          <Card className="border-none shadow-sm bg-white rounded-2xl overflow-hidden">
                            <CardHeader>
                              <CardTitle className="text-lg font-bold text-navy flex items-center gap-2">
                                <FileText className="h-5 w-5 text-slate-500" />
                                الوصف
                              </CardTitle>
                            </CardHeader>
                            <CardContent>
                              <p className="text-slate-600 leading-relaxed whitespace-pre-wrap">{organization.description}</p>
                            </CardContent>
                          </Card>
                        )}

                        {organization.tags && organization.tags.length > 0 && (
                          <Card className="border-none shadow-sm bg-white rounded-2xl overflow-hidden">
                            <CardHeader>
                              <CardTitle className="text-lg font-bold text-navy flex items-center gap-2">
                                <Tag className="h-5 w-5 text-blue-500" />
                                الوسوم
                              </CardTitle>
                            </CardHeader>
                            <CardContent>
                              <div className="flex flex-wrap gap-2">
                                {organization.tags.map((tag: string, i: number) => (
                                  <Badge key={i} variant="secondary" className="rounded-full">{tag}</Badge>
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

              <ClientsSidebar context="organizations" />
            </div>
          </>
        )}
      </Main>
    </>
  )
}
