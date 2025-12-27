/**
 * Client Detail View - Comprehensive Law Firm CRM
 *
 * Features:
 * - Full client information display
 * - Saudi-specific identification and addresses
 * - Billing and payment information
 * - Related cases, invoices, quotes, payments
 * - VAT and POA details
 * - Activities timeline
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
  Star,
  Briefcase,
  Tag,
  CheckCircle,
  AlertTriangle,
  CreditCard,
  DollarSign,
  FileCheck,
  Receipt,
  TrendingUp,
  Users,
  Scale,
  Activity,
  File,
  Wallet,
  Plus,
  MoreVertical,
} from 'lucide-react'
import { Skeleton } from '@/components/ui/skeleton'
import { useClient, useClientCases, useClientInvoices, useClientQuotes, useClientActivities, useClientPayments, useDeleteClient } from '@/hooks/useClients'
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
import { SmartButton, SmartButtonGroup, getSmartButtons, resolveNavigationPath } from '@/components/smart-button'
import { useSmartButtonCounts } from '@/hooks/useSmartButtonCounts'
import { useTranslation } from 'react-i18next'
import { ROUTES } from '@/constants/routes'
import type { Case } from '@/services/casesService'
import type { Invoice } from '@/services/financeService'
import type { Quote } from '@/services/quoteService'
import type { Payment } from '@/services/financeService'

const CLIENT_TYPE_LABELS: Record<string, string> = {
  individual: 'فرد',
  company: 'شركة',
}

const STATUS_LABELS: Record<string, { label: string; color: string }> = {
  active: { label: 'نشط', color: 'bg-emerald-100 text-emerald-700' },
  inactive: { label: 'غير نشط', color: 'bg-gray-100 text-gray-700' },
  archived: { label: 'مؤرشف', color: 'bg-slate-100 text-slate-700' },
  pending: { label: 'قيد المراجعة', color: 'bg-yellow-100 text-yellow-700' },
}

const CREDIT_STATUS_LABELS: Record<string, { label: string; color: string }> = {
  good: { label: 'جيد', color: 'bg-emerald-100 text-emerald-700' },
  warning: { label: 'تحذير', color: 'bg-yellow-100 text-yellow-700' },
  suspended: { label: 'معلق', color: 'bg-red-100 text-red-700' },
  blocked: { label: 'محظور', color: 'bg-red-100 text-red-700' },
}

const CASE_STATUS_LABELS: Record<string, { label: string; color: string }> = {
  active: { label: 'نشط', color: 'bg-blue-100 text-blue-700' },
  closed: { label: 'مغلق', color: 'bg-slate-100 text-slate-700' },
  appeal: { label: 'استئناف', color: 'bg-purple-100 text-purple-700' },
  settlement: { label: 'تسوية', color: 'bg-green-100 text-green-700' },
  'on-hold': { label: 'معلق', color: 'bg-yellow-100 text-yellow-700' },
}

const INVOICE_STATUS_LABELS: Record<string, { label: string; color: string }> = {
  draft: { label: 'مسودة', color: 'bg-slate-100 text-slate-700' },
  pending: { label: 'قيد الانتظار', color: 'bg-yellow-100 text-yellow-700' },
  sent: { label: 'تم الإرسال', color: 'bg-blue-100 text-blue-700' },
  paid: { label: 'مدفوع', color: 'bg-emerald-100 text-emerald-700' },
  partial: { label: 'مدفوع جزئياً', color: 'bg-orange-100 text-orange-700' },
  overdue: { label: 'متأخر', color: 'bg-red-100 text-red-700' },
  cancelled: { label: 'ملغي', color: 'bg-red-100 text-red-700' },
}

const QUOTE_STATUS_LABELS: Record<string, { label: string; color: string }> = {
  draft: { label: 'مسودة', color: 'bg-slate-100 text-slate-700' },
  pending: { label: 'قيد الانتظار', color: 'bg-yellow-100 text-yellow-700' },
  sent: { label: 'تم الإرسال', color: 'bg-blue-100 text-blue-700' },
  accepted: { label: 'مقبول', color: 'bg-emerald-100 text-emerald-700' },
  declined: { label: 'مرفوض', color: 'bg-red-100 text-red-700' },
  cancelled: { label: 'ملغي', color: 'bg-red-100 text-red-700' },
  expired: { label: 'منتهي الصلاحية', color: 'bg-slate-100 text-slate-700' },
}

export function ClientDetailView() {
  const { t, i18n } = useTranslation()
  const isArabic = i18n.language === 'ar'
  const { clientId } = useParams({ strict: false }) as { clientId: string }
  const navigate = useNavigate()
  const [activeTab, setActiveTab] = useState('overview')
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)

  // Fetch client data
  const { data: clientData, isLoading, isError, error, refetch } = useClient(clientId)

  // Fetch related data
  const { data: casesData, isLoading: casesLoading } = useClientCases(clientId, {}, !isLoading && !!clientData)
  const { data: invoicesData, isLoading: invoicesLoading } = useClientInvoices(clientId, {}, !isLoading && !!clientData)
  const { data: quotesData, isLoading: quotesLoading } = useClientQuotes(clientId, {}, !isLoading && !!clientData)
  const { data: activitiesData, isLoading: activitiesLoading } = useClientActivities(clientId, {}, !isLoading && !!clientData)
  const { data: paymentsData, isLoading: paymentsLoading } = useClientPayments(clientId, {}, !isLoading && !!clientData)

  // Mutations
  const deleteClientMutation = useDeleteClient()

  // Smart Buttons Configuration
  const smartButtonConfigs = getSmartButtons('client')
  const { counts, isLoading: countsLoading } = useSmartButtonCounts(
    'client',
    clientId,
    smartButtonConfigs,
    !isLoading && !!clientData
  )

  const handleDelete = () => {
    deleteClientMutation.mutate(clientId, {
      onSuccess: () => {
        navigate({ to: ROUTES.dashboard.clients.list })
      },
    })
  }

  // Transform API data
  const client = clientData

  // Build display name
  const displayName = client
    ? client.clientType === 'company'
      ? client.companyName || client.companyNameAr || 'شركة'
      : [client.salutation, client.firstName, client.middleName, client.lastName]
          .filter(Boolean)
          .join(' ') || client.preferredName || client.fullNameArabic || 'عميل'
    : ''

  // Calculate stats from related data
  const totalCases = casesData?.total || 0
  const activeCases = casesData?.data?.filter((c: Case) => c.status === 'active').length || 0
  const totalInvoiced = invoicesData?.totalInvoiced || 0
  const totalOutstanding = invoicesData?.totalOutstanding || 0
  const clientSince = client?.createdAt ? new Date(client.createdAt).toLocaleDateString('ar-SA') : '-'

  // Calculate credit used (you may need to adjust this based on actual data structure)
  const creditLimit = client?.billing?.creditBalance || 0
  const creditUsed = totalOutstanding
  const creditStatus = client?.status || 'active'

  const topNav = [
    { title: 'جهات الاتصال', href: ROUTES.dashboard.contacts.list, isActive: false },
    { title: 'العملاء', href: ROUTES.dashboard.clients.list, isActive: true },
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
              placeholder={isArabic ? 'بحث...' : 'Search...'}
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
            to={ROUTES.dashboard.clients.list}
            className="inline-flex items-center text-slate-500 hover:text-navy transition-colors"
          >
            <ArrowLeft className={`h-4 w-4 ${isArabic ? 'ms-2' : 'me-2'}`} />
            {isArabic ? 'العودة إلى قائمة العملاء' : 'Back to Clients'}
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
              {isArabic ? 'حدث خطأ أثناء تحميل بيانات العميل' : 'Error loading client data'}
            </h3>
            <p className="text-slate-500 mb-4">
              {error?.message || (isArabic ? 'تعذر الاتصال بالخادم' : 'Failed to connect to server')}
            </p>
            <Button
              onClick={() => refetch()}
              className="bg-emerald-500 hover:bg-emerald-600"
            >
              {isArabic ? 'إعادة المحاولة' : 'Retry'}
            </Button>
          </div>
        )}

        {/* Empty State */}
        {!isLoading && !isError && !client && (
          <div className="bg-white rounded-2xl p-12 border border-slate-100 text-center">
            <div className="flex justify-center mb-4">
              <div className="w-16 h-16 rounded-full bg-emerald-50 flex items-center justify-center">
                <User className="w-8 h-8 text-emerald-500" aria-hidden="true" />
              </div>
            </div>
            <h3 className="text-lg font-bold text-slate-900 mb-2">
              {isArabic ? 'العميل غير موجود' : 'Client not found'}
            </h3>
            <p className="text-slate-500 mb-4">
              {isArabic ? 'لم يتم العثور على العميل المطلوب' : 'The requested client was not found'}
            </p>
            <Button asChild className="bg-emerald-500 hover:bg-emerald-600">
              <Link to={ROUTES.dashboard.clients.list}>
                {isArabic ? 'العودة إلى القائمة' : 'Back to List'}
              </Link>
            </Button>
          </div>
        )}

        {/* Success State */}
        {!isLoading && !isError && client && (
          <>
            {/* Client Hero Content */}
            <ProductivityHero
              badge={client.clientNumber || 'عميل'}
              title={displayName}
              type="clients"
              listMode={true}
              hideButtons={true}
            >
              <div className="flex flex-wrap gap-3 items-center">
                {/* Client Type Icon */}
                {client.clientType === 'company' ? (
                  <Badge className="bg-purple-100 text-purple-700 border-purple-200">
                    <Building2 className="h-3 w-3 ms-1" aria-hidden="true" />
                    {isArabic ? 'شركة' : 'Company'}
                  </Badge>
                ) : (
                  <Badge className="bg-blue-100 text-blue-700 border-blue-200">
                    <User className="h-3 w-3 ms-1" aria-hidden="true" />
                    {isArabic ? 'فرد' : 'Individual'}
                  </Badge>
                )}

                {/* Status Badge */}
                {client.status && (
                  <Badge className={STATUS_LABELS[client.status]?.color || 'bg-gray-100 text-gray-700'}>
                    {STATUS_LABELS[client.status]?.label || client.status}
                  </Badge>
                )}

                {/* VIP Indicator */}
                {client.vipStatus && (
                  <Badge className="bg-yellow-100 text-yellow-700 border-yellow-200">
                    <Star className="h-3 w-3 ms-1 fill-yellow-500" aria-hidden="true" />
                    VIP
                  </Badge>
                )}

                {/* Action Buttons */}
                <div className="flex gap-2 ms-auto">
                  <Link to={`${ROUTES.dashboard.clients.detail(clientId)}/edit`}>
                    <Button
                      variant="outline"
                      size="sm"
                      className="border-white/10 text-white hover:bg-white/10 hover:text-white backdrop-blur-sm"
                    >
                      <Edit3 className="h-4 w-4 ms-2" aria-hidden="true" />
                      {isArabic ? 'تعديل' : 'Edit'}
                    </Button>
                  </Link>
                  <Button
                    variant="outline"
                    size="sm"
                    className="border-white/10 text-white hover:bg-white/10 hover:text-white backdrop-blur-sm"
                  >
                    <Plus className="h-4 w-4 ms-2" aria-hidden="true" />
                    {isArabic ? 'قضية جديدة' : 'Create Case'}
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    className="border-white/10 text-white hover:bg-white/10 hover:text-white backdrop-blur-sm"
                  >
                    <Receipt className="h-4 w-4 ms-2" aria-hidden="true" />
                    {isArabic ? 'فاتورة جديدة' : 'Create Invoice'}
                  </Button>
                  <Button
                    variant="outline"
                    size="icon"
                    className="border-white/10 text-white hover:bg-white/10 hover:text-white backdrop-blur-sm"
                  >
                    <MoreVertical className="h-4 w-4" aria-hidden="true" />
                  </Button>
                  {!showDeleteConfirm ? (
                    <Button
                      variant="outline"
                      size="icon"
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
                        {isArabic ? 'إلغاء' : 'Cancel'}
                      </Button>
                      <Button
                        variant="destructive"
                        size="sm"
                        onClick={handleDelete}
                        disabled={deleteClientMutation.isPending}
                        className="bg-red-500 hover:bg-red-600"
                      >
                        {deleteClientMutation.isPending ? (
                          <Loader2 className="h-4 w-4 animate-spin" />
                        ) : (
                          isArabic ? 'تأكيد الحذف' : 'Confirm Delete'
                        )}
                      </Button>
                    </div>
                  )}
                </div>
              </div>
            </ProductivityHero>

            {/* Quick Stats Row */}
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
              <Card className="border border-slate-100 shadow-sm rounded-2xl overflow-hidden">
                <CardContent className="p-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-blue-50 flex items-center justify-center">
                      <Briefcase className="h-5 w-5 text-blue-500" aria-hidden="true" />
                    </div>
                    <div>
                      <p className="text-xs text-slate-500">{isArabic ? 'إجمالي القضايا' : 'Total Cases'}</p>
                      <p className="text-2xl font-bold text-navy">{totalCases}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="border border-slate-100 shadow-sm rounded-2xl overflow-hidden">
                <CardContent className="p-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-emerald-50 flex items-center justify-center">
                      <Activity className="h-5 w-5 text-emerald-500" aria-hidden="true" />
                    </div>
                    <div>
                      <p className="text-xs text-slate-500">{isArabic ? 'قضايا نشطة' : 'Active Cases'}</p>
                      <p className="text-2xl font-bold text-navy">{activeCases}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="border border-slate-100 shadow-sm rounded-2xl overflow-hidden">
                <CardContent className="p-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-purple-50 flex items-center justify-center">
                      <TrendingUp className="h-5 w-5 text-purple-500" aria-hidden="true" />
                    </div>
                    <div>
                      <p className="text-xs text-slate-500">{isArabic ? 'القيمة الإجمالية' : 'Lifetime Value'}</p>
                      <p className="text-lg font-bold text-navy">{totalInvoiced.toLocaleString('ar-SA')} {isArabic ? 'ر.س' : 'SAR'}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="border border-slate-100 shadow-sm rounded-2xl overflow-hidden">
                <CardContent className="p-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-orange-50 flex items-center justify-center">
                      <Wallet className="h-5 w-5 text-orange-500" aria-hidden="true" />
                    </div>
                    <div>
                      <p className="text-xs text-slate-500">{isArabic ? 'المستحقات' : 'Outstanding'}</p>
                      <p className="text-lg font-bold text-navy">{totalOutstanding.toLocaleString('ar-SA')} {isArabic ? 'ر.س' : 'SAR'}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="border border-slate-100 shadow-sm rounded-2xl overflow-hidden">
                <CardContent className="p-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-green-50 flex items-center justify-center">
                      <CheckCircle className="h-5 w-5 text-green-500" aria-hidden="true" />
                    </div>
                    <div>
                      <p className="text-xs text-slate-500">{isArabic ? 'حالة الائتمان' : 'Credit Status'}</p>
                      <Badge className={CREDIT_STATUS_LABELS[creditStatus]?.color || 'bg-gray-100 text-gray-700'} variant="secondary">
                        {CREDIT_STATUS_LABELS[creditStatus]?.label || creditStatus}
                      </Badge>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="border border-slate-100 shadow-sm rounded-2xl overflow-hidden">
                <CardContent className="p-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-slate-50 flex items-center justify-center">
                      <Calendar className="h-5 w-5 text-slate-500" aria-hidden="true" />
                    </div>
                    <div>
                      <p className="text-xs text-slate-500">{isArabic ? 'عميل منذ' : 'Client Since'}</p>
                      <p className="text-sm font-bold text-navy">{clientSince}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Smart Buttons - Odoo Style */}
            <div className="bg-white rounded-2xl p-6 border border-slate-100 shadow-sm">
              <h3 className="text-lg font-semibold text-slate-900 mb-4">
                {t('smartButtons.relatedRecords') || (isArabic ? 'السجلات المرتبطة' : 'Related Records')}
              </h3>
              <SmartButtonGroup layout="auto">
                {smartButtonConfigs.map((config) => (
                  <SmartButton
                    key={config.id}
                    icon={config.icon}
                    label={isArabic ? config.labelAr : config.labelEn}
                    count={counts[config.id]}
                    isLoading={countsLoading}
                    variant={config.variant}
                    onClick={
                      config.clickable
                        ? () => {
                            const path = resolveNavigationPath(config.navigateTo, clientId)
                            navigate({ to: path })
                          }
                        : undefined
                    }
                  />
                ))}
              </SmartButtonGroup>
            </div>

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
                        {['overview', 'cases', 'invoices', 'quotes', 'activities', 'documents', 'payments'].map(
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
                                ? isArabic ? 'نظرة عامة' : 'Overview'
                                : tab === 'cases'
                                  ? isArabic ? 'القضايا' : 'Cases'
                                  : tab === 'invoices'
                                    ? isArabic ? 'الفواتير' : 'Invoices'
                                    : tab === 'quotes'
                                      ? isArabic ? 'عروض الأسعار' : 'Quotes'
                                      : tab === 'activities'
                                        ? isArabic ? 'الأنشطة' : 'Activities'
                                        : tab === 'documents'
                                          ? isArabic ? 'المستندات' : 'Documents'
                                          : isArabic ? 'المدفوعات' : 'Payments'}
                            </TabsTrigger>
                          )
                        )}
                      </TabsList>
                    </div>

                    <div className="p-6 bg-slate-50/50 min-h-[500px]">
                      {/* Overview Tab */}
                      <TabsContent value="overview" className="mt-0 space-y-6">
                        {/* Basic Information */}
                        <Card className="border-none shadow-sm bg-white rounded-2xl overflow-hidden">
                          <CardHeader>
                            <CardTitle className="text-lg font-bold text-navy flex items-center gap-2">
                              <User className="h-5 w-5 text-emerald-500" aria-hidden="true" />
                              {isArabic ? 'المعلومات الأساسية' : 'Basic Information'}
                            </CardTitle>
                          </CardHeader>
                          <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {client.clientType === 'individual' ? (
                              <>
                                {client.fullNameArabic && (
                                  <div className="p-4 bg-slate-50 rounded-xl">
                                    <p className="text-xs text-slate-500 mb-1">{isArabic ? 'الاسم بالعربية' : 'Arabic Name'}</p>
                                    <p className="font-medium text-navy">{client.fullNameArabic}</p>
                                  </div>
                                )}
                                {client.fullNameEnglish && (
                                  <div className="p-4 bg-slate-50 rounded-xl">
                                    <p className="text-xs text-slate-500 mb-1">{isArabic ? 'الاسم بالإنجليزية' : 'English Name'}</p>
                                    <p className="font-medium text-navy">{client.fullNameEnglish}</p>
                                  </div>
                                )}
                                {client.nationalId && (
                                  <div className="p-4 bg-slate-50 rounded-xl">
                                    <p className="text-xs text-slate-500 mb-1">{isArabic ? 'رقم الهوية الوطنية' : 'National ID'}</p>
                                    <p className="font-medium text-navy" dir="ltr">{client.nationalId}</p>
                                  </div>
                                )}
                                {client.iqamaNumber && (
                                  <div className="p-4 bg-slate-50 rounded-xl">
                                    <p className="text-xs text-slate-500 mb-1">{isArabic ? 'رقم الإقامة' : 'Iqama Number'}</p>
                                    <p className="font-medium text-navy" dir="ltr">{client.iqamaNumber}</p>
                                  </div>
                                )}
                              </>
                            ) : (
                              <>
                                {client.companyNameAr && (
                                  <div className="p-4 bg-slate-50 rounded-xl">
                                    <p className="text-xs text-slate-500 mb-1">{isArabic ? 'اسم الشركة بالعربية' : 'Company Name (AR)'}</p>
                                    <p className="font-medium text-navy">{client.companyNameAr}</p>
                                  </div>
                                )}
                                {client.companyNameEnglish && (
                                  <div className="p-4 bg-slate-50 rounded-xl">
                                    <p className="text-xs text-slate-500 mb-1">{isArabic ? 'اسم الشركة بالإنجليزية' : 'Company Name (EN)'}</p>
                                    <p className="font-medium text-navy">{client.companyNameEnglish}</p>
                                  </div>
                                )}
                                {client.crNumber && (
                                  <div className="p-4 bg-slate-50 rounded-xl">
                                    <p className="text-xs text-slate-500 mb-1">{isArabic ? 'رقم السجل التجاري' : 'CR Number'}</p>
                                    <p className="font-medium text-navy" dir="ltr">{client.crNumber}</p>
                                  </div>
                                )}
                                {client.vatNumber && (
                                  <div className="p-4 bg-slate-50 rounded-xl">
                                    <p className="text-xs text-slate-500 mb-1">{isArabic ? 'الرقم الضريبي' : 'VAT Number'}</p>
                                    <p className="font-medium text-navy" dir="ltr">{client.vatNumber}</p>
                                  </div>
                                )}
                              </>
                            )}
                            {client.email && (
                              <div className="p-4 bg-slate-50 rounded-xl">
                                <p className="text-xs text-slate-500 mb-1">{isArabic ? 'البريد الإلكتروني' : 'Email'}</p>
                                <p className="font-medium text-navy" dir="ltr">{client.email}</p>
                              </div>
                            )}
                            {client.phone && (
                              <div className="p-4 bg-slate-50 rounded-xl">
                                <p className="text-xs text-slate-500 mb-1">{isArabic ? 'الهاتف' : 'Phone'}</p>
                                <p className="font-medium text-navy" dir="ltr">{client.phone}</p>
                              </div>
                            )}
                          </CardContent>
                        </Card>

                        {/* Billing Information */}
                        <Card className="border-none shadow-sm bg-white rounded-2xl overflow-hidden">
                          <CardHeader>
                            <CardTitle className="text-lg font-bold text-navy flex items-center gap-2">
                              <CreditCard className="h-5 w-5 text-blue-500" aria-hidden="true" />
                              {isArabic ? 'معلومات الفوترة' : 'Billing Information'}
                            </CardTitle>
                          </CardHeader>
                          <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="p-4 bg-slate-50 rounded-xl">
                              <p className="text-xs text-slate-500 mb-1">{isArabic ? 'نوع الفوترة' : 'Billing Type'}</p>
                              <p className="font-medium text-navy">{client.billingType || (isArabic ? 'غير محدد' : 'Not specified')}</p>
                            </div>
                            <div className="p-4 bg-slate-50 rounded-xl">
                              <p className="text-xs text-slate-500 mb-1">{isArabic ? 'سعر الساعة' : 'Hourly Rate'}</p>
                              <p className="font-medium text-navy">{client.defaultBillingRate?.toLocaleString('ar-SA') || '-'} {isArabic ? 'ر.س' : 'SAR'}</p>
                            </div>
                            <div className="p-4 bg-slate-50 rounded-xl">
                              <p className="text-xs text-slate-500 mb-1">{isArabic ? 'العملة' : 'Currency'}</p>
                              <p className="font-medium text-navy">{client.billingCurrency || 'SAR'}</p>
                            </div>
                            <div className="p-4 bg-slate-50 rounded-xl">
                              <p className="text-xs text-slate-500 mb-1">{isArabic ? 'شروط الدفع' : 'Payment Terms'}</p>
                              <p className="font-medium text-navy">{client.paymentTerms || (isArabic ? 'غير محدد' : 'Not specified')}</p>
                            </div>
                            <div className="p-4 bg-slate-50 rounded-xl">
                              <p className="text-xs text-slate-500 mb-1">{isArabic ? 'حد الائتمان' : 'Credit Limit'}</p>
                              <p className="font-medium text-navy">{creditLimit.toLocaleString('ar-SA')} {isArabic ? 'ر.س' : 'SAR'}</p>
                            </div>
                            <div className="p-4 bg-slate-50 rounded-xl">
                              <p className="text-xs text-slate-500 mb-1">{isArabic ? 'الائتمان المستخدم' : 'Credit Used'}</p>
                              <p className="font-medium text-navy">{creditUsed.toLocaleString('ar-SA')} {isArabic ? 'ر.س' : 'SAR'}</p>
                            </div>
                          </CardContent>
                        </Card>

                        {/* Discount Settings */}
                        {client.hasDiscount && (
                          <Card className="border-none shadow-sm bg-white rounded-2xl overflow-hidden">
                            <CardHeader>
                              <CardTitle className="text-lg font-bold text-navy flex items-center gap-2">
                                <DollarSign className="h-5 w-5 text-green-500" aria-hidden="true" />
                                {isArabic ? 'إعدادات الخصم' : 'Discount Settings'}
                              </CardTitle>
                            </CardHeader>
                            <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
                              <div className="p-4 bg-slate-50 rounded-xl">
                                <p className="text-xs text-slate-500 mb-1">{isArabic ? 'نسبة الخصم' : 'Discount Percent'}</p>
                                <p className="font-medium text-navy">{client.discountPercent || 0}%</p>
                              </div>
                              <div className="p-4 bg-slate-50 rounded-xl">
                                <p className="text-xs text-slate-500 mb-1">{isArabic ? 'سبب الخصم' : 'Discount Reason'}</p>
                                <p className="font-medium text-navy">{client.discountReason || (isArabic ? 'غير محدد' : 'Not specified')}</p>
                              </div>
                            </CardContent>
                          </Card>
                        )}

                        {/* Invoice Preferences */}
                        <Card className="border-none shadow-sm bg-white rounded-2xl overflow-hidden">
                          <CardHeader>
                            <CardTitle className="text-lg font-bold text-navy flex items-center gap-2">
                              <Receipt className="h-5 w-5 text-purple-500" aria-hidden="true" />
                              {isArabic ? 'تفضيلات الفاتورة' : 'Invoice Preferences'}
                            </CardTitle>
                          </CardHeader>
                          <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="p-4 bg-slate-50 rounded-xl">
                              <p className="text-xs text-slate-500 mb-1">{isArabic ? 'طريقة التسليم' : 'Delivery Method'}</p>
                              <p className="font-medium text-navy">{client.invoiceDeliveryMethod || (isArabic ? 'البريد الإلكتروني' : 'Email')}</p>
                            </div>
                            <div className="p-4 bg-slate-50 rounded-xl">
                              <p className="text-xs text-slate-500 mb-1">{isArabic ? 'لغة الفاتورة' : 'Invoice Language'}</p>
                              <p className="font-medium text-navy">{client.invoiceLanguage === 'ar' ? 'العربية' : client.invoiceLanguage === 'en' ? 'English' : isArabic ? 'غير محدد' : 'Not specified'}</p>
                            </div>
                          </CardContent>
                        </Card>

                        {/* VAT Registration */}
                        {client.isVatRegistered && (
                          <Card className="border-none shadow-sm bg-white rounded-2xl overflow-hidden">
                            <CardHeader>
                              <CardTitle className="text-lg font-bold text-navy flex items-center gap-2">
                                <FileCheck className="h-5 w-5 text-orange-500" aria-hidden="true" />
                                {isArabic ? 'التسجيل الضريبي' : 'VAT Registration'}
                              </CardTitle>
                            </CardHeader>
                            <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
                              <div className="p-4 bg-slate-50 rounded-xl">
                                <p className="text-xs text-slate-500 mb-1">{isArabic ? 'الرقم الضريبي' : 'VAT Number'}</p>
                                <p className="font-medium text-navy" dir="ltr">{client.vatNumber || (isArabic ? 'غير محدد' : 'Not specified')}</p>
                              </div>
                            </CardContent>
                          </Card>
                        )}

                        {/* Power of Attorney */}
                        {client.hasPOA && (
                          <Card className="border-none shadow-sm bg-white rounded-2xl overflow-hidden">
                            <CardHeader>
                              <CardTitle className="text-lg font-bold text-navy flex items-center gap-2">
                                <Scale className="h-5 w-5 text-indigo-500" aria-hidden="true" />
                                {isArabic ? 'الوكالة الشرعية' : 'Power of Attorney'}
                              </CardTitle>
                            </CardHeader>
                            <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
                              <div className="p-4 bg-slate-50 rounded-xl">
                                <p className="text-xs text-slate-500 mb-1">{isArabic ? 'رقم الوكالة' : 'POA Number'}</p>
                                <p className="font-medium text-navy">{client.poaNumber || (isArabic ? 'غير محدد' : 'Not specified')}</p>
                              </div>
                              <div className="p-4 bg-slate-50 rounded-xl">
                                <p className="text-xs text-slate-500 mb-1">{isArabic ? 'تاريخ الإصدار' : 'Issue Date'}</p>
                                <p className="font-medium text-navy">{client.poaIssueDate ? new Date(client.poaIssueDate).toLocaleDateString('ar-SA') : (isArabic ? 'غير محدد' : 'Not specified')}</p>
                              </div>
                              <div className="p-4 bg-slate-50 rounded-xl">
                                <p className="text-xs text-slate-500 mb-1">{isArabic ? 'تاريخ الانتهاء' : 'Expiry Date'}</p>
                                <p className="font-medium text-navy">{client.poaExpiryDate ? new Date(client.poaExpiryDate).toLocaleDateString('ar-SA') : (isArabic ? 'غير محدد' : 'Not specified')}</p>
                              </div>
                              <div className="p-4 bg-slate-50 rounded-xl">
                                <p className="text-xs text-slate-500 mb-1">{isArabic ? 'نطاق الوكالة' : 'POA Scope'}</p>
                                <p className="font-medium text-navy">{client.poaScope || (isArabic ? 'غير محدد' : 'Not specified')}</p>
                              </div>
                            </CardContent>
                          </Card>
                        )}

                        {/* Relationship Info */}
                        <Card className="border-none shadow-sm bg-white rounded-2xl overflow-hidden">
                          <CardHeader>
                            <CardTitle className="text-lg font-bold text-navy flex items-center gap-2">
                              <Users className="h-5 w-5 text-pink-500" aria-hidden="true" />
                              {isArabic ? 'معلومات العلاقة' : 'Relationship Info'}
                            </CardTitle>
                          </CardHeader>
                          <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="p-4 bg-slate-50 rounded-xl">
                              <p className="text-xs text-slate-500 mb-1">{isArabic ? 'مصدر العميل' : 'Source'}</p>
                              <p className="font-medium text-navy">{client.source || (isArabic ? 'غير محدد' : 'Not specified')}</p>
                            </div>
                            <div className="p-4 bg-slate-50 rounded-xl">
                              <p className="text-xs text-slate-500 mb-1">{isArabic ? 'المنطقة' : 'Territory'}</p>
                              <p className="font-medium text-navy">{client.territory || (isArabic ? 'غير محدد' : 'Not specified')}</p>
                            </div>
                            <div className="p-4 bg-slate-50 rounded-xl">
                              <p className="text-xs text-slate-500 mb-1">{isArabic ? 'الفريق' : 'Team'}</p>
                              <p className="font-medium text-navy">{client.team || (isArabic ? 'غير محدد' : 'Not specified')}</p>
                            </div>
                            <div className="p-4 bg-slate-50 rounded-xl">
                              <p className="text-xs text-slate-500 mb-1">{isArabic ? 'مدير الحساب' : 'Account Manager'}</p>
                              <p className="font-medium text-navy">{client.accountManager || (isArabic ? 'غير محدد' : 'Not specified')}</p>
                            </div>
                            {client.referredBy && (
                              <div className="p-4 bg-slate-50 rounded-xl">
                                <p className="text-xs text-slate-500 mb-1">{isArabic ? 'تمت الإحالة بواسطة' : 'Referred By'}</p>
                                <p className="font-medium text-navy">{client.referredBy}</p>
                              </div>
                            )}
                          </CardContent>
                        </Card>
                      </TabsContent>

                      {/* Cases Tab */}
                      <TabsContent value="cases" className="mt-0 space-y-6">
                        <Card className="border-none shadow-sm bg-white rounded-2xl overflow-hidden">
                          <CardHeader>
                            <CardTitle className="text-lg font-bold text-navy">
                              {isArabic ? 'القضايا' : 'Cases'}
                            </CardTitle>
                          </CardHeader>
                          <CardContent>
                            {casesLoading ? (
                              <div className="flex justify-center py-8">
                                <Loader2 className="h-8 w-8 animate-spin text-emerald-500" />
                              </div>
                            ) : casesData?.data?.length ? (
                              <div className="overflow-x-auto">
                                <table className="w-full">
                                  <thead>
                                    <tr className="border-b border-slate-200">
                                      <th className="text-start p-3 text-sm font-semibold text-slate-700">{isArabic ? 'رقم القضية' : 'Case Number'}</th>
                                      <th className="text-start p-3 text-sm font-semibold text-slate-700">{isArabic ? 'العنوان' : 'Title'}</th>
                                      <th className="text-start p-3 text-sm font-semibold text-slate-700">{isArabic ? 'النوع' : 'Type'}</th>
                                      <th className="text-start p-3 text-sm font-semibold text-slate-700">{isArabic ? 'الحالة' : 'Status'}</th>
                                      <th className="text-start p-3 text-sm font-semibold text-slate-700">{isArabic ? 'المحامي المسؤول' : 'Assigned Lawyer'}</th>
                                      <th className="text-start p-3 text-sm font-semibold text-slate-700">{isArabic ? 'تاريخ الإنشاء' : 'Created Date'}</th>
                                    </tr>
                                  </thead>
                                  <tbody>
                                    {casesData.data.map((caseItem: Case) => (
                                      <tr key={caseItem._id} className="border-b border-slate-100 hover:bg-slate-50">
                                        <td className="p-3">
                                          <Link to={`/dashboard/cases/${caseItem._id}`} className="text-emerald-600 hover:underline font-medium">
                                            {caseItem.caseNumber || caseItem._id}
                                          </Link>
                                        </td>
                                        <td className="p-3 text-slate-700">{caseItem.title}</td>
                                        <td className="p-3 text-slate-700">{caseItem.category}</td>
                                        <td className="p-3">
                                          <Badge className={CASE_STATUS_LABELS[caseItem.status]?.color || 'bg-gray-100 text-gray-700'}>
                                            {CASE_STATUS_LABELS[caseItem.status]?.label || caseItem.status}
                                          </Badge>
                                        </td>
                                        <td className="p-3 text-slate-700">
                                          {typeof caseItem.assignedLawyer === 'object' && caseItem.assignedLawyer
                                            ? `${(caseItem.assignedLawyer as any).firstName || ''} ${(caseItem.assignedLawyer as any).lastName || ''}`
                                            : '-'}
                                        </td>
                                        <td className="p-3 text-slate-700">
                                          {caseItem.createdAt ? new Date(caseItem.createdAt).toLocaleDateString('ar-SA') : '-'}
                                        </td>
                                      </tr>
                                    ))}
                                  </tbody>
                                </table>
                              </div>
                            ) : (
                              <p className="text-center py-8 text-slate-500">{isArabic ? 'لا توجد قضايا' : 'No cases found'}</p>
                            )}
                          </CardContent>
                        </Card>
                      </TabsContent>

                      {/* Invoices Tab */}
                      <TabsContent value="invoices" className="mt-0 space-y-6">
                        <Card className="border-none shadow-sm bg-white rounded-2xl overflow-hidden">
                          <CardHeader>
                            <CardTitle className="text-lg font-bold text-navy">
                              {isArabic ? 'الفواتير' : 'Invoices'}
                            </CardTitle>
                          </CardHeader>
                          <CardContent>
                            {invoicesLoading ? (
                              <div className="flex justify-center py-8">
                                <Loader2 className="h-8 w-8 animate-spin text-emerald-500" />
                              </div>
                            ) : invoicesData?.data?.length ? (
                              <>
                                <div className="overflow-x-auto">
                                  <table className="w-full">
                                    <thead>
                                      <tr className="border-b border-slate-200">
                                        <th className="text-start p-3 text-sm font-semibold text-slate-700">{isArabic ? 'رقم الفاتورة' : 'Invoice #'}</th>
                                        <th className="text-start p-3 text-sm font-semibold text-slate-700">{isArabic ? 'التاريخ' : 'Date'}</th>
                                        <th className="text-start p-3 text-sm font-semibold text-slate-700">{isArabic ? 'تاريخ الاستحقاق' : 'Due Date'}</th>
                                        <th className="text-start p-3 text-sm font-semibold text-slate-700">{isArabic ? 'المبلغ' : 'Amount'}</th>
                                        <th className="text-start p-3 text-sm font-semibold text-slate-700">{isArabic ? 'الحالة' : 'Status'}</th>
                                      </tr>
                                    </thead>
                                    <tbody>
                                      {invoicesData.data.map((invoice: Invoice) => (
                                        <tr key={invoice._id} className="border-b border-slate-100 hover:bg-slate-50">
                                          <td className="p-3">
                                            <Link to={`/dashboard/invoices/${invoice._id}`} className="text-emerald-600 hover:underline font-medium">
                                              {invoice.invoiceNumber}
                                            </Link>
                                          </td>
                                          <td className="p-3 text-slate-700">
                                            {invoice.issueDate ? new Date(invoice.issueDate).toLocaleDateString('ar-SA') : '-'}
                                          </td>
                                          <td className="p-3 text-slate-700">
                                            {invoice.dueDate ? new Date(invoice.dueDate).toLocaleDateString('ar-SA') : '-'}
                                          </td>
                                          <td className="p-3 text-slate-700 font-medium" dir="ltr">
                                            {invoice.totalAmount.toLocaleString('ar-SA')} {isArabic ? 'ر.س' : 'SAR'}
                                          </td>
                                          <td className="p-3">
                                            <Badge className={INVOICE_STATUS_LABELS[invoice.status]?.color || 'bg-gray-100 text-gray-700'}>
                                              {INVOICE_STATUS_LABELS[invoice.status]?.label || invoice.status}
                                            </Badge>
                                          </td>
                                        </tr>
                                      ))}
                                    </tbody>
                                  </table>
                                </div>

                                {/* Totals Row */}
                                <div className="mt-4 p-4 bg-slate-50 rounded-xl grid grid-cols-3 gap-4">
                                  <div>
                                    <p className="text-xs text-slate-500">{isArabic ? 'إجمالي الفواتير' : 'Total Invoiced'}</p>
                                    <p className="text-lg font-bold text-navy">{invoicesData.totalInvoiced?.toLocaleString('ar-SA')} {isArabic ? 'ر.س' : 'SAR'}</p>
                                  </div>
                                  <div>
                                    <p className="text-xs text-slate-500">{isArabic ? 'إجمالي المدفوع' : 'Total Paid'}</p>
                                    <p className="text-lg font-bold text-emerald-600">{invoicesData.totalPaid?.toLocaleString('ar-SA')} {isArabic ? 'ر.س' : 'SAR'}</p>
                                  </div>
                                  <div>
                                    <p className="text-xs text-slate-500">{isArabic ? 'المستحقات' : 'Outstanding'}</p>
                                    <p className="text-lg font-bold text-orange-600">{invoicesData.totalOutstanding?.toLocaleString('ar-SA')} {isArabic ? 'ر.س' : 'SAR'}</p>
                                  </div>
                                </div>
                              </>
                            ) : (
                              <p className="text-center py-8 text-slate-500">{isArabic ? 'لا توجد فواتير' : 'No invoices found'}</p>
                            )}
                          </CardContent>
                        </Card>
                      </TabsContent>

                      {/* Quotes Tab */}
                      <TabsContent value="quotes" className="mt-0 space-y-6">
                        <Card className="border-none shadow-sm bg-white rounded-2xl overflow-hidden">
                          <CardHeader>
                            <CardTitle className="text-lg font-bold text-navy">
                              {isArabic ? 'عروض الأسعار' : 'Quotes'}
                            </CardTitle>
                          </CardHeader>
                          <CardContent>
                            {quotesLoading ? (
                              <div className="flex justify-center py-8">
                                <Loader2 className="h-8 w-8 animate-spin text-emerald-500" />
                              </div>
                            ) : quotesData?.data?.length ? (
                              <div className="overflow-x-auto">
                                <table className="w-full">
                                  <thead>
                                    <tr className="border-b border-slate-200">
                                      <th className="text-start p-3 text-sm font-semibold text-slate-700">{isArabic ? 'رقم العرض' : 'Quote ID'}</th>
                                      <th className="text-start p-3 text-sm font-semibold text-slate-700">{isArabic ? 'العنوان' : 'Title'}</th>
                                      <th className="text-start p-3 text-sm font-semibold text-slate-700">{isArabic ? 'المبلغ' : 'Amount'}</th>
                                      <th className="text-start p-3 text-sm font-semibold text-slate-700">{isArabic ? 'الحالة' : 'Status'}</th>
                                      <th className="text-start p-3 text-sm font-semibold text-slate-700">{isArabic ? 'صالح حتى' : 'Valid Until'}</th>
                                    </tr>
                                  </thead>
                                  <tbody>
                                    {quotesData.data.map((quote: Quote) => (
                                      <tr key={quote._id} className="border-b border-slate-100 hover:bg-slate-50">
                                        <td className="p-3">
                                          <Link to={`/dashboard/quotes/${quote._id}`} className="text-emerald-600 hover:underline font-medium">
                                            {quote.quoteNumber}
                                          </Link>
                                        </td>
                                        <td className="p-3 text-slate-700">{quote.title || '-'}</td>
                                        <td className="p-3 text-slate-700 font-medium" dir="ltr">
                                          {quote.totalAmount.toLocaleString('ar-SA')} {isArabic ? 'ر.س' : 'SAR'}
                                        </td>
                                        <td className="p-3">
                                          <Badge className={QUOTE_STATUS_LABELS[quote.status]?.color || 'bg-gray-100 text-gray-700'}>
                                            {QUOTE_STATUS_LABELS[quote.status]?.label || quote.status}
                                          </Badge>
                                        </td>
                                        <td className="p-3 text-slate-700">
                                          {quote.expiryDate ? new Date(quote.expiryDate).toLocaleDateString('ar-SA') : '-'}
                                        </td>
                                      </tr>
                                    ))}
                                  </tbody>
                                </table>
                              </div>
                            ) : (
                              <p className="text-center py-8 text-slate-500">{isArabic ? 'لا توجد عروض أسعار' : 'No quotes found'}</p>
                            )}
                          </CardContent>
                        </Card>
                      </TabsContent>

                      {/* Activities Tab */}
                      <TabsContent value="activities" className="mt-0 space-y-6">
                        <Card className="border-none shadow-sm bg-white rounded-2xl overflow-hidden">
                          <CardHeader>
                            <CardTitle className="text-lg font-bold text-navy">
                              {isArabic ? 'الأنشطة' : 'Activities'}
                            </CardTitle>
                          </CardHeader>
                          <CardContent>
                            {activitiesLoading ? (
                              <div className="flex justify-center py-8">
                                <Loader2 className="h-8 w-8 animate-spin text-emerald-500" />
                              </div>
                            ) : activitiesData?.data?.length ? (
                              <div className="space-y-4">
                                {activitiesData.data.map((activity: any) => (
                                  <div key={activity._id} className="p-4 bg-slate-50 rounded-xl">
                                    <div className="flex items-start gap-3">
                                      <div className="w-10 h-10 rounded-full bg-emerald-50 flex items-center justify-center">
                                        <Activity className="h-5 w-5 text-emerald-500" />
                                      </div>
                                      <div className="flex-1">
                                        <p className="font-medium text-navy">{activity.title || activity.type}</p>
                                        <p className="text-sm text-slate-600 mt-1">{activity.description}</p>
                                        <p className="text-xs text-slate-500 mt-2">
                                          {activity.createdAt ? new Date(activity.createdAt).toLocaleDateString('ar-SA') : '-'}
                                        </p>
                                      </div>
                                    </div>
                                  </div>
                                ))}
                              </div>
                            ) : (
                              <p className="text-center py-8 text-slate-500">{isArabic ? 'لا توجد أنشطة' : 'No activities found'}</p>
                            )}
                          </CardContent>
                        </Card>
                      </TabsContent>

                      {/* Documents Tab */}
                      <TabsContent value="documents" className="mt-0 space-y-6">
                        <Card className="border-none shadow-sm bg-white rounded-2xl overflow-hidden">
                          <CardHeader>
                            <CardTitle className="text-lg font-bold text-navy">
                              {isArabic ? 'المستندات' : 'Documents'}
                            </CardTitle>
                          </CardHeader>
                          <CardContent>
                            <p className="text-center py-8 text-slate-500">{isArabic ? 'لا توجد مستندات' : 'No documents found'}</p>
                          </CardContent>
                        </Card>
                      </TabsContent>

                      {/* Payments Tab */}
                      <TabsContent value="payments" className="mt-0 space-y-6">
                        <Card className="border-none shadow-sm bg-white rounded-2xl overflow-hidden">
                          <CardHeader>
                            <CardTitle className="text-lg font-bold text-navy">
                              {isArabic ? 'المدفوعات' : 'Payments'}
                            </CardTitle>
                          </CardHeader>
                          <CardContent>
                            {paymentsLoading ? (
                              <div className="flex justify-center py-8">
                                <Loader2 className="h-8 w-8 animate-spin text-emerald-500" />
                              </div>
                            ) : paymentsData?.data?.length ? (
                              <div className="overflow-x-auto">
                                <table className="w-full">
                                  <thead>
                                    <tr className="border-b border-slate-200">
                                      <th className="text-start p-3 text-sm font-semibold text-slate-700">{isArabic ? 'التاريخ' : 'Date'}</th>
                                      <th className="text-start p-3 text-sm font-semibold text-slate-700">{isArabic ? 'المبلغ' : 'Amount'}</th>
                                      <th className="text-start p-3 text-sm font-semibold text-slate-700">{isArabic ? 'طريقة الدفع' : 'Method'}</th>
                                      <th className="text-start p-3 text-sm font-semibold text-slate-700">{isArabic ? 'المرجع' : 'Reference'}</th>
                                    </tr>
                                  </thead>
                                  <tbody>
                                    {paymentsData.data.map((payment: any) => (
                                      <tr key={payment._id} className="border-b border-slate-100 hover:bg-slate-50">
                                        <td className="p-3 text-slate-700">
                                          {payment.paymentDate ? new Date(payment.paymentDate).toLocaleDateString('ar-SA') : '-'}
                                        </td>
                                        <td className="p-3 text-slate-700 font-medium" dir="ltr">
                                          {payment.amount?.toLocaleString('ar-SA')} {isArabic ? 'ر.س' : 'SAR'}
                                        </td>
                                        <td className="p-3 text-slate-700">{payment.paymentMethod || '-'}</td>
                                        <td className="p-3 text-slate-700">{payment.reference || '-'}</td>
                                      </tr>
                                    ))}
                                  </tbody>
                                </table>
                              </div>
                            ) : (
                              <p className="text-center py-8 text-slate-500">{isArabic ? 'لا توجد مدفوعات' : 'No payments found'}</p>
                            )}
                          </CardContent>
                        </Card>
                      </TabsContent>
                    </div>
                  </Tabs>
                </Card>
              </div>

              {/* SIDEBAR */}
              <ClientsSidebar context="clients" />
            </div>
          </>
        )}
      </Main>
    </>
  )
}
