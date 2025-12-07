/**
 * Contact Details View - Comprehensive Law Firm CRM
 *
 * Features:
 * - Full contact information display
 * - Saudi-specific identification
 * - Contact type & classification
 * - Conflict check status
 * - Communication preferences
 * - Related cases and activities
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
  MessageSquare,
  Building2,
  Shield,
  Star,
  Briefcase,
  Tag,
  CheckCircle,
  AlertTriangle,
  Link as LinkIcon,
  Globe,
  CreditCard,
} from 'lucide-react'
import { Skeleton } from '@/components/ui/skeleton'
import { useContact, useDeleteContact } from '@/hooks/useContacts'
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

const CONTACT_TYPE_LABELS: Record<string, string> = {
  individual: 'فرد',
  organization: 'منظمة',
  court: 'محكمة',
  attorney: 'محامي',
  expert: 'خبير',
  government: 'جهة حكومية',
  other: 'أخرى',
}

const ROLE_LABELS: Record<string, string> = {
  client_contact: 'جهة اتصال عميل',
  opposing_party: 'الطرف المقابل',
  opposing_counsel: 'محامي الطرف المقابل',
  witness: 'شاهد',
  expert_witness: 'شاهد خبير',
  judge: 'قاضي',
  court_clerk: 'كاتب محكمة',
  mediator: 'وسيط',
  arbitrator: 'محكّم',
  referral_source: 'مصدر إحالة',
  vendor: 'مورد',
  other: 'أخرى',
}

const STATUS_LABELS: Record<string, { label: string; color: string }> = {
  active: { label: 'نشط', color: 'bg-emerald-100 text-emerald-700' },
  inactive: { label: 'غير نشط', color: 'bg-gray-100 text-gray-700' },
  archived: { label: 'مؤرشف', color: 'bg-slate-100 text-slate-700' },
  deceased: { label: 'متوفي', color: 'bg-red-100 text-red-700' },
}

const CONFLICT_STATUS_LABELS: Record<string, { label: string; color: string; icon: typeof AlertTriangle }> = {
  not_checked: { label: 'لم يتم الفحص', color: 'bg-gray-100 text-gray-700', icon: AlertTriangle },
  clear: { label: 'واضح - لا يوجد تعارض', color: 'bg-emerald-100 text-emerald-700', icon: CheckCircle },
  potential_conflict: { label: 'تعارض محتمل', color: 'bg-yellow-100 text-yellow-700', icon: AlertTriangle },
  confirmed_conflict: { label: 'تعارض مؤكد', color: 'bg-red-100 text-red-700', icon: Shield },
}

export function ContactDetailsView() {
  const { contactId } = useParams({ strict: false }) as { contactId: string }
  const navigate = useNavigate()
  const [activeTab, setActiveTab] = useState('overview')
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)

  // Fetch contact data
  const { data: contactData, isLoading, isError, error, refetch } = useContact(contactId)

  // Mutations
  const deleteContactMutation = useDeleteContact()

  const handleDelete = () => {
    deleteContactMutation.mutate(contactId, {
      onSuccess: () => {
        navigate({ to: '/dashboard/contacts' })
      },
    })
  }

  // Transform API data
  const contact = contactData?.data || contactData

  // Build display name
  const displayName = contact
    ? [contact.salutation, contact.firstName, contact.middleName, contact.lastName]
        .filter(Boolean)
        .join(' ') || contact.preferredName || 'جهة اتصال'
    : ''

  const topNav = [
    { title: 'جهات الاتصال', href: '/dashboard/contacts', isActive: true },
    { title: 'العملاء', href: '/dashboard/clients', isActive: false },
    { title: 'المنظمات', href: '/dashboard/organizations', isActive: false },
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
            <Search className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-500" aria-hidden="true" />
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
        <div className="absolute bottom-0 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-emerald-500/50 to-transparent"></div>
      </Header>

      <Main
        fluid={true}
        className="bg-[#f8f9fa] flex-1 w-full p-6 lg:p-8 space-y-8 rounded-tr-3xl shadow-inner border-r border-white/5 overflow-hidden font-['IBM_Plex_Sans_Arabic']"
      >
        {/* Breadcrumb / Back Link */}
        <div className="mb-6">
          <Link
            to="/dashboard/contacts"
            className="inline-flex items-center text-slate-500 hover:text-navy transition-colors"
          >
            <ArrowLeft className="h-4 w-4 ms-2" />
            العودة إلى قائمة جهات الاتصال
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
              حدث خطأ أثناء تحميل بيانات جهة الاتصال
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
        {!isLoading && !isError && !contact && (
          <div className="bg-white rounded-2xl p-12 border border-slate-100 text-center">
            <div className="flex justify-center mb-4">
              <div className="w-16 h-16 rounded-full bg-emerald-50 flex items-center justify-center">
                <User className="w-8 h-8 text-emerald-500" aria-hidden="true" />
              </div>
            </div>
            <h3 className="text-lg font-bold text-slate-900 mb-2">
              جهة الاتصال غير موجودة
            </h3>
            <p className="text-slate-500 mb-4">
              لم يتم العثور على جهة الاتصال المطلوبة
            </p>
            <Button asChild className="bg-emerald-500 hover:bg-emerald-600">
              <Link to="/dashboard/contacts">العودة إلى القائمة</Link>
            </Button>
          </div>
        )}

        {/* Success State */}
        {!isLoading && !isError && contact && (
          <>
            {/* Contact Hero Content */}
            <ProductivityHero
              badge="جهات الاتصال"
              title={displayName}
              type="contacts"
              listMode={true}
              hideButtons={true}
            >
              <div className="flex flex-wrap gap-3">
                <Link to={`/dashboard/contacts/${contactId}/edit`}>
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
                      disabled={deleteContactMutation.isPending}
                      className="bg-red-500 hover:bg-red-600"
                    >
                      {deleteContactMutation.isPending ? (
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
                        {['overview', 'identification', 'communication', 'notes'].map(
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
                                : tab === 'identification'
                                  ? 'الهوية'
                                  : tab === 'communication'
                                    ? 'التواصل'
                                    : 'الملاحظات'}
                            </TabsTrigger>
                          )
                        )}
                      </TabsList>
                    </div>

                    <div className="p-6 bg-slate-50/50 min-h-[500px]">
                      {/* Overview Tab */}
                      <TabsContent value="overview" className="mt-0 space-y-6">
                        {/* Contact Info */}
                        <Card className="border-none shadow-sm bg-white rounded-2xl overflow-hidden">
                          <CardHeader>
                            <CardTitle className="text-lg font-bold text-navy flex items-center gap-2">
                              <Phone className="h-5 w-5 text-emerald-500" aria-hidden="true" />
                              معلومات الاتصال
                            </CardTitle>
                          </CardHeader>
                          <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="space-y-4">
                              {/* Primary Phone */}
                              <div className="flex items-center gap-3 p-3 bg-slate-50 rounded-xl">
                                <Phone className="h-5 w-5 text-emerald-500" aria-hidden="true" />
                                <div>
                                  <p className="text-xs text-slate-500">الهاتف الرئيسي</p>
                                  <p className="font-medium text-navy" dir="ltr">
                                    {contact.phone || contact.phones?.[0]?.number || 'غير محدد'}
                                  </p>
                                </div>
                              </div>
                              {/* Additional Phones */}
                              {contact.phones?.slice(1).map((phone: any, idx: number) => (
                                <div key={idx} className="flex items-center gap-3 p-3 bg-slate-50 rounded-xl">
                                  <Phone className="h-5 w-5 text-slate-500" aria-hidden="true" />
                                  <div>
                                    <p className="text-xs text-slate-500">{phone.type === 'mobile' ? 'جوال' : phone.type === 'work' ? 'عمل' : phone.type}</p>
                                    <p className="font-medium text-navy" dir="ltr">{phone.number}</p>
                                  </div>
                                </div>
                              ))}
                            </div>
                            <div className="space-y-4">
                              {/* Primary Email */}
                              <div className="flex items-center gap-3 p-3 bg-slate-50 rounded-xl">
                                <Mail className="h-5 w-5 text-blue-500" aria-hidden="true" />
                                <div>
                                  <p className="text-xs text-slate-500">البريد الإلكتروني</p>
                                  <p className="font-medium text-navy" dir="ltr">
                                    {contact.email || contact.emails?.[0]?.email || 'غير محدد'}
                                  </p>
                                </div>
                              </div>
                              {/* Additional Emails */}
                              {contact.emails?.slice(1).map((email: any, idx: number) => (
                                <div key={idx} className="flex items-center gap-3 p-3 bg-slate-50 rounded-xl">
                                  <Mail className="h-5 w-5 text-slate-500" aria-hidden="true" />
                                  <div>
                                    <p className="text-xs text-slate-500">{email.type === 'work' ? 'عمل' : email.type === 'personal' ? 'شخصي' : email.type}</p>
                                    <p className="font-medium text-navy" dir="ltr">{email.email}</p>
                                  </div>
                                </div>
                              ))}
                            </div>
                          </CardContent>
                        </Card>

                        {/* Type & Classification */}
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
                                <p className="text-xs text-slate-500 mb-1">نوع جهة الاتصال</p>
                                <Badge className="bg-blue-100 text-blue-700">
                                  {CONTACT_TYPE_LABELS[contact.type] || contact.type || 'غير محدد'}
                                </Badge>
                              </div>
                              <div className="p-4 bg-slate-50 rounded-xl">
                                <p className="text-xs text-slate-500 mb-1">الدور الأساسي</p>
                                <Badge className="bg-purple-100 text-purple-700">
                                  {ROLE_LABELS[contact.primaryRole] || contact.primaryRole || 'غير محدد'}
                                </Badge>
                              </div>
                              <div className="p-4 bg-slate-50 rounded-xl">
                                <p className="text-xs text-slate-500 mb-1">الحالة</p>
                                <Badge className={STATUS_LABELS[contact.status]?.color || 'bg-gray-100 text-gray-700'}>
                                  {STATUS_LABELS[contact.status]?.label || contact.status || 'غير محدد'}
                                </Badge>
                              </div>
                              <div className="p-4 bg-slate-50 rounded-xl">
                                <p className="text-xs text-slate-500 mb-1">VIP</p>
                                {contact.vipStatus ? (
                                  <Badge className="bg-yellow-100 text-yellow-700">
                                    <Star className="h-3 w-3 ms-1" />
                                    VIP
                                  </Badge>
                                ) : (
                                  <span className="text-slate-500 text-sm">لا</span>
                                )}
                              </div>
                            </div>
                          </CardContent>
                        </Card>

                        {/* Employment Info */}
                        {(contact.company || contact.jobTitle || contact.department) && (
                          <Card className="border-none shadow-sm bg-white rounded-2xl overflow-hidden">
                            <CardHeader>
                              <CardTitle className="text-lg font-bold text-navy flex items-center gap-2">
                                <Briefcase className="h-5 w-5 text-orange-500" />
                                العمل والانتماء
                              </CardTitle>
                            </CardHeader>
                            <CardContent>
                              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                {contact.company && (
                                  <div className="p-4 bg-slate-50 rounded-xl">
                                    <p className="text-xs text-slate-500 mb-1">الشركة / الجهة</p>
                                    <p className="font-medium text-navy">{contact.company}</p>
                                  </div>
                                )}
                                {contact.jobTitle && (
                                  <div className="p-4 bg-slate-50 rounded-xl">
                                    <p className="text-xs text-slate-500 mb-1">المسمى الوظيفي</p>
                                    <p className="font-medium text-navy">{contact.jobTitle || contact.title}</p>
                                  </div>
                                )}
                                {contact.department && (
                                  <div className="p-4 bg-slate-50 rounded-xl">
                                    <p className="text-xs text-slate-500 mb-1">القسم</p>
                                    <p className="font-medium text-navy">{contact.department}</p>
                                  </div>
                                )}
                              </div>
                            </CardContent>
                          </Card>
                        )}

                        {/* Address */}
                        {(contact.address || contact.street || contact.city) && (
                          <Card className="border-none shadow-sm bg-white rounded-2xl overflow-hidden">
                            <CardHeader>
                              <CardTitle className="text-lg font-bold text-navy flex items-center gap-2">
                                <MapPin className="h-5 w-5 text-red-500" aria-hidden="true" />
                                العنوان
                              </CardTitle>
                            </CardHeader>
                            <CardContent>
                              <p className="text-slate-600">
                                {[
                                  contact.street || contact.address,
                                  contact.district,
                                  contact.city,
                                  contact.postalCode,
                                  contact.country,
                                ]
                                  .filter(Boolean)
                                  .join(', ') || 'غير محدد'}
                              </p>
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
                                const status = CONFLICT_STATUS_LABELS[contact.conflictCheckStatus] || CONFLICT_STATUS_LABELS.not_checked
                                const Icon = status.icon
                                return (
                                  <>
                                    <Icon className={`h-5 w-5 ${status.color.replace('bg-', 'text-').replace('-100', '-500')}`} />
                                    <Badge className={status.color}>{status.label}</Badge>
                                  </>
                                )
                              })()}
                            </div>
                            {contact.conflictNotes && (
                              <div className="mt-4 p-4 bg-orange-50 rounded-xl">
                                <p className="text-xs text-orange-600 mb-2">ملاحظات التعارض</p>
                                <p className="text-slate-600">{contact.conflictNotes}</p>
                              </div>
                            )}
                          </CardContent>
                        </Card>
                      </TabsContent>

                      {/* Identification Tab */}
                      <TabsContent value="identification" className="mt-0 space-y-6">
                        <Card className="border-none shadow-sm bg-white rounded-2xl overflow-hidden">
                          <CardHeader>
                            <CardTitle className="text-lg font-bold text-navy flex items-center gap-2">
                              <CreditCard className="h-5 w-5 text-blue-500" />
                              الهوية والتعريف
                            </CardTitle>
                          </CardHeader>
                          <CardContent className="space-y-4">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                              {contact.nationalId && (
                                <div className="p-4 bg-slate-50 rounded-xl">
                                  <p className="text-xs text-slate-500 mb-1">رقم الهوية الوطنية</p>
                                  <p className="font-medium text-navy" dir="ltr">{contact.nationalId}</p>
                                </div>
                              )}
                              {contact.iqamaNumber && (
                                <div className="p-4 bg-slate-50 rounded-xl">
                                  <p className="text-xs text-slate-500 mb-1">رقم الإقامة</p>
                                  <p className="font-medium text-navy" dir="ltr">{contact.iqamaNumber}</p>
                                </div>
                              )}
                              {contact.passportNumber && (
                                <div className="p-4 bg-slate-50 rounded-xl">
                                  <p className="text-xs text-slate-500 mb-1">رقم جواز السفر</p>
                                  <p className="font-medium text-navy" dir="ltr">{contact.passportNumber}</p>
                                </div>
                              )}
                              {contact.passportCountry && (
                                <div className="p-4 bg-slate-50 rounded-xl">
                                  <p className="text-xs text-slate-500 mb-1">دولة الجواز</p>
                                  <p className="font-medium text-navy">{contact.passportCountry}</p>
                                </div>
                              )}
                              {contact.dateOfBirth && (
                                <div className="p-4 bg-slate-50 rounded-xl">
                                  <p className="text-xs text-slate-500 mb-1">تاريخ الميلاد</p>
                                  <p className="font-medium text-navy">
                                    {new Date(contact.dateOfBirth).toLocaleDateString('ar-SA')}
                                  </p>
                                </div>
                              )}
                              {contact.nationality && (
                                <div className="p-4 bg-slate-50 rounded-xl">
                                  <p className="text-xs text-slate-500 mb-1">الجنسية</p>
                                  <p className="font-medium text-navy">{contact.nationality}</p>
                                </div>
                              )}
                            </div>
                            {!contact.nationalId && !contact.iqamaNumber && !contact.passportNumber && (
                              <p className="text-slate-500 text-center py-8">لا توجد معلومات هوية مسجلة</p>
                            )}
                          </CardContent>
                        </Card>
                      </TabsContent>

                      {/* Communication Tab */}
                      <TabsContent value="communication" className="mt-0 space-y-6">
                        <Card className="border-none shadow-sm bg-white rounded-2xl overflow-hidden">
                          <CardHeader>
                            <CardTitle className="text-lg font-bold text-navy flex items-center gap-2">
                              <MessageSquare className="h-5 w-5 text-purple-500" />
                              تفضيلات التواصل
                            </CardTitle>
                          </CardHeader>
                          <CardContent className="space-y-4">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                              <div className="p-4 bg-slate-50 rounded-xl">
                                <p className="text-xs text-slate-500 mb-1">اللغة المفضلة</p>
                                <p className="font-medium text-navy">
                                  {contact.preferredLanguage === 'ar' ? 'العربية' :
                                   contact.preferredLanguage === 'en' ? 'الإنجليزية' :
                                   contact.preferredLanguage || 'غير محدد'}
                                </p>
                              </div>
                              <div className="p-4 bg-slate-50 rounded-xl">
                                <p className="text-xs text-slate-500 mb-1">طريقة التواصل المفضلة</p>
                                <p className="font-medium text-navy">
                                  {contact.preferredContactMethod === 'email' ? 'البريد الإلكتروني' :
                                   contact.preferredContactMethod === 'phone' ? 'الهاتف' :
                                   contact.preferredContactMethod === 'sms' ? 'رسالة نصية' :
                                   contact.preferredContactMethod === 'whatsapp' ? 'واتساب' :
                                   contact.preferredContactMethod || 'غير محدد'}
                                </p>
                              </div>
                              {contact.bestTimeToContact && (
                                <div className="p-4 bg-slate-50 rounded-xl">
                                  <p className="text-xs text-slate-500 mb-1">أفضل وقت للتواصل</p>
                                  <p className="font-medium text-navy">{contact.bestTimeToContact}</p>
                                </div>
                              )}
                            </div>

                            {/* Do Not Contact Flags */}
                            <div className="flex flex-wrap gap-3 pt-4">
                              {contact.doNotContact && (
                                <Badge className="bg-red-100 text-red-700">
                                  <AlertTriangle className="h-3 w-3 ms-1" aria-hidden="true" />
                                  عدم التواصل نهائياً
                                </Badge>
                              )}
                              {contact.doNotEmail && (
                                <Badge className="bg-orange-100 text-orange-700">
                                  عدم إرسال بريد إلكتروني
                                </Badge>
                              )}
                              {contact.doNotCall && (
                                <Badge className="bg-orange-100 text-orange-700">
                                  عدم الاتصال
                                </Badge>
                              )}
                              {contact.doNotSMS && (
                                <Badge className="bg-orange-100 text-orange-700">
                                  عدم إرسال رسائل نصية
                                </Badge>
                              )}
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
                              {contact.notes || 'لا توجد ملاحظات'}
                            </p>
                          </CardContent>
                        </Card>

                        {/* Tags */}
                        {contact.tags && contact.tags.length > 0 && (
                          <Card className="border-none shadow-sm bg-white rounded-2xl overflow-hidden">
                            <CardHeader>
                              <CardTitle className="text-lg font-bold text-navy flex items-center gap-2">
                                <Tag className="h-5 w-5 text-blue-500" />
                                الوسوم
                              </CardTitle>
                            </CardHeader>
                            <CardContent>
                              <div className="flex flex-wrap gap-2">
                                {contact.tags.map((tag: string, i: number) => (
                                  <Badge key={i} variant="secondary" className="rounded-full">
                                    {tag}
                                  </Badge>
                                ))}
                              </div>
                            </CardContent>
                          </Card>
                        )}

                        {/* Relationship Types */}
                        {contact.relationshipTypes && contact.relationshipTypes.length > 0 && (
                          <Card className="border-none shadow-sm bg-white rounded-2xl overflow-hidden">
                            <CardHeader>
                              <CardTitle className="text-lg font-bold text-navy flex items-center gap-2">
                                <LinkIcon className="h-5 w-5 text-emerald-500" />
                                العلاقة بالمكتب
                              </CardTitle>
                            </CardHeader>
                            <CardContent>
                              <div className="flex flex-wrap gap-2">
                                {contact.relationshipTypes.map((rel: string, i: number) => (
                                  <Badge key={i} className="bg-emerald-100 text-emerald-700 rounded-full">
                                    {rel === 'current_client' ? 'عميل حالي' :
                                     rel === 'former_client' ? 'عميل سابق' :
                                     rel === 'prospect' ? 'عميل محتمل' :
                                     rel === 'adverse_party' ? 'طرف معادي' :
                                     rel === 'related_party' ? 'طرف مرتبط' :
                                     rel === 'referral_source' ? 'مصدر إحالة' :
                                     rel === 'business_contact' ? 'جهة اتصال عمل' :
                                     rel === 'personal_contact' ? 'جهة اتصال شخصية' :
                                     rel}
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
              <ClientsSidebar context="contacts" />
            </div>
          </>
        )}
      </Main>
    </>
  )
}
