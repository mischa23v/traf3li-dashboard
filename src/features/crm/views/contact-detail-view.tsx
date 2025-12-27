/**
 * Contact Detail View - CRM Module
 *
 * Full-featured contact detail page with:
 * - Header with avatar, full name, company, VIP badge, conflict status badge
 * - Quick stats row (Total Cases, Last Activity, Risk Level)
 * - Tab Navigation (Overview, Cases, Activities, Documents)
 * - Overview Tab with comprehensive field groups
 * - RTL support and Arabic labels
 */

import { useState, useMemo } from 'react'
import {
  FileText,
  Calendar,
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
  Lock,
  Users,
  Linkedin,
  Twitter,
  Facebook,
  MoreHorizontal,
  UserPlus,
  Flag,
  TrendingUp,
  Activity,
} from 'lucide-react'
import { Skeleton } from '@/components/ui/skeleton'
import {
  useContact,
  useContactCases,
  useContactActivities,
  useDeleteContact,
  useRunConflictCheck,
  useLinkContactToCase,
} from '@/hooks/useContacts'
import { ProductivityHero } from '@/components/productivity-hero'
import { useParams, useNavigate } from '@tanstack/react-router'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { ScrollArea } from '@/components/ui/scroll-area'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Link } from '@tanstack/react-router'
import { Header } from '@/components/layout/header'
import { TopNav } from '@/components/layout/top-nav'
import { DynamicIsland } from '@/components/dynamic-island'
import { Main } from '@/components/layout/main'
import { LanguageSwitcher } from '@/components/language-switcher'
import { ThemeSwitch } from '@/components/theme-switch'
import { ConfigDrawer } from '@/components/config-drawer'
import { ProfileDropdown } from '@/components/profile-dropdown'
import { ROUTES } from '@/constants/routes'
import { formatDistanceToNow, format } from 'date-fns'
import { ar } from 'date-fns/locale'

// ═══════════════════════════════════════════════════════════════
// LABEL MAPPINGS
// ═══════════════════════════════════════════════════════════════

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
  clear: { label: 'واضح - لا تعارض', color: 'bg-emerald-100 text-emerald-700', icon: CheckCircle },
  potential_conflict: { label: 'تعارض محتمل', color: 'bg-yellow-100 text-yellow-700', icon: AlertTriangle },
  confirmed_conflict: { label: 'تعارض مؤكد', color: 'bg-red-100 text-red-700', icon: Shield },
}

const RISK_LEVEL_LABELS: Record<string, { label: string; color: string }> = {
  low: { label: 'منخفض', color: 'bg-green-100 text-green-700' },
  medium: { label: 'متوسط', color: 'bg-yellow-100 text-yellow-700' },
  high: { label: 'عالي', color: 'bg-orange-100 text-orange-700' },
  critical: { label: 'حرج', color: 'bg-red-100 text-red-700' },
}

const IDENTITY_TYPE_LABELS: Record<string, string> = {
  national_id: 'الهوية الوطنية',
  iqama: 'الإقامة',
  gcc_id: 'هوية مواطني الخليج',
  passport: 'جواز السفر',
  border_number: 'رقم الحدود',
  visitor_id: 'هوية زائر',
}

// ═══════════════════════════════════════════════════════════════
// COMPONENT
// ═══════════════════════════════════════════════════════════════

export function ContactDetailView() {
  const { contactId } = useParams({ strict: false }) as { contactId: string }
  const navigate = useNavigate()
  const [activeTab, setActiveTab] = useState('overview')
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)

  // Fetch contact data
  const { data: contactData, isLoading, isError, error, refetch } = useContact(contactId)
  const { data: casesData, isLoading: casesLoading } = useContactCases(contactId, !isLoading && !!contactData)
  const { data: activitiesData, isLoading: activitiesLoading } = useContactActivities(contactId, { limit: 10 }, !isLoading && !!contactData)

  // Mutations
  const deleteContactMutation = useDeleteContact()
  const runConflictCheckMutation = useRunConflictCheck()

  // Transform API data
  const contact = contactData?.data || contactData

  // Build display name
  const displayName = useMemo(() => {
    if (!contact) return ''
    return [contact.salutation, contact.firstName, contact.middleName, contact.lastName]
      .filter(Boolean)
      .join(' ') || contact.preferredName || contact.fullNameArabic || 'جهة اتصال'
  }, [contact])

  // Build initials for avatar
  const initials = useMemo(() => {
    if (!contact) return 'JA'
    const first = contact.firstName?.[0] || contact.preferredName?.[0] || ''
    const last = contact.lastName?.[0] || ''
    return (first + last).toUpperCase() || 'JA'
  }, [contact])

  // Calculate stats
  const stats = useMemo(() => {
    const totalCases = casesData?.total || contact?.linkedCases?.length || 0
    const lastActivity = activitiesData?.data?.[0]?.createdAt
    const riskLevel = contact?.riskLevel || 'low'

    return {
      totalCases,
      lastActivity,
      riskLevel,
    }
  }, [contact, casesData, activitiesData])

  const handleDelete = () => {
    deleteContactMutation.mutate(contactId, {
      onSuccess: () => {
        navigate({ to: ROUTES.dashboard.contacts.list })
      },
    })
  }

  const handleRunConflictCheck = () => {
    runConflictCheckMutation.mutate(contactId)
  }

  const topNav = [
    { title: 'جهات الاتصال', href: ROUTES.dashboard.contacts.list, isActive: true },
    { title: 'العملاء', href: ROUTES.dashboard.clients.list, isActive: false },
    { title: 'المنظمات', href: ROUTES.dashboard.organizations.list, isActive: false },
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
              aria-label="بحث"
              className="h-9 w-64 rounded-xl border border-white/10 bg-white/5 pe-9 ps-4 text-sm text-white placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/50"
            />
          </div>
          <Button
            variant="ghost"
            size="icon"
            aria-label="التنبيهات"
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
            to={ROUTES.dashboard.contacts.list}
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
              <Link to={ROUTES.dashboard.contacts.list}>العودة إلى القائمة</Link>
            </Button>
          </div>
        )}

        {/* Success State */}
        {!isLoading && !isError && contact && (
          <>
            {/* Contact Header Card */}
            <Card className="border border-slate-100 shadow-sm rounded-3xl overflow-hidden bg-gradient-to-br from-white to-slate-50">
              <CardContent className="p-8">
                <div className="flex flex-col md:flex-row gap-6">
                  {/* Avatar */}
                  <Avatar className="h-24 w-24 border-4 border-white shadow-lg">
                    <AvatarImage src={contact.photo} alt={displayName} />
                    <AvatarFallback className="bg-gradient-to-br from-emerald-500 to-emerald-600 text-white text-2xl font-bold">
                      {initials}
                    </AvatarFallback>
                  </Avatar>

                  {/* Contact Info */}
                  <div className="flex-1">
                    <div className="flex flex-wrap items-start gap-3 mb-2">
                      <h1 className="text-3xl font-bold text-navy">{displayName}</h1>
                      {contact.vipStatus && (
                        <Badge className="bg-yellow-100 text-yellow-700 flex items-center gap-1">
                          <Star className="h-3 w-3" fill="currentColor" />
                          VIP
                        </Badge>
                      )}
                      {contact.conflictCheckStatus && (
                        <Badge className={CONFLICT_STATUS_LABELS[contact.conflictCheckStatus]?.color || 'bg-gray-100 text-gray-700'}>
                          {CONFLICT_STATUS_LABELS[contact.conflictCheckStatus]?.label || contact.conflictCheckStatus}
                        </Badge>
                      )}
                      {contact.status && (
                        <Badge className={STATUS_LABELS[contact.status]?.color || 'bg-gray-100 text-gray-700'}>
                          {STATUS_LABELS[contact.status]?.label || contact.status}
                        </Badge>
                      )}
                    </div>

                    {/* Company / Organization */}
                    {(contact.company || contact.organizationId) && (
                      <div className="flex items-center gap-2 text-slate-600 mb-3">
                        <Building2 className="h-4 w-4" />
                        <span className="text-lg">
                          {typeof contact.organizationId === 'object'
                            ? contact.organizationId.legalName
                            : contact.company}
                        </span>
                      </div>
                    )}

                    {/* Contact Methods */}
                    <div className="flex flex-wrap gap-4 text-sm text-slate-600">
                      {(contact.email || contact.emails?.[0]?.email) && (
                        <div className="flex items-center gap-2">
                          <Mail className="h-4 w-4 text-emerald-500" />
                          <span>{contact.email || contact.emails[0].email}</span>
                        </div>
                      )}
                      {(contact.phone || contact.phones?.[0]?.number) && (
                        <div className="flex items-center gap-2">
                          <Phone className="h-4 w-4 text-blue-500" />
                          <span dir="ltr">{contact.phone || contact.phones[0].number}</span>
                        </div>
                      )}
                      {contact.title && (
                        <div className="flex items-center gap-2">
                          <Briefcase className="h-4 w-4 text-purple-500" />
                          <span>{contact.title}</span>
                        </div>
                      )}
                    </div>

                    {/* Action Buttons */}
                    <div className="flex flex-wrap gap-3 mt-6">
                      <Link to={`${ROUTES.dashboard.contacts.detail(contactId)}/edit`}>
                        <Button
                          variant="outline"
                          className="border-slate-200 hover:bg-slate-50"
                        >
                          <Edit3 className="h-4 w-4 ms-2" aria-hidden="true" />
                          تعديل
                        </Button>
                      </Link>
                      <Button
                        variant="outline"
                        className="border-emerald-200 text-emerald-600 hover:bg-emerald-50"
                      >
                        <UserPlus className="h-4 w-4 ms-2" aria-hidden="true" />
                        ربط بقضية
                      </Button>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="outline" className="border-slate-200 hover:bg-slate-50">
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem onClick={handleRunConflictCheck} disabled={runConflictCheckMutation.isPending}>
                            <Shield className="h-4 w-4 me-2" />
                            {runConflictCheckMutation.isPending ? 'جاري الفحص...' : 'فحص تعارض المصالح'}
                          </DropdownMenuItem>
                          <DropdownMenuItem>
                            <FileText className="h-4 w-4 me-2" />
                            إنشاء تقرير
                          </DropdownMenuItem>
                          <DropdownMenuItem className="text-red-600">
                            <Trash2 className="h-4 w-4 me-2" />
                            حذف
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                      {!showDeleteConfirm ? (
                        <Button
                          variant="outline"
                          aria-label="حذف"
                          onClick={() => setShowDeleteConfirm(true)}
                          className="border-red-200 text-red-600 hover:bg-red-50"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      ) : (
                        <div className="flex gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => setShowDeleteConfirm(false)}
                            className="border-slate-200"
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
                              <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />
                            ) : (
                              'تأكيد'
                            )}
                          </Button>
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                {/* Quick Stats Row */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-8 pt-6 border-t border-slate-200">
                  <div className="flex items-center gap-4 p-4 bg-white rounded-xl border border-slate-100">
                    <div className="w-12 h-12 rounded-lg bg-emerald-100 flex items-center justify-center">
                      <Briefcase className="h-6 w-6 text-emerald-600" />
                    </div>
                    <div>
                      <p className="text-xs text-slate-500">إجمالي القضايا المرتبطة</p>
                      <p className="text-2xl font-bold text-navy">{stats.totalCases}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-4 p-4 bg-white rounded-xl border border-slate-100">
                    <div className="w-12 h-12 rounded-lg bg-blue-100 flex items-center justify-center">
                      <Activity className="h-6 w-6 text-blue-600" />
                    </div>
                    <div>
                      <p className="text-xs text-slate-500">آخر نشاط</p>
                      <p className="text-sm font-bold text-navy">
                        {stats.lastActivity
                          ? formatDistanceToNow(new Date(stats.lastActivity), { addSuffix: true, locale: ar })
                          : 'لا يوجد'}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-4 p-4 bg-white rounded-xl border border-slate-100">
                    <div className="w-12 h-12 rounded-lg bg-orange-100 flex items-center justify-center">
                      <Flag className="h-6 w-6 text-orange-600" />
                    </div>
                    <div>
                      <p className="text-xs text-slate-500">مستوى المخاطر</p>
                      <Badge className={RISK_LEVEL_LABELS[stats.riskLevel]?.color || 'bg-gray-100 text-gray-700'}>
                        {RISK_LEVEL_LABELS[stats.riskLevel]?.label || stats.riskLevel}
                      </Badge>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* MAIN CONTENT - Tabs */}
            <div className="grid grid-cols-1 gap-8">
              <Card className="border border-slate-100 shadow-sm rounded-2xl overflow-hidden min-h-[600px]">
                <Tabs
                  value={activeTab}
                  onValueChange={setActiveTab}
                  className="w-full"
                >
                  <div className="border-b border-slate-100 px-6 pt-4">
                    <TabsList className="bg-transparent h-auto p-0 gap-6">
                      {['overview', 'cases', 'activities', 'documents'].map((tab) => (
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
                            : tab === 'cases'
                              ? 'القضايا'
                              : tab === 'activities'
                                ? 'الأنشطة'
                                : 'المستندات'}
                        </TabsTrigger>
                      ))}
                    </TabsList>
                  </div>

                  <div className="p-6 bg-slate-50/50 min-h-[500px]">
                    {/* Overview Tab */}
                    <TabsContent value="overview" className="mt-0 space-y-6">
                      {/* Identity Information */}
                      <Card className="border-none shadow-sm bg-white rounded-2xl overflow-hidden">
                        <CardHeader>
                          <CardTitle className="text-lg font-bold text-navy flex items-center gap-2">
                            <User className="h-5 w-5 text-purple-500" />
                            معلومات الهوية
                          </CardTitle>
                        </CardHeader>
                        <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          {contact.salutation && (
                            <div className="p-3 bg-slate-50 rounded-xl">
                              <p className="text-xs text-slate-500 mb-1">اللقب</p>
                              <p className="font-medium text-navy">{contact.salutation}</p>
                            </div>
                          )}
                          {contact.firstName && (
                            <div className="p-3 bg-slate-50 rounded-xl">
                              <p className="text-xs text-slate-500 mb-1">الاسم الأول</p>
                              <p className="font-medium text-navy">{contact.firstName}</p>
                            </div>
                          )}
                          {contact.middleName && (
                            <div className="p-3 bg-slate-50 rounded-xl">
                              <p className="text-xs text-slate-500 mb-1">الاسم الأوسط</p>
                              <p className="font-medium text-navy">{contact.middleName}</p>
                            </div>
                          )}
                          {contact.lastName && (
                            <div className="p-3 bg-slate-50 rounded-xl">
                              <p className="text-xs text-slate-500 mb-1">اسم العائلة</p>
                              <p className="font-medium text-navy">{contact.lastName}</p>
                            </div>
                          )}
                          {contact.fullNameArabic && (
                            <div className="p-3 bg-slate-50 rounded-xl md:col-span-2">
                              <p className="text-xs text-slate-500 mb-1">الاسم بالعربية (كامل)</p>
                              <p className="font-medium text-navy">{contact.fullNameArabic}</p>
                            </div>
                          )}
                          {contact.arabicName?.fullName && (
                            <div className="p-3 bg-slate-50 rounded-xl md:col-span-2">
                              <p className="text-xs text-slate-500 mb-1">الاسم الرباعي بالعربية</p>
                              <p className="font-medium text-navy">{contact.arabicName.fullName}</p>
                            </div>
                          )}
                          {contact.dateOfBirth && (
                            <div className="p-3 bg-slate-50 rounded-xl">
                              <p className="text-xs text-slate-500 mb-1">تاريخ الميلاد</p>
                              <p className="font-medium text-navy">
                                {new Date(contact.dateOfBirth).toLocaleDateString('ar-SA')}
                              </p>
                            </div>
                          )}
                          {contact.nationality && (
                            <div className="p-3 bg-slate-50 rounded-xl">
                              <p className="text-xs text-slate-500 mb-1">الجنسية</p>
                              <p className="font-medium text-navy">{contact.nationality}</p>
                            </div>
                          )}
                        </CardContent>
                      </Card>

                      {/* Identification Documents */}
                      {(contact.nationalId || contact.iqamaNumber || contact.passportNumber) && (
                        <Card className="border-none shadow-sm bg-white rounded-2xl overflow-hidden">
                          <CardHeader>
                            <CardTitle className="text-lg font-bold text-navy flex items-center gap-2">
                              <CreditCard className="h-5 w-5 text-amber-500" />
                              وثائق الهوية
                            </CardTitle>
                          </CardHeader>
                          <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {contact.nationalId && (
                              <div className="flex items-center gap-3 p-3 bg-slate-50 rounded-xl">
                                <div className="w-10 h-10 rounded-lg bg-amber-100 flex items-center justify-center">
                                  <CreditCard className="h-5 w-5 text-amber-600" />
                                </div>
                                <div>
                                  <p className="text-xs text-slate-500 flex items-center gap-1">
                                    رقم الهوية الوطنية
                                    <Lock className="h-3 w-3" />
                                  </p>
                                  <p className="font-medium text-navy" dir="ltr">{contact.nationalId}</p>
                                </div>
                              </div>
                            )}
                            {contact.iqamaNumber && (
                              <div className="flex items-center gap-3 p-3 bg-slate-50 rounded-xl">
                                <div className="w-10 h-10 rounded-lg bg-blue-100 flex items-center justify-center">
                                  <CreditCard className="h-5 w-5 text-blue-600" />
                                </div>
                                <div>
                                  <p className="text-xs text-slate-500">رقم الإقامة</p>
                                  <p className="font-medium text-navy" dir="ltr">{contact.iqamaNumber}</p>
                                </div>
                              </div>
                            )}
                            {contact.passportNumber && (
                              <div className="flex items-center gap-3 p-3 bg-slate-50 rounded-xl">
                                <div className="w-10 h-10 rounded-lg bg-indigo-100 flex items-center justify-center">
                                  <CreditCard className="h-5 w-5 text-indigo-600" />
                                </div>
                                <div>
                                  <p className="text-xs text-slate-500 flex items-center gap-1">
                                    رقم جواز السفر
                                    <Lock className="h-3 w-3" />
                                  </p>
                                  <p className="font-medium text-navy" dir="ltr">{contact.passportNumber}</p>
                                  {contact.passportCountry && (
                                    <p className="text-xs text-slate-400">{contact.passportCountry}</p>
                                  )}
                                </div>
                              </div>
                            )}
                          </CardContent>
                        </Card>
                      )}

                      {/* Contact Methods */}
                      <Card className="border-none shadow-sm bg-white rounded-2xl overflow-hidden">
                        <CardHeader>
                          <CardTitle className="text-lg font-bold text-navy flex items-center gap-2">
                            <Phone className="h-5 w-5 text-emerald-500" />
                            وسائل التواصل
                          </CardTitle>
                        </CardHeader>
                        <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          {/* Emails */}
                          {contact.emails?.map((email: any, idx: number) => (
                            <div key={idx} className="flex items-center gap-3 p-3 bg-slate-50 rounded-xl">
                              <Mail className="h-5 w-5 text-blue-500" />
                              <div>
                                <p className="text-xs text-slate-500 flex items-center gap-1">
                                  {email.type === 'work' ? 'بريد العمل' : email.type === 'personal' ? 'بريد شخصي' : 'بريد إلكتروني'}
                                  {email.isPrimary && <Badge className="bg-emerald-100 text-emerald-700 text-[10px]">أساسي</Badge>}
                                  <Lock className="h-3 w-3" />
                                </p>
                                <p className="font-medium text-navy" dir="ltr">{email.email}</p>
                              </div>
                            </div>
                          )) || (contact.email && (
                            <div className="flex items-center gap-3 p-3 bg-slate-50 rounded-xl">
                              <Mail className="h-5 w-5 text-blue-500" />
                              <div>
                                <p className="text-xs text-slate-500 flex items-center gap-1">
                                  البريد الإلكتروني
                                  <Lock className="h-3 w-3" />
                                </p>
                                <p className="font-medium text-navy" dir="ltr">{contact.email}</p>
                              </div>
                            </div>
                          ))}

                          {/* Phones */}
                          {contact.phones?.map((phone: any, idx: number) => (
                            <div key={idx} className="flex items-center gap-3 p-3 bg-slate-50 rounded-xl">
                              <Phone className="h-5 w-5 text-emerald-500" />
                              <div>
                                <p className="text-xs text-slate-500">
                                  {phone.type === 'mobile' ? 'جوال' : phone.type === 'work' ? 'عمل' : phone.type === 'home' ? 'منزل' : 'هاتف'}
                                  {phone.isPrimary && <Badge className="bg-emerald-100 text-emerald-700 text-[10px] ms-1">أساسي</Badge>}
                                </p>
                                <p className="font-medium text-navy" dir="ltr">{phone.number}</p>
                              </div>
                            </div>
                          )) || (contact.phone && (
                            <div className="flex items-center gap-3 p-3 bg-slate-50 rounded-xl">
                              <Phone className="h-5 w-5 text-emerald-500" />
                              <div>
                                <p className="text-xs text-slate-500">الهاتف</p>
                                <p className="font-medium text-navy" dir="ltr">{contact.phone}</p>
                              </div>
                            </div>
                          ))}
                        </CardContent>
                      </Card>

                      {/* Employment */}
                      {(contact.company || contact.title || contact.department) && (
                        <Card className="border-none shadow-sm bg-white rounded-2xl overflow-hidden">
                          <CardHeader>
                            <CardTitle className="text-lg font-bold text-navy flex items-center gap-2">
                              <Briefcase className="h-5 w-5 text-purple-500" />
                              معلومات العمل
                            </CardTitle>
                          </CardHeader>
                          <CardContent className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            {contact.company && (
                              <div className="p-3 bg-slate-50 rounded-xl">
                                <p className="text-xs text-slate-500 mb-1">الشركة / الجهة</p>
                                <p className="font-medium text-navy">{contact.company}</p>
                              </div>
                            )}
                            {contact.title && (
                              <div className="p-3 bg-slate-50 rounded-xl">
                                <p className="text-xs text-slate-500 mb-1">المسمى الوظيفي</p>
                                <p className="font-medium text-navy">{contact.title}</p>
                              </div>
                            )}
                            {contact.department && (
                              <div className="p-3 bg-slate-50 rounded-xl">
                                <p className="text-xs text-slate-500 mb-1">القسم</p>
                                <p className="font-medium text-navy">{contact.department}</p>
                              </div>
                            )}
                          </CardContent>
                        </Card>
                      )}

                      {/* National Address */}
                      {(contact.address || contact.city || contact.district) && (
                        <Card className="border-none shadow-sm bg-white rounded-2xl overflow-hidden">
                          <CardHeader>
                            <CardTitle className="text-lg font-bold text-navy flex items-center gap-2">
                              <MapPin className="h-5 w-5 text-red-500" />
                              العنوان الوطني
                            </CardTitle>
                          </CardHeader>
                          <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {contact.address && (
                              <div className="p-3 bg-slate-50 rounded-xl md:col-span-2">
                                <p className="text-xs text-slate-500 mb-1">العنوان</p>
                                <p className="font-medium text-navy">{contact.address}</p>
                              </div>
                            )}
                            {contact.district && (
                              <div className="p-3 bg-slate-50 rounded-xl">
                                <p className="text-xs text-slate-500 mb-1">الحي</p>
                                <p className="font-medium text-navy">{contact.district}</p>
                              </div>
                            )}
                            {contact.city && (
                              <div className="p-3 bg-slate-50 rounded-xl">
                                <p className="text-xs text-slate-500 mb-1">المدينة</p>
                                <p className="font-medium text-navy">{contact.city}</p>
                              </div>
                            )}
                            {contact.postalCode && (
                              <div className="p-3 bg-slate-50 rounded-xl">
                                <p className="text-xs text-slate-500 mb-1">الرمز البريدي</p>
                                <p className="font-medium text-navy" dir="ltr">{contact.postalCode}</p>
                              </div>
                            )}
                            {contact.country && (
                              <div className="p-3 bg-slate-50 rounded-xl">
                                <p className="text-xs text-slate-500 mb-1">الدولة</p>
                                <p className="font-medium text-navy">{contact.country}</p>
                              </div>
                            )}
                          </CardContent>
                        </Card>
                      )}

                      {/* Social Profiles */}
                      {(contact.socialProfiles || contact.linkedin || contact.twitter) && (
                        <Card className="border-none shadow-sm bg-white rounded-2xl overflow-hidden">
                          <CardHeader>
                            <CardTitle className="text-lg font-bold text-navy flex items-center gap-2">
                              <Globe className="h-5 w-5 text-blue-500" />
                              حسابات التواصل الاجتماعي
                            </CardTitle>
                          </CardHeader>
                          <CardContent className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            {(contact.socialProfiles?.linkedin || contact.linkedin) && (
                              <div className="flex items-center gap-3 p-3 bg-slate-50 rounded-xl">
                                <Linkedin className="h-5 w-5 text-blue-600" />
                                <div>
                                  <p className="text-xs text-slate-500">LinkedIn</p>
                                  <a
                                    href={contact.socialProfiles?.linkedin || contact.linkedin}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="font-medium text-blue-600 hover:underline text-sm"
                                  >
                                    رابط الملف الشخصي
                                  </a>
                                </div>
                              </div>
                            )}
                            {(contact.socialProfiles?.twitter || contact.twitter) && (
                              <div className="flex items-center gap-3 p-3 bg-slate-50 rounded-xl">
                                <Twitter className="h-5 w-5 text-sky-500" />
                                <div>
                                  <p className="text-xs text-slate-500">Twitter</p>
                                  <a
                                    href={contact.socialProfiles?.twitter || contact.twitter}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="font-medium text-sky-600 hover:underline text-sm"
                                  >
                                    رابط الملف الشخصي
                                  </a>
                                </div>
                              </div>
                            )}
                            {(contact.socialProfiles?.facebook || contact.facebook) && (
                              <div className="flex items-center gap-3 p-3 bg-slate-50 rounded-xl">
                                <Facebook className="h-5 w-5 text-blue-700" />
                                <div>
                                  <p className="text-xs text-slate-500">Facebook</p>
                                  <a
                                    href={contact.socialProfiles?.facebook || contact.facebook}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="font-medium text-blue-700 hover:underline text-sm"
                                  >
                                    رابط الملف الشخصي
                                  </a>
                                </div>
                              </div>
                            )}
                          </CardContent>
                        </Card>
                      )}

                      {/* Conflict Check Section */}
                      <Card className="border-none shadow-sm bg-white rounded-2xl overflow-hidden">
                        <CardHeader>
                          <CardTitle className="text-lg font-bold text-navy flex items-center gap-2">
                            <Shield className="h-5 w-5 text-orange-500" />
                            فحص تعارض المصالح
                          </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                          <div className="flex items-center justify-between p-4 bg-slate-50 rounded-xl">
                            <div className="flex items-center gap-3">
                              {(() => {
                                const status = CONFLICT_STATUS_LABELS[contact.conflictCheckStatus] || CONFLICT_STATUS_LABELS.not_checked
                                const Icon = status.icon
                                return (
                                  <>
                                    <Icon className={`h-5 w-5 ${status.color.replace('bg-', 'text-').replace('-100', '-500')}`} />
                                    <div>
                                      <p className="text-xs text-slate-500">الحالة</p>
                                      <Badge className={status.color}>{status.label}</Badge>
                                    </div>
                                  </>
                                )
                              })()}
                            </div>
                            {contact.conflictCheckDate && (
                              <div className="text-left">
                                <p className="text-xs text-slate-500">تاريخ الفحص</p>
                                <p className="text-sm font-medium text-navy">
                                  {new Date(contact.conflictCheckDate).toLocaleDateString('ar-SA')}
                                </p>
                              </div>
                            )}
                          </div>
                          {contact.conflictNotes && (
                            <div className="p-4 bg-orange-50 rounded-xl border border-orange-100">
                              <p className="text-xs text-orange-600 mb-2 font-medium">ملاحظات التعارض</p>
                              <p className="text-slate-700 leading-relaxed">{contact.conflictNotes}</p>
                            </div>
                          )}
                          <Button
                            onClick={handleRunConflictCheck}
                            disabled={runConflictCheckMutation.isPending}
                            className="w-full bg-orange-500 hover:bg-orange-600"
                          >
                            {runConflictCheckMutation.isPending ? (
                              <>
                                <Loader2 className="h-4 w-4 animate-spin ms-2" />
                                جاري الفحص...
                              </>
                            ) : (
                              <>
                                <Shield className="h-4 w-4 ms-2" />
                                إجراء فحص تعارض المصالح
                              </>
                            )}
                          </Button>
                        </CardContent>
                      </Card>

                      {/* Risk Assessment */}
                      <Card className="border-none shadow-sm bg-white rounded-2xl overflow-hidden">
                        <CardHeader>
                          <CardTitle className="text-lg font-bold text-navy flex items-center gap-2">
                            <Flag className="h-5 w-5 text-red-500" />
                            تقييم المخاطر
                          </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="p-4 bg-slate-50 rounded-xl">
                              <p className="text-xs text-slate-500 mb-2">مستوى المخاطر</p>
                              <Badge className={RISK_LEVEL_LABELS[contact.riskLevel || 'low']?.color || 'bg-gray-100 text-gray-700'}>
                                {RISK_LEVEL_LABELS[contact.riskLevel || 'low']?.label || 'غير محدد'}
                              </Badge>
                            </div>
                            <div className="p-4 bg-slate-50 rounded-xl">
                              <p className="text-xs text-slate-500 mb-2">القائمة السوداء</p>
                              {contact.isBlacklisted ? (
                                <Badge className="bg-red-100 text-red-700">
                                  <AlertTriangle className="h-3 w-3 ms-1" />
                                  في القائمة السوداء
                                </Badge>
                              ) : (
                                <Badge className="bg-green-100 text-green-700">
                                  <CheckCircle className="h-3 w-3 ms-1" />
                                  غير مدرج
                                </Badge>
                              )}
                            </div>
                          </div>
                          {contact.blacklistReason && (
                            <div className="p-4 bg-red-50 rounded-xl border border-red-100">
                              <p className="text-xs text-red-600 mb-2 font-medium">سبب الإدراج في القائمة السوداء</p>
                              <p className="text-slate-700">{contact.blacklistReason}</p>
                            </div>
                          )}
                        </CardContent>
                      </Card>

                      {/* Linked Entities */}
                      <Card className="border-none shadow-sm bg-white rounded-2xl overflow-hidden">
                        <CardHeader>
                          <CardTitle className="text-lg font-bold text-navy flex items-center gap-2">
                            <LinkIcon className="h-5 w-5 text-emerald-500" />
                            الكيانات المرتبطة
                          </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-6">
                          {/* Linked Cases */}
                          <div>
                            <h4 className="text-sm font-semibold text-slate-700 mb-3">القضايا المرتبطة ({stats.totalCases})</h4>
                            {casesLoading ? (
                              <div className="flex items-center justify-center py-8">
                                <Loader2 className="h-6 w-6 animate-spin text-slate-400" />
                              </div>
                            ) : stats.totalCases > 0 ? (
                              <div className="space-y-2">
                                {casesData?.data?.slice(0, 3).map((caseItem: any) => (
                                  <div key={caseItem._id} className="flex items-center justify-between p-3 bg-slate-50 rounded-lg hover:bg-slate-100 transition-colors">
                                    <div>
                                      <p className="font-medium text-navy">{caseItem.title || caseItem.caseNumber}</p>
                                      <p className="text-xs text-slate-500">{caseItem.category} • {caseItem.status}</p>
                                    </div>
                                    <Button variant="ghost" size="sm" asChild>
                                      <Link to={ROUTES.dashboard.cases.detail(caseItem._id)}>
                                        عرض
                                      </Link>
                                    </Button>
                                  </div>
                                ))}
                                {stats.totalCases > 3 && (
                                  <Button variant="link" className="text-emerald-600 p-0 h-auto" onClick={() => setActiveTab('cases')}>
                                    عرض جميع القضايا ({stats.totalCases})
                                  </Button>
                                )}
                              </div>
                            ) : (
                              <p className="text-slate-500 text-center py-8">لا توجد قضايا مرتبطة</p>
                            )}
                          </div>

                          {/* Linked Clients */}
                          {contact.linkedClients && contact.linkedClients.length > 0 && (
                            <div>
                              <h4 className="text-sm font-semibold text-slate-700 mb-3">العملاء المرتبطون ({contact.linkedClients.length})</h4>
                              <div className="space-y-2">
                                {contact.linkedClients.slice(0, 3).map((client: any) => (
                                  <div key={client._id || client} className="flex items-center justify-between p-3 bg-slate-50 rounded-lg">
                                    <div>
                                      <p className="font-medium text-navy">
                                        {typeof client === 'object' ? client.displayName : 'عميل'}
                                      </p>
                                    </div>
                                  </div>
                                ))}
                              </div>
                            </div>
                          )}
                        </CardContent>
                      </Card>
                    </TabsContent>

                    {/* Cases Tab */}
                    <TabsContent value="cases" className="mt-0">
                      <Card className="border-none shadow-sm bg-white rounded-2xl overflow-hidden">
                        <CardHeader>
                          <CardTitle className="text-lg font-bold text-navy">القضايا المرتبطة</CardTitle>
                        </CardHeader>
                        <CardContent>
                          {casesLoading ? (
                            <div className="flex items-center justify-center py-12">
                              <Loader2 className="h-8 w-8 animate-spin text-slate-400" />
                            </div>
                          ) : stats.totalCases > 0 ? (
                            <div className="space-y-3">
                              {casesData?.data?.map((caseItem: any) => (
                                <div key={caseItem._id} className="flex items-center justify-between p-4 bg-slate-50 rounded-xl hover:bg-slate-100 transition-colors">
                                  <div className="flex-1">
                                    <div className="flex items-center gap-2 mb-1">
                                      <h4 className="font-semibold text-navy">{caseItem.title || caseItem.caseNumber}</h4>
                                      <Badge className="text-xs">{caseItem.status}</Badge>
                                    </div>
                                    <p className="text-sm text-slate-600">{caseItem.category}</p>
                                    <p className="text-xs text-slate-400 mt-1">
                                      تم الإنشاء: {new Date(caseItem.createdAt).toLocaleDateString('ar-SA')}
                                    </p>
                                  </div>
                                  <Button variant="outline" size="sm" asChild>
                                    <Link to={ROUTES.dashboard.cases.detail(caseItem._id)}>
                                      عرض التفاصيل
                                    </Link>
                                  </Button>
                                </div>
                              ))}
                            </div>
                          ) : (
                            <div className="text-center py-12">
                              <Briefcase className="h-12 w-12 text-slate-300 mx-auto mb-3" />
                              <p className="text-slate-500">لا توجد قضايا مرتبطة</p>
                              <Button className="mt-4 bg-emerald-500 hover:bg-emerald-600">
                                <UserPlus className="h-4 w-4 ms-2" />
                                ربط بقضية
                              </Button>
                            </div>
                          )}
                        </CardContent>
                      </Card>
                    </TabsContent>

                    {/* Activities Tab */}
                    <TabsContent value="activities" className="mt-0">
                      <Card className="border-none shadow-sm bg-white rounded-2xl overflow-hidden">
                        <CardHeader>
                          <CardTitle className="text-lg font-bold text-navy">سجل الأنشطة</CardTitle>
                        </CardHeader>
                        <CardContent>
                          {activitiesLoading ? (
                            <div className="flex items-center justify-center py-12">
                              <Loader2 className="h-8 w-8 animate-spin text-slate-400" />
                            </div>
                          ) : activitiesData?.data && activitiesData.data.length > 0 ? (
                            <ScrollArea className="h-[500px]">
                              <div className="space-y-4">
                                {activitiesData.data.map((activity: any) => (
                                  <div key={activity._id} className="flex gap-4 p-4 bg-slate-50 rounded-xl">
                                    <div className="w-10 h-10 rounded-full bg-emerald-100 flex items-center justify-center flex-shrink-0">
                                      {activity.type === 'call' && <Phone className="h-5 w-5 text-emerald-600" />}
                                      {activity.type === 'email' && <Mail className="h-5 w-5 text-blue-600" />}
                                      {activity.type === 'meeting' && <Calendar className="h-5 w-5 text-purple-600" />}
                                      {activity.type === 'note' && <FileText className="h-5 w-5 text-slate-600" />}
                                    </div>
                                    <div className="flex-1">
                                      <div className="flex items-center justify-between mb-1">
                                        <h4 className="font-semibold text-navy">{activity.subject || activity.title}</h4>
                                        <span className="text-xs text-slate-400">
                                          {formatDistanceToNow(new Date(activity.createdAt), { addSuffix: true, locale: ar })}
                                        </span>
                                      </div>
                                      {activity.description && (
                                        <p className="text-sm text-slate-600">{activity.description}</p>
                                      )}
                                    </div>
                                  </div>
                                ))}
                              </div>
                            </ScrollArea>
                          ) : (
                            <div className="text-center py-12">
                              <Activity className="h-12 w-12 text-slate-300 mx-auto mb-3" />
                              <p className="text-slate-500">لا توجد أنشطة مسجلة</p>
                            </div>
                          )}
                        </CardContent>
                      </Card>
                    </TabsContent>

                    {/* Documents Tab */}
                    <TabsContent value="documents" className="mt-0">
                      <Card className="border-none shadow-sm bg-white rounded-2xl overflow-hidden">
                        <CardHeader>
                          <CardTitle className="text-lg font-bold text-navy">المستندات</CardTitle>
                        </CardHeader>
                        <CardContent>
                          <div className="text-center py-12">
                            <FileText className="h-12 w-12 text-slate-300 mx-auto mb-3" />
                            <p className="text-slate-500">لا توجد مستندات مرفقة</p>
                            <Button className="mt-4 bg-emerald-500 hover:bg-emerald-600">
                              <FileText className="h-4 w-4 ms-2" />
                              رفع مستند
                            </Button>
                          </div>
                        </CardContent>
                      </Card>
                    </TabsContent>
                  </div>
                </Tabs>
              </Card>
            </div>
          </>
        )}
      </Main>
    </>
  )
}
